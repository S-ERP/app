--
-- PostgreSQL database dump
--

\restrict yCxHyamsZoaHPh7TWe3aCXU00pEA53eORKe4W9j5VY9Pyix2HoGh50AQaZhaQcw

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
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: _historial_usuario(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._historial_usuario(key_usuario_buscador character varying) RETURNS SETOF character varying
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
 
	select jsonb_object_agg(sq.tipo,to_json(sq.*)) as json
					from (
					
					(select
 \'editor\' as tipo,
historico.key_usuario as key_usuario,
historico.fecha_on,
historico.key_aux as a
from
historico
where
historico.descripcion = \'usuarioV2_editar\'
and historico.key_aux= \''||key_usuario_buscador||E'\'  
ORDER BY fecha_on DESC
LIMIT 1)
UNION ALL
(select
 \'creador\' as tipo,
historico.key_usuario as key_usuario,
historico.fecha_on ,
historico.key_aux as a
from
historico
where
historico.descripcion = \'usuarioV2_registro\'
and historico.key_aux= \''||key_usuario_buscador||E'\' 
ORDER BY fecha_on asc
LIMIT 1
)
 
					
					
					) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public._historial_usuario(key_usuario_buscador character varying) OWNER TO postgres;

--
-- Name: buscar_usuario(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.buscar_usuario(_buscador character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN
    s_consulta :=E'select jsonb_object_agg(sq.key,to_json(sq.datos)) as json
					from (
					select usuario.key,
					(
						select jsonb_object_agg(dato.descripcion,usuario_dato.dato)
						from usuario_dato,
						dato
						where usuario_dato.key_dato = dato.key
						and usuario_dato.key_usuario = usuario.key

					) datos
					from  usuario_dato,
					dato,
					usuario
					where upper(usuario_dato.dato) like upper(\'%'||_buscador||E'%\')
					and dato.key = usuario_dato.key_dato
					and dato.login = true
					and usuario.key = usuario_dato.key_usuario
					group by usuario.key
					) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.buscar_usuario(_buscador character varying) OWNER TO postgres;

--
-- Name: buscar_usuario(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.buscar_usuario(_buscador character varying, _key_servicio character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN
    s_consulta :=E'select jsonb_object_agg(sq.key,to_json(sq.datos)) as json
					from (
					select usuario.key,
					(
						select jsonb_object_agg(dato.descripcion,usuario_dato.dato)
						from usuario_dato,
						dato
						where usuario_dato.key_dato = dato.key
						and usuario_dato.key_usuario = usuario.key

					) datos
					from  usuario_dato,
					dato,
					usuario
					where upper(usuario_dato.dato) like upper(\''||_buscador||E'\')
					and dato.key = usuario_dato.key_dato
					and dato.login = true
					and usuario.key = usuario_dato.key_usuario
					and dato.key_servicio like \''||_key_servicio||E'\'
					group by usuario.key
					) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.buscar_usuario(_buscador character varying, _key_servicio character varying) OWNER TO postgres;

--
-- Name: clase1(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clase1() RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta character varying;
    s_consulta character varying;
BEGIN
    s_consulta := E'
		select 
	jsonb_object_agg(usuario.key,to_json(usuario.*)) as json
	from 
		(
		select usuario.*, \'123\' as apodo from usuario
		) usuario
	';
   	EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.clase1() OWNER TO postgres;

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
-- Name: eliminar_usuario(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.eliminar_usuario(_key_usuario character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN
     EXECUTE format('DELETE FROM historico_dato
						 WHERE key IN (
						 SELECT 
    historico_dato.key
FROM 
    historico_dato,
    usuario_dato
WHERE 
    historico_dato.key_dato = usuario_dato.key
AND usuario_dato.key_usuario = %L )' ,_key_usuario);
	
  EXECUTE E'delete from recuperacion_pass
			where recuperacion_pass.key in (
			select recuperacion_pass.key
			from 
				recuperacion_pass,
				usuario_dato
			where 
				recuperacion_pass.key_usuario_dato = usuario_dato.key
				and usuario_dato.key_usuario = \''||_key_usuario||E'\'
	)';

  EXECUTE format('DELETE FROM 
						 usuario_dato
						 WHERE 
						 key_usuario = %L' ,_key_usuario);
						 
  EXECUTE format('DELETE FROM 
						 usuario
						 WHERE 
						 key = %L' ,_key_usuario);	
						 
	respuesta:='exito';
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.eliminar_usuario(_key_usuario character varying) OWNER TO postgres;

--
-- Name: get_all_cis(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_cis(_phones character varying) RETURNS SETOF character varying
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
					select usuario.key,
					v2_get_usuario_key(usuario.key)::json usuario
					from usuario,
					usuario_dato,
					dato
					where usuario.key = usuario_dato.key_usuario
					and usuario_dato.key_dato = dato.key
					and usuario_dato.dato in (
						select jsonb_array_elements_text(\''|| _phones ||E'\')
					)
					and dato.descripcion = \'CI\'
					and usuario.estado > 0
					and usuario_dato.estado > 0
					and dato.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_cis(_phones character varying) OWNER TO postgres;

--
-- Name: get_all_keys(json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_keys(_keys json) RETURNS SETOF character varying
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
					select usuario.key,
					v2_get_usuario_key(usuario.key)::json usuario
					from usuario
					where usuario.key in '|| _keys ||E'::jsonb
					and usuario.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_keys(_keys json) OWNER TO postgres;

--
-- Name: get_all_keys(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_keys(_keys character varying) RETURNS SETOF character varying
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
					select usuario.key,
					v2_get_usuario_key(usuario.key)::json usuario
					from usuario
					where usuario.key in (
						select jsonb_array_elements_text(\''|| _keys ||E'\')
					)
					and usuario.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_keys(_keys character varying) OWNER TO postgres;

--
-- Name: get_all_mails(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_mails(_phones character varying) RETURNS SETOF character varying
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
					select usuario.key,
					v2_get_usuario_key(usuario.key)::json usuario
					from usuario,
					usuario_dato,
					dato
					where usuario.key = usuario_dato.key_usuario
					and usuario_dato.key_dato = dato.key
					and usuario_dato.dato in (
						select jsonb_array_elements_text(\''|| _phones ||E'\')
					)
					and dato.descripcion = \'Correo\'
					and usuario.estado > 0
					and usuario_dato.estado > 0
					and dato.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_mails(_phones character varying) OWNER TO postgres;

--
-- Name: get_all_phones(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_phones(_phones character varying) RETURNS SETOF character varying
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
					select usuario.key,
					v2_get_usuario_key(usuario.key)::json usuario
					from usuario,
					usuario_dato,
					dato
					where usuario.key = usuario_dato.key_usuario
					and usuario_dato.key_dato = dato.key
					and usuario_dato.dato in (
						select jsonb_array_elements_text(\''|| _phones ||E'\')
					)
					and dato.descripcion = \'Telefono\'
					and usuario.estado > 0
					and usuario_dato.estado > 0
					and dato.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_phones(_phones character varying) OWNER TO postgres;

--
-- Name: get_all_usuarios(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_usuarios(_cabecera character varying, _key_servicio character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN
    s_consulta := '';
    s_consulta := format('SELECT array_to_json(array_agg(query1.*))
FROM (
	SELECT
    usuario.key,
    to_json(usuario.*) as usuario,
    jsonb_object_agg(dato.descripcion, to_json(usuario_dato.*)) as data
FROM
    usuario,
    usuario_dato,
    dato,
    dato_dato_cabecera,
    dato_cabecera
WHERE
    usuario_dato.key_usuario = usuario.key
    AND usuario_dato.key_dato = dato.key
    AND dato_dato_cabecera.key_dato = dato.key
    AND dato_cabecera.key = dato_dato_cabecera.key_dato_cabecera
    AND UPPER(dato_cabecera.key_servicio)
    LIKE UPPER(%L)
    AND UPPER(dato_cabecera.descripcion)
    LIKE UPPER(%L)
GROUP BY (usuario.key)
	) query1', _key_servicio, _cabecera);
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.get_all_usuarios(_cabecera character varying, _key_servicio character varying) OWNER TO postgres;

--
-- Name: get_all_usuarios_cabecera(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_usuarios_cabecera(_cabecera character varying, _key_servicio character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN
    s_consulta := '';
    s_consulta := format('SELECT array_to_json(array_agg(query1.*))
FROM (
	SELECT
    usuario.key,
    to_json(usuario.*) as usuario,
    jsonb_object_agg(dato.descripcion, to_json(usuario_dato.*)) as data
FROM
    usuario,
    usuario_dato,
    dato,
    dato_dato_cabecera,
    dato_cabecera
WHERE
    usuario_dato.key_usuario = usuario.key
    AND usuario_dato.key_dato = dato.key
    AND dato_dato_cabecera.key_dato = dato.key
    AND dato_cabecera.key = dato_dato_cabecera.key_dato_cabecera
    AND UPPER(dato_cabecera.key_servicio)
    LIKE UPPER(%L)
    AND UPPER(dato_cabecera.descripcion)
    LIKE UPPER(%L)
	AND usuario.key_cabecera = dato_cabecera.key
GROUP BY (usuario.key)
	) query1', _key_servicio, _cabecera);
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.get_all_usuarios_cabecera(_cabecera character varying, _key_servicio character varying) OWNER TO postgres;

--
-- Name: get_cantidad_usuarios(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_cantidad_usuarios(_key_cabecera character varying) RETURNS SETOF integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN
     EXECUTE format('select 
    count(usuario.key) as cantidad
from 
    dato_cabecera dc1,
    dato_cabecera dc2,
    usuario
    where dc1.key = %L
    and dc2.key_servicio = dc1.key_servicio
    and usuario.key_cabecera = dc2.key
' ,_key_cabecera) INTO cant_in;

    RETURN NEXT cant_in;
END;
$$;


ALTER FUNCTION public.get_cantidad_usuarios(_key_cabecera character varying) OWNER TO postgres;

--
-- Name: get_dato(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_dato(_key_servicio character varying, _cabecera character varying, _dato character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'select to_json(tabla.*) as json
from (
	select 
	dato_cabecera.key as key_cabecera,
	dato.*
	from dato_cabecera,
	dato_dato_cabecera,
	dato
	where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
	and dato_cabecera.descripcion = \''||_cabecera||E'\'
	and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	and dato_dato_cabecera.key_dato = dato.key
	and dato.descripcion = \''||_dato||E'\'
) tabla
	';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_dato(_key_servicio character varying, _cabecera character varying, _dato character varying) OWNER TO postgres;

--
-- Name: get_dato_usuario(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_dato_usuario(_tipo_dato character varying, _key_usuario character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN
    s_consulta := '';
    s_consulta := format('SELECT
    to_json(sq1.*) as json
    from 
(SELECT
   to_json( usuario_dato.*) as usuario_dato,
    to_json(dato.*) as dato,
    to_json(tipo_dato_cabecera.*)as tipo_dato_cabecera,
    to_json(tipo_dato.*)as tipo_dato 
FROM
    usuario_dato,
    dato,
    tipo_dato_cabecera,
    tipo_dato
WHERE
    usuario_dato.key_usuario = %L
    AND dato.key = usuario_dato.key_dato
    AND dato.key_tipo_dato_cabecera = tipo_dato_cabecera.key
    AND tipo_dato_cabecera.key_tipo_dato = tipo_dato.key
    AND tipo_dato.descripcion = %L
) sq1', _key_usuario,_tipo_dato);
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.get_dato_usuario(_tipo_dato character varying, _key_usuario character varying) OWNER TO postgres;

--
-- Name: get_datos(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_datos(_key_servicio character varying, _cabecera character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'select array_to_json(array_agg(tabla.*)) as json
from (
	select 
	dato_cabecera.key as key_cabecera,
	dato.*
	from dato_cabecera,
	dato_dato_cabecera,
	dato
	where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
	and dato_cabecera.descripcion = \''||_cabecera||E'\'
	and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	and dato_dato_cabecera.key_dato = dato.key
) tabla
	';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_datos(_key_servicio character varying, _cabecera character varying) OWNER TO postgres;

--
-- Name: get_datos_usuario_by_key(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_datos_usuario_by_key(_key_usuario character varying, _cabecera character varying, _key_servicio character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN
    s_consulta := '';
    s_consulta := format('SELECT
     array_to_json(array_agg(sq.*)) AS json
FROM (
    SELECT
        sq2.key_usuario,
          (' || chr(39) || '{' || chr(39) || ' || sq2.json::varchar||' || chr(39) || ' }' || chr(39) || ') AS data
    FROM (
        SELECT
            sq1.key_usuario,
            string_agg(sq1.json, ' || chr(39) || ',' || chr(39) || ') AS json
        FROM (
            SELECT
                json.key_usuario,
                (
                    SELECT
                        (string_agg(' || chr(39) || '\"' || chr(39) || ' || KEY || ' || chr(39) || '\" :' || chr(39) || ' || value, ' || chr(39) || ', ' || chr(39) || ') )
                                      FROM (
										  SELECT                           *
                                          FROM
											json_each(' || chr(39) || '{ }' || chr(39) || ')
                            UNION ALL
                            SELECT
                                json.descripcion, json.valor) t) AS json
                    FROM (
                       SELECT
                            json.key_usuario,
                            json.descripcion,
                            to_json(json.*) AS valor
                        FROM (
                            SELECT
                                dt.key AS key_dato,
                                dt.descripcion,
                                usuario_dato.*,
                                ddc.posicion
                            FROM
                                dato_dato_cabecera ddc,
                                dato dt,
                                dato_cabecera dc,
                                usuario_dato
                            WHERE
                                ddc.key_dato = dt.key
                                AND usuario_dato.key_dato = dt.key
                                AND dc.key = ddc.key_dato_cabecera
                                AND usuario_dato.key_usuario LIKE %L
                                AND UPPER(dc.key_servicio)
                                LIKE UPPER(%L)
                                AND UPPER(dc.descripcion)
                                LIKE UPPER(%L)
                                AND ddc.estado = 1
                                AND dt.estado = 1
                            GROUP BY
                                dt.key,
                                dt.descripcion,
                                usuario_dato.dato,
                                usuario_dato.key_usuario,
                                ddc.posicion,
                                usuario_dato.key
                            ORDER BY
                                ddc.posicion ASC) json) json) sq1
                     GROUP BY
                    (sq1.key_usuario)
                    ) sq2
 					) sq', _key_usuario, _key_servicio, _cabecera);
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.get_datos_usuario_by_key(_key_usuario character varying, _cabecera character varying, _key_servicio character varying) OWNER TO postgres;

--
-- Name: get_historico_dato_key(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_historico_dato_key(_key_dato character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN
    s_consulta := '';
    s_consulta := format('select array_to_json(array_agg(historico_dato.*))
						from 
					    historico_dato
						where 
					    historico_dato.key_dato = %L'
						 , _key_dato);
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.get_historico_dato_key(_key_dato character varying) OWNER TO postgres;

--
-- Name: get_key_login(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_key_login(_login character varying, _key_servicio character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'select tabla.key_usuario
from 
	(
		select usuario_dato.key_usuario,
		dato.descripcion, 
		usuario_dato.dato,
		tipo_dato.descripcion as tipo_dato,
		dato.login
		from dato_cabecera,
		dato_dato_cabecera,
		dato,
		usuario_dato,
		usuario,
		tipo_dato_cabecera,
		tipo_dato
		where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
		and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
		and dato_dato_cabecera.key_dato = dato.key
		and tipo_dato_cabecera.key = dato.key_tipo_dato_cabecera
		and tipo_dato.key = tipo_dato_cabecera.key_tipo_dato
		and usuario_dato.key_dato = dato.key
		and usuario_dato.key_usuario = usuario.key
	) tabla
	where tabla.login = true 
	and upper(tabla.dato) = upper(\''||_login||E'\')
	';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_key_login(_login character varying, _key_servicio character varying) OWNER TO postgres;

--
-- Name: get_login(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_login(_key_servicio character varying, _login character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'select tabla.key_usuario
from 
	(
		select usuario_dato.key_usuario,
		dato.descripcion, 
		usuario_dato.dato,
		tipo_dato.descripcion as tipo_dato,
		dato.login
		from dato_cabecera,
		dato_dato_cabecera,
		dato,
		usuario_dato,
		usuario,
		tipo_dato_cabecera,
		tipo_dato
		where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
		and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
		and dato_dato_cabecera.key_dato = dato.key
		and tipo_dato_cabecera.key = dato.key_tipo_dato_cabecera
		and tipo_dato.key = tipo_dato_cabecera.key_tipo_dato
		and usuario_dato.key_dato = dato.key
		and usuario_dato.key_usuario = usuario.key
	) tabla
	where tabla.login = true 
	and upper(tabla.dato) = upper(\''||_login||E'\')
) tabla
	';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_login(_key_servicio character varying, _login character varying) OWNER TO postgres;

--
-- Name: get_tipos_loguin(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_tipos_loguin(_login character varying, _key_servicio character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'
		select jsonb_object_agg(sq.key, to_json(sq.*))::json as json
		from (
			select dato.*,
			usuario_dato.key_usuario
			from dato_cabecera,
			dato_dato_cabecera,
			dato,
			tipo_dato_cabecera,
			tipo_dato,
			usuario_dato
			where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
			and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
			and dato_dato_cabecera.key_dato = dato.key
			and tipo_dato_cabecera.key = dato.key_tipo_dato_cabecera
			and tipo_dato.key = tipo_dato_cabecera.key_tipo_dato
			and dato.login = true 
			and usuario_dato.key_dato = dato.key
			and usuario_dato.dato = \''||_login||E'\'
		) sq
	';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_tipos_loguin(_login character varying, _key_servicio character varying) OWNER TO postgres;

--
-- Name: parse_arr_to_json(json[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.parse_arr_to_json(array_json json[]) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN
    s_consulta := '';
    -- s_consulta := format('');
    -- EXECUTE s_consulta INTO respuesta;
    RETURN NEXT s_consulta;
END;
$$;


ALTER FUNCTION public.parse_arr_to_json(array_json json[]) OWNER TO postgres;

--
-- Name: parse_arr_to_json(json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.parse_arr_to_json(array_json json) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    json_temp RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN
    s_consulta := '';
        FOR rec IN execute 'select json_array_elements(' || chr(39) || array_json || chr(39) || ')' LOOP
            EXECUTE format('select %L','a') into json_temp;
        END LOOP;
    -- s_consulta := format('');
    -- EXECUTE s_consulta INTO respuesta;
    RETURN NEXT s_consulta;
END;
$$;


ALTER FUNCTION public.parse_arr_to_json(array_json json) OWNER TO postgres;

--
-- Name: parse_arr_to_json(character varying, json, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.parse_arr_to_json(inp_key character varying, inp_valor json, inp_key_usr character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN
    s_consulta := '';
    -- s_consulta := format('');
    -- EXECUTE s_consulta INTO respuesta;
    RETURN NEXT s_consulta;
END;
$$;


ALTER FUNCTION public.parse_arr_to_json(inp_key character varying, inp_valor json, inp_key_usr character varying) OWNER TO postgres;

--
-- Name: recuperar_password_generar(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.recuperar_password_generar(_key_usuario character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN
    s_consulta := '';
    s_consulta := format('SELECT
    to_json(sq1.*) as json
    from 
(SELECT
   to_json( usuario_dato.*) as password,
    to_json(dato.*) as dato,
    to_json(tipo_dato_cabecera.*)as tipo_dato_cabecera,
    to_json(tipo_dato.*)as tipo_dato 
FROM
    usuario_dato,
    dato,
    tipo_dato_cabecera,
    tipo_dato
WHERE
    usuario_dato.key_usuario = %L
    AND dato.key = usuario_dato.key_dato
    AND dato.key_tipo_dato_cabecera = tipo_dato_cabecera.key
    AND tipo_dato_cabecera.key_tipo_dato = tipo_dato.key
    AND tipo_dato.descripcion = %L
) sq1', _key_usuario,'password');
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.recuperar_password_generar(_key_usuario character varying) OWNER TO postgres;

--
-- Name: reset_usuario(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reset_usuario(_key_cabecera character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN
    s_consulta :=E'delete from historico_dato where historico_dato.key_usuario in (
						SELECT usuario.key
						FROM usuario
						where usuario.key_cabecera = \''||_key_cabecera||E'\'
					)';
    EXECUTE s_consulta;
	s_consulta :=E'delete from dato_login where dato_login.key_usuario_dato in (
						select usuario_dato.key
						from usuario_dato
						where usuario_dato.key_usuario in (
							SELECT usuario.key
							FROM usuario
							where usuario.key_cabecera = \''||_key_cabecera||E'\'
						)
					)';
    EXECUTE s_consulta;
	s_consulta :=E'delete from usuario_dato where usuario_dato.key_usuario in (
					SELECT usuario.key
					FROM usuario
					where usuario.key_cabecera = \''||_key_cabecera||E'\'
				)';
    EXECUTE s_consulta;
	s_consulta :=E'delete from historico where historico.key_usuario in (
					SELECT usuario.key
					FROM usuario
					where usuario.key_cabecera = \''||_key_cabecera||E'\'
				)';
    EXECUTE s_consulta;
	s_consulta :=E'delete FROM usuario
					where usuario.key_cabecera = \''||_key_cabecera||E'\'';
    EXECUTE s_consulta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.reset_usuario(_key_cabecera character varying) OWNER TO postgres;

--
-- Name: update_v2(character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_v2(_key_servicio character varying, _cabecera character varying, _key_usuario character varying, _key_dato character varying, _dato character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'
	
	update usuario_dato set dato = \''||_dato||E'\' where key = (
		select usuario_dato.key
		from dato_cabecera,
		dato_dato_cabecera,
		dato,
		usuario_dato,
		usuario
		where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
		and dato_cabecera.descripcion = \''||_cabecera||E'\'
		and usuario_dato.key_usuario = \''||_key_usuario||E'\'
		and dato.descripcion = \''||_key_dato||E'\'
		and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
		and dato_dato_cabecera.key_dato = dato.key
		and usuario_dato.key_dato = dato.key
		and usuario_dato.key_usuario = usuario.key
	)
				';
    --EXECUTE s_consulta INTO respuesta;
	EXECUTE s_consulta;
    RETURN next 'exito';
	
END;
$$;


ALTER FUNCTION public.update_v2(_key_servicio character varying, _cabecera character varying, _key_usuario character varying, _key_dato character varying, _dato character varying) OWNER TO postgres;

--
-- Name: usuario_get_by_key(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.usuario_get_by_key(_key_usuario character varying, _key_servicio character varying) RETURNS SETOF character varying
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
                 to_json(sq.*) as json 
				FROM (
                    select usuario.*,
					(
						select jsonb_object_agg(dato.descripcion,
						usuario_dato.dato)
						from dato_cabecera,
						dato_dato_cabecera,
						dato,
						usuario_dato
						where UPPER(dato_cabecera.key_servicio) LIKE UPPER(\''||_key_servicio||E'\')
						and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
						and dato.key = dato_dato_cabecera.key_dato
						AND usuario_dato.key_dato = dato.key
						and usuario_dato.key_usuario like usuario.key
						and dato_cabecera.estado > 0
						and dato_dato_cabecera.estado > 0
						and dato.estado > 0
					) as datos
					from usuario
					where usuario.key  like \''||_key_usuario||E'\'
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.usuario_get_by_key(_key_usuario character varying, _key_servicio character varying) OWNER TO postgres;

--
-- Name: usuario_recuperarpass_get_key_dato_password(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.usuario_recuperarpass_get_key_dato_password(_key_usuario character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN
    s_consulta := '';
    s_consulta := format('
	select to_json(sq1.*) as json
from (
select 
	usuario.key as key_usuario,
	dato.key as key_dato
from 
	usuario JOIN dato_cabecera ON usuario.key_cabecera = dato_cabecera.key
	JOIN dato_dato_cabecera ON dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	JOIN dato ON dato.key = dato_dato_cabecera.key_dato
	JOIN tipo_dato_cabecera ON dato.key_tipo_dato_cabecera = tipo_dato_cabecera.key
	JOIN tipo_dato ON tipo_dato_cabecera.key_tipo_dato = tipo_dato.key
where 
	usuario.key = %L
AND tipo_dato.descripcion = %L
) sq1
						 ', _key_usuario,'password');
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.usuario_recuperarpass_get_key_dato_password(_key_usuario character varying) OWNER TO postgres;

--
-- Name: v2_get_all(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.v2_get_all(_key_servicio character varying, _cabecera character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'select jsonb_object_agg(tabla.key_usuario,tabla.datos) as json from (
select tabla.key_usuario,
jsonb_object_agg(tabla.descripcion,tabla.dato) datos
from (
	select usuario_dato.key_usuario,
	dato.descripcion, 
	usuario_dato.dato
	from dato_cabecera,
	dato_dato_cabecera,
	dato,
	usuario_dato,
	usuario
	where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
	and dato_cabecera.descripcion like \''||_cabecera||E'\'
	and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	and dato_dato_cabecera.key_dato = dato.key
	and usuario_dato.key_dato = dato.key
	and usuario_dato.key_usuario = usuario.key
	UNION
	select usuario_dato.key_usuario,
	\'estado\' as descripcion, 
	usuario.estado||\'\'  as dato
	from dato_cabecera,
	dato_dato_cabecera,
	dato,
	usuario_dato,
	usuario
	where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
	and dato_cabecera.descripcion like \''||_cabecera||E'\'
	and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	and dato_dato_cabecera.key_dato = dato.key
	and usuario_dato.key_dato = dato.key
	and usuario_dato.key_usuario = usuario.key
	UNION
	select usuario_dato.key_usuario,
	\'key\' as descripcion, 
	usuario.key||\'\'  as dato
	from dato_cabecera,
	dato_dato_cabecera,
	dato,
	usuario_dato,
	usuario
	where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
	and dato_cabecera.descripcion = \''||_cabecera||E'\'
	and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	and dato_dato_cabecera.key_dato = dato.key
	and usuario_dato.key_dato = dato.key
	and usuario_dato.key_usuario = usuario.key
	) tabla
group by tabla.key_usuario
) tabla

				';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.v2_get_all(_key_servicio character varying, _cabecera character varying) OWNER TO postgres;

--
-- Name: v2_get_all(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.v2_get_all(_key_servicio character varying, _cabecera character varying, _fecha_edit character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'select jsonb_object_agg(tabla.key_usuario,tabla.datos) as json from (
select tabla.key_usuario,
jsonb_object_agg(tabla.descripcion,tabla.dato) datos
from (
	select usuario_dato.key_usuario,
	dato.descripcion, 
	usuario_dato.dato
	from dato_cabecera,
	dato_dato_cabecera,
	dato,
	usuario_dato,
	usuario
	where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
	and dato_cabecera.descripcion = \''||_cabecera||E'\'
	and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	and dato_dato_cabecera.key_dato = dato.key
	and usuario_dato.key_dato = dato.key
	and usuario_dato.key_usuario = usuario.key
	and (usuario.fecha_edit > to_timestamp( \''||_fecha_edit||E'\', \'YYYY-MM-DD"T"HH24:MI:SS\') or usuario.fecha_on > to_timestamp( \''||_fecha_edit||E'\', \'YYYY-MM-DD"T"HH24:MI:SS\'))
	UNION
	select usuario_dato.key_usuario,
	\'estado\' as descripcion, 
	usuario.estado||\'\'  as dato
	from dato_cabecera,
	dato_dato_cabecera,
	dato,
	usuario_dato,
	usuario
	where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
	and dato_cabecera.descripcion like \''||_cabecera||E'\'
	and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	and dato_dato_cabecera.key_dato = dato.key
	and usuario_dato.key_dato = dato.key
	and usuario_dato.key_usuario = usuario.key
	and (usuario.fecha_edit > to_timestamp( \''||_fecha_edit||E'\', \'YYYY-MM-DD"T"HH24:MI:SS\') or usuario.fecha_on > to_timestamp( \''||_fecha_edit||E'\', \'YYYY-MM-DD"T"HH24:MI:SS\'))
	UNION
	select usuario_dato.key_usuario,
	\'key\' as descripcion, 
	usuario.key||\'\'  as dato
	from dato_cabecera,
	dato_dato_cabecera,
	dato,
	usuario_dato,
	usuario
	where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
	and dato_cabecera.descripcion like \''||_cabecera||E'\'
	and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	and dato_dato_cabecera.key_dato = dato.key
	and usuario_dato.key_dato = dato.key
	and usuario_dato.key_usuario = usuario.key
	and (usuario.fecha_edit > to_timestamp( \''||_fecha_edit||E'\', \'YYYY-MM-DD"T"HH24:MI:SS\') or usuario.fecha_on > to_timestamp( \''||_fecha_edit||E'\', \'YYYY-MM-DD"T"HH24:MI:SS\'))
	) tabla
group by tabla.key_usuario
) tabla

				';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.v2_get_all(_key_servicio character varying, _cabecera character varying, _fecha_edit character varying) OWNER TO postgres;

--
-- Name: v2_get_all(character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.v2_get_all(_key_servicio character varying, _cabecera character varying, _key_dato character varying, _dato character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'select jsonb_object_agg(tabla.key_usuario,tabla.datos) as json from (
select tabla.key_usuario,
jsonb_object_agg(tabla.descripcion,tabla.dato) datos
from (
	select usuario_dato.key_usuario,
	dato.descripcion, 
	usuario_dato.dato
	from dato_cabecera,
	dato_dato_cabecera,
	dato,
	usuario_dato,
	usuario
	where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
	and dato_cabecera.descripcion = \''||_cabecera||E'\'
	and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	and dato_dato_cabecera.key_dato = dato.key
	and usuario_dato.key_dato = dato.key
	and usuario_dato.key_usuario = usuario.key
	UNION
	select usuario_dato.key_usuario,
	\'estado\' as descripcion, 
	usuario.estado||\'\'  as dato
	from dato_cabecera,
	dato_dato_cabecera,
	dato,
	usuario_dato,
	usuario
	where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
	and dato_cabecera.descripcion = \''||_cabecera||E'\'
	and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	and dato_dato_cabecera.key_dato = dato.key
	and usuario_dato.key_dato = dato.key
	and usuario_dato.key_usuario = usuario.key
	UNION
	select usuario_dato.key_usuario,
	\'key\' as descripcion, 
	usuario.key||\'\'  as dato
	from dato_cabecera,
	dato_dato_cabecera,
	dato,
	usuario_dato,
	usuario
	where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
	and dato_cabecera.descripcion = \''||_cabecera||E'\'
	and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	and dato_dato_cabecera.key_dato = dato.key
	and usuario_dato.key_dato = dato.key
	and usuario_dato.key_usuario = usuario.key
	) tabla
	where tabla.key_usuario in (
		select usuario_dato.key_usuario
		from dato_cabecera,
		dato_dato_cabecera,
		dato,
		usuario_dato,
		usuario
		where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
		and dato_cabecera.descripcion = \''||_cabecera||E'\'
		and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
		and dato_dato_cabecera.key_dato = dato.key
		and usuario_dato.key_dato = dato.key
		and usuario_dato.key_usuario = usuario.key
		and upper(dato.descripcion) = upper(\''||_key_dato||E'\')
		and upper(usuario_dato.dato) like upper(\'%'||_dato||E'%\')
	) 
group by tabla.key_usuario
) tabla

				';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.v2_get_all(_key_servicio character varying, _cabecera character varying, _key_dato character varying, _dato character varying) OWNER TO postgres;

--
-- Name: v2_get_key_login(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.v2_get_key_login(_login character varying, _key_servicio character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'select tabla.key_usuario
from 
	(
		select usuario_dato.key_usuario,
		dato.descripcion, 
		usuario_dato.dato,
		tipo_dato.descripcion as tipo_dato,
		dato.login
		from dato_cabecera,
		dato_dato_cabecera,
		dato,
		usuario_dato,
		usuario,
		tipo_dato_cabecera,
		tipo_dato
		where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
		and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
		and dato_dato_cabecera.key_dato = dato.key
		and tipo_dato_cabecera.key = dato.key_tipo_dato_cabecera
		and tipo_dato.key = tipo_dato_cabecera.key_tipo_dato
		and usuario_dato.key_dato = dato.key
		and usuario_dato.key_usuario = usuario.key
		and usuario.estado > 0
	) tabla
	where tabla.login = true 
	and upper(tabla.dato) = upper(\''||_login||E'\')
	';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.v2_get_key_login(_login character varying, _key_servicio character varying) OWNER TO postgres;

--
-- Name: v2_get_struct_by_servicio(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.v2_get_struct_by_servicio(_key_servicio character varying, _cabecera character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'
SELECT jsonb_object_agg(obj.descripcion,to_json(obj)) as data
FROM(
	SELECT
    dato.key,
    dato.descripcion,
    dato.login,
    dato.requerido,
	dato_cabecera.key as key_cabecera,
    tipo_dato_cabecera.descripcion as tipo_dato_cabecera,
    tipo_dato_cabecera.caducable,
    tipo_dato.descripcion as tipo_dato
FROM 
    dato_cabecera,
    tipo_dato,
    tipo_dato_cabecera,
    dato_dato_cabecera,
    dato
WHERE dato_cabecera.descripcion like \''||_cabecera||E'\'
AND dato_cabecera.key_servicio = \''||_key_servicio||E'\'
AND dato_cabecera.estado = 1
AND dato_cabecera.key = dato_dato_cabecera.key_dato_cabecera
AND dato_dato_cabecera.key_dato = dato.key
AND dato.key_tipo_dato_cabecera = tipo_dato_cabecera.key
AND tipo_dato.key = tipo_dato_cabecera.key_tipo_dato
GROUP BY(dato.key, tipo_dato_cabecera.key, tipo_dato.key,dato_cabecera.key)
) obj
';
    --EXECUTE s_consulta INTO respuesta;
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.v2_get_struct_by_servicio(_key_servicio character varying, _cabecera character varying) OWNER TO postgres;

--
-- Name: v2_get_usuario_key(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.v2_get_usuario_key(_key_usuario character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'select 
jsonb_object_agg(tabla.descripcion,tabla.dato) json
from (
	select usuario_dato.key_usuario,
	dato.descripcion, 
	usuario_dato.dato
	from dato_cabecera,
	dato_dato_cabecera,
	dato,
	usuario_dato,
	usuario
	where dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	and dato_dato_cabecera.key_dato = dato.key
	and usuario_dato.key_dato = dato.key
	and usuario_dato.key_usuario = usuario.key
	and usuario.key = \''||_key_usuario||E'\'
	UNION
	select usuario_dato.key_usuario,
	\'estado\' as descripcion, 
	usuario.estado||\'\'  as dato
	from dato_cabecera,
	dato_dato_cabecera,
	dato,
	usuario_dato,
	usuario
	where dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	and dato_dato_cabecera.key_dato = dato.key
	and usuario_dato.key_dato = dato.key
	and usuario_dato.key_usuario = usuario.key
	and usuario.key = \''||_key_usuario||E'\'
	UNION
	select usuario_dato.key_usuario,
	\'key\' as descripcion, 
	usuario.key||\'\'  as dato
	from dato_cabecera,
	dato_dato_cabecera,
	dato,
	usuario_dato,
	usuario
	where dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	and dato_dato_cabecera.key_dato = dato.key
	and usuario_dato.key_dato = dato.key
	and usuario_dato.key_usuario = usuario.key
	and usuario.key = \''||_key_usuario||E'\'
	UNION
	select usuario_dato.key_usuario,
	\'fecha_on\' as descripcion, 
	usuario.fecha_on||\'\'  as dato
	from dato_cabecera,
	dato_dato_cabecera,
	dato,
	usuario_dato,
	usuario
	where dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	and dato_dato_cabecera.key_dato = dato.key
	and usuario_dato.key_dato = dato.key
	and usuario_dato.key_usuario = usuario.key
	and usuario.key = \''||_key_usuario||E'\'
	) tabla
				';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.v2_get_usuario_key(_key_usuario character varying) OWNER TO postgres;

--
-- Name: v2_get_usuario_key(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.v2_get_usuario_key(_key_servicio character varying, _key_usuario character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'select 
jsonb_object_agg(tabla.descripcion,tabla.dato) json
from (
	select usuario_dato.key_usuario,
	dato.descripcion, 
	usuario_dato.dato
	from dato_cabecera,
	dato_dato_cabecera,
	dato,
	usuario_dato,
	usuario
	where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
	and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	and dato_dato_cabecera.key_dato = dato.key
	and usuario_dato.key_dato = dato.key
	and usuario_dato.key_usuario = usuario.key
	and usuario.key = \''||_key_usuario||E'\'
	UNION
	select usuario_dato.key_usuario,
	\'estado\' as descripcion, 
	usuario.estado||\'\'  as dato
	from dato_cabecera,
	dato_dato_cabecera,
	dato,
	usuario_dato,
	usuario
	where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
	and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	and dato_dato_cabecera.key_dato = dato.key
	and usuario_dato.key_dato = dato.key
	and usuario_dato.key_usuario = usuario.key
	and usuario.key = \''||_key_usuario||E'\'
	UNION
	select usuario_dato.key_usuario,
	\'key\' as descripcion, 
	usuario.key||\'\'  as dato
	from dato_cabecera,
	dato_dato_cabecera,
	dato,
	usuario_dato,
	usuario
	where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
	and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	and dato_dato_cabecera.key_dato = dato.key
	and usuario_dato.key_dato = dato.key
	and usuario_dato.key_usuario = usuario.key
	and usuario.key = \''||_key_usuario||E'\'
	UNION
	select usuario_dato.key_usuario,
	\'fecha_on\' as descripcion, 
	usuario.fecha_on||\'\'  as dato
	from dato_cabecera,
	dato_dato_cabecera,
	dato,
	usuario_dato,
	usuario
	where dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
	and dato_dato_cabecera.key_dato = dato.key
	and usuario_dato.key_dato = dato.key
	and usuario_dato.key_usuario = usuario.key
	and usuario.key = \''||_key_usuario||E'\'
	) tabla
				';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.v2_get_usuario_key(_key_servicio character varying, _key_usuario character varying) OWNER TO postgres;

--
-- Name: v2_valid_pass_login(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.v2_valid_pass_login(_key_usuario character varying, _pass character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'select tabla.key_usuario
from 
	(
		select usuario_dato.key_usuario,
		dato.descripcion, 
		usuario_dato.dato,
		tipo_dato.descripcion as tipo_dato,
		dato.login
		from dato_cabecera,
		dato_dato_cabecera,
		dato,
		usuario_dato,
		usuario,
		tipo_dato_cabecera,
		tipo_dato
		where dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
		and dato_dato_cabecera.key_dato = dato.key
		and tipo_dato_cabecera.key = dato.key_tipo_dato_cabecera
		and tipo_dato.key = tipo_dato_cabecera.key_tipo_dato
		and usuario_dato.key_dato = dato.key
		and usuario_dato.key_usuario = usuario.key
		and usuario.key = \''||_key_usuario||E'\'
	) tabla
	where tabla.tipo_dato = \'password\'
	and upper(tabla.dato) = upper(\''||_pass||E'\')
	';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.v2_valid_pass_login(_key_usuario character varying, _pass character varying) OWNER TO postgres;

--
-- Name: v2_valid_pass_login(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.v2_valid_pass_login(_pass character varying, _key_usuario character varying, _key_servicio character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'select tabla.key_usuario
from 
	(
		select usuario_dato.key_usuario,
		dato.descripcion, 
		usuario_dato.dato,
		tipo_dato.descripcion as tipo_dato,
		dato.login
		from dato_cabecera,
		dato_dato_cabecera,
		dato,
		usuario_dato,
		usuario,
		tipo_dato_cabecera,
		tipo_dato
		where dato_cabecera.key_servicio = \''||_key_servicio||E'\'
		and dato_dato_cabecera.key_dato_cabecera = dato_cabecera.key
		and dato_dato_cabecera.key_dato = dato.key
		and tipo_dato_cabecera.key = dato.key_tipo_dato_cabecera
		and tipo_dato.key = tipo_dato_cabecera.key_tipo_dato
		and usuario_dato.key_dato = dato.key
		and usuario_dato.key_usuario = usuario.key
		usuario.key\''||_key_usuario||E'\'
	) tabla
	where tabla.tipo_dato = \'password\'
	and upper(tabla.dato) = upper(\''||_pass||E'\')
	';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.v2_valid_pass_login(_pass character varying, _key_usuario character varying, _key_servicio character varying) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: dato; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dato (
    key character varying NOT NULL,
    descripcion character varying,
    fecha_on timestamp without time zone,
    requerido boolean,
    key_tipo_dato_cabecera character varying,
    estado integer,
    login boolean,
    key_servicio character varying,
    login_password boolean,
    index integer
);


ALTER TABLE public.dato OWNER TO postgres;

--
-- Name: dato_cabecera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dato_cabecera (
    key character varying NOT NULL,
    descripcion character varying,
    fecha_on timestamp without time zone,
    key_servicio character varying,
    estado integer
);


ALTER TABLE public.dato_cabecera OWNER TO postgres;

--
-- Name: dato_dato_cabecera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dato_dato_cabecera (
    key character varying NOT NULL,
    key_dato_cabecera character varying,
    key_dato character varying,
    fecha_on timestamp without time zone,
    estado integer,
    posicion integer
);


ALTER TABLE public.dato_dato_cabecera OWNER TO postgres;

--
-- Name: historico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historico (
    key character varying NOT NULL,
    key_usuario character varying,
    descripcion character varying,
    data character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_aux character varying
);


ALTER TABLE public.historico OWNER TO postgres;

--
-- Name: historico_dato; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historico_dato (
    key character varying NOT NULL,
    key_usuario character varying,
    nota character varying,
    key_dato character varying,
    fecha timestamp without time zone,
    estado integer,
    dato character varying,
    tipo character varying
);


ALTER TABLE public.historico_dato OWNER TO postgres;

--
-- Name: recuperacion_pass; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recuperacion_pass (
    key character varying NOT NULL,
    key_usuario_dato character varying,
    codigo character varying,
    fecha_on timestamp without time zone,
    estado integer,
    correo character varying
);


ALTER TABLE public.recuperacion_pass OWNER TO postgres;

--
-- Name: tipo_dato; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_dato (
    key character varying NOT NULL,
    descripcion character varying,
    fecha_on timestamp without time zone
);


ALTER TABLE public.tipo_dato OWNER TO postgres;

--
-- Name: tipo_dato_cabecera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_dato_cabecera (
    key character varying NOT NULL,
    descripcion character varying,
    key_tipo_dato character varying,
    fecha_on timestamp without time zone,
    estado integer,
    caducable boolean
);


ALTER TABLE public.tipo_dato_cabecera OWNER TO postgres;

--
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    key character varying NOT NULL,
    fecha_on timestamp without time zone,
    estado integer,
    key_cabecera character varying,
    numero integer,
    fecha_edit timestamp without time zone
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- Name: usuario_dato; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario_dato (
    key character varying NOT NULL,
    key_usuario character varying,
    key_dato character varying,
    dato character varying,
    fecha_on timestamp without time zone,
    fecha_off timestamp without time zone,
    estado integer DEFAULT 0
);


ALTER TABLE public.usuario_dato OWNER TO postgres;

--
-- Name: dato_cabecera dato_cabecera_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dato_cabecera
    ADD CONSTRAINT dato_cabecera_pkey PRIMARY KEY (key);


--
-- Name: dato_dato_cabecera dato_dato_cabecera_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dato_dato_cabecera
    ADD CONSTRAINT dato_dato_cabecera_pkey PRIMARY KEY (key);


--
-- Name: dato dato_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dato
    ADD CONSTRAINT dato_pkey PRIMARY KEY (key);


--
-- Name: historico_dato historico_dato_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_dato
    ADD CONSTRAINT historico_dato_pkey PRIMARY KEY (key);


--
-- Name: historico historico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico
    ADD CONSTRAINT historico_pkey PRIMARY KEY (key);


--
-- Name: recuperacion_pass recuperacion_pass_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recuperacion_pass
    ADD CONSTRAINT recuperacion_pass_pkey PRIMARY KEY (key);


--
-- Name: tipo_dato_cabecera tipo_dato_cabecera_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_dato_cabecera
    ADD CONSTRAINT tipo_dato_cabecera_pkey PRIMARY KEY (key);


--
-- Name: tipo_dato tipo_dato_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_dato
    ADD CONSTRAINT tipo_dato_pkey PRIMARY KEY (key);


--
-- Name: usuario_dato usuario_dato_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_dato
    ADD CONSTRAINT usuario_dato_pkey PRIMARY KEY (key);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (key);


--
-- Name: fki_fk_key_cabecera_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_cabecera_usuario ON public.usuario USING btree (key_cabecera);


--
-- Name: fki_fk_key_dato_cabecera_dato_dato_cabecera; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_dato_cabecera_dato_dato_cabecera ON public.dato_dato_cabecera USING btree (key_dato_cabecera);


--
-- Name: fki_fk_key_dato_dato_dato_cabecera; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_dato_dato_dato_cabecera ON public.dato_dato_cabecera USING btree (key_dato);


--
-- Name: fki_fk_key_dato_historico_dato; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_dato_historico_dato ON public.historico_dato USING btree (key_dato);


--
-- Name: fki_fk_key_dato_usuario_dato; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_dato_usuario_dato ON public.usuario_dato USING btree (key_dato);


--
-- Name: fki_fk_key_tipo_dato_cabecera_dato; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_tipo_dato_cabecera_dato ON public.dato USING btree (key_tipo_dato_cabecera);


--
-- Name: fki_fk_key_tipo_dato_tipo_dato_cabecera; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_tipo_dato_tipo_dato_cabecera ON public.tipo_dato_cabecera USING btree (key_tipo_dato);


--
-- Name: fki_fk_key_usuario_dato_recuperacion_pass; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_usuario_dato_recuperacion_pass ON public.recuperacion_pass USING btree (key_usuario_dato);


--
-- Name: fki_fk_key_usuario_historico_dato; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_usuario_historico_dato ON public.historico_dato USING btree (key_usuario);


--
-- Name: fki_fk_key_usuario_usuario_dato; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_usuario_usuario_dato ON public.usuario_dato USING btree (key_usuario);


--
-- Name: usuario fk_key_cabecera_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT fk_key_cabecera_usuario FOREIGN KEY (key_cabecera) REFERENCES public.dato_cabecera(key) NOT VALID;


--
-- Name: dato_dato_cabecera fk_key_dato_cabecera_dato_dato_cabecera; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dato_dato_cabecera
    ADD CONSTRAINT fk_key_dato_cabecera_dato_dato_cabecera FOREIGN KEY (key_dato_cabecera) REFERENCES public.dato_cabecera(key) NOT VALID;


--
-- Name: dato_dato_cabecera fk_key_dato_dato_dato_cabecera; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dato_dato_cabecera
    ADD CONSTRAINT fk_key_dato_dato_dato_cabecera FOREIGN KEY (key_dato) REFERENCES public.dato(key) NOT VALID;


--
-- Name: historico_dato fk_key_dato_historico_dato; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_dato
    ADD CONSTRAINT fk_key_dato_historico_dato FOREIGN KEY (key_dato) REFERENCES public.usuario_dato(key) NOT VALID;


--
-- Name: usuario_dato fk_key_dato_usuario_dato; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_dato
    ADD CONSTRAINT fk_key_dato_usuario_dato FOREIGN KEY (key_dato) REFERENCES public.dato(key) NOT VALID;


--
-- Name: dato fk_key_tipo_dato_cabecera_dato; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dato
    ADD CONSTRAINT fk_key_tipo_dato_cabecera_dato FOREIGN KEY (key_tipo_dato_cabecera) REFERENCES public.tipo_dato_cabecera(key) NOT VALID;


--
-- Name: tipo_dato_cabecera fk_key_tipo_dato_tipo_dato_cabecera; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_dato_cabecera
    ADD CONSTRAINT fk_key_tipo_dato_tipo_dato_cabecera FOREIGN KEY (key_tipo_dato) REFERENCES public.tipo_dato(key) NOT VALID;


--
-- Name: recuperacion_pass fk_key_usuario_dato_recuperacion_pass; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recuperacion_pass
    ADD CONSTRAINT fk_key_usuario_dato_recuperacion_pass FOREIGN KEY (key_usuario_dato) REFERENCES public.usuario_dato(key) NOT VALID;


--
-- Name: historico_dato fk_key_usuario_historico_dato; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_dato
    ADD CONSTRAINT fk_key_usuario_historico_dato FOREIGN KEY (key_usuario) REFERENCES public.usuario(key) NOT VALID;


--
-- Name: usuario_dato fk_key_usuario_usuario_dato; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_dato
    ADD CONSTRAINT fk_key_usuario_usuario_dato FOREIGN KEY (key_usuario) REFERENCES public.usuario(key) NOT VALID;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict yCxHyamsZoaHPh7TWe3aCXU00pEA53eORKe4W9j5VY9Pyix2HoGh50AQaZhaQcw

