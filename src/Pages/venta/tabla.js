import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate, SIcon, SMath, SNotification } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import Model from '../../Model';
import ReciboCarta from '../../Components/PDF/venta/ReciboCarta';
import MDL from '../../MDL';
import FloatMenu from '../../Components/FloatMenu';
import ReciboRollo from '../../Components/PDF/venta/ReciboRollo';
import FechaFullFilter from '../../Components/FechaFullFilter';
import PopupDetalleVenta from './Components/PopupDetalleVenta';
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
export default class tabla extends Component {


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

    async loadInitialData() {
        try {
            console.log('🚀 Iniciando carga de datos...');

            // 1. Obtener registros principales
            const registros = await MDL.compra_venta.getTransaccion("venta", "2025-01-01", "2030-09-05");
            if (!registros) throw new Error("No se encontraron registros.");

            // 2. Obtener empresa y sucursales
            const empresa = await MDL.empresa.getFull();
            if (!empresa) throw new Error("No se pudo obtener la empresa.");
            const sucursales = empresa.sucursales || [];

            // 3. Filtrar ventas
            const ventas = Object.values(registros).filter(cv => cv.tipo === "venta");
            if (ventas.length === 0) throw new Error("No se encontraron ventas.");

            // 4. Obtener usuarios únicos
            const keysUsuarios = [];
            ventas.forEach(cv => {
                if (cv.key_usuario && !keysUsuarios.includes(cv.key_usuario)) {
                    keysUsuarios.push(cv.key_usuario);
                }
            });

            // 5. Cargar datos relacionados
            const proveedores = await MDL.inventario.proveedor.getAllProveedor();
            if (!proveedores) throw new Error("No se pudieron obtener proveedores.");

            const clientes = await MDL.crm.cliente.getAll();
            if (!clientes) throw new Error("No se pudieron obtener clientes.");

            const usuarios = await MDL.usuario.getByKeys(keysUsuarios);
            const usuariosMap = Array.isArray(usuarios)
                ? Object.fromEntries(usuarios.map(u => [u.key, u]))
                : usuarios || {};

            // 6. Totales de la primera venta
            let totales = {};
            try {
                totales = Model.compra_venta_detalle.Action.getTotales({ key_compra_venta: ventas[0]?.key }) || {};
            } catch (e) {
                console.warn("No se pudieron obtener los totales de la primera venta:", e);
            }

            // 7. Enriquecer ventas
            const ventasEnriquecidas = await Promise.all(
                ventas.map(async (cv) => {
                    return {
                        ...cv,
                        moneda: empresa.monedas?.find(m => m.key === cv.key_moneda) || {},
                        sucursal: sucursales.find(s => s?.key === cv?.key_sucursal) || {},
                        usuario: usuariosMap[cv?.key_usuario] || {},
                        empresa,
                        proveedor: proveedores.find(p => p.key === cv.key_proveedor) || {},
                        cliente: clientes.find(c => c?.key === cv.key_cliente) || {},
                        subtotal: totales?.subtotal || "0",
                        // descuento: totales?.descuento || "0",
                    };
                })
            );

            console.log('✅✅✅ exitosamente:', ventasEnriquecidas, "ventas.");
            // console.log('✅✅✅ exitosamente:', ventasEnriquecidas.detalles, "ventas.");
            return ventasEnriquecidas;

        } catch (error) {
            console.error("❌ Error en loadInitialData:", error?.message || error, error);
            SPopup.alert("Error al cargar los datos. Intenta nuevamente.");
            return [];
        }
    }


