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
-- Clonador de SERP
--
-- Cadena de dependencias:
--   habilidad     → tmp_hab_map
--     └── habilidad_usuario  (tmp_hab_map para key_habilidad)
--
--   nota (auto-referencia key_nota → nota)
--     Paso 1: clonar todas las notas — key_nota copia valor viejo temporalmente
--     Paso 2: UPDATE para corregir key_nota con el mapeo → tmp_nota_map
--     └── nota_usuario  (tmp_nota_map para key_nota)
--
--   pizarra       → tmp_piz_map
--     └── pizarra_usuario  (tmp_piz_map para key_pizarra)
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
    v_result               jsonb;
    v_reemplazos           jsonb;
    v_counts               jsonb := '{}';
    -- habilidad
    v_old_hab_key          varchar;
    v_new_hab_key          varchar;
    v_new_hab_key_map      varchar;
    n_habilidad            integer := 0;
    n_habilidad_usuario    integer := 0;
    -- nota
    v_old_nota_key         varchar;
    v_new_nota_key         varchar;
    v_new_nota_key_map     varchar;
    n_nota                 integer := 0;
    n_nota_usuario         integer := 0;
    -- pizarra
    v_old_piz_key          varchar;
    v_new_piz_key          varchar;
    v_new_piz_key_map      varchar;
    n_pizarra              integer := 0;
    n_pizarra_usuario      integer := 0;
BEGIN
    -- ── habilidad → tmp_hab_map ───────────────────────────────
    DROP TABLE IF EXISTS tmp_hab_map;
    CREATE TEMP TABLE tmp_hab_map (old_key varchar, new_key varchar);

    FOR v_old_hab_key IN
        SELECT key FROM habilidad WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_hab_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_hab_map VALUES (v_old_hab_key, v_new_hab_key);

        PERFORM public.clonar_tabla('habilidad', 'key', v_old_hab_key,
            jsonb_build_object('key', v_new_hab_key, 'key_empresa', _key_empresa_to));
        n_habilidad := n_habilidad + 1;
    END LOOP;

    -- ── habilidad_usuario (tmp_hab_map) ───────────────────────
    FOR v_row IN
        SELECT key, key_habilidad
        FROM habilidad_usuario
        WHERE key_habilidad IN (SELECT old_key FROM tmp_hab_map)
    LOOP
        SELECT new_key INTO v_new_hab_key_map FROM tmp_hab_map WHERE old_key = v_row.key_habilidad;

        PERFORM public.clonar_tabla('habilidad_usuario', 'key', v_row.key,
            jsonb_build_object('key', NULL, 'key_habilidad', v_new_hab_key_map));
        n_habilidad_usuario := n_habilidad_usuario + 1;
    END LOOP;

    -- ── nota → tmp_nota_map ───────────────────────────────────
    -- Paso 1: clonar todas las notas de la empresa
    -- key_nota se copia tal cual (apunta a claves viejas temporalmente)
    -- La FK tiene NOT VALID, así que no bloquea la inserción
    DROP TABLE IF EXISTS tmp_nota_map;
    CREATE TEMP TABLE tmp_nota_map (old_key varchar, new_key varchar);

    FOR v_old_nota_key IN
        SELECT key FROM nota WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_nota_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_nota_map VALUES (v_old_nota_key, v_new_nota_key);

        PERFORM public.clonar_tabla('nota', 'key', v_old_nota_key,
            jsonb_build_object('key', v_new_nota_key, 'key_empresa', _key_empresa_to));
        n_nota := n_nota + 1;
    END LOOP;

    -- Paso 2: corregir key_nota con el mapeo old → new
    UPDATE nota
    SET key_nota = (SELECT new_key FROM tmp_nota_map WHERE old_key = nota.key_nota)
    WHERE key IN (SELECT new_key FROM tmp_nota_map)
      AND key_nota IS NOT NULL;

    -- ── nota_usuario (tmp_nota_map) ───────────────────────────
    FOR v_row IN
        SELECT key, key_nota
        FROM nota_usuario
        WHERE key_nota IN (SELECT old_key FROM tmp_nota_map)
    LOOP
        SELECT new_key INTO v_new_nota_key_map FROM tmp_nota_map WHERE old_key = v_row.key_nota;

        PERFORM public.clonar_tabla('nota_usuario', 'key', v_row.key,
            jsonb_build_object('key', NULL, 'key_nota', v_new_nota_key_map));
        n_nota_usuario := n_nota_usuario + 1;
    END LOOP;

    -- ── pizarra → tmp_piz_map ─────────────────────────────────
    DROP TABLE IF EXISTS tmp_piz_map;
    CREATE TEMP TABLE tmp_piz_map (old_key varchar, new_key varchar);

    FOR v_old_piz_key IN
        SELECT key FROM pizarra WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_piz_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_piz_map VALUES (v_old_piz_key, v_new_piz_key);

        PERFORM public.clonar_tabla('pizarra', 'key', v_old_piz_key,
            jsonb_build_object('key', v_new_piz_key, 'key_empresa', _key_empresa_to));
        n_pizarra := n_pizarra + 1;
    END LOOP;

    -- ── pizarra_usuario (tmp_piz_map) ─────────────────────────
    FOR v_row IN
        SELECT key, key_pizarra
        FROM pizarra_usuario
        WHERE key_pizarra IN (SELECT old_key FROM tmp_piz_map)
    LOOP
        SELECT new_key INTO v_new_piz_key_map FROM tmp_piz_map WHERE old_key = v_row.key_pizarra;

        PERFORM public.clonar_tabla('pizarra_usuario', 'key', v_row.key,
            jsonb_build_object('key', NULL, 'key_pizarra', v_new_piz_key_map));
        n_pizarra_usuario := n_pizarra_usuario + 1;
    END LOOP;

    DROP TABLE IF EXISTS tmp_hab_map;
    DROP TABLE IF EXISTS tmp_nota_map;
    DROP TABLE IF EXISTS tmp_piz_map;

    RETURN json_build_object(
        'status',   'ok',
        'mensaje',  'SERP de empresa "' || _key_empresa_from || '" clonado a "' || _key_empresa_to || '"',
        'clonados', jsonb_build_object(
            'habilidad',         n_habilidad,
            'habilidad_usuario', n_habilidad_usuario,
            'nota',              n_nota,
            'nota_usuario',      n_nota_usuario,
            'pizarra',           n_pizarra,
            'pizarra_usuario',   n_pizarra_usuario
        )
    );
END;
$function$;


-- select * from clonador('key_empresa_from', 'key_empresa_to');
