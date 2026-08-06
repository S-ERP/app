--
-- PostgreSQL database dump
--

\restrict GAHdgAsOd73NPMcaj7VIyFUjAobsyXdUgxZ46rhlPzc2o8svv35IpqIDDmyikkj

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
-- Name: dblink; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS dblink WITH SCHEMA public;


--
-- Name: EXTENSION dblink; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION dblink IS 'connect to other PostgreSQL databases from within a database';


--
-- Name: _get_compras_proveedor(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_compras_proveedor(_key_proveedor character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    
    
    respuesta character varying;
	s_consulta character varying;

BEGIN

s_consulta :=E' SELECT
				
                json_agg( to_json(sq.*))::json as json 
				FROM (
 SELECT 
 
 cv.*, 
 
 ( SELECT to_json (sq1) FROM ( SELECT ROUND(cvd.cantidad * cvd.precio_unitario * 100) / 100 AS monto, ROUND(cvd.cantidad * cvd.precio_unitario_base * 100) / 100 AS monto_base, cvd.* FROM compra_venta_detalle cvd WHERE cvd.key_compra_venta = cv.key ) sq1 ) AS detalle_items,

   ( SELECT to_json(sq1) 
              FROM (
                    SELECT
 						cv.tipo_cambio,
						COUNT(c.key) AS cantidad,
						cv.descripcion as descripcion,
						cv.observacion as observacion,
                        ROUND(SUM(c.monto_base)::numeric, 2) AS monto_total_base,
                         ROUND(COALESCE(SUM(ca.monto_base),0)::numeric, 2) AS total_amortizado_base,
                        ROUND(COALESCE(SUM(ca.monto_base)/cv.tipo_cambio,0)::numeric, 2) AS total_amortizado,
                        ROUND((SUM(c.monto_base) - COALESCE(SUM(ca.monto_base),0))::numeric, 2) AS saldo_base,
                        ROUND(((SUM(c.monto_base) - COALESCE(SUM(ca.monto_base),0))/cv.tipo_cambio)::numeric, 2) AS saldo,
                        CASE WHEN (SUM(c.monto_base) - COALESCE(SUM(ca.monto_base),0)) = 0 THEN ''Pagado'' WHEN MAX(c.fecha) < CURRENT_DATE THEN ''En mora'' ELSE ''Pendiente'' END AS estado_compra
                    FROM cuota c
                    LEFT JOIN cuota_amortizacion ca ON ca.key_cuota = c.key
                    WHERE c.key_compra_venta = cv.key
              ) sq1
            ) AS detalle_items2,
			

( SELECT to_json(sq1) FROM ( SELECT cv.tipo_cambio, ROUND(SUM(coalesce(cuota.monto_amortizado,0) / cv.tipo_cambio )::numeric, 2) AS monto, SUM(coalesce(cuota.monto_amortizado,0)) AS monto_base, COUNT(cuota.key) AS cantidad FROM ( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) AS monto_amortizado FROM cuota LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota WHERE cuota.key_compra_venta = cv.key GROUP BY cuota.key ) cuota WHERE cuota.monto_amortizado > 0 ) sq1 ) AS cuotas_en_amortizacion,
( SELECT to_json(sq1) FROM ( SELECT cv.tipo_cambio, ROUND(  SUM((coalesce(cuota.monto_base,0)-coalesce(cuota.monto_amortizado,0))/cv.tipo_cambio)::numeric, 2) as monto, SUM((coalesce(cuota.monto_base,0)-coalesce(cuota.monto_amortizado,0))) as monto_base, COUNT(CASE WHEN cuota.fecha_pago IS NULL AND (cuota.fecha::date >= now()::date) THEN 1 END) AS cantidad FROM( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) as monto_amortizado FROM cuota LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota WHERE cuota.key_compra_venta = cv.key and cuota.fecha_pago IS NULL AND cuota.fecha::date >= now()::date group by cuota.key ) cuota WHERE cuota.monto_base > cuota.monto_amortizado ) sq1 ) AS cuotas_en_pendientes,
( SELECT to_json(sq1) FROM ( SELECT cv.tipo_cambio, ROUND(  SUM((coalesce(cuota.monto_base,0)-coalesce(cuota.monto_amortizado,0))/cv.tipo_cambio)::numeric, 2) as monto, SUM((coalesce(cuota.monto_base,0)-coalesce(cuota.monto_amortizado,0))) as monto_base, COUNT(CASE WHEN cuota.fecha_pago IS NULL AND (cuota.fecha::date < now()::date) THEN 1 END) AS cantidad FROM( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) as monto_amortizado FROM cuota LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota WHERE cuota.key_compra_venta = cv.key and cuota.fecha_pago IS NULL AND cuota.fecha::date < now()::date group by cuota.key ) cuota WHERE cuota.monto_base > cuota.monto_amortizado ) sq1 ) AS cuotas_en_mora,
( SELECT to_json(sq1) FROM ( SELECT SUM((coalesce(cuota.monto_base,0)-coalesce(cuota.monto_amortizado,0))) as monto, COUNT(CASE WHEN cuota.fecha_pago IS NULL AND (cuota.fecha::date < now()::date) THEN 1 END) AS cantidad FROM( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) as monto_amortizado FROM cuota LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota WHERE cuota.key_compra_venta = cv.key and cuota.fecha_pago IS NULL AND cuota.fecha::date < now()::date group by cuota.key ) cuota WHERE cuota.monto_base > cuota.monto_amortizado ) sq1 ) AS cuotas_en_mora3,
( SELECT to_json(sq1) FROM ( SELECT SUM((coalesce(cuota.monto_base,0) - coalesce(cuota.monto_amortizado,0))) AS monto, COUNT(cuota.key) AS cantidad FROM ( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) AS monto_amortizado FROM cuota LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota WHERE cuota.key_compra_venta = cv.key AND cuota.fecha_pago IS NULL AND cuota.fecha::date >= now()::date GROUP BY cuota.key ) cuota WHERE cuota.monto_base > cuota.monto_amortizado ) sq1 ) AS cuotas_en_pendientes3,
( SELECT to_json(sq1) FROM ( SELECT cv.tipo_cambio, SUM(cuota.monto_base) AS monto_base, ROUND(SUM(coalesce(cuota.monto,0) / cv.tipo_cambio )::numeric, 2) AS monto, COUNT(cuota.key) AS cantidad FROM cuota WHERE cuota.key_compra_venta = cv.key ) sq1 ) AS cuotas_total

FROM compra_venta cv
 					WHERE cv.key_proveedor = \''||_key_proveedor||E'\'
					  AND cv.tipo = \'compra\'
					  AND cv.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public._get_compras_proveedor(_key_proveedor character varying) OWNER TO postgres;

