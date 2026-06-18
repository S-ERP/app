-- FUNCTION: public.clonador(character varying, character varying, json)

-- DROP FUNCTION IF EXISTS public.clonador(character varying, character varying, json);

CREATE OR REPLACE FUNCTION public.clonador(
	_key_empresa_from   character varying,
	_key_empresa_to     character varying,
	_respuesta_empresa  json DEFAULT NULL::json)
    RETURNS json
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    v_tabla                 text;
    v_row                   RECORD;
    v_result                jsonb;
    v_reemplazos            jsonb;
    v_counts                jsonb := '{}';
    -- cuenta_contable
    v_old_cc_key            varchar;
    v_new_cc_key            varchar;
    v_new_cc_key_map        varchar;
    v_new_cc_mon_key        varchar;
    v_mapeo_cc              jsonb := '{}';
    n_cuenta_contable       integer := 0;
    n_ajuste_empresa        integer := 0;
    -- centro_costo_tipo
    v_old_cct_key           varchar;
    v_new_cct_key           varchar;
    n_centro_costo_tipo     integer := 0;
    -- centro_costo
    v_old_cco_key           varchar;
    v_new_cco_key           varchar;
    v_new_cct_key_map       varchar;
    v_new_cco_key_map       varchar;
    v_new_cco_parent_map    varchar;
    n_centro_costo          integer := 0;
    n_centro_costo_detalle  integer := 0;
    n_cuenta_centro_costo   integer := 0;