    // async loadInitialData() {
    //     try {
    //         console.log('Loading initial data... 🎈🎈🎈🎈');
    //         // 1. Obtener registros principales
    //         const registros = await MDL.compra_venta.getTransaccion("venta", "2025-01-01", "2030-09-05");
    //         if (!registros) return [];
    //         const empresa = await MDL.empresa.getFull();
    //         const sucursales = empresa.sucursales
    //         // 2. Filtrar ventas
    //         const ventas = Object.values(registros).filter(cv => cv.tipo === "venta");
    //         // 3. Obtener usuarios únicos
    //         const keysUsuarios = [];
    //         ventas.forEach(cv => {
    //             if (cv.key_usuario && !keysUsuarios.includes(cv.key_usuario)) {
    //                 keysUsuarios.push(cv.key_usuario);
    //             }
    //         });
    //         // 4. Cargar datos relacionados
    //         const proveedores = await MDL.inventario.proveedor.getAllProveedor();
    //         const clientes = await MDL.crm.cliente.getAll();
    //         const usuarios = await MDL.usuario.getByKeys(keysUsuarios) || {};
    //         // Normalizar usuarios en objeto { key: usuario }
    //         const usuariosMap = Array.isArray(usuarios)
    //             ? Object.fromEntries(usuarios.map(u => [u.key, u]))
    //             : usuarios;
    //         // 5. Totales de la primera venta
    //         const totales = Model.compra_venta_detalle.Action.getTotales({ key_compra_venta: ventas[0].key }) || {};
    //         // 6. Enriquecer ventas con data relacionada
    //         const ventasEnriquecidas = await Promise.all(
    //             ventas.map(async (cv) => {
    //                 return {
    //                     ...cv,
    //                     moneda: empresa.monedas.find(m => m.key === cv.key_moneda) || {},
    //                     sucursal: sucursales.find(a => a?.key === cv?.key_sucursal) || {},
    //                     usuario: usuariosMap[cv?.key_usuario] || {},
    //                     empresa,
    //                     proveedor: proveedores.find(a => a.key == proveedorEjemplo?.key) || {},
    //                     cliente: clientes.find(a => a?.key === cv.key_cliente) || {},
    //                     subtotal: totales?.subtotal || "0",
    //                     descuento: totales?.descuento || "0",
    //                 };
    //             })
    //         );
    //         console.log('Initial data loaded successfully! 🎉🎉🎉🎉');
    //         console.log(ventasEnriquecidas);
    //         return ventasEnriquecidas;
    //     } catch (error) {
    //         // console.error('Error in loadData:', error);
    //         console.error('Error in loadData:', JSON.stringify(error, null, 2));
    //         SPopup.alert('Error loading data. Please try again.');
    //         return [];
    //     }
    // }
    renderState(state) {
        const statesInfo = MDL.compra_venta.getStateInfo()[state];
        return <SView row center>
            <SView backgroundColor={statesInfo?.color} style={{ borderRadius: 4, padding: 5 }}>
                <SText color={STheme.color.text} fontSize={10}>{statesInfo?.label}</SText>
            </SView>
        </SView>
    }
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

