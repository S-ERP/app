--
-- Name: rep_dashboard_suscripciones_periodo(varchar, varchar, varchar); Schema: public; Owner: postgres
-- Base: servisofts.inventario  (host 192.168.5.39:5432)
--
-- Dashboard de Suscripciones con filtro de fechas (src/Pages/asistencia/dashboard.js).
-- Todas las metricas se calculan dentro del rango [_fecha_inicio, _fecha_fin] (formato 'YYYY-MM-DD').
--
--   activos        : suscripciones que estuvieron vigentes en algun momento del rango
--                    (fecha_inicio::date <= ff  AND  (fecha_fin IS NULL OR fecha_fin::date >= fi))
--   suscriptores   : clientes distintos de esas suscripciones activas
--   nuevos         : altas con fecha_inicio::date dentro del rango
--   vencen         : suscripciones con fecha_fin::date dentro del rango
--   vencen_hoy     : suscripciones (estado>0) cuya fecha_fin es hoy (independiente del rango)
--   por_sucursal   : [{ key_sucursal, suscripciones }] (count(*) sobre "activos"; 'sin' = key_sucursal NULL)
--   por_paquete    : [{ paquete, suscriptores }]       (sobre "activos"; modelo.descripcion)
--   por_dia        : [{ dia 'YYYY-MM-DD', nuevas }]    (altas por dia dentro del rango)
--
-- La suscripcion no tiene key_empresa: se filtra por producto.key_empresa.
-- Funcion de SOLO LECTURA. El endpoint inventario/reporte/execute_function espera un
-- JSON ARRAY, por eso el resultado va envuelto en json_build_array(...).
--
-- Deploy:
--   PGPASSWORD=servisofts psql -h 192.168.5.39 -p 5432 -U postgres -d servisofts.inventario \
--     -f rep_dashboard_suscripciones_periodo.sql
--
CREATE OR REPLACE FUNCTION public.rep_dashboard_suscripciones_periodo(
    _key_empresa   character varying,
    _fecha_inicio  character varying,
    _fecha_fin     character varying
)
RETURNS json
    LANGUAGE sql
    STABLE
    AS $func$
  WITH params AS (
    SELECT _fecha_inicio::date AS fi, _fecha_fin::date AS ff
  ),
  base AS (
    SELECT s.key, s.key_cliente, s.key_sucursal,
           s.fecha_inicio, s.fecha_fin,
           NULLIF(btrim(m.descripcion), '') AS paquete
    FROM suscripcion s
    JOIN producto p ON s.key_producto = p.key
    LEFT JOIN modelo m ON p.key_modelo = m.key
    WHERE p.key_empresa = _key_empresa
      AND s.estado > 0
  ),
  activos AS (
    SELECT b.*
    FROM base b, params
    WHERE b.fecha_inicio::date <= params.ff
      AND (b.fecha_fin IS NULL OR b.fecha_fin::date >= params.fi)
  )
  SELECT json_build_array(json_build_object(
    'activos',      (SELECT count(*)                       FROM activos),
    'suscriptores', (SELECT count(DISTINCT key_cliente)    FROM activos),
    'nuevos', (
      SELECT count(*) FROM base b, params
      WHERE b.fecha_inicio::date BETWEEN params.fi AND params.ff),
    'vencen', (
      SELECT count(*) FROM base b, params
      WHERE b.fecha_fin::date BETWEEN params.fi AND params.ff),
    'vencen_hoy', (
      SELECT count(*) FROM base b
      WHERE b.fecha_fin::date = current_date),
    'por_sucursal', (
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        SELECT COALESCE(key_sucursal, 'sin') AS key_sucursal,
               count(*)                        AS suscripciones
        FROM activos GROUP BY 1 ORDER BY suscripciones DESC
      ) t),
    'por_paquete', (
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        SELECT COALESCE(paquete, 'Sin paquete') AS paquete,
               count(DISTINCT key_cliente)       AS suscriptores
        FROM activos GROUP BY 1 ORDER BY suscriptores DESC
      ) t),
    'por_dia', (
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        SELECT to_char(b.fecha_inicio::date, 'YYYY-MM-DD') AS dia,
               count(*)                                     AS nuevas
        FROM base b, params
        WHERE b.fecha_inicio::date BETWEEN params.fi AND params.ff
        GROUP BY 1 ORDER BY 1
      ) t)
  ));
$func$;

ALTER FUNCTION public.rep_dashboard_suscripciones_periodo(character varying, character varying, character varying) OWNER TO postgres;
