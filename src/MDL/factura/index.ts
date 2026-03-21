import SSocket from "servisofts-socket";
import Model from "../../Model";
import { Parametricas } from "./typeParametricas";
import { SNotification, SPopup, SStorage, STheme } from "servisofts-component";
import { Factura } from "./type";
import MDL from "..";
import MDLAbstract from "../MDLAbstract";
import { EventListener } from "./type";

export default class factura extends MDLAbstract<EventListener> {

    siat: any = null;
    ambiente = 1;
    constructor() {
        super();
        // SStorage.getItem("siat", (e) => {
        //     if(!e) return;
        //     this.siat = JSON.parse(e);
        // })
        SStorage.getItem("factura_ambiente", (e) => {
            if (!e) return;
            this.ambiente = parseInt(e);
        });

    }
    setAmbiente(ambiente: number) {
        this.ambiente = ambiente;
        SStorage.setItem("factura_ambiente", ambiente + "");
    }

    getAmbiente() {
        return this.ambiente;
    }

    async getSiat() {
        if (!this.siat) {
            SNotification.send({
                key: "facturacionGetSiat",
                title: "Obteniendo datos de facturación",
                type: "loading"
            })
            try {

                const resp: any = await SSocket.sendPromise({
                    service: "facturacion",
                    component: "siat",
                    type: "getAll",
                    estado: "cargando",
                    key_usuario: Model.usuario.Action.getKey(),
                    key_empresa: Model.empresa.Action.getKey(),
                }, 1000 * 60)
                const obj: any = Object.values(resp.data)[0];
                this.siat = obj;
                SNotification.send({
                    key: "facturacionGetSiat",
                    title: "Datos de facturación obtenidos",
                    color: STheme.color.success,
                    time: 5000,
                })
            } catch (e) {

                SNotification.send({
                    key: "facturacionGetSiat",
                    title: "Error al obtener datos de facturación",
                    color: STheme.color.danger,
                    time: 5000,
                })
                throw e;
            }


            // SStorage.setItem("siat", JSON.stringify(this.siat));
        }
        return this.siat;
    }

    async getFacturasFiltro(fecha_inicio: string, fecha_fin: string) {
        const resp: any = await SSocket.sendPromise({
            service: "facturacion",
            component: "reporte",
            type: "execute_function",
            func: "get_factura_filtro",
            params: [
                "'" + MDL.empresa.select?.key + "'",
                "'" + fecha_inicio + "'",
                "'" + fecha_fin + "'"
            ],
        });
        return resp.data || [];
    }
    async getParametricas({ ambiente = 1 }: { ambiente?: number }) {
        await this.getSiat();
        if (ambiente == 2) return this.siat.parametricasPruebas as Parametricas;
        return this.siat.parametricas as Parametricas;
    }

    async getParametrica({ ambiente = 1, parametrica }: { ambiente?: number, parametrica: keyof Parametricas }) {
        const resp: any = await SSocket.sendPromise({
            service: "facturacion",
            component: "siat",
            type: "getParametrica",
            ambiente: ambiente,
            parametrica: parametrica,
            estado: "cargando",
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
        }, 1000 * 60)
        return resp.data as Parametricas[typeof parametrica];
    }

    async importarXml(props: { xml: string, ambiente: number }) {
        const resp: any = await SSocket.sendPromise({
            service: "facturacion",
            component: "factura",
            type: "subirXML",
            xml: props.xml,
            ambiente: props.ambiente,
            estado: "cargando",
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
        })
        return resp
    }
    async emitir(fact: Factura, ambiente = 1) {

        const resp: any = await SSocket.sendPromise({
            service: "facturacion",
            component: "factura",
            type: "emitir",
            data: fact.data,
            ambiente: ambiente,
            estado: "cargando",
            enviar_siat: true,
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
        }, 1000 * 60)
        return resp
    }
    async verificarNit(nit: string) {
        const resp: any = await SSocket.sendPromise({
            service: "facturacion",
            component: "factura",
            type: "verificarNit",
            nit: nit,
            nitEmisor: Model.empresa.Action.getSelect().nit,
            estado: "cargando",
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
        }, 1000 * 60)
        return resp
    }


