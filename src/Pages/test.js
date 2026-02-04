

import React, { Component } from 'react';
import {
    SPage,
    SView,
    STheme,
    SText,
    SForm,
    SNotification,
} from 'servisofts-component';
import MDL from '../MDL';
import InputFoto from '../Components/InputFoto';
import SIconApp from '../Assets/SIconApp';
import SSocket from 'servisofts-socket';



// import React, { Component } from 'react';
// import {
//     SPage,
//     SView,
//     STheme,
//     SText,
//     SForm,
//     SNotification,
// } from 'servisofts-component';
// import MDL from '../MDL';
// import InputFoto from './puntoventa/Components/InputFoto';
// import SIconApp from './SIconApp'; // Asegúrate de tener este import

export default class Test extends Component {
    state = {
        selectedMoneda: MDL.compra_venta.getMonedaSeleccionada() || null,
        articulo: [],
        contactos: [],
        key_modelo: null,
        descripcion_modelo: null,
        key_cliente: null,
        nombre_cliente: null,
    };

    _ref: any = {}; // Para refs de fotos

    componentDidMount() {
        // Cargar artículos
        MDL.inventario.getAllModeloStock()
            .then((resp: any) => {
                this.setState({ articulo: resp });

                if (this.form && this.props.editObject) {
                    const articulo = resp.find((item: any) => item.key == this.props.editObject.key_modelo);
                    this.form.setValues({ "tipo": articulo?.descripcion });
                }
            })
            .catch((e: any) => console.error("Error al cargar marcas", e));

        // Cargar clientes
        MDL.crm.cliente.getAll()
            .then((resp: any) => {
                this.setState({ contactos: resp });
                if (this.form && this.props.editObject) {
                    const contacto = resp.find((item: any) => item.key == this.props.editObject.key_cliente);
                    this.form.setValues({ "nombres": contacto?.nombres });
                }
            })
            .catch((e: any) => console.error("Error al cargar clientes nombres", e));
    }

    renderArticuloInput() {
        const { articulo, key_modelo, descripcion_modelo } = this.state;
        return {
            "articulo": {
                col: "xs-12",
                style: { paddingStart: 0 },
                labelStyle: { top: -10 },
                inputStyle: { paddingStart: 8 },
                icon: (
                    <SView style={{ borderRadius: 4, overflow: "hidden", width: 50, height: 50, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.text + '66' }}>
                        <InputFoto
                            ref={ref => this._ref.image_modelo = ref}
                            src={(SSocket.api as any).inventario + "modelo/.128_" + this.props.editObject?.key}
                            style={{ width: 50, height: 50 }}
                        />
                    </SView>
                ),
                label: "Artículo",
                placeholder: "Ingresa el artículo",
                isRequired: true,
                type: "select2",
                options: articulo.map((item: any) => item.descripcion),
                onChangeText: (text: string) => {
                    const articuloSeleccionado = articulo.find((item: any) => item.descripcion == text);
                    const key = articuloSeleccionado?.key || null;

                    this.setState({
                        key_modelo: key,
                        descripcion_modelo: text,
                    }, () => {
                        if (this._ref.image_modelo) {
                            this._ref.image_modelo.setValue(key ? (SSocket.api as any).inventario + "modelo/.128_" + key : "");
                            this._ref.image_modelo.forceUpdate();
                        }
                    });
                },
                onSubmitEditing: () => {
                    if (this.form) this.form.focus("articulo");
                },
                iconR: !key_modelo && !!descripcion_modelo ? (
                    <SView style={{ width: 40, height: 40, padding: 10, backgroundColor: STheme.color.card }} center onPress={() => {
                        MDL.inventario.saveModeloCliente({ key_cliente: this.props.key_cliente })
                            .then((resp: any) => {
                                this.setState(prev => ({
                                    key_modelo: resp.key,
                                    articulo: [...prev.articulo, resp]
                                }));
                                SNotification.send({
                                    title: "Tipo de producto guardado",
                                    body: "El tipo de producto se ha guardado correctamente.",
                                    time: 3000,
                                    color: STheme.color.success,
                                });
                            })
                            .catch((e: any) => {
                                console.error("Error al guardar el tipo de producto:", e);
                                SNotification.send({
                                    title: "Error",
                                    body: "No se pudo guardar el tipo de producto.",
                                    time: 3000,
                                    color: STheme.color.danger,
                                });
                            });
                    }}>
                        <SIconApp name='adicional' fill={STheme.color.warning} />
                    </SView>
                ) : null,
                onBlur: () => this.forceUpdate()
            }
        };
    }