--
-- Name: _get_compras_ventas_alvarito(character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_compras_ventas_alvarito(_key_empresa character varying, _fecha_inicio character varying, _fecha_fin character varying, _tipo character varying) RETURNS SETOF character varying
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
				
                json_agg( to_json(sq.*))::json as json 
				FROM (
				
				SELECT 
					    cv.*,
					    (
					        SELECT json_agg(cvd.*)
					        FROM compra_venta_detalle cvd
					        WHERE cvd.key_compra_venta = cv.key
					          AND cvd.estado > 0
					    ) AS detalles,
					    (
					        SELECT to_json(sq1)
					        FROM (
					            SELECT 
					                SUM(cuota.monto_base/cv.tipo_cambio) AS total,
									SUM(cuota.monto_base) AS total_base,
					                COUNT(cuota.key) AS cantidad
					            FROM cuota
					            WHERE cuota.key_compra_venta = cv.key
					        ) sq1
					    ) AS cuotas,
						 (
					        SELECT to_json(sq1)
					        FROM (
							
							    SELECT 
									SUM((coalesce(cuota.monto_base,0)-coalesce(cuota.total_amortizado_base,0))/cv.tipo_cambio) as monto,
									SUM((coalesce(cuota.monto_base,0)-coalesce(cuota.total_amortizado_base,0))) as monto_base,
									COUNT(cuota.key) as cantidad,
									MIN(cuota.fecha) as min_fecha
								FROM(
									SELECT cuota.*
									FROM cuota 
									WHERE  cuota.fecha::date <= now()::date
									AND cuota.fecha_pago is null
									AND cuota.key_compra_venta = cv.key
									group by cuota.key
								) cuota
					        ) sq1
					    ) AS cuotas_en_mora,
						(
							 SELECT 
								SUM(coalesce(cuota.total_amortizado_base,0)/cv.tipo_cambio) as monto_amortizado
					            FROM cuota 
					            WHERE cuota.key_compra_venta =  cv.key
								group by cuota.key_compra_venta
						) as monto_amortizado,
								(
							 SELECT 
								SUM(coalesce(cuota.total_amortizado_base,0)) as monto_amortizado_base
					            FROM cuota 
					            WHERE cuota.key_compra_venta =  cv.key
								group by cuota.key_compra_venta
						) as monto_amortizado_base
					FROM compra_venta cv
 					WHERE cv.key_empresa = \''||_key_empresa||E'\'
					  AND cv.fecha_on::date BETWEEN  \''||_fecha_inicio||E'\'::date and \''||_fecha_fin||E'\'::date
					  AND cv.tipo = \''||_tipo||E'\'
					  AND cv.estado > 0
 
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public._get_compras_ventas_alvarito(_key_empresa character varying, _fecha_inicio character varying, _fecha_fin character varying, _tipo character varying) OWNER TO postgres;

--
-- Name: _get_cuotas_compras(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_cuotas_compras(_key_compra_venta character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta character varying;
BEGIN

    EXECUTE '
        SELECT json_agg(to_json(sq.*)) AS resultado
        FROM (
            SELECT
                -- ----------- IDENTIFICADORES -----------
                c.key,
                c.key AS key_cuota,
                c.key_compra_venta,
                cv.key_moneda,
                c.codigo::int AS numero,

                -- ----------- DESCRIPCIONES -----------
                cv.descripcion AS descripcion_compra,
                c.descripcion AS descripcion_cuota,
                
				c.descripcion AS descripcion,
				
                c.observacion AS observacion_cuota,
                cvd.descripcion AS descripcion_detalle,

                -- ----------- FECHAS -----------
                c.fecha AS vencimiento,
                (c.fecha - INTERVAL ''1 day'') AS fecha_pago,
                c.fecha_on AS fecha_cuota,
                cv.fecha_on AS fecha_compra,

                -- ----------- USUARIO -----------
                c.key_usuario AS key_encargado,

                -- ----------- CANTIDADES Y PRECIOS -----------
                cvd.cantidad,
                ROUND(cvd.precio_unitario::numeric, 2) AS precio_unitario,
                ROUND(cvd.precio_unitario_base::numeric, 2) AS precio_unitario_base,

                -- ----------- MONTOS (DETALLE) -----------
                ROUND((cvd.cantidad * cvd.precio_unitario)::numeric, 2) AS monto,
                ROUND((cvd.cantidad * cvd.precio_unitario_base)::numeric, 2) AS monto_base,

                -- ----------- MONTO DE LA CUOTA (ORIGINAL) -----------
                ROUND((c.monto_base / cv.tipo_cambio)::numeric, 2) AS monto_cuota,
                ROUND(c.monto_base::numeric, 2) AS monto_cuota_base,

                -- ----------- MONTO TOTAL COMPRA (HEREDADO) -----------
                ROUND(c.monto::numeric, 2) AS monto_total,
                ROUND(c.monto_base::numeric, 2) AS monto_total_base,

                -- ----------- TIPO DE CAMBIO -----------
                cv.tipo_cambio,

                -- ----------- PAGOS SUMADOS -----------
                ROUND(COALESCE(SUM(ca.monto_base), 0)::numeric, 2) AS total_amortizado_base,
                ROUND(COALESCE(SUM(ca.monto_base), 0)::numeric, 2) AS pago_base,
                ROUND(COALESCE(SUM(ca.monto_base) / cv.tipo_cambio, 0)::numeric, 2) AS pago,

                -- ----------- SALDOS -----------
                ROUND((cvd.cantidad * cvd.precio_unitario_base - COALESCE(SUM(ca.monto_base), 0))::numeric, 2) AS saldo_base,



  				ROUND(SUM((coalesce(c.monto_base,0)-coalesce(ca.monto_base,0))/cv.tipo_cambio)::numeric, 2) as saldo2,  

  				ROUND(SUM((coalesce(c.monto_base,0)-coalesce(c.total_amortizado,0))/cv.tipo_cambio)::numeric, 2) as saldo3,  

				  
                ROUND((cvd.cantidad * cvd.precio_unitario - COALESCE(SUM(ca.monto_base) / cv.tipo_cambio, 0))::numeric, 2) AS saldo,
 
 










  
 	
	-- ROUND(SUM((coalesce(cuota.monto_base,0) - coalesce(cuota.monto_amortizado,0)) / cv.tipo_cambio)::numeric, 2) AS monto,
 	
--	COUNT(*) AS cantidad FROM ( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) AS monto_amortizado 
	
 

                -- ----------- ESTADO GENERAL DE LA CUOTA -----------
                CASE 
                    WHEN ROUND((cvd.cantidad * cvd.precio_unitario - 
                                COALESCE(SUM(ca.monto_base) / cv.tipo_cambio, 0))::numeric, 2) = 0 
                        THEN ''Pagado''
                    ELSE ''Pendiente''
                END AS estado,

                -- ----------- SUB ESTADO (VENCIDO / PENDIENTE / PAGADO) -----------
                CASE 
                    WHEN ROUND((cvd.cantidad * cvd.precio_unitario - 
                                COALESCE(SUM(ca.monto_base) / cv.tipo_cambio, 0))::numeric, 2) = 0 
                        THEN ''Pagado''
                    WHEN EXTRACT(MONTH FROM c.fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
                     AND EXTRACT(YEAR  FROM c.fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
                        THEN ''Pendiente''
                    ELSE ''Vencido''
                END AS sub_estado_cuota,

                -- ----------- DETALLE COMPLETO DE PAGOS -----------
                COALESCE(
                    json_agg(
                        json_build_object(
                            ''key_amortizacion'', ca.key,
                            ''fecha'', ca.fecha_on,
                            ''pago_base'', ROUND(ca.monto_base::numeric, 2),
                            ''pago'', ROUND((ca.monto_base / cv.tipo_cambio)::numeric, 2),
                            ''observacion'', ca.observacion,
                            ''key_usuario'', ca.key_usuario,
                            ''estado_pago'',
                                CASE 
                                    WHEN ca.monto_base > 0 THEN ''Procesado''
                                    ELSE ''Anulado''
                                END
                        )
                    ) FILTER (WHERE ca.key IS NOT NULL),
                    ''[]''
                ) AS detalle_pagos

            FROM cuota c
            LEFT JOIN cuota_amortizacion ca ON ca.key_cuota = c.key
            JOIN compra_venta cv ON cv.key = c.key_compra_venta
            JOIN compra_venta_detalle cvd ON cvd.key_compra_venta = cv.key

 			
  WHERE c.key_compra_venta = ''' || _key_compra_venta || '''
  
             GROUP BY 
                c.key, cv.tipo_cambio, cv.descripcion, cvd.descripcion, cvd.cantidad,
                cvd.precio_unitario, cvd.precio_unitario_base,
                c.monto_base, c.monto, c.fecha, c.fecha_on, cv.fecha_on,
                cv.key_moneda, c.codigo, c.observacion, c.key_usuario
        ) sq;
    ' INTO respuesta;

    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public._get_cuotas_compras(_key_compra_venta character varying) OWNER TO postgres;

--
-- Name: _get_cuotas_pendientes(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_cuotas_pendientes(_key_empresa character varying, _key_cliente character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta json;
BEGIN
    SELECT json_agg(sq)
    INTO respuesta
    FROM (
        SELECT 
            cu.key as key_cuota, 
            cu.key_compra_venta, cv.key_sucursal, cv.key_almacen, cv.key_empresa, cu.key_moneda,
            cu.key_usuario, cu.fecha_on, cu.descripcion, cu.monto, cu.total_amortizado, cu.monto_base, cu.total_amortizado_base, cu.fecha_pago
        FROM cuota cu
        INNER JOIN compra_venta cv 
            ON cv.key = cu.key_compra_venta
        WHERE cv.key_cliente = _key_cliente
          AND cv.key_empresa = _key_empresa
          AND cv.estado > 0
          AND cu.estado > 0
               AND cu.monto IS DISTINCT FROM cu.total_amortizado
        --  AND cu.fecha_on >= _fecha_inicio::timestamp
       --   AND cu.fecha_on < (_fecha_fin::timestamp + interval '1 day')
        ORDER BY cu.fecha_on ASC, cu.key_compra_venta ASC
    ) sq;

    RETURN respuesta;
END;
$$;


ALTER FUNCTION public._get_cuotas_pendientes(_key_empresa character varying, _key_cliente character varying) OWNER TO postgres;

--
-- Name: _get_cuotas_resumen_total_compras(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_cuotas_resumen_total_compras(_key_empresa character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql ROWS 1
    AS $$
DECLARE
    respuesta character varying;
    s_consulta character varying;
BEGIN

    s_consulta := E'
        SELECT json_agg(to_json(sq.*)) AS resultado
        FROM (
              SELECT
                cv.key_proveedor,
                
                SUM(COALESCE(cuota.monto, 0)) AS monto_total,
                COUNT(*) AS cantidad_total,
                
                SUM(CASE WHEN cuota.fecha_pago IS NULL THEN COALESCE(cuota.monto,0) - COALESCE(cuota.total_amortizado,0) ELSE 0 END) AS monto_pendiente,
                COUNT(CASE WHEN cuota.fecha_pago IS NULL THEN 1 END) AS cantidad_pendiente,
                
                SUM(CASE WHEN cuota.fecha_pago IS NULL AND cuota.fecha::date <= NOW()::date THEN COALESCE(cuota.monto,0) - COALESCE(cuota.total_amortizado,0) ELSE 0 END) AS monto_en_mora,
                COUNT(CASE WHEN cuota.fecha_pago IS NULL AND cuota.fecha::date <= NOW()::date THEN 1 END) AS cantidad_en_mora,
                
                SUM(CASE WHEN cuota.fecha_pago IS NOT NULL THEN COALESCE(cuota.total_amortizado,0) ELSE 0 END) AS monto_pagado,
                COUNT(CASE WHEN cuota.fecha_pago IS NOT NULL THEN 1 END) AS cantidad_pagada,
                
                MIN(cuota.fecha)::date AS fecha_primer_cuota,
                MAX(cuota.fecha)::date AS fecha_ultima_cuota,
                MAX(cuota.fecha_pago) AS ultimo_pago
            FROM cuota
            JOIN compra_venta cv ON cuota.key_compra_venta = cv.key
            WHERE cv.key_empresa = ''' || _key_empresa || '''
			AND cuota.estado > 0 
			AND cv.estado > 0
            GROUP BY cv.key_proveedor
            ORDER BY cv.key_proveedor
        ) sq;
    ';

    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;

END;
$$;


ALTER FUNCTION public._get_cuotas_resumen_total_compras(_key_empresa character varying) OWNER TO postgres;

--
-- Name: _get_cuotas_resumen_total_ventas(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_cuotas_resumen_total_ventas(_key_empresa character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql ROWS 1
    AS $$
DECLARE
    respuesta character varying;
    s_consulta character varying;
BEGIN

    s_consulta := E'
        SELECT json_agg(to_json(sq.*)) AS resultado
        FROM (
              SELECT
                cv.key_cliente,
                
                SUM(COALESCE(cuota.monto, 0)) AS monto_total,
                COUNT(*) AS cantidad_total,
                
                SUM(CASE WHEN cuota.fecha_pago IS NULL THEN COALESCE(cuota.monto,0) - COALESCE(cuota.total_amortizado,0) ELSE 0 END) AS monto_pendiente,
                COUNT(CASE WHEN cuota.fecha_pago IS NULL THEN 1 END) AS cantidad_pendiente,
                
                SUM(CASE WHEN cuota.fecha_pago IS NULL AND cuota.fecha::date <= NOW()::date THEN COALESCE(cuota.monto,0) - COALESCE(cuota.total_amortizado,0) ELSE 0 END) AS monto_en_mora,
                COUNT(CASE WHEN cuota.fecha_pago IS NULL AND cuota.fecha::date <= NOW()::date THEN 1 END) AS cantidad_en_mora,
                
                SUM(CASE WHEN cuota.fecha_pago IS NOT NULL THEN COALESCE(cuota.total_amortizado,0) ELSE 0 END) AS monto_pagado,
                COUNT(CASE WHEN cuota.fecha_pago IS NOT NULL THEN 1 END) AS cantidad_pagada,
                
                MIN(cuota.fecha)::date AS fecha_primer_cuota,
                MAX(cuota.fecha)::date AS fecha_ultima_cuota,
                MAX(cuota.fecha_pago) AS ultimo_pago
            FROM cuota
            JOIN compra_venta cv ON cuota.key_compra_venta = cv.key
            WHERE cv.key_empresa = ''' || _key_empresa || '''
			AND cuota.estado > 0 
			AND cv.estado > 0
            GROUP BY cv.key_cliente
            ORDER BY cv.key_cliente
        ) sq;
    ';

    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;

END;
$$;


ALTER FUNCTION public._get_cuotas_resumen_total_ventas(_key_empresa character varying) OWNER TO postgres;

--
-- Name: _get_detalles_bycliente(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_detalles_bycliente(_key_empresa character varying, _key_cliente character varying) RETURNS SETOF character varying
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
				
                json_agg( to_json(sq.*))::json as json 
				FROM (


			  SELECT 
                cvd.key_modelo,
                cvd.descripcion,
                cvd.precio_unitario_base,
                cvd.cantidad,
                (cvd.precio_unitario_base * cvd.cantidad) AS subtotal,
                cv.tipo,
                cv.tipo_pago,
                cv.key_moneda,
                cv.key_sucursal,
                cv.key_almacen,
                cv.key_empresa,
                cv.fecha_on,
                cv.key_usuario
            FROM compra_venta_detalle cvd
            INNER JOIN compra_venta cv 
                ON cv.key = cvd.key_compra_venta
				
            WHERE cv.key_cliente = \''||_key_cliente||E'\'
              AND cv.key_empresa = \''||_key_empresa||E'\'
              AND cvd.estado > 0
              AND cv.estado > 0
            ORDER BY cv.fecha_on DESC
		 
 
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public._get_detalles_bycliente(_key_empresa character varying, _key_cliente character varying) OWNER TO postgres;

--
-- Name: _get_detalles_bycliente2(character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_detalles_bycliente2(_key_empresa character varying, _key_cliente character varying, _fecha_inicio character varying, _fecha_fin character varying) RETURNS json
    LANGUAGE plpgsql
    AS $_$
DECLARE
    respuesta json;
BEGIN
    EXECUTE $sql$
        WITH movimientos AS (
            -- Cuotas
            SELECT 
                cu.key_compra_venta,
                cu.fecha_on,
                'Cuota' AS tipo,
                'Cuota Amortizado' AS descripcion,
                0 AS debe,
                cu.total_amortizado AS haber,
                cv.key_moneda,
                cv.key_sucursal,
                cv.key_almacen,
                cv.key_empresa,
                cv.key_usuario,
                'haber' AS nota
            FROM cuota cu
            INNER JOIN compra_venta cv 
                ON cv.key = cu.key_compra_venta
            WHERE cv.key_cliente = $1
              AND cv.key_empresa = $2
              AND cu.total_amortizado IS NOT NULL
              AND cu.estado > 0
             -- AND cu.fecha_on BETWEEN $3::timestamp AND $4::timestamp
AND cu.fecha_on >= $3::timestamp
AND cu.fecha_on < ($4::timestamp + interval '1 day')
            UNION ALL

            -- Detalles
            SELECT 
                cvd.key_compra_venta,
                cv.fecha_on,
                cv.tipo AS tipo,
                cvd.descripcion AS descripcion,

  
				
                (cvd.precio_unitario_base * cvd.cantidad) AS debe,
                0 AS haber,
                cv.key_moneda,
                cv.key_sucursal,
                cv.key_almacen,
                cv.key_empresa,
                cv.key_usuario,
                'debe' AS nota
            FROM compra_venta_detalle cvd
            INNER JOIN compra_venta cv 
                ON cv.key = cvd.key_compra_venta

 
				
            WHERE cv.key_cliente = $1
              AND cv.key_empresa = $2
              AND cvd.estado > 0
--              AND cv.fecha_on BETWEEN $3::timestamp AND $4::timestamp

			  AND cv.fecha_on >= $3::timestamp
			AND cv.fecha_on < ($4::timestamp + interval '1 day')

        )
        SELECT json_agg(to_json(sq.*))
        FROM (
            SELECT 
                key_compra_venta,
                fecha_on,
                tipo,
                descripcion,
                debe,
                haber,
                SUM(debe - haber) OVER (
                    ORDER BY fecha_on ASC, key_compra_venta ASC
                ) AS saldo,
                nota,
                key_moneda,
                key_sucursal,
                key_almacen,
                key_empresa,
                key_usuario
            FROM movimientos
        ) sq
    $sql$ INTO respuesta
    USING _key_cliente, _key_empresa, _fecha_inicio, _fecha_fin;

    RETURN respuesta;
END;
$_$;


ALTER FUNCTION public._get_detalles_bycliente2(_key_empresa character varying, _key_cliente character varying, _fecha_inicio character varying, _fecha_fin character varying) OWNER TO postgres;

--
-- Name: _get_detalles_bycliente3(character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_detalles_bycliente3(_key_empresa character varying, _key_cliente character varying, _fecha_inicio character varying, _fecha_fin character varying) RETURNS json
    LANGUAGE plpgsql
    AS $_$
DECLARE
    respuesta json;
BEGIN
    EXECUTE $sql$
        WITH totales AS (
            SELECT 
                cv.key,
                SUM(cvd.precio_unitario_base * cvd.cantidad) AS total_detalle
            FROM compra_venta cv
            JOIN compra_venta_detalle cvd 
                ON cv.key = cvd.key_compra_venta
            WHERE cv.key_cliente = $1
              AND cv.key_empresa = $2
              AND cvd.estado > 0
            GROUP BY cv.key
        ),

        movimientos AS (
            -- 💰 CUOTAS
            SELECT 
                cu.key_compra_venta,
                cu.fecha_on,
                'Cuota' AS tipo,
                'Cuota Amortizado' AS descripcion,
                0 AS debe,
                cu.total_amortizado AS haber,
                cv.key_moneda,
                cv.key_sucursal,
                cv.key_almacen,
                cv.key_empresa,
                cv.key_usuario,
                'haber' AS nota
            FROM cuota cu
            INNER JOIN compra_venta cv 
                ON cv.key = cu.key_compra_venta
            WHERE cv.key_cliente = $1
              AND cv.key_empresa = $2
              AND cu.total_amortizado IS NOT NULL
              AND cu.estado > 0
              AND cu.fecha_on >= $3::timestamp
              AND cu.fecha_on < ($4::timestamp + interval '1 day')

            UNION ALL

            -- 🧾 DETALLES (con descuento proporcional)
            SELECT 
                cvd.key_compra_venta,
                cv.fecha_on,
                cv.tipo AS tipo,
                cvd.descripcion AS descripcion,

                (
                    (cvd.precio_unitario_base * cvd.cantidad)
                    - (
                        (cvd.precio_unitario_base * cvd.cantidad)
                        / NULLIF(t.total_detalle, 0)
                      ) * COALESCE(cv.descuento, 0)
                ) AS debe,

                0 AS haber,
                cv.key_moneda,
                cv.key_sucursal,
                cv.key_almacen,
                cv.key_empresa,
                cv.key_usuario,
                'debe' AS nota

            FROM compra_venta_detalle cvd
            INNER JOIN compra_venta cv 
                ON cv.key = cvd.key_compra_venta
            INNER JOIN totales t
                ON t.key = cv.key
            WHERE cv.key_cliente = $1
              AND cv.key_empresa = $2
              AND cvd.estado > 0
              AND cv.fecha_on >= $3::timestamp
              AND cv.fecha_on < ($4::timestamp + interval '1 day')
        )

        SELECT COALESCE(json_agg(to_json(sq.*)), '[]'::json)
        FROM (
            SELECT 
                key_compra_venta,
                fecha_on,
                tipo,
                descripcion,
                debe,
                haber,
                SUM(debe - haber) OVER (
                    ORDER BY fecha_on ASC, key_compra_venta ASC
                ) AS saldo,
                nota,
                key_moneda,
                key_sucursal,
                key_almacen,
                key_empresa,
                key_usuario
            FROM movimientos
        ) sq
    $sql$
    INTO respuesta
    USING _key_cliente, _key_empresa, _fecha_inicio, _fecha_fin;

    RETURN respuesta;
END;
$_$;


ALTER FUNCTION public._get_detalles_bycliente3(_key_empresa character varying, _key_cliente character varying, _fecha_inicio character varying, _fecha_fin character varying) OWNER TO postgres;

--
-- Name: _get_detalles_bycliente4(character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_detalles_bycliente4(_key_empresa character varying, _key_cliente character varying, _fecha_inicio character varying, _fecha_fin character varying) RETURNS json
    LANGUAGE plpgsql
    AS $_$
DECLARE
    respuesta json;
BEGIN
    EXECUTE $sql$
        WITH movimientos AS (
            -- 💰 CUOTAS (pagos)
            SELECT 
                cu.key_compra_venta,
                cuota_amortizacion.fecha_on,
                'Cuota' AS tipo,
                'Cuota Amortizado' AS descripcion,
                0 AS debe,
                cuota_amortizacion.monto AS haber,
                cuota_amortizacion.key_moneda,
                cv.key_sucursal,
                cv.key_almacen,
                cv.key_empresa,
                cuota_amortizacion.key_usuario,
                'haber' AS nota
            FROM cuota_amortizacion JOIN cuota cu ON cu.key = cuota_amortizacion.key_cuota
            INNER JOIN compra_venta cv 
                ON cv.key = cu.key_compra_venta
            WHERE cv.key_cliente = $1
              AND cv.key_empresa = $2
              AND cu.total_amortizado IS NOT NULL
              AND cu.estado > 0
             -- AND cu.fecha_on >= $3::timestamp
            --  AND cu.fecha_on < ($4::timestamp + interval '1 day')

            UNION ALL

            -- 🧾 DETALLES (sin descuento)
            SELECT 
                cvd.key_compra_venta,
                cv.fecha_on,
                cv.tipo AS tipo,
                cvd.descripcion AS descripcion,
                (cvd.precio_unitario_base * cvd.cantidad) AS debe,
                0 AS haber,
                cv.key_moneda,
                cv.key_sucursal,
                cv.key_almacen,
                cv.key_empresa,
                cv.key_usuario,
                'debe' AS nota
            FROM compra_venta_detalle cvd
            INNER JOIN compra_venta cv 
                ON cv.key = cvd.key_compra_venta
            WHERE cv.key_cliente = $1
              AND cv.key_empresa = $2
              AND cvd.estado > 0
            --  AND cv.fecha_on >= $3::timestamp
            --  AND cv.fecha_on < ($4::timestamp + interval '1 day')

            UNION ALL

            -- 💸 DESCUENTOS (como fila separada en haber)
            SELECT
                cv.key AS key_compra_venta,
                cv.fecha_on,
                'Descuento' AS tipo,
                'Descuento aplicado' AS descripcion,
                0 AS debe,
                COALESCE(cv.descuento,0) AS haber,
                cv.key_moneda,
                cv.key_sucursal,
                cv.key_almacen,
                cv.key_empresa,
                cv.key_usuario,
                'haber' AS nota
            FROM compra_venta cv
            WHERE cv.key_cliente = $1
              AND cv.key_empresa = $2
              AND cv.descuento IS NOT NULL AND cv.descuento > 0
            --  AND cv.fecha_on >= $3::timestamp
            --  AND cv.fecha_on < ($4::timestamp + interval '1 day')
        )

        SELECT COALESCE(json_agg(to_json(sq.*)), '[]'::json)
        FROM (
            SELECT 
                key_compra_venta,
                fecha_on,
                tipo,
                descripcion,
                debe,
                haber,
                SUM(debe - haber) OVER (
                    ORDER BY fecha_on ASC, key_compra_venta ASC
                ) AS saldo,
                nota,
                key_moneda,
                key_sucursal,
                key_almacen,
                key_empresa,
                key_usuario
            FROM movimientos
            order by fecha_on asc
        ) sq
    $sql$
    INTO respuesta
    USING _key_cliente, _key_empresa, _fecha_inicio, _fecha_fin;

    RETURN respuesta;
END;
$_$;


ALTER FUNCTION public._get_detalles_bycliente4(_key_empresa character varying, _key_cliente character varying, _fecha_inicio character varying, _fecha_fin character varying) OWNER TO postgres;

--
-- Name: _get_detalles_bycliente6(character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_detalles_bycliente6(_key_empresa character varying, _key_cliente character varying, _fecha_inicio character varying, _fecha_fin character varying) RETURNS json
    LANGUAGE plpgsql
    AS $_$
DECLARE
    respuesta json;
BEGIN
    EXECUTE $sql$
        WITH movimientos AS (
            -- 💰 CUOTAS (pagos)
            SELECT 
                cu.key AS key_cuota,
                cu.key_compra_venta,
                cu.fecha_on,
                'Cuota' AS tipo,
                'Cuota amortizado' AS descripcion,
                cu.descripcion AS otros,
                0 AS monto,
                cu.total_amortizado AS monto_amortizado,
                cv.key_moneda,
                cv.key_sucursal,
                cv.key_almacen,
                cv.key_empresa,
                cv.key_usuario
            FROM cuota cu
            INNER JOIN compra_venta cv 
                ON cv.key = cu.key_compra_venta
            WHERE cv.key_cliente = $1
              AND cv.key_empresa = $2
              AND cu.total_amortizado IS NOT NULL
              AND cu.estado > 0
              AND cu.fecha_on >= $3::timestamp
              AND cu.fecha_on < ($4::timestamp + interval '1 day')

            UNION ALL

            -- 🧾 VENTA (una sola fila + cuota asociada)
            SELECT 
                cu.key AS key_cuota,
                cv.key AS key_compra_venta,
                cv.fecha_on,
                cv.tipo AS tipo,
                'Venta (' || COALESCE(STRING_AGG(cvd.descripcion, ', '), '') || ')' AS descripcion,
                cu.descripcion AS otros,
                (SUM(cvd.precio_unitario_base * cvd.cantidad) - COALESCE(cv.descuento,0)) AS monto,
                0 AS monto_amortizado,
                cv.key_moneda,
                cv.key_sucursal,
                cv.key_almacen,
                cv.key_empresa,
                cv.key_usuario
            FROM compra_venta cv
            LEFT JOIN LATERAL (
                SELECT cu.key, cu.descripcion, cu.total_amortizado
                FROM cuota cu
                WHERE cu.key_compra_venta = cv.key
                  AND cu.estado > 0
                ORDER BY cu.fecha_on ASC
                LIMIT 1
            ) cu ON TRUE
            INNER JOIN compra_venta_detalle cvd
                ON cv.key = cvd.key_compra_venta
            WHERE cv.key_cliente = $1
              AND cv.key_empresa = $2
              AND cvd.estado > 0
              AND cv.fecha_on >= $3::timestamp
              AND cv.fecha_on < ($4::timestamp + interval '1 day')
            GROUP BY 
                cv.key,
                cv.fecha_on,
                cv.tipo,
                cv.descuento,
                cv.key_moneda,
                cv.key_sucursal,
                cv.key_almacen,
                cv.key_empresa,
                cv.key_usuario,
                cu.key,
                cu.descripcion,
                cu.total_amortizado
        )
        SELECT json_agg(sq)
        FROM (
            SELECT 
                key_cuota,
                key_compra_venta,
                fecha_on,
                tipo,
                descripcion,
                CASE 
                    WHEN monto_amortizado > 0 THEN 'Cuota amortizado'
                    ELSE otros
                END AS otros,
                monto,
                monto_amortizado,
                SUM(monto - monto_amortizado) OVER (
                    ORDER BY fecha_on ASC, key_compra_venta ASC
                ) AS saldo,
                key_moneda,
                key_sucursal,
                key_almacen,
                key_empresa,
                key_usuario
            FROM movimientos
            ORDER BY fecha_on ASC, key_compra_venta ASC
        ) sq
    $sql$
    INTO respuesta
    USING _key_cliente, _key_empresa, _fecha_inicio, _fecha_fin;

    RETURN respuesta;
END;
$_$;


ALTER FUNCTION public._get_detalles_bycliente6(_key_empresa character varying, _key_cliente character varying, _fecha_inicio character varying, _fecha_fin character varying) OWNER TO postgres;

--
-- Name: _get_detalles_bycliente7(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_detalles_bycliente7(_key_empresa character varying, _key_cliente character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta json;
BEGIN
    SELECT json_agg(sq)
    INTO respuesta
    FROM (
        SELECT 
            cu.key as key_cuota, 
cu.key_compra_venta, cv.key_sucursal, cv.key_almacen, cv.key_empresa, cu.key_moneda,
cu.key_usuario, cu.fecha_on, cu.descripcion, cu.monto, cu.total_amortizado, cu.monto_base, cu.total_amortizado_base, cu.fecha_pago

        FROM cuota cu
        INNER JOIN compra_venta cv 
            ON cv.key = cu.key_compra_venta
        WHERE cv.key_cliente = _key_cliente
          AND cv.key_empresa = _key_empresa
          AND cv.estado > 0
          AND cu.estado > 0
               AND cu.monto IS DISTINCT FROM cu.total_amortizado
        --  AND cu.fecha_on >= _fecha_inicio::timestamp
       --   AND cu.fecha_on < (_fecha_fin::timestamp + interval '1 day')
        ORDER BY cu.fecha_on ASC, cu.key_compra_venta ASC
    ) sq;

    RETURN respuesta;
END;
$$;


ALTER FUNCTION public._get_detalles_bycliente7(_key_empresa character varying, _key_cliente character varying) OWNER TO postgres;

--
-- Name: _get_detalles_bycliente7(character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_detalles_bycliente7(_key_empresa character varying, _key_cliente character varying, _fecha_inicio character varying, _fecha_fin character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta json;
BEGIN
    SELECT json_agg(sq)
    INTO respuesta
    FROM (
        SELECT 
            cu.key as key_cuota, 
cu.key_compra_venta, cv.key_sucursal, cv.key_almacen, cv.key_empresa, cu.key_moneda,
cu.key_usuario, cu.fecha_on, cu.descripcion, cu.monto, cu.total_amortizado, cu.monto_base, cu.total_amortizado_base, cu.fecha_pago

        FROM cuota cu
        INNER JOIN compra_venta cv 
            ON cv.key = cu.key_compra_venta
        WHERE cv.key_cliente = _key_cliente
          AND cv.key_empresa = _key_empresa
          AND cv.estado > 0
          AND cu.estado > 0
               AND cu.monto IS DISTINCT FROM cu.total_amortizado
          AND cu.fecha_on >= _fecha_inicio::timestamp
          AND cu.fecha_on < (_fecha_fin::timestamp + interval '1 day')
        ORDER BY cu.fecha_on ASC, cu.key_compra_venta ASC
    ) sq;

    RETURN respuesta;
END;
$$;


ALTER FUNCTION public._get_detalles_bycliente7(_key_empresa character varying, _key_cliente character varying, _fecha_inicio character varying, _fecha_fin character varying) OWNER TO postgres;

--
-- Name: _get_ventas_cliente(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_ventas_cliente(_key_cliente character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    
    
    respuesta character varying;
	s_consulta character varying;

BEGIN

s_consulta :=E' SELECT
				
                json_agg( to_json(sq.*))::json as json 
				FROM (
 SELECT 
 
 cv.*, 
 
 ( SELECT to_json (sq1) FROM ( SELECT ROUND(cvd.cantidad * cvd.precio_unitario * 100) / 100 AS monto, ROUND(cvd.cantidad * cvd.precio_unitario_base * 100) / 100 AS monto_base, cvd.* FROM compra_venta_detalle cvd WHERE cvd.key_compra_venta = cv.key ) sq1 ) AS detalle_items,

   ( SELECT to_json(sq1) 
              FROM (
                    SELECT
 						cv.tipo_cambio,
						COUNT(c.key) AS cantidad,
						cv.descripcion as descripcion,
						cv.observacion as observacion,
                        ROUND(SUM(c.monto_base)::numeric, 2) AS monto_total_base,
                         ROUND(COALESCE(SUM(ca.monto_base),0)::numeric, 2) AS total_amortizado_base,
                        ROUND(COALESCE(SUM(ca.monto_base)/cv.tipo_cambio,0)::numeric, 2) AS total_amortizado,
                        ROUND((SUM(c.monto_base) - COALESCE(SUM(ca.monto_base),0))::numeric, 2) AS saldo_base,
                        ROUND(((SUM(c.monto_base) - COALESCE(SUM(ca.monto_base),0))/cv.tipo_cambio)::numeric, 2) AS saldo,
                        CASE WHEN (SUM(c.monto_base) - COALESCE(SUM(ca.monto_base),0)) = 0 THEN ''Pagado'' WHEN MAX(c.fecha) < CURRENT_DATE THEN ''En mora'' ELSE ''Pendiente'' END AS estado_compra
                    FROM cuota c
                    LEFT JOIN cuota_amortizacion ca ON ca.key_cuota = c.key
                    WHERE c.key_compra_venta = cv.key
              ) sq1
            ) AS detalle_items2,
			

( SELECT to_json(sq1) FROM ( SELECT cv.tipo_cambio, ROUND(SUM(coalesce(cuota.monto_amortizado,0) / cv.tipo_cambio )::numeric, 2) AS monto, SUM(coalesce(cuota.monto_amortizado,0)) AS monto_base, COUNT(cuota.key) AS cantidad FROM ( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) AS monto_amortizado FROM cuota LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota WHERE cuota.key_compra_venta = cv.key GROUP BY cuota.key ) cuota WHERE cuota.monto_amortizado > 0 ) sq1 ) AS cuotas_en_amortizacion,
( SELECT to_json(sq1) FROM ( SELECT cv.tipo_cambio, ROUND(  SUM((coalesce(cuota.monto_base,0)-coalesce(cuota.monto_amortizado,0))/cv.tipo_cambio)::numeric, 2) as monto, SUM((coalesce(cuota.monto_base,0)-coalesce(cuota.monto_amortizado,0))) as monto_base, COUNT(CASE WHEN cuota.fecha_pago IS NULL AND (cuota.fecha::date >= now()::date) THEN 1 END) AS cantidad FROM( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) as monto_amortizado FROM cuota LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota WHERE cuota.key_compra_venta = cv.key and cuota.fecha_pago IS NULL AND cuota.fecha::date >= now()::date group by cuota.key ) cuota WHERE cuota.monto_base > cuota.monto_amortizado ) sq1 ) AS cuotas_en_pendientes,
( SELECT to_json(sq1) FROM ( SELECT cv.tipo_cambio, ROUND(  SUM((coalesce(cuota.monto_base,0)-coalesce(cuota.monto_amortizado,0))/cv.tipo_cambio)::numeric, 2) as monto, SUM((coalesce(cuota.monto_base,0)-coalesce(cuota.monto_amortizado,0))) as monto_base, COUNT(CASE WHEN cuota.fecha_pago IS NULL AND (cuota.fecha::date < now()::date) THEN 1 END) AS cantidad FROM( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) as monto_amortizado FROM cuota LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota WHERE cuota.key_compra_venta = cv.key and cuota.fecha_pago IS NULL AND cuota.fecha::date < now()::date group by cuota.key ) cuota WHERE cuota.monto_base > cuota.monto_amortizado ) sq1 ) AS cuotas_en_mora,
( SELECT to_json(sq1) FROM ( SELECT SUM((coalesce(cuota.monto_base,0)-coalesce(cuota.monto_amortizado,0))) as monto, COUNT(CASE WHEN cuota.fecha_pago IS NULL AND (cuota.fecha::date < now()::date) THEN 1 END) AS cantidad FROM( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) as monto_amortizado FROM cuota LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota WHERE cuota.key_compra_venta = cv.key and cuota.fecha_pago IS NULL AND cuota.fecha::date < now()::date group by cuota.key ) cuota WHERE cuota.monto_base > cuota.monto_amortizado ) sq1 ) AS cuotas_en_mora3,
( SELECT to_json(sq1) FROM ( SELECT SUM((coalesce(cuota.monto_base,0) - coalesce(cuota.monto_amortizado,0))) AS monto, COUNT(cuota.key) AS cantidad FROM ( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) AS monto_amortizado FROM cuota LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota WHERE cuota.key_compra_venta = cv.key AND cuota.fecha_pago IS NULL AND cuota.fecha::date >= now()::date GROUP BY cuota.key ) cuota WHERE cuota.monto_base > cuota.monto_amortizado ) sq1 ) AS cuotas_en_pendientes3,
( SELECT to_json(sq1) FROM ( SELECT cv.tipo_cambio, SUM(cuota.monto_base) AS monto_base, ROUND(SUM(coalesce(cuota.monto,0) / cv.tipo_cambio )::numeric, 2) AS monto, COUNT(cuota.key) AS cantidad FROM cuota WHERE cuota.key_compra_venta = cv.key ) sq1 ) AS cuotas_total

FROM compra_venta cv
 					WHERE cv.key_cliente = \''||_key_cliente||E'\'
					  AND cv.tipo = \'venta\'
					  AND cv.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public._get_ventas_cliente(_key_cliente character varying) OWNER TO postgres;

--
-- Name: _get_ventas_cliente100(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_ventas_cliente100(_key_cliente character varying) RETURNS json
    LANGUAGE plpgsql
    AS $_$
DECLARE
    respuesta json;
    s_consulta text;
BEGIN
    s_consulta := E'
    SELECT json_agg(to_json(sq.*))::json as json
    FROM (
        SELECT 
            cv.*, 

            -- detalle_items
            (SELECT json_agg(sq1) FROM (
                SELECT 
                    ROUND((cvd.cantidad * cvd.precio_unitario)::numeric, 2) AS monto,
                    ROUND((cvd.cantidad * cvd.precio_unitario_base)::numeric, 2) AS monto_base,
                    cvd.*
                FROM compra_venta_detalle cvd
                WHERE cvd.key_compra_venta = cv.key
            ) sq1) AS detalle_items,

            -- detalle_items2
            (SELECT json_agg(sq1) FROM (
                SELECT
                    cv.tipo_cambio,
                    COUNT(c.key) AS cantidad,
                    cv.descripcion AS descripcion,
                    cv.observacion AS observacion,
                    ROUND(SUM(c.monto_base)::numeric, 2) AS monto_total_base,
                    ROUND(COALESCE(SUM(ca.monto_base),0)::numeric, 2) AS total_amortizado_base,
                    ROUND(COALESCE(SUM(ca.monto_base)/cv.tipo_cambio,0)::numeric, 2) AS total_amortizado,
                    ROUND((SUM(c.monto_base) - COALESCE(SUM(ca.monto_base),0))::numeric, 2) AS saldo_base,
                    ROUND(((SUM(c.monto_base) - COALESCE(SUM(ca.monto_base),0))/cv.tipo_cambio)::numeric, 2) AS saldo,
                    CASE 
                        WHEN (SUM(c.monto_base) - COALESCE(SUM(ca.monto_base),0)) = 0 THEN ''Pagado''
                        WHEN MAX(c.fecha) < CURRENT_DATE THEN ''En mora''
                        ELSE ''Pendiente''
                    END AS estado_compra
                FROM cuota c
                LEFT JOIN cuota_amortizacion ca ON ca.key_cuota = c.key
                WHERE c.key_compra_venta = cv.key
            ) sq1) AS detalle_items2,

            -- cuotas_en_amortizacion
            (SELECT json_agg(sq1) FROM (
                SELECT 
                    cv.tipo_cambio,
                    ROUND(SUM((coalesce(cuota.monto_amortizado,0)/cv.tipo_cambio)::numeric), 2) AS monto,
                    SUM(coalesce(cuota.monto_amortizado,0)) AS monto_base,
                    COUNT(cuota.key) AS cantidad
                FROM (
                    SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) AS monto_amortizado
                    FROM cuota
                    LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota
                    WHERE cuota.key_compra_venta = cv.key
                    GROUP BY cuota.key
                ) cuota
                WHERE cuota.monto_amortizado > 0
            ) sq1) AS cuotas_en_amortizacion,

            -- cuotas_en_pendientes
            (SELECT json_agg(sq1) FROM (
                SELECT 
                    cv.tipo_cambio,
                    ROUND(SUM(((coalesce(cuota.monto_base,0)-coalesce(cuota.monto_amortizado,0))/cv.tipo_cambio)::numeric), 2) AS monto,
                    SUM((coalesce(cuota.monto_base,0)-coalesce(cuota.monto_amortizado,0))) AS monto_base,
                    COUNT(CASE WHEN cuota.fecha_pago IS NULL AND cuota.fecha >= now()::date THEN 1 END) AS cantidad
                FROM (
                    SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) AS monto_amortizado
                    FROM cuota
                    LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota
                    WHERE cuota.key_compra_venta = cv.key
                        AND cuota.fecha_pago IS NULL
                        AND cuota.fecha >= now()::date
                    GROUP BY cuota.key
                ) cuota
                WHERE cuota.monto_base > cuota.monto_amortizado
            ) sq1) AS cuotas_en_pendientes,

            -- cuotas_en_mora
            (SELECT json_agg(sq1) FROM (
                SELECT 
                    cv.tipo_cambio,
                    ROUND(SUM(((coalesce(cuota.monto_base,0)-coalesce(cuota.monto_amortizado,0))/cv.tipo_cambio)::numeric), 2) AS monto,
                    SUM((coalesce(cuota.monto_base,0)-coalesce(cuota.monto_amortizado,0))) AS monto_base,
                    COUNT(CASE WHEN cuota.fecha_pago IS NULL AND cuota.fecha < now()::date THEN 1 END) AS cantidad
                FROM (
                    SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) AS monto_amortizado
                    FROM cuota
                    LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota
                    WHERE cuota.key_compra_venta = cv.key
                        AND cuota.fecha_pago IS NULL
                        AND cuota.fecha < now()::date
                    GROUP BY cuota.key
                ) cuota
                WHERE cuota.monto_base > cuota.monto_amortizado
            ) sq1) AS cuotas_en_mora,

            -- cuotas_total
            (SELECT json_agg(sq1) FROM (
                SELECT 
                    cv.tipo_cambio,
                    SUM(cuota.monto_base) AS monto_base,
                    ROUND(SUM((coalesce(cuota.monto,0)/cv.tipo_cambio)::numeric), 2) AS monto,
                    COUNT(cuota.key) AS cantidad
                FROM cuota
                WHERE cuota.key_compra_venta = cv.key
            ) sq1) AS cuotas_total

        FROM compra_venta cv
        WHERE cv.key_cliente = $1
          AND cv.tipo = ''venta''
          AND cv.estado > 0
    ) sq
    ';

    EXECUTE s_consulta INTO respuesta USING _key_cliente;
    RETURN respuesta;
END;
$_$;


ALTER FUNCTION public._get_ventas_cliente100(_key_cliente character varying) OWNER TO postgres;

--
-- Name: _get_ventas_cliente2(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_ventas_cliente2(_key_cliente character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    
    
    respuesta character varying;
	s_consulta character varying;

BEGIN

s_consulta :=E' SELECT
				
                json_agg( to_json(sq.*))::json as json 
				FROM (
				
				SELECT cv.*,
( SELECT to_json (sq1) FROM ( SELECT ROUND(cvd.cantidad * cvd.precio_unitario * 100) / 100 AS monto, ROUND(cvd.cantidad * cvd.precio_unitario_base * 100) / 100 AS monto_base, cvd.* FROM compra_venta_detalle cvd WHERE cvd.key_compra_venta = cv.key ) sq1 ) AS detalle_items,

( SELECT to_json(sq1) FROM ( SELECT SUM(coalesce(cuota.monto_amortizado,0)) AS monto, COUNT(cuota.key) AS cantidad FROM ( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) AS monto_amortizado FROM cuota LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota WHERE cuota.key_compra_venta = cv.key GROUP BY cuota.key ) cuota WHERE cuota.monto_amortizado > 0 ) sq1 ) AS cuotas_en_amortizacion,
( SELECT to_json(sq1) FROM ( SELECT SUM((coalesce(cuota.monto_base,0)-coalesce(cuota.monto_amortizado,0))) as monto, COUNT(CASE WHEN cuota.fecha_pago IS NULL AND (cuota.fecha::date < now()::date) THEN 1 END) AS cantidad FROM( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) as monto_amortizado FROM cuota LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota WHERE cuota.key_compra_venta = cv.key and cuota.fecha_pago IS NULL AND cuota.fecha::date < now()::date group by cuota.key ) cuota WHERE cuota.monto_base > cuota.monto_amortizado ) sq1 ) AS cuotas_en_mora,
( SELECT to_json(sq1) FROM ( SELECT SUM(cuota.monto_base) AS monto, COUNT(cuota.key) AS cantidad FROM cuota WHERE cuota.key_compra_venta = cv.key ) sq1 ) AS cuotas_total,
( SELECT to_json(sq1) FROM ( SELECT SUM((coalesce(cuota.monto_base,0) - coalesce(cuota.monto_amortizado,0))) AS monto, COUNT(cuota.key) AS cantidad  FROM ( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) AS monto_amortizado FROM cuota LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota WHERE cuota.key_compra_venta = cv.key AND cuota.fecha_pago IS NULL AND cuota.fecha::date >= now()::date GROUP BY cuota.key ) cuota WHERE cuota.monto_base > cuota.monto_amortizado ) sq1 ) AS cuotas_en_pendientes

FROM compra_venta cv
 					WHERE cv.key_cliente = \''||_key_cliente||E'\'
					  AND cv.tipo = \'venta\'
					  AND cv.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public._get_ventas_cliente2(_key_cliente character varying) OWNER TO postgres;

--
-- Name: _get_ventas_cliente_actual(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_ventas_cliente_actual(_key_cliente character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta character varying;
BEGIN

EXECUTE '
    SELECT json_agg(to_json(sq.*)) AS resultado
    FROM (
        SELECT

   ( SELECT to_json(sq1) FROM ( SELECT cv.tipo_cambio, COUNT(c.key) AS cantidad, cv.descripcion as descripcion, cv.observacion as observacion, ROUND(SUM(c.monto_base)::numeric, 2) AS monto_total_base, ROUND(COALESCE(SUM(ca.monto_base),0)::numeric, 2) AS total_amortizado_base, ROUND(COALESCE(SUM(ca.monto_base)/cv.tipo_cambio,0)::numeric, 2) AS total_amortizado, ROUND((SUM(c.monto_base) - COALESCE(SUM(ca.monto_base),0))::numeric, 2) AS saldo_base, ROUND(((SUM(c.monto_base) - COALESCE(SUM(ca.monto_base),0))/cv.tipo_cambio)::numeric, 2) AS saldo, CASE WHEN (SUM(c.monto_base) - COALESCE(SUM(ca.monto_base),0)) = 0 THEN ''Pagado'' WHEN MAX(c.fecha) < CURRENT_DATE THEN ''En mora'' ELSE ''Pendiente'' END AS estado_compra FROM cuota c LEFT JOIN cuota_amortizacion ca ON ca.key_cuota = c.key WHERE c.key_compra_venta = cv.key ) sq1 ) AS detalle_items2,
   ( SELECT to_json(sq1) FROM ( SELECT cv.tipo_cambio, ROUND(SUM(coalesce(cuota.monto_amortizado,0) / cv.tipo_cambio )::numeric, 2) AS monto, SUM(coalesce(cuota.monto_amortizado,0)) AS monto_base, COUNT(cuota.key) AS cantidad FROM ( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) AS monto_amortizado FROM cuota LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota WHERE cuota.key_compra_venta = cv.key GROUP BY cuota.key ) cuota WHERE cuota.monto_amortizado > 0 ) sq1 ) AS cuotas_en_amortizacion,
   ( SELECT to_json(sq1) FROM ( SELECT cv.tipo_cambio, ROUND(SUM((coalesce(cuota.monto_base,0) - coalesce(cuota.monto_amortizado,0)) / cv.tipo_cambio)::numeric, 2) AS monto, SUM(coalesce(cuota.monto_base,0) - coalesce(cuota.monto_amortizado,0)) AS monto_base, COUNT(*) AS cantidad FROM ( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) AS monto_amortizado FROM cuota LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota WHERE cuota.key_compra_venta = cv.key AND cuota.fecha::date >= now()::date GROUP BY cuota.key ) cuota WHERE cuota.monto_base > coalesce(cuota.monto_amortizado,0) ) sq1 ) AS cuotas_en_pendientes,
   ( SELECT to_json(sq1) FROM ( SELECT cv.tipo_cambio, ROUND(SUM((coalesce(cuota.monto_base,0) - coalesce(cuota.monto_amortizado,0)) / cv.tipo_cambio)::numeric, 2) AS monto, SUM(coalesce(cuota.monto_base,0) - coalesce(cuota.monto_amortizado,0)) AS monto_base, COUNT(*) AS cantidad FROM ( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) AS monto_amortizado FROM cuota LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota WHERE cuota.key_compra_venta = cv.key AND cuota.fecha::date < now()::date GROUP BY cuota.key ) cuota WHERE cuota.monto_base > coalesce(cuota.monto_amortizado,0) ) sq1 ) AS cuotas_en_mora,
   ( SELECT to_json(sq1) FROM ( SELECT cv.tipo_cambio, ROUND(SUM(cuota.monto_base / cv.tipo_cambio)::numeric, 2) AS monto, SUM(cuota.monto_base) AS monto_base, COUNT(*) AS cantidad FROM cuota WHERE cuota.key_compra_venta = cv.key ) sq1 ) AS cuotas_total,

   
           cv.*

        FROM cuota c
        LEFT JOIN cuota_amortizacion ca ON ca.key_cuota = c.key
        JOIN compra_venta cv ON cv.key = c.key_compra_venta
        JOIN compra_venta_detalle cvd ON cvd.key_compra_venta = cv.key

        WHERE cv.key_cliente = ''' || _key_cliente || ''' 
          AND cv.tipo = ''venta''

        GROUP BY 
            cv.key, c.key, cv.tipo_cambio, cv.descripcion, cvd.descripcion, cvd.cantidad,
            cvd.precio_unitario, cvd.precio_unitario_base,
            c.monto_base, c.monto, c.fecha, c.fecha_on, cv.fecha_on,
            cv.key_moneda, c.codigo, c.observacion, c.key_usuario

    ) sq;
' INTO respuesta;

RETURN NEXT respuesta;

END;
$$;


ALTER FUNCTION public._get_ventas_cliente_actual(_key_cliente character varying) OWNER TO postgres;

--
-- Name: _get_ventas_cliente_backup(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_ventas_cliente_backup(_key_cliente character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    
    
    respuesta character varying;
	s_consulta character varying;

BEGIN

s_consulta :=E' SELECT
				
                json_agg( to_json(sq.*))::json as json 
				FROM (
 SELECT cv.*, ( SELECT to_json (sq1) FROM ( SELECT ROUND(cvd.cantidad * cvd.precio_unitario * 100) / 100 AS monto, ROUND(cvd.cantidad * cvd.precio_unitario_base * 100) / 100 AS monto_base, cvd.* FROM compra_venta_detalle cvd WHERE cvd.key_compra_venta = cv.key ) sq1 ) AS detalle_items,

 

			( SELECT to_json(sq1) 
              FROM (
                    SELECT
 						cv.tipo_cambio,
						COUNT(c.key) AS cantidad,
						cv.descripcion as descripcion,
						cv.observacion as observacion,			
	 					ROUND(SUM(cvd.cantidad * cvd.precio_unitario)::numeric, 2) AS monto,
					 	ROUND(SUM(cvd.cantidad * cvd.precio_unitario_base)::numeric, 2) AS monto_base, 
						ROUND(SUM(c.monto_base)::numeric, 2) AS monto_total_base,
                        ROUND(COALESCE(SUM(ca.monto_base),0)::numeric, 2) AS total_amortizado_base,
                        ROUND(COALESCE(SUM(ca.monto_base)/cv.tipo_cambio,0)::numeric, 2) AS total_amortizado,
                        ROUND((SUM(c.monto_base) - COALESCE(SUM(ca.monto_base),0))::numeric, 2) AS saldo_base,
                        ROUND(((SUM(c.monto_base) - COALESCE(SUM(ca.monto_base),0))/cv.tipo_cambio)::numeric, 2) AS saldo,
                        CASE WHEN (SUM(c.monto_base) - COALESCE(SUM(ca.monto_base),0)) = 0 THEN ''Pagado'' WHEN MAX(c.fecha) < CURRENT_DATE THEN ''En mora'' ELSE ''Pendiente'' END AS estado_compra
                    FROM cuota c
                    LEFT JOIN cuota_amortizacion ca ON ca.key_cuota = c.key
                    WHERE c.key_compra_venta = cv.key
              ) sq1
            ) AS detalle_items2,
			
	 					 

( SELECT to_json(sq1) FROM ( SELECT cv.tipo_cambio, ROUND(SUM(coalesce(cuota.monto_amortizado,0) / cv.tipo_cambio )::numeric, 2) AS monto, SUM(coalesce(cuota.monto_amortizado,0)) AS monto_base, COUNT(cuota.key) AS cantidad FROM ( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) AS monto_amortizado FROM cuota LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota WHERE cuota.key_compra_venta = cv.key GROUP BY cuota.key ) cuota WHERE cuota.monto_amortizado > 0 ) sq1 ) AS cuotas_en_amortizacion,
( SELECT to_json(sq1) FROM ( SELECT cv.tipo_cambio,
	 					-- ROUND(SUM(cvd.cantidad * cvd.precio_unitario)-coalesce(cuota.monto_amortizado,0) ::numeric, 2) AS monto,
					 	-- ROUND(SUM(cvd.cantidad * cvd.precio_unitario_base)-coalesce(cuota.monto_amortizado,0)::numeric, 2) AS monto_base, 
ROUND(  SUM((coalesce(cuota.monto_base,0)-coalesce(cuota.monto_amortizado,0))/cv.tipo_cambio)::numeric, 2) as monto2, SUM((coalesce(cuota.monto_base,0)-coalesce(cuota.monto_amortizado,0))) as monto_base2, COUNT(CASE WHEN cuota.fecha_pago IS NULL AND (cuota.fecha::date >= now()::date) THEN 1 END) AS cantidad FROM( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) as monto_amortizado FROM cuota LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota WHERE cuota.key_compra_venta = cv.key and cuota.fecha_pago IS NULL AND cuota.fecha::date >= now()::date group by cuota.key ) cuota WHERE cuota.monto_base > cuota.monto_amortizado ) sq1 ) AS cuotas_en_pendientes,

( SELECT to_json(sq1) FROM ( SELECT cv.tipo_cambio, 

 -- sigo aqui trabjanadooooo ROUND(SUM(coalesce(SUM(cvd.cantidad * cvd.precio_unitario),0)-coalesce(cuota.monto_amortizado,0))::numeric, 2) as monto2h, 
 
	 					ROUND(SUM(cvd.cantidad * cvd.precio_unitario)::numeric, 2) AS monto,
					 	ROUND(SUM(cvd.cantidad * cvd.precio_unitario_base)::numeric, 2) AS monto_base, 
						 
ROUND(SUM((coalesce(cuota.monto_base,0)-coalesce(cuota.monto_amortizado,0))/cv.tipo_cambio)::numeric, 2) as monto2, SUM((coalesce(cuota.monto_base,0)-coalesce(cuota.monto_amortizado,0))) as monto_base2, COUNT(CASE WHEN cuota.fecha_pago IS NULL AND (cuota.fecha::date < now()::date) THEN 1 END) AS cantidad FROM( SELECT cuota.*, SUM(coalesce(cuota_amortizacion.monto,0)) as monto_amortizado FROM cuota LEFT JOIN cuota_amortizacion ON cuota.key = cuota_amortizacion.key_cuota WHERE cuota.key_compra_venta = cv.key and cuota.fecha_pago IS NULL AND cuota.fecha::date < now()::date group by cuota.key ) cuota WHERE cuota.monto_base > cuota.monto_amortizado ) sq1 ) AS cuotas_en_mora,

( SELECT to_json(sq1) FROM ( SELECT cv.tipo_cambio, ROUND(SUM(cvd.cantidad * cvd.precio_unitario)::numeric, 2) AS monto,ROUND(SUM(cvd.cantidad * cvd.precio_unitario_base)::numeric, 2) AS monto_base, COUNT(cuota.key) AS cantidad FROM cuota WHERE cuota.key_compra_venta = cv.key ) sq1 ) AS cuotas_total

 					FROM compra_venta cv 
					JOIN compra_venta_detalle cvd ON cvd.key_compra_venta = cv.key 
 					WHERE cv.key_cliente = \''||_key_cliente||E'\'
					AND cv.tipo = \'venta\'
					AND cv.estado > 0
					GROUP BY  cv.key
					  
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public._get_ventas_cliente_backup(_key_cliente character varying) OWNER TO postgres;

--
-- Name: _pdf(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._pdf(_key_compra_venta character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta character varying;
    s_consulta character varying;
BEGIN
    s_consulta := E'
        SELECT json_agg(to_json(sq.*))::text AS resultado
        FROM (
            SELECT 
                cv.key,
                cv.fecha_on,
                cv.tipo,
                cv.tipo_pago,
                cv.facturar AS conFactura,
                cv.key_empresa,
                cv.key_sucursal,
                cv.key_moneda,
                cv.tipo_cambio,
                cv.state AS estado,
                cv.descripcion,
                COALESCE(cv.descuento, 0) AS descuento,
                cv.key_proveedor,
                cv.key_cliente,
                cv.key_usuario AS key_cajero,
                COALESCE(
                    json_agg(
                        json_build_object(
                            ''key'', cvd.key,
                            ''descripcion'', cvd.descripcion,
                            ''cantidad'', cvd.cantidad,
                            ''precio_unitario'', cvd.precio_unitario
                        )
                    ) FILTER (WHERE cvd.key IS NOT NULL),
                    ''[]''::json
                ) AS detalle,
                COALESCE(
                    SUM(cvd.cantidad * cvd.precio_unitario),
                    0
                ) AS monto_pagado,
                COALESCE(
                    SUM(COALESCE(cvd.descuento, 0)),
                    0
                ) AS monto_descuento_total,
                0 AS monto_gift_card
            FROM compra_venta cv
            LEFT JOIN compra_venta_detalle cvd ON cv.key = cvd.key_compra_venta
            WHERE cv.key = ''' || _key_compra_venta || '''
            GROUP BY 
                cv.key,
                cv.fecha_on,
                cv.tipo,
                cv.tipo_pago,
                cv.facturar,
                cv.key_empresa,
                cv.key_sucursal,
                cv.key_moneda,
                cv.tipo_cambio,
                cv.state,
                cv.descripcion,
                cv.descuento,
                cv.key_proveedor,
                cv.key_cliente,
                cv.key_usuario
        ) sq;
    ';
    
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public._pdf(_key_compra_venta character varying) OWNER TO postgres;

--
-- Name: actualizar_cuota_amortizacion(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_cuota_amortizacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    total double precision;
	total_base double precision;
BEGIN
    -- Calcular el total amortizado actual para la cuota
    SELECT COALESCE(SUM(monto),0)
    INTO total
    FROM cuota_amortizacion
    WHERE key_cuota = COALESCE(NEW.key_cuota, OLD.key_cuota)
	AND estado > 0;
	
	SELECT COALESCE(SUM(monto_base),0)
    INTO total_base
    FROM cuota_amortizacion
    WHERE key_cuota = COALESCE(NEW.key_cuota, OLD.key_cuota)
	AND estado > 0;
    -- Actualizar la cuota
    UPDATE cuota
    SET 
        total_amortizado = total,
		total_amortizado_base = total_base,
        fecha_pago = CASE WHEN total >= monto THEN NOW() ELSE NULL END
    WHERE key = COALESCE(NEW.key_cuota, OLD.key_cuota);

    RETURN NULL;
END;
$$;


ALTER FUNCTION public.actualizar_cuota_amortizacion() OWNER TO postgres;

--
-- Name: anular(character varying, character varying[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.anular(_nombre_tabla character varying, _keys character varying[]) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
    _key character varying;
BEGIN
    FOREACH _key IN ARRAY _keys
    LOOP
        s_consulta :=E' update '||_nombre_tabla||E' set estado = 0 where key = \''||_key||E'\'';
        EXECUTE s_consulta;
    END LOOP;
END;
$$;


ALTER FUNCTION public.anular(_nombre_tabla character varying, _keys character varying[]) OWNER TO postgres;

--
-- Name: anular(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.anular(_nombre_tabla character varying, _key character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' update '||_nombre_tabla||E' set estado = 0 where key = \''||_key||E'\'';
    EXECUTE s_consulta;
	RETURN;
END;
$$;


ALTER FUNCTION public.anular(_nombre_tabla character varying, _key character varying) OWNER TO postgres;

--
-- Name: anular(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.anular(_nombre_tabla character varying, _key character varying, _valor character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' update '||_nombre_tabla||E' set estado = 0 where '||_key||E' = \''||_valor||E'\'';
    EXECUTE s_consulta;
	RETURN;
END;
$$;


ALTER FUNCTION public.anular(_nombre_tabla character varying, _key character varying, _valor character varying) OWNER TO postgres;

--
-- Name: compra_venta_detalle_pendentes(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.compra_venta_detalle_pendentes(_key_compra_venta_detalle character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' select 
						compra_venta_detalle.cantidad-
						coalesce (  (
							select sum(compra_venta_detalle_producto.cantidad)
							from compra_venta_detalle_producto
							where compra_venta_detalle_producto.key_compra_venta_detalle = compra_venta_detalle.key
						), 0) as cantidad
					from compra_venta,
					compra_venta_detalle
					where compra_venta_detalle.key_compra_venta = compra_venta.key
					and compra_venta.state = \'comprado\'
					and compra_venta.tipo = \'compra\'
					and compra_venta.estado > 0
					and compra_venta_detalle.key = \''||_key_compra_venta_detalle||E'\'
					';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.compra_venta_detalle_pendentes(_key_compra_venta_detalle character varying) OWNER TO postgres;

--
-- Name: compras_sin_recepcionar(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.compras_sin_recepcionar(_key_sucursal character varying) RETURNS SETOF character varying
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
				select * from (
					select  compra_venta_detalle.key,
						compra_venta_detalle.key_compra_venta,
						compra_venta_detalle.fecha_on,
						compra_venta_detalle.estado,
						compra_venta_detalle.tipo,
						compra_venta_detalle.descripcion,
						compra_venta_detalle.observacion,
						compra_venta_detalle.cantidad-
						COALESCE( (
							select sum(compra_venta_detalle_producto.cantidad)
							from compra_venta_detalle_producto
							where compra_venta_detalle_producto.key_compra_venta_detalle = compra_venta_detalle.key
						), 0) as cantidad,
						compra_venta.proveedor,
						compra_venta_detalle.precio_unitario,
						compra_venta_detalle.descuento,
						compra_venta_detalle.key_usuario
					from compra_venta,
					compra_venta_detalle
					where compra_venta_detalle.key_compra_venta = compra_venta.key
					and compra_venta_detalle.tipo in (\'inventario\', \'activo_fijo\')
					and compra_venta.state like \'comprado\'
					and compra_venta.tipo like \'compra\'
					and compra_venta.estado > 0
					and compra_venta.key_sucursal = \''||_key_sucursal||E'\'
					)sq2
					where sq2.cantidad > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.compras_sin_recepcionar(_key_sucursal character varying) OWNER TO postgres;

--
-- Name: compras_sin_recepcionar_all(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.compras_sin_recepcionar_all(_key_servicio character varying) RETURNS SETOF character varying
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
				select * from (
					select  compra_venta_detalle.key,
						compra_venta_detalle.key_compra_venta,
						compra_venta_detalle.fecha_on,
						compra_venta_detalle.estado,
						compra_venta_detalle.descripcion,
						compra_venta_detalle.observacion,
						compra_venta_detalle.cantidad-
						(
							select sum(compra_venta_detalle_producto.cantidad)
							from compra_venta_detalle_producto
							where compra_venta_detalle_producto.key_compra_venta_detalle = compra_venta_detalle.key
						) as cantidad,
						compra_venta.proveedor,
						compra_venta_detalle.precio_unitario,
						compra_venta_detalle.descuento,
						compra_venta_detalle.key_usuario
					from compra_venta,
					compra_venta_detalle
					where compra_venta_detalle.key_compra_venta = compra_venta.key
					and compra_venta_detalle.tipo like \'producto\'
					and compra_venta.state like \'comprado\'
					and compra_venta.tipo like \'compra\'
					and compra_venta.estado > 0
					and compra_venta.key_servicio = \''||_key_servicio||E'\'
					)sq2
					where sq2.cantidad > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.compras_sin_recepcionar_all(_key_servicio character varying) OWNER TO postgres;

--
-- Name: compras_totales_por_mes(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.compras_totales_por_mes(p_key_empresa text) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        SELECT COALESCE(JSON_AGG(
            JSON_BUILD_OBJECT(
                'mes', sub.mes,
                'mes_formateado', sub.mes_formateado,
                'cantidad_compras', sub.cantidad_compras,
                'total_bs', sub.total_bs
            )
        ), '[]'::JSON)
        FROM (
            SELECT
                DATE_TRUNC('month', cv.fecha_on) as mes,
                TO_CHAR(DATE_TRUNC('month', cv.fecha_on), 'YYYY-MM') as mes_formateado,
                COUNT(DISTINCT cv.key) as cantidad_compras,
                COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) as total_bs
            FROM compra_venta cv
            INNER JOIN compra_venta_detalle d ON cv.key = d.key_compra_venta
            WHERE cv.tipo = 'compra'
                AND cv.key_empresa = p_key_empresa
                AND cv.estado > 0  -- Filtro de estado añadido
            GROUP BY DATE_TRUNC('month', cv.fecha_on)
            ORDER BY mes DESC
        ) AS sub
    );
END;
$$;


ALTER FUNCTION public.compras_totales_por_mes(p_key_empresa text) OWNER TO postgres;

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
-- Name: get_all_compra_venta(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_compra_venta(_key_empresa character varying) RETURNS SETOF character varying
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
                    SELECT compra_venta.* 
					FROM compra_venta
					WHERE compra_venta.estado > 0
					and compra_venta.key_empresa = \''||_key_empresa||E'\'
					) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_compra_venta(_key_empresa character varying) OWNER TO postgres;

--
-- Name: get_amortizaciones(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_amortizaciones(_key_cuota character varying) RETURNS SETOF double precision
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta double precision;
    s_consulta character varying;
BEGIN

s_consulta :=E' 
					select  sum(cuota_amortizacion.monto) as monto
					from cuota_amortizacion
					where cuota_amortizacion.key_cuota = \''||_key_cuota||E'\'
					and cuota_amortizacion.estado > 0
					';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_amortizaciones(_key_cuota character varying) OWNER TO postgres;

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
-- Name: get_by_key(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_by_key(_nombre_tabla character varying, _key character varying, _value character varying) RETURNS SETOF character varying
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
					WHERE upper('||_nombre_tabla||E'.'||_key||E') = upper(\''||_value||E'\')
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_by_key(_nombre_tabla character varying, _key character varying, _value character varying) OWNER TO postgres;

--
-- Name: get_by_key(character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_by_key(_nombre_tabla character varying, _key character varying, _value character varying, _key1 character varying, _value1 character varying) RETURNS SETOF character varying
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
					WHERE upper('||_nombre_tabla||E'.'||_key||E') = upper(\''||_value||E'\')
					AND upper('||_nombre_tabla||E'.'||_key1||E') = upper(\''||_value1||E'\')
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_by_key(_nombre_tabla character varying, _key character varying, _value character varying, _key1 character varying, _value1 character varying) OWNER TO postgres;

--
-- Name: get_clientes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_clientes() RETURNS SETOF character varying
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
                jsonb_object_agg(sq.key_usuario, to_json(sq.*))::json as json 
				FROM (
					
					select compra_venta.cliente ->> \'key_usuario\' as key_usuario,
					count(compra_venta.key) as cantidad,
					min(compra_venta.fecha_on) as primer_compra,
					max(compra_venta.fecha_on) as ultima_compra
					from compra_venta
					where compra_venta.state = \'vendido\'
					and compra_venta.estado > 0
					group by compra_venta.cliente ->> \'key_usuario\'
				
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_clientes() OWNER TO postgres;

--
-- Name: get_clientes(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_clientes(_key_empresa character varying) RETURNS SETOF character varying
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
                jsonb_object_agg(sq.key_usuario, to_json(sq.*))::json as json 
				FROM (
					
					select compra_venta.cliente ->> \'key_usuario\' as key_usuario,
					count(compra_venta.key) as cantidad,
					min(compra_venta.fecha_on) as primer_compra,
					max(compra_venta.fecha_on) as ultima_compra
					from compra_venta
					where compra_venta.state = \'vendido\'
					and compra_venta.estado > 0
					and compra_venta.key_empresa = \''||_key_empresa||E'\'
					group by compra_venta.cliente ->> \'key_usuario\'
				
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_clientes(_key_empresa character varying) OWNER TO postgres;

--
-- Name: get_clientes_deudores(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_clientes_deudores() RETURNS SETOF character varying
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
                jsonb_object_agg(coalesce( sq.key_usuario, \'sin_usuario\'), to_json(sq.*))::json as json 
				FROM (
					
					select tabla.*,
					(
						select descripcion
						from multa
						where multa.dias = (
							select min(multa.dias) 
							from multa
							where multa.dias >= tabla.dias
						)
					) as estado
					from (
						select compra_venta.cliente ->> \'key_usuario\' as key_usuario,
						count(cuota.key) as cantidad,
						min(cuota.fecha) as primer_cuota,
						max(cuota.fecha) as ultima_cuota,
						sum(cuota.monto) as monto,
						(extract(days from (now()-min(cuota.fecha))))::integer as dias
						from compra_venta,
						cuota
						where compra_venta.state = \'vendido\'
						and compra_venta.estado > 0
						and cuota.key_compra_venta = compra_venta.key
						and cuota.estado = 1
						group by compra_venta.cliente ->> \'key_usuario\'
					) tabla
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_clientes_deudores() OWNER TO postgres;

--
-- Name: get_clientes_deudores(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_clientes_deudores(_key_empresa character varying) RETURNS SETOF character varying
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
                jsonb_object_agg(coalesce( sq.key_usuario, \'sin_usuario\'), to_json(sq.*))::json as json 
				FROM (
					
					select tabla.*,
					(
						select descripcion
						from multa
						where multa.dias = (
							select min(multa.dias) 
							from multa
							where multa.dias >= tabla.dias
						)
					) as estado
					from (
						select compra_venta.cliente ->> \'key_usuario\' as key_usuario,
						count(cuota.key) as cantidad,
						min(cuota.fecha) as primer_cuota,
						max(cuota.fecha) as ultima_cuota,
						sum(cuota.monto) as monto,
						(extract(days from (now()-min(cuota.fecha))))::integer as dias
						from compra_venta,
						cuota
						where compra_venta.state = \'vendido\'
						and compra_venta.estado > 0
						and cuota.key_compra_venta = compra_venta.key
						and cuota.estado = 1
						and compra_venta.key_empresa = \''||_key_empresa||E'\'
						group by compra_venta.cliente ->> \'key_usuario\'
					) tabla
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_clientes_deudores(_key_empresa character varying) OWNER TO postgres;

--
-- Name: get_clientes_morosos(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_clientes_morosos() RETURNS SETOF character varying
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
                jsonb_object_agg(sq.key_usuario, to_json(sq.*))::json as json 
				FROM (
					
					select compra_venta.cliente ->> \'key_usuario\' as key_usuario,
					count(compra_venta.key) as cantidad,
					min(compra_venta.fecha_on) as primer_compra,
					max(compra_venta.fecha_on) as ultima_compra,
					sum(cuota.monto) as monto,
					min(cuota.fecha) as fecha
					from compra_venta,
					cuota
					where compra_venta.state = \'vendido\'
					and compra_venta.estado > 0
					and cuota.key_compra_venta = compra_venta.key
					and cuota.estado = 1
					group by compra_venta.cliente ->> \'key_usuario\'
				
				) sq and sq.fecha < now()';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_clientes_morosos() OWNER TO postgres;

--
-- Name: get_clientes_morosos(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_clientes_morosos(_key_empresa character varying) RETURNS SETOF character varying
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
                jsonb_object_agg(sq.key_usuario, to_json(sq.*))::json as json 
				FROM (
					
					select compra_venta.cliente ->> \'key_usuario\' as key_usuario,
					count(compra_venta.key) as cantidad,
					min(compra_venta.fecha_on) as primer_compra,
					max(compra_venta.fecha_on) as ultima_compra,
					sum(cuota.monto) as monto,
					min(cuota.fecha) as fecha
					from compra_venta,
					cuota
					where compra_venta.state = \'vendido\'
					and compra_venta.estado > 0
					and cuota.key_compra_venta = compra_venta.key
					and cuota.estado = 1
					and compra_venta.key_empresa = \''||_key_empresa||E'\'
					group by compra_venta.cliente ->> \'key_usuario\'
				
				) sq and sq.fecha < now()';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_clientes_morosos(_key_empresa character varying) OWNER TO postgres;

--
-- Name: get_cobranzas(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_cobranzas() RETURNS SETOF character varying
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
				
				select 
				cuota.*,
				compra_venta.cliente,
				compra_venta.proveedor,
				get_amortizaciones(cuota.key) as amortizaciones,
				compra_venta.tipo
				from cuota,
				compra_venta
				where cuota.estado = 1
				and compra_venta.state in (\'vendido\', \'comprado\')
				and compra_venta.key = cuota.key_compra_venta
				and compra_venta.estado > 0
			
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_cobranzas() OWNER TO postgres;

--
-- Name: get_cobranzas(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_cobranzas(_key_empresa character varying) RETURNS SETOF character varying
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
				
				select 
				cuota.*,
				compra_venta.cliente,
				compra_venta.proveedor,
				get_amortizaciones(cuota.key) as amortizaciones,
				compra_venta.tipo
				from cuota,
				compra_venta
				where cuota.estado = 1
				and compra_venta.state in (\'vendido\', \'comprado\')
				and compra_venta.key = cuota.key_compra_venta
				and compra_venta.estado > 0
				and compra_venta.key_empresa = \''||_key_empresa||E'\'
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_cobranzas(_key_empresa character varying) OWNER TO postgres;

--
-- Name: get_compra_venta(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_compra_venta(_key_producto character varying, _tipo character varying) RETURNS SETOF character varying
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
                    SELECT compra_venta.*
					FROM compra_venta_detalle_producto,
					compra_venta_detalle,
					compra_venta
					WHERE compra_venta_detalle_producto.key_producto = \''||_key_producto||E'\'
					AND compra_venta_detalle_producto.key_compra_venta_detalle = compra_venta_detalle.key
					and compra_venta_detalle.key_compra_venta = compra_venta.key
					and compra_venta.tipo = \''||_tipo||E'\'
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_compra_venta(_key_producto character varying, _tipo character varying) OWNER TO postgres;

--
-- Name: get_compra_venta_costos(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_compra_venta_costos(p_key text) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN (
    SELECT array_to_json(array_agg(sq1.*))
    FROM (

	select compra_venta_detalle_costo.*,
			compra_venta.key as key_venta,
			
---			compra_venta.key_cliente as key_cliente,
			compra_venta.key_moneda as key_moneda,
			compra_venta.tipo_pago as tipo_pago,
			compra_venta.tipo as tipo,
			compra_venta.state as state,
			compra_venta.key_sucursal as key_sucursal,
			compra_venta.key_almacen  as key_almacen
			
	from compra_venta,
	compra_venta_detalle,
	compra_venta_detalle_costo
	where compra_venta.key_empresa = p_key
	and compra_venta.estado > 0
	and compra_venta_detalle.estado>0
	and compra_venta_detalle.key_compra_venta = compra_venta.key
	and compra_venta_detalle_costo.estado>0
	and compra_venta_detalle_costo.key_compra_venta_detalle = compra_venta_detalle.key
	
	  
    ) sq1
  );
END;
$$;


ALTER FUNCTION public.get_compra_venta_costos(p_key text) OWNER TO postgres;

--
-- Name: get_compra_venta_detalle_productos(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_compra_venta_detalle_productos(_key_compra_venta character varying) RETURNS SETOF character varying
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
				
					select  compra_venta_detalle_producto.*
					from compra_venta_detalle,
					compra_venta_detalle_producto
					where compra_venta_detalle.key_compra_venta = \''||_key_compra_venta||E'\'
					and compra_venta_detalle.estado > 0
					and compra_venta_detalle_producto.key_compra_venta_detalle = compra_venta_detalle.key
				
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_compra_venta_detalle_productos(_key_compra_venta character varying) OWNER TO postgres;

--
-- Name: get_compra_venta_json(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_compra_venta_json(p_key text) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN (
    SELECT to_json(sq1.*)
    FROM (
      SELECT compra_venta.*,
        (
          SELECT array_to_json(array_agg(detalle.*))
          FROM (
            SELECT compra_venta_detalle.*,
			(
				select array_to_json(array_agg(compra_venta_detalle_costo.*))
				from compra_venta_detalle_costo
				where compra_venta_detalle_costo.estado > 0
				and compra_venta_detalle_costo.key_compra_venta_detalle = compra_venta_detalle.key
			) as costos
            FROM compra_venta_detalle
            WHERE compra_venta_detalle.key_compra_venta = compra_venta.key
              AND compra_venta_detalle.estado > 0
          ) AS detalle
        ) AS detalle,
        (
          SELECT array_to_json(array_agg(cuota.*))
          FROM (
            SELECT cuota.*
            FROM cuota
            WHERE cuota.key_compra_venta = compra_venta.key
              AND cuota.estado > 0
          ) AS cuota
        ) AS cuotas
      FROM compra_venta
      WHERE compra_venta.key = p_key
        AND compra_venta.estado > 0
    ) sq1
  );
END;
$$;


ALTER FUNCTION public.get_compra_venta_json(p_key text) OWNER TO postgres;

--
-- Name: get_compras_ventas(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_compras_ventas(_key_sucursal character varying) RETURNS SETOF character varying
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
                jsonb_object_agg(sq.state, to_json(sq.*))::json as json 
				FROM (
                  	select compra_venta.state,
					sum(compra_venta_detalle.precio_unitario*compra_venta_detalle.cantidad)
					from compra_venta,
					compra_venta_detalle
					where compra_venta.key_sucursal = \''||_key_sucursal||E'\'
					and compra_venta.estado > 0
					and compra_venta_detalle.key_compra_venta = compra_venta.key
					and compra_venta_detalle.estado > 0
					group by compra_venta.state
					UNION ALL
					select \'cobrado\' as state,
					sum(cuota.monto)
					from compra_venta,
					cuota
					where compra_venta.key_sucursal = \''||_key_sucursal||E'\'
					and compra_venta.estado > 0
					and cuota.key_compra_venta = compra_venta.key
					and cuota.estado > 1
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_compras_ventas(_key_sucursal character varying) OWNER TO postgres;

--
-- Name: get_compras_ventas(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_compras_ventas(_key_sucursal character varying, _fecha_inicio character varying, _fecha_fin character varying) RETURNS SETOF character varying
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
                jsonb_object_agg(sq.state, to_json(sq.*))::json as json 
				FROM (
                  	select compra_venta.state,
					sum(compra_venta_detalle.precio_unitario*compra_venta_detalle.cantidad)
					from compra_venta,
					compra_venta_detalle
					where compra_venta.key_sucursal = \''||_key_sucursal||E'\'
					and compra_venta.estado > 0
					and compra_venta_detalle.key_compra_venta = compra_venta.key
					and compra_venta_detalle.estado > 0
					and compra_venta.fecha_on::date between \''||_fecha_inicio||E'\'::date and \''||_fecha_fin||E'\'::date
					group by compra_venta.state
					UNION ALL
					select \'cobrado\' as state,
					sum(cuota.monto)
					from compra_venta,
					cuota
					where compra_venta.key_sucursal = \''||_key_sucursal||E'\'
					and compra_venta.estado > 0
					and cuota.key_compra_venta = compra_venta.key
					and compra_venta.fecha_on::date between \''||_fecha_inicio||E'\'::date and \''||_fecha_fin||E'\'::date
					and cuota.estado > 1
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_compras_ventas(_key_sucursal character varying, _fecha_inicio character varying, _fecha_fin character varying) OWNER TO postgres;

--
-- Name: get_cuotas(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_cuotas(key_cliente character varying) RETURNS SETOF character varying
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
					select cuota.*,
					(
						select jsonb_object_agg(cuota_amortizacion.key, to_json(cuota_amortizacion.*))
						from cuota_amortizacion
						where cuota_amortizacion.key_cuota = cuota.key
						and cuota_amortizacion.estado > 0
					) as cuota_amortizacion
					from cuota,
					compra_venta
					where compra_venta.key = cuota.key_compra_venta
					and compra_venta.cliente ->> \'key_usuario\' = \''||key_cliente||E'\'
					and compra_venta.estado > 0
					and compra_venta.state = \'vendido\'
					and cuota.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_cuotas(key_cliente character varying) OWNER TO postgres;

--
-- Name: get_cuotas(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_cuotas(key_cliente character varying, key_empresa character varying) RETURNS SETOF character varying
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
					select cuota.*,
					(
						select jsonb_object_agg(cuota_amortizacion.key, to_json(cuota_amortizacion.*))
						from cuota_amortizacion
						where cuota_amortizacion.key_cuota = cuota.key
						and cuota_amortizacion.estado > 0
					) as cuota_amortizacion
					from cuota,
					compra_venta
					where compra_venta.key = cuota.key_compra_venta
					--and compra_venta.cliente ->> \'key_usuario\' = \''||key_cliente||E'\'
					and (compra_venta.cliente ->> \'key_usuario\' = \''||key_cliente||E'\' or  compra_venta.cliente  is null )
					and compra_venta.key_empresa = \''||key_empresa||E'\'
					and compra_venta.estado > 0
					and compra_venta.state = \'vendido\'
					and cuota.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_cuotas(key_cliente character varying, key_empresa character varying) OWNER TO postgres;

--
-- Name: get_cuotas_proveedor(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_cuotas_proveedor(key_proveedor character varying) RETURNS SETOF character varying
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
					select cuota.*,
					(
						select jsonb_object_agg(cuota_amortizacion.key, to_json(cuota_amortizacion.*))
						from cuota_amortizacion
						where cuota_amortizacion.key_cuota = cuota.key
						and cuota_amortizacion.estado > 0
					) as cuota_amortizacion
					from cuota,
					compra_venta
					where compra_venta.key = cuota.key_compra_venta
					and compra_venta.proveedor ->> \'key_usuario\' = \''||key_proveedor||E'\'
					and compra_venta.estado > 0
					and compra_venta.state = \'comprado\'
					and cuota.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_cuotas_proveedor(key_proveedor character varying) OWNER TO postgres;

--
-- Name: get_cuotas_proveedor(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_cuotas_proveedor(key_proveedor character varying, key_empresa character varying) RETURNS SETOF character varying
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
					select cuota.*,
					(
						select jsonb_object_agg(cuota_amortizacion.key, to_json(cuota_amortizacion.*))
						from cuota_amortizacion
						where cuota_amortizacion.key_cuota = cuota.key
						and cuota_amortizacion.estado > 0
					) as cuota_amortizacion
					from cuota,
					compra_venta
					where compra_venta.key = cuota.key_compra_venta
					and compra_venta.key_proveedor = \''||key_proveedor||E'\'
					and compra_venta.key_empresa = \''||key_empresa||E'\'
					and compra_venta.estado > 0
					and compra_venta.state = \'comprado\'
					and cuota.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_cuotas_proveedor(key_proveedor character varying, key_empresa character varying) OWNER TO postgres;

--
-- Name: get_deuda_proveedores(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_deuda_proveedores() RETURNS SETOF character varying
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
                jsonb_object_agg(sq.key_usuario, to_json(sq.*))::json as json 
				FROM (
					
					select tabla.*,
					(
						select descripcion
						from multa
						where multa.dias = (
							select min(multa.dias) 
							from multa
							where multa.dias >= tabla.dias
						)
					) as estado
					from (
						select compra_venta.proveedor ->> \'key_usuario\' as key_usuario,
						count(cuota.key) as cantidad,
						min(cuota.fecha) as primer_cuota,
						max(cuota.fecha) as ultima_cuota,
						sum(cuota.monto) as monto,
						(extract(days from (now()-min(cuota.fecha))))::integer as dias
						from compra_venta,
						cuota
						where compra_venta.state = \'comprado\'
						and compra_venta.estado > 0
						and cuota.key_compra_venta = compra_venta.key
						and cuota.estado = 1
						group by compra_venta.proveedor ->> \'key_usuario\'
					) tabla
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_deuda_proveedores() OWNER TO postgres;

--
-- Name: get_deuda_proveedores(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_deuda_proveedores(_key_empresa character varying) RETURNS SETOF character varying
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
                jsonb_object_agg(coalesce(sq.key_proveedor,\'sin_proveedor\'), to_json(sq.*))::json as json 
				FROM (
					
					select tabla.*,
					(
						select descripcion
						from multa
						where multa.dias = (
							select min(multa.dias) 
							from multa
							where multa.dias >= tabla.dias
						)
					) as estado
					from (
						select compra_venta.key_proveedor,
						count(cuota.key) as cantidad,
						min(cuota.fecha) as primer_cuota,
						max(cuota.fecha) as ultima_cuota,
						sum(cuota.monto) as monto,
						(extract(days from (now()-min(cuota.fecha))))::integer as dias
						from compra_venta,
						cuota
						where compra_venta.state = \'comprado\'
						and compra_venta.estado > 0
						and cuota.key_compra_venta = compra_venta.key
						and cuota.estado = 1
						and compra_venta.key_empresa = \''||_key_empresa||E'\'
						group by compra_venta.key_proveedor
					) tabla
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_deuda_proveedores(_key_empresa character varying) OWNER TO postgres;

--
-- Name: get_pocentaje_compraventa_detalle(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_pocentaje_compraventa_detalle(_key_compra_venta character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'  select jsonb_object_agg(res.key, to_json(res.*)) as json
					from (
					
					select compra_venta_detalle.key,
					compra_venta.tipo_pago,
					compra_venta_detalle.data ->> \'key_cuenta_contable\' as key_cuenta_contable,
					((((compra_venta_detalle.precio_unitario*compra_venta_detalle.cantidad)-COALESCE(compra_venta_detalle.descuento,0))*100)/
					(
						select sum((compra_venta_detalle.precio_unitario*compra_venta_detalle.cantidad)-COALESCE(compra_venta_detalle.descuento,0)) as total
						from compra_venta,
						compra_venta_detalle
						where compra_venta.key = \''||_key_compra_venta||E'\'
						and compra_venta.key = compra_venta_detalle.key_compra_venta
						and compra_venta_detalle.estado > 0
						and compra_venta.estado > 0
					))::double precision porcentaje
					from cuota,
						compra_venta,
						compra_venta_detalle
						where compra_venta.key = \''||_key_compra_venta||E'\'						
						and compra_venta.key = compra_venta_detalle.key_compra_venta
						and compra_venta_detalle.estado > 0
						and compra_venta.estado > 0
					group by  compra_venta_detalle.data ->> \'key_cuenta_contable\',
					compra_venta_detalle.key,
					compra_venta.tipo_pago
					
					) res';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_pocentaje_compraventa_detalle(_key_compra_venta character varying) OWNER TO postgres;

--
-- Name: get_valor_inventario_por_sucursal(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_valor_inventario_por_sucursal(p_key_empresa text) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        SELECT COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'sucursal', t.sucursal,
                    'valor_inventario', ROUND(t.valor_inventario::numeric,2)
                )
            ),
            '[]'::json
        )
        FROM (

            WITH ultimos_precios AS (
                SELECT
                    d.descripcion AS producto,
                    d.precio_unitario_base AS precio_compra,
                    ROW_NUMBER() OVER(
                        PARTITION BY d.descripcion
                        ORDER BY cv.fecha_on DESC
                    ) AS rn
                FROM compra_venta_detalle d
                INNER JOIN compra_venta cv
                    ON cv.key = d.key_compra_venta
                WHERE cv.estado > 0
                    AND cv.tipo = 'compra'
                    AND cv.key_empresa = p_key_empresa
            ),

            stock_sucursal AS (
                SELECT
                    cv.key_sucursal,
                    d.descripcion AS producto,
                    SUM(
                        CASE
                            WHEN cv.tipo = 'compra'
                                THEN d.cantidad
                            WHEN cv.tipo = 'venta'
                                THEN -d.cantidad
                            ELSE 0
                        END
                    ) AS stock_actual
                FROM compra_venta_detalle d
                INNER JOIN compra_venta cv
                    ON cv.key = d.key_compra_venta
                WHERE cv.estado > 0
                    AND cv.key_empresa = p_key_empresa
                GROUP BY
                    cv.key_sucursal,
                    d.descripcion
                HAVING SUM(
                    CASE
                        WHEN cv.tipo = 'compra'
                            THEN d.cantidad
                        WHEN cv.tipo = 'venta'
                            THEN -d.cantidad
                        ELSE 0
                    END
                ) > 0
            )

            SELECT
                s.descripcion AS sucursal,
                SUM(
                    st.stock_actual *
                    COALESCE(up.precio_compra,0)
                ) AS valor_inventario
            FROM stock_sucursal st
            INNER JOIN empresa_sucursal s
                ON s.key = st.key_sucursal
            LEFT JOIN ultimos_precios up
                ON up.producto = st.producto
                AND up.rn = 1
            GROUP BY
                s.key,
                s.descripcion
            ORDER BY valor_inventario DESC

        ) t
    );
END;
$$;


ALTER FUNCTION public.get_valor_inventario_por_sucursal(p_key_empresa text) OWNER TO postgres;

--
-- Name: is_producto_vendido(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_producto_vendido(_key_producto character varying) RETURNS SETOF character varying
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
				
				
				select compra_venta_detalle_producto.*
				from compra_venta,
				compra_venta_detalle,
				compra_venta_detalle_producto
				where compra_venta.state = \'vendido\'
				and compra_venta.estado > 0
				and compra_venta_detalle.key_compra_venta = compra_venta.key
				and compra_venta_detalle.estado > 0
				and compra_venta_detalle_producto.key_compra_venta_detalle = compra_venta_detalle.key
				and compra_venta_detalle_producto.key_producto in (\''||_key_producto||E'\')
				and compra_venta_detalle_producto.estado > 0

				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.is_producto_vendido(_key_producto character varying) OWNER TO postgres;

--
-- Name: productos_mas_vendidos(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.productos_mas_vendidos(p_key_empresa text) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        SELECT COALESCE(JSON_AGG(
            JSON_BUILD_OBJECT(
                'producto', sub.producto,
                'cantidad_total_vendida', sub.cantidad_total_vendida,
                'total_bs_ganado', ROUND(sub.total_bs_ganado::numeric, 2)
            )
        ), '[]'::JSON)
        FROM (
            SELECT
                d.descripcion as producto,
                SUM(d.cantidad) as cantidad_total_vendida,
                COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) as total_bs_ganado
            FROM compra_venta_detalle d
            INNER JOIN compra_venta cv ON d.key_compra_venta = cv.key
            WHERE cv.tipo = 'venta'
                AND cv.estado > 0
                AND cv.key_empresa = p_key_empresa
                AND d.descripcion IS NOT NULL
                AND d.descripcion != ''
            GROUP BY d.descripcion
            ORDER BY cantidad_total_vendida DESC
            LIMIT 10
        ) AS sub
    );
END;
$$;


ALTER FUNCTION public.productos_mas_vendidos(p_key_empresa text) OWNER TO postgres;

--
-- Name: productos_mas_vendidos2(text, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.productos_mas_vendidos2(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio character varying, p_fecha_fin character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        SELECT COALESCE(JSON_AGG(
            JSON_BUILD_OBJECT(
                'key_modelo', sub.key_modelo,
                'producto', sub.producto,
                'cantidad_total_vendida', sub.cantidad_total_vendida,
                'total_bs_ganado', ROUND(sub.total_bs_ganado::numeric, 2),
                'sucursales', sub.sucursales
            )
        ), '[]'::JSON)
        FROM (
            SELECT
                d.key_modelo,
                d.descripcion AS producto,
                SUM(d.cantidad) AS cantidad_total_vendida,
                COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) AS total_bs_ganado,
                -- array de keys de sucursales como texto, sin problemas de DISTINCT en JSON
                ARRAY_AGG(DISTINCT cv.key_sucursal) AS sucursales
            FROM compra_venta_detalle d
            INNER JOIN compra_venta cv ON d.key_compra_venta = cv.key
            WHERE cv.estado > 0
              AND cv.key_empresa = p_key_empresa
              AND cv.tipo = p_tipo_transaccion
              AND cv.fecha_on >= p_fecha_inicio::date
              AND cv.fecha_on < (p_fecha_fin::date + INTERVAL '1 day')
              AND d.descripcion IS NOT NULL
              AND d.descripcion != ''
            GROUP BY d.key_modelo, d.descripcion
            ORDER BY cantidad_total_vendida DESC
            LIMIT 10
        ) AS sub
    );
END;
$$;


ALTER FUNCTION public.productos_mas_vendidos2(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio character varying, p_fecha_fin character varying) OWNER TO postgres;

--
-- Name: productos_mas_vendidos_tipo(text, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.productos_mas_vendidos_tipo(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio character varying, p_fecha_fin character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        SELECT COALESCE(JSON_AGG(
            JSON_BUILD_OBJECT(
                'key_modelo', sub.key_modelo,
                'producto', sub.producto,
                'cantidad_total_vendida', sub.cantidad_total_vendida,
                'total_bs_ganado', ROUND(sub.total_bs_ganado::numeric, 2),
                'sucursales', sub.sucursales,
                'tipo_producto', sub.tipo_producto
            )
        ), '[]'::JSON)
        FROM (
            SELECT
                d.key_modelo,
                d.descripcion AS producto,
                SUM(d.cantidad) AS cantidad_total_vendida,
                COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) AS total_bs_ganado,
                -- array de keys de sucursales como texto, sin problemas de DISTINCT en JSON
                ARRAY_AGG(DISTINCT cv.key_sucursal) AS sucursales,
                -- tipos de producto asociados a las transacciones que contienen el producto (traído desde compra_venta_detalle)
                COALESCE(JSON_AGG(DISTINCT d.tipo) FILTER (WHERE d.tipo IS NOT NULL), '[]'::json) AS tipo_producto
            FROM compra_venta_detalle d
            INNER JOIN compra_venta cv ON d.key_compra_venta = cv.key
            WHERE cv.estado > 0
              AND cv.key_empresa = p_key_empresa
              AND cv.tipo = p_tipo_transaccion
              AND cv.fecha_on >= p_fecha_inicio::date
              AND cv.fecha_on < (p_fecha_fin::date + INTERVAL '1 day')
              AND d.descripcion IS NOT NULL
              AND d.descripcion != ''
            GROUP BY d.key_modelo, d.descripcion
            ORDER BY cantidad_total_vendida DESC
            LIMIT 10
        ) AS sub
    );
END;
$$;


ALTER FUNCTION public.productos_mas_vendidos_tipo(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio character varying, p_fecha_fin character varying) OWNER TO postgres;

--
-- Name: productos_mayor_beneficio(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.productos_mayor_beneficio(p_key_empresa text) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        SELECT COALESCE(JSON_AGG(
            JSON_BUILD_OBJECT(
                'producto', sub.producto,
                'precio_venta_promedio', ROUND(sub.precio_venta_promedio::numeric, 2),
                'precio_compra_promedio', ROUND(sub.precio_compra_promedio::numeric, 2),
                'beneficio_promedio', ROUND(sub.beneficio_promedio::numeric, 2)
            )
        ), '[]'::JSON)
        FROM (
            SELECT
                d.descripcion as producto,
                COALESCE(AVG(CASE WHEN cv.tipo = 'venta' THEN d.precio_unitario_base END), 0) as precio_venta_promedio,
                COALESCE(AVG(CASE WHEN cv.tipo = 'compra' THEN d.precio_unitario_base END), 0) as precio_compra_promedio,
                (COALESCE(AVG(CASE WHEN cv.tipo = 'venta' THEN d.precio_unitario_base END), 0) - 
                 COALESCE(AVG(CASE WHEN cv.tipo = 'compra' THEN d.precio_unitario_base END), 0)) as beneficio_promedio
            FROM compra_venta_detalle d
            INNER JOIN compra_venta cv ON d.key_compra_venta = cv.key
            WHERE cv.estado > 0
                AND cv.key_empresa = p_key_empresa
                AND d.descripcion IS NOT NULL
                AND d.descripcion != ''
            GROUP BY d.descripcion
            HAVING COUNT(DISTINCT CASE WHEN cv.tipo = 'venta' THEN cv.key END) > 0
               AND COUNT(DISTINCT CASE WHEN cv.tipo = 'compra' THEN cv.key END) > 0
               AND (COALESCE(AVG(CASE WHEN cv.tipo = 'venta' THEN d.precio_unitario_base END), 0) - 
                    COALESCE(AVG(CASE WHEN cv.tipo = 'compra' THEN d.precio_unitario_base END), 0)) > 0
            ORDER BY beneficio_promedio DESC
            LIMIT 10
        ) AS sub
    );
END;
$$;


ALTER FUNCTION public.productos_mayor_beneficio(p_key_empresa text) OWNER TO postgres;

--
-- Name: productos_mayor_beneficio2(text, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.productos_mayor_beneficio2(p_key_empresa text, p_fecha_inicio character varying, p_fecha_fin character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        SELECT COALESCE(JSON_AGG(
            JSON_BUILD_OBJECT(
                'producto', sub.producto,
                'precio_venta_promedio', ROUND(sub.precio_venta_promedio::numeric, 2),
                'precio_compra_promedio', ROUND(sub.precio_compra_promedio::numeric, 2),
                'beneficio_promedio', ROUND(sub.beneficio_promedio::numeric, 2)
            )
        ), '[]'::JSON)
        FROM (
            SELECT
                d.descripcion as producto,
                COALESCE(AVG(CASE WHEN cv.tipo = 'venta' THEN d.precio_unitario_base END), 0) as precio_venta_promedio,
                COALESCE(AVG(CASE WHEN cv.tipo = 'compra' THEN d.precio_unitario_base END), 0) as precio_compra_promedio,
                (COALESCE(AVG(CASE WHEN cv.tipo = 'venta' THEN d.precio_unitario_base END), 0) - 
                 COALESCE(AVG(CASE WHEN cv.tipo = 'compra' THEN d.precio_unitario_base END), 0)) as beneficio_promedio
            FROM compra_venta_detalle d
            INNER JOIN compra_venta cv ON d.key_compra_venta = cv.key
            WHERE cv.estado > 0
                AND cv.key_empresa = p_key_empresa

				            -- 🔥 FILTRO POR FECHA
                AND cv.fecha_on >= p_fecha_inicio::date
                AND cv.fecha_on < (p_fecha_fin::date + INTERVAL '1 day')


                AND d.descripcion IS NOT NULL
                AND d.descripcion != ''
            GROUP BY d.descripcion
            HAVING COUNT(DISTINCT CASE WHEN cv.tipo = 'venta' THEN cv.key END) > 0
               AND COUNT(DISTINCT CASE WHEN cv.tipo = 'compra' THEN cv.key END) > 0
               AND (COALESCE(AVG(CASE WHEN cv.tipo = 'venta' THEN d.precio_unitario_base END), 0) - 
                    COALESCE(AVG(CASE WHEN cv.tipo = 'compra' THEN d.precio_unitario_base END), 0)) > 0
            ORDER BY beneficio_promedio DESC
            LIMIT 10
        ) AS sub
    );
END;
$$;


ALTER FUNCTION public.productos_mayor_beneficio2(p_key_empresa text, p_fecha_inicio character varying, p_fecha_fin character varying) OWNER TO postgres;

--
-- Name: productos_mayor_stock_compra_venta(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.productos_mayor_stock_compra_venta(p_key_empresa text) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        SELECT COALESCE(JSON_AGG(
            JSON_BUILD_OBJECT(
                'producto', sub.producto,
                'stock_actual', sub.stock_actual
            )
        ), '[]'::JSON)
        FROM (
            SELECT
                d.descripcion as producto,
                SUM(CASE 
                    WHEN cv.tipo = 'compra' THEN d.cantidad
                    WHEN cv.tipo = 'venta' THEN -d.cantidad
                    ELSE 0 
                END) as stock_actual
            FROM compra_venta_detalle d
            INNER JOIN compra_venta cv ON d.key_compra_venta = cv.key
            WHERE cv.estado > 0
                AND cv.key_empresa = p_key_empresa
                AND d.descripcion IS NOT NULL
                AND d.descripcion != ''
            GROUP BY d.descripcion
            HAVING SUM(CASE 
                    WHEN cv.tipo = 'compra' THEN d.cantidad
                    WHEN cv.tipo = 'venta' THEN -d.cantidad
                    ELSE 0 
                END) > 0
            ORDER BY stock_actual DESC
            LIMIT 20
        ) AS sub
    );
END;
$$;


ALTER FUNCTION public.productos_mayor_stock_compra_venta(p_key_empresa text) OWNER TO postgres;

--
-- Name: productos_mayor_stock_compra_venta_inventario(text, date, date, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.productos_mayor_stock_compra_venta_inventario(p_key_empresa text, p_fecha_inicio date, p_fecha_fin date, p_key_sucursal text DEFAULT NULL::text) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        SELECT COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'producto', sub.producto,
                    'stock_actual', sub.stock_actual
                )
            ),
            '[]'::JSON
        )
        FROM (
            SELECT
                d.descripcion AS producto,
                SUM(
                    CASE
                        WHEN cv.tipo = 'compra' THEN d.cantidad
                        WHEN cv.tipo = 'venta' THEN -d.cantidad
                        ELSE 0
                    END
                ) AS stock_actual
            FROM compra_venta_detalle d
            INNER JOIN compra_venta cv
                ON d.key_compra_venta = cv.key
            WHERE cv.estado > 0
                AND cv.key_empresa = p_key_empresa

                -- filtro de fechas
                -- AND cv.fecha_on::date >= p_fecha_inicio
                -- AND cv.fecha_on::date <= p_fecha_fin

                -- filtro sucursal
                AND (
                    p_key_sucursal IS NULL
                    OR cv.key_sucursal = p_key_sucursal
                )

                AND d.descripcion IS NOT NULL
                AND d.descripcion <> ''

            GROUP BY d.descripcion

            HAVING SUM(
                CASE
                    WHEN cv.tipo = 'compra' THEN d.cantidad
                    WHEN cv.tipo = 'venta' THEN -d.cantidad
                    ELSE 0
                END
            ) > 0

            ORDER BY stock_actual DESC
            -- LIMIT 20
        ) sub
    );
END;
$$;


ALTER FUNCTION public.productos_mayor_stock_compra_venta_inventario(p_key_empresa text, p_fecha_inicio date, p_fecha_fin date, p_key_sucursal text) OWNER TO postgres;

--
-- Name: productos_mayor_stock_compra_venta_inventario(text, date, date, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.productos_mayor_stock_compra_venta_inventario(p_key_empresa text, p_fecha_inicio date, p_fecha_fin date, p_key_sucursal text DEFAULT NULL::text, p_key_almacen text DEFAULT NULL::text) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        SELECT COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'producto', sub.producto,
                    'stock_actual', sub.stock_actual
                )
            ),
            '[]'::JSON
        )
        FROM (
            SELECT
                d.descripcion AS producto,
                SUM(
                    CASE
                        WHEN cv.tipo = 'compra' THEN d.cantidad
                        WHEN cv.tipo = 'venta' THEN -d.cantidad
                        ELSE 0
                    END
                ) AS stock_actual
            FROM compra_venta_detalle d
            INNER JOIN compra_venta cv
                ON d.key_compra_venta = cv.key
            WHERE cv.estado > 0
                AND cv.key_empresa = p_key_empresa

                AND (
                    p_key_sucursal IS NULL
                    OR cv.key_sucursal = p_key_sucursal
                )

                AND (
                    p_key_almacen IS NULL
                    OR cv.key_almacen = p_key_almacen
                )

                AND d.descripcion IS NOT NULL
                AND d.descripcion <> ''

            GROUP BY d.descripcion

            HAVING SUM(
                CASE
                    WHEN cv.tipo = 'compra' THEN d.cantidad
                    WHEN cv.tipo = 'venta' THEN -d.cantidad
                    ELSE 0
                END
            ) > 0

            ORDER BY stock_actual DESC
        ) sub
    );
END;
$$;


ALTER FUNCTION public.productos_mayor_stock_compra_venta_inventario(p_key_empresa text, p_fecha_inicio date, p_fecha_fin date, p_key_sucursal text, p_key_almacen text) OWNER TO postgres;

--
-- Name: productos_por_fecha(text, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.productos_por_fecha(p_key_empresa text, p_fecha_inicio character varying, p_fecha_fin character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        WITH productos_totales AS (
            SELECT
                d.key_modelo,
                d.descripcion AS producto,
                SUM(CASE WHEN cv.tipo = 'venta' THEN d.cantidad ELSE 0 END) AS ventas_total_cantidad,
                SUM(CASE WHEN cv.tipo = 'venta' THEN d.cantidad * d.precio_unitario_base ELSE 0 END) AS ventas_total_ganancia,
                SUM(CASE WHEN cv.tipo = 'compra' THEN d.cantidad ELSE 0 END) AS compras_total_cantidad,
                SUM(CASE WHEN cv.tipo = 'compra' THEN d.cantidad * d.precio_unitario_base ELSE 0 END) AS compras_total_ganancia
            FROM compra_venta_detalle d
            INNER JOIN compra_venta cv ON d.key_compra_venta = cv.key
            WHERE cv.estado > 0
              AND cv.key_empresa = p_key_empresa
              AND cv.fecha_on >= p_fecha_inicio::date
              AND cv.fecha_on < (p_fecha_fin::date + INTERVAL '1 day')
              AND d.descripcion IS NOT NULL
              AND d.descripcion != ''
            GROUP BY d.key_modelo, d.descripcion
            ORDER BY SUM(CASE WHEN cv.tipo = 'venta' THEN d.cantidad ELSE 0 END) DESC
            LIMIT 10
        ),
        dias_totales AS (
            SELECT
                d.key_modelo,
                EXTRACT(DAY FROM cv.fecha_on)::int AS dia,
                SUM(CASE WHEN cv.tipo = 'venta' THEN d.cantidad ELSE 0 END) AS ventas_cantidad,
                SUM(CASE WHEN cv.tipo = 'venta' THEN d.cantidad * d.precio_unitario_base ELSE 0 END) AS ventas_ganancia,
                SUM(CASE WHEN cv.tipo = 'compra' THEN d.cantidad ELSE 0 END) AS compras_cantidad,
                SUM(CASE WHEN cv.tipo = 'compra' THEN d.cantidad * d.precio_unitario_base ELSE 0 END) AS compras_ganancia
            FROM compra_venta_detalle d
            INNER JOIN compra_venta cv ON d.key_compra_venta = cv.key
            WHERE cv.estado > 0
              AND cv.key_empresa = p_key_empresa
              AND cv.fecha_on >= p_fecha_inicio::date
              AND cv.fecha_on < (p_fecha_fin::date + INTERVAL '1 day')
              AND d.descripcion IS NOT NULL
              AND d.descripcion != ''
            GROUP BY d.key_modelo, EXTRACT(DAY FROM cv.fecha_on)
        )
        SELECT COALESCE(JSON_AGG(
            JSON_BUILD_OBJECT(
                'key_modelo', p.key_modelo,
                'producto', p.producto,
                'ventas_total_cantidad', p.ventas_total_cantidad,
                'ventas_total_ganancia', ROUND(p.ventas_total_ganancia::numeric, 2),
                'compras_total_cantidad', p.compras_total_cantidad,
                'compras_total_ganancia', ROUND(p.compras_total_ganancia::numeric, 2),
                'dias', COALESCE(
                    (SELECT JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'dia', d.dia,
                            'ventas_cantidad', d.ventas_cantidad,
                            'ventas_ganancia', ROUND(d.ventas_ganancia::numeric,2),
                            'compras_cantidad', d.compras_cantidad,
                            'compras_ganancia', ROUND(d.compras_ganancia::numeric,2)
                        ) ORDER BY d.dia
                    ) FROM dias_totales d WHERE d.key_modelo = p.key_modelo), '[]'::json)
            )
        ), '[]'::json)
        FROM productos_totales p
    );
END;
$$;


ALTER FUNCTION public.productos_por_fecha(p_key_empresa text, p_fecha_inicio character varying, p_fecha_fin character varying) OWNER TO postgres;

--
-- Name: productos_por_fecha_____________2(text, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.productos_por_fecha_____________2(p_key_empresa text, p_fecha_inicio character varying, p_fecha_fin character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        SELECT COALESCE(JSON_AGG(
            JSON_BUILD_OBJECT(
                'key_modelo', p.key_modelo,
                'producto', p.producto,
                'ventas_total_cantidad', p.ventas_cantidad,
                'ventas_total_ganancia', ROUND(p.ventas_ganancia::numeric, 2),
                'compras_total_cantidad', p.compras_cantidad,
                'compras_total_ganancia', ROUND(p.compras_ganancia::numeric, 2),
                'sucursales', (
                    SELECT JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'key_sucursal', s.key_sucursal,
                            'ventas_cantidad', s.ventas_cantidad,
                            'ventas_ganancia', ROUND(s.ventas_ganancia::numeric, 2),
                            'compras_cantidad', s.compras_cantidad,
                            'compras_ganancia', ROUND(s.compras_ganancia::numeric, 2)
                        )
                    )
                    FROM (
                        SELECT
                            cv.key_sucursal,
                            SUM(CASE WHEN cv.tipo = 'venta' THEN d.cantidad ELSE 0 END) AS ventas_cantidad,
                            SUM(CASE WHEN cv.tipo = 'venta' THEN d.cantidad * d.precio_unitario_base ELSE 0 END) AS ventas_ganancia,
                            SUM(CASE WHEN cv.tipo = 'compra' THEN d.cantidad ELSE 0 END) AS compras_cantidad,
                            SUM(CASE WHEN cv.tipo = 'compra' THEN d.cantidad * d.precio_unitario_base ELSE 0 END) AS compras_ganancia
                        FROM compra_venta_detalle d
                        INNER JOIN compra_venta cv ON d.key_compra_venta = cv.key
                        WHERE cv.estado > 0
                          AND cv.key_empresa = p_key_empresa
                          AND cv.fecha_on >= p_fecha_inicio::date
                          AND cv.fecha_on < (p_fecha_fin::date + INTERVAL '1 day')
                          AND d.descripcion IS NOT NULL
                          AND d.descripcion != ''
                          AND d.key_modelo = p.key_modelo
                        GROUP BY cv.key_sucursal
                    ) AS s
                )
            )
        ), '[]'::JSON)
        FROM (
            SELECT
                d.key_modelo,
                d.descripcion AS producto,
                SUM(CASE WHEN cv.tipo = 'venta' THEN d.cantidad ELSE 0 END) AS ventas_cantidad,
                SUM(CASE WHEN cv.tipo = 'venta' THEN d.cantidad * d.precio_unitario_base ELSE 0 END) AS ventas_ganancia,
                SUM(CASE WHEN cv.tipo = 'compra' THEN d.cantidad ELSE 0 END) AS compras_cantidad,
                SUM(CASE WHEN cv.tipo = 'compra' THEN d.cantidad * d.precio_unitario_base ELSE 0 END) AS compras_ganancia
            FROM compra_venta_detalle d
            INNER JOIN compra_venta cv ON d.key_compra_venta = cv.key
            WHERE cv.estado > 0
              AND cv.key_empresa = p_key_empresa
              AND cv.fecha_on >= p_fecha_inicio::date
              AND cv.fecha_on < (p_fecha_fin::date + INTERVAL '1 day')
              AND d.descripcion IS NOT NULL
              AND d.descripcion != ''
            GROUP BY d.key_modelo, d.descripcion
            ORDER BY SUM(CASE WHEN cv.tipo = 'venta' THEN d.cantidad ELSE 0 END) DESC
            LIMIT 10
        ) AS p
    );
END;
$$;


ALTER FUNCTION public.productos_por_fecha_____________2(p_key_empresa text, p_fecha_inicio character varying, p_fecha_fin character varying) OWNER TO postgres;

--
-- Name: reporte_compras_compradores(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reporte_compras_compradores(_key_servicio character varying, _fecha_inicio character varying, _fecha_fin character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta character varying;
    s_consulta character varying;
BEGIN

s_consulta :=E' 
SELECT array_to_json(array_agg(sq.*)) as json
FROM (
		SELECT 
			compra_venta.key_usuario,
			COUNT(CASE WHEN compra_venta.state = \'comprado\' THEN 1 END) as cantidad_comprado,
			COUNT(CASE WHEN compra_venta.state = \'cotizacion\' THEN 1 END) as cantidad_cotizacion,
			COUNT(CASE WHEN compra_venta.state = \'aprobado\' THEN 1 END) as cantidad_aprobado,
			COUNT(CASE WHEN compra_venta.state = \'denegado\' THEN 1 END) as cantidad_denegado,
			COUNT(compra_venta.key)
		FROM compra_venta
		WHERE compra_venta.fecha_on::date BETWEEN \''||_fecha_inicio||E'\'::date AND \''||_fecha_fin||E'\'::date
		AND compra_venta.key_servicio = \''||_key_servicio||E'\'
		AND compra_venta.tipo = \'compra\'
		AND compra_venta.estado > 0
		GROUP BY compra_venta.key_usuario
) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.reporte_compras_compradores(_key_servicio character varying, _fecha_inicio character varying, _fecha_fin character varying) OWNER TO postgres;

--
-- Name: reporte_compras_ventas_cuotas(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reporte_compras_ventas_cuotas(_key_servicio character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta character varying;
    s_consulta character varying;
BEGIN

s_consulta :=E' 
SELECT array_to_json(array_agg(sq.*)) as json
FROM (
			select * 
			from compra_venta
			LEFT JOIN (
					SELECT 
					cuotas.key_compra_venta,
					MIN(cuotas.fecha) as fecha_primer_cuota,
					MAX(cuotas.fecha) as fecha_ultima_cuota,
					COUNT (cuotas.key) as cuotas,
					SUM(cuotas.monto) as monto_cuotas,
					COUNT ( CASE WHEN cuotas.monto_pagado >= cuotas.monto THEN 1 END ) as cuotas_pagadas,
					SUM(cuotas.monto_pagado) as monto_cuotas_pagadas,
					COUNT ( CASE WHEN cuotas.dias <= 0 THEN 1 END ) as cuotas_retrasadas,
					SUM ( CASE WHEN cuotas.dias <= 0 THEN cuotas.monto END ) as monto_cuotas_retrasadas,
					COUNT ( CASE WHEN cuotas.dias <= -1 AND  cuotas.dias >= -30  THEN 1 END ) as cuotas_vencidas,
					SUM ( CASE WHEN cuotas.dias <= -1 AND  cuotas.dias >= -30  THEN cuotas.monto END ) as monto_cuotas_vencidas,
					COUNT ( CASE WHEN cuotas.dias <= -31 AND  cuotas.dias >= -180  THEN 1 END ) as cuotas_ejecucion,
					SUM ( CASE WHEN cuotas.dias <= -31 AND  cuotas.dias >= -180  THEN cuotas.monto END ) as monto_cuotas_ejecucion,
					COUNT ( CASE WHEN cuotas.dias <= -181 THEN 1 END ) as cuotas_castigado,
					SUM ( CASE WHEN cuotas.dias <= -181 THEN cuotas.dias END ) as monto_cuotas_castigado
					FROM (
						SELECT 	
							cuota.*,
							EXTRACT(DAY FROM cuota.fecha-CURRENT_DATE) as dias,
							COALESCE(SUM(cuota_amortizacion.monto),0) monto_pagado
						FROM cuota 
						LEFT JOIN cuota_amortizacion 
						ON cuota.key = cuota_amortizacion.key_cuota
						WHERE cuota.estado > 0 
						AND cuota.monto > 0
						AND (cuota_amortizacion.estado <> 0 OR cuota_amortizacion.estado is null)
						GROUP BY cuota.key
						order by dias asc
					) cuotas
					GROUP BY cuotas.key_compra_venta
			) cuotas
			ON compra_venta.key = cuotas.key_compra_venta
			where compra_venta.key_servicio = \''||_key_servicio||E'\'
			AND ( compra_venta.state = \'comprado\' OR compra_venta.state = \'vendido\')
) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.reporte_compras_ventas_cuotas(_key_servicio character varying) OWNER TO postgres;

--
-- Name: reporte_ventas_vendedores(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reporte_ventas_vendedores(_key_servicio character varying, _fecha_inicio character varying, _fecha_fin character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta character varying;
    s_consulta character varying;
BEGIN

s_consulta :=E' 
SELECT array_to_json(array_agg(sq.*)) as json
FROM (
		SELECT 
			compra_venta.key_usuario,
			COUNT(CASE WHEN compra_venta.state = \'vendido\' THEN 1 END) as cantidad_vendidos,
			COUNT(CASE WHEN compra_venta.state = \'cotizacion\' THEN 1 END) as cantidad_cotizacion,
			COUNT(CASE WHEN compra_venta.state = \'aprobado\' THEN 1 END) as cantidad_aprobado,
			COUNT(CASE WHEN compra_venta.state = \'denegado\' THEN 1 END) as cantidad_denegado,
			COUNT(compra_venta.key)
		FROM compra_venta
		WHERE compra_venta.fecha_on BETWEEN \''||_fecha_inicio||E'\' AND \''||_fecha_fin||E'\'
		AND compra_venta.key_servicio = \''||_key_servicio||E'\'
		AND compra_venta.tipo = \'venta\'
		AND compra_venta.estado > 0
		GROUP BY compra_venta.key_usuario
) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.reporte_ventas_vendedores(_key_servicio character varying, _fecha_inicio character varying, _fecha_fin character varying) OWNER TO postgres;

--
-- Name: test_ricky(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.test_ricky(p_key_empresa text, p_state text) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        SELECT array_to_json(array_agg(t.*)) as json
        FROM (
            SELECT 
                cvd.key_modelo,
                COALESCE(cvd.cantidad, 0) AS cantidad,
                COALESCE(cvd.precio_unitario, 0) AS precio_unitario,
                COALESCE(cvd.descuento, 0) AS descuento,
                (cvd.cantidad * cvd.precio_unitario) AS sub_total
            FROM compra_venta cv
            JOIN compra_venta_detalle cvd 
                ON cv.key = cvd.key_compra_venta
            WHERE cv.estado > 0
              AND cvd.estado > 0
              AND cv.key_empresa = p_key_empresa
              AND cv.state = p_state
        ) t
    );
END;
$$;


ALTER FUNCTION public.test_ricky(p_key_empresa text, p_state text) OWNER TO postgres;

--
-- Name: top_clientes(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.top_clientes(key_empresa text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado JSON;
BEGIN
    WITH datos AS (
        SELECT
            cv.key_cliente,
            COUNT(d.key) as total_compras,
            COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) as total_gastado
        FROM compra_venta_detalle d
        INNER JOIN compra_venta cv ON d.key_compra_venta = cv.key
        WHERE cv.tipo = 'venta'
            AND cv.key_cliente IS NOT NULL
            AND cv.key_empresa = key_empresa
        GROUP BY cv.key_cliente
        ORDER BY total_gastado DESC
        LIMIT 15
    )
    SELECT JSON_AGG(
        JSON_BUILD_OBJECT(
            'key_cliente', key_cliente,
            'total_compras', total_compras,
            'total_gastado', total_gastado
        )
    ) INTO resultado
    FROM datos;

    RETURN COALESCE(resultado, '[]'::JSON);
END;
$$;


ALTER FUNCTION public.top_clientes(key_empresa text) OWNER TO postgres;

--
-- Name: ultimas_10_compras(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ultimas_10_compras(p_key_empresa text) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        SELECT COALESCE(JSON_AGG(
            JSON_BUILD_OBJECT(
                'key', sub.key,
                'descripcion', sub.descripcion,
                'fecha_on', sub.fecha_on,
                'estado', sub.estado,
                'key_proveedor', sub.key_proveedor,
                'tipo_pago', sub.tipo_pago,
                'total_bs', sub.total_bs
            )
        ), '[]'::JSON)
        FROM (
            SELECT
                cv.key,
                cv.descripcion,
                cv.fecha_on,
                cv.estado,
                cv.key_proveedor,
                cv.tipo_pago,
                COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) as total_bs
            FROM compra_venta cv
            LEFT JOIN compra_venta_detalle d ON cv.key = d.key_compra_venta
            WHERE cv.tipo = 'compra'
                AND cv.key_empresa = p_key_empresa
                AND cv.estado > 0  -- Filtro de estado añadido
            GROUP BY cv.key, cv.descripcion, cv.fecha_on, cv.estado, cv.key_proveedor, cv.tipo_pago
            ORDER BY cv.fecha_on DESC
            LIMIT 10
        ) AS sub
    );
END;
$$;


ALTER FUNCTION public.ultimas_10_compras(p_key_empresa text) OWNER TO postgres;

--
-- Name: valor_compra_venta(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.valor_compra_venta(p_key_empresa text) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        SELECT COALESCE(JSON_AGG(
            JSON_BUILD_OBJECT(
                'producto', sub.producto,
                'stock_actual', sub.stock_actual,
                'precio_compra', ROUND(sub.precio_compra::numeric, 2),
                'valor_inventario', ROUND(sub.valor_inventario::numeric, 2)
            )
        ), '[]'::JSON)
        FROM (
            WITH ultimos_precios AS (
                SELECT
                    d.descripcion as producto,
                    d.precio_unitario_base as ultimo_precio_compra,
                    ROW_NUMBER() OVER (PARTITION BY d.descripcion ORDER BY cv.fecha_on DESC) as row_num
                FROM compra_venta_detalle d
                INNER JOIN compra_venta cv ON d.key_compra_venta = cv.key
                WHERE cv.tipo = 'compra'
                  AND cv.estado > 0
                  AND cv.key_empresa = p_key_empresa
                  AND d.descripcion IS NOT NULL
            ),
            stock_actual AS (
                SELECT
                    d.descripcion as producto,
                    SUM(CASE 
                        WHEN cv.tipo = 'compra' THEN d.cantidad
                        WHEN cv.tipo = 'venta' THEN -d.cantidad
                        ELSE 0 
                    END) as stock_actual
                FROM compra_venta_detalle d
                INNER JOIN compra_venta cv ON d.key_compra_venta = cv.key
                WHERE cv.estado > 0
                  AND cv.key_empresa = p_key_empresa
                  AND d.descripcion IS NOT NULL
                GROUP BY d.descripcion
                HAVING SUM(CASE 
                        WHEN cv.tipo = 'compra' THEN d.cantidad
                        WHEN cv.tipo = 'venta' THEN -d.cantidad
                        ELSE 0 
                    END) > 0
            )
            SELECT
                s.producto,
                s.stock_actual,
                COALESCE(p.ultimo_precio_compra, 0) as precio_compra,
                (s.stock_actual * COALESCE(p.ultimo_precio_compra, 0)) as valor_inventario
            FROM stock_actual s
            LEFT JOIN ultimos_precios p ON s.producto = p.producto AND p.row_num = 1
            ORDER BY valor_inventario DESC
        ) AS sub
    );
END;
$$;


ALTER FUNCTION public.valor_compra_venta(p_key_empresa text) OWNER TO postgres;

--
-- Name: valor_compra_venta_inventario(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.valor_compra_venta_inventario(p_key_empresa text, p_key_sucursal text DEFAULT NULL::text) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        SELECT COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'producto', sub.producto,
                    'stock_actual', sub.stock_actual,
                    'precio_compra', ROUND(sub.precio_compra::numeric, 2),
                    'valor_inventario', ROUND(sub.valor_inventario::numeric, 2)
                )
            ),
            '[]'::JSON
        )
        FROM (
            WITH ultimos_precios AS (
                SELECT
                    d.descripcion AS producto,
                    d.precio_unitario_base AS ultimo_precio_compra,
                    ROW_NUMBER() OVER (
                        PARTITION BY d.descripcion
                        ORDER BY cv.fecha_on DESC
                    ) AS row_num
                FROM compra_venta_detalle d
                INNER JOIN compra_venta cv
                    ON d.key_compra_venta = cv.key
                WHERE cv.tipo = 'compra'
                    AND cv.estado > 0
                    AND cv.key_empresa = p_key_empresa
                    AND (
                        p_key_sucursal IS NULL
                        OR cv.key_sucursal = p_key_sucursal
                    )
                    AND d.descripcion IS NOT NULL
            ),

            stock_actual AS (
                SELECT
                    d.descripcion AS producto,
                    SUM(
                        CASE
                            WHEN cv.tipo = 'compra' THEN d.cantidad
                            WHEN cv.tipo = 'venta' THEN -d.cantidad
                            ELSE 0
                        END
                    ) AS stock_actual
                FROM compra_venta_detalle d
                INNER JOIN compra_venta cv
                    ON d.key_compra_venta = cv.key
                WHERE cv.estado > 0
                    AND cv.key_empresa = p_key_empresa
                    AND (
                        p_key_sucursal IS NULL
                        OR cv.key_sucursal = p_key_sucursal
                    )
                    AND d.descripcion IS NOT NULL
                GROUP BY d.descripcion
                HAVING SUM(
                    CASE
                        WHEN cv.tipo = 'compra' THEN d.cantidad
                        WHEN cv.tipo = 'venta' THEN -d.cantidad
                        ELSE 0
                    END
                ) > 0
            )

            SELECT
                s.producto,
                s.stock_actual,
                COALESCE(
                    p.ultimo_precio_compra,
                    0
                ) AS precio_compra,
                (
                    s.stock_actual *
                    COALESCE(
                        p.ultimo_precio_compra,
                        0
                    )
                ) AS valor_inventario
            FROM stock_actual s
            LEFT JOIN ultimos_precios p
                ON s.producto = p.producto
                AND p.row_num = 1
            ORDER BY valor_inventario DESC
        ) sub
    );
END;
$$;


ALTER FUNCTION public.valor_compra_venta_inventario(p_key_empresa text, p_key_sucursal text) OWNER TO postgres;

--
-- Name: ventas_cliente(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ventas_cliente(key_usuario character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' select jsonb_object_agg(compra_venta.key, to_json(compra_venta.*))::json as json 
				from compra_venta
				where compra_venta.cliente ->> \'key_usuario\' = \''||key_usuario||E'\' 
				and compra_venta.estado > 0
				and compra_venta.state = \'vendido\'
				';
        EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public.ventas_cliente(key_usuario character varying) OWNER TO postgres;

--
-- Name: ventas_entre_fecha_por_tipo(text, character varying, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ventas_entre_fecha_por_tipo(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado json;
    v_dias integer;
    v_agrupacion varchar;
BEGIN

    -- Cantidad de días del rango
    v_dias := (p_fecha_fin - p_fecha_inicio) + 1;

    -- Determinar agrupación automáticamente
    IF v_dias <= 1 THEN
        v_agrupacion := 'hora';

    ELSIF v_dias <= 31 THEN
        v_agrupacion := 'dia';

    ELSIF v_dias <= 365 THEN
        v_agrupacion := 'mes';

    ELSE
        v_agrupacion := 'anio';
    END IF;

    WITH ventas_dias_tipo AS (

        SELECT
            cv.key_sucursal,

            CASE
                WHEN v_agrupacion = 'hora' THEN
                    LPAD(EXTRACT(HOUR FROM cv.fecha_on)::text, 2, '0')

                WHEN v_agrupacion = 'dia' THEN
                    TO_CHAR(cv.fecha_on, 'YYYY-MM-DD')

                WHEN v_agrupacion = 'mes' THEN
                    TO_CHAR(cv.fecha_on, 'YYYY-MM')

                ELSE
                    TO_CHAR(cv.fecha_on, 'YYYY')
            END AS dia,

            tp.tipo AS tipo_producto,

            COUNT(DISTINCT cv.key) AS cantidad_ventas,

            COALESCE(
                SUM(d.cantidad * d.precio_unitario_base),
                0
            ) AS monto_total

        FROM compra_venta cv

        INNER JOIN compra_venta_detalle d
            ON cv.key = d.key_compra_venta

        INNER JOIN dblink(
            'host=192.168.5.39 dbname=servisofts.inventario user=postgres password=postgres',
            'SELECT modelo.key, tipo_producto.tipo
             FROM modelo
             JOIN tipo_producto
                ON modelo.key_tipo_producto = tipo_producto.key'
        ) AS tp(
            key text,
            tipo text
        )
            ON d.key_modelo = tp.key

        WHERE
            cv.tipo = p_tipo_transaccion
            AND cv.key_empresa = p_key_empresa
            AND cv.fecha_on >= p_fecha_inicio
            AND cv.fecha_on < (p_fecha_fin + INTERVAL '1 day')
            AND cv.estado > 0

        GROUP BY
            cv.key_sucursal,
            dia,
            tp.tipo
    ),

    dias_agrupados AS (

        SELECT
            key_sucursal,
            dia,

            json_agg(
                json_build_object(
                    'tipo_producto', tipo_producto,
                    'cantidad_ventas', cantidad_ventas,
                    'monto_total', monto_total
                )
                ORDER BY tipo_producto
            ) AS tipos

        FROM ventas_dias_tipo

        GROUP BY
            key_sucursal,
            dia
    ),

    sucursales_agrupadas AS (

        SELECT
            key_sucursal,

            json_agg(
                json_build_object(
                    'dia', dia,
                    'tipos', tipos
                )
                ORDER BY dia
            ) AS dias

        FROM dias_agrupados

        GROUP BY key_sucursal
    )

    SELECT json_agg(
        json_build_object(
            'key_sucursal', key_sucursal,
            'dias', dias
        )
    )
    INTO resultado
    FROM sucursales_agrupadas;

    RETURN resultado;

END;
$$;


ALTER FUNCTION public.ventas_entre_fecha_por_tipo(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) OWNER TO postgres;

--
-- Name: ventas_por_dia(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ventas_por_dia(p_key_empresa text) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
        FROM (
            SELECT
                DATE(cv.fecha_on) AS fecha,
                COUNT(DISTINCT cv.key) AS total_ventas,
                COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) AS total_bs
            FROM compra_venta cv
            INNER JOIN compra_venta_detalle d ON cv.key = d.key_compra_venta
            WHERE cv.tipo = 'venta'
              AND cv.key_empresa = p_key_empresa
              AND cv.estado > 0
            GROUP BY DATE(cv.fecha_on)
            ORDER BY fecha ASC
        ) t
    );
END;
$$;


ALTER FUNCTION public.ventas_por_dia(p_key_empresa text) OWNER TO postgres;

--
-- Name: ventas_por_dia2(text, character varying, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ventas_por_dia2(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado json;
BEGIN
    -- Primero agregamos por sucursal y día
    WITH ventas_dias AS (
        SELECT
            cv.key_sucursal,
            EXTRACT(DAY FROM cv.fecha_on)::int AS dia,
            COUNT(DISTINCT cv.key) AS cantidad_ventas,
            COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) AS monto_total
        FROM compra_venta cv
        INNER JOIN compra_venta_detalle d
            ON cv.key = d.key_compra_venta
        WHERE
            cv.tipo = p_tipo_transaccion
            AND cv.key_empresa = p_key_empresa
            AND cv.fecha_on >= p_fecha_inicio
            AND cv.fecha_on < (p_fecha_fin + INTERVAL '1 day')
            AND cv.estado > 0
        GROUP BY cv.key_sucursal, dia
    ),
    dias_agrupados AS (
        SELECT
            key_sucursal,
            json_agg(
                json_build_object(
                    'dia', dia,
                    'cantidad_ventas', cantidad_ventas,
                    'monto_total', monto_total
                ) ORDER BY dia
            ) AS dias
        FROM ventas_dias
        GROUP BY key_sucursal
    )
    SELECT json_agg(
                json_build_object(
                    'key_sucursal', key_sucursal,
                    'dias', dias
                )
           )
    INTO resultado
    FROM dias_agrupados;

    RETURN resultado;
END;
$$;


ALTER FUNCTION public.ventas_por_dia2(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) OWNER TO postgres;

--
-- Name: ventas_por_dia_mes_por_tipo_all(text, character varying, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ventas_por_dia_mes_por_tipo_all(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado json;
BEGIN

    WITH dias_mes AS (
        SELECT generate_series(
            p_fecha_inicio,
            p_fecha_fin,
            interval '1 day'
        )::date AS fecha
    ),

    ventas_dias_tipo AS (
        SELECT
            cv.key_sucursal,
            cv.fecha_on::date AS fecha,
            tp.tipo AS tipo_producto,
            COUNT(DISTINCT cv.key) AS cantidad_ventas,
            COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) AS monto_total
        FROM compra_venta cv
        INNER JOIN compra_venta_detalle d
            ON cv.key = d.key_compra_venta
        INNER JOIN dblink(
            'host=192.168.5.39 dbname=servisofts.inventario user=postgres password=postgres',
            'SELECT modelo.key, tipo_producto.tipo
             FROM modelo
             JOIN tipo_producto
               ON modelo.key_tipo_producto = tipo_producto.key'
        ) AS tp(key text, tipo text)
            ON d.key_modelo = tp.key
        WHERE
            cv.tipo = p_tipo_transaccion
            AND cv.key_empresa = p_key_empresa
            AND cv.fecha_on >= p_fecha_inicio
            AND cv.fecha_on < (p_fecha_fin + INTERVAL '1 day')
            AND cv.estado > 0
        GROUP BY
            cv.key_sucursal,
            cv.fecha_on::date,
            tp.tipo
    ),

    sucursales AS (
        SELECT DISTINCT key_sucursal
        FROM ventas_dias_tipo
    ),

    dias_agrupados AS (
        SELECT
            s.key_sucursal,
            EXTRACT(DAY FROM dm.fecha)::int AS dia,

            COALESCE(
                json_agg(
                    json_build_object(
                        'tipo_producto', vdt.tipo_producto,
                        'cantidad_ventas', vdt.cantidad_ventas,
                        'monto_total', vdt.monto_total
                    )
                    ORDER BY vdt.tipo_producto
                ) FILTER (WHERE vdt.tipo_producto IS NOT NULL),
                '[]'::json
            ) AS tipos

        FROM sucursales s
        CROSS JOIN dias_mes dm
        LEFT JOIN ventas_dias_tipo vdt
            ON vdt.key_sucursal = s.key_sucursal
           AND vdt.fecha = dm.fecha

        GROUP BY
            s.key_sucursal,
            dm.fecha
    ),

    sucursales_agrupadas AS (
        SELECT
            key_sucursal,
            json_agg(
                json_build_object(
                    'dia', dia,
                    'tipos', tipos
                )
                ORDER BY dia
            ) AS dias
        FROM dias_agrupados
        GROUP BY key_sucursal
    )

    SELECT json_agg(
        json_build_object(
            'key_sucursal', key_sucursal,
            'dias', dias
        )
    )
    INTO resultado
    FROM sucursales_agrupadas;

    RETURN COALESCE(resultado, '[]'::json);

END;
$$;


ALTER FUNCTION public.ventas_por_dia_mes_por_tipo_all(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) OWNER TO postgres;

--
-- Name: ventas_por_dia_por_tipo(text, character varying, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ventas_por_dia_por_tipo(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado json;
BEGIN
    -- Agregamos por sucursal, día y tipo de producto
    WITH ventas_dias_tipo AS (
        SELECT
            cv.key_sucursal,
            EXTRACT(DAY FROM cv.fecha_on)::int AS dia,
            tp.tipo AS tipo_producto,
            COUNT(DISTINCT cv.key) AS cantidad_ventas,
            COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) AS monto_total
        FROM compra_venta cv
        INNER JOIN compra_venta_detalle d
            ON cv.key = d.key_compra_venta
        INNER JOIN dblink(
            'host=192.168.5.39 dbname=servisofts.inventario user=postgres password=postgres',
            'SELECT modelo.key, tipo_producto.tipo FROM modelo JOIN tipo_producto ON modelo.key_tipo_producto = tipo_producto.key'
        ) AS tp(key text, tipo text)
            ON d.key_modelo = tp.key
        WHERE
            cv.tipo = p_tipo_transaccion
            AND cv.key_empresa = p_key_empresa
            AND cv.fecha_on >= p_fecha_inicio
            AND cv.fecha_on < (p_fecha_fin + INTERVAL '1 day')
            AND cv.estado > 0
        GROUP BY cv.key_sucursal, dia, tp.tipo
    ),
    dias_agrupados AS (
        SELECT
            key_sucursal,
            dia,
            json_agg(
                json_build_object(
                    'tipo_producto', tipo_producto,
                    'cantidad_ventas', cantidad_ventas,
                    'monto_total', monto_total
                ) ORDER BY tipo_producto
            ) AS tipos
        FROM ventas_dias_tipo
        GROUP BY key_sucursal, dia
    ),
    sucursales_agrupadas AS (
        SELECT
            key_sucursal,
            json_agg(
                json_build_object(
                    'dia', dia,
                    'tipos', tipos
                ) ORDER BY dia
            ) AS dias
        FROM dias_agrupados
        GROUP BY key_sucursal
    )
    SELECT json_agg(
                json_build_object(
                    'key_sucursal', key_sucursal,
                    'dias', dias
                )
           )
    INTO resultado
    FROM sucursales_agrupadas;

    RETURN resultado;
END;
$$;


ALTER FUNCTION public.ventas_por_dia_por_tipo(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) OWNER TO postgres;

--
-- Name: ventas_por_dia_por_tipo2(text, character varying, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ventas_por_dia_por_tipo2(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado json;
BEGIN
    WITH ventas_dias_tipo AS (
        SELECT
            cv.key_sucursal,
            EXTRACT(DOW FROM cv.fecha_on)::int AS orden_dia,
            CASE EXTRACT(DOW FROM cv.fecha_on)
                WHEN 0 THEN 'Domingo'
                WHEN 1 THEN 'Lunes'
                WHEN 2 THEN 'Martes'
                WHEN 3 THEN 'Miércoles'
                WHEN 4 THEN 'Jueves'
                WHEN 5 THEN 'Viernes'
                WHEN 6 THEN 'Sábado'
            END AS dia,
            tp.tipo AS tipo_producto,
            COUNT(DISTINCT cv.key) AS cantidad_ventas,
            COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) AS monto_total
        FROM compra_venta cv
        INNER JOIN compra_venta_detalle d
            ON cv.key = d.key_compra_venta
        INNER JOIN dblink(
            'host=192.168.5.39 dbname=servisofts.inventario user=postgres password=postgres',
            'SELECT modelo.key, tipo_producto.tipo
             FROM modelo
             JOIN tipo_producto
               ON modelo.key_tipo_producto = tipo_producto.key'
        ) AS tp(key text, tipo text)
            ON d.key_modelo = tp.key
        WHERE
            cv.tipo = p_tipo_transaccion
            AND cv.key_empresa = p_key_empresa
            AND cv.fecha_on >= p_fecha_inicio
            AND cv.fecha_on < (p_fecha_fin + INTERVAL '1 day')
            AND cv.estado > 0
        GROUP BY
            cv.key_sucursal,
            orden_dia,
            dia,
            tp.tipo
    ),
    dias_agrupados AS (
        SELECT
            key_sucursal,
            orden_dia,
            dia,
            json_agg(
                json_build_object(
                    'tipo_producto', tipo_producto,
                    'cantidad_ventas', cantidad_ventas,
                    'monto_total', monto_total
                )
                ORDER BY tipo_producto
            ) AS tipos
        FROM ventas_dias_tipo
        GROUP BY
            key_sucursal,
            orden_dia,
            dia
    ),
    sucursales_agrupadas AS (
        SELECT
            key_sucursal,
            json_agg(
                json_build_object(
                    'dia', dia,
                    'tipos', tipos
                )
                ORDER BY orden_dia
            ) AS dias
        FROM dias_agrupados
        GROUP BY key_sucursal
    )
    SELECT json_agg(
        json_build_object(
            'key_sucursal', key_sucursal,
            'dias', dias
        )
    )
    INTO resultado
    FROM sucursales_agrupadas;

    RETURN COALESCE(resultado, '[]'::json);
END;
$$;


ALTER FUNCTION public.ventas_por_dia_por_tipo2(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) OWNER TO postgres;

--
-- Name: ventas_por_dia_por_tipo3(text, character varying, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ventas_por_dia_por_tipo3(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado json;
BEGIN

    WITH dias_semana AS (
        SELECT *
        FROM (
            VALUES
                (0, 'Domingo'),
                (1, 'Lunes'),
                (2, 'Martes'),
                (3, 'Miércoles'),
                (4, 'Jueves'),
                (5, 'Viernes'),
                (6, 'Sábado')
        ) AS d(orden_dia, dia)
    ),

    ventas_dias_tipo AS (
        SELECT
            cv.key_sucursal,
            EXTRACT(DOW FROM cv.fecha_on)::int AS orden_dia,
            tp.tipo AS tipo_producto,
            COUNT(DISTINCT cv.key) AS cantidad_ventas,
            COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) AS monto_total
        FROM compra_venta cv
        INNER JOIN compra_venta_detalle d
            ON cv.key = d.key_compra_venta
        INNER JOIN dblink(
            'host=192.168.5.39 dbname=servisofts.inventario user=postgres password=postgres',
            'SELECT modelo.key, tipo_producto.tipo
             FROM modelo
             JOIN tipo_producto
               ON modelo.key_tipo_producto = tipo_producto.key'
        ) AS tp(key text, tipo text)
            ON d.key_modelo = tp.key
        WHERE
            cv.tipo = p_tipo_transaccion
            AND cv.key_empresa = p_key_empresa
            AND cv.fecha_on >= p_fecha_inicio
            AND cv.fecha_on < (p_fecha_fin + INTERVAL '1 day')
            AND cv.estado > 0
        GROUP BY
            cv.key_sucursal,
            orden_dia,
            tp.tipo
    ),

    sucursales AS (
        SELECT DISTINCT key_sucursal
        FROM ventas_dias_tipo
    ),

    dias_agrupados AS (
        SELECT
            s.key_sucursal,
            ds.orden_dia,
            ds.dia,
            COALESCE(
                json_agg(
                    json_build_object(
                        'tipo_producto', vdt.tipo_producto,
                        'cantidad_ventas', vdt.cantidad_ventas,
                        'monto_total', vdt.monto_total
                    )
                    ORDER BY vdt.tipo_producto
                ) FILTER (WHERE vdt.tipo_producto IS NOT NULL),
                '[]'::json
            ) AS tipos
        FROM sucursales s
        CROSS JOIN dias_semana ds
        LEFT JOIN ventas_dias_tipo vdt
            ON vdt.key_sucursal = s.key_sucursal
           AND vdt.orden_dia = ds.orden_dia
        GROUP BY
            s.key_sucursal,
            ds.orden_dia,
            ds.dia
    ),

    sucursales_agrupadas AS (
        SELECT
            key_sucursal,
            json_agg(
                json_build_object(
                    'dia', dia,
                    'tipos', tipos
                )
                ORDER BY orden_dia
            ) AS dias
        FROM dias_agrupados
        GROUP BY key_sucursal
    )

    SELECT json_agg(
        json_build_object(
            'key_sucursal', key_sucursal,
            'dias', dias
        )
    )
    INTO resultado
    FROM sucursales_agrupadas;

    RETURN COALESCE(resultado, '[]'::json);

END;
$$;


ALTER FUNCTION public.ventas_por_dia_por_tipo3(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) OWNER TO postgres;

--
-- Name: ventas_por_dia_por_tipo_all(text, character varying, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ventas_por_dia_por_tipo_all(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado json;
BEGIN

    WITH dias_semana AS (
        SELECT *
        FROM (
            VALUES
                (0, 'Domingo'),
                (1, 'Lunes'),
                (2, 'Martes'),
                (3, 'Miércoles'),
                (4, 'Jueves'),
                (5, 'Viernes'),
                (6, 'Sábado')
        ) AS d(orden_dia, dia)
    ),

    ventas_dias_tipo AS (
        SELECT
            cv.key_sucursal,
            EXTRACT(DOW FROM cv.fecha_on)::int AS orden_dia,
            tp.tipo AS tipo_producto,
            COUNT(DISTINCT cv.key) AS cantidad_ventas,
            COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) AS monto_total
        FROM compra_venta cv
        INNER JOIN compra_venta_detalle d
            ON cv.key = d.key_compra_venta
        INNER JOIN dblink(
            'host=192.168.5.39 dbname=servisofts.inventario user=postgres password=postgres',
            'SELECT modelo.key, tipo_producto.tipo
             FROM modelo
             JOIN tipo_producto
               ON modelo.key_tipo_producto = tipo_producto.key'
        ) AS tp(key text, tipo text)
            ON d.key_modelo = tp.key
        WHERE
            cv.tipo = p_tipo_transaccion
            AND cv.key_empresa = p_key_empresa
            AND cv.fecha_on >= p_fecha_inicio
            AND cv.fecha_on < (p_fecha_fin + INTERVAL '1 day')
            AND cv.estado > 0
        GROUP BY
            cv.key_sucursal,
            orden_dia,
            tp.tipo
    ),

    sucursales AS (
        SELECT DISTINCT key_sucursal
        FROM ventas_dias_tipo
    ),

    dias_agrupados AS (
        SELECT
            s.key_sucursal,
            ds.orden_dia,
            ds.dia,
            COALESCE(
                json_agg(
                    json_build_object(
                        'tipo_producto', vdt.tipo_producto,
                        'cantidad_ventas', vdt.cantidad_ventas,
                        'monto_total', vdt.monto_total
                    )
                    ORDER BY vdt.tipo_producto
                ) FILTER (WHERE vdt.tipo_producto IS NOT NULL),
                '[]'::json
            ) AS tipos
        FROM sucursales s
        CROSS JOIN dias_semana ds
        LEFT JOIN ventas_dias_tipo vdt
            ON vdt.key_sucursal = s.key_sucursal
           AND vdt.orden_dia = ds.orden_dia
        GROUP BY
            s.key_sucursal,
            ds.orden_dia,
            ds.dia
    ),

    sucursales_agrupadas AS (
        SELECT
            key_sucursal,
            json_agg(
                json_build_object(
                    'dia', dia,
                    'tipos', tipos
                )
                ORDER BY orden_dia
            ) AS dias
        FROM dias_agrupados
        GROUP BY key_sucursal
    )

    SELECT json_agg(
        json_build_object(
            'key_sucursal', key_sucursal,
            'dias', dias
        )
    )
    INTO resultado
    FROM sucursales_agrupadas;

    RETURN COALESCE(resultado, '[]'::json);

END;
$$;


ALTER FUNCTION public.ventas_por_dia_por_tipo_all(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) OWNER TO postgres;

--
-- Name: ventas_por_fecha(text, character varying, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ventas_por_fecha(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) RETURNS json
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    resultado JSON;
BEGIN
    SELECT json_agg(row_to_json(t))
    INTO resultado
    FROM (
        SELECT 
            cv.key_sucursal,
            COUNT(DISTINCT cv.key) AS cantidad_ventas,
            COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) AS monto_total
        FROM compra_venta cv
        INNER JOIN compra_venta_detalle d 
            ON cv.key = d.key_compra_venta
        WHERE
            cv.tipo = p_tipo_transaccion
            AND cv.key_empresa = p_key_empresa
            AND cv.fecha_on >= p_fecha_inicio
            AND cv.fecha_on < (p_fecha_fin + INTERVAL '1 day')
            AND cv.estado > 0
        GROUP BY cv.key_sucursal
        ORDER BY cantidad_ventas DESC
    ) t;

    RETURN resultado;
END;
$$;


ALTER FUNCTION public.ventas_por_fecha(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) OWNER TO postgres;

--
-- Name: ventas_por_hora_por_tipo(text, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ventas_por_hora_por_tipo(p_key_empresa text, p_tipo_transaccion character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado json;
BEGIN

    WITH ventas_dias_tipo AS (
        SELECT
            cv.key_sucursal,
            EXTRACT(HOUR FROM cv.fecha_on)::int AS dia,
            tp.tipo AS tipo_producto,
            COUNT(DISTINCT cv.key) AS cantidad_ventas,
            COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) AS monto_total
        FROM compra_venta cv
        INNER JOIN compra_venta_detalle d
            ON cv.key = d.key_compra_venta
        INNER JOIN dblink(
            'host=192.168.5.39 dbname=servisofts.inventario user=postgres password=postgres',
            'SELECT modelo.key, tipo_producto.tipo
             FROM modelo
             INNER JOIN tipo_producto
                ON modelo.key_tipo_producto = tipo_producto.key'
        ) AS tp(key text, tipo text)
            ON d.key_modelo = tp.key
        WHERE
            cv.tipo = p_tipo_transaccion
            AND cv.key_empresa = p_key_empresa
            AND cv.estado > 0
            AND cv.fecha_on >= CURRENT_DATE
            AND cv.fecha_on < CURRENT_DATE + INTERVAL '1 day'
        GROUP BY
            cv.key_sucursal,
            dia,
            tp.tipo
    ),

    dias_agrupadas AS (
        SELECT
            key_sucursal,
            dia,
            json_agg(
                json_build_object(
                    'tipo_producto', tipo_producto,
                    'cantidad_ventas', cantidad_ventas,
                    'monto_total', monto_total
                )
                ORDER BY tipo_producto
            ) AS tipos
        FROM ventas_dias_tipo
        GROUP BY
            key_sucursal,
            dia
    ),

    sucursales_agrupadas AS (
        SELECT
            key_sucursal,
            json_agg(
                json_build_object(
                    'dia', dia,
                    'tipos', tipos
                )
                ORDER BY dia
            ) AS dias
        FROM dias_agrupadas
        GROUP BY key_sucursal
    )

    SELECT json_agg(
        json_build_object(
            'key_sucursal', key_sucursal,
            'dias', dias
        )
    )
    INTO resultado
    FROM sucursales_agrupadas;

    RETURN COALESCE(resultado, '[]'::json);

END;
$$;


ALTER FUNCTION public.ventas_por_hora_por_tipo(p_key_empresa text, p_tipo_transaccion character varying) OWNER TO postgres;

--
-- Name: ventas_por_hora_por_tipo(text, character varying, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ventas_por_hora_por_tipo(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado json;
BEGIN

    WITH ventas_dias_tipo AS (
        SELECT
            cv.key_sucursal,
            EXTRACT(HOUR FROM cv.fecha_on)::int AS dia,
            tp.tipo AS tipo_producto,
            COUNT(DISTINCT cv.key) AS cantidad_ventas,
            COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) AS monto_total
        FROM compra_venta cv
        INNER JOIN compra_venta_detalle d
            ON cv.key = d.key_compra_venta
        INNER JOIN dblink(
            'host=192.168.5.39 dbname=servisofts.inventario user=postgres password=postgres',
            'SELECT modelo.key, tipo_producto.tipo
             FROM modelo
             INNER JOIN tipo_producto
                ON modelo.key_tipo_producto = tipo_producto.key'
        ) AS tp(key text, tipo text)
            ON d.key_modelo = tp.key
        WHERE
            cv.tipo = p_tipo_transaccion
            AND cv.key_empresa = p_key_empresa
            AND cv.estado > 0
            AND cv.fecha_on >= CURRENT_DATE
            AND cv.fecha_on < CURRENT_DATE + INTERVAL '1 day'
        GROUP BY
            cv.key_sucursal,
            dia,
            tp.tipo
    ),

    dias_agrupadas AS (
        SELECT
            key_sucursal,
            dia,
            json_agg(
                json_build_object(
                    'tipo_producto', tipo_producto,
                    'cantidad_ventas', cantidad_ventas,
                    'monto_total', monto_total
                )
                ORDER BY tipo_producto
            ) AS tipos
        FROM ventas_dias_tipo
        GROUP BY
            key_sucursal,
            dia
    ),

    sucursales_agrupadas AS (
        SELECT
            key_sucursal,
            json_agg(
                json_build_object(
                    'dia', dia,
                    'tipos', tipos
                )
                ORDER BY dia
            ) AS dias
        FROM dias_agrupadas
        GROUP BY key_sucursal
    )

    SELECT json_agg(
        json_build_object(
            'key_sucursal', key_sucursal,
            'dias', dias
        )
    )
    INTO resultado
    FROM sucursales_agrupadas;

    RETURN COALESCE(resultado, '[]'::json);

END;
$$;


ALTER FUNCTION public.ventas_por_hora_por_tipo(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) OWNER TO postgres;

--
-- Name: ventas_por_mes(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ventas_por_mes(p_key_empresa text) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
        FROM (
            SELECT
                DATE_TRUNC('month', cv.fecha_on) AS mes,
                COUNT(DISTINCT cv.key) AS total_ventas,
                COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) AS total_bs
            FROM compra_venta cv
            INNER JOIN compra_venta_detalle d ON cv.key = d.key_compra_venta
            WHERE cv.tipo = 'venta'
              AND cv.key_empresa = p_key_empresa
              AND cv.estado > 0
            GROUP BY DATE_TRUNC('month', cv.fecha_on)
            ORDER BY mes ASC
        ) t
    );
END;
$$;


ALTER FUNCTION public.ventas_por_mes(p_key_empresa text) OWNER TO postgres;

--
-- Name: ventas_por_mes_por_tipo(text, character varying, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ventas_por_mes_por_tipo(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado json;
BEGIN
    -- Agregamos por sucursal, mes y tipo de producto
    WITH ventas_dias_tipo AS (
        SELECT
            cv.key_sucursal,
            EXTRACT(MONTH FROM cv.fecha_on)::int AS orden_mes,
            CASE EXTRACT(MONTH FROM cv.fecha_on)
                WHEN 1 THEN 'Enero'
                WHEN 2 THEN 'Febrero'
                WHEN 3 THEN 'Marzo'
                WHEN 4 THEN 'Abril'
                WHEN 5 THEN 'Mayo'
                WHEN 6 THEN 'Junio'
                WHEN 7 THEN 'Julio'
                WHEN 8 THEN 'Agosto'
                WHEN 9 THEN 'Septiembre'
                WHEN 10 THEN 'Octubre'
                WHEN 11 THEN 'Noviembre'
                WHEN 12 THEN 'Diciembre'
            END AS dia,
            tp.tipo AS tipo_producto,
            COUNT(DISTINCT cv.key) AS cantidad_ventas,
            COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) AS monto_total
        FROM compra_venta cv
        INNER JOIN compra_venta_detalle d
            ON cv.key = d.key_compra_venta
        INNER JOIN dblink(
            'host=192.168.5.39 dbname=servisofts.inventario user=postgres password=postgres',
            'SELECT modelo.key, tipo_producto.tipo
             FROM modelo
             JOIN tipo_producto
               ON modelo.key_tipo_producto = tipo_producto.key'
        ) AS tp(key text, tipo text)
            ON d.key_modelo = tp.key
        WHERE
            cv.tipo = p_tipo_transaccion
            AND cv.key_empresa = p_key_empresa
            AND cv.fecha_on >= p_fecha_inicio
            AND cv.fecha_on < (p_fecha_fin + INTERVAL '1 day')
            AND cv.estado > 0
        GROUP BY
            cv.key_sucursal,
            orden_mes,
            dia,
            tp.tipo
    ),
    dias_agrupados AS (
        SELECT
            key_sucursal,
            orden_mes,
            dia,
            json_agg(
                json_build_object(
                    'tipo_producto', tipo_producto,
                    'cantidad_ventas', cantidad_ventas,
                    'monto_total', monto_total
                )
                ORDER BY tipo_producto
            ) AS tipos
        FROM ventas_dias_tipo
        GROUP BY
            key_sucursal,
            orden_mes,
            dia
    ),
    sucursales_agrupadas AS (
        SELECT
            key_sucursal,
            json_agg(
                json_build_object(
                    'dia', dia,
                    'tipos', tipos
                )
                ORDER BY orden_mes
            ) AS dias
        FROM dias_agrupados
        GROUP BY key_sucursal
    )
    SELECT json_agg(
        json_build_object(
            'key_sucursal', key_sucursal,
            'dias', dias
        )
    )
    INTO resultado
    FROM sucursales_agrupadas;

    RETURN COALESCE(resultado, '[]'::json);
END;
$$;


ALTER FUNCTION public.ventas_por_mes_por_tipo(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) OWNER TO postgres;

--
-- Name: ventas_por_mes_por_tipo_all(text, character varying, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ventas_por_mes_por_tipo_all(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado json;
BEGIN

    WITH meses AS (
        SELECT *
        FROM (
            VALUES
                (1, 'Enero'),
                (2, 'Febrero'),
                (3, 'Marzo'),
                (4, 'Abril'),
                (5, 'Mayo'),
                (6, 'Junio'),
                (7, 'Julio'),
                (8, 'Agosto'),
                (9, 'Septiembre'),
                (10, 'Octubre'),
                (11, 'Noviembre'),
                (12, 'Diciembre')
        ) AS m(orden_mes, mes)
    ),

    ventas_meses_tipo AS (
        SELECT
            cv.key_sucursal,
            EXTRACT(MONTH FROM cv.fecha_on)::int AS orden_mes,
            tp.tipo AS tipo_producto,
            COUNT(DISTINCT cv.key) AS cantidad_ventas,
            COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) AS monto_total
        FROM compra_venta cv
        INNER JOIN compra_venta_detalle d
            ON cv.key = d.key_compra_venta
        INNER JOIN dblink(
            'host=192.168.5.39 dbname=servisofts.inventario user=postgres password=postgres',
            'SELECT modelo.key, tipo_producto.tipo
             FROM modelo
             JOIN tipo_producto
               ON modelo.key_tipo_producto = tipo_producto.key'
        ) AS tp(key text, tipo text)
            ON d.key_modelo = tp.key
        WHERE
            cv.tipo = p_tipo_transaccion
            AND cv.key_empresa = p_key_empresa
            AND cv.fecha_on >= p_fecha_inicio
            AND cv.fecha_on < (p_fecha_fin + INTERVAL '1 day')
            AND cv.estado > 0
        GROUP BY
            cv.key_sucursal,
            orden_mes,
            tp.tipo
    ),

    sucursales AS (
        SELECT DISTINCT key_sucursal
        FROM ventas_meses_tipo
    ),

    meses_agrupados AS (
        SELECT
            s.key_sucursal,
            m.orden_mes,
            m.mes,

            COALESCE(
                json_agg(
                    json_build_object(
                        'tipo_producto', vmt.tipo_producto,
                        'cantidad_ventas', vmt.cantidad_ventas,
                        'monto_total', vmt.monto_total
                    )
                    ORDER BY vmt.tipo_producto
                ) FILTER (WHERE vmt.tipo_producto IS NOT NULL),
                '[]'::json
            ) AS tipos

        FROM sucursales s
        CROSS JOIN meses m
        LEFT JOIN ventas_meses_tipo vmt
            ON vmt.key_sucursal = s.key_sucursal
           AND vmt.orden_mes = m.orden_mes

        GROUP BY
            s.key_sucursal,
            m.orden_mes,
            m.mes
    ),

    sucursales_agrupadas AS (
        SELECT
            key_sucursal,
            json_agg(
                json_build_object(
                    'dia', mes,
                    'tipos', tipos
                )
                ORDER BY orden_mes
            ) AS dias
        FROM meses_agrupados
        GROUP BY key_sucursal
    )

    SELECT json_agg(
        json_build_object(
            'key_sucursal', key_sucursal,
            'dias', dias
        )
    )
    INTO resultado
    FROM sucursales_agrupadas;

    RETURN COALESCE(resultado, '[]'::json);

END;
$$;


ALTER FUNCTION public.ventas_por_mes_por_tipo_all(p_key_empresa text, p_tipo_transaccion character varying, p_fecha_inicio date, p_fecha_fin date) OWNER TO postgres;

--
-- Name: ventas_por_metodo_pago(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ventas_por_metodo_pago(p_key_empresa text) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
        FROM (
            SELECT
                cv.tipo_pago AS metodo_pago,
                COUNT(DISTINCT cv.key) AS total_ventas,
                COALESCE(SUM(d.cantidad * d.precio_unitario_base), 0) AS total_bs
            FROM compra_venta cv
            INNER JOIN compra_venta_detalle d ON cv.key = d.key_compra_venta
            WHERE cv.tipo = 'venta'
              AND cv.key_empresa = p_key_empresa
              AND cv.estado > 0
            GROUP BY cv.tipo_pago
            ORDER BY total_bs DESC
        ) t
    );
END;
$$;


ALTER FUNCTION public.ventas_por_metodo_pago(p_key_empresa text) OWNER TO postgres;

--
-- Name: ventas_sin_entregar(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ventas_sin_entregar() RETURNS SETOF character varying
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
				select * from (
					select  compra_venta_detalle.key,
						compra_venta_detalle.key_compra_venta,
						compra_venta_detalle.fecha_on,
						compra_venta_detalle.estado,
						compra_venta_detalle.descripcion,
						compra_venta_detalle.observacion,
						compra_venta_detalle_producto.key as key_compra_venta_detalle_producto,
						compra_venta_detalle_producto.key_producto,
						compra_venta.proveedor,
						compra_venta.cliente,
						compra_venta_detalle.precio_unitario,
						compra_venta_detalle.descuento,
						compra_venta_detalle.key_usuario,
						compra_venta_detalle.data,
						compra_venta_detalle.cantidad
					from compra_venta,
					compra_venta_detalle,
					compra_venta_detalle_producto
					where compra_venta_detalle.key_compra_venta = compra_venta.key
					and compra_venta_detalle.tipo like \'producto\'
					and compra_venta.state like \'vendido\'
					and compra_venta.tipo like \'venta\'
					and compra_venta.estado > 0
					and compra_venta_detalle.estado > 0
					and compra_venta_detalle_producto.key_compra_venta_detalle = compra_venta_detalle.key
					and compra_venta_detalle_producto.fecha_off is null
					)sq2
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.ventas_sin_entregar() OWNER TO postgres;

--
-- Name: ventas_sin_entregar(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ventas_sin_entregar(_key_sucursal character varying) RETURNS SETOF character varying
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
				select * from (
					select  compra_venta_detalle.key,
						compra_venta_detalle.key_compra_venta,
						compra_venta_detalle.fecha_on,
						compra_venta_detalle.estado,
						compra_venta_detalle.descripcion,
						compra_venta_detalle.observacion,
						compra_venta_detalle_producto.key as key_compra_venta_detalle_producto,
						compra_venta_detalle_producto.key_producto,
						compra_venta.proveedor,
						compra_venta.cliente,
						compra_venta_detalle.precio_unitario,
						compra_venta_detalle.descuento,
						compra_venta_detalle.key_usuario,
						compra_venta_detalle.data,
						compra_venta_detalle.cantidad
					from compra_venta,
					compra_venta_detalle,
					compra_venta_detalle_producto
					where compra_venta_detalle.key_compra_venta = compra_venta.key
					and compra_venta_detalle.tipo like \'producto\'
					and compra_venta_detalle.estado > 0
					and compra_venta.state like \'vendido\'
					and compra_venta.tipo like \'venta\'
					and compra_venta.estado > 0
					and compra_venta.key_sucursal = \''||_key_sucursal||E'\'
					and compra_venta_detalle_producto.key_compra_venta_detalle = compra_venta_detalle.key
					and compra_venta_detalle_producto.fecha_off is null
					)sq2
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.ventas_sin_entregar(_key_sucursal character varying) OWNER TO postgres;

--
-- Name: ventas_sin_entregar_empresa(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ventas_sin_entregar_empresa(_key_empresa character varying) RETURNS SETOF character varying
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
				select * from (
					select  compra_venta_detalle.key,
						compra_venta_detalle.key_compra_venta,
						compra_venta_detalle.fecha_on,
						compra_venta_detalle.estado,
						compra_venta_detalle.descripcion,
						compra_venta_detalle.observacion,
						compra_venta_detalle_producto.key as key_compra_venta_detalle_producto,
						compra_venta_detalle_producto.key_producto,
						compra_venta.proveedor,
						compra_venta.cliente,
						compra_venta_detalle.precio_unitario,
						compra_venta_detalle.descuento,
						compra_venta_detalle.key_usuario,
						compra_venta_detalle.data,
						compra_venta_detalle.cantidad
					from compra_venta,
					compra_venta_detalle,
					compra_venta_detalle_producto
					where compra_venta_detalle.key_compra_venta = compra_venta.key
					and compra_venta_detalle.tipo like \'producto\'
					and compra_venta_detalle.estado > 0
					and compra_venta.state like \'vendido\'
					and compra_venta.tipo like \'venta\'
					and compra_venta.estado > 0
					and compra_venta.key_empresa = \''||_key_empresa||E'\'
					and compra_venta_detalle_producto.key_compra_venta_detalle = compra_venta_detalle.key
					and compra_venta_detalle_producto.fecha_off is null
					)sq2
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.ventas_sin_entregar_empresa(_key_empresa character varying) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: comision; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comision (
    key character varying NOT NULL,
    key_usuario character varying,
    key_empresa character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    monto double precision,
    key_modelo_cliente character varying,
    key_compra_venta_detalle character varying
);


ALTER TABLE public.comision OWNER TO postgres;

--
-- Name: compra_venta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compra_venta (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    key_sucursal character varying,
    key_servicio character varying,
    state character varying,
    tipo character varying,
    periodicidad_medida character varying,
    periodicidad_valor integer,
    porcentaje_interes double precision,
    tipo_pago character varying,
    conyuge json,
    garante json,
    key_empresa character varying,
    key_cliente character varying,
    key_proveedor character varying,
    descuento double precision,
    key_moneda character varying,
    tipo_cambio double precision,
    facturar boolean,
    key_caja character varying,
    cliente json,
    factura json,
    key_almacen character varying,
    key_descuento character varying
);


ALTER TABLE public.compra_venta OWNER TO postgres;

--
-- Name: compra_venta_comentario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compra_venta_comentario (
    key character varying NOT NULL,
    key_compra_venta character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_usuario character varying,
    descripcion character varying,
    observacion character varying
);


ALTER TABLE public.compra_venta_comentario OWNER TO postgres;

--
-- Name: compra_venta_descuento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compra_venta_descuento (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_compra_venta character varying,
    key_descuento character varying,
    monto numeric
);


ALTER TABLE public.compra_venta_descuento OWNER TO postgres;

--
-- Name: compra_venta_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compra_venta_detalle (
    key character varying NOT NULL,
    key_compra_venta character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    cantidad double precision,
    precio_unitario double precision,
    descuento double precision,
    key_usuario character varying,
    tipo character varying,
    data json,
    precio_unitario_base double precision,
    key_modelo character varying
);


ALTER TABLE public.compra_venta_detalle OWNER TO postgres;

--
-- Name: compra_venta_detalle_costo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compra_venta_detalle_costo (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_compra_venta_detalle character varying,
    key_costo character varying,
    monto double precision,
    descripcion character varying,
    key_asiento_contable character varying,
    key_compra character varying,
    key_cliente character varying
);


ALTER TABLE public.compra_venta_detalle_costo OWNER TO postgres;

--
-- Name: COLUMN compra_venta_detalle_costo.key_compra; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.compra_venta_detalle_costo.key_compra IS 'Esta es la key de la compra que se genera cuando se efectua el costo';


--
-- Name: compra_venta_detalle_producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compra_venta_detalle_producto (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_compra_venta_detalle character varying,
    key_producto character varying,
    fecha_off timestamp without time zone,
    cantidad double precision
);


ALTER TABLE public.compra_venta_detalle_producto OWNER TO postgres;

--
-- Name: compra_venta_historico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compra_venta_historico (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    key_sucursal character varying,
    key_compra_venta character varying,
    state character varying,
    tipo_pago character varying
);


ALTER TABLE public.compra_venta_historico OWNER TO postgres;

--
-- Name: compra_venta_participante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compra_venta_participante (
    key character varying NOT NULL,
    key_compra_venta character varying,
    tipo character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_usuario character varying,
    key_usuario_participante character varying
);


ALTER TABLE public.compra_venta_participante OWNER TO postgres;

--
-- Name: cuota; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuota (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_compra_venta character varying,
    codigo character varying,
    descripcion character varying,
    observacion character varying,
    fecha timestamp without time zone,
    monto double precision,
    capital double precision,
    interes double precision,
    fecha_pago timestamp without time zone,
    total_amortizado double precision DEFAULT 0,
    key_moneda character varying,
    monto_base double precision,
    total_amortizado_base double precision,
    key_empresa_tipo_pago character varying,
    key_cuenta_contable character varying
);


ALTER TABLE public.cuota OWNER TO postgres;

--
-- Name: cuota_amortizacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuota_amortizacion (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_cuota character varying,
    descripcion character varying,
    observacion character varying,
    fecha timestamp without time zone,
    monto double precision,
    capital double precision,
    interes double precision,
    key_caja_detalle character varying,
    key_moneda character varying,
    monto_base double precision,
    key_empresa_tipo_pago character varying
);


ALTER TABLE public.cuota_amortizacion OWNER TO postgres;

--
-- Name: descuento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.descuento (
    key character varying NOT NULL,
    key_usuario character varying,
    key_empresa character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    monto double precision,
    porcentaje double precision,
    key_cuenta_contable character varying
);


ALTER TABLE public.descuento OWNER TO postgres;

--
-- Name: descuento_asignado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.descuento_asignado (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_descuento character varying,
    meta character varying,
    value character varying
);


ALTER TABLE public.descuento_asignado OWNER TO postgres;

--
-- Name: multa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.multa (
    key character varying NOT NULL,
    key_usuario character varying,
    key_servicio character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    monto double precision,
    dias integer
);


ALTER TABLE public.multa OWNER TO postgres;

--
-- Name: comision comision_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comision
    ADD CONSTRAINT comision_pkey PRIMARY KEY (key);


--
-- Name: compra_venta_historico compra_historico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_venta_historico
    ADD CONSTRAINT compra_historico_pkey PRIMARY KEY (key);


--
-- Name: compra_venta_comentario compra_venta_comentario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_venta_comentario
    ADD CONSTRAINT compra_venta_comentario_pkey PRIMARY KEY (key);


--
-- Name: compra_venta_descuento compra_venta_descuento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_venta_descuento
    ADD CONSTRAINT compra_venta_descuento_pkey PRIMARY KEY (key);


--
-- Name: compra_venta_detalle_costo compra_venta_detalle_costo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_venta_detalle_costo
    ADD CONSTRAINT compra_venta_detalle_costo_pkey PRIMARY KEY (key);


--
-- Name: compra_venta_detalle compra_venta_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_venta_detalle
    ADD CONSTRAINT compra_venta_detalle_pkey PRIMARY KEY (key);


--
-- Name: compra_venta_detalle_producto compra_venta_detalle_producto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_venta_detalle_producto
    ADD CONSTRAINT compra_venta_detalle_producto_pkey PRIMARY KEY (key);


--
-- Name: compra_venta compra_venta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_venta
    ADD CONSTRAINT compra_venta_pkey PRIMARY KEY (key);


--
-- Name: cuota_amortizacion cuota_amortizacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuota_amortizacion
    ADD CONSTRAINT cuota_amortizacion_pkey PRIMARY KEY (key);


--
-- Name: cuota cuota_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuota
    ADD CONSTRAINT cuota_pkey PRIMARY KEY (key);


--
-- Name: descuento_asignado descuento_asignado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.descuento_asignado
    ADD CONSTRAINT descuento_asignado_pkey PRIMARY KEY (key);


--
-- Name: descuento descuento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.descuento
    ADD CONSTRAINT descuento_pkey PRIMARY KEY (key);


--
-- Name: multa multa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.multa
    ADD CONSTRAINT multa_pkey PRIMARY KEY (key);


--
-- Name: compra_venta_participante participantes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_venta_participante
    ADD CONSTRAINT participantes_pkey PRIMARY KEY (key);


--
-- Name: cuota_amortizacion trg_cuota_amortizacion; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_cuota_amortizacion AFTER INSERT OR DELETE OR UPDATE ON public.cuota_amortizacion FOR EACH ROW EXECUTE FUNCTION public.actualizar_cuota_amortizacion();


--
-- Name: comision comision_fkey_compra_venta_detalle; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comision
    ADD CONSTRAINT comision_fkey_compra_venta_detalle FOREIGN KEY (key_compra_venta_detalle) REFERENCES public.compra_venta_detalle(key) NOT VALID;


--
-- Name: compra_venta_descuento compra_venta_descuento_fkey_key_compra_venta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_venta_descuento
    ADD CONSTRAINT compra_venta_descuento_fkey_key_compra_venta FOREIGN KEY (key_compra_venta) REFERENCES public.compra_venta(key) NOT VALID;


--
-- Name: compra_venta_descuento compra_venta_descuento_fkey_key_descuento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_venta_descuento
    ADD CONSTRAINT compra_venta_descuento_fkey_key_descuento FOREIGN KEY (key_descuento) REFERENCES public.descuento(key) NOT VALID;


--
-- Name: descuento_asignado descuento_asignado_fkey_key_descuento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.descuento_asignado
    ADD CONSTRAINT descuento_asignado_fkey_key_descuento FOREIGN KEY (key_descuento) REFERENCES public.descuento(key) NOT VALID;


--
-- Name: compra_venta_comentario fk_compra_venta_comentario_key_compra_venta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_venta_comentario
    ADD CONSTRAINT fk_compra_venta_comentario_key_compra_venta FOREIGN KEY (key_compra_venta) REFERENCES public.compra_venta(key);


--
-- Name: compra_venta_detalle_costo fk_compra_venta_detalle_costo_key_compra_venta_detalle; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_venta_detalle_costo
    ADD CONSTRAINT fk_compra_venta_detalle_costo_key_compra_venta_detalle FOREIGN KEY (key_compra_venta_detalle) REFERENCES public.compra_venta_detalle(key);


--
-- Name: compra_venta_detalle fk_compra_venta_detalle_key_compra_venta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_venta_detalle
    ADD CONSTRAINT fk_compra_venta_detalle_key_compra_venta FOREIGN KEY (key_compra_venta) REFERENCES public.compra_venta(key) NOT VALID;


--
-- Name: compra_venta_detalle_producto fk_compra_venta_detalle_producto_key_compra_venta_detalle; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_venta_detalle_producto
    ADD CONSTRAINT fk_compra_venta_detalle_producto_key_compra_venta_detalle FOREIGN KEY (key_compra_venta_detalle) REFERENCES public.compra_venta_detalle(key);


--
-- Name: compra_venta_historico fk_compra_venta_historico_key_compra_venta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_venta_historico
    ADD CONSTRAINT fk_compra_venta_historico_key_compra_venta FOREIGN KEY (key_compra_venta) REFERENCES public.compra_venta(key) NOT VALID;


--
-- Name: cuota_amortizacion fk_cuota_amortizacion_key_cuota; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuota_amortizacion
    ADD CONSTRAINT fk_cuota_amortizacion_key_cuota FOREIGN KEY (key_cuota) REFERENCES public.cuota(key);


--
-- Name: cuota fk_cuota_key_compra_venta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuota
    ADD CONSTRAINT fk_cuota_key_compra_venta FOREIGN KEY (key_compra_venta) REFERENCES public.compra_venta(key) NOT VALID;


--
-- Name: compra_venta_participante fk_participantes_key_compra_venta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_venta_participante
    ADD CONSTRAINT fk_participantes_key_compra_venta FOREIGN KEY (key_compra_venta) REFERENCES public.compra_venta(key);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict GAHdgAsOd73NPMcaj7VIyFUjAobsyXdUgxZ46rhlPzc2o8svv35IpqIDDmyikkj