    imprimir({ cuf = "", tipo = "carta" }: { cuf: string, tipo?: "carta" | "rollo" }) {
        SNotification.send({
            key: "imprimirFactura" + cuf,
            title: "Imprimiendo factura",
            body: cuf,
            type: "loading"
        })
        SSocket.sendPromise({
            service: "facturacion",
            component: "factura",
            type: "imprimir",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            tipo: tipo,
            cuf: cuf,
        }, 1000 * 60).then((e: any) => {

            const b64 = e.data.pdf
            const pdf = `data:application/pdf;base64,${b64}`
            this.openPdfFromBase64(pdf)

            // this.componentDidMount()
            SNotification.send({
                key: "imprimirFactura" + cuf,
                title: "Factura impresa con éxito",
                body: cuf,
                color: STheme.color.success,
                time: 5000,
            })
        }).catch(e => {
            SNotification.send({
                key: "imprimirFactura" + cuf,
                title: "No se pudo imprimir la factura.",
                body: e.error,
                color: STheme.color.error,
                time: 5000,
            })
        })
    }
    verificarEstado({ cuf = "" }) {
        return new Promise((resolve, reject) => {
            SNotification.send({
                key: "verificarEstado" + cuf,
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
            }).then((e: any) => {
                // this.componentDidMount()
                // SPopup.close("anularpop")
                SNotification.send({
                    key: "verificarEstado" + cuf,
                    title: "Verificando estado",
                    body: e.data.codigoDescripcion,
                    color: STheme.color.success,
                    time: 5000,
                })
                resolve(e)
            }).catch(e => {
                SNotification.send({
                    key: "verificarEstado" + cuf,
                    title: "No se pudo verificar estado.",
                    body: cuf,
                    color: STheme.color.error,
                    time: 5000,
                })
                reject(e)
            })
        })
    }


