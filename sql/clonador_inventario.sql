
-- ============================================================
-- Función genérica reutilizable en esta base de datos
-- ============================================================
CREATE OR REPLACE FUNCTION public.clonar_tabla(
    _tabla      varchar,
    _where_col  varchar,
    _where_val  varchar,
    _reemplazos jsonb
)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_cols     text;
    v_vals     text;
    s_consulta text;
    n_rows     integer;
BEGIN
    SELECT
        string_agg('"' || column_name || '"', ', ' ORDER BY ordinal_position),
        string_agg(
            CASE
                WHEN _reemplazos ? column_name THEN
                    CASE
                        WHEN jsonb_typeof(_reemplazos->column_name) = 'null'
                            THEN 'md5(random()::text || clock_timestamp()::text)'
                        ELSE '''' || replace(_reemplazos->>column_name, '''', '''''') || ''''
                    END
                ELSE '"' || column_name || '"'
            END,
            ', ' ORDER BY ordinal_position
        )
    INTO v_cols, v_vals
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = _tabla;

    IF v_cols IS NULL THEN
        RETURN json_build_object('status', 'error', 'mensaje', 'tabla "' || _tabla || '" no existe');
    END IF;

    s_consulta := 'INSERT INTO ' || _tabla || ' (' || v_cols || ') '
               || 'SELECT ' || v_vals || ' FROM ' || _tabla
               || ' WHERE "' || _where_col || '" = $1';

    EXECUTE s_consulta USING _where_val;
    GET DIAGNOSTICS n_rows = ROW_COUNT;

    RETURN json_build_object('status', 'ok', 'tabla', _tabla, 'filas', n_rows);
END;
$function$;


-- ============================================================
-- Clonador de inventario
--
-- Cadena de dependencias:
--   tipo_costo                         → batch simple
--   marca        → tmp_marc_map  (modelo.key_marca depende de esto)
--   almacen  → fila a fila (key_sucursal mapeado via _respuesta_empresa)
--   ingrediente  → tmp_ing_map
--   tag          → tmp_tag_map
--   tipo_producto → tmp_tp_map
--     └── modelo (filtrado por tmp_tp_map) → tmp_mod_map
--           ├── modelo_ingrediente  (tmp_mod_map + tmp_ing_map)
--           ├── modelo_tag          (tmp_mod_map + tmp_tag_map)
--           └── modelo_cliente      (tmp_mod_map + _respuesta_crm + _respuesta_contabilidad)
--
-- Nota: key_cuenta_contable_* en tipo_producto son refs cross-módulo
-- (contabilidad) y se copian tal cual.
-- ============================================================
CREATE OR REPLACE FUNCTION public.clonador(
    _key_empresa_from  character varying,
    _key_empresa_to    character varying,
    _respuesta_empresa       json DEFAULT NULL,  -- respuesta de clonador_empresa() para mapear key_sucursal
    _respuesta_crm           json DEFAULT NULL,  -- respuesta de clonador_crm() para mapear key_cliente
    _respuesta_contabilidad  json DEFAULT NULL   -- respuesta de clonador_contabilidad() para mapear key_cuenta_contable
)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_tabla              text;
    v_row                RECORD;
    v_result             jsonb;
    v_reemplazos         jsonb;
    v_counts             jsonb := '{}';
    -- almacen
    v_new_suc_key_map    varchar;
    n_almacen            integer := 0;
    -- marca
    v_old_marc_key       varchar;
    v_new_marc_key       varchar;
    v_new_marc_key_map   varchar;
    n_marca              integer := 0;
    -- ingrediente
    v_old_ing_key        varchar;
    v_new_ing_key        varchar;
    v_new_ing_key_map    varchar;
    n_ingrediente        integer := 0;
    -- tag
    v_old_tag_key        varchar;
    v_new_tag_key        varchar;
    v_new_tag_key_map    varchar;
    n_tag                integer := 0;
    -- tipo_producto
    v_old_tp_key         varchar;
    v_new_tp_key         varchar;
    n_tipo_producto      integer := 0;
    -- modelo
    v_new_tp_key_map     varchar;
    v_new_mod_key        varchar;
    v_new_pvm_key        varchar;  -- precio_venta_moneda
    v_new_pcm_key        varchar;  -- precio_compra_moneda
    n_modelo             integer := 0;
    -- modelo_ingrediente / modelo_tag
    v_new_mod_key_map    varchar;
    n_modelo_ingrediente integer := 0;
    n_modelo_tag         integer := 0;
    -- modelo_cliente
    v_new_cli_key_map    varchar;
    v_new_cc_inv_key_map varchar;
    n_modelo_cliente     integer := 0;
