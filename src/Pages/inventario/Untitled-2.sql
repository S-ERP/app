
    SELECT *
    FROM (
        WITH activos AS (
            -- SOLO usuarios con paquete activo
            SELECT DISTINCT key_usuario
            FROM paquete_venta_usuario
            WHERE estado > 0
              AND fecha_fin >= CURRENT_DATE
        ),

        ordenados AS (
            SELECT
                p.key_usuario,
                p.key_caja,
                p.fecha_inicio,
                p.fecha_fin,
                LAG(p.fecha_fin) OVER (
                    PARTITION BY p.key_usuario
                    ORDER BY p.fecha_inicio ASC
                ) AS fin_anterior
            FROM paquete_venta_usuario p
            JOIN activos a ON a.key_usuario = p.key_usuario
            WHERE p.estado > 0
             
        ),

        racha AS (
            SELECT *,
                CASE
                    WHEN fin_anterior IS NULL THEN 1
                    WHEN fecha_inicio <= fin_anterior + INTERVAL '7 days' THEN 1
                    ELSE 0
                END AS sigue
            FROM ordenados
        )

        SELECT
            r.key_usuario,
            COUNT(*)::INT AS total_consecutivos
        FROM racha r
        JOIN caja c ON r.key_caja = c.key
        WHERE sigue = 1
        GROUP BY
            r.key_usuario,
            s.descripcion
    ) x;