    reenviar({ cuf = "" }) {
        return new Promise((resolve, reject) => {
            SPopup.confirm({
                title: "Seguro de reenviar",
                message: "reenviar?",
                onPress: () => {
                    SNotification.send({
                        key: "reenviar" + cuf,
                        title: "Reenviar factura",
                        // color: STheme.color.success,
                        type: "loading"
                    })
                    SSocket.sendPromise({
                        service: "facturacion",
                        component: "factura",
                        type: "reenviar",
                        key_empresa: Model.empresa.Action.getKey(),
                        key_usuario: Model.usuario.Action.getKey(),
                        cuf: cuf,
                    }).then((e: any) => {
                        console.log(e);

                        // const b64 = e.data.pdf
                        // const pdf = `data:application/pdf;base64,${b64}`
                        // this.openPdfFromBase64(pdf)

                        // this.componentDidMount()
                        SNotification.send({
                            key: "reenviar" + cuf,
                            title: "Factura reenviada con éxito",
                            body: cuf,
                            color: STheme.color.success,
                            time: 5000,
                        })
                        resolve(e)
                    }).catch(e => {
                        SNotification.send({
                            key: "reenviar" + cuf,
                            title: "No se pudo reenviar la factura.",
                            body: JSON.stringify(e?.error),
                            color: STheme.color.error,
                            time: 5000,
                        })
                        reject(e)
                    })
                }
            })
        })
    }
    reconstruir({ cuf = "" }) {
        return new Promise((resolve, reject) => {
            SPopup.confirm({
                title: "Seguro de reconstruir",
                message: "reconstruir?",
                onPress: () => {
                    SNotification.send({
                        key: "reconstruir" + cuf,
                        title: "reconstruir factura",
                        // color: STheme.color.success,
                        type: "loading"
                    })
                    SSocket.sendPromise({
                        service: "facturacion",
                        component: "factura",
                        type: "reconstruir",
                        key_empresa: Model.empresa.Action.getKey(),
                        key_usuario: Model.usuario.Action.getKey(),
                        cuf: cuf,
                    }).then((e: any) => {
                        console.log(e);
                        // const b64 = e.data.pdf
                        // const pdf = `data:application/pdf;base64,${b64}`
                        // this.openPdfFromBase64(pdf)
                        // this.componentDidMount()
                        SNotification.send({
                            key: "reconstruir" + cuf,
                            title: "Factura reconstruida con éxito",
                            body: cuf,
                            color: STheme.color.success,
                            time: 5000,
                        })
                        resolve(e)
                        return e;
                    }).catch(e => {
                        SNotification.send({
                            key: "reconstruir" + cuf,
                            title: "No se pudo reconstruir la factura.",
                            body: e.error,
                            color: STheme.color.error,
                            time: 5000,
                        })
                        reject(e)
                    })
                }
            })
        })
    }
    revertir({ cuf = "" }) {

        SNotification.send({
            key: "revertir" + cuf,
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
                    SNotification.send({
                        key: "revertir" + cuf,
                        title: "Factura revertido con éxito",
                        body: cuf,
                        color: STheme.color.success,
                        time: 5000,
                    })
                }).catch(e => {
                    SNotification.send({
                        key: "revertir" + cuf,
                        title: "No se pudo revertir la factura.",
                        body: e.error,
                        color: STheme.color.error,
                        time: 5000,
                    })
                })
            }
        })
    }

    eliminarFactura(factura_key: any) {
        const ___data = {
            key: factura_key,
            // estado: 0
            state: "anulada"
        }
        return new Promise((resolve, reject) => {
            SPopup.confirm({
                title: "Seguro de eliminar",
                message: "¿Estás seguro de eliminar la factura?",
                onPress: () => {
                    SNotification.send({
                        key: "eliminarFactura" + factura_key,
                        title: "Eliminando factura",
                        type: "loading"
                    });
                    SSocket.sendPromise({
                        service: "facturacion",
                        component: "factura",
                        type: "editar", // Cambia a la acción correcta según tu backend
                        key_empresa: Model.empresa.Action.getKey(),
                        key_usuario: Model.usuario.Action.getKey(),
                        data: ___data
                    }).then((e) => {
                        SNotification.send({
                            key: "eliminarFactura" + factura_key,
                            title: "Factura eliminada con éxito",
                            body: factura_key,
                            color: STheme.color.success,
                            time: 5000,
                        });
                        resolve(e);
                    }).catch((e) => {
                        SNotification.send({
                            key: "eliminarFactura" + factura_key,
                            title: "No se pudo eliminar la factura",
                            body: e.error,
                            color: STheme.color.error,
                            time: 5000,
                        });
                        reject(e);
                    });
                }
            });

        });
    }


    async editarDetalle(factura_key: string, factura_data: any, nuevoDetalle: any[]) {
        const payload = {
            key: factura_key,
            data: {
                ...factura_data,
                detalle: nuevoDetalle
            }
        };

        console.clear();
        console.log("%c" + JSON.stringify(payload), `color: #2ECC40; font-weight: bold;`);
        // return;
        try {
            const result = await SSocket.sendPromise({
                service: "facturacion",
                component: "factura",
                type: "editar",
                key_empresa: Model.empresa.Action.getKey(),
                key_usuario: Model.usuario.Action.getKey(),
                data: payload
            });

            SNotification.send({
                key: "editarDetalle_" + factura_key,
                title: "Detalle actualizado",
                body: "El detalle de la factura fue actualizado correctamente.",
                color: STheme.color.success,
                time: 5000,
            });

            return result;
        } catch (error: any) {
            SNotification.send({
                key: "editarDetalle_" + factura_key,
                title: "Error al actualizar detalle",
                body: error?.error || "Error desconocido.",
                color: STheme.color.error,
                time: 5000,
            });
            throw error;
        }
    }


    editarLeyenda(factura_key: any, factura_data: any, leyenda___: any) {
        const ___data = {
            key: factura_key,
            data: {
                ...factura_data,
                leyenda: leyenda___
            }
        };

        // console.log("Dddddddddd " + JSON.stringify(___data))
        // return;
        return SSocket.sendPromise({
            service: "facturacion",
            component: "factura",
            type: "editar", // Asegúrate que esta acción sea la correcta en el backend
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            data: ___data
        }).then((e) => {
            SNotification.send({
                key: "editarFactura_" + factura_key,
                title: "Leyenda actualizada",
                body: "La leyenda fue actualizada correctamente.",
                color: STheme.color.success,
                time: 5000,
            });
            return e; // Devuelve el resultado de la promesa
        }).catch((e) => {
            SNotification.send({
                key: "editarFactura_" + factura_key,
                title: "Error al actualizar leyenda",
                body: e?.error || "Error desconocido.",
                color: STheme.color.error,
                time: 5000,
            });
            throw e; // Lanza el error para que quien llame pueda manejarlo con try/catch
        });
    }

    async getClientes(buscar: string) {
        const resp: any = await SSocket.sendPromise({
            service: "facturacion",
            component: "factura",
            type: "getClientes",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            buscador: buscar,
        });
        return resp.data;
    }
    openPdfFromBase64(base64: any) {
        // Extraer la parte del contenido base64 (sin el encabezado "data:application/pdf;base64,")
        const base64Content = base64.split(",")[1];

        // Decodificar base64 a un array de bytes
        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        // Crear un Blob a partir del array de bytes
        const byteArray: any = new Uint8Array(byteNumbers);
        // @ts-ignore
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        // Crear una URL temporal para el Blob
        const blobUrl = URL.createObjectURL(blob);

        // Abrir el PDF en una nueva pestaña
        // @ts-ignore
        // window.open(blobUrl);
        const nuevaVentana = window.open(
            blobUrl,
            '_blank',
            'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=800,height=600,left=100,top=100'
        );
        // Limpia la URL cuando ya no la necesitas (opcional)
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000); // 60s
    }


}