import React, { Component } from 'react';
import { View, Text, Linking } from 'react-native';
import { SButtom, SDate, SHr, SIcon, SMath, SNotification, SPage, STable, STable2, SText, STheme, SView } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import PDF from './pdf';
import { ConstNode } from 'three/examples/jsm/nodes/Nodes';
import { SPopup } from 'servisofts-component';
import SelectTipoAnulacion from './Components/SelectTipoAnulacion';
import MDL from '../../MDL';

export default class libro_ventas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            parametricas: {}
        };
    }
    componentDidMount() {
        SSocket.sendPromise({
            service: "facturacion",
            component: "factura",
            type: "getAll",
            estado: "cargando",
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
        }).then(e => {
            this.setState({ data: e.data })
        }).catch(e => {
            console.error(e);
        })

        MDL.factura.getParametrica({ ambiente: MDL.factura.ambiente, parametrica: "motivoAnulacion" }).then((res) => {
            this.state.parametricas.motivoAnulacion = res;
            this.setState({ ...this.state })
        }).catch(e => {
            console.error(e);
        })


    }

    anular(cuf) {
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
    verificarEstado(cuf) {
        SNotification.send({
            key: "verificarEstado",
            title: "Verificando estado",
            // color: STheme.color.success,
            type: "loading"
        })
        SSocket.sendPromise({
            service: "facturacion",
            component: "factura",
            type: "verificarEstado",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            ambiente: MDL.factura.ambiente,
            cuf: cuf,
        }).then(e => {
            this.componentDidMount()
            // SPopup.close("anularpop")
            SNotification.send({
                key: "verificarEstado",
                title: "Verificando estado",
                body: e.data.codigoDescripcion,
                color: STheme.color.success,
                time: 5000,
            })
        }).catch(e => {
            SNotification.send({
                key: "verificarEstado",
                title: "No se pudo verificar estado.",
                body: cuf,
                color: STheme.color.error,
                time: 5000,
            })
        })
    }
    revertir(cuf) {
        SNotification.send({
            key: "revertir",
            title: "Revertir factura",
            // color: STheme.color.success,
            type: "loading"
        })
        SPopup.confirm({
            title: "Seguro de revertir",
            message: "revertir?",
            onPress: () => {
                SSocket.sendPromise({
                    service: "facturacion",
                    component: "factura",
                    type: "revertir",
                    key_empresa: Model.empresa.Action.getKey(),
                    key_usuario: Model.usuario.Action.getKey(),
                    cuf: cuf,
                }).then(e => {
                    this.componentDidMount()
                    SNotification.send({
                        key: "revertir",
                        title: "Factura revertido con éxito",
                        body: cuf,
                        color: STheme.color.success,
                        time: 5000,
                    })
                }).catch(e => {
                    SNotification.send({
                        key: "revertir",
                        title: "No se pudo revertir la factura.",
                        body: e.error,
                        color: STheme.color.error,
                        time: 5000,
                    })
                })
            }
        })
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

    reenviar(cuf) {
        SNotification.send({
            key: "reenviar",
            title: "Revertir factura",
            // color: STheme.color.success,
            type: "loading"
        })
        SPopup.confirm({
            title: "Seguro de reenviar",
            message: "reenviar?",
            onPress: () => {
                SSocket.sendPromise({
                    service: "facturacion",
                    component: "factura",
                    type: "reenviar",
                    key_empresa: Model.empresa.Action.getKey(),
                    key_usuario: Model.usuario.Action.getKey(),
                    cuf: cuf,
                }).then(e => {
                    console.log(e);

                    const b64 = e.data.pdf
                    const pdf = `data:application/pdf;base64,${b64}`
                    this.openPdfFromBase64(pdf)

                    // this.componentDidMount()
                    SNotification.send({
                        key: "reenviar",
                        title: "Factura reenviada con éxito",
                        body: cuf,
                        color: STheme.color.success,
                        time: 5000,
                    })
                }).catch(e => {
                    SNotification.send({
                        key: "reenviar",
                        title: "No se pudo reenviar la factura.",
                        body: e.error,
                        color: STheme.color.error,
                        time: 5000,
                    })
                })
            }
        })
    }

    imprimir(cuf) {
        SNotification.send({
            key: "imprimir",
            title: "Imprimiendo factura",
            // color: STheme.color.success,
            type: "loading"
        })
        // SPopup.confirm({
        //     title: "Seguro de imprimir",
        //     message: "imprimir?",
        //     onPress: () => {
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

            // this.componentDidMount()
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
        // }
        // })
    }
    render() {
        return <SPage title={"Facturacion - libro ventas"} disableScroll>
            <STable2 data={this.state?.data ?? {}}
                rowHeight={30}
                cellStyle={{
                    fontSize: 12,
                    padding: 4,
                    overflow: 'hidden',
                }}

                header={[
                    { key: "index", width: 30, label: "#" },
                    // { key: "key_empresa", width: 200, label: "Empresa" },
                    {
                        key: "data/urlImpuestos", width: 50, label: "SIAT",
                        component: a => <SText color={STheme.color.link} underLine onPress={() => Linking.openURL(a)}>{"SIAT"}</SText>

                    },
                    // {
                    //     key: "-verpdf", width: 50, label: "PDF",
                    //     // render: a => `https://serp.servisofts.com/facturacion/pdf?key=${a.key}`,
                    //     render: a => `http://localhost:3010/facturacion/pdf?key=${a.key}`,
                    //     component: a => <SText color={STheme.color.link} underLine onPress={() => Linking.openURL(a)}>{"PDF"}</SText>
                    //     // component: a => <SText color={STheme.color.link} underLine onPress={() => PDF.handlePress(a)}>{"PDF"}</SText>

                    // },
                    {
                        key: "ambiente", width: 40, label: "Ambiente", center: true,
                        filter_h: MDL.factura.ambiente + "",
                        component: (e) => {
                            if (e == 1) {
                                return <SView backgroundColor={STheme.color.success} width={20} height={20} borderRadius={4} center>
                                    <SText bold>{"1"}</SText>
                                </SView>
                            } else {
                                return <SView backgroundColor={STheme.color.warning} width={20} height={20} borderRadius={4} center>
                                    <SText bold>{e}</SText>
                                </SView>
                            }
                        }
                    },
                    {
                        key: "state-a", label: "EC", width: 70, component: (e) => {
                            if (e == "enviada") {
                                return <SView backgroundColor={STheme.color.success} width={60} height={20} borderRadius={4} center><SText fontSize={10}>{e}</SText></SView>
                            } else if (e == "procesando") {
                                return <SView backgroundColor={STheme.color.gray} width={60} height={20} borderRadius={4} center><SText fontSize={10}>{e}</SText></SView>
                            } else if (e == "emitida") {
                                return <SView backgroundColor={STheme.color.warning} width={60} height={20} borderRadius={4} center><SText fontSize={10}>{e}</SText></SView>
                            } else if (e == "anulada") {
                                return <SView backgroundColor={STheme.color.danger} width={60} height={20} borderRadius={4} center><SText fontSize={10}>{e}</SText></SView>
                            }
                        }
                    },
                    // { key: "data/estado", width: 70, label: "Estado" },
                    { key: "data/fechaEmision", width: 110, label: "Fecha", type: "date", render: a => new SDate(a, "yyyy-MM-ddThh:mm:ss").toString("MON dd, yyyy  hh:mm") },
                    { key: "data/numeroFactura", width: 50, order: "asc", orderType: "number", label: "Numero", center: true },
                    { key: "data/numeroDocumento", width: 80, label: "NIT/CI CLIENTE" },
                    {
                        key: "data-subtotal", width: 80,
                        label: "Sub Total",
                        sumar: true,
                        cellStyle: { textAlign: "right" },
                        // onPress: (e, obj) => { console.log(e, obj) },
                        render: a => {
                            let subtotal = 0;
                            a.detalle.forEach(e => {
                                subtotal += (parseFloat(e.precioUnitario ?? 0) * parseFloat(e.cantidad ?? 0))
                            })
                            return SMath.formatMoney(subtotal);
                        }
                    },
                    { key: "data/nombreRazonSocial", width: 150, label: "NOMBRE O RAZON SOCIAL" },
                    // { key: "data/cuf", width: 120, label: "Codigo de control" },
                    // { key: "state", width: 100, label: "ESTADO" },
                    {
                        key: "data/cuf-anular", width: 50, label: "ANULAR",
                        component: (e, obj) => {
                            console.log(obj);
                            if (obj.state != "enviada") return null;
                            return <SView padding={3} width={30} height={30}  ><SIcon name='Delete' /></SView>
                        },
                        onPress: (cuf, obj) => {
                            if (obj.state != "enviada") return null;
                            this.anular(cuf)
                        }
                    },
                    {
                        key: "data/cuf-revertir", width: 50, label: "REVERTIR",
                        component: (e, obj) => {
                            if (obj.state != "anulada") return null;
                            return <SView padding={3} width={30} height={30}  ><SIcon name='revertir' /></SView>
                        },
                        onPress: (cuf, obj) => {
                            if (obj.state != "anulada") return null;
                            this.revertir(cuf)
                        }
                    },
                    {
                        key: "data/cuf-imprimir", width: 50, label: "IMPRIMIR",
                        component: (e) => <SView padding={3} width={30} height={30}  ><SIcon name='imprimir' /></SView>,
                        onPress: (cuf) => { this.imprimir(cuf) }
                    },
                    {
                        key: "data/cuf-verificar", width: 50, label: "VERIFICAR",
                        component: (e) => <SView width={30} height={30} padding={3} ><SIcon name='Wifi' /></SView>,
                        onPress: (cuf) => { this.verificarEstado(cuf) }
                    },
                    {
                        key: "data/cuf-enviar", width: 50, label: "REENVIAR",
                        component: (e, obj) => {
                            if (obj.state != "emitida") return null;
                            return <SView padding={3} width={30} height={30}  ><SIcon name='MessageSend' /></SView>
                        },

                        onPress: (cuf, obj) => {
                            if (obj.state != "emitida") return null;
                            this.reenviar(cuf)
                        }
                    },
                    { key: "data/cuf", width: 270, label: "CUF", cellStyle: { fontSize: 10 } },


                ]}
            />
        </SPage>
    }
}
