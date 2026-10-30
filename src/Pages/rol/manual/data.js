import MDL from '../../../MDL';

// Carga manuales, roles y asignaciones de la empresa actual.
// Cada manual se devuelve con `roles`: los roles a los que está asignado.
export async function loadManuales() {
    const [manuales, roles, asignaciones] = await Promise.all([
        MDL.rolesPermisos.getAllManual(),
        MDL.rolesPermisos.getAllEmpresa(),
        MDL.rolesPermisos.getAllManualRol(),
    ]);
    const rolesActivos = {};
    Object.values(roles ?? {}).forEach(r => { if (r.estado != 0) rolesActivos[r.key] = r; });

    const lista = Object.values(manuales ?? {}).map(m => ({ ...m, roles: [], asignaciones: [] }));
    const byKey = {};
    lista.forEach(m => byKey[m.key] = m);
    Object.values(asignaciones ?? {}).forEach(a => {
        const manual = byKey[a.key_manual];
        const rol = rolesActivos[a.key_rol];
        if (!manual || !rol) return;
        manual.asignaciones.push(a);
        manual.roles.push(rol);
    });
    lista.sort((a, b) => (a.descripcion ?? "").localeCompare(b.descripcion ?? ""));
    return { manuales: lista, roles: rolesActivos };
}

export function resumen(contenido, max = 120) {
    // Primera línea con texto, sin símbolos de markdown.
    const linea = (contenido ?? "").split("\n").map(l => l.replace(/^[#>\-*\s`]+/, "").trim()).find(l => l.length > 0);
    if (!linea) return "";
    return linea.length > max ? linea.substring(0, max) + "..." : linea;
}
