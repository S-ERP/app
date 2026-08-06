--
-- PostgreSQL database dump
--

\restrict gCFfWIaM4C2I5Hh6HrFgNemUCum2kCNeZd6v1T3HygZ9ZwIy9APTSHtrthx5rqg

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
-- Name: _getallcajasbyempresa(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._getallcajasbyempresa(_key_empresa character varying, _fecha_ini character varying, _fecha_fin character varying) RETURNS SETOF character varying
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
 

 
 SELECT 
    c.key  ,
    c.key_usuario  ,
    c.fecha_on,
    c.fecha,
    c.fecha_cierre ,
    c.key_punto_venta ,
    c.monto_cierre  ,
    c.key_sucursal AS key_sucursal,
    c.key_empresa AS key_empresa,
    
    CASE 
        WHEN c.monto_cierre = 0 THEN \'cerrada\'
        ELSE \'abierta\'
    END AS estado_caja,
    (
      SELECT COALESCE(SUM(ROUND((cd2.tipo_cambio * cd2.monto)::numeric, 2) ), 0)
      FROM caja_detalle cd2
      WHERE cd2.key_caja = c.key AND cd2.tipo = \'apertura\' AND cd2.estado > 0   
    ) AS total_monto_apertura,
	
    (
      SELECT COALESCE(SUM(ROUND((cd2.tipo_cambio * cd2.monto)::numeric, 2)), 0)
      FROM caja_detalle cd2
      WHERE cd2.key_caja = c.key AND cd2.tipo = \'venta\'   AND cd2.estado > 0    
    ) AS total_monto_venta,

(
      SELECT COALESCE(SUM(ROUND(ABS(cd2.tipo_cambio * cd2.monto)::numeric, 2)), 0)
      FROM caja_detalle cd2
      WHERE cd2.key_caja = c.key AND cd2.tipo = \'compra\'   AND cd2.estado > 0    
    ) AS total_monto_compra,

    SUM(CASE WHEN cd.monto < 0 THEN ROUND(ABS(cd.tipo_cambio * cd.monto)::numeric, 2) ELSE 0 END) AS total_monto_egresos,
    COUNT(CASE WHEN cd.monto < 0 THEN 1 ELSE NULL END) AS total_cantidad_egresos,

    SUM(CASE WHEN cd.monto > 0 THEN ROUND((cd.tipo_cambio * cd.monto)::numeric, 2) ELSE 0 END) AS total_monto_ingresos,
    COUNT(CASE WHEN cd.monto > 0 THEN 1 ELSE NULL END) AS total_cantidad_ingresos

FROM 
    caja c
LEFT JOIN 
    caja_detalle cd ON cd.key_caja = c.key  AND cd.estado > 0

WHERE 
c.key_empresa = \''||_key_empresa||E'\'
					AND c.fecha_on::DATE between  \''||_fecha_ini||E'\'::DATE and \''||_fecha_fin||E'\'::DATE
   AND c.estado > 0
   

 

GROUP BY 
    c.key,
    c.key_usuario,
    c.fecha_on,
    c.fecha,
    c.key_punto_venta,
    c.fecha_cierre,
    c.monto_cierre,
    c.key_sucursal,
    c.key_empresa

	
 
 					
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public._getallcajasbyempresa(_key_empresa character varying, _fecha_ini character varying, _fecha_fin character varying) OWNER TO postgres;

--
-- Name: _getallmovimientoscajasbyempresa(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._getallmovimientoscajasbyempresa(_key_empresa character varying, _fecha_ini character varying, _fecha_fin character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

    s_consulta := E'
        SELECT
            jsonb_object_agg(sq.key, to_json(sq.*))::json AS json 
        FROM (
            SELECT 
                CASE  
                    WHEN cd.key_tipo_pago = ''caja'' THEN ''Efectivo''
                    WHEN cd.key_tipo_pago = ''banco'' THEN ''Transferencia''
                    WHEN cd.key_tipo_pago = ''credito'' THEN ''Crédito''
                    ELSE cd.key_tipo_pago 
                END AS tag_tipo_pago,

                CASE  
                    WHEN cd.monto > 0 THEN ''Ingreso'' 
                    ELSE ''Egreso'' 
                END AS tag_movimiento,

                c.key_usuario AS key_cajero,
                c.key_punto_venta,
                c.key_sucursal,
                c.key_empresa,
                c.fecha_on AS caja_fecha_on,
                c.fecha AS caja_fecha,
                c.fecha_cierre AS caja_fecha_cierre,

                empresa_tipo_pago.descripcion AS empresa_tipo_pago,
                tipo_pago.icon AS icon,
                tipo_pago.descripcion AS tipo_pago,

                CASE 
                    WHEN c.monto_cierre = 0 THEN ''Cerrada''
                    ELSE ''Abierta''
                END AS estado_caja,

                cd.*

            FROM 
                caja c
            LEFT JOIN 
                caja_detalle cd ON cd.key_caja = c.key AND cd.estado > 0
            LEFT JOIN 
                tipo_pago ON cd.key_tipo_pago = tipo_pago.key
            LEFT JOIN 
                empresa_tipo_pago ON cd.key_empresa_tipo_pago = empresa_tipo_pago.key

            WHERE 
                c.key_empresa = ''' || _key_empresa || E'''
                AND c.fecha_on::DATE BETWEEN ''' || _fecha_ini || E'''::DATE AND ''' || _fecha_fin || E'''::DATE
                AND c.estado > 0
                AND cd.estado > 0
        ) sq';

    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;

END;
$$;


ALTER FUNCTION public._getallmovimientoscajasbyempresa(_key_empresa character varying, _fecha_ini character varying, _fecha_fin character varying) OWNER TO postgres;

--
-- Name: clonador(character varying, character varying, json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clonador(_key_empresa_from character varying, _key_empresa_to character varying, _respuesta_empresa json DEFAULT NULL::json) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_row               RECORD;
    v_pv_row            RECORD;
    v_result            jsonb;
    v_new_pasarela_key  varchar;
    v_new_etp_key       varchar;
    v_new_pv_key        varchar;
    v_reemplazos        jsonb;
    v_reemplazos_pv     jsonb;
    n_pasarela_empresa  integer := 0;
    n_empresa_tipo_pago integer := 0;
    n_etp_pv            integer := 0;
BEGIN
    -- Tabla temporal para mapear old key → new key de pasarela_empresa
    DROP TABLE IF EXISTS tmp_pasarela_map;
    CREATE TEMP TABLE tmp_pasarela_map (old_key varchar, new_key varchar);

    -- Clonar pasarela_empresa fila a fila para guardar el mapeo
    FOR v_row IN
        SELECT key FROM pasarela_empresa WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_pasarela_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_pasarela_map VALUES (v_row.key, v_new_pasarela_key);

        PERFORM public.clonar_tabla('pasarela_empresa', 'key', v_row.key,
            jsonb_build_object('key', v_new_pasarela_key, 'key_empresa', _key_empresa_to));
        n_pasarela_empresa := n_pasarela_empresa + 1;
    END LOOP;

    -- Clonar empresa_tipo_pago fila a fila
    FOR v_row IN
        SELECT key, key_pasarela_empresa
        FROM empresa_tipo_pago
        WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_etp_key := md5(random()::text || clock_timestamp()::text);

        -- Buscar nuevo key_pasarela_empresa en el mapeo (NULL si la fila no tenía pasarela)
        SELECT new_key INTO v_new_pasarela_key
        FROM tmp_pasarela_map WHERE old_key = v_row.key_pasarela_empresa;

        v_reemplazos := jsonb_build_object('key', v_new_etp_key, 'key_empresa', _key_empresa_to);
        IF v_new_pasarela_key IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_pasarela_empresa', v_new_pasarela_key);
        END IF;

        PERFORM public.clonar_tabla('empresa_tipo_pago', 'key', v_row.key, v_reemplazos);
        n_empresa_tipo_pago := n_empresa_tipo_pago + 1;

        -- Clonar empresa_tipo_pago_punto_venta fila a fila para mapear key_punto_venta
        FOR v_pv_row IN
            SELECT key, key_punto_venta
            FROM empresa_tipo_pago_punto_venta
            WHERE key_empresa_tipo_pago = v_row.key
        LOOP
            v_reemplazos_pv := jsonb_build_object(
                'key',                  NULL,
                'key_empresa_tipo_pago', v_new_etp_key
            );

            -- Si se recibió el mapeo de empresa, sustituir key_punto_venta por el nuevo
            IF _respuesta_empresa IS NOT NULL THEN
                v_new_pv_key := _respuesta_empresa->'mapeo'->'punto_venta'->>v_pv_row.key_punto_venta;
                IF v_new_pv_key IS NOT NULL THEN
                    v_reemplazos_pv := v_reemplazos_pv || jsonb_build_object('key_punto_venta', v_new_pv_key);
                END IF;
            END IF;

            PERFORM public.clonar_tabla('empresa_tipo_pago_punto_venta', 'key', v_pv_row.key, v_reemplazos_pv);
            n_etp_pv := n_etp_pv + 1;
        END LOOP;
    END LOOP;

    DROP TABLE IF EXISTS tmp_pasarela_map;

    RETURN json_build_object(
        'status',   'ok',
        'mensaje',  'caja de empresa "' || _key_empresa_from || '" clonada a "' || _key_empresa_to || '"',
        'clonados', jsonb_build_object(
            'pasarela_empresa',              n_pasarela_empresa,
            'empresa_tipo_pago',             n_empresa_tipo_pago,
            'empresa_tipo_pago_punto_venta', n_etp_pv
        )
    );
END;
$$;


ALTER FUNCTION public.clonador(_key_empresa_from character varying, _key_empresa_to character varying, _respuesta_empresa json) OWNER TO postgres;

--
-- Name: clonador(character varying, character varying, json, json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clonador(_key_empresa_from character varying, _key_empresa_to character varying, _respuesta_empresa json DEFAULT NULL::json, _respuesta_contabilidad json DEFAULT NULL::json) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_row               RECORD;
    v_pv_row            RECORD;
    v_result            jsonb;
    v_new_pasarela_key  varchar;
    v_new_etp_key       varchar;
    v_new_pv_key        varchar;
    v_new_cc_key        varchar;
    v_new_mon_key       varchar;
    v_reemplazos        jsonb;
    v_reemplazos_pv     jsonb;
    n_pasarela_empresa  integer := 0;
    n_empresa_tipo_pago integer := 0;
    n_etp_pv            integer := 0;
BEGIN
    -- Tabla temporal para mapear old key → new key de pasarela_empresa
    DROP TABLE IF EXISTS tmp_pasarela_map;
    CREATE TEMP TABLE tmp_pasarela_map (old_key varchar, new_key varchar);

    -- Clonar pasarela_empresa fila a fila para guardar el mapeo
    FOR v_row IN
        SELECT key FROM pasarela_empresa WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_pasarela_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_pasarela_map VALUES (v_row.key, v_new_pasarela_key);

        PERFORM public.clonar_tabla('pasarela_empresa', 'key', v_row.key,
            jsonb_build_object('key', v_new_pasarela_key, 'key_empresa', _key_empresa_to));
        n_pasarela_empresa := n_pasarela_empresa + 1;
    END LOOP;

    -- Clonar empresa_tipo_pago fila a fila
    FOR v_row IN
        SELECT key, key_pasarela_empresa, key_cuenta_contable, key_moneda
        FROM empresa_tipo_pago
        WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_etp_key := md5(random()::text || clock_timestamp()::text);

        -- Buscar nuevo key_pasarela_empresa en el mapeo (NULL si la fila no tenía pasarela)
        SELECT new_key INTO v_new_pasarela_key
        FROM tmp_pasarela_map WHERE old_key = v_row.key_pasarela_empresa;

        -- Buscar nuevo key_cuenta_contable desde la respuesta de contabilidad
        v_new_cc_key := NULL;
        IF _respuesta_contabilidad IS NOT NULL THEN
            v_new_cc_key := _respuesta_contabilidad->'mapeo'->'cuenta_contable'->>v_row.key_cuenta_contable;
        END IF;

        -- Buscar nuevo key_moneda desde la respuesta de empresa
        v_new_mon_key := NULL;
        IF _respuesta_empresa IS NOT NULL THEN
            v_new_mon_key := _respuesta_empresa->'mapeo'->'empresa_moneda'->>v_row.key_moneda;
        END IF;

        v_reemplazos := jsonb_build_object('key', v_new_etp_key, 'key_empresa', _key_empresa_to);
        IF v_new_pasarela_key IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_pasarela_empresa', v_new_pasarela_key);
        END IF;
        IF v_new_cc_key IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_cuenta_contable', v_new_cc_key);
        END IF;
        IF v_new_mon_key IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_moneda', v_new_mon_key);
        END IF;

        PERFORM public.clonar_tabla('empresa_tipo_pago', 'key', v_row.key, v_reemplazos);
        n_empresa_tipo_pago := n_empresa_tipo_pago + 1;

        -- Clonar empresa_tipo_pago_punto_venta fila a fila para mapear key_punto_venta
        FOR v_pv_row IN
            SELECT key, key_punto_venta
            FROM empresa_tipo_pago_punto_venta
            WHERE key_empresa_tipo_pago = v_row.key
        LOOP
            v_reemplazos_pv := jsonb_build_object(
                'key',                  NULL,
                'key_empresa_tipo_pago', v_new_etp_key
            );

            -- Si se recibió el mapeo de empresa, sustituir key_punto_venta por el nuevo
            IF _respuesta_empresa IS NOT NULL THEN
                v_new_pv_key := _respuesta_empresa->'mapeo'->'punto_venta'->>v_pv_row.key_punto_venta;
                IF v_new_pv_key IS NOT NULL THEN
                    v_reemplazos_pv := v_reemplazos_pv || jsonb_build_object('key_punto_venta', v_new_pv_key);
                END IF;
            END IF;

            PERFORM public.clonar_tabla('empresa_tipo_pago_punto_venta', 'key', v_pv_row.key, v_reemplazos_pv);
            n_etp_pv := n_etp_pv + 1;
        END LOOP;
    END LOOP;

    DROP TABLE IF EXISTS tmp_pasarela_map;

    RETURN json_build_object(
        'status',   'ok',
        'mensaje',  'caja de empresa "' || _key_empresa_from || '" clonada a "' || _key_empresa_to || '"',
        'clonados', jsonb_build_object(
            'pasarela_empresa',              n_pasarela_empresa,
            'empresa_tipo_pago',             n_empresa_tipo_pago,
            'empresa_tipo_pago_punto_venta', n_etp_pv
        )
    );
END;
$$;


ALTER FUNCTION public.clonador(_key_empresa_from character varying, _key_empresa_to character varying, _respuesta_empresa json, _respuesta_contabilidad json) OWNER TO postgres;

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
-- Name: get_abiertas(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_abiertas(_key_empresa character varying) RETURNS SETOF character varying
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
                    SELECT caja.*
					FROM caja
					WHERE caja.estado > 0
					AND caja.key_empresa = \''||_key_empresa||E'\'
					AND caja.fecha_cierre is null
					
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_abiertas(_key_empresa character varying) OWNER TO postgres;

--
-- Name: get_abiertas(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_abiertas(_key_empresa character varying, _key_usuario character varying) RETURNS SETOF character varying
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
                    SELECT caja.*
					FROM caja
					WHERE caja.estado > 0
					and caja.key_usuario = \''||_key_usuario||E'\'
					AND caja.key_empresa = \''||_key_empresa||E'\'
					AND caja.fecha_cierre is null
					
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_abiertas(_key_empresa character varying, _key_usuario character varying) OWNER TO postgres;

--
-- Name: get_abiertas_punto_venta(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_abiertas_punto_venta(_key_punto_venta character varying) RETURNS SETOF character varying
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
                    SELECT caja.*
					FROM caja
					WHERE caja.estado > 0
					AND caja.key_punto_venta = \''||_key_punto_venta||E'\'
					AND caja.fecha_cierre is null
					
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_abiertas_punto_venta(_key_punto_venta character varying) OWNER TO postgres;

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
-- Name: get_all_caja_detalle(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_caja_detalle(_key_caja character varying) RETURNS SETOF character varying
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
                    SELECT caja_detalle.*
					FROM caja_detalle
					WHERE caja_detalle.key_caja = \''||_key_caja||E'\'
					AND caja_detalle.estado > 0
					group by caja_detalle.key
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_caja_detalle(_key_caja character varying) OWNER TO postgres;

--
-- Name: get_all_empresa_tipo_pago_punto_venta(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_empresa_tipo_pago_punto_venta(_key_empresa character varying) RETURNS SETOF character varying
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
                    SELECT empresa_tipo_pago_punto_venta.*
					FROM empresa_tipo_pago_punto_venta,
					empresa_tipo_pago
					WHERE empresa_tipo_pago.estado > 0
					AND empresa_tipo_pago.key_empresa = \''||_key_empresa||E'\'
					AND empresa_tipo_pago_punto_venta.estado > 0
					AND empresa_tipo_pago_punto_venta.key_empresa_tipo_pago = empresa_tipo_pago.key
					
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_empresa_tipo_pago_punto_venta(_key_empresa character varying) OWNER TO postgres;

--
-- Name: get_all_empresa_tipo_pago_punto_venta(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_empresa_tipo_pago_punto_venta(_key_empresa character varying, _key_punto_venta character varying) RETURNS SETOF character varying
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
                    SELECT empresa_tipo_pago.*
					FROM empresa_tipo_pago_punto_venta,
					empresa_tipo_pago
					WHERE empresa_tipo_pago.estado > 0
					AND empresa_tipo_pago.key_empresa = \''||_key_empresa||E'\'
					and empresa_tipo_pago_punto_venta.key_punto_venta = \''||_key_punto_venta||E'\'
					AND empresa_tipo_pago_punto_venta.estado > 0
					AND empresa_tipo_pago_punto_venta.key_empresa_tipo_pago = empresa_tipo_pago.key
					
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_empresa_tipo_pago_punto_venta(_key_empresa character varying, _key_punto_venta character varying) OWNER TO postgres;

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

s_consulta :=E' SELECT
                jsonb_object_agg(sq.key, to_json(sq.*))::json as json 
				FROM (
                    SELECT '||_nombre_tabla||E'.*
					FROM '||_nombre_tabla||E'
					WHERE '||_nombre_tabla||E'.'||_key||E' = \''||_value||E'\'
				) sq';
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
-- Name: get_historico_caja(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_historico_caja(_key_servicio character varying, _fecha_ini character varying, _fecha_fin character varying) RETURNS SETOF character varying
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
                    SELECT caja.*
 					FROM caja
					WHERE caja.estado > 0
					AND caja.key_servicio = \''||_key_servicio||E'\'
					AND caja.fecha_cierre is not null
					and caja.fecha_on::DATE between  \''||_fecha_ini||E'\'::DATE and \''||_fecha_fin||E'\'::DATE
					
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_historico_caja(_key_servicio character varying, _fecha_ini character varying, _fecha_fin character varying) OWNER TO postgres;

--
-- Name: get_last(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_last(_key_punto_venta character varying) RETURNS SETOF character varying
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
				SELECT caja.*
					FROM caja
					where caja.key_punto_venta = \''||_key_punto_venta||E'\'
					and caja.estado > 0
					and caja.fecha_on in (
						SELECT max(caja.fecha_on)
						FROM caja
						where caja.key_punto_venta = \''||_key_punto_venta||E'\'
						and caja.estado > 0
					)
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_last(_key_punto_venta character varying) OWNER TO postgres;

--
-- Name: get_monto_caja(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_monto_caja(_key_caja character varying) RETURNS SETOF character varying
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
				SELECT sum(caja_detalle.monto) as monto,
				caja.key
				FROM caja,
				caja_detalle
				where caja.key = \''||_key_caja||E'\'
				and caja_detalle.key_caja = caja.key
				and caja.estado > 0
				group by caja.key
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_monto_caja(_key_caja character varying) OWNER TO postgres;

--
-- Name: get_monto_caja_tipo_pago(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_monto_caja_tipo_pago(_key_caja character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' select array_to_json(array_agg(tabla.*)) as json
			from(
				SELECT sum(caja_detalle.monto) as monto,
				caja_detalle.key_empresa_tipo_pago,
				caja_detalle.key_moneda
				FROM caja,
				caja_detalle
				where caja_detalle.key_caja = caja.key
				and caja.estado > 0
				and caja.key  = \''||_key_caja||E'\'
				and caja_detalle.estado > 0
				group by caja_detalle.key_empresa_tipo_pago,
				caja_detalle.key_moneda

				) tabla';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_monto_caja_tipo_pago(_key_caja character varying) OWNER TO postgres;

--
-- Name: get_movimientos_caja_tipo_pago(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_movimientos_caja_tipo_pago(_key_caja character varying) RETURNS SETOF character varying
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
				select caja_detalle.key_tipo_pago as key,
				sum(caja_detalle.monto) as monto
				from caja_detalle
				where caja_detalle.key_caja = \''||_key_caja||E'\'
				and caja_detalle.estado > 0
				group by caja_detalle.key_tipo_pago
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_movimientos_caja_tipo_pago(_key_caja character varying) OWNER TO postgres;

--
-- Name: get_ultima_caja(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_ultima_caja(_key_punto_venta character varying) RETURNS SETOF character varying
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
				SELECT caja.*
					FROM caja
					where caja.key_punto_venta = \''||_key_punto_venta||E'\'
					and caja.estado > 0
					and caja.fecha_cierre = (
						SELECT max(caja.fecha_cierre)
						FROM caja
						where caja.key_punto_venta = \''||_key_punto_venta||E'\'
						and caja.estado > 0
					)
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_ultima_caja(_key_punto_venta character varying) OWNER TO postgres;

--
-- Name: reporte_cuentas(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reporte_cuentas(_key_servicio character varying, _fecha_ini character varying, _fecha_fin character varying) RETURNS SETOF character varying
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
                jsonb_object_agg(sq.key_cuenta_contable, to_json(sq.*))::json as json 
				FROM (
                    SELECT caja_detalle_cuenta.key_cuenta_contable,
					sum(caja_detalle_cuenta.monto) as monto
					FROM caja_detalle,
					caja_detalle_cuenta,
					caja
					WHERE caja.key_servicio = \''||_key_servicio||E'\'
					AND caja_detalle.key_caja = caja.key
					AND caja_detalle.estado > 0
					AND caja_detalle_cuenta.key_caja_detalle = caja_detalle.key
					AND caja_detalle_cuenta.estado > 0
					and caja_detalle_cuenta.fecha_on::DATE between  \''||_fecha_ini||E'\'::DATE and \''||_fecha_fin||E'\'::DATE
					and caja.estado > 0
					group by caja_detalle_cuenta.key_cuenta_contable
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.reporte_cuentas(_key_servicio character varying, _fecha_ini character varying, _fecha_fin character varying) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: caja; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.caja (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_punto_venta character varying,
    fecha_cierre timestamp without time zone,
    key_servicio character varying,
    monto_cierre double precision,
    fraccionar_moneda boolean DEFAULT false,
    key_sucursal character varying,
    fecha timestamp without time zone DEFAULT now(),
    key_cuenta_contable character varying,
    key_comprobante_cierre character varying,
    key_empresa character varying
);


ALTER TABLE public.caja OWNER TO postgres;

--
-- Name: caja_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.caja_detalle (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_caja character varying,
    descripcion character varying,
    monto double precision,
    tipo character varying,
    data json,
    fecha timestamp without time zone,
    key_comprobante character varying,
    codigo_comprobante character varying,
    qrid character varying,
    key_moneda character varying,
    tipo_cambio double precision,
    key_tipo_pago character varying,
    key_empresa_tipo_pago character varying,
    vouchers json,
    key_compra_venta character varying
);


ALTER TABLE public.caja_detalle OWNER TO postgres;

--
-- Name: caja_detalle_moneda; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.caja_detalle_moneda (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_caja_detalle character varying,
    key_detalle_moneda character varying,
    valor double precision,
    cantidad double precision
);


ALTER TABLE public.caja_detalle_moneda OWNER TO postgres;

--
-- Name: cotizacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cotizacion (
    key character varying NOT NULL,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    data json,
    key_caja character varying,
    key_empresa character varying
);


ALTER TABLE public.cotizacion OWNER TO postgres;

--
-- Name: empresa_tipo_pago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresa_tipo_pago (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_tipo_pago character varying,
    key_cuenta_contable character varying,
    enviar_cierre_caja boolean DEFAULT false,
    key_empresa character varying,
    descripcion character varying,
    key_moneda character varying,
    key_pasarela_empresa character varying,
    habilita_venta boolean,
    habilita_compra boolean
);


ALTER TABLE public.empresa_tipo_pago OWNER TO postgres;

--
-- Name: empresa_tipo_pago_punto_venta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresa_tipo_pago_punto_venta (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_empresa_tipo_pago character varying,
    enviar_cierre_caja boolean DEFAULT false,
    key_punto_venta character varying,
    descripcion character varying
);


ALTER TABLE public.empresa_tipo_pago_punto_venta OWNER TO postgres;

--
-- Name: pasarela; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pasarela (
    key character varying NOT NULL,
    fecha_on timestamp without time zone,
    estado integer,
    key_usuario character varying,
    descripcion character varying,
    observacion character varying,
    params json
);


ALTER TABLE public.pasarela OWNER TO postgres;

--
-- Name: pasarela_empresa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pasarela_empresa (
    key character varying NOT NULL,
    fecha_on timestamp without time zone,
    estado integer,
    key_usuario character varying,
    key_pasarela character varying,
    key_empresa character varying,
    descripcion character varying,
    observacion character varying,
    params json
);


ALTER TABLE public.pasarela_empresa OWNER TO postgres;

--
-- Name: recurrente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recurrente (
    key character varying NOT NULL,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    data json,
    key_empresa character varying
);


ALTER TABLE public.recurrente OWNER TO postgres;

--
-- Name: tipo_pago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_pago (
    key character varying NOT NULL,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    orden integer,
    icon character varying
);


ALTER TABLE public.tipo_pago OWNER TO postgres;

--
-- Name: caja_detalle_moneda caja_detalle_moneda_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_detalle_moneda
    ADD CONSTRAINT caja_detalle_moneda_pkey PRIMARY KEY (key);


--
-- Name: caja_detalle caja_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_detalle
    ADD CONSTRAINT caja_detalle_pkey PRIMARY KEY (key);


--
-- Name: caja caja_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja
    ADD CONSTRAINT caja_pkey PRIMARY KEY (key);


--
-- Name: cotizacion cotizacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cotizacion
    ADD CONSTRAINT cotizacion_pkey PRIMARY KEY (key);


--
-- Name: empresa_tipo_pago empresa_tipo_pago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_tipo_pago
    ADD CONSTRAINT empresa_tipo_pago_pkey PRIMARY KEY (key);


--
-- Name: empresa_tipo_pago_punto_venta empresa_tipo_pago_punto_venta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_tipo_pago_punto_venta
    ADD CONSTRAINT empresa_tipo_pago_punto_venta_pkey PRIMARY KEY (key);


--
-- Name: pasarela_empresa pasarela_empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasarela_empresa
    ADD CONSTRAINT pasarela_empresa_pkey PRIMARY KEY (key);


--
-- Name: pasarela pasarela_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasarela
    ADD CONSTRAINT pasarela_pkey PRIMARY KEY (key);


--
-- Name: recurrente recurrente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recurrente
    ADD CONSTRAINT recurrente_pkey PRIMARY KEY (key);


--
-- Name: tipo_pago tipo_pago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_pago
    ADD CONSTRAINT tipo_pago_pkey PRIMARY KEY (key);


--
-- Name: fki_fk_key_pasarela_empresa_empresa_tipo_pago; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_pasarela_empresa_empresa_tipo_pago ON public.empresa_tipo_pago USING btree (key_pasarela_empresa);


--
-- Name: fki_fk_key_pasarela_pasarela_empresa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_pasarela_pasarela_empresa ON public.pasarela_empresa USING btree (key_pasarela);


--
-- Name: cotizacion cotizacion_fkey_key_caja; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cotizacion
    ADD CONSTRAINT cotizacion_fkey_key_caja FOREIGN KEY (key_caja) REFERENCES public.caja(key) NOT VALID;


--
-- Name: caja_detalle fk_caja_detalle_key_caja; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_detalle
    ADD CONSTRAINT fk_caja_detalle_key_caja FOREIGN KEY (key_caja) REFERENCES public.caja(key) NOT VALID;


--
-- Name: caja_detalle_moneda fk_caja_detalle_moneda_key_caja_detalle; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_detalle_moneda
    ADD CONSTRAINT fk_caja_detalle_moneda_key_caja_detalle FOREIGN KEY (key_caja_detalle) REFERENCES public.caja(key);


--
-- Name: empresa_tipo_pago fk_empresa_tipo_pago_key_tipo_pago; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_tipo_pago
    ADD CONSTRAINT fk_empresa_tipo_pago_key_tipo_pago FOREIGN KEY (key_tipo_pago) REFERENCES public.tipo_pago(key);


--
-- Name: empresa_tipo_pago_punto_venta fk_empresa_tipo_pago_punto_venta_key_empresa_tipo_pago; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_tipo_pago_punto_venta
    ADD CONSTRAINT fk_empresa_tipo_pago_punto_venta_key_empresa_tipo_pago FOREIGN KEY (key_empresa_tipo_pago) REFERENCES public.empresa_tipo_pago(key);


--
-- Name: empresa_tipo_pago fk_key_pasarela_empresa_empresa_tipo_pago; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_tipo_pago
    ADD CONSTRAINT fk_key_pasarela_empresa_empresa_tipo_pago FOREIGN KEY (key_pasarela_empresa) REFERENCES public.pasarela_empresa(key) NOT VALID;


--
-- Name: pasarela_empresa fk_key_pasarela_pasarela_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasarela_empresa
    ADD CONSTRAINT fk_key_pasarela_pasarela_empresa FOREIGN KEY (key_pasarela) REFERENCES public.pasarela(key) NOT VALID;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict gCFfWIaM4C2I5Hh6HrFgNemUCum2kCNeZd6v1T3HygZ9ZwIy9APTSHtrthx5rqg

