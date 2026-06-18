-- FUNCTION: public.clonador(character varying, character varying, json, json)

-- DROP FUNCTION IF EXISTS public.clonador(character varying, character varying, json, json);

CREATE OR REPLACE FUNCTION public.clonador(
	_key_empresa_from character varying,
	_key_empresa_to character varying,
	_respuesta_empresa      json DEFAULT NULL::json,
	_respuesta_contabilidad json DEFAULT NULL::json)
    RETURNS json
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
$BODY$;

ALTER FUNCTION public.clonador(character varying, character varying, json, json)
    OWNER TO postgres;

