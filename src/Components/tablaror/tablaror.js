// src/components/tablaror/tablaror.js
import React from 'react';
import { ScrollView } from 'react-native';
import { SView, SText } from 'servisofts-component';

const TablaReportes = ({
    datos = [],
    totales = {},
    titulo = "Reporte",
    onCeldaPress,
    onFooterPress,
    onFormatearValor,
    configuracion = {}
}) => {
    // Configuración por defecto
    const {
        headers = ["Período", "Cant. Ventas", "En Proceso", "Completadas", "Total Estado", "Monto Total", "Canceladas", "Total General"],
        colores = {
            evenRow: '#F8F9FA',
            oddRow: '#E9ECEF',
            footer: '#343A40',
            text: '#212529'
        },
        maxAltura = 300,
        mostrarFooter = true,
        columnas = {
            periodo: 'periodo',
            cantidadVentas: 'cantidad_ventas',
            enProceso: 'en_proceso',
            completadas: 'completadas',
            montoTotal: 'monto_total',
            canceladas: 'canceladas'
        }
    } = configuracion;

    // Estilos
    const tableTextStyle = {
        fontSize: 12,
        color: colores.text,
        textAlign: 'center',
        paddingVertical: 4,
    };

    // Función para manejar press de celdas
    const handleCeldaPress = (fila, estado, valor) => {
        if (onCeldaPress) {
            onCeldaPress({ fila, estado, valor });
        }
    };

    // Función para manejar press del footer
    const handleFooterPress = (estado, valor) => {
        if (onFooterPress) {
            onFooterPress({ estado, valor, totales });
        }
    };

    // Función por defecto para formatear valores
    const formatearValorDefault = (valor, tipo = 'texto') => {
        if (valor === null || valor === undefined) return '-';

        switch (tipo) {
            case 'moneda':
                return `Bs. ${Number(valor).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
            case 'numero':
                return Number(valor).toLocaleString('es-ES');
            case 'fecha':
                if (!valor) return '-';
                if (typeof valor === 'string' && valor.includes('T')) {
                    return valor.split('T')[0];
                }
                return String(valor);
            default:
                return String(valor);
        }
    };

    const formatearValor = onFormatearValor || formatearValorDefault;

    // Calcular totales dinámicos
    const calcularTotalEstado = (fila) => {
        return (fila[columnas.enProceso] || 0) +
            (fila[columnas.cantidadVentas] || 0) +
            (fila[columnas.completadas] || 0);
    };

    const calcularTotalGeneral = (fila) => {
        return (fila[columnas.montoTotal] || 0) +
            (fila[columnas.canceladas] || 0);
    };

    return (
        <SView col={"xs-12"} style={{ borderRadius: 8, padding: 8, backgroundColor: 'white' }}>
            <SView col={"xs-12"}>
                <SText col={"xs-12"} fontSize={16} style={{ color: '#000', marginBottom: 8, fontWeight: 'bold' }}>
                    {titulo}
                </SText>

                {/* HEADER */}
                <SView col={"xs-12"} height={36} row style={{ backgroundColor: colores.footer, borderRadius: 4 }}>
                    {headers.map((title, index) => (
                        <SView flex center key={`header-${index}`}>
                            <SText style={tableTextStyle} color="white" fontWeight="bold">{title}</SText>
                        </SView>
                    ))}
                </SView>

                {/* CUERPO */}
                <ScrollView style={{ maxHeight: maxAltura, borderRadius: 8 }}>
                    {datos.map((fila, index) => {
                        const backgroundColor = index % 2 === 0 ? colores.evenRow : colores.oddRow;
                        const totalEstado = calcularTotalEstado(fila);
                        const totalGeneral = calcularTotalGeneral(fila);

                        return (
                            <SView key={`row-${index}`} col={"xs-12"} backgroundColor={backgroundColor} row style={{ minHeight: 32 }}>

                                {/* Período */}
                                <SView flex center>
                                    <SText style={tableTextStyle} numberOfLines={1}>
                                        {formatearValor(fila[columnas.periodo], 'fecha')}
                                    </SText>
                                </SView>

                                {/* Cantidad de Ventas */}
                                <SView flex center onPress={() => handleCeldaPress(fila, "cantidad_ventas", fila[columnas.cantidadVentas])}>
                                    <SText style={tableTextStyle} numberOfLines={1}>
                                        {formatearValor(fila[columnas.cantidadVentas], 'numero')}
                                    </SText>
                                </SView>

                                {/* En Proceso */}
                                <SView flex center onPress={() => handleCeldaPress(fila, "en_proceso", fila[columnas.enProceso])}>
                                    <SText style={tableTextStyle} numberOfLines={1}>
                                        {formatearValor(fila[columnas.enProceso], 'numero')}
                                    </SText>
                                </SView>

                                {/* Completadas */}
                                <SView flex center onPress={() => handleCeldaPress(fila, "completadas", fila[columnas.completadas])}>
                                    <SText style={tableTextStyle} numberOfLines={1}>
                                        {formatearValor(fila[columnas.completadas], 'numero')}
                                    </SText>
                                </SView>

                                {/* Total Estado */}
                                <SView flex center onPress={() => handleCeldaPress(fila, "total_estado", totalEstado)}>
                                    <SText style={tableTextStyle} numberOfLines={1}>
                                        {formatearValor(totalEstado, 'numero')}
                                    </SText>
                                </SView>

                                {/* Monto Total */}
                                <SView flex center onPress={() => handleCeldaPress(fila, "monto_total", fila[columnas.montoTotal])}>
                                    <SText style={tableTextStyle} numberOfLines={1}>
                                        {formatearValor(fila[columnas.montoTotal], 'moneda')}
                                    </SText>
                                </SView>

                                {/* Canceladas */}
                                <SView flex center onPress={() => handleCeldaPress(fila, "canceladas", fila[columnas.canceladas])}>
                                    <SText style={tableTextStyle} numberOfLines={1}>
                                        {formatearValor(fila[columnas.canceladas], 'numero')}
                                    </SText>
                                </SView>

                                {/* Total General */}
                                <SView flex center onPress={() => handleCeldaPress(fila, "total_general", totalGeneral)}>
                                    <SText style={tableTextStyle} numberOfLines={1}>
                                        {formatearValor(totalGeneral, 'moneda')}
                                    </SText>
                                </SView>
                            </SView>
                        );
                    })}
                </ScrollView>

                {/* FOOTER */}
                {mostrarFooter && (
                    <SView col={"xs-12"} height={36} backgroundColor={colores.footer} row style={{ borderRadius: 4 }}>
                        <SView flex center>
                            <SText style={tableTextStyle} color="white" fontWeight="bold">Total</SText>
                        </SView>

                        <SView flex center onPress={() => handleFooterPress("cantidad_ventas", totales?.cantidadVentas)}>
                            <SText style={tableTextStyle} color="white" fontWeight="bold">
                                {formatearValor(totales?.cantidadVentas, 'numero')}
                            </SText>
                        </SView>

                        <SView flex center onPress={() => handleFooterPress("en_proceso", totales?.enProceso)}>
                            <SText style={tableTextStyle} color="white" fontWeight="bold">
                                {formatearValor(totales?.enProceso, 'numero')}
                            </SText>
                        </SView>

                        <SView flex center onPress={() => handleFooterPress("completadas", totales?.completadas)}>
                            <SText style={tableTextStyle} color="white" fontWeight="bold">
                                {formatearValor(totales?.completadas, 'numero')}
                            </SText>
                        </SView>

                        <SView flex center onPress={() => handleFooterPress("total_estado", (totales?.cantidadVentas || 0) + (totales?.enProceso || 0) + (totales?.completadas || 0))}>
                            <SText style={tableTextStyle} color="white" fontWeight="bold">
                                {formatearValor((totales?.cantidadVentas || 0) + (totales?.enProceso || 0) + (totales?.completadas || 0), 'numero')}
                            </SText>
                        </SView>

                        <SView flex center onPress={() => handleFooterPress("monto_total", totales?.montoTotal)}>
                            <SText style={tableTextStyle} color="white" fontWeight="bold">
                                {formatearValor(totales?.montoTotal, 'moneda')}
                            </SText>
                        </SView>

                        <SView flex center onPress={() => handleFooterPress("canceladas", totales?.canceladas)}>
                            <SText style={tableTextStyle} color="white" fontWeight="bold">
                                {formatearValor(totales?.canceladas, 'numero')}
                            </SText>
                        </SView>

                        <SView flex center onPress={() => handleFooterPress("total_general", (totales?.montoTotal || 0) + (totales?.canceladas || 0))}>
                            <SText style={tableTextStyle} color="white" fontWeight="bold">
                                {formatearValor((totales?.montoTotal || 0) + (totales?.canceladas || 0), 'moneda')}
                            </SText>
                        </SView>
                    </SView>
                )}
            </SView>
        </SView>
    );
};

// Asegúrate de que esta línea esté al final del archivo:
export default TablaReportes;