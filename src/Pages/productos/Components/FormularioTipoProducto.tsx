import React, { Component } from 'react';
import { SForm, SHr, SLoad, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import Btn from '../../empresa/config/Components/Btn';
import InputFoto from '../../../Components/InputFoto';
import CuentasAnidadas from "../../../Pages/conta/cuentas_anidadas";

type Props = { editObject?: any, onCancel?: Function, onSuccess?: Function, }

const cuentaToText = (c: any) => c ? `${c.codigo} - ${c.descripcion}` : "";
const findCuentaText = (arr: any[], text: string) => arr.find(c => cuentaToText(c) === text) ?? null;

export default class FormularioTipoProducto extends Component<Props> {

    static open(props: Props) {
        SPopup.open({
            key: "FormularioTipoProducto",
            content: <SView style={{ width: "100%", maxHeight: "100%", maxWidth: 500, borderRadius: 8, borderColor: STheme.color.card, borderWidth: 1, backgroundColor: STheme.color.background }} withoutFeedback>
                <FormularioTipoProducto
                    {...props}
                    onCancel={() => {
                        SPopup.close("FormularioTipoProducto");
                        props.onCancel?.();
                    }}
                    onSuccess={(e: any) => {
                        SPopup.close("FormularioTipoProducto");
                        props.onSuccess?.(e);
                    }}
                />
            </SView>
        })
    }

    state: any = {
        tipo: this.props.editObject ? this.props.editObject.tipo : MDL.inventario.TIPOS_DE_PRODUCTOS[0].key,
        cuentas: null,
        productosServicios: [],
        unidadMedida: [],
        codigoProductoSeleccionado: this.props.editObject?.codigo_facturacion ?? "",
        unidadMedidaSeleccionada: this.props.editObject?.unidad_medida_facturacion ?? ""
    }

    componentDidMount(): void {

        MDL.contabilidad.getCuentas().then(cuentas => {
            const arrCuentas = Object.values(cuentas);
            arrCuentas.forEach((cuenta: any) => {
                const hijas = arrCuentas.filter((c: any) => c.codigo.startsWith(cuenta.codigo) && c.codigo != cuenta.codigo);
                cuenta.cantidad_hijas = hijas.length;
            })
            this.setState({ cuentas: arrCuentas.sort((a: any, b: any) => (a.codigo > b.codigo ? 1 : -1)) });
        }).catch(console.error);


        MDL.factura.getParametrica({ ambiente: 2, parametrica: "productosServicios" })
            .then(parametricas => {
                this.setState({ productosServicios: parametricas });

                if (this.props.editObject?.codigo_facturacion) {
                    const prod = parametricas.find((p: any) =>
                        p.codigoProducto === this.props.editObject.codigo_facturacion
                    );
                    if (prod) this.setState({ codigoProductoSeleccionado: prod.codigoProducto });
                }
            }).catch(console.error);


        MDL.factura.getParametrica({ ambiente: 2, parametrica: "unidadMedida" })
            .then(parametricas => {
                this.setState({ unidadMedida: parametricas });

                if (this.props.editObject?.unidad_medida_facturacion) {
                    const unidad = parametricas.find((u: any) =>
                        u.codigoClasificador === this.props.editObject.unidad_medida_facturacion
                    );
                    if (unidad) this.setState({ unidadMedidaSeleccionada: unidad.codigoClasificador });
                }
            }).catch(console.error);

    }

    _ref: any = {}
    form: SForm | undefined = undefined;

    render() {
        if (!this.state.cuentas) return <SLoad />

        const tipo = MDL.inventario.TIPOS_DE_PRODUCTOS.find(a => a.key === this.state.tipo);
        console.log("SELECT OBJECT", this.props.editObject)
        console.log("TIPOOO", this.state.tipo)
        console.log("TIPOOO", tipo)
        let cuentaSeleccionadaG;
        let cuentaSeleccionadaC;
        let cuentaSeleccionadaI;
        let cuentaSeleccionadaDA;
        let cuentaSeleccionadaDG;
        if (this.props?.editObject?.key_cuenta_contable_ganancia) {
            let allCuentas = this.state.cuentas;
            console.log(this.props?.editObject?.key_cuenta_contable_ganancia)
            console.log("allCuentas", allCuentas)
            cuentaSeleccionadaG = allCuentas.filter(c => c.key === this.props?.editObject.key_cuenta_contable_ganancia)[0]
            console.log("cuentaSeleccionadaG", cuentaSeleccionadaG)
        }
        if (this.props?.editObject?.key_cuenta_contable_costo) {
            let allCuentas = this.state.cuentas;
            console.log(this.props?.editObject?.key_cuenta_contable_costo)
            console.log("allCuentas", allCuentas)
            cuentaSeleccionadaC = allCuentas.filter(c => c.key === this.props?.editObject.key_cuenta_contable_costo)[0]
            console.log("cuentaSeleccionadaC", cuentaSeleccionadaC)
        }
        if (this.props?.editObject?.key_cuenta_contable) {
            let allCuentas = this.state.cuentas;
            console.log(this.props?.editObject?.key_cuenta_contable)
            console.log("allCuentas", allCuentas)
            cuentaSeleccionadaI = allCuentas.filter(c => c.key === this.props?.editObject.key_cuenta_contable)[0]
            console.log("cuentaSeleccionadaI", cuentaSeleccionadaI)
        }
        if (this.props?.editObject?.key_cuenta_contable_depreciacion_activo) {
            let allCuentas = this.state.cuentas;
            console.log(this.props?.editObject?.key_cuenta_contable_depreciacion_activo)
            console.log("allCuentas", allCuentas)
            cuentaSeleccionadaDA = allCuentas.filter(c => c.key === this.props?.editObject.key_cuenta_contable_depreciacion_activo)[0]
            console.log("cuentaSeleccionadaDA", cuentaSeleccionadaDA)
        }
        if (this.props?.editObject?.key_cuenta_contable_depreciacion_gasto) {
            let allCuentas = this.state.cuentas;
            console.log(this.props?.editObject?.key_cuenta_contable_depreciacion_gasto)
            console.log("allCuentas", allCuentas)
            cuentaSeleccionadaDG = allCuentas.filter(c => c.key === this.props?.editObject.key_cuenta_contable_depreciacion_gasto)[0]
            console.log("cuentaSeleccionadaDG", cuentaSeleccionadaDG)
        }
        return (
            <SView col="xs-12" center padding={16}>
                <SText fontSize={16}>{this.props.editObject ? "Editar" : "Crear"} Tipo Producto</SText>

                <SForm
                    ref={(ref: any) => this.form = ref}
                    row
                    style={{ justifyContent: "space-between" }}
                    inputs={{

                        descripcion: {
                            col: "xs-12",
                            label: "Nombre",
                            placeholder: "Ingresa el nombre",
                            isRequired: true,
                            defaultValue: this.props.editObject?.descripcion,
                            icon: <InputFoto
                                ref={r => this._ref.image_perfil = r}
                                src={(SSocket.api as any).inventario + "tipo_producto/.128_" + this.props.editObject?.key}
                                style={{ width: 50, height: 50 }}
                            />
                        },

                        tipo: {
                            col: "xs-12",
                            type: "select2",
                            label: "Tipo",
                            defaultValue: this.props.editObject?.tipo ?? "inventario",
                            options: MDL.inventario.TIPOS_DE_PRODUCTOS.map(a => a.key),
                            onChangeText: (text: string) => this.setState({ tipo: text })
                        },

                        codigo_facturacion: {
                            col: "xs-5.8",
                            type: "select2",
                            label: "Código Facturación",
                            options: this.state.productosServicios.map(a => ({
                                key: a.codigoProducto,
                                content: `${a.codigoProducto} - ${a.descripcionProducto}`
                            })),
                            defaultValue: this.props.editObject?.codigo_facturacion ?? "",
                            onChangeText: (text: string) => {
                                const codigo = text.split(" - ")[0];
                                this.setState({ codigoProductoSeleccionado: codigo });
                            }
                        },

                        unidad_medida_facturacion: {
                            col: "xs-5.8",
                            type: "select2",
                            label: "Unidad Medida Facturación",
                            options: this.state.unidadMedida.map(a => ({
                                key: a.codigoClasificador,
                                content: `${a.codigoClasificador} - ${a.descripcion}`
                            })),
                            defaultValue: this.props.editObject?.unidad_medida_facturacion ?? "",
                            onChangeText: (text: string) => {
                                const codigo = text.split(" - ")[0];
                                this.setState({ unidadMedidaSeleccionada: codigo });
                            }
                        },

                        ...tipo?.cuentas?.includes("key_cuenta_contable_ganancia") ? {
                            key_cuenta_contable_ganancia: {
                                col: "xs-12",
                                // type: "select2",
                                label: "Cuenta de Ganancia",
                                // defaultValue: cuentaToText(this.state.cuentas.find(c => c.key === this.props.editObject?.key_cuenta_contable_ganancia)),
                                value:
                                    this.state.cuentaSeleccionadaG
                                        ? `${this.state.cuentaSeleccionadaG.codigo} - ${this.state.cuentaSeleccionadaG.descripcion}`
                                        : this.props.editObject?.key_cuenta_contable_ganancia ? `${cuentaSeleccionadaG?.codigo} - ${cuentaSeleccionadaG?.descripcion}` : ""
                                ,
                                // options: this.state.cuentas.filter(c => c.cantidad_hijas <= 0 && c.tipo === "INGRESO").map(cuentaToText)
                                onPress: () => {
                                    SPopup.open({
                                        key: "popup-cuentas",
                                        content: <SView
                                            style={{
                                                width: "100%",
                                                height: 500,
                                                maxWidth: 1000,
                                                borderRadius: 8,
                                                borderWidth: 1,
                                                borderColor: STheme.color.card,
                                                backgroundColor: STheme.color.background,
                                                overflow: "hidden"

                                            }} withoutFeedback>
                                            <CuentasAnidadas
                                                select={(cuentaSelec: any) => {
                                                    console.log("SELECCIONADO:", cuentaSelec)
                                                    this.setState({
                                                        cuentaSeleccionadaG: cuentaSelec
                                                    });
                                                    SPopup.close("popup-cuentas");
                                                }}
                                                keyEdit= {this.props.editObject?.key_cuenta_contable_ganancia ? this.props.editObject?.key_cuenta_contable_ganancia : null}
                                            // filtroTipo="INGRESO"
                                            />
                                        </SView>
                                    });
                                },
                            }
                        } : {},

                        ...tipo?.cuentas?.includes("key_cuenta_contable_costo") ? {
                            key_cuenta_contable_costo: {
                                col: "xs-12",
                                label: "Cuenta de Costo",
                                value:
                                    this.state.cuentaSeleccionadaC
                                        ? `${this.state.cuentaSeleccionadaC.codigo} - ${this.state.cuentaSeleccionadaC.descripcion}`
                                        : this.props.editObject?.key_cuenta_contable_costo ? `${cuentaSeleccionadaC?.codigo} - ${cuentaSeleccionadaC?.descripcion}` : ""
                                ,
                                onPress: () => {
                                    SPopup.open({
                                        key: "popup-cuentas",
                                        content: <SView
                                            style={{
                                                width: "100%",
                                                height: 500,
                                                maxWidth: 1000,
                                                borderRadius: 8,
                                                borderWidth: 1,
                                                borderColor: STheme.color.card,
                                                backgroundColor: STheme.color.background,
                                                overflow: "hidden"

                                            }} withoutFeedback>
                                            <CuentasAnidadas
                                                select={(cuentaSelec: any) => {
                                                    console.log("SELECCIONADO:", cuentaSelec)
                                                    this.setState({
                                                        cuentaSeleccionadaC: cuentaSelec
                                                    });
                                                    SPopup.close("popup-cuentas");
                                                }}
                                                keyEdit= {this.props.editObject?.key_cuenta_contable_costo ? this.props.editObject?.key_cuenta_contable_costo : null}
                                            // filtroTipo="GASTO"
                                            />
                                        </SView>
                                    });
                                },
                            }
                        } : {},

                        ...tipo?.cuentas?.includes("key_cuenta_contable") ? {
                            key_cuenta_contable: {
                                col: "xs-12",
                                label: "Cuenta de Inventario",
                                value:
                                    this.state.cuentaSeleccionadaI
                                        ? `${this.state.cuentaSeleccionadaI.codigo} - ${this.state.cuentaSeleccionadaI.descripcion}`
                                        : this.props.editObject?.key_cuenta_contable ? `${cuentaSeleccionadaI?.codigo} - ${cuentaSeleccionadaI?.descripcion}` : ""
                                ,
                                onPress: () => {
                                    SPopup.open({
                                        key: "popup-cuentas",
                                        content: <SView
                                            style={{
                                                width: "100%",
                                                height: 500,
                                                maxWidth: 1000,
                                                borderRadius: 8,
                                                borderWidth: 1,
                                                borderColor: STheme.color.card,
                                                backgroundColor: STheme.color.background,
                                                overflow: "hidden"

                                            }} withoutFeedback>
                                            <CuentasAnidadas
                                                select={(cuentaSelec: any) => {
                                                    console.log("SELECCIONADO:", cuentaSelec)
                                                    this.setState({
                                                        cuentaSeleccionadaI: cuentaSelec
                                                    });
                                                    SPopup.close("popup-cuentas");
                                                }}
                                                keyEdit= {this.props.editObject?.key_cuenta_contable ? this.props.editObject?.key_cuenta_contable : null}
                                            // filtroTipo="ACTIVO"
                                            />
                                        </SView>
                                    });
                                },
                            }
                        } : {},

                        ...tipo?.cuentas?.includes("key_cuenta_contable_depreciacion_activo") ? {
                            key_cuenta_contable_depreciacion_activo: {
                                col: "xs-12",
                                label: "Cuenta de Depreciación de Activo",
                                value:
                                    this.state.cuentaSeleccionadaDA
                                        ? `${this.state.cuentaSeleccionadaDA.codigo} - ${this.state.cuentaSeleccionadaDA.descripcion}`
                                        : this.props.editObject?.key_cuenta_contable_depreciacion_activo ? `${cuentaSeleccionadaDA?.codigo} - ${cuentaSeleccionadaDA?.descripcion}` : ""
                                ,
                                onPress: () => {
                                    SPopup.open({
                                        key: "popup-cuentas",
                                        content: <SView
                                            style={{
                                                width: "100%",
                                                height: 500,
                                                maxWidth: 1000,
                                                borderRadius: 8,
                                                borderWidth: 1,
                                                borderColor: STheme.color.card,
                                                backgroundColor: STheme.color.background,
                                                overflow: "hidden"

                                            }} withoutFeedback>
                                            <CuentasAnidadas
                                                select={(cuentaSelec: any) => {
                                                    console.log("SELECCIONADO:", cuentaSelec)
                                                    this.setState({
                                                        cuentaSeleccionadaDA: cuentaSelec
                                                    });
                                                    SPopup.close("popup-cuentas");
                                                }}
                                                keyEdit= {this.props.editObject?.key_cuenta_contable_depreciacion_activo ? this.props.editObject?.key_cuenta_contable_depreciacion_activo : null}
                                            // filtroTipo="ACTIVO"
                                            />
                                        </SView>
                                    });
                                },
                            }
                        } : {},

                        ...tipo?.cuentas?.includes("key_cuenta_contable_depreciacion_gasto") ? {
                            key_cuenta_contable_depreciacion_gasto: {
                                col: "xs-12",
                                label: "Cuenta de Depreciación de Gasto",
                                value:
                                    this.state.cuentaSeleccionadaDG
                                        ? `${this.state.cuentaSeleccionadaDG.codigo} - ${this.state.cuentaSeleccionadaDG.descripcion}`
                                        : this.props.editObject?.key_cuenta_contable_depreciacion_gasto ? `${cuentaSeleccionadaDG?.codigo} - ${cuentaSeleccionadaDG?.descripcion}` : ""
                                ,
                                onPress: () => {
                                    SPopup.open({
                                        key: "popup-cuentas",
                                        content: <SView
                                            style={{
                                                width: "100%",
                                                height: 500,
                                                maxWidth: 1000,
                                                borderRadius: 8,
                                                borderWidth: 1,
                                                borderColor: STheme.color.card,
                                                backgroundColor: STheme.color.background,
                                                overflow: "hidden"

                                            }} withoutFeedback>
                                            <CuentasAnidadas
                                                select={(cuentaSelec: any) => {
                                                    console.log("SELECCIONADO:", cuentaSelec)
                                                    this.setState({
                                                        cuentaSeleccionadaDG: cuentaSelec
                                                    });
                                                    SPopup.close("popup-cuentas");
                                                }}
                                                keyEdit= {this.props.editObject?.key_cuenta_contable_depreciacion_gasto ? this.props.editObject?.key_cuenta_contable_depreciacion_gasto : null}
                                            // filtroTipo="ACTIVO"
                                            />
                                        </SView>
                                    });
                                },
                            }
                        } : {},

                    }}

                    onSubmit={(data: any) => {
                        const final_data = {
                            ...(this.props.editObject ?? { key_empresa: MDL.empresa.select?.key }),
                            descripcion: data.descripcion,
                            tipo: data.tipo,
                            codigo_facturacion: this.state.codigoProductoSeleccionado,
                            unidad_medida_facturacion: this.state.unidadMedidaSeleccionada,
                            key_cuenta_contable_ganancia: findCuentaText(this.state.cuentas, data.key_cuenta_contable_ganancia)?.key ?? "",
                            // key_cuenta_contable_ganancia2: this.state.cuentaSeleccionadaG?.key ?? "",
                            key_cuenta_contable_costo: findCuentaText(this.state.cuentas, data.key_cuenta_contable_costo)?.key ?? "",
                            // key_cuenta_contable_costo2: this.state.cuentaSeleccionadaC?.key ?? "",
                            key_cuenta_contable: findCuentaText(this.state.cuentas, data.key_cuenta_contable)?.key ?? "",
                            key_cuenta_contable_depreciacion_activo: findCuentaText(this.state.cuentas, data.key_cuenta_contable_depreciacion_activo)?.key ?? "",
                            key_cuenta_contable_depreciacion_gasto: findCuentaText(this.state.cuentas, data.key_cuenta_contable_depreciacion_gasto)?.key ?? "",
                            // key_cuenta_contable2: this.state.cuentaSeleccionadaI?.key ?? "",
                        }

                        console.log("final_data", final_data)
                        MDL.inventario.saveTipoProducto(final_data)
                            .then((resp: any) => {
                                if (this._ref.image_perfil) {
                                    const value = this._ref.image_perfil.getValue();
                                    if (Array.isArray(value)) {
                                        Upload.sendPromise({ file: value[0], compress: false },
                                            (SSocket.api as any).inventario + "upload/tipo_producto/" + resp.key)
                                    }
                                }
                                this.props.onSuccess?.(resp);
                            }).catch(console.error);
                    }}
                />

                <SHr h={16} />
                <SView row col="xs-12">
                    {this.props.onCancel && <>
                        <Btn type='danger' label='CANCELAR' onPress={() => this.props.onCancel?.()} />
                        <SView width={8} />
                    </>}
                    <Btn type='primary' label='GUARDAR' onPress={() => this.form?.submit()} />
                </SView>
            </SView>
        );
    }
}
