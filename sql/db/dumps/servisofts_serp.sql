--
-- PostgreSQL database dump
--

\restrict 57yEkiBv3JpVGiS1gWO7U1qIGdPpyVJbqReeQrMUXlRcygvaf6ZUjD1ShbtKQfM

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
-- Name: clonador(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clonador(_key_empresa_from character varying, _key_empresa_to character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.clonador(_key_empresa_from character varying, _key_empresa_to character varying) OWNER TO postgres;

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
-- Name: dislike(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.dislike(_key_publicacion character varying, _key_usuario character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Actualiza el estado de "like" a "dislike" (0) para la publicación y usuario especificados
    UPDATE publicacion_like 
    SET estado = 0 
    WHERE key_publicacion = _key_publicacion AND key_usuario = _key_usuario;
END;
$$;


ALTER FUNCTION public.dislike(_key_publicacion character varying, _key_usuario character varying) OWNER TO postgres;

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
-- Name: get_all(character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all(_nombre_tabla character varying, _key_valor character varying, _data_valor character varying, _key_valor1 character varying, _data_valor1 character varying) RETURNS SETOF character varying
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
					AND '||_nombre_tabla||E'.'||_key_valor1||E' = \''||_data_valor1||E'\'
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all(_nombre_tabla character varying, _key_valor character varying, _data_valor character varying, _key_valor1 character varying, _data_valor1 character varying) OWNER TO postgres;

--
-- Name: get_all_habilidad_usuario(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_habilidad_usuario(_key_empresa character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'  select array_to_json(array_agg(tabla.*)) as json
				from (
				SELECT *,
				(
					select array_to_json(array_agg(habilidad_usuario.key_usuario))
					from habilidad_usuario
					where habilidad_usuario.estado > 0
					and habilidad_usuario.key_habilidad = habilidad.key 
				) key_usuarios
				FROM public.habilidad
				where key_empresa = \''||_key_empresa||E'\'
				and estado > 0
				) tabla';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_habilidad_usuario(_key_empresa character varying) OWNER TO postgres;

--
-- Name: get_all_notas(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_notas(_key_usuario character varying) RETURNS SETOF character varying
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
                    SELECT nota.*,
					nota_usuario.is_admin
					FROM nota,
					nota_usuario
					WHERE nota.key = nota_usuario.key_nota
					and nota_usuario.key_usuario = \''||_key_usuario||E'\'
					AND nota.estado > 0
					AND nota_usuario.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_notas(_key_usuario character varying) OWNER TO postgres;

--
-- Name: get_all_notas(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_notas(_key_usuario character varying, _key_empresa character varying) RETURNS SETOF character varying
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
                    SELECT nota.*,
					nota_usuario.is_admin,
					(select count(key) from nota_usuario where nota_usuario.key_nota = nota.key and nota_usuario.estado > 0) as cantidad_participantes
					FROM nota,
					nota_usuario
					WHERE nota.key = nota_usuario.key_nota
					and nota_usuario.key_usuario = \''||_key_usuario||E'\'
					and nota.key_empresa = \''||_key_empresa||E'\'
					AND nota.key_nota is null
					AND nota.estado > 0
					AND nota_usuario.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_notas(_key_usuario character varying, _key_empresa character varying) OWNER TO postgres;

--
-- Name: get_all_notas_historico(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_notas_historico(_key_nota character varying) RETURNS SETOF character varying
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
                    SELECT nota.*
					FROM nota
					WHERE nota.key_nota = \''||_key_nota||E'\'
					AND nota.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_notas_historico(_key_nota character varying) OWNER TO postgres;

--
-- Name: get_all_scene_mesh(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_scene_mesh(_key_scene character varying) RETURNS SETOF character varying
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
                    SELECT scene_mesh.*,
					mesh.url,
					mesh.tipo,
					mesh.descripcion
					FROM mesh,
					scene_mesh
					WHERE scene_mesh.estado > 0
					AND scene_mesh.key_scene = \''||_key_scene||E'\'
					and mesh.key = scene_mesh.key_mesh
					and mesh.estado > 0
					
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_scene_mesh(_key_scene character varying) OWNER TO postgres;

--
-- Name: get_all_tareas(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_tareas(_key_usuario character varying, _key_empresa character varying) RETURNS SETOF character varying
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
                    SELECT tarea.*,
					tarea_usuario.is_admin,
					(select count(key) from tarea_usuario where tarea_usuario.key_tarea = tarea.key and tarea_usuario.estado > 0) as cantidad_participantes
					FROM tarea,
					tarea_usuario
					WHERE tarea.key = tarea_usuario.key_tarea
					and tarea_usuario.key_usuario = \''||_key_usuario||E'\'
					and tarea.key_empresa = \''||_key_empresa||E'\'
					AND tarea.estado > 0
					AND tarea_usuario.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_tareas(_key_usuario character varying, _key_empresa character varying) OWNER TO postgres;

--
-- Name: get_all_tareas(character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_tareas(_key_usuario character varying, _key_empresa character varying, _fecha_ini character varying, _fecha_fin character varying) RETURNS SETOF character varying
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
                    SELECT tarea.*,
					tarea_usuario.is_admin,
					(select count(key) from tarea_usuario where tarea_usuario.key_tarea = tarea.key and tarea_usuario.estado > 0) as cantidad_participantes
					FROM tarea,
					tarea_usuario
					WHERE tarea.key = tarea_usuario.key_tarea
					and tarea_usuario.key_usuario = \''||_key_usuario||E'\'
					and tarea.key_empresa = \''||_key_empresa||E'\'
					and tarea.fecha_inicio::date between \''||_fecha_ini||E'\'::date and \''||_fecha_fin||E'\'::date
					AND tarea.estado > 0
					AND tarea_usuario.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_tareas(_key_usuario character varying, _key_empresa character varying, _fecha_ini character varying, _fecha_fin character varying) OWNER TO postgres;

--
-- Name: get_all_tareas_cantidad(character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_tareas_cantidad(_key_usuario character varying, _key_empresa character varying, _fecha_ini character varying, _fecha_fin character varying) RETURNS SETOF character varying
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
                jsonb_object_agg(sq.fecha_inicio, to_json(sq.*))::json as json 
				FROM (
				select tareas.fecha_inicio,
				count(tareas.key) as cantidad
				from(
                    SELECT tarea.fecha_inicio::date,
					tarea.key
					FROM tarea,
					tarea_usuario
					WHERE tarea.key = tarea_usuario.key_tarea
					and tarea_usuario.key_usuario = \''||_key_usuario||E'\'
					and tarea.key_empresa = \''||_key_empresa||E'\'
					and tarea.fecha_inicio::date between \''||_fecha_ini||E'\'::date and \''||_fecha_fin||E'\'::date
					AND tarea.estado > 0
					AND tarea_usuario.estado > 0
					) tareas
					group by tareas.fecha_inicio
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_tareas_cantidad(_key_usuario character varying, _key_empresa character varying, _fecha_ini character varying, _fecha_fin character varying) OWNER TO postgres;

--
-- Name: get_all_usuarios_tareas(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_usuarios_tareas(_key_tarea character varying, _key_empresa character varying) RETURNS SETOF character varying
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
                    SELECT tarea_usuario.*
					FROM tarea,
					tarea_usuario
					WHERE tarea.key = tarea_usuario.key_tarea
					and tarea_usuario.key_tarea = \''||_key_tarea||E'\'
					and tarea.key_empresa = \''||_key_empresa||E'\'
					AND tarea.estado > 0
					AND tarea_usuario.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_usuarios_tareas(_key_tarea character varying, _key_empresa character varying) OWNER TO postgres;

--
-- Name: get_by(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_by(_nombre_tabla character varying, _key_valor character varying, _data_valor character varying) RETURNS SETOF character varying
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
					WHERE '||_nombre_tabla||E'.'||_key_valor||E' = \''||_data_valor||E'\'
					AND '||_nombre_tabla||E'.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_by(_nombre_tabla character varying, _key_valor character varying, _data_valor character varying) OWNER TO postgres;

--
-- Name: get_by(character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_by(_nombre_tabla character varying, _key_valor character varying, _data_valor character varying, _key_valor1 character varying, _data_valor1 character varying) RETURNS SETOF character varying
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
					WHERE '||_nombre_tabla||E'.'||_key_valor||E' = \''||_data_valor||E'\'
					AND '||_nombre_tabla||E'.'||_key_valor1||E' = \''||_data_valor1||E'\'
					AND '||_nombre_tabla||E'.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_by(_nombre_tabla character varying, _key_valor character varying, _data_valor character varying, _key_valor1 character varying, _data_valor1 character varying) OWNER TO postgres;

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
                jsonb_object_agg(sq.key, to_json(sq.*))::json as json 
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
-- Name: get_nota_usuario(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_nota_usuario(_key_nota character varying, _key_usuario character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT to_json(sq.*)::json as json 
				FROM (
                    SELECT nota_usuario.*
					FROM nota,
					nota_usuario
					WHERE nota.key = \''||_key_nota||E'\'
					and nota.key = nota_usuario.key_nota
					and nota_usuario.key_usuario = \''||_key_usuario||E'\'
					AND nota_usuario.estado > 0
					AND nota.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_nota_usuario(_key_nota character varying, _key_usuario character varying) OWNER TO postgres;

--
-- Name: get_numero_tarea(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_numero_tarea(_key_empresa character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT to_json(sq.*)::json as json 
				FROM (
                    SELECT count(tarea.key)+1 as numero
					FROM tarea
					WHERE tarea.key_empresa = \''||_key_empresa||E'\'
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_numero_tarea(_key_empresa character varying) OWNER TO postgres;

--
-- Name: get_publicacion(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_publicacion(_key character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'  select jsonb_object_agg(tabla.key, to_json(tabla.*))::json as json 
			from (
				select publicacion.*,
				(
					select count(publicacion_like.key)
					from publicacion_like
					where publicacion_like.key_publicacion = publicacion.key
					and publicacion_like.estado > 0
				) as likes,
				0 as mylike,
				(
					select count(publicacion_comentario.key)
					from publicacion_comentario
					where publicacion_comentario.key_publicacion = publicacion.key
					and publicacion_comentario.estado > 0
				) as comentarios
				from publicacion
				where publicacion.estado > 0
				and publicacion.key = \''||_key||E'\'
				order by fecha_on desc
				
) tabla'
;
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_publicacion(_key character varying) OWNER TO postgres;

--
-- Name: get_publicacion(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_publicacion(_key character varying, _key_usuario character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'  select jsonb_object_agg(tabla.key, to_json(tabla.*))::json as json 
			from (
				select publicacion.*,
				(
					select count(publicacion_like.key)
					from publicacion_like
					where publicacion_like.key_publicacion = publicacion.key
					and publicacion_like.estado > 0
				) as likes,
				(
					select count(publicacion_like.key)
					from publicacion_like
					where publicacion_like.key_publicacion = publicacion.key
					and publicacion_like.key_usuario = \''||_key_usuario||E'\'
					and publicacion_like.estado > 0
				) as mylike,
				(
					select count(publicacion_comentario.key)
					from publicacion_comentario
					where publicacion_comentario.key_publicacion = publicacion.key
					and publicacion_comentario.estado > 0
				) as comentarios
				from publicacion
				where publicacion.estado > 0
				and publicacion.key = \''||_key||E'\'
				order by fecha_on desc
				
) tabla'
;
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_publicacion(_key character varying, _key_usuario character varying) OWNER TO postgres;

--
-- Name: get_publicaciones_inicio(integer, integer, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_publicaciones_inicio(_offset integer, _limit integer, _key_usuario character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'select jsonb_object_agg(tabla.key, to_json(tabla.*))::json as json 
			from (
			select tabla.*
			from (
				select publicacion.*,
				(
					select count(publicacion_like.key)
					from publicacion_like
					where publicacion_like.key_publicacion = publicacion.key
					and publicacion_like.estado > 0
				) as likes,
				(
					select count(publicacion_like.key)
					from publicacion_like
					where publicacion_like.key_publicacion = publicacion.key
					and publicacion_like.key_usuario = \''||_key_usuario||E'\'
					and publicacion_like.estado > 0
				) as mylike,
				(
					select count(publicacion_comentario.key)
					from publicacion_comentario
					where publicacion_comentario.key_publicacion = publicacion.key
					and publicacion_comentario.estado > 0
				) as comentarios
				from publicacion
				where publicacion.estado > 0
				order by publicacion.fecha_on desc
				)
				tabla
				limit '||_limit||E' offset '||_offset||E'
				
) tabla';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_publicaciones_inicio(_offset integer, _limit integer, _key_usuario character varying) OWNER TO postgres;

--
-- Name: get_publicaciones_inicio(integer, integer, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_publicaciones_inicio(_offset integer, _limit integer, _key_usuario character varying, _key_empresa character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'select jsonb_object_agg(tabla.key, to_json(tabla.*))::json as json 
			from (
			select tabla.*
			from (
				select publicacion.*,
				(
					select count(publicacion_like.key)
					from publicacion_like
					where publicacion_like.key_publicacion = publicacion.key
					and publicacion_like.estado > 0
				) as likes,
				(
					select count(publicacion_like.key)
					from publicacion_like
					where publicacion_like.key_publicacion = publicacion.key
					and publicacion_like.key_usuario = \''||_key_usuario||E'\'
					and publicacion_like.estado > 0
				) as mylike,
				(
					select count(publicacion_comentario.key)
					from publicacion_comentario
					where publicacion_comentario.key_publicacion = publicacion.key
					and publicacion_comentario.estado > 0
				) as comentarios
				from publicacion
				where publicacion.estado > 0
				and publicacion.key_empresa = \''||_key_empresa||E'\'
				order by publicacion.fecha_on desc
				)
				tabla
				limit '||_limit||E' offset '||_offset||E'
				
) tabla';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_publicaciones_inicio(_offset integer, _limit integer, _key_usuario character varying, _key_empresa character varying) OWNER TO postgres;

--
-- Name: get_solicitud_qr_pagados(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_solicitud_qr_pagados(_key_empresa character varying, _tipo character varying) RETURNS SETOF character varying
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
                    SELECT solicitud_qr.*
					FROM solicitud_qr
					WHERE solicitud_qr.estado > 0
					AND solicitud_qr.tipo = \''||_tipo||E'\'
					AND solicitud_qr.key_empresa = \''||_key_empresa||E'\'
					AND solicitud_qr.fecha_pago is not null
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_solicitud_qr_pagados(_key_empresa character varying, _tipo character varying) OWNER TO postgres;

--
-- Name: get_solicitud_qr_pagados_usuario(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_solicitud_qr_pagados_usuario(_key_empresa character varying, _key_usuario character varying) RETURNS SETOF character varying
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
                    SELECT solicitud_qr.*
					FROM solicitud_qr
					WHERE solicitud_qr.estado > 0
					AND solicitud_qr.key_usuario = \''||_key_usuario||E'\'
					AND solicitud_qr.key_empresa = \''||_key_empresa||E'\'
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_solicitud_qr_pagados_usuario(_key_empresa character varying, _key_usuario character varying) OWNER TO postgres;

--
-- Name: get_tareas_agendadas(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_tareas_agendadas(_key_usuario character varying, _key_empresa character varying) RETURNS SETOF character varying
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
                    SELECT tarea.*,
					tarea_usuario.response,
					tarea_usuario.estado as estado_tarea_usuario
					FROM tarea, tarea_usuario
					WHERE tarea.key = tarea_usuario.key_tarea
					and tarea_usuario.key_usuario = \''||_key_usuario||E'\'
					and tarea.key_empresa = \''||_key_empresa||E'\'
					AND tarea.estado > 0
					AND tarea_usuario.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_tareas_agendadas(_key_usuario character varying, _key_empresa character varying) OWNER TO postgres;

--
-- Name: tarea_get_all(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tarea_get_all(_component character varying, _type character varying) RETURNS SETOF character varying
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
                    SELECT tarea.* 
					FROM tarea
					WHERE tarea.component = \''||_component||E'\'
					and tarea.type = \''||_type||E'\'
					AND tarea.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.tarea_get_all(_component character varying, _type character varying) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: avatar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.avatar (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    data json,
    key_scene character varying,
    fecha_edit timestamp without time zone
);


ALTER TABLE public.avatar OWNER TO postgres;

--
-- Name: banco; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banco (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    key_empresa character varying NOT NULL,
    key_cuenta_contable character varying
);


ALTER TABLE public.banco OWNER TO postgres;

--
-- Name: banco_cuenta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banco_cuenta (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    key_banco character varying,
    key_cuenta_contable character varying
);


ALTER TABLE public.banco_cuenta OWNER TO postgres;

--
-- Name: billetera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.billetera (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    monto double precision,
    tipo_pago character varying,
    detalle character varying,
    transaction_id character varying,
    key_empresa character varying
);


ALTER TABLE public.billetera OWNER TO postgres;

--
-- Name: camera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camera (
    key character varying NOT NULL,
    key_usuario character varying,
    key_empresa character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    data json,
    tipo character varying
);


ALTER TABLE public.camera OWNER TO postgres;

--
-- Name: cuenta_movimiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuenta_movimiento (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    key_cuenta character varying,
    monto double precision
);


ALTER TABLE public.cuenta_movimiento OWNER TO postgres;

--
-- Name: dato; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dato (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    tipo character varying,
    required boolean,
    caducable boolean
);


ALTER TABLE public.dato OWNER TO postgres;

--
-- Name: empresa_cierre_programado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresa_cierre_programado (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_restaurante character varying,
    fecha_cierre timestamp without time zone,
    habilitado_backup boolean,
    fecha_ejecucion_on timestamp without time zone,
    fecha_ejecucion_off timestamp without time zone
);


ALTER TABLE public.empresa_cierre_programado OWNER TO postgres;

--
-- Name: habilidad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.habilidad (
    key character varying(50) NOT NULL,
    fecha_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado integer DEFAULT 1,
    descripcion character varying,
    observacion character varying,
    color character varying(50),
    key_empresa character varying(50)
);


ALTER TABLE public.habilidad OWNER TO postgres;

--
-- Name: habilidad_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.habilidad_usuario (
    key character varying(255) NOT NULL,
    key_usuario character varying(255) NOT NULL,
    fecha_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado integer DEFAULT 1,
    key_habilidad character varying(255) NOT NULL
);


ALTER TABLE public.habilidad_usuario OWNER TO postgres;

--
-- Name: invitacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invitacion (
    key character varying NOT NULL,
    estado integer,
    fecha_on timestamp without time zone,
    key_usuario character varying,
    fecha_inicio timestamp without time zone,
    fecha_fin timestamp without time zone,
    descripcion character varying,
    observacion character varying,
    color character varying,
    telefono character varying,
    email character varying,
    url character varying,
    key_empresa character varying,
    key_rol character varying,
    key_usuario_invitado character varying,
    key_invitation character varying
);


ALTER TABLE public.invitacion OWNER TO postgres;

--
-- Name: label; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.label (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    color character varying,
    key_empresa character varying
);


ALTER TABLE public.label OWNER TO postgres;

--
-- Name: mesh; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mesh (
    key character varying NOT NULL,
    key_usuario character varying,
    key_empresa character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    data json,
    url character varying,
    tipo character varying,
    is_personaje boolean
);


ALTER TABLE public.mesh OWNER TO postgres;

--
-- Name: nota; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nota (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    key_empresa character varying,
    key_nota character varying,
    color character varying,
    type character varying
);


ALTER TABLE public.nota OWNER TO postgres;

--
-- Name: nota_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nota_usuario (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_nota character varying,
    response json,
    is_admin character varying
);


ALTER TABLE public.nota_usuario OWNER TO postgres;

--
-- Name: pizarra; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pizarra (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_empresa character varying,
    descripcion character varying,
    id character varying,
    fecha_edit timestamp without time zone,
    nodes json
);


ALTER TABLE public.pizarra OWNER TO postgres;

--
-- Name: pizarra_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pizarra_usuario (
    key character varying NOT NULL,
    estado integer,
    fecha_on timestamp without time zone,
    fecha_edit timestamp without time zone,
    key_usuario character varying,
    key_pizarra character varying NOT NULL,
    active boolean,
    data json
);


ALTER TABLE public.pizarra_usuario OWNER TO postgres;

--
-- Name: publicacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.publicacion (
    key character varying NOT NULL,
    key_usuario character varying NOT NULL,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying NOT NULL,
    observacion character varying NOT NULL,
    tipo character varying,
    key_empresa character varying
);


ALTER TABLE public.publicacion OWNER TO postgres;

--
-- Name: publicacion_comentario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.publicacion_comentario (
    key character varying NOT NULL,
    key_usuario character varying NOT NULL,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying NOT NULL,
    observacion character varying NOT NULL,
    key_publicacion character varying NOT NULL
);


ALTER TABLE public.publicacion_comentario OWNER TO postgres;

--
-- Name: publicacion_like; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.publicacion_like (
    key character varying NOT NULL,
    key_usuario character varying NOT NULL,
    fecha_on timestamp without time zone,
    estado integer,
    key_publicacion character varying
);


ALTER TABLE public.publicacion_like OWNER TO postgres;

--
-- Name: rol_dato; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rol_dato (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_dato character varying,
    key_rol character varying
);


ALTER TABLE public.rol_dato OWNER TO postgres;

--
-- Name: sapi_token; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sapi_token (
    key character varying NOT NULL,
    estado integer,
    fecha_on timestamp without time zone,
    key_usuario character varying,
    fecha_fin timestamp without time zone,
    token character varying,
    key_empresa character varying
);


ALTER TABLE public.sapi_token OWNER TO postgres;

--
-- Name: scene; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scene (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    data json,
    descripcion character varying,
    observacion character varying,
    key_empresa character varying
);


ALTER TABLE public.scene OWNER TO postgres;

--
-- Name: scene_mesh; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scene_mesh (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    data json,
    key_scene character varying,
    key_mesh character varying,
    deeplink character varying
);


ALTER TABLE public.scene_mesh OWNER TO postgres;

--
-- Name: solicitud_qr; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solicitud_qr (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    fecha_inicio timestamp without time zone,
    qrid character varying,
    fecha_pago timestamp without time zone,
    monto double precision,
    fecha_vencimiento timestamp without time zone,
    nit character varying,
    razon_social character varying,
    correos json,
    key_empresa character varying,
    tipo character varying,
    descripcion character varying,
    telefono character varying,
    callback character varying,
    key_bg_profile character varying,
    data json
);


ALTER TABLE public.solicitud_qr OWNER TO postgres;

--
-- Name: tarea; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tarea (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    service character varying,
    component character varying,
    type character varying,
    url character varying,
    key_empresa character varying,
    fecha_inicio timestamp without time zone,
    fecha_fin timestamp without time zone,
    color character varying,
    tiempo_iteracion_seg integer,
    avance integer,
    key_tarea character varying,
    numero integer
);


ALTER TABLE public.tarea OWNER TO postgres;

--
-- Name: tarea_comentario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tarea_comentario (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    key_tarea character varying,
    data json,
    tipo character varying
);


ALTER TABLE public.tarea_comentario OWNER TO postgres;

--
-- Name: tarea_label; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tarea_label (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_label character varying,
    key_tarea character varying
);


ALTER TABLE public.tarea_label OWNER TO postgres;

--
-- Name: tarea_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tarea_usuario (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_tarea character varying,
    response json,
    is_admin character varying,
    key_usuario_creador character varying
);


ALTER TABLE public.tarea_usuario OWNER TO postgres;

--
-- Name: terreno; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.terreno (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    points json,
    descripcion character varying,
    observacion character varying,
    key_empresa character varying
);


ALTER TABLE public.terreno OWNER TO postgres;

--
-- Name: usuario_dato; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario_dato (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_usuario_perfil character varying,
    key_dato character varying,
    descripcion character varying,
    fecha_vencimiento timestamp without time zone
);


ALTER TABLE public.usuario_dato OWNER TO postgres;

--
-- Name: avatar avatar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avatar
    ADD CONSTRAINT avatar_pkey PRIMARY KEY (key);


--
-- Name: banco_cuenta banco_cuenta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banco_cuenta
    ADD CONSTRAINT banco_cuenta_pkey PRIMARY KEY (key);


--
-- Name: banco banco_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banco
    ADD CONSTRAINT banco_pkey PRIMARY KEY (key);


--
-- Name: billetera billetera_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billetera
    ADD CONSTRAINT billetera_pkey PRIMARY KEY (key);


--
-- Name: camera camera_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camera
    ADD CONSTRAINT camera_pkey PRIMARY KEY (key);


--
-- Name: cuenta_movimiento cuenta_movimiento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_movimiento
    ADD CONSTRAINT cuenta_movimiento_pkey PRIMARY KEY (key);


--
-- Name: dato dato_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dato
    ADD CONSTRAINT dato_pkey PRIMARY KEY (key);


--
-- Name: empresa_cierre_programado empresa_cierre_programado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_cierre_programado
    ADD CONSTRAINT empresa_cierre_programado_pkey PRIMARY KEY (key);


--
-- Name: habilidad_usuario habilidad_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habilidad_usuario
    ADD CONSTRAINT habilidad_usuario_pkey PRIMARY KEY (key);


--
-- Name: habilidad habilidades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habilidad
    ADD CONSTRAINT habilidades_pkey PRIMARY KEY (key);


--
-- Name: invitacion invitacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitacion
    ADD CONSTRAINT invitacion_pkey PRIMARY KEY (key);


--
-- Name: label label_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.label
    ADD CONSTRAINT label_pkey PRIMARY KEY (key);


--
-- Name: terreno lote_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.terreno
    ADD CONSTRAINT lote_pkey PRIMARY KEY (key);


--
-- Name: mesh mesh_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mesh
    ADD CONSTRAINT mesh_pkey PRIMARY KEY (key);


--
-- Name: scene_mesh mesh_scene_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scene_mesh
    ADD CONSTRAINT mesh_scene_pkey PRIMARY KEY (key);


--
-- Name: nota nota_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota
    ADD CONSTRAINT nota_pkey PRIMARY KEY (key);


--
-- Name: nota_usuario nota_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_usuario
    ADD CONSTRAINT nota_usuario_pkey PRIMARY KEY (key);


--
-- Name: pizarra pizarra_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pizarra
    ADD CONSTRAINT pizarra_pkey PRIMARY KEY (key);


--
-- Name: pizarra_usuario pizarra_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pizarra_usuario
    ADD CONSTRAINT pizarra_usuario_pkey PRIMARY KEY (key);


--
-- Name: publicacion_comentario publicacion_comentario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publicacion_comentario
    ADD CONSTRAINT publicacion_comentario_key PRIMARY KEY (key);


--
-- Name: publicacion_like publicacion_like_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publicacion_like
    ADD CONSTRAINT publicacion_like_pkey PRIMARY KEY (key);


--
-- Name: publicacion publicacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publicacion
    ADD CONSTRAINT publicacion_pkey PRIMARY KEY (key);


--
-- Name: rol_dato rol_dato_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_dato
    ADD CONSTRAINT rol_dato_pkey PRIMARY KEY (key);


--
-- Name: sapi_token sapi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sapi_token
    ADD CONSTRAINT sapi_pkey PRIMARY KEY (key);


--
-- Name: scene scene_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scene
    ADD CONSTRAINT scene_pkey PRIMARY KEY (key);


--
-- Name: solicitud_qr solicitud_qr_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_qr
    ADD CONSTRAINT solicitud_qr_pkey PRIMARY KEY (key);


--
-- Name: tarea_comentario tarea_comentario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarea_comentario
    ADD CONSTRAINT tarea_comentario_pkey PRIMARY KEY (key);


--
-- Name: tarea_label tarea_label_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarea_label
    ADD CONSTRAINT tarea_label_pkey PRIMARY KEY (key);


--
-- Name: tarea tarea_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarea
    ADD CONSTRAINT tarea_pkey PRIMARY KEY (key);


--
-- Name: tarea_usuario tarea_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarea_usuario
    ADD CONSTRAINT tarea_usuario_pkey PRIMARY KEY (key);


--
-- Name: usuario_dato usuario_dato_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_dato
    ADD CONSTRAINT usuario_dato_pkey PRIMARY KEY (key);


--
-- Name: avatar fk_avatar_key_scene; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avatar
    ADD CONSTRAINT fk_avatar_key_scene FOREIGN KEY (key_scene) REFERENCES public.scene(key) NOT VALID;


--
-- Name: publicacion_comentario fk_comentario_key_publicacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publicacion_comentario
    ADD CONSTRAINT fk_comentario_key_publicacion FOREIGN KEY (key_publicacion) REFERENCES public.publicacion(key);


--
-- Name: tarea_label fk_key_tarea_label; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarea_label
    ADD CONSTRAINT fk_key_tarea_label FOREIGN KEY (key_label) REFERENCES public.label(key);


--
-- Name: tarea_label fk_key_tarea_label_tarea; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarea_label
    ADD CONSTRAINT fk_key_tarea_label_tarea FOREIGN KEY (key_tarea) REFERENCES public.tarea(key);


--
-- Name: tarea_comentario fk_key_tarea_tarea_comentario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarea_comentario
    ADD CONSTRAINT fk_key_tarea_tarea_comentario FOREIGN KEY (key_tarea) REFERENCES public.tarea(key);


--
-- Name: tarea_usuario fk_key_tarea_tarea_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarea_usuario
    ADD CONSTRAINT fk_key_tarea_tarea_usuario FOREIGN KEY (key_tarea) REFERENCES public.tarea(key) NOT VALID;


--
-- Name: scene_mesh fk_mesh_scene_key_mesh; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scene_mesh
    ADD CONSTRAINT fk_mesh_scene_key_mesh FOREIGN KEY (key_mesh) REFERENCES public.mesh(key) NOT VALID;


--
-- Name: scene_mesh fk_mesh_scene_key_scene; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scene_mesh
    ADD CONSTRAINT fk_mesh_scene_key_scene FOREIGN KEY (key_scene) REFERENCES public.scene(key) NOT VALID;


--
-- Name: nota fk_nota_history; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota
    ADD CONSTRAINT fk_nota_history FOREIGN KEY (key_nota) REFERENCES public.nota(key) NOT VALID;


--
-- Name: nota_usuario fk_nota_usuario_key_nota; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_usuario
    ADD CONSTRAINT fk_nota_usuario_key_nota FOREIGN KEY (key_nota) REFERENCES public.nota(key) NOT VALID;


--
-- Name: publicacion_like fk_publicacion_like_key_publicacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publicacion_like
    ADD CONSTRAINT fk_publicacion_like_key_publicacion FOREIGN KEY (key_publicacion) REFERENCES public.publicacion(key);


--
-- Name: rol_dato fk_rol_dato_key_dato; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_dato
    ADD CONSTRAINT fk_rol_dato_key_dato FOREIGN KEY (key_dato) REFERENCES public.dato(key) NOT VALID;


--
-- Name: usuario_dato fk_usuario_dato_key_dato; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_dato
    ADD CONSTRAINT fk_usuario_dato_key_dato FOREIGN KEY (key_dato) REFERENCES public.dato(key);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 57yEkiBv3JpVGiS1gWO7U1qIGdPpyVJbqReeQrMUXlRcygvaf6ZUjD1ShbtKQfM

