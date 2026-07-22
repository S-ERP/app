--
-- Name: get_clientes_suscripcion_activa(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--
-- Devuelve la lista de clientes (key_cliente) que tienen al menos una
-- suscripcion activa para la empresa indicada, opcionalmente filtrando
-- por sucursal.
--
-- "Activa" = estado > 0  AND  fecha_inicio <= now()  AND  (fecha_fin IS NULL OR fecha_fin >= now())
--
-- _key_sucursal: si se pasa NULL (default), trae todas las sucursales.
--                si se pasa un key, filtra por suscripcion.key_sucursal.
--
-- No hace join contra una tabla "cliente" porque esa tabla no vive en
-- caja / compra_venta / inventario: se devuelve key_cliente tal cual,
-- junto al detalle de cada suscripcion + producto/modelo asociado.
--

CREATE OR REPLACE FUNCTION public.get_clientes_suscripcion_activa(
    _key_empresa character varying,
    _key_sucursal character varying DEFAULT NULL::character varying
)
RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    resultado json;
BEGIN
    SELECT COALESCE(json_agg(sq), '[]'::json)
    INTO resultado
    FROM (
        SELECT
            s.key_cliente,
            COUNT(s.key)              AS cantidad_suscripciones_activas,
            MIN(s.fecha_inicio)       AS primera_suscripcion,
            MAX(s.fecha_fin)          AS ultima_fecha_fin,
            json_agg(
                json_build_object(
                    'key_suscripcion', s.key,
                    'descripcion',     s.descripcion,
                    'fecha_inicio',    s.fecha_inicio,
                    'fecha_fin',       s.fecha_fin,
                    'key_sucursal',    s.key_sucursal,
                    'key_producto',    p.key,
                    'producto',        p.nombre,
                    'precio',          p.precio,
                    'key_modelo',      m.key,
                    'modelo',          m.descripcion,
                    'key_marca',       mar.key,
                    'marca',           mar.descripcion,
                    'key_tipo_producto', tipo_pro.key,
                    'tipo_producto',   tipo_pro.descripcion
                )
                ORDER BY s.fecha_inicio DESC
            ) AS suscripciones
        FROM suscripcion s
        INNER JOIN producto p       ON s.key_producto = p.key
        LEFT JOIN modelo m          ON p.key_modelo = m.key
        LEFT JOIN marca mar         ON m.key_marca = mar.key
        LEFT JOIN tipo_producto tipo_pro ON m.key_tipo_producto = tipo_pro.key
        WHERE s.estado > 0
          AND p.key_empresa = _key_empresa
          AND s.key_cliente IS NOT NULL
          AND s.fecha_inicio <= now()
          AND (s.fecha_fin IS NULL OR s.fecha_fin >= now())
          AND (
                _key_sucursal IS NULL
                OR s.key_sucursal = _key_sucursal
          )
        GROUP BY s.key_cliente
        ORDER BY MAX(s.fecha_inicio) DESC
    ) sq;

    RETURN resultado;
END;
$$;

ALTER FUNCTION public.get_clientes_suscripcion_activa(character varying, character varying) OWNER TO postgres;
