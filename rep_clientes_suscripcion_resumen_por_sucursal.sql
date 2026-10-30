-- Versión corregida de get_clientes_suscripcion_resumen_por_sucursal_filtro_fecha (servisofts.inventario).
-- activos     = clientes con alguna suscripción vigente en el rango.
-- nuevos      = clientes cuya PRIMERA suscripción (en toda la empresa) empieza dentro del rango.
-- reactivados = clientes con una suscripción que empieza dentro del rango y que
--               había quedado más de 1 día sin cobertura desde la anterior.
CREATE OR REPLACE FUNCTION public.rep_clientes_suscripcion_resumen_por_sucursal(
    _key_empresa character varying,
    _key_sucursal character varying DEFAULT NULL,
    _fecha_inicio timestamp without time zone DEFAULT NULL,
    _fecha_fin timestamp without time zone DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
AS $function$
DECLARE
    resultado json;
BEGIN

WITH suscripciones AS (
    SELECT
        s.key_cliente,
        s.key_sucursal,
        s.fecha_inicio,
        s.fecha_fin,
        MIN(s.fecha_inicio) OVER (PARTITION BY s.key_cliente) AS primera_suscripcion,
        LAG(s.fecha_fin) OVER (PARTITION BY s.key_cliente ORDER BY s.fecha_inicio) AS fecha_fin_anterior
    FROM suscripcion s
    INNER JOIN producto p ON p.key = s.key_producto
    WHERE s.estado > 0
      AND p.key_empresa = _key_empresa
      AND s.key_cliente IS NOT NULL
), filtradas AS (
    SELECT *,
        (_fecha_inicio IS NULL OR fecha_inicio::date >= _fecha_inicio::date)
        AND (_fecha_fin IS NULL OR fecha_inicio::date <= _fecha_fin::date) AS empieza_en_rango
    FROM suscripciones
    WHERE (_key_sucursal IS NULL OR key_sucursal = _key_sucursal)
      AND (_fecha_inicio IS NULL OR fecha_fin IS NULL OR fecha_fin::date >= _fecha_inicio::date)
      AND (_fecha_fin IS NULL OR fecha_inicio::date <= _fecha_fin::date)
)
SELECT COALESCE(json_agg(x), '[]'::json)
INTO resultado
FROM (
    SELECT
        key_sucursal,
        COUNT(DISTINCT key_cliente) AS clientes_activos,
        COUNT(DISTINCT CASE
            WHEN empieza_en_rango AND primera_suscripcion = fecha_inicio
            THEN key_cliente
        END) AS nuevos_clientes,
        COUNT(DISTINCT CASE
            WHEN empieza_en_rango
             AND fecha_fin_anterior IS NOT NULL
             AND fecha_fin_anterior < (fecha_inicio - INTERVAL '1 day')
            THEN key_cliente
        END) AS clientes_reactivados
    FROM filtradas
    GROUP BY key_sucursal
    ORDER BY clientes_activos DESC
) x;

RETURN resultado;

END;
$function$;