    renderContactoInput() {
        const { contactos, key_cliente, nombre_cliente } = this.state;

        return {
            "persona_cliente": {
                col: "xs-12",
                style: { paddingStart: 0 },
                labelStyle: { top: -10 },
                inputStyle: { paddingStart: 8 },
                icon: (
                    <SView style={{
                        borderRadius: 4,
                        overflow: "hidden",
                        width: 50,
                        height: 50,
                        backgroundColor: STheme.color.background,
                        borderWidth: 1,
                        borderColor: STheme.color.text + '66'
                    }}>
                        {/* <InputFoto
                            ref={ref => this._ref.image_contacto = ref}
                            src={(SSocket.api as any).inventario + "modelo/.128_" + this.props.editObject?.key_cliente}
                            style={{ width: 50, height: 50 }}
                        /> */}
                    </SView>
                ),
                label: "Contacto",
                placeholder: "Selecciona un contacto",
                isRequired: true,
                type: "select2",
                options: contactos.map((item: any) => ({
                    label: item.nombres,
                    value: item.key
                })),
                onChangeText: (value: string) => {
                    const contacto = contactos.find(c => c.key == value);

                    console.clear();
                    console.log("%c" + contacto.key, `color: #2ECC40; font-weight: bold;`);
                    if (contacto) {
                        this.setState({
                            key_cliente: contacto.key,
                            nombre_cliente: contacto.nombres
                        }, () => {
                            if (this._ref.image_contacto) {
                                // this._ref.image_contacto.setValue((SSocket.api as any).inventario + "modelo/.128_" + contacto.key);
                                this._ref.image_contacto.forceUpdate();
                            }
                            if (this.form) this.form.setValue("persona_cliente", contacto.key);
                        });
                    }
                },
                onSubmitEditing: () => {
                    if (this.form) this.form.focus("persona_cliente");
                },
                iconR: !key_cliente && !!nombre_cliente ? (
                    <SView style={{
                        width: 40, height: 40,
                        padding: 10,
                        backgroundColor: STheme.color.card
                    }} center onPress={() => {
                        MDL.inventario.saveModeloCliente({
                            key_cliente: this.props.key_cliente,
                        })
                            .then((resp: any) => {
                                this.setState(prev => ({
                                    key_cliente: resp.key,
                                    contactos: [...prev.contactos, resp]
                                }));
                                SNotification.send({
                                    title: "Contacto guardado",
                                    body: "El contacto se ha guardado correctamente.",
                                    time: 3000,
                                    color: STheme.color.success,
                                });
                            })
                            .catch((e: any) => {
                                console.error("Error al guardar el contacto:", e);
                                SNotification.send({
                                    title: "Error",
                                    body: "No se pudo guardar el contacto.",
                                    time: 3000,
                                    color: STheme.color.danger,
                                });
                            });
                    }}>
                        <SIconApp name='adicional' fill={STheme.color.warning} />
                    </SView>
                ) : null,
                onBlur: () => {
                    if (!this.state.key_cliente) this.forceUpdate();
                }
            }
        };
    }

    render() {
        const { selectedMoneda } = this.state;

        return (
            <SPage title="Testing" disableScroll center>
                <SView col="xs-12" center row style={{ marginBottom: 16 }}>
                    <SView col="xs-12" row>
                        <SText bold>Moneda seleccionada:</SText>
                    </SView>

                    {selectedMoneda ? (
                        <SView col="xs-12" row>
                            <SText>Key: {selectedMoneda.key}</SText>
                            <SText style={{ marginLeft: 12 }}>Descripción: {selectedMoneda.descripcion}</SText>
                            <SText style={{ marginLeft: 12 }}>Observación: {selectedMoneda.observacion || "-"}</SText>
                        </SView>
                    ) : (
                        <SText>No hay moneda seleccionada</SText>
                    )}
                </SView>

                <SForm
                    ref={(ref: any) => this.form = ref}
                    row
                    style={{ justifyContent: "space-between" }}
                    inputs={{
                        ...this.renderArticuloInput(),
                        ...this.renderContactoInput()
                    }}
                    onSubmit={(data: any) => {
                        console.clear();
                        data.key_cliente = this.state.key_cliente;
                        data.key_modelo = this.state.key_modelo;
                        data.articulo = this.state.descripcion_modelo;
                        // data.persona_cliente = this.state.nombre_cliente;
                        console.log("%c" + JSON.stringify(data), `color: #090a09; font-weight: bold;`);
                    }}
                />
            </SPage>
        );
    }
}
