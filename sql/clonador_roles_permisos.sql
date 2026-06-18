-- FUNCTION: public.clonador(character varying, character varying)

-- DROP FUNCTION IF EXISTS public.clonador(character varying, character varying);

CREATE OR REPLACE FUNCTION public.clonador(
	_key_empresa_from character varying,
	_key_empresa_to character varying)
    RETURNS json
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    v_old_rol_key  varchar;
    v_new_rol_key  varchar;
    v_result       jsonb;
    n_rol          integer := 0;
    n_rol_permiso  integer := 0;
    n_usuario_rol  integer := 0;
BEGIN
    -- Iterar sobre cada rol de la empresa origen
    FOR v_old_rol_key IN
        SELECT key FROM rol WHERE key_empresa = _key_empresa_from
    LOOP
        -- Generar nuevo key para este rol externamente
        -- para poder usarlo luego en las tablas hijas
        v_new_rol_key := md5(random()::text || clock_timestamp()::text);

        -- Clonar el rol: reemplaza key y key_empresa con los nuevos valores
        PERFORM public.clonar_tabla('rol', 'key', v_old_rol_key,
            jsonb_build_object('key', v_new_rol_key, 'key_empresa', _key_empresa_to));
        n_rol := n_rol + 1;

        -- Clonar rol_permiso: nuevo key por fila, key_rol apunta al nuevo rol
        SELECT public.clonar_tabla('rol_permiso', 'key_rol', v_old_rol_key,
            jsonb_build_object('key', NULL, 'key_rol', v_new_rol_key))::jsonb
        INTO v_result;
        n_rol_permiso := n_rol_permiso + (v_result->>'filas')::integer;

        -- Clonar usuario_rol: nuevo key por fila, key_rol apunta al nuevo rol
        SELECT public.clonar_tabla('usuario_rol', 'key_rol', v_old_rol_key,
            jsonb_build_object('key', NULL, 'key_rol', v_new_rol_key))::jsonb
        INTO v_result;
        n_usuario_rol := n_usuario_rol + (v_result->>'filas')::integer;
    END LOOP;

    RETURN json_build_object(
        'status',   'ok',
        'mensaje',  'roles de empresa "' || _key_empresa_from || '" clonados a "' || _key_empresa_to || '"',
        'clonados', jsonb_build_object(
            'rol',         n_rol,
            'rol_permiso', n_rol_permiso,
            'usuario_rol', n_usuario_rol
        )
    );
END;
$BODY$;

ALTER FUNCTION public.clonador(character varying, character varying)
    OWNER TO postgres;

