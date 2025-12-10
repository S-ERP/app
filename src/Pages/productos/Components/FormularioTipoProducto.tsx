import React, { Component } from 'react';
import { SForm, SHr, SLoad, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import Btn from '../../empresa/config/Components/Btn';
import InputFoto from '../../../Components/InputFoto';

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
        tipo: MDL.inventario.TIPOS_DE_PRODUCTOS[0].key,
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
                                type: "select2",
                                label: "Cuenta de Ganancia",
                                defaultValue: cuentaToText(this.state.cuentas.find(c => c.key === this.props.editObject?.key_cuenta_contable_ganancia)),
                                options: this.state.cuentas.filter(c => c.cantidad_hijas <= 0 && c.tipo === "INGRESO").map(cuentaToText)
                            }
                        } : {},

                        ...tipo?.cuentas?.includes("key_cuenta_contable_costo") ? {
                            key_cuenta_contable_costo: {
                                col: "xs-12",
                                type: "select2",
                                label: "Cuenta de Costo",
                                defaultValue: cuentaToText(this.state.cuentas.find(c => c.key === this.props.editObject?.key_cuenta_contable_costo)),
                                options: this.state.cuentas.filter(c => c.cantidad_hijas <= 0 && c.tipo === "GASTO").map(cuentaToText)
                            }
                        } : {},

                        ...tipo?.cuentas?.includes("key_cuenta_contable") ? {
                            key_cuenta_contable: {
                                col: "xs-12",
                                type: "select2",
                                label: "Cuenta de Inventario",
                                defaultValue: cuentaToText(this.state.cuentas.find(c => c.key === this.props.editObject?.key_cuenta_contable)),
                                options: this.state.cuentas.filter(c => c.cantidad_hijas <= 0 && c.tipo === "ACTIVO").map(cuentaToText)
                            }
                        } : {}

                    }}
                    onSubmit={(data: any) => {
                        const final_data = {
                            ...(this.props.editObject ?? { key_empresa: MDL.empresa.select?.key }),
                            descripcion: data.descripcion,
                            tipo: data.tipo,
                            codigo_facturacion: this.state.codigoProductoSeleccionado,
                            unidad_medida_facturacion: this.state.unidadMedidaSeleccionada,
                            key_cuenta_contable_ganancia: findCuentaText(this.state.cuentas, data.key_cuenta_contable_ganancia)?.key,
                            key_cuenta_contable_costo: findCuentaText(this.state.cuentas, data.key_cuenta_contable_costo)?.key,
                            key_cuenta_contable: findCuentaText(this.state.cuentas, data.key_cuenta_contable)?.key
                        }

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
