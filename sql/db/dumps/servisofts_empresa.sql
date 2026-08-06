--
-- PostgreSQL database dump
--

\restrict zO3D8i57OBJoM4hbJrhX82qO55uaSZpRI0cSbqm9NEP3lDOmgLfK8dpc9ttSnxB

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
-- Name: _get_turno_bykey(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_turno_bykey(_key_turno character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta character varying;
    s_consulta text;
BEGIN
    s_consulta := '
        SELECT row_to_json(resultado)::text AS json
        FROM (
            SELECT 
                t.key,
                t.nombre,
                t.atiende_feriado,
                t.key_usuario,
                t.key_empresa,
                t.estado,
                t.fecha_on,
                (
                    SELECT json_agg(
                        json_build_object(
                            ''key'', ha.key,
                            ''dia'', ha.dia,
                            ''hora_inicio'', to_char(ha.hora_inicio, ''HH24:MI''),
                            ''hora_fin'', to_char(ha.hora_fin, ''HH24:MI''),
                            ''fecha_on'', ha.fecha_on::text
                        )
                    )
                    FROM horario_atencion ha
                    WHERE ha.key_turno = t.key AND ha.estado = 1
                ) AS horarios
            FROM turno t
            WHERE t.key = ''' || _key_turno || ''' AND t.estado = 1
        ) resultado;
    ';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public._get_turno_bykey(_key_turno character varying) OWNER TO postgres;

--
-- Name: _get_turno_horarios_atencion(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_turno_horarios_atencion(_key_empresa character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta character varying;
    s_consulta text;
BEGIN
        
		SELECT jsonb_object_agg(turno.key, turno)::text as json
		INTO respuesta
        FROM (
			SELECT turno.* , (
				SELECT array_to_json(array_agg(horario_atencion.*))
				FROM horario_atencion
				WHERE horario_atencion.key_turno = turno.key
				AND horario_atencion.estado > 0
			) as horario_atencion
			FROM turno 
	        WHERE turno.estado = 1
    	    AND turno.key_empresa = _key_empresa
	        GROUP BY turno.key
		) turno;
	

    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public._get_turno_horarios_atencion(_key_empresa character varying) OWNER TO postgres;

--
-- Name: _get_turno_horarios_atencion_borrador(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_turno_horarios_atencion_borrador(_key_empresa character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta character varying;
    s_consulta text;
BEGIN
    s_consulta := E'
        SELECT jsonb_object_agg(sq.usuario, to_jsonb(sq.data))::text AS json
        FROM (
            SELECT ha.key_usuario AS usuario,
                json_agg(jsonb_build_object(
                    ''dia'', ha.dia,
                    ''nombre_dia'', CASE ha.dia
                        WHEN 0 THEN ''Domingo''
                        WHEN 1 THEN ''Lunes''
                        WHEN 2 THEN ''Martes''
                        WHEN 3 THEN ''Miércoles''
                        WHEN 4 THEN ''Jueves''
                        WHEN 5 THEN ''Viernes''
                        WHEN 6 THEN ''Sábado''
                        ELSE ''Desconocido''
                    END,
                    ''horario'', to_char(ha.hora_inicio, ''HH24:MI'') || '' - '' || to_char(ha.hora_fin::time, ''HH24:MI''),
                    ''nombre'', t.nombre,
                    ''key'', t.key,

''atiende_feriado'', CASE WHEN t.atiende_feriado = 1 THEN ''Sí'' ELSE ''No'' END,
                    ''registrado_el'', ha.fecha_on::date
                )) AS data
            FROM horario_atencion ha
            LEFT JOIN turno t ON ha.key_turno = t.key
            WHERE  t.estado = 1
              AND t.key_empresa = ''' || _key_empresa || ''' 
            GROUP BY ha.key_usuario
        ) sq;
    ';

    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public._get_turno_horarios_atencion_borrador(_key_empresa character varying) OWNER TO postgres;

--
-- Name: _get_turno_horarios_atencion_by_cliente(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._get_turno_horarios_atencion_by_cliente(_key_empresa character varying, _key_cliente character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    respuesta character varying;
    s_consulta text;
BEGIN
        
		SELECT jsonb_object_agg(turno.key, turno)::text as json
		INTO respuesta
        FROM (
			SELECT turno.* ,
				to_json(turno_cliente.*) as turno_cliente,
			 (
				SELECT array_to_json(array_agg(horario_atencion.*))
				FROM horario_atencion
				WHERE horario_atencion.key_turno = turno.key
				AND horario_atencion.estado > 0
			) as horario_atencion
			FROM turno 
			JOIN turno_cliente ON turno_cliente.key_turno = turno.key
	        WHERE turno.estado = 1
			AND turno_cliente.estado > 0
    	    AND turno.key_empresa = _key_empresa
			AND turno_cliente.key_cliente = _key_cliente
	        GROUP BY turno.key
		) turno;
	

    RETURN NEXT respuesta;
END;
$$;


ALTER FUNCTION public._get_turno_horarios_atencion_by_cliente(_key_empresa character varying, _key_cliente character varying) OWNER TO postgres;

--
-- Name: _registrar_turno_horarios_atencion(character varying, character varying, character varying, character varying, boolean, json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._registrar_turno_horarios_atencion(_key character varying, _key_usuario character varying, _key_empresa character varying, _nombre_turno character varying, _atiende_feriado boolean, _horarios json) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    h json;
BEGIN
    -- Insertar turno
    INSERT INTO public.turno (
        key, key_usuario, fecha_on, estado, nombre_turno, atiende_feriado, key_empresa
    )
    VALUES (
        _key, _key_usuario, now(), 1, _nombre_turno, _atiende_feriado, _key_empresa
    );

    -- Insertar horarios asociados
    FOR h IN SELECT * FROM json_array_elements(_horarios)
    LOOP
        INSERT INTO public.horario_atencion (
            key, key_usuario, fecha_on, estado, dia_semana, hora_inicio, hora_fin, key_turno
        )
        VALUES (
            h->>'key',
            _key_usuario,
            now(),
            1,
            (h->>'dia')::int,
            h->>'hora_inicio',
            h->>'hora_fin',
            _key
        );
    END LOOP;
END;
$$;


ALTER FUNCTION public._registrar_turno_horarios_atencion(_key character varying, _key_usuario character varying, _key_empresa character varying, _nombre_turno character varying, _atiende_feriado boolean, _horarios json) OWNER TO postgres;

--
-- Name: clonador(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clonador(_key_empresa_from character varying, _key_empresa_to character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
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
        jsonb_build_object('key', _key_empresa_to, 'razon_social', 'Nueva prueba clone 1')
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
$$;


ALTER FUNCTION public.clonador(_key_empresa_from character varying, _key_empresa_to character varying) OWNER TO postgres;

--
-- Name: clonador(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clonador(_key_empresa_from character varying, _key_empresa_to character varying, _nuevo_nombre character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.clonador(_key_empresa_from character varying, _key_empresa_to character varying, _nuevo_nombre character varying) OWNER TO postgres;

--
-- Name: clonador_caja(character varying, character varying, json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clonador_caja(_key_empresa_from character varying, _key_empresa_to character varying, _respuesta_empresa json DEFAULT NULL::json) RETURNS json
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


ALTER FUNCTION public.clonador_caja(_key_empresa_from character varying, _key_empresa_to character varying, _respuesta_empresa json) OWNER TO postgres;

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
-- Name: empresa_by_key_full_detail(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.empresa_by_key_full_detail(_key_empresa character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' 

					SELECT to_json(tabla.*) as json
					from (
						SELECT
							e.*,
							(
								SELECT json_agg(s)
								FROM (
									SELECT
										s.*,
										(
											SELECT json_agg(pv)
											FROM (
												SELECT 
													punto_venta.*
												FROM punto_venta
												WHERE punto_venta.key_sucursal = s.key AND punto_venta.estado > 0												
											) pv
										) AS puntos_venta
									FROM sucursal s
									WHERE s.key_empresa = e.key AND s.estado > 0
								) s
							) AS sucursales,
							(
								SELECT json_agg(em)
								FROM empresa_moneda em
								WHERE em.key_empresa = e.key AND em.estado > 0
							) AS monedas,
							(
								SELECT json_agg(em)
								FROM unidad_negocio em
								WHERE em.key_empresa = e.key AND em.estado > 0
							) AS unidad_negocio
						FROM empresa e
						WHERE e.key = \''||_key_empresa||E'\'
					) tabla

';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.empresa_by_key_full_detail(_key_empresa character varying) OWNER TO postgres;

--
-- Name: empresas_get_all(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.empresas_get_all(_key_usuario character varying) RETURNS SETOF character varying
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
				
				     SELECT empresa_usuario.*,
					MAX(empresa_usuario_log.fecha_on) as fecha_ultima_visita,
							to_json(empresa.*) as empresa
							FROM empresa,
							empresa_usuario left JOIN empresa_usuario_log ON empresa_usuario.key = empresa_usuario_log.key_empresa_usuario
							WHERE empresa.estado > 0
							and empresa_usuario.key_empresa = empresa.key
							and empresa_usuario.key_usuario = \''||_key_usuario||E'\'
							and empresa_usuario.estado > 0

						GROUP BY empresa_usuario.key , empresa.key
						order by fecha_ultima_visita desc
             
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.empresas_get_all(_key_usuario character varying) OWNER TO postgres;

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
-- Name: get_all(character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all(_nombre_tabla character varying, _key_valor character varying, _data_valor character varying, _key_valor1 character varying, _data_valor1 character varying) RETURNS SETOF character varying
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
					AND '||_nombre_tabla||E'.'||_key_valor1||E' = \''||_data_valor1||E'\'
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_all(_nombre_tabla character varying, _key_valor character varying, _data_valor character varying, _key_valor1 character varying, _data_valor1 character varying) OWNER TO postgres;

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
-- Name: get_moneda_detalle(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_moneda_detalle(_key_empresa character varying) RETURNS SETOF character varying
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
					select empresa_moneda_detalle.*
					from empresa_moneda_detalle,
					empresa_moneda
					where empresa_moneda.key = empresa_moneda_detalle.key_empresa_moneda
					and empresa_moneda.key_empresa = \''||_key_empresa||E'\'
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_moneda_detalle(_key_empresa character varying) OWNER TO postgres;

--
-- Name: get_punto_venta(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_punto_venta(_codigo_facturacion character varying, _key_sucursal character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT to_json(sq.*)::json as json 
				FROM (
					select punto_venta.*
					from punto_venta
					where punto_venta.codigo_facturacion = \''||_codigo_facturacion||E'\'
					and punto_venta.key_sucursal = \''||_key_sucursal||E'\'
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_punto_venta(_codigo_facturacion character varying, _key_sucursal character varying) OWNER TO postgres;

--
-- Name: get_sucursal(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_sucursal(_codigo_facturacion character varying, _key_empresa character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' SELECT to_json(sq.*)::json as json 
				FROM (
					select sucursal.*
					from sucursal
					where sucursal.codigo_facturacion = \''||_codigo_facturacion||E'\'
					and sucursal.key_empresa = \''||_key_empresa||E'\'
					and sucursal.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_sucursal(_codigo_facturacion character varying, _key_empresa character varying) OWNER TO postgres;

--
-- Name: get_sucursales(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_sucursales(_key_empresa character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E' 

					SELECT array_to_json(array_agg(tabla.*)) as json
					from (
					select sucursal.*,
					(
						select array_to_json(array_agg(punto_venta.*))as json
						from punto_venta
						where punto_venta.estado > 0
						and punto_venta.key_sucursal = sucursal.key
					) as punto_venta
					FROM sucursal
					WHERE sucursal.estado > 0
					and sucursal.key_empresa = \''||_key_empresa||E'\'
					) tabla

';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.get_sucursales(_key_empresa character varying) OWNER TO postgres;

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
-- Name: ordenar_paginas_visitas(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ordenar_paginas_visitas(_key_empresa character varying, _key_usuario character varying, _urls character varying) RETURNS SETOF character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    rec RECORD;
    respuesta character varying;
    distancia_permitida character varying;
    s_consulta character varying;
    cant_in integer;
BEGIN

s_consulta :=E'

SELECT array_to_json(array_agg(tabla_final.*))::json AS json
FROM (
    SELECT 
        rutas.url,
        COALESCE(SUM(CASE 
            WHEN empresa_usuario_log.data ->> \'url\' ILIKE \'%\' || rutas.url || \'%\' 
            THEN 1 ELSE 0 END), 0) AS count,
        MAX(CASE 
            WHEN empresa_usuario_log.data ->> \'url\' ILIKE \'%\' || rutas.url || \'%\' 
            THEN empresa_usuario_log.fecha_on 
            ELSE NULL END) AS ultima_visita
    FROM (
        SELECT value AS url
        FROM jsonb_array_elements_text(
            \''||_urls||E'\'::jsonb
        ) AS value
    ) rutas
    CROSS JOIN empresa_usuario
    LEFT JOIN empresa_usuario_log
        ON empresa_usuario.key = empresa_usuario_log.key_empresa_usuario
        AND empresa_usuario.key_empresa = \''||_key_empresa||E'\'
        AND empresa_usuario.key_usuario = \''||_key_usuario||E'\'
    GROUP BY rutas.url
	ORDER BY count DESC
	
) tabla_final

';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.ordenar_paginas_visitas(_key_empresa character varying, _key_usuario character varying, _urls character varying) OWNER TO postgres;

--
-- Name: usuarios_get_all(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.usuarios_get_all(_key_empresa character varying) RETURNS SETOF character varying
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
                    SELECT empresa_usuario.*,
					(select max(empresa_usuario_log.fecha_on) from empresa_usuario_log where empresa_usuario_log.key_empresa_usuario = empresa_usuario.key) as ultima_actividad
					
					FROM empresa_usuario
					WHERE empresa_usuario.key_empresa = \''||_key_empresa||E'\'
					and empresa_usuario.estado > 0
				) sq';
    EXECUTE s_consulta INTO respuesta;
    RETURN NEXT respuesta;
	
END;
$$;


ALTER FUNCTION public.usuarios_get_all(_key_empresa character varying) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: empresa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresa (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    nit character varying,
    razon_social character varying,
    key_servicio character varying,
    theme json,
    repleg_ci character varying,
    repleg_nombre character varying,
    repleg_email character varying,
    repleg_telefono character varying,
    ia_info character varying
);


ALTER TABLE public.empresa OWNER TO postgres;

--
-- Name: empresa_moneda; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresa_moneda (
    key character varying NOT NULL,
    key_usuario character varying,
    key_empresa character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    tipo_cambio double precision,
    tipo character varying
);


ALTER TABLE public.empresa_moneda OWNER TO postgres;

--
-- Name: empresa_moneda_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresa_moneda_detalle (
    key character varying NOT NULL,
    key_usuario character varying,
    key_empresa_moneda character varying,
    fecha_on timestamp without time zone,
    estado integer,
    valor double precision,
    tipo character varying
);


ALTER TABLE public.empresa_moneda_detalle OWNER TO postgres;

--
-- Name: empresa_moneda_historico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresa_moneda_historico (
    key character varying NOT NULL,
    key_usuario character varying,
    key_empresa character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    key_empresa_moneda character varying,
    tipo_cambio double precision
);


ALTER TABLE public.empresa_moneda_historico OWNER TO postgres;

--
-- Name: empresa_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresa_usuario (
    key character varying NOT NULL,
    key_empresa character varying NOT NULL,
    key_usuario character varying,
    estado integer,
    fecha_on timestamp without time zone,
    alias character varying
);


ALTER TABLE public.empresa_usuario OWNER TO postgres;

--
-- Name: empresa_usuario_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresa_usuario_log (
    key character varying NOT NULL,
    key_empresa_usuario character varying NOT NULL,
    estado integer,
    fecha_on timestamp without time zone,
    data json
);


ALTER TABLE public.empresa_usuario_log OWNER TO postgres;

--
-- Name: historico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historico (
    key character varying NOT NULL,
    key_usuario character varying,
    key_aux character varying,
    descripcion character varying,
    data json,
    fecha_on timestamp without time zone,
    estado integer
);


ALTER TABLE public.historico OWNER TO postgres;

--
-- Name: horario_atencion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.horario_atencion (
    key character varying NOT NULL,
    key_usuario character varying NOT NULL,
    fecha_on timestamp without time zone DEFAULT now(),
    estado integer DEFAULT 1,
    dia integer,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    key_turno character varying,
    CONSTRAINT horario_atencion_dia_semana_check CHECK (((dia >= 0) AND (dia <= 6)))
);


ALTER TABLE public.horario_atencion OWNER TO postgres;

--
-- Name: punto_venta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.punto_venta (
    key character varying NOT NULL,
    key_usuario character varying,
    key_sucursal character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    lat double precision,
    lng double precision,
    direccion character varying,
    fraccionar_moneda boolean,
    key_cuenta_contable character varying,
    codigo_facturacion character varying
);


ALTER TABLE public.punto_venta OWNER TO postgres;

--
-- Name: sucursal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sucursal (
    key character varying NOT NULL,
    key_usuario character varying,
    key_empresa character varying,
    fecha_on timestamp without time zone,
    estado integer,
    descripcion character varying,
    observacion character varying,
    lat double precision,
    lng double precision,
    direccion character varying,
    telefono character varying,
    correo character varying,
    key_centro_costo character varying,
    codigo_facturacion character varying,
    municipio character varying
);


ALTER TABLE public.sucursal OWNER TO postgres;

--
-- Name: turno; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.turno (
    key character varying NOT NULL,
    key_usuario character varying,
    fecha_on timestamp without time zone,
    estado integer,
    nombre character varying,
    atiende_feriado integer,
    key_empresa character varying
);


ALTER TABLE public.turno OWNER TO postgres;

--
-- Name: turno_cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.turno_cliente (
    key character varying NOT NULL,
    key_usuario character varying NOT NULL,
    fecha_on timestamp without time zone,
    estado integer,
    key_cliente character varying,
    key_turno character varying,
    descripcion character varying
);


ALTER TABLE public.turno_cliente OWNER TO postgres;

--
-- Name: unidad_negocio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.unidad_negocio (
    key character varying NOT NULL,
    key_usuario character varying NOT NULL,
    fecha_on timestamp without time zone DEFAULT now(),
    estado integer DEFAULT 1,
    descripcion character varying,
    key_empresa character varying NOT NULL
);


ALTER TABLE public.unidad_negocio OWNER TO postgres;

--
-- Name: empresa empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_pkey PRIMARY KEY (key);


--
-- Name: empresa_usuario_log empresa_usuario_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_usuario_log
    ADD CONSTRAINT empresa_usuario_log_pkey PRIMARY KEY (key);


--
-- Name: empresa_usuario empresa_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_usuario
    ADD CONSTRAINT empresa_usuario_pkey PRIMARY KEY (key);


--
-- Name: historico historico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico
    ADD CONSTRAINT historico_pkey PRIMARY KEY (key);


--
-- Name: horario_atencion horario_atencion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario_atencion
    ADD CONSTRAINT horario_atencion_pkey PRIMARY KEY (key);


--
-- Name: empresa_moneda_detalle moneda_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_moneda_detalle
    ADD CONSTRAINT moneda_detalle_pkey PRIMARY KEY (key);


--
-- Name: empresa_moneda_historico moneda_historico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_moneda_historico
    ADD CONSTRAINT moneda_historico_pkey PRIMARY KEY (key);


--
-- Name: empresa_moneda moneda_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_moneda
    ADD CONSTRAINT moneda_pkey PRIMARY KEY (key);


--
-- Name: punto_venta punto_venta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.punto_venta
    ADD CONSTRAINT punto_venta_pkey PRIMARY KEY (key);


--
-- Name: sucursal sucursal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sucursal
    ADD CONSTRAINT sucursal_pkey PRIMARY KEY (key);


--
-- Name: turno_cliente turno_cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.turno_cliente
    ADD CONSTRAINT turno_cliente_pkey PRIMARY KEY (key);


--
-- Name: turno turno_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.turno
    ADD CONSTRAINT turno_pkey PRIMARY KEY (key);


--
-- Name: unidad_negocio unidad_negocio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidad_negocio
    ADD CONSTRAINT unidad_negocio_pkey PRIMARY KEY (key);


--
-- Name: fki_fk_unidad_negocio_key_empresa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fk_unidad_negocio_key_empresa ON public.unidad_negocio USING btree (key_empresa);


--
-- Name: index_empresa_usuario_log_1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_empresa_usuario_log_1 ON public.empresa_usuario_log USING btree (key_empresa_usuario) WITH (deduplicate_items='true');


--
-- Name: empresa_usuario fk_empresa_usuario_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_usuario
    ADD CONSTRAINT fk_empresa_usuario_empresa FOREIGN KEY (key_empresa) REFERENCES public.empresa(key) NOT VALID;


--
-- Name: empresa_usuario_log fk_empresa_usuario_log_usuario_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_usuario_log
    ADD CONSTRAINT fk_empresa_usuario_log_usuario_empresa FOREIGN KEY (key_empresa_usuario) REFERENCES public.empresa_usuario(key);


--
-- Name: empresa_moneda_detalle fk_moneda_detalle_detalle_key_moneda; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_moneda_detalle
    ADD CONSTRAINT fk_moneda_detalle_detalle_key_moneda FOREIGN KEY (key_empresa_moneda) REFERENCES public.empresa_moneda(key);


--
-- Name: empresa_moneda_historico fk_moneda_historico_key_epresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_moneda_historico
    ADD CONSTRAINT fk_moneda_historico_key_epresa FOREIGN KEY (key_empresa) REFERENCES public.empresa(key);


--
-- Name: empresa_moneda_historico fk_moneda_historico_key_moneda; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_moneda_historico
    ADD CONSTRAINT fk_moneda_historico_key_moneda FOREIGN KEY (key_empresa_moneda) REFERENCES public.empresa_moneda(key);


--
-- Name: empresa_moneda fk_moneda_key_epresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_moneda
    ADD CONSTRAINT fk_moneda_key_epresa FOREIGN KEY (key_empresa) REFERENCES public.empresa(key);


--
-- Name: punto_venta fk_punto_venta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.punto_venta
    ADD CONSTRAINT fk_punto_venta FOREIGN KEY (key_sucursal) REFERENCES public.sucursal(key);


--
-- Name: sucursal fk_sucursal; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sucursal
    ADD CONSTRAINT fk_sucursal FOREIGN KEY (key_empresa) REFERENCES public.empresa(key) NOT VALID;


--
-- Name: unidad_negocio fk_unidad_negocio_key_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidad_negocio
    ADD CONSTRAINT fk_unidad_negocio_key_empresa FOREIGN KEY (key_empresa) REFERENCES public.empresa(key) NOT VALID;


--
-- Name: horario_atencion horario_atencion_key_turno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario_atencion
    ADD CONSTRAINT horario_atencion_key_turno_fkey FOREIGN KEY (key_turno) REFERENCES public.turno(key);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict zO3D8i57OBJoM4hbJrhX82qO55uaSZpRI0cSbqm9NEP3lDOmgLfK8dpc9ttSnxB

