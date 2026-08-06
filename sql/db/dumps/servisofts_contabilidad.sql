--
-- PostgreSQL database dump
--

\restrict TjZb7gif53GS6l2Pv0Ug0V8jmipsjGhH5p52S9DbCIHUP38976d7bbbyOr02vAU

-- Dumped from database version 13.20 (Debian 13.20-1.pgdg120+1)
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: asiento_get_max_fecha(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.asiento_get_max_fecha(_key_gestion character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'select max(asiento_contable.fecha) as fecha
				from gestion,
				asiento_contable
				where gestion.key = \''||_key_gestion||E'\'
				and asiento_contable.key_gestion = gestion.key
				and asiento_contable.estado > 0
				and gestion.estado > 0';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.asiento_get_max_fecha(_key_gestion character varying) OWNER TO postgres;

--
-- Name: asiento_get_next_code(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.asiento_get_next_code(_key_gestion character varying, _tipo character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'select UPPER(SUBSTR(\''||_tipo||E'\', 1, 1))||\'-\'||
				to_char(gestion.fecha,\'yyyy-mm\')||\'-\'||count(asiento_contable.key)+1 as codigo
				from gestion,
				asiento_contable
				where gestion.key = \''||_key_gestion||E'\'
				and asiento_contable.key_gestion = gestion.key
				and asiento_contable.tipo = \''||_tipo||E'\'
				and asiento_contable.estado > 0
				and gestion.estado > 0 group by gestion.fecha';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.asiento_get_next_code(_key_gestion character varying, _tipo character varying) OWNER TO postgres;

--
-- Name: asiento_get_next_code(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.asiento_get_next_code(_key_gestion character varying, _tipo character varying, _key_diario character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'select UPPER(SUBSTR(\''||_tipo||E'\', 1, 1))||\'-\'||
				to_char(gestion.fecha,\'yyyy-mm\')||\'-\'||count(asiento_contable.key)+1 as codigo
				from gestion,
				asiento_contable
				where gestion.key = \''||_key_gestion||E'\'
				and asiento_contable.key_gestion = gestion.key
				and asiento_contable.tipo = \''||_tipo||E'\'
				AND (
				    (asiento_contable.key_diario = \''||_key_diario||E'\') 
				    OR 
				    (\''||_key_diario||E'\' = \'\' AND asiento_contable.key_diario IS NULL)
				)
				and asiento_contable.estado > 0
				and gestion.estado > 0 group by gestion.fecha';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.asiento_get_next_code(_key_gestion character varying, _tipo character varying, _key_diario character varying) OWNER TO postgres;

--
-- Name: calcular_ajuste_por_cuenta(text, text, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calcular_ajuste_por_cuenta(key_empresa text, codigo_cuenta text, tipo_cambio numeric) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    total_debe NUMERIC := 0;
    total_haber NUMERIC := 0;
    total_debe_me NUMERIC := 0;
    total_haber_me NUMERIC := 0;
    saldo_local NUMERIC := 0;
    saldo_me NUMERIC := 0;
    saldo_me_en_local NUMERIC := 0;
    ajuste_diferencia_cambio NUMERIC := 0;
BEGIN
    SELECT
        COALESCE(SUM(acd.debe), 0),
        COALESCE(SUM(acd.haber), 0),
        COALESCE(SUM(acd.debe_me), 0),
        COALESCE(SUM(acd.haber_me), 0)
    INTO
        total_debe,
        total_haber,
        total_debe_me,
        total_haber_me
    FROM asiento_contable_detalle acd
    JOIN asiento_contable ac ON acd.key_asiento_contable = ac.key
    JOIN gestion g ON ac.key_gestion = g.key
    JOIN cuenta_contable cc ON acd.key_cuenta_contable = cc.key
    WHERE g.key_empresa = calcular_ajuste_por_cuenta.key_empresa
      AND cc.codigo = calcular_ajuste_por_cuenta.codigo_cuenta
      AND g.estado > 0
      AND ac.estado > 0
      AND acd.estado > 0;

    saldo_local := total_debe - total_haber;
    saldo_me := total_debe_me - total_haber_me;
    saldo_me_en_local := saldo_me * tipo_cambio;
    ajuste_diferencia_cambio := saldo_me_en_local-saldo_local;

    RETURN ajuste_diferencia_cambio;
END;
$$;


ALTER FUNCTION public.calcular_ajuste_por_cuenta(key_empresa text, codigo_cuenta text, tipo_cambio numeric) OWNER TO postgres;

--
-- Name: clonador(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clonador(_key_empresa_from character varying, _key_empresa_to character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
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

    FOR v_old_cc_key IN
        SELECT key FROM cuenta_contable WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_cc_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_cc_map VALUES (v_old_cc_key, v_new_cc_key);

        PERFORM public.clonar_tabla('cuenta_contable', 'key', v_old_cc_key,
            jsonb_build_object('key', v_new_cc_key, 'key_empresa', _key_empresa_to));
        v_mapeo_cc := v_mapeo_cc || jsonb_build_object(v_old_cc_key, v_new_cc_key);
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
$$;


ALTER FUNCTION public.clonador(_key_empresa_from character varying, _key_empresa_to character varying) OWNER TO postgres;

--
-- Name: clonador(character varying, character varying, json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clonador(_key_empresa_from character varying, _key_empresa_to character varying, _respuesta_empresa json DEFAULT NULL::json) RETURNS json
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.clonador(_key_empresa_from character varying, _key_empresa_to character varying, _respuesta_empresa json) OWNER TO postgres;

--
-- Name: clonar_tabla(character varying, character varying, character varying, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clonar_tabla(_tabla character varying, _where_col character varying, _where_val character varying, _reemplazos jsonb) RETURNS json
    LANGUAGE plpgsql
    AS $_$
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
$_$;


ALTER FUNCTION public.clonar_tabla(_tabla character varying, _where_col character varying, _where_val character varying, _reemplazos jsonb) OWNER TO postgres;

--
-- Name: desc_tabla(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.desc_tabla(_nombre_tabla character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN
    s_consulta :=format(' SELECT
                array_to_json(array_agg(sq.*))
				FROM (
                    SELECT
                        column_name, data_type
					FROM information_schema.columns
					WHERE  table_name = %L
				) sq
					',_nombre_tabla);
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.desc_tabla(_nombre_tabla character varying) OWNER TO postgres;

--
-- Name: exportar_excel_asientos_by_key_gestion(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.exportar_excel_asientos_by_key_gestion(_key_gestion character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta character varying;
    s_consulta character varying;
BEGIN

s_consulta :=E' SELECT
					array_to_json(array_agg(sq.*)) as json
				FROM (
					SELECT 
					TO_CHAR(gestion.fecha, \'YYYY-MM\') as gestion,
					cuenta_contable.codigo as numero_cuenta,
					cuenta_contable.descripcion as descripcion_cuenta,
					asiento_contable.tipo as tipo,
					asiento_contable.descripcion,
					asiento_contable.observacion,
					asiento_contable.codigo as codigo,
					asiento_contable_detalle.debe,
					asiento_contable_detalle.haber,
					\'TODO\' as moneda,
					asiento_contable_detalle.descripcion as glosa,
					asiento_contable.fecha  as fecha_contable,
					TO_CHAR(asiento_contable_detalle.fecha_on,\'YYYY-MM-DD hh:mm\') as fecha_registro
				FROM asiento_contable 
				JOIN gestion ON gestion.key = asiento_contable.key_gestion
				JOIN asiento_contable_detalle ON asiento_contable_detalle.key_asiento_contable = asiento_contable.key
				LEFT JOIN cuenta_contable ON cuenta_contable.key = asiento_contable_detalle.key_cuenta_contable
				WHERE asiento_contable.key_gestion like \''||_key_gestion||E'\'
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.exportar_excel_asientos_by_key_gestion(_key_gestion character varying) OWNER TO postgres;

--
-- Name: gestion_max(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.gestion_max(_key_empresa character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT
                to_json(sq.*)::json as json 
				FROM (
					SELECT gestion.*
					FROM gestion
					WHERE gestion.key_empresa = \''||_key_empresa||E'\'
					and gestion.estado > 0
					and gestion.fecha = (
						SELECT max(gestion.fecha)
						FROM gestion
						WHERE gestion.key_empresa = \''||_key_empresa||E'\'
						and gestion.estado > 0
					)
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.gestion_max(_key_empresa character varying) OWNER TO postgres;

--
-- Name: get_ajuste(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_ajuste(_key_empresa character varying, _key_ajuste character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT
                to_json(sq.*)::json as json 
				FROM (
                    SELECT cuenta_contable.*
					FROM ajuste_empresa,
					cuenta_contable
					WHERE ajuste_empresa.key_empresa = \''||_key_empresa||E'\'
					AND ajuste_empresa.key_ajuste = \''||_key_ajuste||E'\'
					and ajuste_empresa.key_cuenta_contable = cuenta_contable.key
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_ajuste(_key_empresa character varying, _key_ajuste character varying) OWNER TO postgres;

--
-- Name: get_all(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all(_nombre_tabla character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT
                jsonb_object_agg(sq.key, to_json(sq.*))::json as json 
				FROM (
                    SELECT '||_nombre_tabla||E'.*
					FROM '||_nombre_tabla||E'
					WHERE '||_nombre_tabla||E'.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all(_nombre_tabla character varying) OWNER TO postgres;

--
-- Name: get_all(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all(_nombre_tabla character varying, _key character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'  SELECT
                jsonb_object_agg(sq.key, to_json(sq.*))::json as json 
				FROM (
                    SELECT * 
					FROM '||_nombre_tabla||E'
					WHERE key = \''||_key||E'\'
					AND estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all(_nombre_tabla character varying, _key character varying) OWNER TO postgres;

--
-- Name: get_all(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all(_nombre_tabla character varying, _key_valor character varying, _data_valor character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT
                jsonb_object_agg(sq.key, to_json(sq.*))::json as json 
				FROM (
                    SELECT '||_nombre_tabla||E'.*
					FROM '||_nombre_tabla||E'
					WHERE '||_nombre_tabla||E'.estado > 0
					AND '||_nombre_tabla||E'.'||_key_valor||E' = \''||_data_valor||E'\'
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all(_nombre_tabla character varying, _key_valor character varying, _data_valor character varying) OWNER TO postgres;

--
-- Name: get_all(character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all(_nombre_tabla character varying, _key_valor character varying, _data_valor character varying, _id character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT
                jsonb_object_agg(sq.'||_id||E', to_json(sq.*))::json as json 
				FROM (
                    SELECT '||_nombre_tabla||E'.*
					FROM '||_nombre_tabla||E'
					WHERE '||_nombre_tabla||E'.estado > 0
					AND '||_nombre_tabla||E'.'||_key_valor||E' = \''||_data_valor||E'\'
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all(_nombre_tabla character varying, _key_valor character varying, _data_valor character varying, _id character varying) OWNER TO postgres;

--
-- Name: get_all_con_cero(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_con_cero(_nombre_tabla character varying, _key_valor character varying, _data_valor character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT
                jsonb_object_agg(sq.key, to_json(sq.*))::json as json 
				FROM (
                    SELECT '||_nombre_tabla||E'.*
					FROM '||_nombre_tabla||E'
					WHERE '||_nombre_tabla||E'.'||_key_valor||E' = \''||_data_valor||E'\'
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_con_cero(_nombre_tabla character varying, _key_valor character varying, _data_valor character varying) OWNER TO postgres;

--
-- Name: get_asiento(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_asiento(_key character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT
                to_json(sq.*)::json as json 
				FROM (
                    SELECT asiento_contable.key,
					asiento_contable.codigo,
					asiento_contable.fecha_on,
					asiento_contable.descripcion,
					asiento_contable.observacion,
					asiento_contable.tipo,
					asiento_contable.fecha,
					asiento_contable.key_gestion,
					to_json(gestion.*) as gestion,
					sum(asiento_contable_detalle.debe) as debe,
					sum(asiento_contable_detalle.haber) as haber
					FROM asiento_contable,
					asiento_contable_detalle,
					gestion
					WHERE asiento_contable.estado > 0
					and asiento_contable.key = \''||_key||E'\'
					and asiento_contable_detalle.key_asiento_contable = asiento_contable.key
					and asiento_contable_detalle.estado > 0
					and gestion.key = asiento_contable.key_gestion
					group by gestion.*,
					asiento_contable.key,
					asiento_contable.codigo,
					asiento_contable.fecha_on,
					asiento_contable.descripcion,
					asiento_contable.observacion,
					asiento_contable.tipo,
					asiento_contable.fecha
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_asiento(_key character varying) OWNER TO postgres;

--
-- Name: get_asiento_completo(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_asiento_completo(_key character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' 
				select to_json(tabla.*)::json as json
				from (
					select asiento_contable.*,
					jsonb_object_agg(gestion.key, to_json(gestion.*))::json as gestion,
					jsonb_object_agg(asiento_contable_detalle.key, to_json(asiento_contable_detalle.*))::json as asiento_contable_detalle
					from (
						select asiento_contable_detalle.*,
						jsonb_object_agg(asiento_contable_detalle_centro_costo.key, to_json(asiento_contable_detalle_centro_costo.*))::json as asiento_contable_detalle_centro_costo
						from asiento_contable_detalle left join 
						asiento_contable_detalle_centro_costo
						on  asiento_contable_detalle_centro_costo.key_asiento_contable_detalle = asiento_contable_detalle.key
						where asiento_contable_detalle.estado > 0
						and asiento_contable_detalle.key_asiento_contable =  \''||_key||E'\'
						and asiento_contable_detalle_centro_costo.estado > 0
						group by 
						asiento_contable_detalle.key, 
						asiento_contable_detalle.key_usuario, 
						asiento_contable_detalle.fecha_on, 
						asiento_contable_detalle.estado, 
						asiento_contable_detalle.key_asiento_contable, 
						asiento_contable_detalle.key_cuenta_contable, 
						asiento_contable_detalle.descripcion, 
						asiento_contable_detalle.observacion, 
						asiento_contable_detalle.debe, 
						asiento_contable_detalle.haber, 
						asiento_contable_detalle.index


					) asiento_contable_detalle,
					asiento_contable,
					gestion
					where asiento_contable_detalle.key_asiento_contable = asiento_contable.key
					and asiento_contable.estado > 0
					and gestion.estado > 0
					and gestion.key = asiento_contable.key_gestion
					group by 
					asiento_contable.key,
					asiento_contable.key_usuario, 
					asiento_contable.fecha_on, 
					asiento_contable.estado, 
					asiento_contable.fecha, 
					asiento_contable.key_gestion, 
					asiento_contable.descripcion, 
					asiento_contable.observacion, 
					asiento_contable.tipo, 
					asiento_contable.codigo
				) tabla';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_asiento_completo(_key character varying) OWNER TO postgres;

--
-- Name: get_asientos(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_asientos(_key_gestion character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT
                jsonb_object_agg(sq.key, to_json(sq.*))::json as json 
				FROM (
                    SELECT asiento_contable.key,
					asiento_contable.codigo,
					asiento_contable.fecha_on,
					asiento_contable.descripcion,
					asiento_contable.observacion,
					asiento_contable.tipo,
					asiento_contable.tipo_comprobante,
					
					asiento_contable.fecha,
					sum(asiento_contable_detalle.debe) as debe,
					sum(asiento_contable_detalle.haber) as haber
					FROM asiento_contable,
					asiento_contable_detalle
					WHERE asiento_contable.estado > 0
					and asiento_contable.key_gestion = \''||_key_gestion||E'\'
					and asiento_contable_detalle.key_asiento_contable = asiento_contable.key
					and asiento_contable_detalle.estado > 0
					group by asiento_contable.key,
					asiento_contable.codigo,
					asiento_contable.fecha_on,
					asiento_contable.descripcion,
					asiento_contable.observacion,
					asiento_contable.tipo,
					asiento_contable.tipo_comprobante,
					
					asiento_contable.fecha
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_asientos(_key_gestion character varying) OWNER TO postgres;

--
-- Name: get_by(character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_by(_nombre_tabla character varying, _key character varying, _value character varying, _key1 character varying, _value1 character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT
                to_json(sq.*)::json as json 
				FROM (
                    SELECT '||_nombre_tabla||E'.*
					FROM '||_nombre_tabla||E'
					WHERE '||_nombre_tabla||E'.'||_key||E' = \''||_value||E'\'
					AND '||_nombre_tabla||E'.'||_key1||E' = \''||_value1||E'\'
					and '||_nombre_tabla||E'.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_by(_nombre_tabla character varying, _key character varying, _value character varying, _key1 character varying, _value1 character varying) OWNER TO postgres;

--
-- Name: get_by_key(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_by_key(_nombre_tabla character varying, _key character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT
                to_json(sq.*)::json as json 
				FROM (
                    SELECT '||_nombre_tabla||E'.*
					FROM '||_nombre_tabla||E'
					WHERE '||_nombre_tabla||E'.key = \''||_key||E'\'
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_by_key(_nombre_tabla character varying, _key character varying) OWNER TO postgres;

--
-- Name: get_gestion_abierta(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_gestion_abierta(_key_empresa character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT
                to_json(sq.*)::json as json 
				FROM (
                    SELECT gestion.*
					FROM gestion
					WHERE gestion.key_empresa = \''||_key_empresa||E'\'
					and gestion.estado > 1
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_gestion_abierta(_key_empresa character varying) OWNER TO postgres;

--
-- Name: get_libro_diario(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_libro_diario(_key_empresa character varying, _fecha_inicio character varying, _fecha_fin character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT
                array_to_json(array_agg(sq.*))::json as json 
				FROM (
				
					select asiento_contable.codigo as codigo_asiento,
					asiento_contable.descripcion as glosa,
					asiento_contable.tipo,
					asiento_contable.fecha,
					asiento_contable.fecha_on,
					cuenta_contable.codigo as codigo_cuenta,
					cuenta_contable.descripcion as descripcion_cuenta,
					coalesce(asiento_contable_detalle.debe,0) as debe,
					coalesce(asiento_contable_detalle.haber,0) as haber
					from asiento_contable,
					asiento_contable_detalle,
					cuenta_contable,
					gestion
					where asiento_contable.key_gestion = gestion.key 
					and gestion.key_empresa = \''||_key_empresa||E'\'
					and asiento_contable.fecha::date between \''||_fecha_inicio||E'\'::date and \''||_fecha_fin||E'\'::date
					and asiento_contable.estado > 0
					and asiento_contable_detalle.key_asiento_contable = asiento_contable.key
					and asiento_contable_detalle.estado > 0
					and cuenta_contable.key = asiento_contable_detalle.key_cuenta_contable
					and cuenta_contable.estado > 0
					order by asiento_contable.codigo,
					asiento_contable.tipo,
					asiento_contable_detalle.index	
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_libro_diario(_key_empresa character varying, _fecha_inicio character varying, _fecha_fin character varying) OWNER TO postgres;

--
-- Name: get_libro_mayor(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_libro_mayor(_key_gestion character varying, _codigo character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT
                array_to_json(array_agg(sq.*))::json as json 
				FROM (
				select asiento_contable.key as key_asiento,
				asiento_contable.fecha,
				asiento_contable.codigo,
				asiento_contable.tipo,
				asiento_contable.fecha_on,
				cuenta_contable.codigo as codigo_cuenta,
				cuenta_contable.descripcion as descripcion_cuenta,
				coalesce(asiento_contable_detalle.debe,0) as debe,
				coalesce(asiento_contable_detalle.haber,0) as haber
				from asiento_contable,
				asiento_contable_detalle,
				cuenta_contable
				where asiento_contable.key_gestion = \''||_key_gestion||E'\'
				and asiento_contable.estado > 0
				and asiento_contable_detalle.key_asiento_contable = asiento_contable.key
				and asiento_contable_detalle.estado > 0
				and cuenta_contable.key = asiento_contable_detalle.key_cuenta_contable
				and cuenta_contable.estado > 0
				and cuenta_contable.codigo like \''||_codigo||E'%\'
				order by asiento_contable.codigo,
				asiento_contable.tipo,
				asiento_contable_detalle.index
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_libro_mayor(_key_gestion character varying, _codigo character varying) OWNER TO postgres;

--
-- Name: get_libro_mayor(character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_libro_mayor(_key_empresa character varying, _fecha_inicio character varying, _fecha_fin character varying, _codigo character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT
                array_to_json(array_agg(sq.*))::json as json 
				FROM (
				select asiento_contable.key as key_asiento,
				asiento_contable.fecha,
				asiento_contable.fecha_on,
				asiento_contable.codigo,
				asiento_contable.tipo,
				cuenta_contable.codigo as codigo_cuenta,
				cuenta_contable.descripcion as descripcion_cuenta,
				coalesce(asiento_contable_detalle.debe,0) as debe,
				coalesce(asiento_contable_detalle.haber,0) as haber,
				asiento_contable_detalle.descripcion as glosa
				from asiento_contable,
				asiento_contable_detalle,
				cuenta_contable,
				gestion
				where asiento_contable.key_gestion = gestion.key
				and gestion.key_empresa = \''||_key_empresa||E'\'
				and asiento_contable.fecha::date between \''||_fecha_inicio||E'\'::date and \''||_fecha_fin||E'\'::date
				and asiento_contable.estado > 0
				and asiento_contable_detalle.key_asiento_contable = asiento_contable.key
				and asiento_contable_detalle.estado > 0
				and cuenta_contable.key = asiento_contable_detalle.key_cuenta_contable
				and cuenta_contable.estado > 0
				and cuenta_contable.codigo like \''||_codigo||E'%\'
				order by asiento_contable.codigo,
				asiento_contable.tipo,
				asiento_contable_detalle.index
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_libro_mayor(_key_empresa character varying, _fecha_inicio character varying, _fecha_fin character varying, _codigo character varying) OWNER TO postgres;

--
-- Name: get_movimientos(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_movimientos(_key_empresa character varying, _fecha_inicio character varying, _fecha_fin character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT
                jsonb_object_agg(sq.key, to_json(sq.*))::json as json 
				FROM (
				
					select cuenta_contable.key,
						cuenta_contable.codigo,
						cuenta_contable.descripcion,
						sum(movimientos.debe) as debe,
						sum(movimientos.haber) as haber
						from  cuenta_contable   left join (
						SELECT 
						cuenta_contable.codigo,
						sum(asiento_contable_detalle.debe) as debe,
						sum(asiento_contable_detalle.haber) as haber
						FROM asiento_contable,
						asiento_contable_detalle,
						cuenta_contable,
						gestion
						WHERE asiento_contable.estado > 0
						and asiento_contable.fecha between \''||_fecha_inicio||E'\'::date and \''||_fecha_fin||E'\'::date
						and asiento_contable_detalle.key_asiento_contable = asiento_contable.key
						and asiento_contable_detalle.estado > 0
						and cuenta_contable.estado > 0
						and cuenta_contable.key = asiento_contable_detalle.key_cuenta_contable
						and gestion.key = asiento_contable.key_gestion
						and gestion.estado > 0
						and gestion.key_empresa = \''||_key_empresa||E'\'
						group by cuenta_contable.key,
						cuenta_contable.codigo
						) movimientos
						on
						movimientos.codigo like cuenta_contable.codigo||\'%\'
						where cuenta_contable.key_empresa = \''||_key_empresa||E'\'
						group by cuenta_contable.key,
						cuenta_contable.codigo,
						cuenta_contable.descripcion
						order by codigo
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_movimientos(_key_empresa character varying, _fecha_inicio character varying, _fecha_fin character varying) OWNER TO postgres;

--
-- Name: get_niveles_del_plan_de_cuentas(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_niveles_del_plan_de_cuentas(p_key_empresa text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
  resultado JSON;
BEGIN
  SELECT json_agg(row_to_json(t))
  INTO resultado
  FROM (
        select length(cuenta_contable.codigo) as len
        from cuenta_contable
        where cuenta_contable.key_empresa = p_key_empresa
        AND cuenta_contable.estado > 0
        group by len
        order by len asc
  ) AS t;

  RETURN resultado;
END;
$$;


ALTER FUNCTION public.get_niveles_del_plan_de_cuentas(p_key_empresa text) OWNER TO postgres;

--
-- Name: get_saldo_cuenta(character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_saldo_cuenta(_key_empresa character varying, _fecha_inicio character varying, _fecha_fin character varying, _codigo character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' select to_json(tabla.*) as json
				from(
					select 
					sum(asiento_contable_detalle.debe) as debe,
					sum(asiento_contable_detalle.haber) as haber
					from asiento_contable,
					asiento_contable_detalle,
					cuenta_contable,
					gestion
					where asiento_contable.key_gestion = gestion.key
					and gestion.key_empresa = \''||_key_empresa||E'\'
					and asiento_contable.fecha::date between date_trunc(\'year\',\''||_fecha_inicio||E'\'::date) and (\''||_fecha_inicio||E'\'::date-INTERVAL \'1 DAY\')
					and asiento_contable.estado > 0
					and asiento_contable_detalle.key_asiento_contable = asiento_contable.key
					and asiento_contable_detalle.estado > 0
					and cuenta_contable.key = asiento_contable_detalle.key_cuenta_contable
					and cuenta_contable.estado > 0
					and cuenta_contable.codigo like \''||_codigo||E'%\'
				)  tabla';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_saldo_cuenta(_key_empresa character varying, _fecha_inicio character varying, _fecha_fin character varying, _codigo character varying) OWNER TO postgres;

--
-- Name: reporte_asiento_contable(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reporte_asiento_contable(p_key_empresa text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
  resultado JSON;
BEGIN
  SELECT json_agg(row_to_json(t))
  INTO resultado
  FROM (
    SELECT 
      ac.key AS key_asiento_contable,
      ac.fecha AS fecha_asiento,
      ac.descripcion,
      ac.tipo, 
      acd.key AS asiento_cuenta_detalle_key,
      acd.debe,
      acd.haber,
      cc.key AS cuenta_contable_key,
      cc.descripcion AS descripcion_cuenta,
      cc.codigo AS codigo_cuenta,
      g.key_empresa
    FROM asiento_contable ac
    JOIN asiento_contable_detalle acd ON ac.key = acd.key_asiento_contable
    JOIN cuenta_contable cc ON acd.key_cuenta_contable = cc.key
    JOIN gestion g ON g.key = ac.key_gestion
    WHERE ac.estado > 0 
      AND acd.estado > 0 
      AND cc.estado > 0 
      AND g.estado > 0
      AND g.key_empresa = p_key_empresa
    ORDER BY ac.key, acd.key
  ) AS t;

  RETURN resultado;
END;
$$;


ALTER FUNCTION public.reporte_asiento_contable(p_key_empresa text) OWNER TO postgres;

--
-- Name: reporte_balance_general(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reporte_balance_general(p_key_empresa text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
  resultado JSON;
BEGIN
  SELECT json_agg(row_to_json(t))
  INTO resultado
  FROM (
        WITH balance AS (
            select  
                cuenta_contable.key,
                cuenta_contable.descripcion,
                cuenta_contable.codigo,
                cuenta_contable.tipo,
                 SUM(asiento_contable_detalle.debe) as debe,
                SUM(asiento_contable_detalle.haber) as haber,
				SUM(asiento_contable_detalle.debe_me) as debe_me,
				SUM(asiento_contable_detalle.haber_me) as haber_me
            from asiento_contable_detalle
            JOIN asiento_contable ON asiento_contable.key = asiento_contable_detalle.key_asiento_contable AND asiento_contable.estado > 0
            JOIN gestion ON asiento_contable.key_gestion = gestion.key AND gestion.estado > 0 AND gestion.key_empresa = p_key_empresa
            JOIN cuenta_contable ON cuenta_contable.key = asiento_contable_detalle.key_cuenta_contable AND cuenta_contable.estado > 0
            WHERE asiento_contable_detalle.estado > 0
            group by cuenta_contable.key
        )
        SELECT 
	        cuenta_contable.key,
            cuenta_contable.codigo,
            cuenta_contable.descripcion,
            cuenta_contable.tipo,
            COALESCE(SUM(balance.debe),0) as debe,
            COALESCE(SUM(balance.haber),0) as haber,
	  		COALESCE(SUM(balance.debe_me),0) as debe_me,
            COALESCE(SUM(balance.haber_me),0) as haber_me
        FROM (
            SELECT * 
            from cuenta_contable
            WHERE cuenta_contable.key_empresa = p_key_empresa
            AND cuenta_contable.estado > 0
            order by cuenta_contable.codigo asc
        ) cuenta_contable 
        LEFT JOIN balance ON balance.codigo like cuenta_contable.codigo || '%' 
        -- WHERE cuenta_contable.tipo IN ('ACTIVO', 'PASIVO', 'PATRIMONIO')
        GROUP BY   cuenta_contable.key, cuenta_contable.codigo, cuenta_contable.descripcion,cuenta_contable.tipo
  ) AS t;

  RETURN resultado;
END;
$$;


ALTER FUNCTION public.reporte_balance_general(p_key_empresa text) OWNER TO postgres;

--
-- Name: reporte_balance_general2(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reporte_balance_general2(p_key_empresa text, p_tipo_comprobante text DEFAULT NULL::text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado JSON;
BEGIN

    SELECT json_agg(row_to_json(t))
    INTO resultado
    FROM (

        WITH balance AS (

            SELECT
                cuenta_contable.key,
                cuenta_contable.descripcion,
                cuenta_contable.codigo,
                cuenta_contable.tipo,
                asiento_contable.tipo_comprobante,
                SUM(asiento_contable_detalle.debe) AS debe,
                SUM(asiento_contable_detalle.haber) AS haber,
                SUM(asiento_contable_detalle.debe_me) AS debe_me,
                SUM(asiento_contable_detalle.haber_me) AS haber_me
            FROM asiento_contable_detalle
            JOIN asiento_contable ON asiento_contable.key = asiento_contable_detalle.key_asiento_contable AND asiento_contable.estado > 0
            JOIN gestion ON asiento_contable.key_gestion = gestion.key AND gestion.estado > 0 AND gestion.key_empresa = p_key_empresa
            JOIN cuenta_contable ON cuenta_contable.key = asiento_contable_detalle.key_cuenta_contable AND cuenta_contable.estado > 0
            WHERE asiento_contable_detalle.estado > 0

            AND ( p_tipo_comprobante IS NULL OR asiento_contable.tipo_comprobante = p_tipo_comprobante )

            GROUP BY
                cuenta_contable.key,
                cuenta_contable.descripcion,
                cuenta_contable.codigo,
                cuenta_contable.tipo,
                asiento_contable.tipo_comprobante
        )

        SELECT
            cuenta_contable.key,
            cuenta_contable.codigo,
            cuenta_contable.descripcion,
            cuenta_contable.tipo,

            balance.tipo_comprobante,

            COALESCE(SUM(balance.debe),0) AS debe,
            COALESCE(SUM(balance.haber),0) AS haber,

            COALESCE(SUM(balance.debe_me),0) AS debe_me,
            COALESCE(SUM(balance.haber_me),0) AS haber_me

        FROM (

            SELECT *
            FROM cuenta_contable
            WHERE cuenta_contable.key_empresa = p_key_empresa
            AND cuenta_contable.estado > 0
            ORDER BY cuenta_contable.codigo ASC

        ) cuenta_contable

        LEFT JOIN balance ON balance.codigo LIKE cuenta_contable.codigo || '%'
        GROUP BY cuenta_contable.key, cuenta_contable.codigo, cuenta_contable.descripcion, cuenta_contable.tipo, balance.tipo_comprobante

    ) AS t;

    RETURN resultado;

END;
$$;


ALTER FUNCTION public.reporte_balance_general2(p_key_empresa text, p_tipo_comprobante text) OWNER TO postgres;

--
-- Name: reporte_balance_general_tipo_comprobante(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reporte_balance_general_tipo_comprobante(p_key_empresa text) RETURNS json
    LANGUAGE plpgsql
    AS $$

DECLARE
    resultado JSON;

BEGIN

    SELECT json_agg(row_to_json(t))
    INTO resultado
    FROM (

        WITH balance AS (

            SELECT
                cuenta_contable.key,
                cuenta_contable.descripcion,
                cuenta_contable.codigo,
                cuenta_contable.tipo,
                asiento_contable.tipo_comprobante,

                SUM(asiento_contable_detalle.debe) AS debe,
                SUM(asiento_contable_detalle.haber) AS haber,

                SUM(asiento_contable_detalle.debe_me) AS debe_me,
                SUM(asiento_contable_detalle.haber_me) AS haber_me

            FROM asiento_contable_detalle

            JOIN asiento_contable
                ON asiento_contable.key = asiento_contable_detalle.key_asiento_contable
                AND asiento_contable.estado > 0

            JOIN gestion
                ON asiento_contable.key_gestion = gestion.key
                AND gestion.estado > 0
                AND gestion.key_empresa = p_key_empresa

            JOIN cuenta_contable
                ON cuenta_contable.key = asiento_contable_detalle.key_cuenta_contable
                AND cuenta_contable.estado > 0

            WHERE asiento_contable_detalle.estado > 0

            GROUP BY
                cuenta_contable.key,
                cuenta_contable.descripcion,
                cuenta_contable.codigo,
                cuenta_contable.tipo,
                asiento_contable.tipo_comprobante
        )

        SELECT
            cuenta_contable.key,
            cuenta_contable.codigo,
            cuenta_contable.descripcion,
            cuenta_contable.tipo,

            balance.tipo_comprobante,

            COALESCE(SUM(balance.debe),0) AS debe,
            COALESCE(SUM(balance.haber),0) AS haber,

            COALESCE(SUM(balance.debe_me),0) AS debe_me,
            COALESCE(SUM(balance.haber_me),0) AS haber_me

        FROM (

            SELECT *
            FROM cuenta_contable
            WHERE cuenta_contable.key_empresa = p_key_empresa
            AND cuenta_contable.estado > 0
            ORDER BY cuenta_contable.codigo ASC

        ) cuenta_contable

        LEFT JOIN balance
            ON balance.codigo LIKE cuenta_contable.codigo || '%'

        GROUP BY
            cuenta_contable.key,
            cuenta_contable.codigo,
            cuenta_contable.descripcion,
            cuenta_contable.tipo,
            balance.tipo_comprobante

    ) AS t;

    RETURN resultado;

END;
$$;


ALTER FUNCTION public.reporte_balance_general_tipo_comprobante(p_key_empresa text) OWNER TO postgres;

--
-- Name: reporte_libro_diario(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reporte_libro_diario(p_key_empresa text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
  resultado JSON;
BEGIN
  SELECT json_agg(row_to_json(t))
  INTO resultado
  FROM (
       	SELECT 
	  		asiento_contable_detalle.*, 
	  		to_json(asiento_contable.*) as asiento_contable,
	  	  	to_json(cuenta_contable.*) as cuenta_contable,
			(
				select asiento_contable_detalle.debe/asiento_contable_tipo_cambio.tipo_cambio as json
				from public.asiento_contable_tipo_cambio
				where  asiento_contable_tipo_cambio.key_asiento_contable = asiento_contable.key
				and  asiento_contable_tipo_cambio.key_moneda = cuenta_contable.key_moneda
			) as debe_tc,
			(
				select asiento_contable_detalle.haber/asiento_contable_tipo_cambio.tipo_cambio as json
				from public.asiento_contable_tipo_cambio
				where  asiento_contable_tipo_cambio.key_asiento_contable = asiento_contable.key
				and  asiento_contable_tipo_cambio.key_moneda = cuenta_contable.key_moneda
			) as haber_tc,
			(
				select to_json(diario.*)
				from diario
				where diario.key = asiento_contable.key_diario
				and diario.estado > 0
				limit 1
			) as diario
		FROM gestion 
		JOIN asiento_contable ON gestion.key = asiento_contable.key_gestion
		
		JOIN asiento_contable_detalle ON asiento_contable.key = asiento_contable_detalle.key_asiento_contable
	  	JOIN cuenta_contable ON asiento_contable_detalle.key_cuenta_contable = cuenta_contable.key
		WHERE gestion.key_empresa = p_key_empresa
		AND asiento_contable.estado > 0
		order by asiento_contable.fecha_on desc, asiento_contable_detalle.index asc
  ) AS t;

  RETURN resultado;
END;
$$;


ALTER FUNCTION public.reporte_libro_diario(p_key_empresa text) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ajuste; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ajuste (
    key character varying NOT NULL,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    index integer,
    grupo_sugerido character varying
);


ALTER TABLE public.ajuste OWNER TO postgres;

--
-- Name: ajuste_empresa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ajuste_empresa (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_empresa character varying,
    key_cuenta_contable character varying,
    key_ajuste character varying
);


ALTER TABLE public.ajuste_empresa OWNER TO postgres;

--
-- Name: asiento_contable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asiento_contable (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    fecha date,
    key_gestion character varying,
    descripcion character varying,
    observacion character varying,
    tipo character varying,
    codigo character varying,
    key_diario character varying,
    tipo_comprobante character varying
);


ALTER TABLE public.asiento_contable OWNER TO postgres;

--
-- Name: asiento_contable_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asiento_contable_detalle (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_asiento_contable character varying,
    key_cuenta_contable character varying,
    descripcion character varying,
    observacion character varying,
    debe numeric,
    haber numeric,
    index integer,
    key_moneda character varying,
    debe_me numeric,
    haber_me numeric,
    tags json
);


ALTER TABLE public.asiento_contable_detalle OWNER TO postgres;

--
-- Name: asiento_contable_detalle_centro_costo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asiento_contable_detalle_centro_costo (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_asiento_contable_detalle character varying,
    key_centro_costo character varying,
    porcentaje double precision,
    monto double precision
);


ALTER TABLE public.asiento_contable_detalle_centro_costo OWNER TO postgres;

--
-- Name: asiento_contable_tipo_cambio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asiento_contable_tipo_cambio (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    tipo_cambio double precision,
    key_moneda character varying,
    descripcion character varying,
    observacion character varying,
    key_asiento_contable character varying
);


ALTER TABLE public.asiento_contable_tipo_cambio OWNER TO postgres;

--
-- Name: centro_costo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.centro_costo (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_empresa character varying,
    descripcion character varying,
    codigo character varying,
    key_centro_costo_tipo character varying
);


ALTER TABLE public.centro_costo OWNER TO postgres;

--
-- Name: centro_costo_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.centro_costo_detalle (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_centro_costo character varying,
    key_centro_costo_parent character varying,
    porcentaje double precision
);


ALTER TABLE public.centro_costo_detalle OWNER TO postgres;

--
-- Name: centro_costo_tipo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.centro_costo_tipo (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_empresa character varying,
    descripcion character varying
);


ALTER TABLE public.centro_costo_tipo OWNER TO postgres;

--
-- Name: cuenta_centro_costo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuenta_centro_costo (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_centro_costo character varying,
    key_cuenta_contable character varying
);


ALTER TABLE public.cuenta_centro_costo OWNER TO postgres;

--
-- Name: cuenta_contable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuenta_contable (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_empresa character varying,
    descripcion character varying,
    codigo character varying,
    tipo character varying,
    key_moneda character varying,
    tipo_comprobante character varying
);


ALTER TABLE public.cuenta_contable OWNER TO postgres;

--
-- Name: diario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diario (
    key character varying NOT NULL,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    codigo character varying,
    tipo character varying,
    key_empresa character varying,
    key_usuario character varying
);


ALTER TABLE public.diario OWNER TO postgres;

--
-- Name: enviroment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enviroment (
    key character varying NOT NULL,
    fecha_on timestamp without time zone,
    estado integer,
    key_usuario character varying,
    key_empresa character varying,
    descripcion character varying,
    observacion character varying,
    index integer
);


ALTER TABLE public.enviroment OWNER TO postgres;

--
-- Name: gestion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gestion (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    fecha timestamp without time zone,
    key_empresa character varying,
    descripcion character varying
);


ALTER TABLE public.gestion OWNER TO postgres;

--
-- Name: moneda; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.moneda (
    key character varying NOT NULL,
    key_usuario character varying,
    descripcion character varying,
    acronimo character varying,
    is_base boolean,
    fecha_on timestamp without time zone,
    estado integer,
    color character varying,
    key_empresa character varying
);


ALTER TABLE public.moneda OWNER TO postgres;

--
-- Name: tipo_cambio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_cambio (
    key character varying NOT NULL,
    key_moneda character varying,
    key_usuario character varying,
    monto double precision,
    fecha_on timestamp without time zone,
    estado integer
);


ALTER TABLE public.tipo_cambio OWNER TO postgres;

--
-- Name: ajuste_empresa ajuste_empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ajuste_empresa
    ADD CONSTRAINT ajuste_empresa_pkey PRIMARY KEY (key);


--
-- Name: ajuste ajuste_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ajuste
    ADD CONSTRAINT ajuste_pkey PRIMARY KEY (key);


--
-- Name: asiento_contable_detalle_centro_costo asiento_contable_d_c_c_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asiento_contable_detalle_centro_costo
    ADD CONSTRAINT asiento_contable_d_c_c_pkey PRIMARY KEY (key);


--
-- Name: asiento_contable_detalle asiento_contable_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asiento_contable_detalle
    ADD CONSTRAINT asiento_contable_detalle_pkey PRIMARY KEY (key);


--
-- Name: asiento_contable asiento_contable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asiento_contable
    ADD CONSTRAINT asiento_contable_pkey PRIMARY KEY (key);


--
-- Name: asiento_contable_tipo_cambio asiento_contable_tipo_cambio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asiento_contable_tipo_cambio
    ADD CONSTRAINT asiento_contable_tipo_cambio_pkey PRIMARY KEY (key);


--
-- Name: centro_costo_detalle centro_costo_detallle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.centro_costo_detalle
    ADD CONSTRAINT centro_costo_detallle_pkey PRIMARY KEY (key);


--
-- Name: centro_costo centro_costo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.centro_costo
    ADD CONSTRAINT centro_costo_pkey PRIMARY KEY (key);


--
-- Name: centro_costo_tipo centro_costo_tipo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.centro_costo_tipo
    ADD CONSTRAINT centro_costo_tipo_pkey PRIMARY KEY (key);


--
-- Name: cuenta_centro_costo cuenta_centro_costo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_centro_costo
    ADD CONSTRAINT cuenta_centro_costo_pkey PRIMARY KEY (key);


--
-- Name: cuenta_contable cuenta_contable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_contable
    ADD CONSTRAINT cuenta_contable_pkey PRIMARY KEY (key);


--
-- Name: diario diario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diario
    ADD CONSTRAINT diario_pkey PRIMARY KEY (key);


--
-- Name: enviroment enviroment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enviroment
    ADD CONSTRAINT enviroment_pkey PRIMARY KEY (key);


--
-- Name: gestion gestion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gestion
    ADD CONSTRAINT gestion_pkey PRIMARY KEY (key);


--
-- Name: moneda moneda_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.moneda
    ADD CONSTRAINT moneda_pkey PRIMARY KEY (key);


--
-- Name: tipo_cambio tipo_cambio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_cambio
    ADD CONSTRAINT tipo_cambio_pkey PRIMARY KEY (key);


--
-- Name: centro_costo centro_costo_fkey_key_centro_costo_tipo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.centro_costo
    ADD CONSTRAINT centro_costo_fkey_key_centro_costo_tipo FOREIGN KEY (key_centro_costo_tipo) REFERENCES public.centro_costo_tipo(key) NOT VALID;


--
-- Name: ajuste_empresa fk_ajuste_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ajuste_empresa
    ADD CONSTRAINT fk_ajuste_empresa FOREIGN KEY (key_cuenta_contable) REFERENCES public.cuenta_contable(key) NOT VALID;


--
-- Name: ajuste_empresa fk_ajuste_empresa1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ajuste_empresa
    ADD CONSTRAINT fk_ajuste_empresa1 FOREIGN KEY (key_ajuste) REFERENCES public.ajuste(key) NOT VALID;


--
-- Name: asiento_contable_detalle_centro_costo fk_asiento_contable_d_c_c_key_asiento_contable_detalle; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asiento_contable_detalle_centro_costo
    ADD CONSTRAINT fk_asiento_contable_d_c_c_key_asiento_contable_detalle FOREIGN KEY (key_asiento_contable_detalle) REFERENCES public.asiento_contable_detalle(key);


--
-- Name: asiento_contable_detalle_centro_costo fk_asiento_contable_d_c_c_key_centro_costo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asiento_contable_detalle_centro_costo
    ADD CONSTRAINT fk_asiento_contable_d_c_c_key_centro_costo FOREIGN KEY (key_centro_costo) REFERENCES public.centro_costo(key);


--
-- Name: asiento_contable_detalle fk_asiento_contable_detalle_key_asiento_contable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asiento_contable_detalle
    ADD CONSTRAINT fk_asiento_contable_detalle_key_asiento_contable FOREIGN KEY (key_asiento_contable) REFERENCES public.asiento_contable(key);


--
-- Name: asiento_contable_detalle fk_asiento_contable_detalle_key_cuenta_contable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asiento_contable_detalle
    ADD CONSTRAINT fk_asiento_contable_detalle_key_cuenta_contable FOREIGN KEY (key_cuenta_contable) REFERENCES public.cuenta_contable(key);


--
-- Name: asiento_contable fk_asiento_contable_key_diario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asiento_contable
    ADD CONSTRAINT fk_asiento_contable_key_diario FOREIGN KEY (key_diario) REFERENCES public.diario(key) NOT VALID;


--
-- Name: asiento_contable fk_asiento_contable_key_gestion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asiento_contable
    ADD CONSTRAINT fk_asiento_contable_key_gestion FOREIGN KEY (key_gestion) REFERENCES public.gestion(key);


--
-- Name: asiento_contable_tipo_cambio fk_asiento_contable_tipo_cambio_key_asiento_contable; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asiento_contable_tipo_cambio
    ADD CONSTRAINT fk_asiento_contable_tipo_cambio_key_asiento_contable FOREIGN KEY (key_asiento_contable) REFERENCES public.asiento_contable(key);


--
-- Name: tipo_cambio fk_tipo_cambio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_cambio
    ADD CONSTRAINT fk_tipo_cambio FOREIGN KEY (key_moneda) REFERENCES public.moneda(key) NOT VALID;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict TjZb7gif53GS6l2Pv0Ug0V8jmipsjGhH5p52S9DbCIHUP38976d7bbbyOr02vAU

