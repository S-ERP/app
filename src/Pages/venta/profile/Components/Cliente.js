import React, { Component } from 'react';
import { SDate, SHr, SImage, SList, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../../../../Model';
// props = {disabled}
export default class Cliente extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    data = {}

    seleccionarCliente() {
        SNavigation.navigate("/rol/profile/usuarios", {
            pk: "51ee8a95-094b-41eb-8819-4afa1f349394", onSelect: (obj) => {
                var cliente = {
                    nit: obj.CI,
                    razon_social: obj.Nombres + " " + obj.Apellidos,
                    key_usuario: obj.key,
                    telefono: obj.Telefono,
                    correo: obj.Correo,
                    direccion: "",
                    key_usuario: obj.key,
                    // sucursal: "SUCURSAL TODO",
                }
                this.data.cliente = cliente;
                Model.compra_venta.Action.editar({
                    data: this.data,
                    key_usuario: Model.usuario.Action.getKey()
                }).then((resp) => {
                    console.log("Se agrego el cliente con exito")
                })
            }
        })
        // SNavigation.navigate("/cliente", {
        //     onSelect: (obj) => {
        //         var cliente = {
        //             nit: obj.CI,
        //             razon_social: obj.Nombres + " " + obj.Apellidos,
        //             key_usuario: obj.key,
        //             telefono: obj.Telefono,
        //             correo: obj.Correo,
        //             direccion: "",
        //             key_usuario: obj.key,
        //         }
        //         this.data.cliente = cliente;
        //         Model.compra_venta.Action.editar({
        //             data: this.data,
        //             key_usuario: Model.usuario.Action.getKey()
        //         }).then((resp) => {
        //             console.log("Se agrego el cliente con exito")
        //         })
        //     }
        // })
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
                    console.log("Se agrego la sucursal con exito")
                })
            }
        })
    }
    render() {
        this.empresa = Model.empresa.Action.getSelect();
        this.data = this.props.data;
        if (!this.data?.cliente) {

            if (this.props.disabled) {
                return <SView>
                    <SHr height={16} />
                    <SText>{this.data.tipo == "compra" ? "SIN SUCURSAL" : "SIN CLIENTE"}</SText>
                    <SHr height={16} />
                </SView>
            }
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

        var { nit, razon_social, telefono, correo, direccion, key_usuario, key_sucursal } = this.data.cliente
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
        } else if (key_usuario) {
            urlFoto = SSocket.api.root + "usuario/" + key_usuario;
        }
        return <SView col={"xs-12"} center >
            <SHr />
            <SView col={"xs-12"} center onPress={onPress}>
                <SView width={40} height={40} style={{ padding: 4 }}>
                    <SView flex height card>
                        <SImage src={urlFoto} />
                    </SView>
                </SView>
                <SHr />
                <SText center col={"xs-10"}>{razon_social}</SText>
                <SHr />
                <SText center col={"xs-10"}>{`Nit. ${nit}`}</SText>
                <SText center col={"xs-10"}>{telefono ? `Tel. ${telefono}` : ""}</SText>
                <SText center col={"xs-10"}>{correo}</SText>
                <SText center col={"xs-10"}>{direccion}</SText>
            </SView>

            <SHr />
        </SView>
    }
}
