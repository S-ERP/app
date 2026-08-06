--
-- PostgreSQL database dump
--

\restrict sZ3PaNkwo838rSQ0S8RX70RkuEWsVga7ZBkC8H78jnBxTWfvbS8eOEzFHUpC4wD

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
-- Name: get_puerto(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_puerto() RETURNS integer
    LANGUAGE plpgsql STRICT
    AS $$
DECLARE _r Integer;
BEGIN
 EXECUTE 'select case when max(sq.puerto) is null then 10001 else max(sq.puerto)+1 end
 from servicio sq' into _r;
 RETURN _r;
END;
$$;


ALTER FUNCTION public.get_puerto() OWNER TO postgres;

--
-- Name: get_puerto_http(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_puerto_http() RETURNS integer
    LANGUAGE plpgsql STRICT
    AS $$
DECLARE _r Integer;
BEGIN
 EXECUTE 'select case when max(sq.puerto_http) is null then 30001 else max(sq.puerto_http)+1 end
 from servicio sq' into _r;
 RETURN _r;
END;
$$;


ALTER FUNCTION public.get_puerto_http() OWNER TO postgres;

--
-- Name: get_puerto_ws(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_puerto_ws() RETURNS integer
    LANGUAGE plpgsql STRICT
    AS $$
DECLARE _r Integer;
BEGIN
 EXECUTE 'select case when max(sq.puerto_ws) is null then 20001 else max(sq.puerto_ws)+1 end
 from servicio sq' into _r;
 RETURN _r;
END;
$$;


ALTER FUNCTION public.get_puerto_ws() OWNER TO postgres;

--
-- Name: get_servicio_habilitado(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_servicio_habilitado() RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        SELECT json_agg(u)
        FROM (
            SELECT *
            FROM servicio_habilitado
			WHERE servicio_habilitado.fecha_off is null
        ) u
    );
END;
$$;


ALTER FUNCTION public.get_servicio_habilitado() OWNER TO postgres;

--
-- Name: getdatatabla(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getdatatabla(_tablename character varying) RETURNS json
    LANGUAGE plpgsql STRICT
    AS $$
DECLARE _r json;
BEGIN
 EXECUTE ' SELECT json_agg(row_to_json('||_tablename||'.*)) as data_tabla FROM public.'||_tablename||'' INTO _r;
 RETURN _r;
END;
$$;


ALTER FUNCTION public.getdatatabla(_tablename character varying) OWNER TO postgres;

--
-- Name: getinfotabla(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getinfotabla(nombre_tabla text) RETURNS character varying
    LANGUAGE sql
    AS $$
select json_agg(row_to_json(tt.*))::varchar as info_tabla
from (
	select columnas.column_name,
	'' as value,
	false as error,
columnas.data_type,
columnas.ordinal_position,
columnas.is_nullable,
columnas.is_updatable,
columnas.character_maximum_length,
rels.constraint_type,
rels.table_from,
rels.column_from,
coment.description
from (
		select columns.table_schema, 
		columns.table_name,
		columns.column_name,
		columns.data_type,
		columns.ordinal_position,
		columns.is_nullable,
		columns.is_updatable,
		columns.character_maximum_length
		from information_schema.columns
		where columns.table_schema = 'public'
		and columns.table_name = nombre_tabla
		
	
	) columnas left join 
(
	select  constraint_column_usage.table_schema,
		table_constraints.table_name,
		key_column_usage.column_name,
		table_constraints.constraint_type,
		table_constraints.constraint_name,
		constraint_column_usage.table_name as table_from,
		constraint_column_usage.column_name as column_from
		from information_schema.table_constraints,
		information_schema.constraint_column_usage,
		information_schema.key_column_usage,
		information_schema.columns
		where table_constraints.table_schema = 'public'
		and table_constraints.table_name = nombre_tabla
		and table_constraints.table_schema = constraint_column_usage.table_schema
		and table_constraints.constraint_name = constraint_column_usage.constraint_name
		and table_constraints.table_schema = key_column_usage.table_schema
		and table_constraints.constraint_name = key_column_usage.constraint_name
		and columns.table_schema = table_constraints.table_schema
		and columns.table_name = table_constraints.table_name
		and columns.column_name = key_column_usage.column_name
		) rels
		on columnas.table_schema = rels.table_schema
		and columnas.table_name = rels.table_name
		and columnas.column_name = rels.column_name
		left join
		(
			SELECT c.table_schema,c.table_name,c.column_name,pgd.description
			FROM pg_catalog.pg_statio_all_tables as st
			 inner join pg_catalog.pg_description pgd on (pgd.objoid=st.relid)
			 inner join information_schema.columns c on (pgd.objsubid=c.ordinal_position
			and  c.table_schema=st.schemaname and c.table_name=st.relname)
		) coment
		
		on columnas.column_name = coment.column_name
		and columnas.table_name = coment.table_name
		and columnas.table_schema = coment.table_schema
) tt;

$$;


ALTER FUNCTION public.getinfotabla(nombre_tabla text) OWNER TO postgres;

--
-- Name: gettabla(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.gettabla(nombre_tabla text) RETURNS json
    LANGUAGE sql
    AS $$

select row_to_json(t.*) as tabla
from (
select nombre_tabla as nombre_tabla, 
public.getinfotabla(nombre_tabla) as info_tabla,
public.getdatatabla(nombre_tabla) as data_tabla
) t

$$;


ALTER FUNCTION public.gettabla(nombre_tabla text) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: servicio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicio (
    key character varying NOT NULL,
    nombre character varying NOT NULL,
    descripcion character varying,
    estado integer,
    fecha_on timestamp without time zone,
    fecha_last timestamp without time zone,
    ip character varying,
    puerto integer,
    puerto_ws integer,
    puerto_http integer,
    puerto_arduino integer,
    ip_public character varying,
    test_enabled boolean,
    version character varying
);


ALTER TABLE public.servicio OWNER TO postgres;

--
-- Name: servicio_habilitado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicio_habilitado (
    key character varying NOT NULL,
    key_servicio character varying,
    key_habilitado character varying,
    fecha_on timestamp without time zone,
    fecha_off timestamp without time zone
);


ALTER TABLE public.servicio_habilitado OWNER TO postgres;

--
-- Name: servicio_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicio_log (
    key character varying NOT NULL,
    tipo character varying,
    descripcion character varying,
    estado integer,
    fecha_on timestamp without time zone,
    key_servicio character varying
);


ALTER TABLE public.servicio_log OWNER TO postgres;

--
-- Name: servicio_test; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicio_test (
    key character varying NOT NULL,
    estado integer,
    fecha_on timestamp without time zone,
    key_servicio_from character varying,
    key_servicio_to character varying,
    tipo character varying,
    status character varying,
    ping integer
);


ALTER TABLE public.servicio_test OWNER TO postgres;

--
-- Name: servicio_habilitado servicio_habilitado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio_habilitado
    ADD CONSTRAINT servicio_habilitado_pkey PRIMARY KEY (key);


--
-- Name: servicio_log servicio_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio_log
    ADD CONSTRAINT servicio_log_pkey PRIMARY KEY (key);


--
-- Name: servicio servicio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio
    ADD CONSTRAINT servicio_pkey PRIMARY KEY (key);


--
-- Name: servicio_test servicio_test_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio_test
    ADD CONSTRAINT servicio_test_pkey PRIMARY KEY (key);


--
-- Name: fki_fk_key_habilitado_servicio_habilitado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_habilitado_servicio_habilitado ON public.servicio_habilitado USING btree (key_habilitado);


--
-- Name: fki_fk_key_servicio_servicio_habilitado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_servicio_servicio_habilitado ON public.servicio_habilitado USING btree (key_servicio);


--
-- Name: fki_fk_key_servicio_servicio_log; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_servicio_servicio_log ON public.servicio_log USING btree (key_servicio);


--
-- Name: servicio_habilitado fk_key_habilitado_servicio_habilitado; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio_habilitado
    ADD CONSTRAINT fk_key_habilitado_servicio_habilitado FOREIGN KEY (key_habilitado) REFERENCES public.servicio(key) NOT VALID;


--
-- Name: servicio_habilitado fk_key_servicio_servicio_habilitado; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio_habilitado
    ADD CONSTRAINT fk_key_servicio_servicio_habilitado FOREIGN KEY (key_servicio) REFERENCES public.servicio(key) NOT VALID;


--
-- Name: servicio_log fk_key_servicio_servicio_log; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio_log
    ADD CONSTRAINT fk_key_servicio_servicio_log FOREIGN KEY (key_servicio) REFERENCES public.servicio(key) NOT VALID;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict sZ3PaNkwo838rSQ0S8RX70RkuEWsVga7ZBkC8H78jnBxTWfvbS8eOEzFHUpC4wD

