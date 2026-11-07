import React from 'react';
import { SNavigation, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../MDL';
import { URL } from './api';

const puede = (permiso) => !!MDL.rolesPermisos.getPermiso({ url: URL, permiso });

// Navegación entre las pantallas de Cybersource / Tienda web.
const TABS = [
    ["", "Pagos con tarjeta"],
    ["/contratos", "Contratos"],
    ["/cobros", "Cobros"],
    ["/ordenes", "Órdenes web"],
    ["/tienda", "Tienda web", "configurar"],
    ["/configuracion", "Integración", "configurar"],
];

export default ({ activo }) => <SView row style={{ paddingHorizontal: 8, paddingTop: 8, flexWrap: "wrap" }}>
    {TABS.filter(([, , p]) => !p || puede(p)).map(([ruta, label]) => {
        const on = ruta == activo;
        return <SView key={ruta} center onPress={on ? null : () => SNavigation.replace(URL + ruta)}
            style={{ height: 32, paddingHorizontal: 14, marginRight: 4, marginBottom: 4, borderRadius: 8, borderWidth: 1,
                borderColor: on ? STheme.color.text : STheme.color.card, backgroundColor: on ? STheme.color.card : "transparent" }}>
            <SText fontSize={13} bold={on} color={STheme.color.text}>{label}</SText>
        </SView>
    })}
</SView>
