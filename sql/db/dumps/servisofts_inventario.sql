--
-- PostgreSQL database dump
--

\restrict Ka6RnnHe1MB4Iz5RCc8fqInuJeKvFkfgRzkGrFh14ehyckvNCnUmm3ds4QF9Ac2

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
-- Name: _anular_suscriptores_key_compra_venta_detalle(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._anular_suscriptores_key_compra_venta_detalle(p_key_compra_venta_detalle character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN

    UPDATE suscripcion s
    SET estado = 0
    FROM producto p
    WHERE s.key_producto = p.key
      AND p.key_compra_venta_detalle = p_key_compra_venta_detalle;

    RETURN json_build_object(
        'estado', 'ok'
    );

END;
$$;


ALTER FUNCTION public._anular_suscriptores_key_compra_venta_detalle(p_key_compra_venta_detalle character varying) OWNER TO postgres;

--
-- Name: _get_by_key_conteo_inventario(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_by_key_conteo_inventario(p_key_conteo character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      detalle || jsonb_build_object(
        'descripcion', modelo.descripcion,
         'key_marca', modelo.key_marca,
		           'precio_compra', modelo.precio_compra,

        'key_tipo_producto', modelo.key_tipo_producto,
 		'key_almacen', inv.key_almacen,

		  'marca', to_json(marca),
        'tipo_producto', to_json(tipo_producto)
      )
    )
    FROM conteo_manual_inventario inv
    JOIN LATERAL jsonb_array_elements(inv.data::jsonb) AS detalle ON true
    JOIN modelo ON modelo.key = detalle->>'key_modelo'
    JOIN marca ON marca.key = modelo.key_marca
    LEFT JOIN tipo_producto ON tipo_producto.key = modelo.key_tipo_producto
    WHERE inv.key = p_key_conteo
      AND inv.estado > 0
  );
END;
$$;


ALTER FUNCTION public._get_by_key_conteo_inventario(p_key_conteo character varying) OWNER TO postgres;

--
-- Name: _get_contactos_bymodelo(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_contactos_bymodelo(_key_modelo character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta character varying;
    s_consulta character varying;
BEGIN

    s_consulta := E'
        SELECT
            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            ''key_modelo_cliente'', mc.key,
                            ''key_cliente'', mc.key_cliente,
                            ''comision'', mc.comision,
                            ''key_modelo'', mc.key_modelo,
                            ''modelo'', mo.descripcion,
                            ''key_tipo_costo'', mc.key_tipo_costo,
                            ''tipo_costo'', tc.descripcion,
                            ''tipo_producto'', tip.descripcion,
                            ''tipo'', tip.tipo,
 
	
                            ''key_cuenta_contable'', mc.key_cuenta_contable
                        )
                    )
                    FROM modelo_cliente mc
                    JOIN modelo mo
                      ON mc.key_modelo = mo.key
                    LEFT JOIN tipo_costo tc
                      ON mc.key_tipo_costo = tc.key
                    JOIN tipo_producto tip
                      ON mo.key_tipo_producto = tip.key
                    WHERE mc.key_modelo = ''' || _key_modelo || '''
                      AND mc.estado = 1
                ),
                ''[]''::json
            )::character varying
    ';

    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;

END;
$$;


ALTER FUNCTION public._get_contactos_bymodelo(_key_modelo character varying) OWNER TO postgres;

--
-- Name: _get_suscripciones(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_suscripciones(key_empresa_param character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado json;
BEGIN
    WITH suscripciones_act AS (
        SELECT
            s.*,
			p.key_empresa AS key_empresa,
            -- Convertimos producto en JSON y agregamos su modelo dentro
            jsonb_build_object(
                'key', p.key,
                'nombre', p.nombre,
                'precio', p.precio,
                'key_modelo', p.key_modelo,
                'descripcion', p.descripcion,
                'observacion', p.observacion,
                'modelo', row_to_json(m),   
 				
				'marca', jsonb_build_object(
                        'key', mar.key,
                        'descripcion', mar.descripcion
                    ),
			    'tipo_producto', jsonb_build_object(
                        'key', tipo_pro.key,
                        'descripcion', tipo_pro.descripcion
                    )
					
            ) AS producto
        FROM suscripcion s
        JOIN producto p ON s.key_producto = p.key
        JOIN modelo m ON p.key_modelo = m.key
        JOIN marca mar ON m.key_marca = mar.key
        JOIN tipo_producto tipo_pro ON m.key_tipo_producto = tipo_pro.key


		
        WHERE s.estado = 1
          AND p.key_empresa = key_empresa_param
    )
    SELECT json_agg(suscripciones_act.*) INTO resultado
    FROM suscripciones_act;

    RETURN COALESCE(resultado, '[]'::json);
END;
$$;


ALTER FUNCTION public._get_suscripciones(key_empresa_param character varying) OWNER TO postgres;

--
-- Name: _get_suscripciones_bycliente(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_suscripciones_bycliente(_key_cliente character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $_$
DECLARE
    respuesta character varying;
BEGIN

    EXECUTE format(
        $f$
        SELECT COALESCE(
            json_agg(
                json_build_object(
                    'key', s.key,
                    'key_usuario', s.key_usuario,
                    'fecha_on', s.fecha_on,
                    'estado', s.estado,
                    'key_cliente', s.key_cliente,
                    'key_producto', s.key_producto,
                    'descripcion', s.descripcion,
                    'fecha_inicio', s.fecha_inicio,
                    'fecha_fin', s.fecha_fin,
                    'key_sucursal', s.key_sucursal,
                    'producto', to_json(p)  -- todo el producto como JSON
                )
            )::text,
            '[]'
        )
        FROM suscripcion s
        JOIN producto p ON s.key_producto = p.key
        WHERE s.key_cliente = %L
        $f$,
        _key_cliente
    )
    INTO respuesta;

    RETURN respuesta;

END;
$_$;


ALTER FUNCTION public._get_suscripciones_bycliente(_key_cliente character varying) OWNER TO postgres;

--
-- Name: _get_tipo_costo_bymodelo(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_tipo_costo_bymodelo(_key_modelo character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $_$
DECLARE
    respuesta character varying;
BEGIN

    EXECUTE '
        SELECT COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        ''key_tipo_costo'', tc.key,
                        ''descripcion'', tc.descripcion,
                        ''clientes'', (
                            SELECT json_agg(
                                to_json(c.*)
                            )
                            FROM (
                                SELECT mc2.*
                                FROM modelo_cliente mc2
                                WHERE mc2.key_modelo = $1
                                  AND mc2.key_tipo_costo = tc.key
                                  AND mc2.estado = 1
                            ) c
                        )
                    )
                )
                FROM (
                    SELECT DISTINCT tc.key, tc.descripcion
                    FROM modelo_cliente mc
                    JOIN tipo_costo tc
                        ON mc.key_tipo_costo = tc.key
                    WHERE mc.key_modelo = $1
                      AND mc.estado = 1
                ) tc
            ),
            ''[]''::json
        )::character varying
    '
    INTO respuesta
    USING _key_modelo;

    RETURN NEXT respuesta;
END;
$_$;


ALTER FUNCTION public._get_tipo_costo_bymodelo(_key_modelo character varying) OWNER TO postgres;

--
-- Name: _get_tipo_costo_bymodelo2(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_tipo_costo_bymodelo2(_key_modelo character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $_$
DECLARE
    respuesta character varying;
BEGIN

    EXECUTE '
        SELECT COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        ''key_tipo_costo'', tc.key,
                        ''descripcion'', tc.descripcion,
                        ''clientes'', (
                            SELECT json_agg(DISTINCT mc2.key_cliente)
                            FROM modelo_cliente mc2
                            WHERE mc2.key_modelo = $1
                              AND mc2.key_tipo_costo = tc.key
                              AND mc2.estado = 1
                        )
                    )
                )
                FROM (
                    SELECT DISTINCT tc.key, tc.descripcion
                    FROM modelo_cliente mc
                    JOIN tipo_costo tc
                        ON mc.key_tipo_costo = tc.key
                    WHERE mc.key_modelo = $1
                      AND mc.estado = 1
                ) tc
            ),
            ''[]''::json
        )::character varying
    '
    INTO respuesta
    USING _key_modelo;

    RETURN NEXT respuesta;
END;
$_$;


ALTER FUNCTION public._get_tipo_costo_bymodelo2(_key_modelo character varying) OWNER TO postgres;

