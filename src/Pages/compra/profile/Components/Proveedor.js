import React, { Component } from 'react';
import { SDate, SHr, SImage, SList, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../../../../Model';
// props = {disabled}
export default class Proveedor extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    data = {}

    seleccionarProveedor() {
        SNavigation.navigate("/rol/profile/usuarios", {
            pk: "b9c32543-ca5a-40f6-97b6-643633cbee9e", onSelect: (obj) => {
                var proveedor = {
                    nit: obj.CI,
                    razon_social: obj.Nombres + " " + obj.Apellidos,
                    key_usuario: obj.key,
                    telefono: obj.Telefono,
                    correo: obj.Correo,
                    direccion: "",
                    key_usuario: obj.key,
                    // sucursal: "SUCURSAL TODO",
                }
                this.data.proveedor = proveedor;
                Model.compra_venta.Action.editar({
                    data: this.data,
                    key_usuario: Model.usuario.Action.getKey()
                }).then((resp) => {
                    console.log("Se agrego el proveedor con exito")
                })
            }
        })
    }
    render() {
        this.data = this.props.data;
        if (!this.data?.proveedor) {
            if (this.props.disabled) {
                return <SView>
                    <SHr height={16} />
                    <SText>{"SIN PROVEEDOR"}</SText>
                    <SHr height={16} />
                </SView>
            }
            return <SView col={"xs-12"} center>
                <SHr height={24} />
                <SView style={{
                    padding: 16
                }} card onPress={() => {
                    this.seleccionarProveedor();
                }}>
                    <SText bold color={STheme.color.danger} >SELECCIONE EL PROVEEDOR</SText>
                </SView>
                <SHr height={24} />
            </SView>
        }

        var { nit, razon_social, key_usuario, telefono, correo, direccion } = this.data.proveedor
        var onPress;
        if (!this.props.disabled) {
            onPress = this.seleccionarProveedor.bind(this)
        }
        return <SView col={"xs-12"} center >
            <SHr />
            <SView center onPress={onPress}>
                <SView width={40} height={40} style={{ padding: 4 }}>
                    <SView flex height card>
                        <SImage src={SSocket.api.root + "usuario/" + key_usuario} />
                    </SView>
                </SView>
                <SHr />
                <SText center col={"xs-10"}>{razon_social}</SText>
                <SHr />
                <SText center col={"xs-10"}>{`Nit. ${nit}`}</SText>
                <SText center col={"xs-10"}>{`Tel. ${telefono}`}</SText>
                <SText center col={"xs-10"}>{correo}</SText>
                <SText center col={"xs-10"}>{direccion}</SText>
            </SView>

            <SHr />
        </SView>
    }
}
