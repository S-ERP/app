--
-- PostgreSQL database dump
--

\restrict 4Xn3AatoBGcrkvigPWn320cPj3aYT1Zm8c6vJxpzy33dgshDKFj9hC31tMh1RBD

-- Dumped from database version 13.15 (Debian 13.15-1.pgdg120+1)
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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: _calistenia_rol_duplicados(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._calistenia_rol_duplicados() RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT
                jsonb_object_agg(sq.key, to_json(sq.*))::json as json 
				FROM (
				
				
				 SELECT rol.key_servicio as calistenia_key, rol.key as key_rol , rol.descripcion, usuario_rol.key_usuario, usuario_rol.estado as estado_rol, COUNT(*) AS cantidad_repeticiones
FROM rol, usuario_rol
WHERE rol.key_servicio = "b98d744a-6629-4c80-b513-f007c884e8e1"
  AND rol.estado > 0
  AND usuario_rol.estado > 0
  AND usuario_rol.key_rol = rol.key
GROUP BY rol.key, rol.descripcion, rol.key_servicio, usuario_rol.key_usuario, usuario_rol.estado
HAVING COUNT(*) > 1

                  
					
					
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public._calistenia_rol_duplicados() OWNER TO postgres;

--
-- Name: clonador(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clonador(_key_empresa_from character varying, _key_empresa_to character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_old_rol_key  varchar;
    v_new_rol_key  varchar;
    v_result       jsonb;
    n_rol          integer := 0;
    n_rol_permiso  integer := 0;
    n_usuario_rol  integer := 0;
BEGIN
    -- Iterar sobre cada rol de la empresa origen
    FOR v_old_rol_key IN
        SELECT key FROM rol WHERE key_empresa = _key_empresa_from
    LOOP
        -- Generar nuevo key para este rol externamente
        -- para poder usarlo luego en las tablas hijas
        v_new_rol_key := md5(random()::text || clock_timestamp()::text);

        -- Clonar el rol: reemplaza key y key_empresa con los nuevos valores
        PERFORM public.clonar_tabla('rol', 'key', v_old_rol_key,
            jsonb_build_object('key', v_new_rol_key, 'key_empresa', _key_empresa_to));
        n_rol := n_rol + 1;

        -- Clonar rol_permiso: nuevo key por fila, key_rol apunta al nuevo rol
        SELECT public.clonar_tabla('rol_permiso', 'key_rol', v_old_rol_key,
            jsonb_build_object('key', NULL, 'key_rol', v_new_rol_key))::jsonb
        INTO v_result;
        n_rol_permiso := n_rol_permiso + (v_result->>'filas')::integer;

        -- Clonar usuario_rol: nuevo key por fila, key_rol apunta al nuevo rol
        SELECT public.clonar_tabla('usuario_rol', 'key_rol', v_old_rol_key,
            jsonb_build_object('key', NULL, 'key_rol', v_new_rol_key))::jsonb
        INTO v_result;
        n_usuario_rol := n_usuario_rol + (v_result->>'filas')::integer;
    END LOOP;

    RETURN json_build_object(
        'status',   'ok',
        'mensaje',  'roles de empresa "' || _key_empresa_from || '" clonados a "' || _key_empresa_to || '"',
        'clonados', jsonb_build_object(
            'rol',         n_rol,
            'rol_permiso', n_rol_permiso,
            'usuario_rol', n_usuario_rol
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
-- Name: get_all(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all(_nombre_tabla character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'SELECT
                jsonb_object_agg(sq.key, to_json(sq.*))::json as json 
				FROM (
                    SELECT *
					FROM '||_nombre_tabla||E'
					WHERE estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all(_nombre_tabla character varying) OWNER TO postgres;

--
-- Name: get_all(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all(_nombre_tabla character varying, _nombre_filtro character varying, _filtro character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT
                jsonb_object_agg(sq.key, to_json(sq.*))::json as json 
				FROM (
                    SELECT *
					FROM '||_nombre_tabla||E' 
					WHERE '||_nombre_filtro||E' = \''||_filtro||E'\'
					AND estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all(_nombre_tabla character varying, _nombre_filtro character varying, _filtro character varying) OWNER TO postgres;

--
-- Name: get_all_permiso_info(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_permiso_info(_key_servicio character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'SELECT
                jsonb_object_agg(sq.key_permiso, to_json(sq.*))::json as json 
				FROM (
				
                    SELECT permiso_info.*
					FROM permiso_info,
					permiso,
					page
					WHERE permiso_info.estado > 0
					and permiso_info.key_permiso = permiso.key
					and permiso.estado > 0
					and permiso.key_page = page.key
					and page.estado > 0
					and page.key_servicio = \''||_key_servicio||E'\'
					
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_permiso_info(_key_servicio character varying) OWNER TO postgres;

--
-- Name: get_all_usuario_rol(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_usuario_rol(_key_servicio character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'SELECT
                jsonb_object_agg(sq.key, to_json(sq.*))::json as json 
				FROM (
                    SELECT usuario_rol.*
					FROM usuario_rol,
					rol
					WHERE usuario_rol.estado > 0
					and rol.key = usuario_rol.key_rol
					and rol.key_servicio = \''||_key_servicio||E'\'
					and rol.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_usuario_rol(_key_servicio character varying) OWNER TO postgres;

--
-- Name: get_by(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_by(_nombre_tabla character varying, _key character varying, _value character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN
    s_consulta :=format(' SELECT to_json(sq.*) as json 
				FROM (
                    SELECT * 
					FROM '||_nombre_tabla||E'
					WHERE '||_key||E' = \''||_value||E'\'
					AND estado > 0
				) sq
					');
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.get_by(_nombre_tabla character varying, _key character varying, _value character varying) OWNER TO postgres;

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
    s_consulta :=format(' SELECT
                to_json(sq.*) as json 
				FROM (
                    SELECT
                        .* 
					FROM FROM '||_nombre_tabla||E'
					WHERE key = FROM '||_key||E'
					AND estado > 0
				) sq
					');
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.get_by_key(_nombre_tabla character varying, _key character varying) OWNER TO postgres;

--
-- Name: registros_por_rol(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.registros_por_rol(_key_service character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'SELECT array_to_json(array_agg(tabla.*))::json AS json
			FROM (
				SELECT 
					rol.key,
					rol.descripcion,
					(
						SELECT COUNT(*)
						FROM usuario_rol
						WHERE usuario_rol.key_rol = rol.key
						    AND usuario_rol.estado > 0	
					) AS cantidad
				FROM rol
				WHERE key_servicio = \''||_key_servicio||E'\'
				  AND rol.estado > 0
				ORDER BY rol.descripcion
			)
			  tabla';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.registros_por_rol(_key_service character varying) OWNER TO postgres;

--
-- Name: registros_por_rol(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.registros_por_rol(_nombre_filtro character varying, _filtro character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'SELECT array_to_json(array_agg(tabla.*))::json AS json
			FROM (
				SELECT 
					rol.key,
					rol.descripcion,
					(
						SELECT COUNT(*)
						FROM usuario_rol
						WHERE usuario_rol.key_rol = rol.key
						    AND usuario_rol.estado > 0	
					) AS cantidad
				FROM rol
				WHERE '||_nombre_filtro||E' = \''||_filtro||E'\'
				  AND rol.estado > 0
				ORDER BY rol.descripcion
			)
			  tabla';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.registros_por_rol(_nombre_filtro character varying, _filtro character varying) OWNER TO postgres;

--
-- Name: rol_get_all(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.rol_get_all(_key_usuario character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT
                jsonb_object_agg(sq.key, to_json(sq.*))::json as json 
				FROM (
                    select rol.*
					from usuario_rol,
					rol
					where usuario_rol.key_usuario = \''||_key_usuario||E'\'
					and rol.key = usuario_rol.key_rol
					and usuario_rol.estado > 0
					and rol.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.rol_get_all(_key_usuario character varying) OWNER TO postgres;

--
-- Name: usuario_page_get_all(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.usuario_page_get_all(_key_usuario character varying) RETURNS SETOF character varying
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
                jsonb_object_agg(sq.url, to_json(sq.*))::json as json 
				FROM (
                    select page.key,
					page.descripcion,
					page.estado,
					page.fecha_on,
					page.key_servicio,
					page.style,
					page.index,
					page.url,
					page.is_page,
					jsonb_object_agg(permiso.type,to_json(permiso.*)) as permisos
					from usuario_rol,
					rol,
					rol_permiso,
					permiso,
					page
					where usuario_rol.key_usuario = %L
					and rol_permiso.key_rol = usuario_rol.key_rol
					and permiso.key = rol_permiso.key_permiso
					and page.key = permiso.key_page
					and usuario_rol.estado > 0
					and rol_permiso.estado > 0
					and rol.key = usuario_rol.key_rol
				  	and rol.estado > 0
					and permiso.estado > 0
					and page.estado > 0
					group by page.key,
					page.descripcion,
					page.estado,
					page.index,
					page.fecha_on,
					page.key_servicio,
					page.style,
					page.url,
					page.is_page
				) sq
				
					',_key_usuario);
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.usuario_page_get_all(_key_usuario character varying) OWNER TO postgres;

--
-- Name: usuario_page_get_all(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.usuario_page_get_all(_key_usuario character varying, _key_empresa character varying) RETURNS SETOF character varying
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
                jsonb_object_agg(sq.url, to_json(sq.*))::json as json 
				FROM (
                    select page.key,
					page.descripcion,
					page.estado,
					page.fecha_on,
					page.key_servicio,
					page.style,
					page.index,
					page.url,
					page.is_page,
					jsonb_object_agg(permiso.type,to_json(permiso.*)) as permisos
					from usuario_rol,
					rol,
					rol_permiso,
					permiso,
					page
					where usuario_rol.key_usuario = %L
					and rol.key_empresa = %L
					and rol_permiso.key_rol = usuario_rol.key_rol
					and permiso.key = rol_permiso.key_permiso
					and page.key = permiso.key_page
					and usuario_rol.estado > 0
					and rol_permiso.estado > 0
					and rol.key = usuario_rol.key_rol
				  	and rol.estado > 0
					and permiso.estado > 0
					and page.estado > 0
					group by page.key,
					page.descripcion,
					page.estado,
					page.index,
					page.fecha_on,
					page.key_servicio,
					page.style,
					page.url,
					page.is_page
				) sq
				
					',_key_usuario, _key_empresa);
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.usuario_page_get_all(_key_usuario character varying, _key_empresa character varying) OWNER TO postgres;

--
-- Name: usuario_page_get_all_rol(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.usuario_page_get_all_rol(_key_rol character varying) RETURNS SETOF character varying
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
                jsonb_object_agg(sq.url, to_json(sq.*))::json as json 
				FROM (
                   select page.key,
					page.descripcion,
					page.estado,
					page.fecha_on,
					page.key_servicio,
					page.style,
					page.index,
					page.url,
					page.is_page,
					jsonb_object_agg(permiso.type,to_json(permiso.*)) as permisos
					from
					rol_permiso,
					permiso,
					page
					where rol_permiso.key_rol = %L
					and permiso.key = rol_permiso.key_permiso
					and page.key = permiso.key_page
					and rol_permiso.estado > 0
					and permiso.estado > 0
					and page.estado > 0
					group by page.key,
					page.descripcion,
					page.estado,
					page.index,
					page.fecha_on,
					page.key_servicio,
					page.style,
					page.url,
					page.is_page
				) sq
				
					',_key_rol);
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.usuario_page_get_all_rol(_key_rol character varying) OWNER TO postgres;

--
-- Name: usuario_rol_by_usuarios(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.usuario_rol_by_usuarios(_keys_usuarios character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'
WITH keys AS (
  SELECT jsonb_array_elements_text(\''||_keys_usuarios||E'\') AS key_usuario
)
SELECT jsonb_object_agg(sq2.key_usuario,sq2.data) as json
FROM (
SELECT 
  sq1.key_usuario,
  array_to_json(array_agg(sq1.*)) AS data
FROM (
  SELECT 
    usuario_rol.* , 
    to_json(rol.*) AS rol
  FROM 
    usuario_rol 
    JOIN rol ON rol.key = usuario_rol.key_rol
  WHERE 
    usuario_rol.key_usuario IN (SELECT key_usuario FROM keys)
    AND usuario_rol.estado > 0
) sq1
GROUP BY 
  sq1.key_usuario
) sq2
';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.usuario_rol_by_usuarios(_keys_usuarios character varying) OWNER TO postgres;

--
-- Name: usuarios_permisos_get_all(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.usuarios_permisos_get_all(_key_permiso character varying, _key_servicio character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT
                jsonb_object_agg(sq.key_usuario, to_json(sq.*))::json as json 
				FROM (
                    select usuario_rol.*
					from usuario_rol,
					rol,
					rol_permiso
					where rol.key = usuario_rol.key_rol
					and rol_permiso.key_rol = rol.key
					and rol_permiso.key_permiso = \''||_key_permiso||E'\'
					and rol.key_servicio = \''||_key_servicio||E'\'
					and usuario_rol.estado > 0
					and rol.estado > 0
					and rol_permiso.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.usuarios_permisos_get_all(_key_permiso character varying, _key_servicio character varying) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: historico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historico (
    key character varying NOT NULL,
    key_usuario character varying,
    key_aux character varying,
    descripcion character varying,
    data character varying,
    fecha_on timestamp without time zone,
    estado integer
);


ALTER TABLE public.historico OWNER TO postgres;

--
-- Name: page; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.page (
    key character varying NOT NULL,
    descripcion character varying,
    fecha_on timestamp without time zone,
    estado integer,
    url character varying,
    style character varying,
    key_servicio character varying,
    is_page boolean,
    index integer
);


ALTER TABLE public.page OWNER TO postgres;

--
-- Name: permiso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permiso (
    key character varying NOT NULL,
    descripcion character varying,
    type character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_page character varying
);


ALTER TABLE public.permiso OWNER TO postgres;

--
-- Name: permiso_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permiso_info (
    key character varying,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    key_permiso character varying
);


ALTER TABLE public.permiso_info OWNER TO postgres;

--
-- Name: rol; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rol (
    key character varying NOT NULL,
    descripcion character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_servicio character varying,
    is_admin boolean,
    key_empresa character varying,
    tipo character varying,
    observacion character varying,
    index integer,
    color character varying
);


ALTER TABLE public.rol OWNER TO postgres;

--
-- Name: rol_permiso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rol_permiso (
    key character varying NOT NULL,
    key_rol character varying NOT NULL,
    key_permiso character varying NOT NULL,
    fecha_on timestamp without time zone,
    estado integer
);


ALTER TABLE public.rol_permiso OWNER TO postgres;

--
-- Name: tipo_widget; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_widget (
    key character varying NOT NULL,
    descripcion character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_servicio character varying,
    key_page character varying,
    data json
);


ALTER TABLE public.tipo_widget OWNER TO postgres;

--
-- Name: usuario_rol; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario_rol (
    key character varying NOT NULL,
    key_usuario character varying NOT NULL,
    key_rol character varying NOT NULL,
    fecha_on timestamp without time zone,
    fecha_off timestamp without time zone,
    estado integer,
    key_empresa character varying
);


ALTER TABLE public.usuario_rol OWNER TO postgres;

--
-- Name: widget; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.widget (
    key character varying NOT NULL,
    descripcion character varying,
    fecha_on timestamp without time zone,
    estado integer,
    url character varying,
    style character varying,
    key_servicio character varying,
    key_empresa character varying,
    key_usuario character varying,
    index integer,
    x double precision,
    y double precision,
    w double precision,
    h double precision,
    type character varying,
    data json,
    key_page character varying
);


ALTER TABLE public.widget OWNER TO postgres;

--
-- Name: historico historico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico
    ADD CONSTRAINT historico_pkey PRIMARY KEY (key);


--
-- Name: page page_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page
    ADD CONSTRAINT page_pkey PRIMARY KEY (key);


--
-- Name: permiso permiso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permiso
    ADD CONSTRAINT permiso_pkey PRIMARY KEY (key);


--
-- Name: rol_permiso rol_permiso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_permiso
    ADD CONSTRAINT rol_permiso_pkey PRIMARY KEY (key);


--
-- Name: rol rol_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol
    ADD CONSTRAINT rol_pkey PRIMARY KEY (key);


--
-- Name: tipo_widget tipo_widget_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_widget
    ADD CONSTRAINT tipo_widget_pkey PRIMARY KEY (key);


--
-- Name: usuario_rol usuario_rol_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT usuario_rol_pkey PRIMARY KEY (key);


--
-- Name: widget widget_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.widget
    ADD CONSTRAINT widget_pkey PRIMARY KEY (key);


--
-- Name: widget fk_page_key_page; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.widget
    ADD CONSTRAINT fk_page_key_page FOREIGN KEY (key_page) REFERENCES public.page(key) NOT VALID;


--
-- Name: permiso fk_permiso_key_page; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permiso
    ADD CONSTRAINT fk_permiso_key_page FOREIGN KEY (key_page) REFERENCES public.page(key);


--
-- Name: rol_permiso fk_rol_permiso_key:_permiso; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_permiso
    ADD CONSTRAINT "fk_rol_permiso_key:_permiso" FOREIGN KEY (key_permiso) REFERENCES public.permiso(key);


--
-- Name: rol_permiso fk_rol_permiso_key:_rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_permiso
    ADD CONSTRAINT "fk_rol_permiso_key:_rol" FOREIGN KEY (key_rol) REFERENCES public.rol(key);


--
-- Name: usuario_rol fk_usuario_rol_key_rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT fk_usuario_rol_key_rol FOREIGN KEY (key_rol) REFERENCES public.rol(key);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 4Xn3AatoBGcrkvigPWn320cPj3aYT1Zm8c6vJxpzy33dgshDKFj9hC31tMh1RBD

