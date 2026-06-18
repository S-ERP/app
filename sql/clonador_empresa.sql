-- FUNCTION: public.clonador(character varying, character varying)

-- DROP FUNCTION IF EXISTS public.clonador(character varying, character varying);

CREATE OR REPLACE FUNCTION public.clonador(
	_key_empresa_from character varying,
	_key_empresa_to character varying,
    _nuevo_nombre character varying
    )
    RETURNS json
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    v_exists          integer;
    v_tabla           text;
    v_counts          jsonb := '{}';
    v_result          jsonb;
    v_reemplazos_hija jsonb;
    v_old_suc_key     varchar;
    v_new_suc_key     varchar;
    v_old_pv_key      varchar;
    v_new_pv_key      varchar;
    v_old_mon_key     varchar;
    v_new_mon_key     varchar;
    v_mapeo_mon       jsonb := '{}';  -- mapeo old_key → new_key de empresa_moneda
    v_mapeo_suc       jsonb := '{}';  -- mapeo old_key → new_key de sucursal
    v_mapeo_pv        jsonb := '{}';  -- mapeo old_key → new_key de punto_venta
    n_empresa_moneda  integer := 0;
    n_sucursal        integer := 0;
    n_punto_venta     integer := 0;
BEGIN
    -- Verificar que la empresa origen existe
    SELECT COUNT(*) INTO v_exists FROM empresa WHERE key = _key_empresa_from;
    IF v_exists = 0 THEN
        RETURN json_build_object('status', 'error', 'mensaje', 'key_empresa_from "' || _key_empresa_from || '" no existe');
    END IF;

    -- Verificar que la empresa destino NO existe ya
    SELECT COUNT(*) INTO v_exists FROM empresa WHERE key = _key_empresa_to;
    IF v_exists > 0 THEN
        RETURN json_build_object('status', 'error', 'mensaje', 'key_empresa_to "' || _key_empresa_to || '" ya existe');
    END IF;

    -- Clonar empresa (su PK "key" toma el nuevo valor directamente)
    PERFORM public.clonar_tabla(
        'empresa', 'key', _key_empresa_from,
        jsonb_build_object('key', _key_empresa_to, 'razon_social', _nuevo_nombre)
    );

    -- Clonar empresa_usuario (batch simple, no tiene hijos)
    v_reemplazos_hija := jsonb_build_object('key', NULL, 'key_empresa', _key_empresa_to);
    SELECT public.clonar_tabla('empresa_usuario', 'key_empresa', _key_empresa_from, v_reemplazos_hija)::jsonb
    INTO v_result;
    v_counts := v_counts || jsonb_build_object('empresa_usuario', v_result->'filas');

    -- Clonar empresa_moneda fila a fila para capturar el mapeo
    -- (caja.empresa_tipo_pago.key_moneda referencia estas filas)
    FOR v_old_mon_key IN
        SELECT key FROM empresa_moneda WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_mon_key := md5(random()::text || clock_timestamp()::text);

        PERFORM public.clonar_tabla('empresa_moneda', 'key', v_old_mon_key,
            jsonb_build_object('key', v_new_mon_key, 'key_empresa', _key_empresa_to));

        v_mapeo_mon := v_mapeo_mon || jsonb_build_object(v_old_mon_key, v_new_mon_key);
        n_empresa_moneda := n_empresa_moneda + 1;
    END LOOP;

    -- Clonar sucursal fila a fila; luego punto_venta también fila a fila
    -- para capturar el mapeo old_key → new_key de punto_venta
    FOR v_old_suc_key IN
        SELECT key FROM sucursal WHERE key_empresa = _key_empresa_from
    LOOP
        v_new_suc_key := md5(random()::text || clock_timestamp()::text);

        PERFORM public.clonar_tabla('sucursal', 'key', v_old_suc_key,
            jsonb_build_object('key', v_new_suc_key, 'key_empresa', _key_empresa_to));
        v_mapeo_suc := v_mapeo_suc || jsonb_build_object(v_old_suc_key, v_new_suc_key);
        n_sucursal := n_sucursal + 1;

        FOR v_old_pv_key IN
            SELECT key FROM punto_venta WHERE key_sucursal = v_old_suc_key
        LOOP
            v_new_pv_key := md5(random()::text || clock_timestamp()::text);

            PERFORM public.clonar_tabla('punto_venta', 'key', v_old_pv_key,
                jsonb_build_object('key', v_new_pv_key, 'key_sucursal', v_new_suc_key));

            v_mapeo_pv := v_mapeo_pv || jsonb_build_object(v_old_pv_key, v_new_pv_key);
            n_punto_venta := n_punto_venta + 1;
        END LOOP;
    END LOOP;

    v_counts := v_counts
        || jsonb_build_object('empresa_moneda', n_empresa_moneda)
        || jsonb_build_object('sucursal',       n_sucursal)
        || jsonb_build_object('punto_venta',    n_punto_venta);

    RETURN json_build_object(
        'status',   'ok',
        'mensaje',  'empresa "' || _key_empresa_from || '" clonada como "' || _key_empresa_to || '"',
        'clonados', v_counts,
        'mapeo',    json_build_object(
            'empresa_moneda', v_mapeo_mon,
            'sucursal',       v_mapeo_suc,
            'punto_venta',    v_mapeo_pv
        )
    );
END;
$BODY$;

ALTER FUNCTION public.clonador(character varying, character varying)
    OWNER TO postgres;

