import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate, SIcon } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import Model from '../../Model';
import ReciboCarta from '../../Components/PDF/venta/ReciboCarta';
import MDL from '../../MDL';
import FloatMenu from '../../Components/FloatMenu';
import DateTimeBetween from '../../Components/DateTimeBetween';
const proveedorEjemplo =
{
    "estado": 1,
    "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
    "key_empresa": "f894ea35-5ad1-4b61-a2d0-9294965be169",
    "fecha_on": "2025-08-28T05:57:21.391",
    "key_cuenta_contable": "",
    "nit": "0",
    "razon_social": "",
    "telefono": "",
    "nombre": "",
    "key": "a314d6c0-872b-4c72-b1a9-167526f52286"
}
const clienteEjemplo = {
    "apellidos": "",
    "descripcion": "",
    "distrito": "",
    "estado": 1,
    "key_usuario": "1e4b2e09-94f1-4f9e-9d58-80d4d2f9ab3b",
    "lng": "",
    "key_empresa": "f894ea35-5ad1-4b61-a2d0-9294965be169",
    "fecha_on": "2025-08-30T00:11:41.456",
    "direccion": "",
    "fecha_nacimiento": "",
    "razon_social": "",
    "provincia": "",
    "currier": "",
    "nombres": "SN",
    "correo": "SC",
    "nit": "0",
    "departamento": "",
    "sexo": "",
    "telefono": "",
    "key_servicio": "",
    "key": "1e4b2e09-94f1-4f9e-9d58-80d4d2f9ab3b",
    "lat": "",
    "imgen": "https://i.pinimg.com/736x/d9/d8/8e/d9d88e3d1f74e2b8ced3df051cecb81d.jpg",
}
export default class history extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fecha_inicio: null,
            fecha_fin: null,
        };

    }

    renderUsuario(srcKey) {
        const pintar = <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
            <SImage src={`${SSocket.api.root}usuario/${srcKey}`} style={{ resizeMode: "cover" }} />
        </SView>;
        const nulo = <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.lightGray + "66", }} />;
        return srcKey ? pintar : nulo;
    };
    renderCliente(srcKey) {
        const pintar = <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
            <SImage src={`${SSocket.api.crm}cliente/${srcKey}`} style={{ resizeMode: "cover" }} />
        </SView>;
        const nulo = <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.lightGray + "66", }} />;
        return srcKey ? pintar : nulo;
    };
    renderSucursal(srcKey) {
        const pintar = <>
            <SView style={{ width: 60 }}>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                    <SImage src={`${SSocket.api.empresa}sucursal/${srcKey}`} style={{ resizeMode: "cover" }} />
                </SView>
                <SText color='red'> sucursal </SText>
            </SView>
        </>
        const nulo = <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.lightGray + "66", }} />;
        return srcKey ? pintar : nulo;
    };

    toISO(dateString) {
        // Si ya tiene hora, se respeta
        if (dateString.includes(":")) {
            return dateString.replace(" ", "T");
        }
        // Si no tiene hora, asumimos inicio de día
        return dateString + "T00:00:00";
    }

    toISOEnd(dateString) {
        // Si ya tiene hora, se respeta
        if (dateString.includes(":")) {
            return dateString.replace(" ", "T");
        }
        // Si no tiene hora, asumimos fin del día
        return dateString + "T23:59:59";
    }

    filtrarPorFechas(data, fecha_inicio, fecha_fin) {
        return data.filter(item => {
            const fechaItem = new Date(this.toISO(item.fecha));

            if (fecha_inicio && !fecha_fin) {
                // Solo desde fecha_inicio
                return fechaItem >= new Date(this.toISO(fecha_inicio));
            }

            if (!fecha_inicio && fecha_fin) {
                // Solo hasta fecha_fin
                return fechaItem <= new Date(this.toISOEnd(fecha_fin));
            }

            if (fecha_inicio && fecha_fin) {
                // Entre fecha_inicio y fecha_fin
                return fechaItem >= new Date(this.toISO(fecha_inicio)) && fechaItem <= new Date(this.toISOEnd(fecha_fin));
            }

            // Si no hay filtros, devuelve todo
            return true;
        });
    }

    async loadInitialData() {
        try {
            const history = await MDL.caja.getAll(MDL.empresa?.select?.key);
            console.log("history", history);
            console.log('Loading initial data... 🎈🎈🎈🎈');

            const empresa = MDL.empresa?.select || {};
            const sucursales = await MDL.empresa.getAllSucursales();


            // const usuarios = await MDL.usuario.getByKeys(keysUsuarios) || {};
            // // Normalizar usuarios en objeto { key: usuario }
            // const usuariosMap = Array.isArray(usuarios)
            //     ? Object.fromEntries(usuarios.map(u => [u.key, u]))
            //     : usuarios;
            // // 5. Totales de la primera venta
            // const totales = Model.compra_venta_detalle.Action.getTotales({ key_compra_venta: ventas[0].key }) || {};
            // // 6. Enriquecer ventas con data relacionada
            // const ventasEnriquecidas = await Promise.all(
            //     ventas.map(async (cv) => {
            //         return {
            //             ...cv,
            //             sucursal: sucursales.find(a => a?.key === cv?.key_sucursal) || {},
            //             usuario: usuariosMap[cv?.key_usuario] || {},
            //             empresa,
            //             proveedor: proveedores.find(a => a.key == proveedorEjemplo?.key) || {},
            //             cliente: clientes.find(a => a?.key === cv.key_cliente) || {},
            //             subtotal: totales?.subtotal || "0",
            //             descuento: totales?.descuento || "0",
            //         };
            //     })
            // );
            console.log('Initial data loaded successfully! 🎉🎉🎉🎉');
            console.log(history);
            // Aplicar filtro por fechas si existen
            const { fecha_inicio, fecha_fin } = this.state;
            const filteredHistory = this.filtrarPorFechas(history, fecha_inicio, fecha_fin);
            console.log("Filtered History:", filteredHistory);
            return filteredHistory;
        } catch (error) {
            console.error('Error in loadData:', error);
            SPopup.alert('Error loading data. Please try again.');
            return [];
        }
    }
    // renderState(state) {
    //     const statesInfo = MDL.compra_venta.getStateInfo()[state];
    //     return <SView row center>
    //         <SView backgroundColor={statesInfo?.color} style={{ borderRadius: 4, padding: 5 }}>
    //             <SText color={STheme.color.text} fontSize={10}>{statesInfo?.label}</SText>
    //         </SView>
    //     </SView>
    // }
    renderTipoPago(values) {
        const statesTipo = MDL.compra_venta.getTipoPago()[values];
        return <SView row center>
            <SView backgroundColor={statesTipo?.color} style={{ borderRadius: 4, padding: 5 }}>
                <SText color={STheme.color.text} fontSize={10}>{statesTipo?.label}</SText>
            </SView>
        </SView>
    }
    renderCodigo(codigo) {
        return <SView row center>
            <SView border={STheme.color.card} style={{ borderRadius: 8, padding: 6, borderWidth: 1 }}>
                <SText color={STheme.color.text} fontSize={10} bold>{codigo}</SText>
            </SView>
        </SView>
    }
    mostrarTabla() {
        let dataprueba = [
            {
                "estado": 1,
                "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
                "key_empresa": "f894ea35-5ad1-4b61-a2d0-9294965be169",
                "fecha_on": "2025-09-02T00:26:44.013",
                "monto_cierre": null,
                "key_sucursal": "a23a8cd5-840d-4099-9ddc-1a906913c8e2",
                "key_punto_venta": "7a420ece-1001-4d8a-b0f9-a8be7c0b4fee",
                "key_comprobante_cierre": null,
                "fraccionar_moneda": false,
                "fecha": "2025-09-04T00:00:00",
                "key_cuenta_contable": "79b5e41b-a3c1-41d9-a47b-6f85e989d533",
                "fecha_cierre": null,
                "key_servicio": "1427e867-c4f7-4602-a1aa-5deabf2d0372",
                "key": "400da3be-b3d7-446c-9731-e8204bcb8c16"
            },
            {
                "estado": 1,
                "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
                "key_empresa": "f894ea35-5ad1-4b61-a2d0-9294965be169",
                "fecha_on": "2025-09-04T00:26:44.013",
                "monto_cierre": null,
                "key_sucursal": "a23a8cd5-840d-4099-9ddc-1a906913c8e2",
                "key_punto_venta": "7a420ece-1001-4d8a-b0f9-a8be7c0b4fee",
                "key_comprobante_cierre": null,
                "fraccionar_moneda": false,
                "fecha": "2025-09-04T00:00:00",
                "key_cuenta_contable": "79b5e41b-a3c1-41d9-a47b-6f85e989d533",
                "fecha_cierre": null,
                "key_servicio": "1427e867-c4f7-4602-a1aa-5deabf2d0372",
                "key": "5c6da3be-b3d7-446c-9731-e8204bcb8c16"
            },
        ]
        return (
            <DinamicTable
                ref={ref => (this.DinamicTable = ref)}
                loadData={async () => {
                    return this.loadInitialData();
                    // return dataprueba;
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
                                icon: <SIconApp name='addTarea' fill={STheme.color.text} />,
                                onPress: () => {
                                    SNavigation.navigate("/venta/profile", { pk: e?.row?.key })
                                }
                            },
                            {
                                label: "Imprimir tamaño carta",
                                icon: <SIcon name='imprimir' fill={STheme.color.text} />,
                                onPress: () => {
                                    ReciboCarta.imprimir(e?.row?.key)
                                }
                            },
                        ]
                    });
                }}
                loadInitialState={async () => {
                    return { sorters: [{ key: "fecha_on", order: "desc", type: "date" }] }
                }}
            >
                <DinamicTable.Col key="index" label="N°" width={30} data={(e) => e.index + 1} />
                <DinamicTable.Col key={"-keyprofile"} label='Ver' width={40} data={(e) => e.row?.key}
                    customComponent={e => <SView row center card padding={2} onPress={() => { SNavigation.navigate("/venta/profile", { pk: e.row.key }) }}>
                        <SIconApp name='Eyes' height={14} fill={STheme.color.lightGray} ></SIconApp>
                    </SView>} />
                <DinamicTable.Col key="key" label="Key" width={100} data={(e) => e.row?.key ?? ""} />
                <DinamicTable.Col key={"fecha_on"} label="Fecha" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />
                {/* <DinamicTable.Col key={"codigo"} label='Código' width={90} center data={(e) => e?.row?.codigo ?? "AL790"} customComponent={(e) => this.renderCodigo(e.data)} /> */}
                {/* <DinamicTable.Col key="sucursal" label="Sucursal" width={100} data={(e) => e.row?.sucursal?.descripcion}
                    customComponent={e => <>
                        {(e.row?.key_sucursal) ?
                            <SView col={"xs-12"} center row  >
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key_sucursal}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.sucursal?.descripcion}</SText>
                            </SView> : null}
                    </>}
                /> */}

                {/* <DinamicTable.Col key="tipo_pago" label="Tipo Pago" width={80} data={(e) => e.row?.tipo_pago ?? ""} customComponent={(e) => this.renderTipoPago(e?.data)} /> */}
                {/* <DinamicTable.Col key="state" label="Estado" width={80} data={(e) => e.row?.state ?? ""} customComponent={(e) => this.renderState(e?.data)} /> */}
                {/* <DinamicTable.Col key="descripcion" label="Descripción" width={100} data={(e) => e.row?.descripcion ?? ""} /> */}

                {/* <DinamicTable.Col key="cliente" label="Cliente" width={180} data={(e) => `${SSocket.api.root}usuario/${e.row?.key_cliente}`}
                    customComponent={e => <>
                        {(e.row?.cliente?.key_usuario) ?
                            <SView col={"xs-12"} center row  >
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${e.data}?date=${new Date().getTime()}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText color={STheme.color.text}> {e.row?.cliente?.nombres}  </SText>
                            </SView> : null}
                    </>}
                /> */}

                {/* <DinamicTable.Col key="key_cliente" label="key_cliente" width={60} data={(e) => e.row?.key_cliente ?? ""} />
                <DinamicTable.Col key="cuotas_cantidad" label="Cuotas" width={60} data={(e) => e.row?.cuotas.cantidad ?? ""} />
                <DinamicTable.Col key="cuotas_total" label="Pagar" width={60} data={(e) => e.row?.cuotas.total ?? ""} />

                <DinamicTable.Col key="monto_amortizado" label="Amortizado" width={100} data={(e) => e.row?.monto_amortizado ?? ""} />


                <DinamicTable.Col key="admin" label="Admin" width={120} data={(e) => e.row?.usuario?.Nombres ?? ""}
                    customComponent={e => <>
                        {(e.row?.key_usuario) ?
                            <SView col={"xs-12"} center row  >
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.root}usuario/${e.row?.key_usuario}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.usuario?.Nombres}</SText>
                            </SView> : null}
                    </>}
                /> */}
            </DinamicTable>
        );
    }
    render() {
        return (
            <SPage title="Tabla Historial Caja" disableScroll>
                <SView width={260} center>
                    <DateTimeBetween
                        onChange={({ fecha_inicio, fecha_fin }) => {
                            console.log("Fechas seleccionadas:", fecha_inicio, fecha_fin);
                            this.setState({ fecha_inicio, fecha_fin }); // si lo quieres en el padre
                            this.DinamicTable?.loadData(); // recargar la tabla
                        }}
                    />
                </SView>
                {this.mostrarTabla()}
                <SHr height={20} />
            </SPage>
        );
    }
}