BEGIN
    -- ── Tablas simples (batch) ────────────────────────────────
    FOREACH v_tabla IN ARRAY ARRAY['tipo_costo']
    LOOP
        SELECT public.clonar_tabla(v_tabla, 'key_empresa', _key_empresa_from,
            jsonb_build_object('key', NULL, 'key_empresa', _key_empresa_to))::jsonb
        INTO v_result;
        v_counts := v_counts || jsonb_build_object(v_tabla, v_result->'filas');
    END LOOP;

    -- ── marca → tmp_marc_map ──────────────────────────────────
    -- modelo.key_marca referencia marca, debe apuntar a las nuevas
    DROP TABLE IF EXISTS tmp_marc_map;
    CREATE TEMP TABLE tmp_marc_map (old_key varchar, new_key varchar);

    FOR v_old_marc_key IN
        SELECT key FROM marca WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_marc_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_marc_map VALUES (v_old_marc_key, v_new_marc_key);

        PERFORM public.clonar_tabla('marca', 'key', v_old_marc_key,
            jsonb_build_object('key', v_new_marc_key, 'key_empresa', _key_empresa_to));
        n_marca := n_marca + 1;
    END LOOP;

    -- ── almacen: fila a fila para mapear key_sucursal ─────────
    FOR v_row IN
        SELECT key, key_sucursal FROM almacen WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_suc_key_map := NULL;
        IF _respuesta_empresa IS NOT NULL THEN
            v_new_suc_key_map := _respuesta_empresa->'mapeo'->'sucursal'->>v_row.key_sucursal;
        END IF;

        v_reemplazos := jsonb_build_object('key', NULL, 'key_empresa', _key_empresa_to);
        IF v_new_suc_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_sucursal', v_new_suc_key_map);
        END IF;

        PERFORM public.clonar_tabla('almacen', 'key', v_row.key, v_reemplazos);
        n_almacen := n_almacen + 1;
    END LOOP;

    -- ── ingrediente → tmp_ing_map ─────────────────────────────
    DROP TABLE IF EXISTS tmp_ing_map;
    CREATE TEMP TABLE tmp_ing_map (old_key varchar, new_key varchar);

    FOR v_old_ing_key IN
        SELECT key FROM ingrediente WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_ing_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_ing_map VALUES (v_old_ing_key, v_new_ing_key);

        PERFORM public.clonar_tabla('ingrediente', 'key', v_old_ing_key,
            jsonb_build_object('key', v_new_ing_key, 'key_empresa', _key_empresa_to));
        n_ingrediente := n_ingrediente + 1;
    END LOOP;

    -- ── tag → tmp_tag_map ─────────────────────────────────────
    DROP TABLE IF EXISTS tmp_tag_map;
    CREATE TEMP TABLE tmp_tag_map (old_key varchar, new_key varchar);

    FOR v_old_tag_key IN
        SELECT key FROM tag WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_tag_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_tag_map VALUES (v_old_tag_key, v_new_tag_key);

        PERFORM public.clonar_tabla('tag', 'key', v_old_tag_key,
            jsonb_build_object('key', v_new_tag_key, 'key_empresa', _key_empresa_to));
        n_tag := n_tag + 1;
    END LOOP;

    -- ── tipo_producto → tmp_tp_map ────────────────────────────
    -- key_cuenta_contable_* son refs cross-módulo (contabilidad) y se copian tal cual
    DROP TABLE IF EXISTS tmp_tp_map;
    CREATE TEMP TABLE tmp_tp_map (old_key varchar, new_key varchar);

    FOR v_old_tp_key IN
        SELECT key FROM tipo_producto WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_tp_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_tp_map VALUES (v_old_tp_key, v_new_tp_key);

        PERFORM public.clonar_tabla('tipo_producto', 'key', v_old_tp_key,
            jsonb_build_object('key', v_new_tp_key, 'key_empresa', _key_empresa_to));
        n_tipo_producto := n_tipo_producto + 1;
    END LOOP;

    -- ── modelo (filtrado via tmp_tp_map) → tmp_mod_map ────────
    -- modelo no tiene key_empresa; se accede por key_tipo_producto
    DROP TABLE IF EXISTS tmp_mod_map;
    CREATE TEMP TABLE tmp_mod_map (old_key varchar, new_key varchar);

    FOR v_row IN
        SELECT key, key_tipo_producto, key_marca, precio_venta_moneda, precio_compra_moneda
        FROM modelo
        WHERE key_tipo_producto IN (SELECT old_key FROM tmp_tp_map)
    LOOP
        v_new_mod_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_mod_map VALUES (v_row.key, v_new_mod_key);

        SELECT new_key INTO v_new_tp_key_map  FROM tmp_tp_map   WHERE old_key = v_row.key_tipo_producto;
        SELECT new_key INTO v_new_marc_key_map FROM tmp_marc_map WHERE old_key = v_row.key_marca;

        v_reemplazos := jsonb_build_object('key', v_new_mod_key, 'key_tipo_producto', v_new_tp_key_map);
        IF v_new_marc_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_marca', v_new_marc_key_map);
        END IF;

        -- Mapear precio_venta_moneda y precio_compra_moneda desde empresa_moneda
        v_new_pvm_key := NULL;
        v_new_pcm_key := NULL;
        IF _respuesta_empresa IS NOT NULL THEN
            v_new_pvm_key := _respuesta_empresa->'mapeo'->'empresa_moneda'->>v_row.precio_venta_moneda;
            v_new_pcm_key := _respuesta_empresa->'mapeo'->'empresa_moneda'->>v_row.precio_compra_moneda;
        END IF;
        IF v_new_pvm_key IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('precio_venta_moneda', v_new_pvm_key);
        END IF;
        IF v_new_pcm_key IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('precio_compra_moneda', v_new_pcm_key);
        END IF;

        PERFORM public.clonar_tabla('modelo', 'key', v_row.key, v_reemplazos);
        n_modelo := n_modelo + 1;
    END LOOP;

    -- ── modelo_ingrediente (tmp_mod_map + tmp_ing_map) ────────
    FOR v_row IN
        SELECT key, key_modelo, key_ingrediente
        FROM modelo_ingrediente
        WHERE key_modelo IN (SELECT old_key FROM tmp_mod_map)
    LOOP
        SELECT new_key INTO v_new_mod_key_map FROM tmp_mod_map WHERE old_key = v_row.key_modelo;
        SELECT new_key INTO v_new_ing_key_map FROM tmp_ing_map WHERE old_key = v_row.key_ingrediente;

        v_reemplazos := jsonb_build_object('key', NULL, 'key_modelo', v_new_mod_key_map);
        IF v_new_ing_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_ingrediente', v_new_ing_key_map);
        END IF;

        PERFORM public.clonar_tabla('modelo_ingrediente', 'key', v_row.key, v_reemplazos);
        n_modelo_ingrediente := n_modelo_ingrediente + 1;
    END LOOP;

    -- ── modelo_tag (tmp_mod_map + tmp_tag_map) ────────────────
    FOR v_row IN
        SELECT key, key_modelo, key_tag
        FROM modelo_tag
        WHERE key_modelo IN (SELECT old_key FROM tmp_mod_map)
    LOOP
        SELECT new_key INTO v_new_mod_key_map FROM tmp_mod_map WHERE old_key = v_row.key_modelo;
        SELECT new_key INTO v_new_tag_key_map FROM tmp_tag_map WHERE old_key = v_row.key_tag;

        v_reemplazos := jsonb_build_object('key', NULL, 'key_modelo', v_new_mod_key_map);
        IF v_new_tag_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_tag', v_new_tag_key_map);
        END IF;

        PERFORM public.clonar_tabla('modelo_tag', 'key', v_row.key, v_reemplazos);
        n_modelo_tag := n_modelo_tag + 1;
    END LOOP;

    -- ── modelo_cliente (tmp_mod_map + crm + contabilidad) ─────
    FOR v_row IN
        SELECT key, key_modelo, key_cliente, key_cuenta_contable
        FROM modelo_cliente
        WHERE key_modelo IN (SELECT old_key FROM tmp_mod_map)
    LOOP
        SELECT new_key INTO v_new_mod_key_map FROM tmp_mod_map WHERE old_key = v_row.key_modelo;

        v_new_cli_key_map := NULL;
        IF _respuesta_crm IS NOT NULL THEN
            v_new_cli_key_map := _respuesta_crm->'mapeo'->'cliente'->>v_row.key_cliente;
        END IF;

        v_new_cc_inv_key_map := NULL;
        IF _respuesta_contabilidad IS NOT NULL THEN
            v_new_cc_inv_key_map := _respuesta_contabilidad->'mapeo'->'cuenta_contable'->>v_row.key_cuenta_contable;
        END IF;

        v_reemplazos := jsonb_build_object('key', NULL, 'key_modelo', v_new_mod_key_map);
        IF v_new_cli_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_cliente', v_new_cli_key_map);
        END IF;
        IF v_new_cc_inv_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_cuenta_contable', v_new_cc_inv_key_map);
        END IF;

        PERFORM public.clonar_tabla('modelo_cliente', 'key', v_row.key, v_reemplazos);
        n_modelo_cliente := n_modelo_cliente + 1;
    END LOOP;

    DROP TABLE IF EXISTS tmp_marc_map;
    DROP TABLE IF EXISTS tmp_ing_map;
    DROP TABLE IF EXISTS tmp_tag_map;
    DROP TABLE IF EXISTS tmp_tp_map;
    DROP TABLE IF EXISTS tmp_mod_map;

    v_counts := v_counts
        || jsonb_build_object('marca',              n_marca)
        || jsonb_build_object('almacen',            n_almacen)
        || jsonb_build_object('ingrediente',        n_ingrediente)
        || jsonb_build_object('tag',                n_tag)
        || jsonb_build_object('tipo_producto',      n_tipo_producto)
        || jsonb_build_object('modelo',             n_modelo)
        || jsonb_build_object('modelo_ingrediente', n_modelo_ingrediente)
        || jsonb_build_object('modelo_tag',         n_modelo_tag)
        || jsonb_build_object('modelo_cliente',     n_modelo_cliente);

    RETURN json_build_object(
        'status',   'ok',
        'mensaje',  'inventario de empresa "' || _key_empresa_from || '" clonado a "' || _key_empresa_to || '"',
        'clonados', v_counts
    );
END;
$function$;


-- select * from clonador('key_empresa_from', 'key_empresa_to');
