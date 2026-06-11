-- FUNCTION: public.json_upsert(text, jsonb, text)

-- DROP FUNCTION IF EXISTS public.json_upsert(text, jsonb, text);

CREATE OR REPLACE FUNCTION public.json_upsert(
	table_name text,
	json_array jsonb,
	conflict_column text DEFAULT 'key')
    RETURNS jsonb
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
$BODY$;

ALTER FUNCTION public.json_upsert(text, jsonb, text)
    OWNER TO postgres;




-- FUNCTION: public.json_insert(text, jsonb)

-- DROP FUNCTION IF EXISTS public.json_insert(text, jsonb);

CREATE OR REPLACE FUNCTION public.json_insert(
	table_name text,
	json_data jsonb)
    RETURNS jsonb
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
$BODY$;

ALTER FUNCTION public.json_insert(text, jsonb)
    OWNER TO postgres;




-- FUNCTION: public.json_update(text, jsonb, text)

-- DROP FUNCTION IF EXISTS public.json_update(text, jsonb, text);

CREATE OR REPLACE FUNCTION public.json_update(
	table_name text,
	json_data jsonb,
	where_condition text DEFAULT NULL::text)
    RETURNS jsonb
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
$BODY$;

ALTER FUNCTION public.json_update(text, jsonb, text)
    OWNER TO postgres;

