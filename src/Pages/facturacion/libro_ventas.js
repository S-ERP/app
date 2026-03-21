import React, { Component } from 'react';
import { View, Text, Linking, Dimensions } from 'react-native';
import { SButtom, SDate, SHr, SIcon, SImage, SMath, SNavigation, SNotification, SPage, STable, STable2, SText, STheme, SView } from 'servisofts-component';
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
import SIconApp from '../../Assets/SIconApp';
import FechaFullFilter from '../../Components/FechaFullFilter';

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

        this.fecha_actual = new SDate();
        this.fecha_fin_mes = new SDate(); // Establece al primer día del mes
        this.fecha_fin_mes.addMonth(1).setDay(1).addDay(-1); // Avanza al primer día del próximo mes y retrocede un día

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

    async loadData() {
        try {
            const response = await SSocket.sendPromise({
                service: "facturacion",
                component: "factura",
                type: "getAll",
                estado: "cargando",
                key_usuario: Model.usuario?.Action?.getKey?.(),
                key_empresa: Model.empresa?.Action?.getKey?.(),
            });
            if (!response?.data) {
                throw "⚠️ No se recibió data de facturacion.getAll:"
            }
            try {
                let keys = [];
                Object.values(response.data).map((fac) => {
                    keys.push(fac.key_usuario);
                })
                const usuarios = await MDL.usuario.getByKeys(keys)
                Object.values(response.data).map((fac) => {
                    if (fac.key_usuario) {
                        fac._usuario = usuarios.find(usr => usr.key == fac.key_usuario)
                    }
                })
            } catch (error) {
                console.log("se cargo pero sin usuarios")
            }
            return Object.values(response.data);
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
        return <SPage bold title={"Facturación - Libro ventas"} disableScroll>


            <SView row col={"xs-12"} style={{ paddingBottom: 8, paddingLeft: 8, borderBottomWidth: 1, borderColor: STheme.color.lightGray + "30", }}>


                <SView col={"xs-12 sm-8.2 lg-3.3"} row center   >
                    <FechaFullFilter
                        fecha_inicio={this.state.fecha_inicio}
                        fecha_fin={this.state.fecha_fin}
                        onChange={e => this.setState({
                            fecha_inicio: e.fecha_inicio,
                            fecha_fin: e.fecha_fin
                        }, () => {
                            // if (this.table) this.table.loadData();
                        })}
                    />
                </SView>

                <SView width={8} height={"100%"} />
                {/* <SView col={"xs-12 sm-5 lg-1"} row center  >
                                    <FiltroSelector
                                        ref={ref => this.filtroStockRef = ref}
                                        label="Stock"
                                        loadData={async () => [
                                            { key: "con_stock", nombre: "Con stock" },
                                            { key: "sin_stock", nombre: "Sin stock" },
                                        ]}
                                        mapOption={a => ({ key: a.key, nombre: a.nombre })}
                                        onSelect={item => this.setState({ selectedStock: item }, () => {
                                            if (this.table) this.table.loadData();
                                        })}
                                    />
                                </SView> */}
            </SView>

            <DinamicTable
                language='es'
                center
                ref={ref => this.table = ref}
                loadData={this.loadData.bind(this)}
                loadInitialState={async () => {
                    return {
                        cols: {
                            "leyenda": { hidden: true }
                        },
                        filters: [
                            { col: "ambiente", operator: "=", value: [1], type: "number" },
                            { col: "gestion", operator: "contains", value: [new SDate().toString("yyyy-MM")], type: "string" },
                        ],
                        sorters: [
                            { key: "numero", type: "number", order: "desc" }
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
                }}
                listFooterComponent={() => {
                    return <SHr h={200} />
                }}
            >
                {/* <DinamicTable.Col
                    key='index'
                    label='#'
                    textStyle={{ fontSize: 11, color: STheme.color.lightGray }}
                    data={e => e.index + 1}
                    format={e => e.index + 1}
                    width={30}
                /> */}
                <DinamicTable.Col key="numero" label='Numero' dataType='number' center data={e => parseFloat(e.row?.data?.numeroFactura)} width={70} cellStyle={{ alignItems: "center" }} />
                <DinamicTable.Col key="ambiente" label='Ambiente' dataType='number' data={e => parseFloat(e.row?.ambiente)} width={80} cellStyle={{ alignItems: "center" }}
                    customComponent={(e) => {
                        return <SView width={50} height={20} center style={{ borderRadius: 5, backgroundColor: e.row?.ambiente == 1 ? STheme.color.success : STheme.color.warning, }}>
                            <SText color={"#fff"} bold fontSize={10} >{e.data}</SText>
                        </SView>
                    }}
                />
                <DinamicTable.Col key="gestion" label='Gestión' width={70} cellStyle={{ alignItems: "center" }}
                    data={e => new SDate(e.row?.data?.fechaEmision, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM")}
                />
                <DinamicTable.Col key="nit" label='NIT' data={e => e.row?.data?.numeroDocumento} textStyle={{ fontWeight: "bold" }} />
                <DinamicTable.Col key="razonSocial" label='Razon Social' data={e => e.row?.data?.nombreRazonSocial} textStyle={{ fontWeight: "bold" }} />
                <DinamicTable.Col key="subtotal" label='Sub Total' width={80} dataType='number' data={e => {
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
                <DinamicTable.Col key="estado" label='Estado' data={e => e.row?.state} width={100} cellStyle={{ alignItems: "center" }}
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
                        return <SView backgroundColor={color} width={60} height={18} borderRadius={4} center><SText fontSize={11} color={"#fff"} bold>{(e.data + "").toUpperCase()}</SText></SView>
                    }}
                />
                <DinamicTable.Col key="cuf" label='CUF' data={e => e.row?.data?.cuf} width={120} />
                <DinamicTable.Col key="fecha" label='Fecha Emitida'
                    data={e => new SDate(e.row?.data?.fechaEmision, "yyyy-MM-ddThh:mm:ss").date}
                    width={120}
                    dataType='date'
                    dateFormat='yyyy-MM-dd hh:mm'
                />


                {/* <DinamicTable.Col
                    key="validacion_detalle"
                    label='Validación Detalle'
                    width={180}
                    data={e => {
                        const detalle = e.row?.data?.detalle;
                        const leyenda = e.row?.data?.leyenda;
                        const numeroDocumento = e.row?.data?.numeroDocumento;
                        const nombreRazonSocial = e.row?.data?.nombreRazonSocial;
                        const telefono = e.row?.data?.telefono;
                        const municipio = e.row?.data?.municipio;
                        const direccion = e.row?.data?.direccion;
                        const nitEmisor = e.row?.data?.nitEmisor;

                        // Validar leyenda primero
                        if (!leyenda || leyenda.trim() === "") {
                            return "Sin leyenda";
                        }

                        // Validar detalle
                        if (!detalle || !Array.isArray(detalle)) {
                            return "Detalle válido";
                        }

                        for (let i = 0; i < detalle.length; i++) {
                            const desc = detalle[i]?.descripcion ?? "";

                            if (desc.includes('"')) {
                                return `Item ${i + 1}: contiene comillas`;
                            }
                        }

                        return "Detalle válido";
                    }}
                    customComponent={(e) => {
                        const isError = e.data !== "Detalle válido";

                        return (
                            <SView
                                padding={4}
                                borderRadius={4}
                                backgroundColor={isError ? STheme.color.danger : STheme.color.success}
                            >
                                <SText fontSize={11} color={"#fff"} bold>
                                    {e.data}
                                </SText>
                            </SView>
                        );
                    }}
                /> */}

                <DinamicTable.Col
                    key="validacion_detalle"
                    label='Validación'
                    width={140}
                    data={e => {
                        const {
                            detalle,
                            leyenda,
                            numeroDocumento,
                            nombreRazonSocial,
                            telefono,
                            municipio,
                            direccion,
                            nitEmisor
                        } = e.row?.data ?? {};

                        // 🔴 Validaciones generales (cabecera)
                        if (!nitEmisor) return "Error: NIT emisor vacío";
                        if (!numeroDocumento) return "Error: N° documento vacío";
                        if (!nombreRazonSocial) return "Error: Razón social vacía";
                        if (!direccion) return "Error: Dirección vacía";
                        if (!municipio) return "Error: Municipio vacío";

                        // Opcional (según tu negocio)
                        if (!telefono) return "Advertencia: sin teléfono";

                        if (!leyenda || leyenda.trim() === "") {
                            return "Error: sin leyenda";
                        }

                        // 🔴 Validación detalle
                        if (!detalle || !Array.isArray(detalle)) {
                            return "Error: detalle inválido";
                        }

                        for (let i = 0; i < detalle.length; i++) {
                            const desc = detalle[i]?.descripcion ?? "";

                            if (!desc.trim()) {
                                return `Error: ítem ${i + 1} sin descripción`;
                            }

                            if (desc.includes('"')) {
                                return `Error: comillas en ítem ${i + 1}`;
                            }
                        }

                        // ✅ Todo correcto
                        return "Válido";
                    }}
                    customComponent={(e) => {
                        const isError = e.data.startsWith("Error");
                        const isWarning = e.data.startsWith("Advertencia");

                        let bgColor = STheme.color.success;

                        if (isError) bgColor = STheme.color.danger;
                        else if (isWarning) bgColor = "#f39c12"; // naranja

                        return (
                            <SView
                                padding={4}
                                borderRadius={4}
                                backgroundColor={bgColor}
                            >
                                <SText fontSize={11} color={"#fff"} bold>
                                    {e.data}
                                </SText>
                            </SView>
                        );
                    }}
                />

                <DinamicTable.Col
                    key="adminas"
                    label="Operador"
                    width={190}
                    data={e => `${e.row?._usuario?.Nombres} ${e.row?._usuario?.Apellidos}`} // ✅ Ya está bien
                    customComponent={e => {
                        const key = e.row?.key_usuario;
                        const nombre = e.data ?? "Sin cajero";
                        return key ? (
                            <SView col="xs-12" row center>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card }} >
                                    <SImage src={`${SSocket.api.root}usuario/${key}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={1} style={{ fontSize: 12, color: STheme.color.lightGray }} >
                                    {nombre}
                                </SText>
                            </SView>
                        ) : (
                            <SText>Sin Usuario</SText>
                        );
                    }}
                />
                <DinamicTable.Col key="leyenda" label='Leyenda' data={e => e.row?.data?.leyenda} width={400} />
            </DinamicTable>
        </SPage>
    }
}