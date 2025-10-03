import React, { Component } from 'react';
import { SView, SPage, SText, SHr, SScrollView2, STheme, SDate, SMath, SIcon, SNavigation, SPopup } from 'servisofts-component';
import PopupPagoCuota from './components/PopupPagoCuota';
import MDL from '../../MDL';
import SIconApp from '../../Assets/SIconApp';
import { DinamicTable } from 'servisofts-table';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';

export default class TodaslasCajas extends Component {
    state = {
        data: null,
        loading: true,
        error: null,
        showPaid: false,
    };


    componentDidMount() {
        this.loadInitialData();

    }



    async loadInitialData() {
        try {
            console.log("📦 Cargando movimientos de caja...");
            const movimientos = await MDL.caja.getDetalle(MDL.caja.activa?.key);
            if (!movimientos) return [];
            console.log("🧾 Movimientos recibidos:", movimientos.length);
            // 2. Obtener tipos de pago y configuración por empresa
            const tipo_pago = await MDL.caja.tipo_pago_getAll();
            const empresa_tipo_pago = await MDL.caja.empresa_tipo_pago_getAll();
            const empresa_full = await MDL.empresa.getFull()

            // 3. Ordenar movimientos por fecha descendente
            movimientos.sort((a, b) => {
                const timeA = new SDate(a.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime();
                const timeB = new SDate(b.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime();
                return timeB - timeA;
            });

            // 4. Enriquecer cada movimiento con info de empresa_tipo_pago
            const movimientosEnriquecidos = movimientos.map((m) => ({
                ...m,
                tipo_pago: tipo_pago[m.key_tipo_pago] || {},
                // moneda: empresa_full.monedas[m.key_moneda] || {},

                moneda: empresa_full.monedas.find(mon => mon.key === m.key_moneda) || {},


                // moneda: empresa_full.monedas.find(a => a.key == m.key_moneda)|| {},
                empresa_tipo_pago: empresa_tipo_pago[m.key_empresa_tipo_pago] || {},
            }));

            console.log("✅ Movimientos cargados y enriquecidos:", movimientosEnriquecidos.length);
            return movimientosEnriquecidos;

        } catch (error) {
            console.error("❌ Error en loadDat2:", error);
            SPopup.alert("Error al cargar los movimientos. Intente nuevamente.");
            return [];
        }
    }




    mostrarTabla() {
        return (
            <DinamicTable
                ref={ref => (this.DinamicTable = ref)}
                loadData={async () => {
                    // return [];
                    return this.loadInitialData();
                }}
                key="id"
                language="es"
                center
                {...Config.table.applyTheme()}
                selectType="single"
                keyExtractor={(e) => e.key}
                onSelect={(e) => {
                    FloatMenu.open({
                        e: e.evt,
                        label: "Tabla de ventas",
                        options: [
                            {
                                label: "Ver venta",
                                icon: <SIconApp name='addTarea' fill="#e4e4e4ff" />,
                                onPress: () => {
                                    SNavigation.navigate("/venta/profile", { pk: e?.row?.key })
                                }
                            },
                            {
                                label: "Imprimir tamaño rollo",
                                icon: <SIcon name='imprimir' fill={STheme.color.text} />,
                                // onPress: () => {
                                //     ReciboRollo.imprimir(e?.row?.key)
                                // }
                            },

                            {
                                label: "Imprimir tamaño carta",
                                icon: <SIcon name='imprimir' fill={STheme.color.text} />,
                                // onPress: () => {
                                //     ReciboCarta.imprimir(e?.row?.key)
                                // }
                            },
                        ]
                    });
                }}
            // loadInitialState={async () => {
            //     return { sorters: [{ key: "fecha_on2", order: "asc", type: "date" }] }
            // }}
            >
                <DinamicTable.Col key="index" label="N°" width={30} data={(e) => e.index + 1} />
                {/* <DinamicTable.Col key="descripcion" label="Descripción" width={200} data={(e) => e.row?.descripcion} /> */}
                {/* <DinamicTable.Col key={"fecha_on"} label="Fecha" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" /> */}
                {/* <DinamicTable.Col key={"fecha_on2"} label="Fecha2" width={120} dataType="date" data={e => new SDate(e.row?.tipo_pago.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" /> */}
                {/* <DinamicTable.Col key="estado" label="Estado" width={80} data={(e) => e.row?.estado} /> */}
                {/* <DinamicTable.Col key="tipo_cambio" label="Tipo cambio" width={100} dataType="number" data={(e) => e.row?.tipo_cambio} /> */}


                <DinamicTable.Col key={"fecha_on"} label="FECHA Y HORA" width={120} dataType="date" data={e => new SDate(e.row?.tipo_pago?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />
                <DinamicTable.Col key="operacion" label="TIPO DE OPERACION" width={150} data={(e) => e.row?.descripcion} />
                <DinamicTable.Col key="cuenta_" label="CUENTA" width={90} data={(e) => e.row?.tipo_pago?.descripcion} />
                <DinamicTable.Col key="moneda_des" label="MONEDA" width={70} data={(e) => e.row?.moneda?.observacion} />
                <DinamicTable.Col key="moneda_cambio" label="TIPO CAMBIO" width={90} data={(e) => e.row?.moneda?.tipo_cambio} />
                <DinamicTable.Col key="monto" label="MONTO" width={70} dataType="number" data={(e) => e.row?.monto} />
                <DinamicTable.Col key="tipo" label="ESTADO" width={90} data={(e) => e.row?.tipo} />






                {/* <DinamicTable.Col key="abc_" label="empresa_tipo_pago  " width={500} data={(e) => JSON.stringify(e.row?.empresa_tipo_pago)} />
                <DinamicTable.Col key="abc___" label="tipo_pago  " width={500} data={(e) => JSON.stringify(e.row?.tipo_pago)} />
                <DinamicTable.Col key="abc______" label="tipo_pagosd  " width={500} data={(e) => JSON.stringify(e.row?.moneda)} />
 */}



                <DinamicTable.Col key="iconossdsf" label="iconos" width={100} data={(e) => e.row?.tipo_pago?.icon ?? ""}
                    customComponent={e => <>
                        {(e.row?.tipo_pago?.icon) ?
                            <SView col={"xs-12"} center row>
                                <SView style={{ width: 24, height: 24, borderRadius: 50, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SIconApp name={e.row?.tipo_pago?.icon} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.tipo_pago?.descripcion}</SText>
                            </SView> : null}
                    </>}
                />


                {/* <DinamicTable.Col key="key_tipo_pago" label="Key tipo pago" width={200} data={(e) => e.row?.key_tipo_pago} /> */}
                {/* <DinamicTable.Col key="key_caja" label="Caja" width={200} data={(e) => e.row?.key_caja} /> */}
                {/* <DinamicTable.Col key="key_usuario" label="Usuario" width={200} data={(e) => e.row?.key_usuario} /> */}
                {/* <DinamicTable.Col key="key_moneda" label="Moneda" width={200} data={(e) => e.row?.key_moneda} /> */}
                {/* <DinamicTable.Col key="key_comprobante" label="Comprobante" width={200} data={(e) => e.row?.key_comprobante} /> */}
                {/* <DinamicTable.Col key="codigo_comprobante" label="Código comprobante" width={180} data={(e) => e.row?.codigo_comprobante} /> */}
                {/* <DinamicTable.Col key="qrid" label="QR ID" width={200} data={(e) => e.row?.qrid} /> */}
                {/* <DinamicTable.Col key="key" label="Key" width={250} data={(e) => e.row?.key} /> */}




            </DinamicTable>
        );
    }

    render() {
        return (
            <SPage title={'Tabla de caja'} disableScroll>
                <SScrollView2 disableHorizontal>
                    <SView col={'xs-12'} center style={{ padding: 8 }}>
                        <SHr h={16} />
                        {this.mostrarTabla()}
                        <SHr h={16} />
                    </SView>
                </SScrollView2>
            </SPage>
        );
    }
}