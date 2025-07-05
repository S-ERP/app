import React, { useState } from "react";
import * as xlsx from "xlsx";

import { SPage } from "servisofts-component";

export default function ImportarExcel({ onDataParsed }) {
    const [data, setData] = useState([]);
    const [productos, setProductos] = useState([]);

    const cargarExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileData = await file.arrayBuffer();
        const workbook = xlsx.read(fileData);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

        const productosImportados = rows.map((row, index) => ({
            nombre: row["Nombre"] || "",
            modelo: row["Modelo"] || "",
            observacion: row["Observacion"] || "",
            precio_compra: row["Precio Compra"] || 0,
            precio_venta: row["Precio Venta"] || 0,
        }));
        setProductos(productosImportados);
        setData(rows);
        if (onDataParsed) onDataParsed(productosImportados);
    };

    const limpiarTabla = () => {
        if (!data.length) {
            if (window.SPopup) window.SPopup.alert("⚠️ No hay datos en la tabla");
            return;
        }
        setData([]);
        setProductos([]);
    };

    const enviarTablaServidor = () => {
        // Implementar lógica para enviar los datos al servidor
        // Por ejemplo: fetch('/api/endpoint', { method: 'POST', body: JSON.stringify(productos) })
        if (window.SPopup) window.SPopup.alert("🚀 Enviando datos al servidor...");
    };

    return (
        <SPage title="Importar Productos desde Excel" disableScroll>
            <input type="file" accept=".xlsx, .xls" onChange={cargarExcel} />
            <SHr height={20} />
            <SView col="xs-12 md-9" row style={{ gap: 8 }}>
                <SView width={140} height={32} center backgroundColor={STheme?.color?.card} borderRadius={4}>
                    <SText fontSize={14} color={STheme?.color?.white}>{"+  Importar Excel"}</SText>
                </SView>
                <SView width={140} height={32} center row backgroundColor={STheme?.color?.card} borderRadius={4} onPress={limpiarTabla}>
                    <SIcon name='crmeliminar' width={16} fill='white' />
                    <SText fontSize={14}> Limpiar Tabla</SText>
                </SView>
                <SView flex />
                <SView width={140} height={32} center row backgroundColor={STheme?.color?.card} borderRadius={4} onPress={enviarTablaServidor}>
                    <SIcon name='MessageSend' width={14} fill='white' />
                    <SText fontSize={14} color={STheme?.color?.white}> Enviar al servidor</SText>
                </SView>
            </SView>

            {(!data.length) ?
                <SView center style={{ position: "absolute", top: 180, left: "25%", }} >
                    <SText color={STheme?.color?.lightGray} fontSize={16}>📂 Aún no se ha importado ningún archivo</SText>
                </SView>
                : null}



        </SPage>
    );
}