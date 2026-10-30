-- Base de datos: roles_permisos
-- Manuales de procedimientos (markdown). Un manual se puede asignar a varios roles.
-- Se usa character varying (sin límite) porque SPGConect.editObject no maneja el tipo text.

CREATE TABLE IF NOT EXISTS public.manual (
    key character varying PRIMARY KEY,
    key_usuario character varying,
    key_empresa character varying,
    descripcion character varying,
    contenido character varying,
    fecha_on timestamp without time zone DEFAULT now(),
    estado integer DEFAULT 1
);
CREATE INDEX IF NOT EXISTS manual_key_empresa_idx ON public.manual (key_empresa);

CREATE TABLE IF NOT EXISTS public.manual_rol (
    key character varying PRIMARY KEY,
    key_usuario character varying,
    key_empresa character varying,
    key_manual character varying,
    key_rol character varying,
    fecha_on timestamp without time zone DEFAULT now(),
    estado integer DEFAULT 1
);
CREATE INDEX IF NOT EXISTS manual_rol_key_empresa_idx ON public.manual_rol (key_empresa);
CREATE INDEX IF NOT EXISTS manual_rol_key_rol_idx ON public.manual_rol (key_rol);

-- Migración: manuales escritos antes directamente en rol.manual
INSERT INTO public.manual (key, key_empresa, descripcion, contenido, fecha_on, estado)
SELECT md5('manual' || r.key), r.key_empresa, 'Manual ' || r.descripcion, r.manual, now(), 1
FROM public.rol r
WHERE coalesce(r.manual, '') <> ''
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.manual_rol (key, key_empresa, key_manual, key_rol, fecha_on, estado)
SELECT md5('manual_rol' || r.key), r.key_empresa, md5('manual' || r.key), r.key, now(), 1
FROM public.rol r
WHERE coalesce(r.manual, '') <> ''
ON CONFLICT (key) DO NOTHING;