    openPdfFromBase64(base64) {
        // Extraer la parte del contenido base64 (sin el encabezado "data:application/pdf;base64,")
        const base64Content = base64.split(",")[1];

        // Decodificar base64 a un array de bytes
        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        // Crear un Blob a partir del array de bytes
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        // Crear una URL temporal para el Blob
        const blobUrl = URL.createObjectURL(blob);

        // Abrir el PDF en una nueva pestaña
        // window.open(blobUrl);

        const width = 512;
        const height = 512;
        const left = (screen.width / 2) - (width / 2);
        const top = (screen.height / 2) - (height / 2);
        window.open(blobUrl, "fact", `width=${width},height=${height},top=${top},left=${left}`);
        // Limpia la URL cuando ya no la necesitas (opcional)
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000); // 60s
    }

    imprimirFactura(cuf) {
        SNotification.send({
            key: "imprimir",
            title: "Imprimiendo factura",
            type: "loading"
        })
        SSocket.sendPromise({
            service: "facturacion",
            component: "factura",
            type: "imprimir",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            cuf: cuf,
        }).then(e => {
            console.log(e);
            const b64 = e.data.pdf
            const pdf = `data:application/pdf;base64,${b64}`
            this.openPdfFromBase64(pdf)
            SNotification.send({
                key: "imprimir",
                title: "Factura impresa con éxito",
                body: cuf,
                color: STheme.color.success,
                time: 5000,
            })
        }).catch(e => {
            SNotification.send({
                key: "imprimir",
                title: "No se pudo imprimir la factura.",
                body: e.error,
                color: STheme.color.error,
                time: 5000,
            })
        })
    }


    mostrarTabla() {
        return (
            <DinamicTable
                ref={ref => (this.DinamicTable = ref)}
                loadData={async () => {
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


                            //        {
                            //     label: "Imprimir Recibo tamaño rollo",
                            //     icon: <SIcon name='imprimir' fill={STheme.color.text} />,
                            //     onPress: () => {
                            //         ReciboRollo.imprimir(e?.row?.key)
                            //     }
                            // },


                            {
                                label: "Imprimir Factura tamaño carta",
                                icon: <SIconApp name='imprimir' fill="#e4e4e4ff" />,
                                onPress: async () => {
                                    try {
                                        // const resp = await MDL.compra_venta.factura(e?.row?.key);
                                        // const respFormateado = JSON.stringify(resp, null, 2);
                                        // // 🟡🟡🟡🟡 seguimos trabajndo
                                        // SPopup.info(respFormateado);

                                        // ReciboRollo.imprimir(e.row?.factura?.cuf)
                                        // FacturaRollo

                                        this.imprimirFactura(e.row?.factura?.cuf)


                                    } catch (error) {
                                        console.error("Error al facturar:", error);
                                        SPopup.alert("❌ Error al crear la factura. Intenta nuevamente.");
                                    }
                                }
                            },
                            {
                                label: "Imprimir Recibo tamaño rollo",
                                icon: <SIcon name='imprimir' fill={STheme.color.text} />,
                                onPress: () => {
                                    ReciboRollo.imprimir(e?.row?.key)
                                }
                            },

                            {
                                label: "Imprimir Recibo tamaño carta",
                                icon: <SIcon name='imprimir' fill={STheme.color.text} />,
                                onPress: () => {
                                    ReciboCarta.imprimir(e?.row?.key)
                                }
                            },
                            {
                                label: "Anular la venta",
                                icon: <SIconApp name='Delete' fill={STheme.color.text} />,
                                onPress: () => {
                                    MDL.caja.anular_venta({
                                        key_compra_venta: e.row.key

                                    }).then(e => {
                                        if (this.DinamicTable) {
                                            this.DinamicTable.loadData();
                                        }
                                    }).catch(e => {

                                    })
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
                    customComponent={e => <>
                        {/* <SView row center card padding={2} onPress={() => { SNavigation.navigate("/venta/profile", { pk: e.row.key }) }}>
                            <SIconApp name='Eyes' height={14} fill={STheme.color.lightGray} ></SIconApp>
                        </SView>
                        <SHr/> */}
                        <SView row center card padding={2} onPress={() => { SNavigation.navigate("/venta/profile2", { pk: e.row.key }) }} backgroundColor={STheme.color.background}>
                            <SIconApp name='Eyes' height={14} fill={STheme.color.lightGray} ></SIconApp>
                        </SView>
                    </>} />


                <DinamicTable.Col key={"fecha_on"} label="Fecha" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />




                <DinamicTable.Col key="nrofactura" label="Nro. Factura" width={80} data={(e) => e.row?.factura?.numero}
                    customComponent={e => <>
                        {(e.row?.factura?.numero) ?
                            <SView col={"xs-12"} center row  >
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>✅ {e.row?.factura?.numero}</SText>
                            </SView> : null}
                    </>}
                />

                {/* <DinamicTable.Col key="facturar" wrap label="Venta con factura" width={60} data={(e) => e.row?.facturar}
                    customComponent={e => <>
                        {(e.row?.facturar) ?
                            <SView col={"xs-12"} center row  >
                                <SText flex style={e.textStyle}>si✅</SText>
                            </SView> : null} </>}
                /> */}


                <DinamicTable.Col key="facturar" wrap label="Venta contabilizar" width={75} center data={(e) => e.row?.facturar}
                    customComponent={e => <>
                        {(e.row?.facturar) ?
                            <SView col={"xs-12"} center row  >
                                <SView width={50} center row backgroundColor={"#295ff5ff"} style={{ borderRadius: 4, padding: 5 }}
                                    onPress={async function () {
                                        // 🔁 variable estática del onPress
                                        if (this.__pressed === undefined) {
                                            this.__pressed = false;
                                        }
                                        if (e.row?.factura?.numero) {
                                            SNotification.send({
                                                key: "fact",
                                                title: "Acción no permitida",
                                                body: "Existe una factura asociada. Anule primero.",
                                                color: STheme.color.warning,
                                                time: 5000,
                                            });
                                            return;
                                        }
                                        if (!this.__pressed) {
                                            console.log("🟢 PRIMER CLICK → CONTABILIZAR", e.row?.key);
                                            const resp = await MDL.compra_venta._contabilizar(e.row?.key);
                                            console.log(resp)
                                            SNotification.send({ key: "fact", title: "Acción " + resp, body: "Existe una factura asociada. Anule primero.", color: STheme.color.success, time: 5000, });
                                            this.__pressed = true;
                                        } else {
                                            console.log("🔴 SEGUNDO CLICK → DESCONTABILIZAR", e.row?.key);
                                            const resp = await MDL.compra_venta._desContabilizar(e.row?.key);
                                            SNotification.send({ key: "fact", title: "Acción " + resp, body: "Existe una factura asociada. Anule primero.", color: STheme.color.success, time: 5000, });
                                            console.log(resp)
                                            this.__pressed = false;
                                        }
                                    }}
                                >
                                    <SText flex style={e.textStyle}>switch</SText>
                                </SView>
                            </SView> : null}
                    </>}
                />


                <DinamicTable.Col key="state" label="Estado" width={80} data={(e) => e.row?.state ?? ""} customComponent={(e) => this.renderState(e?.data)} />

                {/* <DinamicTable.Col key={"codigo"} label='Código' width={90} center data={(e) => e?.row?.codigo ?? "AL790"} customComponent={(e) => this.renderCodigo(e.data)} /> */}
                <DinamicTable.Col key="sucursal" label="Sucursal" width={100} data={(e) => e.row?.sucursal?.descripcion}
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
                />



                <DinamicTable.Col key="cliente" label="Cliente" width={100} data={(e) => e.row?.cliente?.nombres ?? ""}
                    customComponent={e => <>
                        {(e.row?.cliente?.key) ?
                            <SView col={"xs-12"} center row  >
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.root}usuario/${e.row?.cliente?.key}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.cliente?.nombres}</SText>
                            </SView> : null}
                    </>}
                />

                <DinamicTable.Col key="nit" label="NIT" width={100} data={(e) => e.row?.cliente?.nit ?? ""} />
                <DinamicTable.Col key="razon_social" label="Razón social" width={100} data={(e) => e.row?.cliente?.razon_social ?? ""} />



                {/* <DinamicTable.Col key={"-keyprofiless"} label='Ver' width={40} data={(e) => e.row?.key}
                    customComponent={e => (
                        <SView row center card padding={2} onPress={() => {
                            PopupDetalleVenta.open({
                                detalles: e.row.detalles,
                                venta: e.row
                            })
                        }} backgroundColor={STheme.color.background}>
                            <SIconApp name='Eyes' height={14} fill={STheme.color.lightGray} />
                        </SView>
                    )}
                /> */}


                <DinamicTable.Col key="descripcion" label="Descripción" width={150} data={(e) => e.row?.descripcion ?? ""} />
                <DinamicTable.Col key="detalles_" label="Venta Detalles" width={220} data={(e) => (e.row?.detalles ?? []).map(d => d.descripcion)}
                    customComponent={(e) => (<SView col> {(e.row?.detalles ?? []).map((d, index) => (<SText key={index} fontSize={11}>• {d.descripcion} {d.precio_unitario_base} {e.row.moneda.observacion} x{d.cantidad}</SText>))} </SView>)} />

                <DinamicTable.Col key="estado_pago" wrap label="Estado de Pago" width={80}
                    data={(e) => {
                        if (e.row?.cuotas_en_mora?.monto > 0) {
                            return "En Mora";
                        }
                        if (e.row?.cuotas?.total <= e.row?.monto_amortizado) {
                            return "Pagado";
                        }
                        return "Al Día";
                    }}
                    customComponent={(e) => {
                        const statesTipo = {
                            "Al Día": { color: STheme.color.warning, label: "Al Día" },
                            "En Mora": { color: STheme.color.danger, label: "En Mora" },
                            "Pagado": { color: STheme.color.success, label: "Pagado" },
                        }[e.data] || {};
                        return <SView row center>
                            <SView backgroundColor={statesTipo?.color} style={{ borderRadius: 4, padding: 5 }}>
                                <SText color={STheme.color.text} fontSize={10}>{statesTipo?.label}</SText>
                            </SView>
                        </SView>
                    }}
                />
                <DinamicTable.Col key="cuotas_cantidad" label="# Cuotas" width={60} cellStyle={{
                    alignItems: "center"
                }} data={(e) => e.row?.cuotas.cantidad ?? ""} />
                <DinamicTable.Col wrap key="cuotas_cantidad_mora" label="# Cuotas en Mora" width={60} cellStyle={{
                    alignItems: "center",
                    backgroundColor: STheme.color.danger + "33"
                }}
                    data={(e) => e.row?.cuotas_en_mora.cantidad ?? ""}
                />
                <DinamicTable.Col key="moneda" label="Moneda" wrap width={60}
                    data={(e) => e.row?.moneda?.descripcion ?? ""}

                />
                <DinamicTable.Col key="cuotas_total" label="Monto" wrap width={60}
                    data={(e) => (e.row?.cuotas.total ? e.row.cuotas.total : "0")}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => e.row?.moneda?.observacion + " " + SMath.formatMoney(e.data)}
                />
                <DinamicTable.Col wrap key="descuento" label="Descuento" width={60} data={(e) => e.row?.descuento ?? ""}
                    // cellStyle={{
                    //     alignItems: "flex-end",
                    //     backgroundColor: STheme.color.danger + "33"

                    // }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)}
                />

                <DinamicTable.Col key="monto_amortizado" wrap label="Monto Pagado" width={60} data={(e) => e.row?.monto_amortizado ?? ""}
                    cellStyle={{
                        alignItems: "flex-end",
                        backgroundColor: STheme.color.success + "33"
                    }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />
                <DinamicTable.Col key="monto_deuda" wrap label="Deuda total" width={60}
                    data={(e) => (e.row?.cuotas?.total ?? 0) - (e.row?.monto_amortizado ?? 0) ?? ""}
                    cellStyle={{
                        alignItems: "flex-end",
                        backgroundColor: STheme.color.warning + "33"
                    }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />


                <DinamicTable.Col wrap key="en_mora" label="Monto en Mora" width={60} data={(e) => e.row?.cuotas_en_mora.monto ?? ""}
                    cellStyle={{
                        alignItems: "flex-end",
                        backgroundColor: STheme.color.danger + "33"

                    }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)}
                />

                <DinamicTable.Col key="cuotas_total_base" wrap label="Monto Base" width={60}
                    data={(e) => (e.row?.cuotas.total_base ? e.row.cuotas.total_base : "0")}
                    cellStyle={{
                        alignItems: "flex-end"
                    }}
                    format={(e) => SMath.formatMoney(e.data)}
                />
                <DinamicTable.Col key="monto_amortizado_base" wrap label="Monto Pagado Base" width={60} data={(e) => e.row?.monto_amortizado_base ?? ""}
                    cellStyle={{
                        alignItems: "flex-end",
                        backgroundColor: STheme.color.success + "33"
                    }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />
                <DinamicTable.Col key="monto_deuda_base" wrap label="Deuda total Base" width={60}
                    data={(e) => (e.row?.cuotas?.total_base ?? 0) - (e.row?.monto_amortizado_base ?? 0) ?? ""}
                    cellStyle={{
                        alignItems: "flex-end",
                        backgroundColor: STheme.color.warning + "33"
                    }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />
                <DinamicTable.Col wrap key="en_mora_base" label="Monto en Mora Base" width={60} data={(e) => e.row?.cuotas_en_mora.monto_base ?? ""}
                    cellStyle={{
                        alignItems: "flex-end",
                        backgroundColor: STheme.color.danger + "33"

                    }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)}
                />


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
                />
            </DinamicTable>
        );
    }
    render() {
        return (
            <SPage title="Tabla Gestión de Ventas" disableScroll>

                <SView row col={"xs-12"} style={{ paddingBottom: 8, paddingLeft: 8, borderBottomWidth: 1, borderColor: STheme.color.lightGray + "30", }}>


                    <SView col={"xs-12 sm-8.2 lg-3.3"} row center   >
                        <FechaFullFilter
                            //  fecha_inicio={this.state.fecha_inicio}
                            //  fecha_fin={this.state.fecha_fin}
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


                {this.mostrarTabla()}
                <SHr height={20} />
            </SPage>
        );
    }
}
