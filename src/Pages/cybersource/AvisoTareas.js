import React, { useEffect, useState } from 'react';
import { SText, STheme, SView } from 'servisofts-component';
import { fecha, getEstadoTareas } from './api';

// Aviso en los paneles de la tienda web: si la tarea de cobro de cuotas dejó de correr (serp caído o detenido),
// si su última pasada tuvo errores, o si hay cobros que alguien tiene que revisar.
export default function AvisoTareas() {
    const [e, setE] = useState(null);
    useEffect(() => { getEstadoTareas().then(setE).catch(() => setE(null)); }, []);
    if (!e) return null;
    const avisos = [];
    const c = e.cobros ?? {}, r = e.cobros_revisar ?? {};
    if (c.atrasada) avisos.push({ color: STheme.color.danger, texto: c.nunca
        ? "La tarea de cobro automático todavía no corrió. Si esto dura más de media hora, revisá el servidor serp."
        : `La tarea de cobro automático no corre desde ${fecha(c.ultima_ejecucion)}: las cuotas no se están cobrando. Revisá el servidor serp.` });
    else if (c.errores > 0) avisos.push({ color: STheme.color.warning, texto: `La última pasada del cobro automático (${fecha(c.ultima_ejecucion)}) tuvo ${c.errores} error(es). Último: ${c.ultimo_error ?? ""}` });
    if (r.inciertos > 0) avisos.push({ color: STheme.color.danger, texto: `${r.inciertos} cobro(s) sin respuesta de Cybersource: revisalos en el Business Center antes de volver a cobrar (estado "Revisar en Cybersource").` });
    if (r.sin_registrar > 0) avisos.push({ color: STheme.color.warning, texto: `${r.sin_registrar} cobro(s) aprobados hace más de una hora que todavía no se registraron en caja.` });
    if (e.ordenes?.atrasada && !e.ordenes?.nunca) avisos.push({ color: STheme.color.danger, texto: `La tarea que registra las ventas de la página web no corre desde ${fecha(e.ordenes.ultima_ejecucion)}.` });
    if (!avisos.length) return null;
    return <SView col={"xs-12"} style={{ paddingHorizontal: 8, paddingTop: 6 }}>
        {avisos.map((a, i) => <SView key={i} style={{ padding: 8, paddingHorizontal: 12, marginBottom: 4, borderRadius: 8, backgroundColor: a.color + "33", borderLeftWidth: 3, borderColor: a.color }}>
            <SText fontSize={12}>{a.texto}</SText>
        </SView>)}
    </SView>
}