BEGIN
    -- Tablas simples: solo reemplazan key y key_empresa
    FOREACH v_tabla IN ARRAY ARRAY['enviroment', 'diario']
    LOOP
        SELECT public.clonar_tabla(v_tabla, 'key_empresa', _key_empresa_from,
            jsonb_build_object('key', NULL, 'key_empresa', _key_empresa_to))::jsonb
        INTO v_result;
        v_counts := v_counts || jsonb_build_object(v_tabla, v_result->'filas');
    END LOOP;

    -- ── cuenta_contable ──────────────────────────────────────
    DROP TABLE IF EXISTS tmp_cc_map;
    CREATE TEMP TABLE tmp_cc_map (old_key varchar, new_key varchar);

    FOR v_row IN
        SELECT key, key_moneda FROM cuenta_contable WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_cc_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_cc_map VALUES (v_row.key, v_new_cc_key);

        v_new_cc_mon_key := NULL;
        IF _respuesta_empresa IS NOT NULL THEN
            v_new_cc_mon_key := _respuesta_empresa->'mapeo'->'empresa_moneda'->>v_row.key_moneda;
        END IF;

        v_reemplazos := jsonb_build_object('key', v_new_cc_key, 'key_empresa', _key_empresa_to);
        IF v_new_cc_mon_key IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_moneda', v_new_cc_mon_key);
        END IF;

        PERFORM public.clonar_tabla('cuenta_contable', 'key', v_row.key, v_reemplazos);
        v_mapeo_cc := v_mapeo_cc || jsonb_build_object(v_row.key, v_new_cc_key);
        n_cuenta_contable := n_cuenta_contable + 1;
    END LOOP;

    -- ── ajuste_empresa (usa tmp_cc_map) ──────────────────────
    FOR v_row IN
        SELECT key, key_cuenta_contable FROM ajuste_empresa WHERE key_empresa = _key_empresa_from
    LOOP
        SELECT new_key INTO v_new_cc_key_map FROM tmp_cc_map WHERE old_key = v_row.key_cuenta_contable;

        v_reemplazos := jsonb_build_object('key', NULL, 'key_empresa', _key_empresa_to);
        IF v_new_cc_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_cuenta_contable', v_new_cc_key_map);
        END IF;

        PERFORM public.clonar_tabla('ajuste_empresa', 'key', v_row.key, v_reemplazos);
        n_ajuste_empresa := n_ajuste_empresa + 1;
    END LOOP;

    -- ── centro_costo_tipo ────────────────────────────────────
    DROP TABLE IF EXISTS tmp_cct_map;
    CREATE TEMP TABLE tmp_cct_map (old_key varchar, new_key varchar);

    FOR v_old_cct_key IN
        SELECT key FROM centro_costo_tipo WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_cct_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_cct_map VALUES (v_old_cct_key, v_new_cct_key);

        PERFORM public.clonar_tabla('centro_costo_tipo', 'key', v_old_cct_key,
            jsonb_build_object('key', v_new_cct_key, 'key_empresa', _key_empresa_to));
        n_centro_costo_tipo := n_centro_costo_tipo + 1;
    END LOOP;

    -- ── centro_costo (usa tmp_cct_map) ───────────────────────
    DROP TABLE IF EXISTS tmp_cco_map;
    CREATE TEMP TABLE tmp_cco_map (old_key varchar, new_key varchar);

    FOR v_row IN
        SELECT key, key_centro_costo_tipo FROM centro_costo WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_cco_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_cco_map VALUES (v_row.key, v_new_cco_key);

        SELECT new_key INTO v_new_cct_key_map FROM tmp_cct_map WHERE old_key = v_row.key_centro_costo_tipo;

        v_reemplazos := jsonb_build_object('key', v_new_cco_key, 'key_empresa', _key_empresa_to);
        IF v_new_cct_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_centro_costo_tipo', v_new_cct_key_map);
        END IF;

        PERFORM public.clonar_tabla('centro_costo', 'key', v_row.key, v_reemplazos);
        n_centro_costo := n_centro_costo + 1;
    END LOOP;

    -- ── centro_costo_detalle (usa tmp_cco_map para ambas FK) ─
    FOR v_row IN
        SELECT key, key_centro_costo, key_centro_costo_parent
        FROM centro_costo_detalle
        WHERE key_centro_costo IN (SELECT old_key FROM tmp_cco_map)
    LOOP
        SELECT new_key INTO v_new_cco_key_map    FROM tmp_cco_map WHERE old_key = v_row.key_centro_costo;
        SELECT new_key INTO v_new_cco_parent_map FROM tmp_cco_map WHERE old_key = v_row.key_centro_costo_parent;

        v_reemplazos := jsonb_build_object('key', NULL, 'key_centro_costo', v_new_cco_key_map);
        IF v_new_cco_parent_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_centro_costo_parent', v_new_cco_parent_map);
        END IF;

        PERFORM public.clonar_tabla('centro_costo_detalle', 'key', v_row.key, v_reemplazos);
        n_centro_costo_detalle := n_centro_costo_detalle + 1;
    END LOOP;

    -- ── cuenta_centro_costo (usa tmp_cco_map + tmp_cc_map) ───
    FOR v_row IN
        SELECT key, key_centro_costo, key_cuenta_contable
        FROM cuenta_centro_costo
        WHERE key_centro_costo IN (SELECT old_key FROM tmp_cco_map)
    LOOP
        SELECT new_key INTO v_new_cco_key_map FROM tmp_cco_map WHERE old_key = v_row.key_centro_costo;
        SELECT new_key INTO v_new_cc_key_map  FROM tmp_cc_map  WHERE old_key = v_row.key_cuenta_contable;

        v_reemplazos := jsonb_build_object('key', NULL, 'key_centro_costo', v_new_cco_key_map);
        IF v_new_cc_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_cuenta_contable', v_new_cc_key_map);
        END IF;

        PERFORM public.clonar_tabla('cuenta_centro_costo', 'key', v_row.key, v_reemplazos);
        n_cuenta_centro_costo := n_cuenta_centro_costo + 1;
    END LOOP;

    DROP TABLE IF EXISTS tmp_cc_map;
    DROP TABLE IF EXISTS tmp_cct_map;
    DROP TABLE IF EXISTS tmp_cco_map;

    v_counts := v_counts
        || jsonb_build_object('cuenta_contable',      n_cuenta_contable)
        || jsonb_build_object('ajuste_empresa',        n_ajuste_empresa)
        || jsonb_build_object('centro_costo_tipo',     n_centro_costo_tipo)
        || jsonb_build_object('centro_costo',          n_centro_costo)
        || jsonb_build_object('centro_costo_detalle',  n_centro_costo_detalle)
        || jsonb_build_object('cuenta_centro_costo',   n_cuenta_centro_costo);

    RETURN json_build_object(
        'status',   'ok',
        'mensaje',  'contabilidad de empresa "' || _key_empresa_from || '" clonada a "' || _key_empresa_to || '"',
        'clonados', v_counts,
        'mapeo',    json_build_object('cuenta_contable', v_mapeo_cc)
    );
END;
$BODY$;

ALTER FUNCTION public.clonador(character varying, character varying, json)
    OWNER TO postgres;