--
-- Name: _get_tipo_producto(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_tipo_producto(p_json character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $_$
DECLARE
    respuesta character varying;
BEGIN
    -- Construct the query using the input JSON
    EXECUTE format(
        $q$
        SELECT array_to_json(array_agg(sq.*))::text
        FROM (
            SELECT 
                tp.descripcion AS grupo, 
                tp.codigo_facturacion AS codigo_facturacion, 
                tp.unidad_medida_facturacion AS unidad_medida_facturacion, 
                m.*
            FROM modelo AS m
            JOIN tipo_producto AS tp
                ON m.key_tipo_producto = tp.key
            JOIN LATERAL json_array_elements_text(%L) AS ji(key)
                ON m.key::text = ji.key
        ) sq
        $q$,
        p_json
    )
    INTO respuesta;

    RETURN NEXT respuesta;
END;
$_$;


ALTER FUNCTION public._get_tipo_producto(p_json character varying) OWNER TO postgres;

--
-- Name: _reporte_conteo_inventario_json(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._reporte_conteo_inventario_json(p_key_empresa character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN (
    SELECT array_to_json(array_agg(sq.*)) AS json
    FROM (
      SELECT
        almacen.key_empresa,
		        almacen.descripcion,
        almacen.key_sucursal,
        inv.key AS key_conteo,
        inv.key_usuario,
        inv.key_almacen,
		inv.fecha_confirmacion::date,
		
        inv.fecha_on::date AS fecha,
        --inv.fecha_on::time AS hora,
		TO_CHAR(inv.fecha_on, 'HH24:MI') AS hora,

        -- Total de unidades con pérdida no registrada
		
		SUM(
		  CASE
			WHEN (detalle->>'stock')::float > (detalle->>'cantidad_real')::float AND  (detalle->>'cantidad_real')::float > 0 THEN
			  GREATEST(
				(detalle->>'stock')::float 
				- (detalle->>'cantidad_real')::float 
				,
				0
			  )
			ELSE 0
		  END
		) AS total_perdida,
		SUM(
		  CASE
			WHEN (detalle->>'stock')::float > (detalle->>'cantidad_real')::float AND  (detalle->>'cantidad_real')::float > 0 THEN
			  GREATEST(
				(detalle->>'stock')::float 
				- (detalle->>'cantidad_real')::float 
				,
				0
			  ) * modelo.precio_compra
			ELSE 0
		  END
		) AS total_perdida_costo,

		SUM(
			  CASE 
				WHEN  COALESCE((detalle->>'cantidad_baja')::float, 0) > 0
				THEN COALESCE((detalle->>'cantidad_baja')::float, 0)
				ELSE 0
		  END
		) AS total_baja,
			SUM(
		 		CASE 
				WHEN  COALESCE((detalle->>'cantidad_baja')::float, 0) > 0
				THEN (COALESCE((detalle->>'cantidad_baja')::float, 0) * modelo.precio_compra)
				ELSE 0
				END
		) AS total_baja_costo,
		
     SUM(
		  CASE
			WHEN (detalle->>'stock')::float < (detalle->>'cantidad_real')::float THEN
			  GREATEST(
				(detalle->>'cantidad_real')::float - (detalle->>'stock')::float 
				,
				0
			  )
			ELSE 0
		  END
		) AS total_excedente,
		SUM(
		  CASE
			WHEN (detalle->>'stock')::float < (detalle->>'cantidad_real')::float THEN
			  GREATEST(
				(detalle->>'cantidad_real')::float  -	(detalle->>'stock')::float 
				,
				0
			  ) * modelo.precio_compra
			ELSE 0
		  END
		) AS total_excedente_costo
     

       

      FROM conteo_manual_inventario inv
      INNER JOIN almacen ON almacen.key = inv.key_almacen
      LEFT JOIN LATERAL jsonb_array_elements(inv.data::jsonb) AS detalle ON true
		JOIN modelo ON detalle->>'key_modelo' = modelo.key
      WHERE almacen.key_empresa = p_key_empresa
		and inv.estado > 0
      GROUP BY almacen.key_empresa, 
	  key_sucursal,
	  almacen.descripcion, inv.key, inv.key_usuario, inv.fecha_on, inv.key_almacen
      ORDER BY inv.fecha_on DESC
    ) AS sq
  );
END;
$$;


ALTER FUNCTION public._reporte_conteo_inventario_json(p_key_empresa character varying) OWNER TO postgres;

--
-- Name: _reporte_conteo_inventario_json(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._reporte_conteo_inventario_json(p_key_empresa character varying, p_fecha_inicio character varying, p_fecha_fin character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN (
    SELECT array_to_json(array_agg(sq.*)) AS json
    FROM (
      SELECT
        almacen.key_empresa,
		        almacen.descripcion,
        almacen.key_sucursal,
        inv.key AS key_conteo,
        inv.key_usuario,
        inv.key_almacen,
		inv.fecha_confirmacion::date,
		
        inv.fecha_on::date AS fecha,
        --inv.fecha_on::time AS hora,
		TO_CHAR(inv.fecha_on, 'HH24:MI') AS hora,

        -- Total de unidades con pérdida no registrada
		
		SUM(
		  CASE
			WHEN (detalle->>'stock')::float > (detalle->>'cantidad_real')::float AND  (detalle->>'cantidad_real')::float > 0 THEN
			  GREATEST(
				(detalle->>'stock')::float 
				- (detalle->>'cantidad_real')::float 
				,
				0
			  )
			ELSE 0
		  END
		) AS total_perdida,
		SUM(
		  CASE
			WHEN (detalle->>'stock')::float > (detalle->>'cantidad_real')::float AND  (detalle->>'cantidad_real')::float > 0 THEN
			  GREATEST(
				(detalle->>'stock')::float 
				- (detalle->>'cantidad_real')::float 
				,
				0
			  ) * modelo.precio_compra
			ELSE 0
		  END
		) AS total_perdida_costo,

		SUM(
			  CASE 
				WHEN  COALESCE((detalle->>'cantidad_baja')::float, 0) > 0
				THEN COALESCE((detalle->>'cantidad_baja')::float, 0)
				ELSE 0
		  END
		) AS total_baja,
			SUM(
		 		CASE 
				WHEN  COALESCE((detalle->>'cantidad_baja')::float, 0) > 0
				THEN (COALESCE((detalle->>'cantidad_baja')::float, 0) * modelo.precio_compra)
				ELSE 0
				END
		) AS total_baja_costo,
		
     SUM(
		  CASE
			WHEN (detalle->>'stock')::float < (detalle->>'cantidad_real')::float THEN
			  GREATEST(
				(detalle->>'cantidad_real')::float - (detalle->>'stock')::float 
				,
				0
			  )
			ELSE 0
		  END
		) AS total_excedente,
		SUM(
		  CASE
			WHEN (detalle->>'stock')::float < (detalle->>'cantidad_real')::float THEN
			  GREATEST(
				(detalle->>'cantidad_real')::float  -	(detalle->>'stock')::float 
				,
				0
			  ) * modelo.precio_compra
			ELSE 0
		  END
		) AS total_excedente_costo
     

       

      FROM conteo_manual_inventario inv
      INNER JOIN almacen ON almacen.key = inv.key_almacen
      LEFT JOIN LATERAL jsonb_array_elements(inv.data::jsonb) AS detalle ON true
		JOIN modelo ON detalle->>'key_modelo' = modelo.key
      WHERE almacen.key_empresa = p_key_empresa
        AND inv.fecha_on::date BETWEEN p_fecha_inicio::date AND p_fecha_fin::date
		and inv.estado > 0
      GROUP BY almacen.key_empresa, 
	  key_sucursal,
	  almacen.descripcion, inv.key, inv.key_usuario, inv.fecha_on, inv.key_almacen
      ORDER BY inv.fecha_on DESC
    ) AS sq
  );
END;
$$;


ALTER FUNCTION public._reporte_conteo_inventario_json(p_key_empresa character varying, p_fecha_inicio character varying, p_fecha_fin character varying) OWNER TO postgres;

--
-- Name: _reporte_suscritos(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._reporte_suscritos(_key_compra_venta_detalle character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta character varying;
BEGIN

    SELECT json_agg(to_json(sq.*))::varchar
    INTO respuesta
    FROM (
        SELECT
            m.key AS key_modelo,
            p.key AS key_producto,
            m.descripcion,
            m.cantidad_suscriptores AS cupos,
            COUNT(s.key) AS suscriptos,
            m.cantidad_suscriptores - COUNT(s.key) AS disponibles,
            COALESCE(
                json_agg(s.*) FILTER (WHERE s.key IS NOT NULL),
                '[]'::json
            ) AS suscriptores
        FROM producto p
        INNER JOIN modelo m
            ON m.key = p.key_modelo
        LEFT JOIN suscripcion s
            ON s.key_producto = p.key
            AND s.estado > 0
        WHERE p.key_compra_venta_detalle = _key_compra_venta_detalle
          AND p.estado > 0
        GROUP BY
            m.key,
            p.key,
            m.descripcion,
            m.cantidad_suscriptores
    ) sq;

    RETURN NEXT respuesta;

END;
$$;


ALTER FUNCTION public._reporte_suscritos(_key_compra_venta_detalle character varying) OWNER TO postgres;

--
-- Name: agregar_productos_por_modelo_almacen(character varying, character varying, numeric, character varying, text, character varying, json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.agregar_productos_por_modelo_almacen(p_key_modelo character varying, p_key_almacen character varying, p_cantidad numeric, p_key_usuario character varying, p_tipo text, p_key_conteo_manual_inventario character varying DEFAULT NULL::character varying, _data json DEFAULT NULL::json) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    result JSON;
BEGIN
    -- 1. Crear tabla temporal con productos a usar
    CREATE TEMP TABLE IF NOT EXISTS tmp_productos_agregados (
        key_producto VARCHAR,
        cantidad NUMERIC,
        precio_compra NUMERIC
    ) ON COMMIT DROP;

    TRUNCATE tmp_productos_agregados;

    -- 2. Insertar en la tabla temporal los productos necesarios (FIFO)
    -- Tomamos el primer producto disponible del modelo y le asignamos toda la cantidad
    INSERT INTO tmp_productos_agregados (key_producto, cantidad, precio_compra)
    SELECT
        p.key,
        p_cantidad AS cantidad,
        p.precio_compra
    FROM producto p
    WHERE p.key_modelo = p_key_modelo
      AND p.estado > 0
    ORDER BY p.fecha_on ASC
    LIMIT 1;

    -- 3. Crear tabla temporal para movimientos de cardex
    CREATE TEMP TABLE IF NOT EXISTS tmp_cardex_inserted (
        key UUID,
        key_producto VARCHAR,
        key_almacen VARCHAR,
        cantidad NUMERIC,
        tipo TEXT,
        fecha_on TIMESTAMP,
        key_usuario VARCHAR,
        estado INT,
        key_conteo_manual_inventario VARCHAR,
        data JSON
    ) ON COMMIT DROP;

    TRUNCATE tmp_cardex_inserted;

    -- 4. Insertar movimientos en tmp_cardex_inserted
    INSERT INTO tmp_cardex_inserted (
        key, key_producto, key_almacen, cantidad, tipo, fecha_on, key_usuario, estado, key_conteo_manual_inventario, data
    )
    SELECT 
        gen_random_uuid(),
        key_producto,
        p_key_almacen,
        cantidad,  -- positivo porque agregamos stock
        p_tipo,
        NOW(),
        p_key_usuario,
        1,
        p_key_conteo_manual_inventario,
        _data
    FROM tmp_productos_agregados;

    -- 5. Insertar movimientos en la tabla real inventario_cardex
    INSERT INTO inventario_cardex (
        key, key_producto, key_almacen, cantidad, tipo, fecha_on, key_usuario, estado, key_conteo_manual_inventario, data
    )
    SELECT * FROM tmp_cardex_inserted;

    -- 6. Devolver los movimientos insertados como JSON
    SELECT array_to_json(array_agg(t.*)) INTO result
    FROM (
        SELECT tmp_cardex_inserted.*, producto.precio_compra
        FROM tmp_cardex_inserted
        JOIN producto ON tmp_cardex_inserted.key_producto = producto.key
    ) t;

    RETURN result;
END;
$$;


ALTER FUNCTION public.agregar_productos_por_modelo_almacen(p_key_modelo character varying, p_key_almacen character varying, p_cantidad numeric, p_key_usuario character varying, p_tipo text, p_key_conteo_manual_inventario character varying, _data json) OWNER TO postgres;

--
-- Name: bajas_productos_por_modelo_almacen(character varying, character varying, numeric, character varying, text, character varying, json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.bajas_productos_por_modelo_almacen(p_key_modelo character varying, p_key_almacen character varying, p_cantidad numeric, p_key_usuario character varying, p_tipo text, p_key_conteo_manual_inventario character varying DEFAULT NULL::character varying, _data json DEFAULT NULL::json) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    result JSON;
BEGIN
    -- Crear tabla temporal de productos a usar
    CREATE TEMP TABLE IF NOT EXISTS tmp_productos_utilizados (
        key_producto VARCHAR,
        cantidad NUMERIC,
        precio_compra NUMERIC
    ) ON COMMIT DROP;
    TRUNCATE tmp_productos_utilizados;

    -- Calcular stock disponible (excluyendo bajas) y preparar FIFO
    WITH base AS (
        SELECT 
            p.key,
            SUM(ic.cantidad * CASE WHEN ic.tipo != 'baja' THEN 1 ELSE 0 END)::NUMERIC AS stock,
            p.precio_compra,
            p.fecha_on,
            SUM(SUM(ic.cantidad * CASE WHEN ic.tipo != 'baja' THEN 1 ELSE 0 END)) OVER (ORDER BY p.fecha_on) AS acumulado
        FROM producto p
        JOIN inventario_cardex ic 
          ON ic.key_producto = p.key
         AND ic.estado > 0
         AND ic.key_almacen = p_key_almacen
        WHERE p.key_modelo = p_key_modelo
          AND p.estado > 0
        GROUP BY p.key, p.fecha_on, p.precio_compra
        ORDER BY p.fecha_on
    ),
    con_acumulado AS (
        SELECT 
            key,
            stock,
            precio_compra,
            fecha_on,
            acumulado,
            COALESCE(LAG(acumulado) OVER (ORDER BY fecha_on), 0) AS acumulado_anterior
        FROM base
    )
    INSERT INTO tmp_productos_utilizados(key_producto, cantidad, precio_compra)
    SELECT 
        key,
        LEAST(stock, GREATEST(p_cantidad - acumulado_anterior, 0)) AS cantidad_a_utilizar,
        precio_compra
    FROM con_acumulado
    WHERE acumulado <= p_cantidad OR acumulado_anterior < p_cantidad;

    -- Crear tabla temporal de cardex
    CREATE TEMP TABLE IF NOT EXISTS tmp_cardex_inserted (
        key UUID,
        key_producto VARCHAR,
        key_almacen VARCHAR,
        cantidad NUMERIC,
        tipo TEXT,
        fecha_on TIMESTAMP,
        key_usuario VARCHAR,
        estado INT,
        key_conteo_manual_inventario VARCHAR,
        data JSON
    ) ON COMMIT DROP;
    TRUNCATE tmp_cardex_inserted;

    -- Insertar movimientos
    INSERT INTO tmp_cardex_inserted(
        key, key_producto, key_almacen, cantidad, tipo, fecha_on, key_usuario, estado, key_conteo_manual_inventario, data
    )
    SELECT 
        gen_random_uuid(),
        key_producto,
        p_key_almacen,
        -cantidad,
        p_tipo,
        NOW(),
        p_key_usuario,
        1,
        p_key_conteo_manual_inventario,
        _data
    FROM tmp_productos_utilizados;

    -- Insertar en inventario_cardex real
    INSERT INTO inventario_cardex(
        key, key_producto, key_almacen, cantidad, tipo, fecha_on, key_usuario, estado, key_conteo_manual_inventario, data
    )
    SELECT * FROM tmp_cardex_inserted;

    -- Devolver como JSON
    SELECT array_to_json(array_agg(t.*)) INTO result
    FROM (
        SELECT tmp_cardex_inserted.*, producto.precio_compra
        FROM tmp_cardex_inserted
        JOIN producto ON tmp_cardex_inserted.key_producto = producto.key
    ) t;

    RETURN result;
END;
$$;


ALTER FUNCTION public.bajas_productos_por_modelo_almacen(p_key_modelo character varying, p_key_almacen character varying, p_cantidad numeric, p_key_usuario character varying, p_tipo text, p_key_conteo_manual_inventario character varying, _data json) OWNER TO postgres;

--
-- Name: calcular_valor_stock(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calcular_valor_stock(key_empresa_param character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado JSON;
BEGIN
    WITH stock_actual AS (
        SELECT
            p.key_modelo,
            SUM(
                CASE 
                    WHEN ic.tipo IN ('ingreso_compra', 'ingreso_producto') THEN ic.cantidad
                    WHEN ic.tipo IN ('egreso_venta', 'anulacion_venta', 'baja', 'perdida') THEN -ic.cantidad
                    ELSE ic.cantidad 
                END
            ) as cantidad_actual
        FROM inventario_cardex ic
        INNER JOIN producto p ON ic.key_producto = p.key
        INNER JOIN almacen a ON ic.key_almacen = a.key
        WHERE ic.estado > 0
          AND p.estado > 0
          AND a.estado > 0
          AND a.key_empresa = key_empresa_param
        GROUP BY p.key_modelo
        HAVING SUM(
            CASE 
                WHEN ic.tipo IN ('ingreso_compra', 'ingreso_producto') THEN ic.cantidad
                WHEN ic.tipo IN ('egreso_venta', 'anulacion_venta', 'baja', 'perdida') THEN -ic.cantidad
                ELSE ic.cantidad 
            END
        ) > 0
    ),
    precio_modelo AS (
        SELECT 
            key_modelo,
            CAST(COALESCE(AVG(CAST(precio_compra AS NUMERIC)), '0') AS NUMERIC) as precio_promedio
        FROM producto 
        WHERE estado > 0 
        AND precio_compra IS NOT NULL
        GROUP BY key_modelo
    ),
    inventario_detalle AS (
        SELECT
            json_build_object(
                'key_modelo', m.key,
                'modelo', m.descripcion,
                'stock_actual', sa.cantidad_actual,
                'precio_compra_unitario', pm.precio_promedio,
                'valor_inventario', (sa.cantidad_actual * pm.precio_promedio)
            ) as item
        FROM stock_actual sa
        INNER JOIN modelo m ON sa.key_modelo = m.key
        INNER JOIN precio_modelo pm ON sa.key_modelo = pm.key_modelo
        WHERE m.estado > 0
        ORDER BY (sa.cantidad_actual * pm.precio_promedio) DESC
    )
    SELECT json_agg(item) INTO resultado
    FROM inventario_detalle;
    
    RETURN COALESCE(resultado, '[]'::JSON);
END;
$$;


ALTER FUNCTION public.calcular_valor_stock(key_empresa_param character varying) OWNER TO postgres;

--
-- Name: calcular_valor_stock_inventario(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calcular_valor_stock_inventario(key_empresa_param character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado JSON;
BEGIN
    WITH stock_actual AS (
        SELECT
            p.key_modelo,
            SUM(
                CASE 
                    WHEN ic.tipo IN ('ingreso_compra', 'ingreso_producto') THEN ic.cantidad
                    WHEN ic.tipo IN ('egreso_venta', 'anulacion_venta', 'baja', 'perdida') THEN -ic.cantidad
                    ELSE ic.cantidad 
                END
            ) as cantidad_actual
        FROM inventario_cardex ic
        INNER JOIN producto p ON ic.key_producto = p.key
        INNER JOIN almacen a ON ic.key_almacen = a.key
        WHERE ic.estado > 0
          AND p.estado > 0
          AND a.estado > 0
          AND a.key_empresa = key_empresa_param
        GROUP BY p.key_modelo
        HAVING SUM(
            CASE 
                WHEN ic.tipo IN ('ingreso_compra', 'ingreso_producto') THEN ic.cantidad
                WHEN ic.tipo IN ('egreso_venta', 'anulacion_venta', 'baja', 'perdida') THEN -ic.cantidad
                ELSE ic.cantidad 
            END
        ) > 0
    ),
    precio_modelo AS (
        SELECT 
            key_modelo,
            CAST(COALESCE(AVG(CAST(precio_compra AS NUMERIC)), '0') AS NUMERIC) as precio_promedio
        FROM producto 
        WHERE estado > 0 
        AND precio_compra IS NOT NULL
        GROUP BY key_modelo
    ),
    inventario_detalle AS (
        SELECT
            json_build_object(
                'key_modelo', m.key,
                'modelo', m.descripcion,
                'stock_actual', sa.cantidad_actual,
                'precio_compra_unitario', pm.precio_promedio,
                'valor_inventario', (sa.cantidad_actual * pm.precio_promedio)
            ) as item
        FROM stock_actual sa
        INNER JOIN modelo m ON sa.key_modelo = m.key
        INNER JOIN precio_modelo pm ON sa.key_modelo = pm.key_modelo
        WHERE m.estado > 0
        ORDER BY (sa.cantidad_actual * pm.precio_promedio) DESC
    )
    SELECT json_agg(item) INTO resultado
    FROM inventario_detalle;
    
    RETURN COALESCE(resultado, '[]'::JSON);
END;
$$;


ALTER FUNCTION public.calcular_valor_stock_inventario(key_empresa_param character varying) OWNER TO postgres;

--
-- Name: calcular_valor_stock_inventario(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calcular_valor_stock_inventario(key_empresa_param character varying, key_sucursal_param character varying DEFAULT NULL::character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado JSON;
BEGIN
    WITH stock_actual AS (
        SELECT
            p.key_modelo,
            SUM(
                CASE
                    WHEN ic.tipo IN ('ingreso_compra', 'ingreso_producto') THEN ic.cantidad
                    WHEN ic.tipo IN ('egreso_venta', 'anulacion_venta', 'baja', 'perdida') THEN -ic.cantidad
                    ELSE ic.cantidad
                END
            ) AS cantidad_actual
        FROM inventario_cardex ic
        INNER JOIN producto p ON ic.key_producto = p.key
        INNER JOIN almacen a ON ic.key_almacen = a.key
        WHERE ic.estado > 0
          AND p.estado > 0
          AND a.estado > 0
          AND a.key_empresa = key_empresa_param
          AND (
                key_sucursal_param IS NULL
                OR a.key_sucursal = key_sucursal_param
          )
        GROUP BY p.key_modelo
        HAVING SUM(
            CASE
                WHEN ic.tipo IN ('ingreso_compra', 'ingreso_producto') THEN ic.cantidad
                WHEN ic.tipo IN ('egreso_venta', 'anulacion_venta', 'baja', 'perdida') THEN -ic.cantidad
                ELSE ic.cantidad
            END
        ) > 0
    ),
    precio_modelo AS (
        SELECT
            key_modelo,
            CAST(
                COALESCE(
                    AVG(CAST(precio_compra AS NUMERIC)),
                    0
                ) AS NUMERIC
            ) AS precio_promedio
        FROM producto
        WHERE estado > 0
          AND precio_compra IS NOT NULL
        GROUP BY key_modelo
    ),
    inventario_detalle AS (
        SELECT
            json_build_object(
                'key_modelo', m.key,
                'modelo', m.descripcion,
                'stock_actual', sa.cantidad_actual,
                'precio_compra_unitario', pm.precio_promedio,
                'valor_inventario', (sa.cantidad_actual * pm.precio_promedio)
            ) AS item
        FROM stock_actual sa
        INNER JOIN modelo m ON sa.key_modelo = m.key
        INNER JOIN precio_modelo pm ON sa.key_modelo = pm.key_modelo
        WHERE m.estado > 0
        ORDER BY (sa.cantidad_actual * pm.precio_promedio) DESC
    )

    SELECT json_agg(item)
    INTO resultado
    FROM inventario_detalle;

    RETURN COALESCE(resultado, '[]'::JSON);
END;
$$;


ALTER FUNCTION public.calcular_valor_stock_inventario(key_empresa_param character varying, key_sucursal_param character varying) OWNER TO postgres;

--
-- Name: calcular_valor_stock_inventario(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calcular_valor_stock_inventario(key_empresa_param character varying, key_sucursal_param character varying DEFAULT NULL::character varying, key_almacen_param character varying DEFAULT NULL::character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado JSON;
BEGIN
    WITH stock_actual AS (
        SELECT
            p.key_modelo,
            SUM(
                CASE
                    WHEN ic.tipo IN ('ingreso_compra', 'ingreso_producto') THEN ic.cantidad
                    WHEN ic.tipo IN ('egreso_venta', 'anulacion_venta', 'baja', 'perdida') THEN -ic.cantidad
                    ELSE ic.cantidad
                END
            ) AS cantidad_actual
        FROM inventario_cardex ic
        INNER JOIN producto p ON ic.key_producto = p.key
        INNER JOIN almacen a ON ic.key_almacen = a.key
        WHERE ic.estado > 0
          AND p.estado > 0
          AND a.estado > 0
          AND a.key_empresa = key_empresa_param

          AND (
                key_sucursal_param IS NULL
                OR a.key_sucursal = key_sucursal_param
          )

          AND (
                key_almacen_param IS NULL
                OR a.key = key_almacen_param
          )

        GROUP BY p.key_modelo

        HAVING SUM(
            CASE
                WHEN ic.tipo IN ('ingreso_compra', 'ingreso_producto') THEN ic.cantidad
                WHEN ic.tipo IN ('egreso_venta', 'anulacion_venta', 'baja', 'perdida') THEN -ic.cantidad
                ELSE ic.cantidad
            END
        ) > 0
    ),

    precio_modelo AS (
        SELECT
            key_modelo,
            CAST(
                COALESCE(
                    AVG(CAST(precio_compra AS NUMERIC)),
                    0
                ) AS NUMERIC
            ) AS precio_promedio
        FROM producto
        WHERE estado > 0
          AND precio_compra IS NOT NULL
        GROUP BY key_modelo
    ),

    inventario_detalle AS (
        SELECT
            json_build_object(
                'key_modelo', m.key,
                'modelo', m.descripcion,
                'stock_actual', sa.cantidad_actual,
                'precio_compra_unitario', pm.precio_promedio,
                'valor_inventario', (sa.cantidad_actual * pm.precio_promedio)
            ) AS item
        FROM stock_actual sa
        INNER JOIN modelo m ON sa.key_modelo = m.key
        INNER JOIN precio_modelo pm ON sa.key_modelo = pm.key_modelo
        WHERE m.estado > 0
        ORDER BY (sa.cantidad_actual * pm.precio_promedio) DESC
    )

    SELECT json_agg(item)
    INTO resultado
    FROM inventario_detalle;

    RETURN COALESCE(resultado, '[]'::JSON);
END;
$$;


ALTER FUNCTION public.calcular_valor_stock_inventario(key_empresa_param character varying, key_sucursal_param character varying, key_almacen_param character varying) OWNER TO postgres;

--
-- Name: clonador(character varying, character varying, json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clonador(_key_empresa_from character varying, _key_empresa_to character varying, _respuesta_empresa json DEFAULT NULL::json) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_tabla              text;
    v_row                RECORD;
    v_result             jsonb;
    v_reemplazos         jsonb;
    v_counts             jsonb := '{}';
    -- almacen
    v_new_suc_key_map    varchar;
    n_almacen            integer := 0;
    -- marca
    v_old_marc_key       varchar;
    v_new_marc_key       varchar;
    v_new_marc_key_map   varchar;
    n_marca              integer := 0;
    -- ingrediente
    v_old_ing_key        varchar;
    v_new_ing_key        varchar;
    v_new_ing_key_map    varchar;
    n_ingrediente        integer := 0;
    -- tag
    v_old_tag_key        varchar;
    v_new_tag_key        varchar;
    v_new_tag_key_map    varchar;
    n_tag                integer := 0;
    -- tipo_producto
    v_old_tp_key         varchar;
    v_new_tp_key         varchar;
    n_tipo_producto      integer := 0;
    -- modelo
    v_new_tp_key_map     varchar;
    v_new_mod_key        varchar;
    n_modelo             integer := 0;
    -- modelo_ingrediente / modelo_tag
    v_new_mod_key_map    varchar;
    n_modelo_ingrediente integer := 0;
    n_modelo_tag         integer := 0;
BEGIN
    -- ── Tablas simples (batch) ────────────────────────────────
    FOREACH v_tabla IN ARRAY ARRAY['tipo_costo']
    LOOP
        SELECT public.clonar_tabla(v_tabla, 'key_empresa', _key_empresa_from,
            jsonb_build_object('key', NULL, 'key_empresa', _key_empresa_to))::jsonb
        INTO v_result;
        v_counts := v_counts || jsonb_build_object(v_tabla, v_result->'filas');
    END LOOP;

    -- ── marca → tmp_marc_map ──────────────────────────────────
    -- modelo.key_marca referencia marca, debe apuntar a las nuevas
    DROP TABLE IF EXISTS tmp_marc_map;
    CREATE TEMP TABLE tmp_marc_map (old_key varchar, new_key varchar);

    FOR v_old_marc_key IN
        SELECT key FROM marca WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_marc_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_marc_map VALUES (v_old_marc_key, v_new_marc_key);

        PERFORM public.clonar_tabla('marca', 'key', v_old_marc_key,
            jsonb_build_object('key', v_new_marc_key, 'key_empresa', _key_empresa_to));
        n_marca := n_marca + 1;
    END LOOP;

    -- ── almacen: fila a fila para mapear key_sucursal ─────────
    FOR v_row IN
        SELECT key, key_sucursal FROM almacen WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_suc_key_map := NULL;
        IF _respuesta_empresa IS NOT NULL THEN
            v_new_suc_key_map := _respuesta_empresa->'mapeo'->'sucursal'->>v_row.key_sucursal;
        END IF;

        v_reemplazos := jsonb_build_object('key', NULL, 'key_empresa', _key_empresa_to);
        IF v_new_suc_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_sucursal', v_new_suc_key_map);
        END IF;

        PERFORM public.clonar_tabla('almacen', 'key', v_row.key, v_reemplazos);
        n_almacen := n_almacen + 1;
    END LOOP;

    -- ── ingrediente → tmp_ing_map ─────────────────────────────
    DROP TABLE IF EXISTS tmp_ing_map;
    CREATE TEMP TABLE tmp_ing_map (old_key varchar, new_key varchar);

    FOR v_old_ing_key IN
        SELECT key FROM ingrediente WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_ing_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_ing_map VALUES (v_old_ing_key, v_new_ing_key);

        PERFORM public.clonar_tabla('ingrediente', 'key', v_old_ing_key,
            jsonb_build_object('key', v_new_ing_key, 'key_empresa', _key_empresa_to));
        n_ingrediente := n_ingrediente + 1;
    END LOOP;

    -- ── tag → tmp_tag_map ─────────────────────────────────────
    DROP TABLE IF EXISTS tmp_tag_map;
    CREATE TEMP TABLE tmp_tag_map (old_key varchar, new_key varchar);

    FOR v_old_tag_key IN
        SELECT key FROM tag WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_tag_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_tag_map VALUES (v_old_tag_key, v_new_tag_key);

        PERFORM public.clonar_tabla('tag', 'key', v_old_tag_key,
            jsonb_build_object('key', v_new_tag_key, 'key_empresa', _key_empresa_to));
        n_tag := n_tag + 1;
    END LOOP;

    -- ── tipo_producto → tmp_tp_map ────────────────────────────
    -- key_cuenta_contable_* son refs cross-módulo (contabilidad) y se copian tal cual
    DROP TABLE IF EXISTS tmp_tp_map;
    CREATE TEMP TABLE tmp_tp_map (old_key varchar, new_key varchar);

    FOR v_old_tp_key IN
        SELECT key FROM tipo_producto WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_tp_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_tp_map VALUES (v_old_tp_key, v_new_tp_key);

        PERFORM public.clonar_tabla('tipo_producto', 'key', v_old_tp_key,
            jsonb_build_object('key', v_new_tp_key, 'key_empresa', _key_empresa_to));
        n_tipo_producto := n_tipo_producto + 1;
    END LOOP;

    -- ── modelo (filtrado via tmp_tp_map) → tmp_mod_map ────────
    -- modelo no tiene key_empresa; se accede por key_tipo_producto
    DROP TABLE IF EXISTS tmp_mod_map;
    CREATE TEMP TABLE tmp_mod_map (old_key varchar, new_key varchar);

    FOR v_row IN
        SELECT key, key_tipo_producto, key_marca
        FROM modelo
        WHERE key_tipo_producto IN (SELECT old_key FROM tmp_tp_map)
    LOOP
        v_new_mod_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_mod_map VALUES (v_row.key, v_new_mod_key);

        SELECT new_key INTO v_new_tp_key_map  FROM tmp_tp_map   WHERE old_key = v_row.key_tipo_producto;
        SELECT new_key INTO v_new_marc_key_map FROM tmp_marc_map WHERE old_key = v_row.key_marca;

        v_reemplazos := jsonb_build_object('key', v_new_mod_key, 'key_tipo_producto', v_new_tp_key_map);
        IF v_new_marc_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_marca', v_new_marc_key_map);
        END IF;

        PERFORM public.clonar_tabla('modelo', 'key', v_row.key, v_reemplazos);
        n_modelo := n_modelo + 1;
    END LOOP;

    -- ── modelo_ingrediente (tmp_mod_map + tmp_ing_map) ────────
    FOR v_row IN
        SELECT key, key_modelo, key_ingrediente
        FROM modelo_ingrediente
        WHERE key_modelo IN (SELECT old_key FROM tmp_mod_map)
    LOOP
        SELECT new_key INTO v_new_mod_key_map FROM tmp_mod_map WHERE old_key = v_row.key_modelo;
        SELECT new_key INTO v_new_ing_key_map FROM tmp_ing_map WHERE old_key = v_row.key_ingrediente;

        v_reemplazos := jsonb_build_object('key', NULL, 'key_modelo', v_new_mod_key_map);
        IF v_new_ing_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_ingrediente', v_new_ing_key_map);
        END IF;

        PERFORM public.clonar_tabla('modelo_ingrediente', 'key', v_row.key, v_reemplazos);
        n_modelo_ingrediente := n_modelo_ingrediente + 1;
    END LOOP;

    -- ── modelo_tag (tmp_mod_map + tmp_tag_map) ────────────────
    FOR v_row IN
        SELECT key, key_modelo, key_tag
        FROM modelo_tag
        WHERE key_modelo IN (SELECT old_key FROM tmp_mod_map)
    LOOP
        SELECT new_key INTO v_new_mod_key_map FROM tmp_mod_map WHERE old_key = v_row.key_modelo;
        SELECT new_key INTO v_new_tag_key_map FROM tmp_tag_map WHERE old_key = v_row.key_tag;

        v_reemplazos := jsonb_build_object('key', NULL, 'key_modelo', v_new_mod_key_map);
        IF v_new_tag_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_tag', v_new_tag_key_map);
        END IF;

        PERFORM public.clonar_tabla('modelo_tag', 'key', v_row.key, v_reemplazos);
        n_modelo_tag := n_modelo_tag + 1;
    END LOOP;

    DROP TABLE IF EXISTS tmp_marc_map;
    DROP TABLE IF EXISTS tmp_ing_map;
    DROP TABLE IF EXISTS tmp_tag_map;
    DROP TABLE IF EXISTS tmp_tp_map;
    DROP TABLE IF EXISTS tmp_mod_map;

    v_counts := v_counts
        || jsonb_build_object('marca',              n_marca)
        || jsonb_build_object('almacen',            n_almacen)
        || jsonb_build_object('ingrediente',        n_ingrediente)
        || jsonb_build_object('tag',                n_tag)
        || jsonb_build_object('tipo_producto',      n_tipo_producto)
        || jsonb_build_object('modelo',             n_modelo)
        || jsonb_build_object('modelo_ingrediente', n_modelo_ingrediente)
        || jsonb_build_object('modelo_tag',         n_modelo_tag);

    RETURN json_build_object(
        'status',   'ok',
        'mensaje',  'inventario de empresa "' || _key_empresa_from || '" clonado a "' || _key_empresa_to || '"',
        'clonados', v_counts
    );
END;
$$;


ALTER FUNCTION public.clonador(_key_empresa_from character varying, _key_empresa_to character varying, _respuesta_empresa json) OWNER TO postgres;

--
-- Name: clonador(character varying, character varying, json, json, json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clonador(_key_empresa_from character varying, _key_empresa_to character varying, _respuesta_empresa json DEFAULT NULL::json, _respuesta_crm json DEFAULT NULL::json, _respuesta_contabilidad json DEFAULT NULL::json) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_tabla              text;
    v_row                RECORD;
    v_result             jsonb;
    v_reemplazos         jsonb;
    v_counts             jsonb := '{}';
    -- almacen
    v_new_suc_key_map    varchar;
    n_almacen            integer := 0;
    -- marca
    v_old_marc_key       varchar;
    v_new_marc_key       varchar;
    v_new_marc_key_map   varchar;
    n_marca              integer := 0;
    -- ingrediente
    v_old_ing_key        varchar;
    v_new_ing_key        varchar;
    v_new_ing_key_map    varchar;
    n_ingrediente        integer := 0;
    -- tag
    v_old_tag_key        varchar;
    v_new_tag_key        varchar;
    v_new_tag_key_map    varchar;
    n_tag                integer := 0;
    -- tipo_producto
    v_old_tp_key         varchar;
    v_new_tp_key         varchar;
    n_tipo_producto      integer := 0;
    -- modelo
    v_new_tp_key_map     varchar;
    v_new_mod_key        varchar;
    v_new_pvm_key        varchar;  -- precio_venta_moneda
    v_new_pcm_key        varchar;  -- precio_compra_moneda
    n_modelo             integer := 0;
    -- modelo_ingrediente / modelo_tag
    v_new_mod_key_map    varchar;
    n_modelo_ingrediente integer := 0;
    n_modelo_tag         integer := 0;
    -- modelo_cliente
    v_new_cli_key_map    varchar;
    v_new_cc_inv_key_map varchar;
    n_modelo_cliente     integer := 0;
BEGIN
    -- ── Tablas simples (batch) ────────────────────────────────
    FOREACH v_tabla IN ARRAY ARRAY['tipo_costo']
    LOOP
        SELECT public.clonar_tabla(v_tabla, 'key_empresa', _key_empresa_from,
            jsonb_build_object('key', NULL, 'key_empresa', _key_empresa_to))::jsonb
        INTO v_result;
        v_counts := v_counts || jsonb_build_object(v_tabla, v_result->'filas');
    END LOOP;

    -- ── marca → tmp_marc_map ──────────────────────────────────
    -- modelo.key_marca referencia marca, debe apuntar a las nuevas
    DROP TABLE IF EXISTS tmp_marc_map;
    CREATE TEMP TABLE tmp_marc_map (old_key varchar, new_key varchar);

    FOR v_old_marc_key IN
        SELECT key FROM marca WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_marc_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_marc_map VALUES (v_old_marc_key, v_new_marc_key);

        PERFORM public.clonar_tabla('marca', 'key', v_old_marc_key,
            jsonb_build_object('key', v_new_marc_key, 'key_empresa', _key_empresa_to));
        n_marca := n_marca + 1;
    END LOOP;

    -- ── almacen: fila a fila para mapear key_sucursal ─────────
    FOR v_row IN
        SELECT key, key_sucursal FROM almacen WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_suc_key_map := NULL;
        IF _respuesta_empresa IS NOT NULL THEN
            v_new_suc_key_map := _respuesta_empresa->'mapeo'->'sucursal'->>v_row.key_sucursal;
        END IF;

        v_reemplazos := jsonb_build_object('key', NULL, 'key_empresa', _key_empresa_to);
        IF v_new_suc_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_sucursal', v_new_suc_key_map);
        END IF;

        PERFORM public.clonar_tabla('almacen', 'key', v_row.key, v_reemplazos);
        n_almacen := n_almacen + 1;
    END LOOP;

    -- ── ingrediente → tmp_ing_map ─────────────────────────────
    DROP TABLE IF EXISTS tmp_ing_map;
    CREATE TEMP TABLE tmp_ing_map (old_key varchar, new_key varchar);

    FOR v_old_ing_key IN
        SELECT key FROM ingrediente WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_ing_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_ing_map VALUES (v_old_ing_key, v_new_ing_key);

        PERFORM public.clonar_tabla('ingrediente', 'key', v_old_ing_key,
            jsonb_build_object('key', v_new_ing_key, 'key_empresa', _key_empresa_to));
        n_ingrediente := n_ingrediente + 1;
    END LOOP;

    -- ── tag → tmp_tag_map ─────────────────────────────────────
    DROP TABLE IF EXISTS tmp_tag_map;
    CREATE TEMP TABLE tmp_tag_map (old_key varchar, new_key varchar);

    FOR v_old_tag_key IN
        SELECT key FROM tag WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_tag_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_tag_map VALUES (v_old_tag_key, v_new_tag_key);

        PERFORM public.clonar_tabla('tag', 'key', v_old_tag_key,
            jsonb_build_object('key', v_new_tag_key, 'key_empresa', _key_empresa_to));
        n_tag := n_tag + 1;
    END LOOP;

    -- ── tipo_producto → tmp_tp_map ────────────────────────────
    -- key_cuenta_contable_* son refs cross-módulo (contabilidad) y se copian tal cual
    DROP TABLE IF EXISTS tmp_tp_map;
    CREATE TEMP TABLE tmp_tp_map (old_key varchar, new_key varchar);

    FOR v_old_tp_key IN
        SELECT key FROM tipo_producto WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_tp_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_tp_map VALUES (v_old_tp_key, v_new_tp_key);

        PERFORM public.clonar_tabla('tipo_producto', 'key', v_old_tp_key,
            jsonb_build_object('key', v_new_tp_key, 'key_empresa', _key_empresa_to));
        n_tipo_producto := n_tipo_producto + 1;
    END LOOP;

    -- ── modelo (filtrado via tmp_tp_map) → tmp_mod_map ────────
    -- modelo no tiene key_empresa; se accede por key_tipo_producto
    DROP TABLE IF EXISTS tmp_mod_map;
    CREATE TEMP TABLE tmp_mod_map (old_key varchar, new_key varchar);

    FOR v_row IN
        SELECT key, key_tipo_producto, key_marca, precio_venta_moneda, precio_compra_moneda
        FROM modelo
        WHERE key_tipo_producto IN (SELECT old_key FROM tmp_tp_map)
    LOOP
        v_new_mod_key := md5(random()::text || clock_timestamp()::text);
        INSERT INTO tmp_mod_map VALUES (v_row.key, v_new_mod_key);

        SELECT new_key INTO v_new_tp_key_map  FROM tmp_tp_map   WHERE old_key = v_row.key_tipo_producto;
        SELECT new_key INTO v_new_marc_key_map FROM tmp_marc_map WHERE old_key = v_row.key_marca;

        v_reemplazos := jsonb_build_object('key', v_new_mod_key, 'key_tipo_producto', v_new_tp_key_map);
        IF v_new_marc_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_marca', v_new_marc_key_map);
        END IF;

        -- Mapear precio_venta_moneda y precio_compra_moneda desde empresa_moneda
        v_new_pvm_key := NULL;
        v_new_pcm_key := NULL;
        IF _respuesta_empresa IS NOT NULL THEN
            v_new_pvm_key := _respuesta_empresa->'mapeo'->'empresa_moneda'->>v_row.precio_venta_moneda;
            v_new_pcm_key := _respuesta_empresa->'mapeo'->'empresa_moneda'->>v_row.precio_compra_moneda;
        END IF;
        IF v_new_pvm_key IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('precio_venta_moneda', v_new_pvm_key);
        END IF;
        IF v_new_pcm_key IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('precio_compra_moneda', v_new_pcm_key);
        END IF;

        PERFORM public.clonar_tabla('modelo', 'key', v_row.key, v_reemplazos);
        n_modelo := n_modelo + 1;
    END LOOP;

    -- ── modelo_ingrediente (tmp_mod_map + tmp_ing_map) ────────
    FOR v_row IN
        SELECT key, key_modelo, key_ingrediente
        FROM modelo_ingrediente
        WHERE key_modelo IN (SELECT old_key FROM tmp_mod_map)
    LOOP
        SELECT new_key INTO v_new_mod_key_map FROM tmp_mod_map WHERE old_key = v_row.key_modelo;
        SELECT new_key INTO v_new_ing_key_map FROM tmp_ing_map WHERE old_key = v_row.key_ingrediente;

        v_reemplazos := jsonb_build_object('key', NULL, 'key_modelo', v_new_mod_key_map);
        IF v_new_ing_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_ingrediente', v_new_ing_key_map);
        END IF;

        PERFORM public.clonar_tabla('modelo_ingrediente', 'key', v_row.key, v_reemplazos);
        n_modelo_ingrediente := n_modelo_ingrediente + 1;
    END LOOP;

    -- ── modelo_tag (tmp_mod_map + tmp_tag_map) ────────────────
    FOR v_row IN
        SELECT key, key_modelo, key_tag
        FROM modelo_tag
        WHERE key_modelo IN (SELECT old_key FROM tmp_mod_map)
    LOOP
        SELECT new_key INTO v_new_mod_key_map FROM tmp_mod_map WHERE old_key = v_row.key_modelo;
        SELECT new_key INTO v_new_tag_key_map FROM tmp_tag_map WHERE old_key = v_row.key_tag;

        v_reemplazos := jsonb_build_object('key', NULL, 'key_modelo', v_new_mod_key_map);
        IF v_new_tag_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_tag', v_new_tag_key_map);
        END IF;

        PERFORM public.clonar_tabla('modelo_tag', 'key', v_row.key, v_reemplazos);
        n_modelo_tag := n_modelo_tag + 1;
    END LOOP;

    -- ── modelo_cliente (tmp_mod_map + crm + contabilidad) ─────
    FOR v_row IN
        SELECT key, key_modelo, key_cliente, key_cuenta_contable
        FROM modelo_cliente
        WHERE key_modelo IN (SELECT old_key FROM tmp_mod_map)
    LOOP
        SELECT new_key INTO v_new_mod_key_map FROM tmp_mod_map WHERE old_key = v_row.key_modelo;

        v_new_cli_key_map := NULL;
        IF _respuesta_crm IS NOT NULL THEN
            v_new_cli_key_map := _respuesta_crm->'mapeo'->'cliente'->>v_row.key_cliente;
        END IF;

        v_new_cc_inv_key_map := NULL;
        IF _respuesta_contabilidad IS NOT NULL THEN
            v_new_cc_inv_key_map := _respuesta_contabilidad->'mapeo'->'cuenta_contable'->>v_row.key_cuenta_contable;
        END IF;

        v_reemplazos := jsonb_build_object('key', NULL, 'key_modelo', v_new_mod_key_map);
        IF v_new_cli_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_cliente', v_new_cli_key_map);
        END IF;
        IF v_new_cc_inv_key_map IS NOT NULL THEN
            v_reemplazos := v_reemplazos || jsonb_build_object('key_cuenta_contable', v_new_cc_inv_key_map);
        END IF;

        PERFORM public.clonar_tabla('modelo_cliente', 'key', v_row.key, v_reemplazos);
        n_modelo_cliente := n_modelo_cliente + 1;
    END LOOP;

    DROP TABLE IF EXISTS tmp_marc_map;
    DROP TABLE IF EXISTS tmp_ing_map;
    DROP TABLE IF EXISTS tmp_tag_map;
    DROP TABLE IF EXISTS tmp_tp_map;
    DROP TABLE IF EXISTS tmp_mod_map;

    v_counts := v_counts
        || jsonb_build_object('marca',              n_marca)
        || jsonb_build_object('almacen',            n_almacen)
        || jsonb_build_object('ingrediente',        n_ingrediente)
        || jsonb_build_object('tag',                n_tag)
        || jsonb_build_object('tipo_producto',      n_tipo_producto)
        || jsonb_build_object('modelo',             n_modelo)
        || jsonb_build_object('modelo_ingrediente', n_modelo_ingrediente)
        || jsonb_build_object('modelo_tag',         n_modelo_tag)
        || jsonb_build_object('modelo_cliente',     n_modelo_cliente);

    RETURN json_build_object(
        'status',   'ok',
        'mensaje',  'inventario de empresa "' || _key_empresa_from || '" clonado a "' || _key_empresa_to || '"',
        'clonados', v_counts
    );
END;
$$;


ALTER FUNCTION public.clonador(_key_empresa_from character varying, _key_empresa_to character varying, _respuesta_empresa json, _respuesta_crm json, _respuesta_contabilidad json) OWNER TO postgres;

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
-- Name: fn_suscriptores_por_detalle(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_suscriptores_por_detalle(p_key_compra_venta_detalle text) RETURNS TABLE(key_compra_venta_detalle text, suscriptores_registrados integer, suscriptores_deberia_tener integer, faltantes integer, completo boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        cvd.key::TEXT AS key_compra_venta_detalle,

        COUNT(p_suscriptor.key)::INTEGER AS suscriptores_registrados,

        COALESCE(p_plan.limite_compra, 1)::INTEGER AS suscriptores_deberia_tener,

        GREATEST(
            COALESCE(p_plan.limite_compra, 1) - COUNT(p_suscriptor.key),
            0
        )::INTEGER AS faltantes,

        CASE
            WHEN COUNT(p_suscriptor.key) >= COALESCE(p_plan.limite_compra, 1)
            THEN TRUE
            ELSE FALSE
        END AS completo

    FROM compra_venta_detalle cvd

    LEFT JOIN producto p_plan
        ON p_plan.key = cvd.key_producto

    LEFT JOIN producto p_suscriptor
        ON p_suscriptor.key_compra_venta_detalle::TEXT = cvd.key::TEXT

    WHERE cvd.key::TEXT = p_key_compra_venta_detalle::TEXT

    GROUP BY
        cvd.key,
        p_plan.limite_compra;
END;
$$;


ALTER FUNCTION public.fn_suscriptores_por_detalle(p_key_compra_venta_detalle text) OWNER TO postgres;

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
-- Name: get_all_modelo(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_modelo(_key_modelo character varying) RETURNS SETOF character varying
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
                   select ingrediente.*,
					(
						select array_to_json(array_agg(modelo_ingrediente.*))
						from modelo_ingrediente
						where modelo_ingrediente.estado > 0
						and modelo_ingrediente.key_ingrediente = ingrediente.key
						and modelo_ingrediente.estado > 0 
					) as modelo_ingrediente
					from receta,
					ingrediente
					where receta.key_modelo = \''||_key_modelo||E'\'
					and receta.estado > 0
					and ingrediente.key = receta.key_ingrediente
					and ingrediente.estado > 0
					
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_modelo(_key_modelo character varying) OWNER TO postgres;

--
-- Name: get_all_modelos_padres(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_modelos_padres(_key_modelo character varying) RETURNS SETOF character varying
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

					WITH RECURSIVE padres AS (
					  -- Nivel 1: padres directos del modelo semilla
					  SELECT
					    mp.key::text                      AS key_modelo_padre,
					    1                                 AS nivel,
					    ARRAY[m.key::text, mp.key::text]  AS path
					  FROM modelo m
					  JOIN modelo_ingrediente mi
					    ON mi.key_modelo = m.key AND mi.estado > 0
					  JOIN ingrediente i
					    ON i.key = mi.key_ingrediente AND i.estado > 0
					  JOIN receta r
					    ON r.key_ingrediente = i.key AND r.estado > 0
					  JOIN modelo mp
					    ON mp.key = r.key_modelo AND mp.estado > 0
					  WHERE m.key =  \''||_key_modelo||E'\'::text
					    AND m.estado > 0
						AND i.bloquear_desensamblaje IS NOT TRUE 
					
					  UNION ALL
					
					  -- Niveles 2..∞: padres de los padres
					  SELECT
					    mp2.key::text                 AS key_modelo_padre,
					    p.nivel + 1                   AS nivel,
					    p.path || mp2.key::text       AS path
					  FROM padres p
					  JOIN modelo m2
					    ON m2.key = p.key_modelo_padre AND m2.estado > 0
					  JOIN modelo_ingrediente mi2
					    ON mi2.key_modelo = m2.key AND mi2.estado > 0
					  JOIN ingrediente i2
					    ON i2.key = mi2.key_ingrediente AND i2.estado > 0
					  JOIN receta r2
					    ON r2.key_ingrediente = i2.key AND r2.estado > 0
					  JOIN modelo mp2
					    ON mp2.key = r2.key_modelo AND mp2.estado > 0
					  -- Evita ciclos
					  WHERE NOT (mp2.key::text = ANY(p.path))
					),
					padres_unicos AS (
					  -- Si un padre aparece por múltiples caminos, nos quedamos con la menor profundidad
					  SELECT key_modelo_padre, MIN(nivel) AS nivel
					  FROM padres
					  GROUP BY key_modelo_padre
					)
					SELECT
					  mp.*,
					  pu.nivel,
					  COALESCE((
					    SELECT SUM(ic.cantidad)
					    FROM producto pr
					    JOIN inventario_cardex ic
					      ON ic.key_producto = pr.key AND ic.estado > 0
					    WHERE pr.estado > 0
					      AND pr.key_modelo = mp.key
					  ), 0) AS stock
					FROM padres_unicos pu
					JOIN modelo mp
					  ON mp.key = pu.key_modelo_padre
					ORDER BY pu.nivel, mp.key

					
					
					
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all_modelos_padres(_key_modelo character varying) OWNER TO postgres;

--
-- Name: get_arbol_modelo(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_arbol_modelo(p_key_modelo character varying) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Construir el JSON del modelo actual
    v_result := to_jsonb(m) ||  jsonb_build_object(
        'recetas', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'key_receta', r.key,
                    'ingrediente', to_jsonb(i) || jsonb_build_object(
                        'modelos', (
                            SELECT jsonb_agg(
                                get_arbol_modelo(m2.key)
                            )
                            FROM modelo_ingrediente mi
                            JOIN modelo m2 ON m2.key = mi.key_modelo
                            WHERE mi.key_ingrediente = i.key
                              AND mi.estado > 0
                              AND m2.estado > 0
                        )
                    )
                )
            )
            FROM receta r
            JOIN ingrediente i ON i.key = r.key_ingrediente
            WHERE r.key_modelo = m.key
              AND r.estado > 0
              AND i.estado > 0
        )
    )
    FROM modelo m
    WHERE m.key = p_key_modelo
      AND m.estado > 0;

    RETURN v_result;
END;
$$;


ALTER FUNCTION public.get_arbol_modelo(p_key_modelo character varying) OWNER TO postgres;

--
-- Name: get_asistencias(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_asistencias(_key_empresa character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta character varying;
BEGIN

    SELECT jsonb_agg(to_jsonb(sq))::text
    INTO respuesta
    FROM (
        SELECT asistencia.*
        FROM asistencia
        WHERE asistencia.key_empresa = _key_empresa
          AND asistencia.estado > 0
    ) sq;

    RETURN NEXT respuesta;

END;
$$;


ALTER FUNCTION public.get_asistencias(_key_empresa character varying) OWNER TO postgres;

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
					WHERE '||_nombre_tabla||E'.'||_key||E' = \''||_value||E'\'
					and '||_nombre_tabla||E'.'||_key1||E' = \''||_value1||E'\'
					and '||_nombre_tabla||E'.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_by_key(_nombre_tabla character varying, _key character varying, _value character varying, _key1 character varying, _value1 character varying) OWNER TO postgres;

--
-- Name: get_by_key_compra_venta_detalle(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_by_key_compra_venta_detalle(_key_compra_venta_detalle character varying) RETURNS SETOF character varying
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
					SELECT producto.*,
					(
					   select array_to_json(array_agg(suscripcion.*))
					   from suscripcion
					   where suscripcion.estado > 0
					   and suscripcion.key_producto = producto.key
					) suscripciones
					FROM public.producto
					where producto.key_compra_venta_detalle = \''||_key_compra_venta_detalle||E'\'
					and producto.estado > 0

					
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_by_key_compra_venta_detalle(_key_compra_venta_detalle character varying) OWNER TO postgres;

--
-- Name: get_categorias_productos_detalle(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_categorias_productos_detalle(_key_empresa character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
BEGIN

s_consulta := E' SELECT
                array_to_json(array_agg(sq.*)) as json 
				FROM (
             		select 
						categoria_producto.*,
						 CASE
                            WHEN count(producto.key) = 0 THEN \'[]\'::json
                            ELSE array_to_json(array_agg(producto.*))
                         END as productos
					from 
						categoria_producto LEFT JOIN (
							select 
								producto.*,
								 CASE
                                    WHEN count(sub_producto.key) = 0 THEN \'[]\'::json
                                    ELSE array_to_json(array_agg(sub_producto.* ORDER BY sub_producto.index asc))
                                 END as sub_productos
							from producto 
							LEFT JOIN (
								SELECT 
								sub_producto.*,
								 CASE
                                    WHEN count(sub_producto_detalle.key) = 0 THEN \'[]\'::json
                                    ELSE array_to_json(array_agg(sub_producto_detalle.* ORDER BY sub_producto_detalle.index asc))
                                 END as sub_producto_detalles
								FROM sub_producto LEFT JOIN sub_producto_detalle 
								ON sub_producto_detalle.key_sub_producto = sub_producto.key
								WHERE sub_producto.estado > 0
								AND sub_producto_detalle.estado > 0
								group by sub_producto.key
							) sub_producto 
							ON sub_producto.key_producto = producto.key
							WHERE producto.estado > 0
	AND producto.habilitado = true
							group by producto.key
						) producto ON  producto.key_categoria_producto = categoria_producto.key
					where 
						categoria_producto.estado > 0
					AND (
						categoria_producto.key_empresa = \''||_key_empresa||E'\'
						
					)
					
					group by categoria_producto.key
					order by categoria_producto.index asc
				) sq';

    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_categorias_productos_detalle(_key_empresa character varying) OWNER TO postgres;

--
-- Name: get_categorias_productos_detalle_partner(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_categorias_productos_detalle_partner(_key_empresa character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
BEGIN

s_consulta := E' SELECT
                array_to_json(array_agg(sq.*)) as json 
				FROM (
             		select 
						categoria_producto.*,
						 CASE
                            WHEN count(producto.key) = 0 THEN \'[]\'::json
                            ELSE array_to_json(array_agg(producto.*))
                         END as productos
					from 
						categoria_producto LEFT JOIN (
							select 
								producto.*,
								 CASE
                                    WHEN count(sub_producto.key) = 0 THEN \'[]\'::json
                                    ELSE array_to_json(array_agg(sub_producto.* ORDER BY sub_producto.index asc))
                                 END as sub_productos
							from producto 
							LEFT JOIN (
								SELECT 
								sub_producto.*,
								 CASE
                                    WHEN count(sub_producto_detalle.key) = 0 THEN \'[]\'::json
                                    ELSE array_to_json(array_agg(sub_producto_detalle.* ORDER BY sub_producto_detalle.index asc))
                                 END as sub_producto_detalles
								FROM sub_producto LEFT JOIN sub_producto_detalle 
								ON sub_producto_detalle.key_sub_producto = sub_producto.key
								WHERE sub_producto.estado > 0
								AND sub_producto_detalle.estado > 0
								group by sub_producto.key
							) sub_producto 
							ON sub_producto.key_producto = producto.key
							WHERE producto.estado > 0
							group by producto.key
						) producto ON  producto.key_categoria_producto = categoria_producto.key
					where 
						categoria_producto.estado > 0
					AND (
						categoria_producto.key_empresa = \''||_key_empresa||E'\'
						
					)
					
					group by categoria_producto.key
					order by categoria_producto.index asc
				) sq';

    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_categorias_productos_detalle_partner(_key_empresa character varying) OWNER TO postgres;

--
-- Name: get_historico_producto(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_historico_producto(_key_producto character varying) RETURNS SETOF character varying
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
                    SELECT almacen_producto.*
					FROM almacen_producto
					WHERE almacen_producto.key_producto = \''||_key_producto||E'\'
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_historico_producto(_key_producto character varying) OWNER TO postgres;

--
-- Name: get_inventario_dato(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_inventario_dato(_key_modelo character varying) RETURNS SETOF character varying
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
                    select inventario_dato.*
					from tipo_producto_inventario_dato,
					tipo_producto,
					modelo,
					inventario_dato
					where tipo_producto_inventario_dato.key_tipo_producto = tipo_producto.key
					and tipo_producto.key = modelo.key_tipo_producto
					and modelo.key = \''||_key_modelo||E'\'
					and inventario_dato.key = tipo_producto_inventario_dato.key_inventario_dato
					and tipo_producto_inventario_dato.estado > 0
					and tipo_producto.estado > 0
					and modelo.estado > 0
					and inventario_dato.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_inventario_dato(_key_modelo character varying) OWNER TO postgres;

--
-- Name: get_modelos(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_modelos(_key_empresa character varying) RETURNS SETOF character varying
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
                    SELECT modelo.*
					FROM modelo,
					marca
					WHERE marca.key_empresa = \''||_key_empresa||E'\'
					and modelo.key_marca = marca.key
					and marca.estado > 0
					and modelo.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_modelos(_key_empresa character varying) OWNER TO postgres;

--
-- Name: get_modelos_con_stock(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_modelos_con_stock(_key_empresa character varying, p_key_almacen character varying DEFAULT ''::character varying) RETURNS character varying
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN (
        SELECT array_to_json(array_agg(sq1.*)) AS json
        FROM (
            SELECT 
                modelo.*, 

				(	
					select sum(tabla.stock)
					from (
					WITH RECURSIVE arcos AS (
					  -- Aristas hijo -> padre con la cantidad agregada por padre
					  -- Nota: uso ingrediente.cantidad como cantidad. Si tu cantidad está en receta, cambia SUM(i.cantidad) por SUM(r.cantidad).
					  SELECT
					    m.key::text   AS key_modelo_hijo,
					    mp.key::text  AS key_modelo_padre,
					    SUM(i.cantidad)::numeric AS qty_edge
					  FROM modelo m
					  JOIN modelo_ingrediente mi
					    ON mi.key_modelo = m.key AND mi.estado > 0
					  JOIN ingrediente i
					    ON i.key = mi.key_ingrediente AND i.estado > 0
					  JOIN receta r
					    ON r.key_ingrediente = i.key AND r.estado > 0
					  JOIN modelo mp
					    ON mp.key = r.key_modelo AND mp.estado > 0
					  WHERE m.estado > 0
					    AND mp.estado > 0
						AND i.bloquear_desensamblaje IS NOT TRUE 
					  GROUP BY m.key, mp.key
					),
					rec AS (
					  -- Semilla: padres directos del modelo inicial
					  SELECT
					    a.key_modelo_padre,
					    1 AS nivel,
					    a.qty_edge AS qty_cum,
					    ARRAY[modelo.key::text, a.key_modelo_padre] AS path
					  FROM arcos a
					  WHERE a.key_modelo_hijo = modelo.key::text
					
					  UNION ALL
					
					  -- Recursión: padres de los padres, multiplicando cantidades
					  SELECT
					    a2.key_modelo_padre,
					    r.nivel + 1 AS nivel,
					    r.qty_cum * a2.qty_edge AS qty_cum,
					    r.path || a2.key_modelo_padre AS path
					  FROM rec r
					  JOIN arcos a2
					    ON a2.key_modelo_hijo = r.key_modelo_padre
					  WHERE NOT (a2.key_modelo_padre = ANY(r.path))  -- evita ciclos
					),
					agregado AS (
					  -- Agrega caminos múltiples hacia el mismo padre
					  SELECT
					    key_modelo_padre,
					    SUM(qty_cum) AS total_ingredientes,
					    MIN(nivel)   AS nivel_min
					  FROM rec
					  GROUP BY key_modelo_padre
					)
					SELECT
					  mp.*,
					  ag.total_ingredientes,
					  ag.nivel_min,
					  COALESCE((
					    SELECT SUM(producto_modelo.cantidad)
					    FROM producto pr,
						producto_modelo,
						inventario_Cardex,
						almacen
					    WHERE pr.estado > 0
						and inventario_cardex.estado > 0
						and inventario_cardex.key_producto = pr.key
						and inventario_cardex.key_almacen = almacen.key
						and almacen.estado > 0
						and pr.key_modelo = mp.key
						and producto_modelo.estado > 0
						and producto_modelo.key_producto = pr.key  
						and producto_modelo.key_modelo = modelo.key
						and (p_key_almacen = '' or almacen.key = p_key_almacen)
					  ), 0) AS stock
					FROM agregado ag
					JOIN modelo mp
					  ON mp.key = ag.key_modelo_padre
					WHERE mp.estado > 0
					ORDER BY ag.nivel_min, mp.key
					) tabla

				) as stock_padres,
				
				get_stock_modelo(modelo.key, p_key_almacen ) AS stock,
                TO_JSON(marca.*) AS marca,
                TO_JSON(tipo_producto.*) AS tipo_producto,

				   
 	(
					SELECT json_agg(sq1 ORDER BY sq1.fecha_modelo_tag ASC)
					FROM (
						SELECT  
							mt.key AS key_modelo_tag,
							mt.fecha_on AS fecha_modelo_tag,
							t.*
						FROM modelo_tag mt
						JOIN tag t ON t.key = mt.key_tag
						WHERE mt.key_modelo = modelo.key 
							AND mt.estado > 0 
							AND t.estado > 0 
					) AS sq1
				) AS tags,

			(
					SELECT array_to_json(array_agg(sq1.*))
					FROM
						(
						SELECT 
							modelo_proveedor.* 
							-- to_json(proveedor.*) as proveedor
						FROM modelo_proveedor
						--JOIN proveedor ON proveedor.key = modelo_proveedor.key_proveedor
						WHERE modelo_proveedor.key_modelo = modelo.key
						and modelo_proveedor.estado > 0 
					 ) sq1
				) as proveedores,

  COALESCE(
        (
            SELECT json_agg(mc.*) 
            FROM modelo_cliente mc
            WHERE mc.key_modelo = modelo.key
              AND mc.estado = 1
        ), '[]'
    ) AS contactos

				
            FROM modelo 
            JOIN marca ON marca.key = modelo.key_marca
            LEFT JOIN tipo_producto ON modelo.key_tipo_producto = tipo_producto.key  AND tipo_producto.estado > 0
            WHERE modelo.estado > 0
            AND marca.key_empresa = _key_empresa
            GROUP BY modelo.key, marca.key, tipo_producto.key
        ) sq1
    );
END;
$$;


ALTER FUNCTION public.get_modelos_con_stock(_key_empresa character varying, p_key_almacen character varying) OWNER TO postgres;

--
-- Name: get_modelos_con_stock_sucursal(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_modelos_con_stock_sucursal(_key_empresa character varying, p_key_sucursal character varying DEFAULT ''::character varying) RETURNS character varying
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN (
        SELECT array_to_json(array_agg(sq1.*)) AS json
        FROM (
            SELECT 
                modelo.*, 
				(	
					select sum(tabla.stock)
					from (
					WITH RECURSIVE arcos AS (
					  -- Aristas hijo -> padre con la cantidad agregada por padre
					  -- Nota: uso ingrediente.cantidad como cantidad. Si tu cantidad está en receta, cambia SUM(i.cantidad) por SUM(r.cantidad).
					  SELECT
					    m.key::text   AS key_modelo_hijo,
					    mp.key::text  AS key_modelo_padre,
					    SUM(i.cantidad)::numeric AS qty_edge
					  FROM modelo m
					  JOIN modelo_ingrediente mi ON mi.key_modelo = m.key AND mi.estado > 0
					  JOIN ingrediente i ON i.key = mi.key_ingrediente AND i.estado > 0
					  JOIN receta r ON r.key_ingrediente = i.key AND r.estado > 0
					  JOIN modelo mp ON mp.key = r.key_modelo AND mp.estado > 0
					  WHERE m.estado > 0
					    AND mp.estado > 0
						AND i.bloquear_desensamblaje IS NOT TRUE 
					  GROUP BY m.key, mp.key
					),
					rec AS (
					  -- Semilla: padres directos del modelo inicial
					  SELECT
					    a.key_modelo_padre,
					    1 AS nivel,
					    a.qty_edge AS qty_cum,
					    ARRAY[modelo.key::text, a.key_modelo_padre] AS path
					  FROM arcos a
					  WHERE a.key_modelo_hijo = modelo.key::text
					
					  UNION ALL
					
					  -- Recursión: padres de los padres, multiplicando cantidades
					  SELECT
					    a2.key_modelo_padre,
					    r.nivel + 1 AS nivel,
					    r.qty_cum * a2.qty_edge AS qty_cum,
					    r.path || a2.key_modelo_padre AS path
					  FROM rec r
					  JOIN arcos a2 ON a2.key_modelo_hijo = r.key_modelo_padre
					  WHERE NOT (a2.key_modelo_padre = ANY(r.path))  -- evita ciclos
					),
					agregado AS (
					  -- Agrega caminos múltiples hacia el mismo padre
					  SELECT
					    key_modelo_padre,
					    SUM(qty_cum) AS total_ingredientes,
					    MIN(nivel)   AS nivel_min
					  FROM rec
					  GROUP BY key_modelo_padre
					)
					SELECT
					  mp.*,
					  ag.total_ingredientes,
					  ag.nivel_min,
					  COALESCE((
					    SELECT SUM(producto_modelo.cantidad)
					    FROM producto pr,
						producto_modelo,
						inventario_Cardex,
						almacen
					    WHERE pr.estado > 0
						and inventario_cardex.estado > 0
						and inventario_cardex.key_producto = pr.key
						and inventario_cardex.key_almacen = almacen.key
						and almacen.estado > 0
						and pr.key_modelo = mp.key
						and producto_modelo.estado > 0
						and producto_modelo.key_producto = pr.key  
						and producto_modelo.key_modelo = modelo.key
						and almacen.key_sucursal = p_key_sucursal
					  ), 0) AS stock
					FROM agregado ag
					JOIN modelo mp ON mp.key = ag.key_modelo_padre
					WHERE mp.estado > 0
					ORDER BY ag.nivel_min, mp.key
					) tabla

				) as stock_padres,
				get_stock_modelo_sucursal(modelo.key, p_key_sucursal ) AS stock,
                TO_JSON(marca.*) AS marca,
                TO_JSON(tipo_producto.*) AS tipo_producto
            FROM modelo 
            JOIN marca ON marca.key = modelo.key_marca
            LEFT JOIN tipo_producto ON modelo.key_tipo_producto = tipo_producto.key  AND tipo_producto.estado > 0
            WHERE modelo.estado > 0
            AND marca.key_empresa = _key_empresa
            GROUP BY modelo.key, marca.key, tipo_producto.key
        ) sq1
    );
END;
$$;


ALTER FUNCTION public.get_modelos_con_stock_sucursal(_key_empresa character varying, p_key_sucursal character varying) OWNER TO postgres;

--
-- Name: get_modelos_con_stock_sucursal_inventario(text, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_modelos_con_stock_sucursal_inventario(_key_empresa text, p_key_sucursal character varying) RETURNS character varying
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN (
        SELECT array_to_json(array_agg(sq1.*)) AS json
        FROM (
            SELECT 
                modelo.*, 
				(	
					select sum(tabla.stock)
					from (
					WITH RECURSIVE arcos AS (
					  -- Aristas hijo -> padre con la cantidad agregada por padre
					  -- Nota: uso ingrediente.cantidad como cantidad. Si tu cantidad está en receta, cambia SUM(i.cantidad) por SUM(r.cantidad).
					  SELECT
					    m.key::text   AS key_modelo_hijo,
					    mp.key::text  AS key_modelo_padre,
					    SUM(i.cantidad)::numeric AS qty_edge
					  FROM modelo m
					  JOIN modelo_ingrediente mi ON mi.key_modelo = m.key AND mi.estado > 0
					  JOIN ingrediente i ON i.key = mi.key_ingrediente AND i.estado > 0
					  JOIN receta r ON r.key_ingrediente = i.key AND r.estado > 0
					  JOIN modelo mp ON mp.key = r.key_modelo AND mp.estado > 0
					  WHERE m.estado > 0
					    AND mp.estado > 0
						AND i.bloquear_desensamblaje IS NOT TRUE 
					  GROUP BY m.key, mp.key
					),
					rec AS (
					  -- Semilla: padres directos del modelo inicial
					  SELECT
					    a.key_modelo_padre,
					    1 AS nivel,
					    a.qty_edge AS qty_cum,
					    ARRAY[modelo.key::text, a.key_modelo_padre] AS path
					  FROM arcos a
					  WHERE a.key_modelo_hijo = modelo.key::text
					
					  UNION ALL
					
					  -- Recursión: padres de los padres, multiplicando cantidades
					  SELECT
					    a2.key_modelo_padre,
					    r.nivel + 1 AS nivel,
					    r.qty_cum * a2.qty_edge AS qty_cum,
					    r.path || a2.key_modelo_padre AS path
					  FROM rec r
					  JOIN arcos a2 ON a2.key_modelo_hijo = r.key_modelo_padre
					  WHERE NOT (a2.key_modelo_padre = ANY(r.path))  -- evita ciclos
					),
					agregado AS (
					  -- Agrega caminos múltiples hacia el mismo padre
					  SELECT
					    key_modelo_padre,
					    SUM(qty_cum) AS total_ingredientes,
					    MIN(nivel)   AS nivel_min
					  FROM rec
					  GROUP BY key_modelo_padre
					)
					SELECT
					  mp.*,
					  ag.total_ingredientes,
					  ag.nivel_min,
					  COALESCE((
					    SELECT SUM(producto_modelo.cantidad)
					    FROM producto pr,
						producto_modelo,
						inventario_Cardex,
						almacen
					    WHERE pr.estado > 0
						and inventario_cardex.estado > 0
						and inventario_cardex.key_producto = pr.key
						and inventario_cardex.key_almacen = almacen.key
						and almacen.estado > 0
						and pr.key_modelo = mp.key
						and producto_modelo.estado > 0
						and producto_modelo.key_producto = pr.key  
						and producto_modelo.key_modelo = modelo.key
						and almacen.key_sucursal = p_key_sucursal
					  ), 0) AS stock
					FROM agregado ag
					JOIN modelo mp ON mp.key = ag.key_modelo_padre
					WHERE mp.estado > 0
					ORDER BY ag.nivel_min, mp.key
					) tabla

				) as stock_padres,
				get_stock_modelo_sucursal(modelo.key, p_key_sucursal ) AS stock,
                TO_JSON(marca.*) AS marca,
                TO_JSON(tipo_producto.*) AS tipo_producto
            FROM modelo 
            JOIN marca ON marca.key = modelo.key_marca
            LEFT JOIN tipo_producto ON modelo.key_tipo_producto = tipo_producto.key  AND tipo_producto.estado > 0
            WHERE modelo.estado > 0
            AND marca.key_empresa = _key_empresa
            GROUP BY modelo.key, marca.key, tipo_producto.key
        ) sq1
    );
END;
$$;


ALTER FUNCTION public.get_modelos_con_stock_sucursal_inventario(_key_empresa text, p_key_sucursal character varying) OWNER TO postgres;

--
-- Name: get_producto_dato(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_producto_dato(_dato character varying) RETURNS SETOF character varying
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
					select producto_inventario_dato.*,
					producto.key_modelo,
					modelo.key_marca
					from producto_inventario_dato,
					producto,
					modelo
					where upper(producto_inventario_dato.descripcion) = upper(\''||_dato||E'\')
					and producto.key = producto_inventario_dato.key_producto
					and modelo.key = producto.key_modelo
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_producto_dato(_dato character varying) OWNER TO postgres;

--
-- Name: get_producto_ingredientes(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_producto_ingredientes(_key_producto character varying) RETURNS SETOF character varying
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
					producto_ingrediente.*,
					to_json(producto.*) as producto,
					to_json(modelo.*) as modelo,
					to_json(marca.*) as marca,
					to_json(tipo_producto.*) as tipo_producto

					FROM producto,
					producto_ingrediente,
					modelo,
					marca,
                    tipo_producto
					WHERE producto_ingrediente.key_producto = \''||_key_producto||E'\'
					and producto_ingrediente.key_producto_ingrediente = producto.key
					and producto_ingrediente.estado > 0
                   and modelo.key_tipo_producto = tipo_producto.key
					and modelo.key = producto.key_modelo
					and modelo.key_marca = marca.key
					and producto.estado > 0
					
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_producto_ingredientes(_key_producto character varying) OWNER TO postgres;

--
-- Name: get_productos(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_productos(_key_empresa character varying) RETURNS SETOF character varying
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
                    SELECT producto.*
					FROM producto left join modelo on producto.key_modelo = modelo.key and modelo.estado > 0
					left join marca on modelo.key_marca = marca.key and marca.estado > 0
					WHERE producto.key_empresa = \''||_key_empresa||E'\'
					and producto.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_productos(_key_empresa character varying) OWNER TO postgres;

--
-- Name: get_productos_detalle(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_productos_detalle(_key_producto character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    s_consulta character varying;
BEGIN

s_consulta := E' SELECT
                to_json(sq.*) as json 
FROM (
             select 
producto.*,
( 
	SELECT to_json(categoria_producto) as categoria
	FROM categoria_producto
	WHERE categoria_producto.key = producto.key_categoria_producto
	limit 1

) as categoria,
 CASE
                                    WHEN count(sub_producto.key) = 0 THEN \'[]\'::json
                                    ELSE array_to_json(array_agg(sub_producto.* ORDER BY sub_producto.index asc))
                                 END as sub_productos
from producto 
LEFT JOIN (
SELECT 
sub_producto.*,
 CASE
                                    WHEN count(sub_producto_detalle.key) = 0 THEN \'[]\'::json
                                    ELSE array_to_json(array_agg(sub_producto_detalle.* ORDER BY sub_producto_detalle.index asc))
                                 END as sub_producto_detalles
FROM sub_producto 
                            LEFT JOIN sub_producto_detalle 
 ON sub_producto_detalle.key_sub_producto = sub_producto.key
                                        AND sub_producto_detalle.estado <> 0
WHERE sub_producto.estado > 0

group by sub_producto.key
) sub_producto 
ON sub_producto.key_producto = producto.key
WHERE producto.estado > 0
AND producto.key =  \''||_key_producto||E'\'
group by producto.key
) sq';

    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;

END;
$$;


ALTER FUNCTION public.get_productos_detalle(_key_producto character varying) OWNER TO postgres;

--
-- Name: get_stock_modelo(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_stock_modelo(p_key_modelo character varying, p_key_almacen character varying DEFAULT ''::character varying) RETURNS double precision
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_stock double precision;
BEGIN
    SELECT 
		COALESCE(SUM(inventario_cardex.cantidad), 0) INTO v_stock
    FROM producto JOIN inventario_cardex ON producto.key = inventario_cardex.key_producto
    WHERE producto.key_modelo = p_key_modelo
	AND producto.estado > 0
	AND inventario_cardex.estado > 0
    AND (
        p_key_almacen = '' OR inventario_cardex.key_almacen = p_key_almacen
    );

    RETURN v_stock;
END;
$$;


ALTER FUNCTION public.get_stock_modelo(p_key_modelo character varying, p_key_almacen character varying) OWNER TO postgres;

--
-- Name: get_stock_modelo_producto(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_stock_modelo_producto(p_key_modelo character varying, p_key_almacen character varying DEFAULT ''::character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_stock json;
BEGIN
	select array_to_json(array_agg(tabla.*)) into v_stock
	from (
    SELECT producto.key, 
		COALESCE(SUM(inventario_cardex.cantidad), 0) as cantidad
		FROM producto JOIN inventario_cardex ON producto.key = inventario_cardex.key_producto
		WHERE producto.key_modelo = p_key_modelo
		AND producto.estado > 0
		AND inventario_cardex.estado > 0
		AND (
			p_key_almacen = '' OR inventario_cardex.key_almacen = p_key_almacen
		) group by producto.key
	)tabla;

    RETURN v_stock;
END;
$$;


ALTER FUNCTION public.get_stock_modelo_producto(p_key_modelo character varying, p_key_almacen character varying) OWNER TO postgres;

--
-- Name: get_stock_modelo_sucursal(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_stock_modelo_sucursal(p_key_modelo character varying, p_key_sucursal character varying DEFAULT ''::character varying) RETURNS double precision
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_stock double precision;
BEGIN
    SELECT 
		COALESCE(SUM(inventario_cardex.cantidad), 0) INTO v_stock
    FROM producto JOIN inventario_cardex ON producto.key = inventario_cardex.key_producto
	JOIN almacen on inventario_cardex.key_almacen = almacen.key
    WHERE producto.key_modelo = p_key_modelo
	AND producto.estado > 0
	AND inventario_cardex.estado > 0

	and almacen.key_sucursal = p_key_sucursal;

    RETURN v_stock;
END;
$$;


ALTER FUNCTION public.get_stock_modelo_sucursal(p_key_modelo character varying, p_key_sucursal character varying) OWNER TO postgres;

--
-- Name: get_stock_por_sucursal_inventario(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_stock_por_sucursal_inventario(p_key_empresa character varying, p_key_sucursal character varying DEFAULT NULL::character varying, p_key_almacen character varying DEFAULT NULL::character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado JSON;
BEGIN

    SELECT COALESCE(
        json_agg(
            json_build_object(
                'key_sucursal', suc.key_sucursal,
                'productos', suc.productos
            )
        ),
        '[]'::json
    )
    INTO resultado
    FROM (
        SELECT
            alm.key_sucursal,

            (
                SELECT COALESCE(json_agg(prod), '[]'::json)
                FROM (
                    SELECT
                        modelo.key,
                        modelo.descripcion AS producto,

                        SUM(
                            CASE
                                WHEN inventario_cardex.tipo IN ('ingreso_compra','ingreso_producto')
                                    THEN inventario_cardex.cantidad
                                WHEN inventario_cardex.tipo IN ('egreso_venta','anulacion_venta','baja','perdida')
                                    THEN -inventario_cardex.cantidad
                                ELSE inventario_cardex.cantidad
                            END
                        ) AS stock,

                        SUM(
                            CASE
                                WHEN inventario_cardex.tipo IN ('ingreso_compra','ingreso_producto')
                                    THEN inventario_cardex.cantidad
                                WHEN inventario_cardex.tipo IN ('egreso_venta','anulacion_venta','baja','perdida')
                                    THEN -inventario_cardex.cantidad
                                ELSE inventario_cardex.cantidad
                            END
                            * COALESCE(producto.precio_compra,0)
                        ) AS valor_inventario

                    FROM inventario_cardex

                    INNER JOIN producto
                        ON producto.key = inventario_cardex.key_producto

                    INNER JOIN modelo
                        ON modelo.key = producto.key_modelo

                    INNER JOIN almacen
                        ON almacen.key = inventario_cardex.key_almacen

                    WHERE inventario_cardex.estado > 0
                      AND producto.estado > 0
                      AND modelo.estado > 0
                      AND almacen.estado > 0
                      AND almacen.key_sucursal = alm.key_sucursal

                      AND (
                            p_key_almacen IS NULL
                            OR almacen.key = p_key_almacen
                      )

                    GROUP BY
                        modelo.key,
                        modelo.descripcion

                    HAVING SUM(
                        CASE
                            WHEN inventario_cardex.tipo IN ('ingreso_compra','ingreso_producto')
                                THEN inventario_cardex.cantidad
                            WHEN inventario_cardex.tipo IN ('egreso_venta','anulacion_venta','baja','perdida')
                                THEN -inventario_cardex.cantidad
                            ELSE inventario_cardex.cantidad
                        END
                    ) > 0

                    ORDER BY valor_inventario DESC

                ) prod
            ) AS productos

        FROM almacen alm

        WHERE alm.estado > 0
          AND alm.key_empresa = p_key_empresa

          AND (
                p_key_sucursal IS NULL
                OR alm.key_sucursal = p_key_sucursal
          )

        GROUP BY alm.key_sucursal

    ) suc;

    RETURN resultado;

END;
$$;


ALTER FUNCTION public.get_stock_por_sucursal_inventario(p_key_empresa character varying, p_key_sucursal character varying, p_key_almacen character varying) OWNER TO postgres;

--
-- Name: get_tipo_producto_custom(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_tipo_producto_custom(_key_empresa character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta character varying;
BEGIN

    SELECT jsonb_agg(to_jsonb(sq))::text
    INTO respuesta
    FROM (
        SELECT tipo_producto_custom.*
        FROM tipo_producto_custom
        WHERE tipo_producto_custom.key_empresa = _key_empresa
          AND tipo_producto_custom.estado > 0
    ) sq;

    RETURN NEXT respuesta;

END;
$$;


ALTER FUNCTION public.get_tipo_producto_custom(_key_empresa character varying) OWNER TO postgres;

--
-- Name: json_insert(text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.json_insert(table_name text, json_data jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    columns_list TEXT;
    values_list TEXT;
    sql_query TEXT;
    result_row JSONB;
BEGIN
    -- Extraer las columnas del objeto JSON que existen en la tabla
    SELECT string_agg(quote_ident(key), ', ')
    INTO columns_list
    FROM jsonb_each(json_data)
    WHERE key IN (
        SELECT c.column_name::text
        FROM information_schema.columns c
        WHERE c.table_name = json_insert.table_name
        AND c.table_schema = 'public'
    )
    AND (json_data ->> key) IS NOT NULL AND (json_data ->> key) != '';
    
    -- Extraer los valores del objeto JSON que corresponden a columnas válidas
    SELECT string_agg(quote_literal(value #>> '{}'), ', ')
    INTO values_list
    FROM jsonb_each(json_data)
    WHERE key IN (
        SELECT c.column_name::text
        FROM information_schema.columns c
        WHERE c.table_name = json_insert.table_name
        AND c.table_schema = 'public'
    )
    AND (json_data ->> key) IS NOT NULL AND (json_data ->> key) != '';
    
    -- Si no hay columnas válidas para insertar, salir sin hacer nada
    IF columns_list IS NULL OR columns_list = '' THEN
        RETURN jsonb_build_object('estado', 'error', 'mensaje', 'No hay columnas válidas para insertar');
    END IF;
    
    -- Construir la consulta SQL dinámica con RETURNING
    sql_query := format(
        'INSERT INTO %I (%s) VALUES (%s) RETURNING row_to_json(%I.*)',
        table_name,
        columns_list,
        values_list,
        table_name
    );
    
    -- Ejecutar la consulta y obtener el resultado
    EXECUTE sql_query INTO result_row;
    
    -- Retornar el objeto insertado
    RETURN jsonb_build_array(result_row);
END;
$$;


ALTER FUNCTION public.json_insert(table_name text, json_data jsonb) OWNER TO postgres;

--
-- Name: json_update(text, jsonb, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.json_update(table_name text, json_data jsonb, where_condition text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    set_clause TEXT;
    sql_query TEXT;
    final_where TEXT;
    result_row JSONB;
BEGIN
    -- Si no viene where_condition, usar key = valor_key_del_json
    IF where_condition IS NULL THEN
        IF json_data ? 'key' THEN
            final_where := format('key = %L', json_data->>'key');
        ELSE
            RAISE EXCEPTION 'No se especificó where_condition y el JSON no contiene el campo "key"';
        END IF;
    ELSE
        final_where := where_condition;
    END IF;
    
    -- Construir la cláusula SET solo con columnas que existen en la tabla
    SELECT string_agg(
        CASE 
            -- Si el valor es una cadena vacía y la columna es numérica, usar NULL
            WHEN (value #>> '{}') = '' AND c.data_type IN ('numeric', 'integer', 'bigint', 'smallint', 'decimal', 'real', 'double precision') THEN
                format('%I = NULL', key)
            -- Si el valor es null en JSON, usar NULL
            WHEN jsonb_typeof(value) = 'null' THEN
                format('%I = NULL', key)
            -- Para el resto, usar el valor como literal
            ELSE
                format('%I = %L', key, value #>> '{}')
        END,
        ', '
    )
    INTO set_clause
    FROM jsonb_each(json_data) j
    LEFT JOIN information_schema.columns c ON c.column_name = j.key
        AND c.table_name = json_update.table_name
        AND c.table_schema = 'public'
    WHERE j.key IN (
        SELECT c2.column_name::text
        FROM information_schema.columns c2
        WHERE c2.table_name = json_update.table_name
        AND c2.table_schema = 'public'
    );
    
    -- Si no hay columnas válidas para actualizar, salir sin hacer nada
    IF set_clause IS NULL OR set_clause = '' THEN
        RETURN jsonb_build_object('estado', 'ok', 'mensaje', 'No hay columnas válidas para actualizar');
    END IF;
    
    -- Construir la consulta SQL dinámica con RETURNING
    sql_query := format(
        'UPDATE %I SET %s WHERE %s RETURNING row_to_json(%I.*)',
        table_name,
        set_clause,
        final_where,
        table_name
    );
    
    -- Ejecutar la consulta y obtener el resultado
    EXECUTE sql_query INTO result_row;
    
    -- Retornar el objeto actualizado
    RETURN jsonb_build_array(result_row);
END;
$$;


ALTER FUNCTION public.json_update(table_name text, json_data jsonb, where_condition text) OWNER TO postgres;

--
-- Name: json_upsert(text, jsonb, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.json_upsert(table_name text, json_array jsonb, conflict_column text DEFAULT 'key'::text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    item JSONB;
    result_array JSONB := '[]'::JSONB;
    item_result JSONB;
    conflict_value TEXT;
    row_exists BOOLEAN;
    check_sql TEXT;
    columns_list TEXT;
    values_list TEXT;
    set_clause TEXT;
    sql_query TEXT;
BEGIN
    FOR item IN SELECT jsonb_array_elements(json_array)
    LOOP
        conflict_value := item ->> conflict_column;

        IF conflict_value IS NOT NULL AND conflict_value != '' THEN
            check_sql := format('SELECT EXISTS(SELECT 1 FROM %I WHERE %I = %L)', table_name, conflict_column, conflict_value);
            EXECUTE check_sql INTO row_exists;
        ELSE
            row_exists := FALSE;
        END IF;

        IF row_exists THEN
            -- UPDATE
            SELECT string_agg(
                CASE
                    WHEN (value #>> '{}') = '' AND c.data_type IN ('numeric', 'integer', 'bigint', 'smallint', 'decimal', 'real', 'double precision') THEN
                        format('%I = NULL', key)
                    WHEN jsonb_typeof(value) = 'null' THEN
                        format('%I = NULL', key)
                    ELSE
                        format('%I = %L', key, value #>> '{}')
                END,
                ', '
            )
            INTO set_clause
            FROM jsonb_each(item) j
            LEFT JOIN information_schema.columns c ON c.column_name = j.key
                AND c.table_name = json_upsert.table_name
                AND c.table_schema = 'public'
            WHERE j.key IN (
                SELECT c2.column_name::text
                FROM information_schema.columns c2
                WHERE c2.table_name = json_upsert.table_name
                AND c2.table_schema = 'public'
            );

            IF set_clause IS NULL OR set_clause = '' THEN
                item_result := item;
            ELSE
                sql_query := format(
                    'UPDATE %I SET %s WHERE %I = %L RETURNING row_to_json(%I.*)',
                    table_name, set_clause, conflict_column, conflict_value, table_name
                );
                EXECUTE sql_query INTO item_result;
            END IF;

        ELSE
            -- INSERT
            SELECT string_agg(quote_ident(key), ', ')
            INTO columns_list
            FROM jsonb_each(item)
            WHERE key IN (
                SELECT c.column_name::text
                FROM information_schema.columns c
                WHERE c.table_name = json_upsert.table_name
                AND c.table_schema = 'public'
            )
            AND (item ->> key) IS NOT NULL AND (item ->> key) != '';

            SELECT string_agg(quote_literal(value #>> '{}'), ', ')
            INTO values_list
            FROM jsonb_each(item)
            WHERE key IN (
                SELECT c.column_name::text
                FROM information_schema.columns c
                WHERE c.table_name = json_upsert.table_name
                AND c.table_schema = 'public'
            )
            AND (item ->> key) IS NOT NULL AND (item ->> key) != '';

            IF columns_list IS NULL OR columns_list = '' THEN
                CONTINUE;
            END IF;

            sql_query := format(
                'INSERT INTO %I (%s) VALUES (%s) RETURNING row_to_json(%I.*)',
                table_name, columns_list, values_list, table_name
            );
            EXECUTE sql_query INTO item_result;
        END IF;

        result_array := result_array || jsonb_build_array(item_result);
    END LOOP;

    RETURN result_array;
END;
$$;


ALTER FUNCTION public.json_upsert(table_name text, json_array jsonb, conflict_column text) OWNER TO postgres;

--
-- Name: modelo_getallproductos(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.modelo_getallproductos(p_key_modelo character varying, p_key_almacen character varying DEFAULT ''::character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_resp json;
BEGIN
    SELECT 	array_to_json(array_agg(sq1.*)) INTO v_resp
	FROM (
		SELECT producto.*,
			inventario_cardex.key_almacen,
			to_json(almacen.*) as almacen,
            MAX((inventario_cardex.data->>'precio_unitario_compra')::numeric) AS precio_costo,
			COALESCE(SUM(inventario_cardex.cantidad), 0)  as cantidad
		FROM producto 
		LEFT JOIN inventario_cardex ON producto.key = inventario_cardex.key_producto
		LEFT JOIN almacen ON inventario_cardex.key_almacen = almacen.key
		WHERE producto.key_modelo = p_key_modelo
		AND producto.estado > 0
		GROUP BY producto.key, inventario_cardex.key_almacen, almacen.key
		    ORDER BY producto.fecha_on DESC

	) sq1
	;
    RETURN v_resp;
END;
$$;


ALTER FUNCTION public.modelo_getallproductos(p_key_modelo character varying, p_key_almacen character varying) OWNER TO postgres;

--
-- Name: retirar_productos_por_modelo(character varying, character varying, numeric, character varying, text, character varying, json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.retirar_productos_por_modelo(p_key_modelo character varying, p_key_sucursal character varying, p_cantidad numeric, p_key_usuario character varying, p_tipo text, p_key_conteo_manual_inventario character varying DEFAULT NULL::character varying, _data json DEFAULT NULL::json) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_total NUMERIC := 0;
    v_uuid UUID;
    result JSON;
BEGIN
  -- 1. Crear tabla temporal con productos a usar
--   DELETE FROM tmp_productos_utilizados;
  CREATE TEMP TABLE  IF NOT EXISTS tmp_productos_utilizados (
    key_producto VARCHAR,
    cantidad NUMERIC,
    precio_compra NUMERIC,
    key_almacen VARCHAR
  ) ON COMMIT DROP;
  
  TRUNCATE tmp_productos_utilizados;

  -- 2. Insertar en la tabla temporal los productos necesarios
  WITH base AS (
    SELECT 
      p.key,
      COALESCE(SUM(ic.cantidad), 0)::NUMERIC AS stock,
      p.precio_compra,
      p.fecha_on,
      ic.key_almacen,
      SUM(COALESCE(SUM(ic.cantidad), 0)) OVER (ORDER BY p.fecha_on) AS acumulado
    FROM producto p
    JOIN inventario_cardex ic ON p.key = ic.key_producto
    JOIN almacen a ON ic.key_almacen = a.key
    WHERE p.key_modelo = p_key_modelo
      AND p.estado > 0
      AND ic.estado > 0
      AND a.key_sucursal = p_key_sucursal
    GROUP BY p.key, p.fecha_on, ic.key_almacen
    ORDER BY p.fecha_on asc
  ),
  con_acumulado AS (
    SELECT 
      key,
      stock,
      precio_compra,
      fecha_on,
      key_almacen,
      acumulado,
      COALESCE(LAG(acumulado) OVER (ORDER BY fecha_on), 0) AS acumulado_anterior
    FROM base
	WHERE base.stock > 0
  )
  INSERT INTO tmp_productos_utilizados (key_producto, cantidad,precio_compra, key_almacen)
  SELECT 
    key,
    LEAST(stock, GREATEST(p_cantidad - acumulado_anterior, 0)) AS cantidad_a_utilizar,
    precio_compra,
    key_almacen
  FROM con_acumulado
  WHERE acumulado <= p_cantidad
     OR acumulado_anterior < p_cantidad;

  -- 3. Insertar los movimientos en el cardex y recolectar los resultados
	  CREATE TEMP TABLE IF NOT EXISTS tmp_cardex_inserted (
		key UUID,
		key_producto VARCHAR,
		key_almacen VARCHAR,
		cantidad NUMERIC,
		tipo TEXT,
		fecha_on TIMESTAMP,
		key_usuario VARCHAR,
		estado INT,
		key_conteo_manual_inventario VARCHAR,
		data JSON
	) ON COMMIT DROP;

	TRUNCATE tmp_cardex_inserted;

  INSERT INTO tmp_cardex_inserted (
    key, key_producto, key_almacen, cantidad, tipo, fecha_on, key_usuario, estado, key_conteo_manual_inventario, data
  )
  SELECT 
    gen_random_uuid(),
    key_producto,
    key_almacen,
    -cantidad,
    p_tipo,
    NOW(),
    p_key_usuario,
    1,
    p_key_conteo_manual_inventario,
    CASE 
      WHEN _data IS NULL THEN json_build_object('costo_unitario', precio_compra)
      ELSE ((_data::jsonb) || (json_build_object('costo_unitario', precio_compra)::jsonb))::json
    END
  FROM tmp_productos_utilizados;

  -- Insertar en la tabla real
  INSERT INTO inventario_cardex (
    key, key_producto, key_almacen, cantidad, tipo, fecha_on, key_usuario, estado,key_conteo_manual_inventario, data
  )
  SELECT * FROM tmp_cardex_inserted;

  -- 4. Devolver el resultado insertado como JSON
  SELECT array_to_json(array_agg(t.*)) INTO result FROM ( 
	  	SELECT tmp_cardex_inserted.* , producto.precio_compra
	  FROM tmp_cardex_inserted JOIN producto ON tmp_cardex_inserted.key_producto = producto.key
  ) t;

  RETURN result;
END;
$$;


ALTER FUNCTION public.retirar_productos_por_modelo(p_key_modelo character varying, p_key_sucursal character varying, p_cantidad numeric, p_key_usuario character varying, p_tipo text, p_key_conteo_manual_inventario character varying, _data json) OWNER TO postgres;

--
-- Name: retirar_productos_por_modelo_(character varying, character varying, numeric, character varying, text, character varying, json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.retirar_productos_por_modelo_(p_key_modelo character varying, p_key_almacen character varying, p_cantidad numeric, p_key_usuario character varying, p_tipo text, p_key_conteo_manual_inventario character varying DEFAULT NULL::character varying, _data json DEFAULT NULL::json) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_total NUMERIC := 0;
    v_uuid UUID;
    result JSON;
BEGIN
  -- 1. Crear tabla temporal con productos a usar
--   DELETE FROM tmp_productos_utilizados;
  CREATE TEMP TABLE  IF NOT EXISTS tmp_productos_utilizados (
    key_producto VARCHAR,
    cantidad NUMERIC,
	precio_compra NUMERIC
  ) ON COMMIT DROP;
  
  TRUNCATE tmp_productos_utilizados;

  -- 2. Insertar en la tabla temporal los productos necesarios
  WITH base AS (
    SELECT 
      p.key,
      COALESCE(SUM(ic.cantidad), 0)::NUMERIC AS stock,
	  p.precio_compra,
      p.fecha_on,
      SUM(COALESCE(SUM(ic.cantidad), 0)) OVER (ORDER BY p.fecha_on) AS acumulado
    FROM producto p
    JOIN inventario_cardex ic ON p.key = ic.key_producto
    WHERE p.key_modelo = p_key_modelo
      AND p.estado > 0
      AND ic.estado > 0
      AND ic.key_almacen = p_key_almacen
    GROUP BY p.key, p.fecha_on
    ORDER BY p.fecha_on asc
  ),
  con_acumulado AS (
    SELECT 
      key,
      stock,
	  precio_compra,
      fecha_on,
      acumulado,
      COALESCE(LAG(acumulado) OVER (ORDER BY fecha_on), 0) AS acumulado_anterior
    FROM base
  )
  INSERT INTO tmp_productos_utilizados (key_producto, cantidad,precio_compra)
  SELECT 
    key,
    LEAST(stock, GREATEST(p_cantidad - acumulado_anterior, 0)) AS cantidad_a_utilizar,
	precio_compra
  FROM con_acumulado
  WHERE acumulado <= p_cantidad
     OR acumulado_anterior < p_cantidad;

  -- 3. Insertar los movimientos en el cardex y recolectar los resultados
	  CREATE TEMP TABLE IF NOT EXISTS tmp_cardex_inserted (
		key UUID,
		key_producto VARCHAR,
		key_almacen VARCHAR,
		cantidad NUMERIC,
		tipo TEXT,
		fecha_on TIMESTAMP,
		key_usuario VARCHAR,
		estado INT,
		key_conteo_manual_inventario VARCHAR,
		data JSON
	) ON COMMIT DROP;

	TRUNCATE tmp_cardex_inserted;

	INSERT INTO tmp_cardex_inserted (
		key, key_producto, key_almacen, cantidad, tipo, fecha_on, key_usuario, estado, key_conteo_manual_inventario, data
	)
	SELECT 
		gen_random_uuid(),
		key_producto,
		p_key_almacen,
		-cantidad,
		p_tipo,
		NOW(),
		p_key_usuario,
		1,
		p_key_conteo_manual_inventario,
		_data
	FROM tmp_productos_utilizados;

  -- Insertar en la tabla real
  INSERT INTO inventario_cardex (
    key, key_producto, key_almacen, cantidad, tipo, fecha_on, key_usuario, estado,key_conteo_manual_inventario, data
  )
  SELECT * FROM tmp_cardex_inserted;

  -- 4. Devolver el resultado insertado como JSON
  SELECT array_to_json(array_agg(t.*)) INTO result FROM ( 
	  	SELECT tmp_cardex_inserted.* , producto.precio_compra
	  FROM tmp_cardex_inserted JOIN producto ON tmp_cardex_inserted.key_producto = producto.key
  ) t;

  RETURN result;
END;
$$;


ALTER FUNCTION public.retirar_productos_por_modelo_(p_key_modelo character varying, p_key_almacen character varying, p_cantidad numeric, p_key_usuario character varying, p_tipo text, p_key_conteo_manual_inventario character varying, _data json) OWNER TO postgres;

--
-- Name: retirar_productos_por_modelo_almacen(character varying, character varying, numeric, character varying, text, character varying, json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.retirar_productos_por_modelo_almacen(p_key_modelo character varying, p_key_almacen character varying, p_cantidad numeric, p_key_usuario character varying, p_tipo text, p_key_conteo_manual_inventario character varying DEFAULT NULL::character varying, _data json DEFAULT NULL::json) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_total NUMERIC := 0;
    v_uuid UUID;
    result JSON;
BEGIN
  -- 1. Crear tabla temporal con productos a usar
--   DELETE FROM tmp_productos_utilizados;
  CREATE TEMP TABLE  IF NOT EXISTS tmp_productos_utilizados (
    key_producto VARCHAR,
    cantidad NUMERIC,
	precio_compra NUMERIC
  ) ON COMMIT DROP;
  
  TRUNCATE tmp_productos_utilizados;

  -- 2. Insertar en la tabla temporal los productos necesarios
  WITH base AS (
    SELECT 
      p.key,
      COALESCE(SUM(ic.cantidad), 0)::NUMERIC AS stock,
	  p.precio_compra,
      p.fecha_on,
      SUM(COALESCE(SUM(ic.cantidad), 0)) OVER (ORDER BY p.fecha_on) AS acumulado
    FROM producto p
    JOIN inventario_cardex ic ON p.key = ic.key_producto
    WHERE p.key_modelo = p_key_modelo
      AND p.estado > 0
      AND ic.estado > 0
      AND ic.key_almacen = p_key_almacen
    GROUP BY p.key, p.fecha_on
    ORDER BY p.fecha_on asc
  ),
  con_acumulado AS (
    SELECT 
      key,
      stock,
	  precio_compra,
      fecha_on,
      acumulado,
      COALESCE(LAG(acumulado) OVER (ORDER BY fecha_on), 0) AS acumulado_anterior
    FROM base
  )
  INSERT INTO tmp_productos_utilizados (key_producto, cantidad,precio_compra)
  SELECT 
    key,
    LEAST(stock, GREATEST(p_cantidad - acumulado_anterior, 0)) AS cantidad_a_utilizar,
	precio_compra
  FROM con_acumulado
  WHERE (acumulado <= p_cantidad OR acumulado_anterior < p_cantidad)
    AND LEAST(stock, GREATEST(p_cantidad - acumulado_anterior, 0)) > 0;

  -- 3. Insertar los movimientos en el cardex y recolectar los resultados
	  CREATE TEMP TABLE IF NOT EXISTS tmp_cardex_inserted (
		key UUID,
		key_producto VARCHAR,
		key_almacen VARCHAR,
		cantidad NUMERIC,
		tipo TEXT,
		fecha_on TIMESTAMP,
		key_usuario VARCHAR,
		estado INT,
		key_conteo_manual_inventario VARCHAR,
		data JSON
	) ON COMMIT DROP;

	TRUNCATE tmp_cardex_inserted;

	INSERT INTO tmp_cardex_inserted (
		key, key_producto, key_almacen, cantidad, tipo, fecha_on, key_usuario, estado, key_conteo_manual_inventario, data
	)
	SELECT 
		gen_random_uuid(),
		key_producto,
		p_key_almacen,
		-cantidad,
		p_tipo,
		NOW(),
		p_key_usuario,
		1,
		p_key_conteo_manual_inventario,
		_data
	FROM tmp_productos_utilizados
	WHERE cantidad IS NOT NULL AND cantidad > 0;

  -- Insertar en la tabla real
  INSERT INTO inventario_cardex (
    key, key_producto, key_almacen, cantidad, tipo, fecha_on, key_usuario, estado,key_conteo_manual_inventario, data
  )
  SELECT * FROM tmp_cardex_inserted;

  -- 4. Devolver el resultado insertado como JSON
  SELECT array_to_json(array_agg(t.*)) INTO result FROM ( 
	  	SELECT tmp_cardex_inserted.* , producto.precio_compra
	  FROM tmp_cardex_inserted JOIN producto ON tmp_cardex_inserted.key_producto = producto.key
  ) t;

  RETURN result;
END;
$$;


ALTER FUNCTION public.retirar_productos_por_modelo_almacen(p_key_modelo character varying, p_key_almacen character varying, p_cantidad numeric, p_key_usuario character varying, p_tipo text, p_key_conteo_manual_inventario character varying, _data json) OWNER TO postgres;

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: almacen; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.almacen (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    key_sucursal character varying,
    is_venta boolean,
    is_stock boolean,
    is_entrega boolean,
    key_empresa character varying,
    key_unidad_negocio character varying
);


ALTER TABLE public.almacen OWNER TO postgres;

--
-- Name: almacen_producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.almacen_producto (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    key_almacen character varying,
    key_producto character varying,
    tipo_movimiento character varying,
    fecha_movimiento timestamp without time zone
);


ALTER TABLE public.almacen_producto OWNER TO postgres;

--
-- Name: asistencia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asistencia (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_suscripcion character varying,
    key_empresa character varying,
    key_sucursal character varying,
    key_cliente character varying
);


ALTER TABLE public.asistencia OWNER TO postgres;

--
-- Name: categoria_producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categoria_producto (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    nombre character varying,
    key_empresa character varying,
    index integer,
    descripcion character varying
);


ALTER TABLE public.categoria_producto OWNER TO postgres;

--
-- Name: conteo_manual_inventario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conteo_manual_inventario (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_almacen character varying,
    data json,
    fecha_confirmacion timestamp without time zone
);


ALTER TABLE public.conteo_manual_inventario OWNER TO postgres;

--
-- Name: historial_traspaso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_traspaso (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    key_empresa character varying,
    data json
);


ALTER TABLE public.historial_traspaso OWNER TO postgres;

--
-- Name: ingrediente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingrediente (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    is_required boolean,
    cantidad double precision,
    descripcion character varying,
    key_empresa character varying,
    bloquear_desensamblaje boolean
);


ALTER TABLE public.ingrediente OWNER TO postgres;

--
-- Name: inventario_cardex; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventario_cardex (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp with time zone,
    estado integer,
    key_producto character varying,
    key_almacen character varying,
    cantidad numeric,
    tipo character varying,
    key_asiento_contable character varying,
    key_conteo_manual_inventario character varying,
    data json
);


ALTER TABLE public.inventario_cardex OWNER TO postgres;

--
-- Name: inventario_dato; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventario_dato (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    tipo character varying,
    key_servicio character varying,
    key_empresa character varying
);


ALTER TABLE public.inventario_dato OWNER TO postgres;

--
-- Name: marca; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marca (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone DEFAULT now(),
    estado integer DEFAULT 1,
    descripcion character varying,
    observacion character varying,
    key_servicio character varying,
    key_empresa character varying
);


ALTER TABLE public.marca OWNER TO postgres;

--
-- Name: modelo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modelo (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone DEFAULT now(),
    estado integer DEFAULT 1,
    descripcion character varying,
    observacion character varying,
    key_marca character varying,
    key_tipo_producto character varying,
    precio_compra double precision,
    unidad_medida character varying,
    precio_venta double precision,
    barcode character varying,
    fecha_edit timestamp without time zone,
    codigo_ref character varying(255),
    duracion integer,
    duracion_medida character varying(255),
    cantidad_suscriptores integer,
    precio_venta_moneda character varying,
    precio_compra_moneda character varying,
    key_cuenta_contable_inventario character varying
);


ALTER TABLE public.modelo OWNER TO postgres;

--
-- Name: modelo_cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modelo_cliente (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_modelo character varying,
    key_cliente character varying,
    comision character varying,
    key_cuenta_contable character varying,
    key_tipo_costo character varying,
    key_tipo_pago character varying
);


ALTER TABLE public.modelo_cliente OWNER TO postgres;

--
-- Name: modelo_ingrediente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modelo_ingrediente (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_modelo character varying,
    key_ingrediente character varying
);


ALTER TABLE public.modelo_ingrediente OWNER TO postgres;

--
-- Name: modelo_proveedor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modelo_proveedor (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_modelo character varying,
    key_proveedor character varying
);


ALTER TABLE public.modelo_proveedor OWNER TO postgres;

--
-- Name: modelo_tag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modelo_tag (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    key_modelo character varying,
    key_tag character varying,
    descripcion character varying,
    estado integer
);


ALTER TABLE public.modelo_tag OWNER TO postgres;

--
-- Name: producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producto (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    key_modelo character varying,
    key_compra_venta_detalle character varying,
    codigo character varying,
    precio_compra double precision,
    habilitado boolean,
    mayor_edad boolean,
    ley_seca boolean,
    index integer,
    limite_compra double precision,
    fecha_habilitacion_automatica timestamp without time zone,
    key_categoria_producto character varying,
    nombre character varying,
    precio double precision,
    key_empresa character varying,
    depreciacion double precision,
    fecha_vencimiento timestamp without time zone
);


ALTER TABLE public.producto OWNER TO postgres;

--
-- Name: producto_entrega; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producto_entrega (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_producto character varying,
    key_almacen character varying,
    key_cliente character varying,
    cantidad double precision,
    precio_unitario_compra double precision,
    precio_unitario_venta double precision,
    key_compra_venta_detalle_producto character varying,
    validado_compra_venta timestamp without time zone
);


ALTER TABLE public.producto_entrega OWNER TO postgres;

--
-- Name: producto_historico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producto_historico (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    key_modelo character varying,
    precio_compra character varying,
    key_almacen character varying,
    key_cliente character varying,
    key_producto character varying,
    precio_venta character varying,
    precio_venta_credito character varying
);


ALTER TABLE public.producto_historico OWNER TO postgres;

--
-- Name: producto_ingrediente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producto_ingrediente (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_producto character varying,
    descripcion character varying,
    key_producto_ingrediente character varying,
    cantidad double precision,
    precio_compra double precision,
    key_asiento character varying,
    tipo character varying
);


ALTER TABLE public.producto_ingrediente OWNER TO postgres;

--
-- Name: COLUMN producto_ingrediente.tipo; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.producto_ingrediente.tipo IS 'ingreso
salida';


--
-- Name: producto_inventario_dato; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producto_inventario_dato (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    key_producto character varying,
    key_inventario_dato character varying
);


ALTER TABLE public.producto_inventario_dato OWNER TO postgres;

--
-- Name: producto_modelo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producto_modelo (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_modelo character varying,
    key_producto character varying,
    cantidad double precision
);


ALTER TABLE public.producto_modelo OWNER TO postgres;

--
-- Name: proveedor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proveedor (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    razon_social character varying,
    nit character varying,
    nombre character varying,
    telefono character varying,
    key_cuenta_contable character varying,
    key_empresa character varying
);


ALTER TABLE public.proveedor OWNER TO postgres;

--
-- Name: receta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.receta (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_modelo character varying,
    key_ingrediente character varying,
    is_required boolean,
    cantidad double precision
);


ALTER TABLE public.receta OWNER TO postgres;

--
-- Name: sub_producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sub_producto (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_producto character varying,
    descripcion character varying,
    nombre character varying,
    cantidad_seleccion integer,
    index integer,
    cantidad_seleccion_minima integer
);


ALTER TABLE public.sub_producto OWNER TO postgres;

--
-- Name: TABLE sub_producto; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.sub_producto IS 'los valores de la columna estado:
-1 = dehabilitado.
0 = eliminado.
1 = habilitado.';


--
-- Name: sub_producto_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sub_producto_detalle (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_sub_producto character varying,
    descripcion character varying,
    nombre character varying,
    precio double precision,
    index integer,
    fecha_habilitacion_automatica timestamp without time zone,
    accion_habilitacion_automatica integer,
    sku character varying
);


ALTER TABLE public.sub_producto_detalle OWNER TO postgres;

--
-- Name: TABLE sub_producto_detalle; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.sub_producto_detalle IS 'los valores de la columna estado:
-1 = dehabilitado.
0 = eliminado.
1 = habilitado.';


--
-- Name: suscripcion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suscripcion (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_cliente character varying,
    key_producto character varying,
    descripcion character varying,
    fecha_inicio timestamp without time zone,
    fecha_fin timestamp without time zone,
    key_sucursal character varying
);


ALTER TABLE public.suscripcion OWNER TO postgres;

--
-- Name: tag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tag (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_empresa character varying,
    descripcion character varying,
    nombre character varying,
    color character varying
);


ALTER TABLE public.tag OWNER TO postgres;

--
-- Name: tipo_costo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_costo (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    key_empresa character varying,
    descripcion character varying,
    key_tipo_pago character varying,
    key_modelo_compra character varying
);


ALTER TABLE public.tipo_costo OWNER TO postgres;

--
-- Name: tipo_producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_producto (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    key_servicio character varying,
    key_cuenta_contable character varying,
    color character varying,
    key_empresa character varying,
    tipo character varying,
    key_cuenta_contable_ganancia character varying,
    key_cuenta_contable_costo character varying,
    key_cuenta_contable_depreciacion_activo character varying,
    key_cuenta_contable_depreciacion_gasto character varying,
    vida_util double precision,
    codigo_facturacion character varying,
    unidad_medida_facturacion character varying
);


ALTER TABLE public.tipo_producto OWNER TO postgres;

--
-- Name: tipo_producto_custom; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_producto_custom (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone DEFAULT now(),
    estado integer DEFAULT 1,
    descripcion character varying,
    data json,
    key_empresa character varying
);


ALTER TABLE public.tipo_producto_custom OWNER TO postgres;

--
-- Name: tipo_producto_inventario_dato; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_producto_inventario_dato (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    key_inventario_dato character varying,
    key_tipo_producto character varying,
    requerido boolean
);


ALTER TABLE public.tipo_producto_inventario_dato OWNER TO postgres;

--
-- Name: unidad_medida; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.unidad_medida (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    acronimo character varying,
    key_servicio character varying
);


ALTER TABLE public.unidad_medida OWNER TO postgres;

--
-- Name: v_resp; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.v_resp (
    array_to_json json
);


ALTER TABLE public.v_resp OWNER TO postgres;

--
-- Name: v_stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.v_stock (
    "coalesce" double precision
);


ALTER TABLE public.v_stock OWNER TO postgres;

--
-- Name: almacen almacen_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacen
    ADD CONSTRAINT almacen_pkey PRIMARY KEY (key);


--
-- Name: almacen_producto almacen_producto_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacen_producto
    ADD CONSTRAINT almacen_producto_key PRIMARY KEY (key);


--
-- Name: asistencia asistencia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencia
    ADD CONSTRAINT asistencia_pkey PRIMARY KEY (key);


--
-- Name: unidad_medida aunidad_medida_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidad_medida
    ADD CONSTRAINT aunidad_medida_pkey PRIMARY KEY (key);


--
-- Name: categoria_producto categoria_producto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria_producto
    ADD CONSTRAINT categoria_producto_pkey PRIMARY KEY (key);


--
-- Name: conteo_manual_inventario conteo_manual_inventario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conteo_manual_inventario
    ADD CONSTRAINT conteo_manual_inventario_pkey PRIMARY KEY (key);


--
-- Name: historial_traspaso historial_traspaso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_traspaso
    ADD CONSTRAINT historial_traspaso_pkey PRIMARY KEY (key);


--
-- Name: ingrediente ingrediente_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingrediente
    ADD CONSTRAINT ingrediente_key PRIMARY KEY (key);


--
-- Name: inventario_cardex inventario_cardex_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_cardex
    ADD CONSTRAINT inventario_cardex_pkey PRIMARY KEY (key);


--
-- Name: inventario_dato inventario_dato_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_dato
    ADD CONSTRAINT inventario_dato_pkey PRIMARY KEY (key);


--
-- Name: marca marca_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marca
    ADD CONSTRAINT marca_pkey PRIMARY KEY (key);


--
-- Name: modelo_cliente modelo_cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modelo_cliente
    ADD CONSTRAINT modelo_cliente_pkey PRIMARY KEY (key);


--
-- Name: modelo modelo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modelo
    ADD CONSTRAINT modelo_pkey PRIMARY KEY (key);


--
-- Name: modelo_proveedor modelo_proveedor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modelo_proveedor
    ADD CONSTRAINT modelo_proveedor_pkey PRIMARY KEY (key);


--
-- Name: modelo_tag modelo_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modelo_tag
    ADD CONSTRAINT modelo_tag_pkey PRIMARY KEY (key);


--
-- Name: producto_entrega producto_entrega_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_entrega
    ADD CONSTRAINT producto_entrega_pkey PRIMARY KEY (key);


--
-- Name: producto_historico producto_historico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_historico
    ADD CONSTRAINT producto_historico_pkey PRIMARY KEY (key);


--
-- Name: modelo_ingrediente producto_ingrediente_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modelo_ingrediente
    ADD CONSTRAINT producto_ingrediente_key PRIMARY KEY (key);


--
-- Name: producto_inventario_dato producto_inventario_dato_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_inventario_dato
    ADD CONSTRAINT producto_inventario_dato_pkey PRIMARY KEY (key);


--
-- Name: producto_modelo producto_modelo_ingrediente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_modelo
    ADD CONSTRAINT producto_modelo_ingrediente_pkey PRIMARY KEY (key);


--
-- Name: producto producto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_pkey PRIMARY KEY (key);


--
-- Name: producto_ingrediente producto_utilizado_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_ingrediente
    ADD CONSTRAINT producto_utilizado_key PRIMARY KEY (key);


--
-- Name: proveedor proveedor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedor
    ADD CONSTRAINT proveedor_pkey PRIMARY KEY (key);


--
-- Name: receta receta_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receta
    ADD CONSTRAINT receta_key PRIMARY KEY (key);


--
-- Name: sub_producto_detalle sub_producto_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_producto_detalle
    ADD CONSTRAINT sub_producto_detalle_pkey PRIMARY KEY (key);


--
-- Name: sub_producto sub_producto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_producto
    ADD CONSTRAINT sub_producto_pkey PRIMARY KEY (key);


--
-- Name: suscripcion suscripcion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suscripcion
    ADD CONSTRAINT suscripcion_pkey PRIMARY KEY (key);


--
-- Name: tag tag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_pkey PRIMARY KEY (key);


--
-- Name: tipo_costo tipo_costo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_costo
    ADD CONSTRAINT tipo_costo_pkey PRIMARY KEY (key);


--
-- Name: tipo_producto_custom tipo_producto_custom_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_producto_custom
    ADD CONSTRAINT tipo_producto_custom_pkey PRIMARY KEY (key);


--
-- Name: tipo_producto_inventario_dato tipo_producto_inventario_dato_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_producto_inventario_dato
    ADD CONSTRAINT tipo_producto_inventario_dato_pkey PRIMARY KEY (key);


--
-- Name: tipo_producto tipo_producto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_producto
    ADD CONSTRAINT tipo_producto_pkey PRIMARY KEY (key);


--
-- Name: fki_c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_c ON public.modelo_proveedor USING btree (key_modelo);


--
-- Name: fki_fk_key_almacen_inventario_cardex; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_almacen_inventario_cardex ON public.inventario_cardex USING btree (key_almacen);


--
-- Name: fki_fk_key_conteo_manual_inventario_inventario_cardex; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_conteo_manual_inventario_inventario_cardex ON public.inventario_cardex USING btree (key_conteo_manual_inventario);


--
-- Name: fki_fk_key_producto_inventario_cardex; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_producto_inventario_cardex ON public.inventario_cardex USING btree (key_producto);


--
-- Name: fki_fk_key_producto_sub_producto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_producto_sub_producto ON public.sub_producto USING btree (key_producto);


--
-- Name: fki_fk_key_proveedor_modelo_proveedor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_proveedor_modelo_proveedor ON public.modelo_proveedor USING btree (key_proveedor);


--
-- Name: fki_fk_key_sub_producto_sub_producto_detalle; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_key_sub_producto_sub_producto_detalle ON public.sub_producto_detalle USING btree (key_sub_producto);


--
-- Name: fki_key_modelo_modelo_cliente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_key_modelo_modelo_cliente ON public.modelo_cliente USING btree (key_modelo);


--
-- Name: almacen_producto fk_almacen_producto_key_almacen; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacen_producto
    ADD CONSTRAINT fk_almacen_producto_key_almacen FOREIGN KEY (key_almacen) REFERENCES public.almacen(key) NOT VALID;


--
-- Name: almacen_producto fk_almacen_producto_key_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacen_producto
    ADD CONSTRAINT fk_almacen_producto_key_producto FOREIGN KEY (key_producto) REFERENCES public.producto(key) NOT VALID;


--
-- Name: inventario_cardex fk_key_almacen_inventario_cardex; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_cardex
    ADD CONSTRAINT fk_key_almacen_inventario_cardex FOREIGN KEY (key_almacen) REFERENCES public.almacen(key) NOT VALID;


--
-- Name: inventario_cardex fk_key_conteo_manual_inventario_inventario_cardex; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_cardex
    ADD CONSTRAINT fk_key_conteo_manual_inventario_inventario_cardex FOREIGN KEY (key_conteo_manual_inventario) REFERENCES public.conteo_manual_inventario(key) NOT VALID;


--
-- Name: modelo_cliente fk_key_modelo_modelo_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modelo_cliente
    ADD CONSTRAINT fk_key_modelo_modelo_cliente FOREIGN KEY (key_modelo) REFERENCES public.modelo(key);


--
-- Name: modelo_proveedor fk_key_modelo_modelo_proveedor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modelo_proveedor
    ADD CONSTRAINT fk_key_modelo_modelo_proveedor FOREIGN KEY (key_modelo) REFERENCES public.modelo(key) NOT VALID;


--
-- Name: producto_ingrediente fk_key_producto_ingrediente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_ingrediente
    ADD CONSTRAINT fk_key_producto_ingrediente FOREIGN KEY (key_producto_ingrediente) REFERENCES public.producto(key) NOT VALID;


--
-- Name: inventario_cardex fk_key_producto_inventario_cardex; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_cardex
    ADD CONSTRAINT fk_key_producto_inventario_cardex FOREIGN KEY (key_producto) REFERENCES public.producto(key) NOT VALID;


--
-- Name: sub_producto fk_key_producto_sub_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_producto
    ADD CONSTRAINT fk_key_producto_sub_producto FOREIGN KEY (key_producto) REFERENCES public.producto(key);


--
-- Name: sub_producto_detalle fk_key_sub_producto_sub_producto_detalle; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_producto_detalle
    ADD CONSTRAINT fk_key_sub_producto_sub_producto_detalle FOREIGN KEY (key_sub_producto) REFERENCES public.sub_producto(key);


--
-- Name: modelo_ingrediente fk_modelo_ingrediente_key_ingrediente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modelo_ingrediente
    ADD CONSTRAINT fk_modelo_ingrediente_key_ingrediente FOREIGN KEY (key_ingrediente) REFERENCES public.ingrediente(key);


--
-- Name: modelo_ingrediente fk_modelo_ingrediente_key_modelo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modelo_ingrediente
    ADD CONSTRAINT fk_modelo_ingrediente_key_modelo FOREIGN KEY (key_modelo) REFERENCES public.modelo(key);


--
-- Name: modelo fk_modelo_key_tipo_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modelo
    ADD CONSTRAINT fk_modelo_key_tipo_producto FOREIGN KEY (key_tipo_producto) REFERENCES public.tipo_producto(key) NOT VALID;


--
-- Name: producto_entrega fk_producto_entrega_key_almacen; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_entrega
    ADD CONSTRAINT fk_producto_entrega_key_almacen FOREIGN KEY (key_almacen) REFERENCES public.almacen(key) NOT VALID;


--
-- Name: producto_entrega fk_producto_entrega_key_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_entrega
    ADD CONSTRAINT fk_producto_entrega_key_producto FOREIGN KEY (key_producto) REFERENCES public.producto(key) NOT VALID;


--
-- Name: producto_historico fk_producto_historico_key_almacen; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_historico
    ADD CONSTRAINT fk_producto_historico_key_almacen FOREIGN KEY (key_almacen) REFERENCES public.almacen(key);


--
-- Name: producto_historico fk_producto_historico_key_modelo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_historico
    ADD CONSTRAINT fk_producto_historico_key_modelo FOREIGN KEY (key_modelo) REFERENCES public.modelo(key);


--
-- Name: producto_historico fk_producto_historico_key_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_historico
    ADD CONSTRAINT fk_producto_historico_key_producto FOREIGN KEY (key_producto) REFERENCES public.producto(key);


--
-- Name: producto_inventario_dato fk_producto_inventario_dato_key_inventario_dato; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_inventario_dato
    ADD CONSTRAINT fk_producto_inventario_dato_key_inventario_dato FOREIGN KEY (key_inventario_dato) REFERENCES public.inventario_dato(key);


--
-- Name: producto_inventario_dato fk_producto_inventario_dato_key_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_inventario_dato
    ADD CONSTRAINT fk_producto_inventario_dato_key_producto FOREIGN KEY (key_producto) REFERENCES public.producto(key);


--
-- Name: producto fk_producto_key_categoria_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT fk_producto_key_categoria_producto FOREIGN KEY (key_categoria_producto) REFERENCES public.categoria_producto(key) NOT VALID;


--
-- Name: producto fk_producto_key_modelo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT fk_producto_key_modelo FOREIGN KEY (key_modelo) REFERENCES public.modelo(key);


--
-- Name: producto_modelo fk_producto_modelo_key_modelo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_modelo
    ADD CONSTRAINT fk_producto_modelo_key_modelo FOREIGN KEY (key_modelo) REFERENCES public.modelo(key) NOT VALID;


--
-- Name: producto_modelo fk_producto_modelo_key_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_modelo
    ADD CONSTRAINT fk_producto_modelo_key_producto FOREIGN KEY (key_producto) REFERENCES public.producto(key);


--
-- Name: producto_ingrediente fk_producto_utilizado_key_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_ingrediente
    ADD CONSTRAINT fk_producto_utilizado_key_producto FOREIGN KEY (key_producto) REFERENCES public.producto(key);


--
-- Name: receta fk_receta_key_ingrediente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receta
    ADD CONSTRAINT fk_receta_key_ingrediente FOREIGN KEY (key_ingrediente) REFERENCES public.ingrediente(key);


--
-- Name: receta fk_receta_key_modelo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receta
    ADD CONSTRAINT fk_receta_key_modelo FOREIGN KEY (key_modelo) REFERENCES public.modelo(key);


--
-- Name: tipo_producto_inventario_dato fk_tipo_producto_inventario_dato_key_inventario_dato; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_producto_inventario_dato
    ADD CONSTRAINT fk_tipo_producto_inventario_dato_key_inventario_dato FOREIGN KEY (key_inventario_dato) REFERENCES public.inventario_dato(key);


--
-- Name: tipo_producto_inventario_dato fk_tipo_producto_inventario_dato_key_tipo_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_producto_inventario_dato
    ADD CONSTRAINT fk_tipo_producto_inventario_dato_key_tipo_producto FOREIGN KEY (key_tipo_producto) REFERENCES public.tipo_producto(key);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict Ka6RnnHe1MB4Iz5RCc8fqInuJeKvFkfgRzkGrFh14ehyckvNCnUmm3ds4QF9Ac2

