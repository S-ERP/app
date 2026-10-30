import React from 'react';
import { Text } from 'react-native';
import { SIcon, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import ZKTeco from './zkteco';
import iniciarRegistroHuella from './iniciarRegistroHuella';

// Columna "Huella" y opcion de menu para las tablas de personas (usuarios y clientes).
// row.huella: registro de usuario_huella, false si no tiene, undefined si zkteco no respondio.

// Carga las huellas y las asigna a cada fila (row[keyField] = key de la persona en zkteco).
// Si zkteco falla las filas quedan sin dato y la tabla carga igual.
export async function asignarHuellas(rows, keyField = "key") {
    const huellas = await ZKTeco.getHuellasPorUsuario().catch(e => {
        console.log("[zkteco] usuario_huella getAll", e);
        return null;
    });
    if (!huellas) return rows;
    (Array.isArray(rows) ? rows : Object.values(rows ?? {})).forEach(row => {
        if (row) row.huella = huellas[row[keyField]] ?? false;
    });
    return rows;
}

// Props para <DinamicTable.Col key="huella" label="Huella" width={110} {...colHuella} />
export const colHuella = {
    data: e => e.row?.huella === undefined ? "" : e.row.huella ? "Registrada" : "Sin huella",
    customComponent: e => e.row?.huella === undefined ? null : <SView row center style={{ justifyContent: "flex-start", flex: 1 }}>
        <SView width={14} height={14}>
            <SIcon name="Fp" fill={e.row.huella ? STheme.color.success : STheme.color.text + "33"} />
        </SView>
        <SView width={6} />
        <Text style={[e.textStyle, { flex: 1, color: e.row.huella ? STheme.color.success : STheme.color.gray }]} numberOfLines={1}>{e.data}</Text>
    </SView>,
};

// Opcion para FloatMenu: "Registrar huella" / "Cambiar huella".
export function opcionHuella({ key, nombre, huella }) {
    return {
        label: huella ? "Cambiar huella" : "Registrar huella",
        icon: <SIcon name="Fp" fill={STheme.color.text} />,
        onPress: () => iniciarRegistroHuella({ key_usuario: key, nombre, huella: huella || null }),
    };
}

// Llama a cb cuando se registra una huella (la tabla sigue montada al volver del sensor).
// Devuelve la funcion para dejar de escuchar.
export function escucharRegistroHuella(cb) {
    const listener = (obj) => {
        if (obj?.component == "usuario_huella" && obj?.type == "registro" && obj?.estado == "exito") cb(obj.data);
    };
    SSocket.addEventListener("onMessage", listener);
    return () => SSocket.removeEventListener("onMessage", listener);
}
