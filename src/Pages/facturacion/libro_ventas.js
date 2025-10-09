import React, { Component } from 'react';
import { View, Text, Linking, Dimensions } from 'react-native';
import { SButtom, SDate, SHr, SIcon, SMath, SNavigation, SNotification, SPage, STable, STable2, SText, STheme, SView } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import PDF from './pdf';
import { ConstNode } from 'three/examples/jsm/nodes/Nodes';
import { SPopup } from 'servisofts-component';
import SelectTipoAnulacion from './Components/SelectTipoAnulacion';
import MDL from '../../MDL';
import { DinamicTable } from 'servisofts-table';
import BoxMenu from './Components/BoxMenu';

export default class libro_ventas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            parametricas: {}
        };
    }
    componentDidMount() {


        MDL.rolesPermisos.getPermisoAsync({ url: "/facturacion/libro_ventas", permiso: "ver" }).then((permit) => {
            if (!permit) {
                SNavigation.goBack();
                return;
            }
        }).catch(e => {
            console.error(e);
        })


        MDL.factura.getParametrica({ ambiente: MDL.factura.ambiente, parametrica: "motivoAnulacion" }).then((res) => {
            this.state.parametricas.motivoAnulacion = res;
            this.setState({ ...this.state })
        }).catch(e => {
            console.error(e);
        })


        // this.fecha_actual = new SDate("2025-10-28 02:36:47");
        this.fecha_actual = new SDate();
        this.fecha_fin_mes = new SDate(); // Establece al primer día del mes
        this.fecha_fin_mes.addMonth(1).setDay(1).addDay(-1); // Avanza al primer día del próximo mes y retrocede un día



        // Validar si faltan 10 días o menos para el fin de mes
        this.dias_restantes = this.fecha_fin_mes.diff(this.fecha_actual);
        if (this.dias_restantes <= 10) {
            SNotification.send({
                title: "⚠️ Cierre de Mes ⚠️",
                body: `Estás en el período crítico de cierre.\n\n` +
                    `🚫 No podrás anular facturas después del último día del mes.\n` +
                    `✅ Revisa y procesa todas las anulaciones antes del cierre.\n\n` +
                    `⏰ *Quedan ${this.dias_restantes} días.*`,
                color: STheme.color.warning,
                time: 20000,
            });
        }


    }

    // async loadData() {
    //     const request = await SSocket.sendPromise({
    //         service: "facturacion",
    //         component: "factura",
    //         type: "getAll",
    //         estado: "cargando",
    //         key_usuario: Model.usuario.Action.getKey(),
    //         key_empresa: Model.empresa.Action.getKey(),
    //     })
    //     return Object.values(request.data);
    // }

    async loadData() {
        try {
            const request = await SSocket.sendPromise({
                service: "facturacion",
                component: "factura",
                type: "getAll",
                estado: "cargando",
                key_usuario: Model.usuario?.Action?.getKey?.(),
                key_empresa: Model.empresa?.Action?.getKey?.(),
            });

            if (!request?.data) {
                console.warn("⚠️ No se recibió data de facturacion.getAll:", request);
                return [];
            }

            return Object.values(request.data);
        } catch (e) {
            console.error("❌ Error en loadData:", e);
            return [];
        }
    }


    anular({ cuf }) {
        SPopup.open({
            key: "anularpop",
            content: <SView width={250} height={180} backgroundColor={STheme.color.background} withoutFeedback center padding={8}>
                <SText>{"Seleccione el motivo de anulación"}</SText>
                <SView flex />
                <SelectTipoAnulacion ref={ref => this.motivoAnulacion = ref} parametricas={this.state.parametricas} />
                <SView flex />
                <SButtom type='danger' onPress={() => {
                    const codigo_motivo = this.motivoAnulacion.getValue()
                    SSocket.sendPromise({
                        service: "facturacion",
                        component: "factura",
                        type: "anular",
                        key_empresa: Model.empresa.Action.getKey(),
                        key_usuario: Model.usuario.Action.getKey(),
                        cuf: cuf,
                        codigo_motivo: codigo_motivo,
                    }).then(e => {
                        this.componentDidMount()
                        SPopup.close("anularpop")
                        SNotification.send({
                            title: "Factura anulado con éxito",
                            body: cuf,
                            color: STheme.color.success,
                            time: 5000,
                        })
                    }).catch(e => {
                        SNotification.send({
                            title: "No se pudo anular la factura.",
                            body: cuf,
                            color: STheme.color.error,
                            time: 5000,
                        })
                    })
                }}>{"ANULAR"}</SButtom>
                <SHr />
            </SView>
        })
    }

    render() {
        const verificadorAdmin = MDL.usuario.session?.key === '1e4b2e09-94f1-4f9e-9d58-80d4d2f9ab3b';

        // const verificadorAdmin = MDL.usuario.session?.key === '1e4b2e09-94f1-4f9e-9d58-80d4d2f9ab3b' ? true : false
        // return <SPage title={"Facturacion - libro ventas " + this.fecha_actual + "--------- Quedan " + this.dias_restantes + " dias ----------- " + this.fecha_fin_mes} disableScroll>
        return <SPage title={"Facturacion - libro ventas"} disableScroll>
            <DinamicTable
                language='es'
                ref={ref => this.table = ref}
                loadData={this.loadData.bind(this)}

                loadInitialState={async () => {
                    return {
                        filters: [
                            { col: "ambiente", operator: "=", value: [1], type: "number" },
                            { col: "gestion", operator: "contains", value: [new SDate().toString("yyyy-MM")], type: "string" },
                        ],
                        sorters: [
                            { key: "numero", type: "number", order: "asc" }
                        ]

                    }
                }}

                colors={{
                    text: STheme.color.text,
                    background: STheme.color.background,
                    header: STheme.color.card,
                }}
                cellStyle={{
                    borderWidth: 0,
                }}
                textStyle={{
                    fontSize: 12
                }}
                selectType='single'
                onSelect={e => {
                    console.log("onSelect", e);
                    let top = e.evt.nativeEvent.pageY;
                    const h = Dimensions.get("window").height
                    if (h < top + 140) {
                        top = h - 140;
                    }
                    SPopup.open({
                        key: "popup_menu_alvaro",
                        type: "2",
                        content: <SView withoutFeedback style={[{
                            position: "absolute",
                            top: top,
                            left: e.evt.nativeEvent.pageX,
                            width: 230,
                        }
                        ]} center>
                            <BoxMenu data={e.row}
                                anular={this.anular.bind(this)}
                                onReload={() => {
                                    this.table.loadData();
                                    this.forceUpdate();
                                }}
                            ></BoxMenu>
                        </SView>
                    })
                    console.log("onSelect", e);

                }}
                listFooterComponent={() => {
                    return <SHr h={200} />
                }}
            >
                <DinamicTable.Col
                    key='index'
                    textStyle={{ fontSize: 10, color: STheme.color.lightGray }}
                    data={e => e.index + 1}
                    format={e => e.index + 1}
                    width={30}

                />
                <DinamicTable.Col key="numero" label='Numero' dataType='number' data={e => parseFloat(e.row?.data?.numeroFactura)} width={40} cellStyle={{
                    alignItems: "flex-end"
                }} />
                <DinamicTable.Col key="ambiente" label='Ambiente' dataType='number' data={e => parseFloat(e.row?.ambiente)} width={30} cellStyle={{
                    alignItems: "center"
                }}
                    customComponent={(e) => {
                        return <SView width={20} height={20} center style={{ borderRadius: 5, backgroundColor: e.row?.ambiente == 1 ? STheme.color.success : STheme.color.warning, }}>
                            <SText color={"#fff"} bold fontSize={10}>{e.data}</SText>
                        </SView>
                    }}
                />
                <DinamicTable.Col key="gestion" label='Gestion'
                    data={e => new SDate(e.row?.data?.fechaEmision, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM")}
                    width={60}
                />
                <DinamicTable.Col key="nit" label='NIT' data={e => e.row?.data?.numeroDocumento}
                    textStyle={{
                        fontWeight: "bold"
                    }}
                />
                <DinamicTable.Col key="razonSocial" label='Razon Social' data={e => e.row?.data?.nombreRazonSocial} textStyle={{
                    fontWeight: "bold"
                }} />
                <DinamicTable.Col key="subtotal" label='Sub Total' dataType='number' data={e => {
                    if (!e.row?.data?.detalle) return 0;
                    let subtotal = 0;
                    e.row.data.detalle.forEach(e => {
                        subtotal += (parseFloat(e.precioUnitario ?? 0) * parseFloat(e.cantidad ?? 0))
                    })
                    return subtotal
                }}
                    format={e => SMath.formatMoney(e.data)}
                    cellStyle={{
                        alignItems: "flex-end"
                    }}
                    renderFooter={(e) => {
                        const total = e.dinamicTable.dataFiltrada.reduce((a, b) => a + b.subtotal, 0);
                        return <View style={{ width: "100%", alignItems: "flex-end", backgroundColor: STheme.color.card, padding: 4 }} >
                            <Text style={[e.dinamicTable.textStyle, { alignItems: "flex-end", fontWeight: "bold" }]} >{SMath.formatMoney(total)}</Text>
                        </View>
                    }}

                />
                <DinamicTable.Col key="estado" label='Estado' data={e => e.row?.state}
                    width={70}
                    cellStyle={{
                        alignItems: "center"
                    }}
                    customComponent={e => {
                        let color = STheme.color.primary;
                        if (e.data == "enviada") {
                            color = STheme.color.success
                        } else if (e.data == "procesando") {
                            color = STheme.color.gray
                        } else if (e.data == "emitida") {
                            color = STheme.color.warning
                        } else if (e.data == "anulada") {
                            color = STheme.color.danger
                        }
                        return <SView backgroundColor={color} width={60} height={18} borderRadius={4} center><SText fontSize={9} color={"#fff"} bold>{(e.data + "").toUpperCase()}</SText></SView>
                    }}
                />

                <DinamicTable.Col key="cuf" label='CUF' data={e => e.row?.data?.cuf} textStyle={{ fontSize: 9 }} />
                <DinamicTable.Col key="fecha" label='Fecha'
                    data={e => new SDate(e.row?.data?.fechaEmision, "yyyy-MM-ddThh:mm:ss").date}
                    width={120}
                    dataType='date'
                    dateFormat='yyyy-MM-dd hh:mm'
                />

                {verificadorAdmin ? <DinamicTable.Col key="estadoss" label='Estado🏉' data={e => e.row?.estado} width={60} /> : ""}
                {verificadorAdmin ? <DinamicTable.Col key="leyenda" label='Leyenda🏉' data={e => e.row?.data?.leyenda} width={400} /> : ""}
            </DinamicTable>
            {/* <SHr h={}/> */}
        </SPage>
    }
}
