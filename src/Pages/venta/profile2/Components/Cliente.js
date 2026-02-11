import React, { Component } from 'react';
import { SDate, SHr, SImage, SList, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../../../../Model';
import MDL from '../../../../MDL';
// props = {disabled}
export default class Cliente extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    data = {}

    async componentDidMount() {
        try {
            const cliente = await MDL.crm.cliente.getByKey(this.props.data.key_cliente);
            this.setState({ cliente });
        } catch (error) {
            console.error("Error al cargar cliente:", error);
        }
    }

    seleccionarCliente() {
        SNavigation.navigate("/cliente", {
            onSelect: (obj) => {

                this.data.cliente = obj;
                this.data.key_cliente = obj.key;
                SNavigation.goBack();
                Model.compra_venta.Action.editar({
                    data: this.data,
                    key_usuario: Model.usuario.Action.getKey()
                }).then((resp) => {
                    
                    console.log("Se agregó el cliente con éxito")
                })
            }
        })
    }
    seleccionarSucursal() {

        SNavigation.navigate("/sucursal", {
            onSelect: (obj) => {
                var cliente = {
                    nit: this.empresa.nit,
                    razon_social: this.empresa.razon_social + "\nSuc. " + obj.descripcion,
                    telefono: obj.telefono,
                    correo: obj.correo,
                    direccion: obj.direccion,
                    key_usuario: "",
                    key_sucursal: obj.key,
                    key_empresa: this.empresa.key,
                    // sucursal: "SUCURSAL TODO",
                }
                this.data.cliente = cliente;
                this.data.key_sucursal = obj.key;
                Model.compra_venta.Action.editar({
                    data: this.data,
                    key_usuario: Model.usuario.Action.getKey()
                }).then((resp) => {
                    console.log("Se agregó la sucursal con éxito")
                })
            }
        })
    }


    render() {
        this.empresa = MDL.empresa.select;
        this.data = this.props.data;
        this.data.cliente = this.state.cliente;
        if (!this.data?.cliente) {

            // if (this.props.disabled) {
            //     return <SView>
            //         <SHr height={16} />
            //         <SText>{this.data.tipo == "compra" ? "SIN SUCURSAL" : "SIN CLIENTE"}</SText>
            //         <SHr height={16} />
            //     </SView>
            // }
            return <SView col={"xs-12"} center>
                <SHr height={24} />
                <SView style={{
                    padding: 16
                }} card onPress={() => {
                    // if (this.data.tipo == "compra") {
                    // this.seleccionarSucursal()
                    // } else {
                    this.seleccionarCliente()
                    // }
                }}>
                    <SText bold color={STheme.color.danger} >{"SELECCIONE EL CLIENTE"}</SText>
                </SView>
                <SHr height={24} />
            </SView>
        }

        var { nit, razon_social, nombres, telefono, correo, direccion, key_usuario, key_sucursal, key, apellidos } = this.data.cliente
        var onPress;
        if (!this.props.disabled) {
            // if (this.data.tipo == "compra") {
            // onPress = this.seleccionarSucursal.bind(this)
            // } else {
            onPress = this.seleccionarCliente.bind(this)
            // }
        }
        var urlFoto = "";
        if (key_sucursal) {
            urlFoto = SSocket.api.empresa + "sucursal/" + key_sucursal;
        } else if (key) {
            urlFoto = SSocket.api.root + "usuario/" + key_usuario;
        } else if (key_usuario) {
            urlFoto = SSocket.api.root + "usuario/" + key_usuario;
        }
        return <SView col={"xs-12"} flex >
            <SView col={"xs-12"} center>
                <SHr />
                <SText bold>DATOS DEL {this.data.tipo == "venta" ? "CLIENTE" : "PROVEEDOR"}</SText>
                <SHr />
            </SView>
            <SView col={"xs-12"} row onPress={onPress} center>
                <SView col={"xs-12  "} row border={"transparent"} >

                    <SView row width={44} border={"transparent"}  >
                        <SView width={35} height={35} style={{ borderRadius: 100, overflow: 'hidden', backgroundColor: STheme.color.card }}>
                            <SImage src={urlFoto} enablePreview style={{ borderRadius: 100, overflow: 'hidden', resizeMode: "cover" }} />
                        </SView>
                    </SView>

                    {/* <SHr width={5} /> */}
                    <SView row flex style={{ justifyContent: "space-between" }} >

                        <SView row col={"xs-5"} border={"transparent"}  >
                            <SHr />
                            <SText center>Nombre: {nombres} {apellidos}</SText>
                            <SHr />
                            <SText center>Email: {correo}</SText>
                            <SHr />
                            <SText center>Telefono: {telefono}</SText>
                            <SHr />
                            <SText center>Dirección: {direccion}</SText>
                        </SView>

                        <SView row col={"xs-5"} border={"transparent"}  >
                            <SHr />
                            <SText center>Datos Factura</SText>
                            <SHr />
                            <SText center>NIT/CI/CEX:: {nit}</SText>
                            <SHr />
                            <SText center>razon_social: {razon_social}</SText>
                            <SHr />
                            <SHr />
                            {/* <SText center>Dirección: {direccion}</SText> */}
                        </SView>
                    </SView>



                </SView>

            </SView>
            <SHr />
        </SView>
    }
}
