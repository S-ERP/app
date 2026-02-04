import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SForm, SHr, SLoad, SNotification, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../../MDL';
import Btn from '../../../cliente/Components/Btn';
import InputSelector from '../../../../Components/Selectores/InputSelector';

type Props = {
    key_cliente: string,
    key_modelo: string,
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
    modelos?: any[],
}

export default class PopupAgregarTipoCosto extends Component<Props> {
    form: SForm | undefined = undefined;
    _ref: any = {};

    state = {
        key_marca: this.props.editObject?.key_marca,
        key_modelo: this.props.editObject?.key_modelo,
        key_cliente: this.props.editObject?.key_cliente,
        marcas: [],
        articulo: [],
        descripcion_modelo: "",
        nombre_cliente: "",
        descripcion_marca: "",
        cuentas: [],
        tipos_costo: [],
        contactos: [],
        formInitialized: false,
        loading: true, // <-- indicador de carga
    }

    componentDidMount(): void {
        this.loadInitialData();
    }

    private loadInitialData(): void {
        Promise.all([
            MDL.crm.cliente.getAll(),
            MDL.contabilidad.getCuentas(),
            MDL.inventario.getAllTipoCosto(),
            MDL.inventario.getAllModeloStock()
        ])
        .then(([clientes, cuentas, tiposCosto, modelosStock]) => {

            const contactos = this.sortBy(Object.values(clientes), 'nombres');
            const cuentasOrdenadas = this.sortBy(Object.values(cuentas), 'codigo');
            const tipos_costo = this.sortBy(Object.values(tiposCosto || {}), 'descripcion');

            let articuloSeleccionado = null;
            if (this.form && this.props.editObject) {
                articuloSeleccionado = modelosStock.find(
                    (item: any) => item.key === this.props.editObject.key_modelo
                );
            }

            this.setState({
                contactos,
                cuentas: cuentasOrdenadas,
                tipos_costo,
                articulo: modelosStock,
                ...(articuloSeleccionado && { articuloSeleccionado }),
                loading: false
            }, this.initializeForm);

        })
        .catch((error: any) => {
            console.error('Error cargando datos iniciales', error);
            SNotification.send({
                title: "Error",
                body: "No se pudieron cargar los datos iniciales",
                time: 3000,
                color: STheme.color.danger,
            });
            this.setState({ loading: false });
        });
    }

    initializeForm = () => {
        if (this.props.editObject && this.form && !this.state.formInitialized) {
            const obj = this.props.editObject;
            this.form.setValues({
                key_cliente: obj.key_cliente,
                comision: obj.comision,
                key_cuenta_contable: obj.key_cuenta_contable,
                key_tipo_costo: obj.key_tipo_costo,
            });
            this.setState({ formInitialized: true });
        }
    }

    private sortBy<T>(array: T[], key: keyof T): T[] {
        return [...array].sort((a, b) => {
            if (a[key] > b[key]) return 1;
            if (a[key] < b[key]) return -1;
            return 0;
        });
    }

    static open(props: Props) {
        SPopup.open({
            key: "PopupAgregarTipoCosto",
            content: <SView style={{
                width: "100%",
                maxHeight: "100%",
                maxWidth: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <PopupAgregarTipoCosto {...props} onCancel={() => {
                    SPopup.close("PopupAgregarTipoCosto")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("PopupAgregarTipoCosto")
                        if (props.onSuccess) props.onSuccess(e)
                    }}
                />
            </SView>
        })
    }

    render() {
        // Mostrar loader mientras no se cargan los datos
        if (this.state.loading) return <SLoad />;

        return (
            <SView col={"xs-12"} center padding={16}>
                <SText fontSize={16}>{this.props?.editObject ? "Editar" : "Crear"} Tipo de Costos</SText>
                <ScrollView>
                    <SForm ref={(ref: any) => this.form = ref} row style={{ justifyContent: "space-between" }}
                        inputs={{
                            "key_cliente": {
                                label: "Selecciona un contacto",
                                type: "custom",
                                customInputClass: InputSelector,
                                placeholder: "Elige un contacto",
                                style: { width: "100%" },
                                options: this.state.contactos.map((contacto: any) => ({
                                    label: contacto.nombres,
                                    value: contacto.key,
                                    customComponent: (e: any) => (<SText fontSize={12} color={STheme.color.lightGray}> {e.data.nombres} </SText>),
                                    data: contacto
                                }))
                            },
                            "comision": {
                                label: "Comisión (%)",
                                placeholder: "Ej: 10",
                                type: "number",
                                maxLength: 3,
                                col: "xs-12",
                                isRequired: true,
                                inputStyle: { paddingStart: 8 },
                                labelStyle: { top: -10 },
                            },
                            "key_cuenta_contable": {
                                label: "Cuenta Contable",
                                type: "custom",
                                customInputClass: InputSelector,
                                style: { width: "100%" },
                                options: this.state.cuentas.map((cuenta: any) => ({
                                    label: `${cuenta.codigo} - ${cuenta.descripcion}`,
                                    value: cuenta.key,
                                    customComponent: (e: any) => <SText fontSize={12} color={STheme.color.lightGray}>{e.data.tipo}</SText>,
                                    data: cuenta
                                }))
                            },
                            "key_tipo_costo": {
                                label: "Tipos de costo",
                                type: "custom",
                                customInputClass: InputSelector,
                                style: { width: "100%" },
                                options: this.state.tipos_costo.map((tipo: any) => ({
                                    label: tipo.descripcion,
                                    value: tipo.key,
                                    customComponent: (e: any) => <SText fontSize={12} color={STheme.color.lightGray}>{e.data.descripcion}</SText>,
                                    data: tipo
                                }))
                            }
                        }}
                        onSubmit={(data: any) => {
                            data.key_cliente = data.key_cliente;
                            data.key_modelo = this.props.key_modelo;

                            const saveOrEdit = this.props.editObject?.key_modelo_cliente
                                ? MDL.inventario.editModeloCliente({ ...data, key: this.props.editObject.key_modelo_cliente })
                                : MDL.inventario.saveModeloCliente(data);

                            saveOrEdit.then((resp: any) => {
                                if (this.props.onSuccess) this.props.onSuccess(resp);

                                if (this._ref.image_modelo) {
                                    const value = this._ref.image_modelo.getValue();
                                    if (Array.isArray(value)) {
                                        Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).root + "upload/usuario/" + resp.key);
                                    }
                                }

                                SNotification.send({
                                    title: this.props.editObject ? "Cliente editado" : "Contacto guardado",
                                    body: this.props.editObject ? "Se ha actualizado correctamente" : "Se ha guardado correctamente",
                                    time: 3000,
                                    color: STheme.color.success,
                                });
                            }).catch((e: any) => {
                                console.error("Error al guardar:", e);
                                SNotification.send({
                                    title: "Error",
                                    body: "No se pudo guardar el contacto.",
                                    time: 3000,
                                    color: STheme.color.danger,
                                });
                            });
                        }}
                    />
                </ScrollView>
                <SHr h={16} />
                <SView row col={"xs-12"}>
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
