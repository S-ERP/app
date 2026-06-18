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
-- Clonador de CRM
--
-- Cadena de dependencias:
--   tipo_cliente  → tmp_tc_map
--   cliente       → tmp_cli_map  (mapeo retornado para uso cross-módulo)
--     └── cliente_tipo_cliente  (tmp_cli_map + tmp_tc_map)
-- ============================================================
CREATE OR REPLACE FUNCTION public.clonador(
    _key_empresa_from character varying,
    _key_empresa_to   character varying
)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_row                  RECORD;
    v_reemplazos           jsonb;
    v_counts               jsonb := '{}';
    v_mapeo_cli            jsonb := '{}';
    -- tipo_cliente
    v_old_tc_key           varchar;
    v_new_tc_key           varchar;
    v_new_tc_key_map       varchar;
    n_tipo_cliente         integer := 0;
    -- cliente
    v_old_cli_key          varchar;
    v_new_cli_key          varchar;
    v_new_cli_key_map      varchar;
    n_cliente              integer := 0;
    -- cliente_tipo_cliente
    n_cliente_tipo_cliente integer := 0;
BEGIN
    -- ── tipo_cliente → tmp_tc_map ─────────────────────────────
    DROP TABLE IF EXISTS tmp_tc_map;
    CREATE TEMP TABLE tmp_tc_map (old_key varchar, new_key varchar);

    FOR v_old_tc_key IN
        SELECT key FROM tipo_cliente WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_tc_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_tc_map VALUES (v_old_tc_key, v_new_tc_key);

        PERFORM public.clonar_tabla('tipo_cliente', 'key', v_old_tc_key,
            jsonb_build_object('key', v_new_tc_key, 'key_empresa', _key_empresa_to));
        n_tipo_cliente := n_tipo_cliente + 1;
    END LOOP;

    -- ── cliente → tmp_cli_map ─────────────────────────────────
    DROP TABLE IF EXISTS tmp_cli_map;
    CREATE TEMP TABLE tmp_cli_map (old_key varchar, new_key varchar);

    FOR v_old_cli_key IN
        SELECT key FROM cliente WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_cli_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_cli_map VALUES (v_old_cli_key, v_new_cli_key);

        PERFORM public.clonar_tabla('cliente', 'key', v_old_cli_key,
            jsonb_build_object('key', v_new_cli_key, 'key_empresa', _key_empresa_to));

        v_mapeo_cli := v_mapeo_cli || jsonb_build_object(v_old_cli_key, v_new_cli_key);
        n_cliente := n_cliente + 1;
    END LOOP;

    -- ── cliente_tipo_cliente (tmp_cli_map + tmp_tc_map) ───────
    FOR v_row IN
        SELECT key, key_cliente, key_tipo_cliente
        FROM cliente_tipo_cliente
        WHERE key_cliente IN (SELECT old_key FROM tmp_cli_map)
    LOOP
        SELECT new_key INTO v_new_cli_key_map FROM tmp_cli_map WHERE old_key = v_row.key_cliente;
        SELECT new_key INTO v_new_tc_key_map  FROM tmp_tc_map  WHERE old_key = v_row.key_tipo_cliente;

        v_reemplazos := jsonb_build_object('key', NULL, 'key_cliente', v_new_cli_key_map);
        IF v_new_tc_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_tipo_cliente', v_new_tc_key_map);
        END IF;

        PERFORM public.clonar_tabla('cliente_tipo_cliente', 'key', v_row.key, v_reemplazos);
        n_cliente_tipo_cliente := n_cliente_tipo_cliente + 1;
    END LOOP;

    DROP TABLE IF EXISTS tmp_tc_map;
    DROP TABLE IF EXISTS tmp_cli_map;

    v_counts := v_counts
        || jsonb_build_object('tipo_cliente',         n_tipo_cliente)
        || jsonb_build_object('cliente',              n_cliente)
        || jsonb_build_object('cliente_tipo_cliente', n_cliente_tipo_cliente);

    RETURN json_build_object(
        'status',   'ok',
        'mensaje',  'CRM de empresa "' || _key_empresa_from || '" clonado a "' || _key_empresa_to || '"',
        'clonados', v_counts,
        'mapeo',    json_build_object('cliente', v_mapeo_cli)
    );
END;
$function$;


-- select * from clonador('key_empresa_from', 'key_empresa_to');
