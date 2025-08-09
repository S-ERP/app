import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SImage, SInput, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SIconApp from '../../../Assets/SIconApp';
// import Model from '../../../Model';
import FotoUsuario from './Foto/FotoUsuario';
import Model from '../../../Model';
export default class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    // seleccionarSucuasasrsal() {

    //     SNavigation.navigate("/sucursal", {
    //         onSelect: (obj) => {
    //             var cliente = {
    //                 nit: this.empresa.nit,
    //                 razon_social: this.empresa.razon_social + "\nSuc. " + obj.descripcion,
    //                 telefono: obj.telefono,
    //                 correo: obj.correo,
    //                 direccion: obj.direccion,
    //                 key_usuario: "",
    //                 key_sucursal: obj.key,
    //                 key_empresa: this.empresa.key,
    //                 // sucursal: "SUCURSAL TODO",
    //             }
    //             this.data.cliente = cliente;
    //             this.data.key_sucursal = obj.key;
    //             Model.compra_venta.Action.editar({
    //                 data: this.data,
    //                 key_usuario: Model.usuario.Action.getKey()
    //             }).then((resp) => {
    //                 console.log("Se agregó la sucursal con éxito")
    //             })
    //         }
    //     })
    // }

    // seleccionarSucursal() {

    //     SNavigation.navigate("/sucursal", {
    //         onSelect: (obj) => {
    //             var cliente = {
    //                 nit: this.empresa.nit,
    //                 razon_social: this.empresa.razon_social + "\nSuc. " + obj.descripcion,
    //                 telefono: obj.telefono,
    //                 correo: obj.correo,
    //                 direccion: obj.direccion,
    //                 key_usuario: "",
    //                 key_sucursal: obj.key,
    //                 key_empresa: this.empresa.key,
    //                 // sucursal: "SUCURSAL TODO",
    //             }
    //             this.data.cliente = cliente;
    //             this.data.key_sucursal = obj.key;
    //             // Model.compra_venta.Action.editar({
    //             //     data: this.data,
    //             //     key_usuario: Model.usuario.Action.getKey()
    //             // }).then((resp) => {
    //             //     console.log("Se agregó la sucursal con éxito")
    //             // })
    //         }
    //     })
    // }

        seleccionarCliente() {
            SNavigation.navigate("/rol/profile/usuarios", {
                pk: "51ee8a95-094b-41eb-8819-4afa1f349394",
                onSelect: (obj) => {
                    var obj = {
                        nit: obj.CI,
                        razon_social: obj.Nombres + " " + obj.Apellidos,
                        key_usuario: obj.key,
                        telefono: obj.Telefono,
                        correo: obj.Correo,
                        direccion: "",
                        key_usuario: obj.key,
                        // sucursal: "SUCURSAL TODO",
                    }
                    this.data.conyuge = obj;
                    // Model.compra_venta.Action.editar({
                    //     data: this.data,
                    //     key_usuario: Model.usuario.Action.getKey()
                    // }).then((resp) => {
                    //     console.log("Se agrego el cliente con exito")
                    // })
                }
            })
    }

    render() {
        let usuario = Model.usuario.Action.getUsuarioLog();
        let empresa = Model.empresa.Action.getSelect();
        // let Sucursassl = Model.sucursal.Action.getSelect();
        // let Sucursassldsd = Model.cliente.Action.getSelect();
        // var sucursales = Model.sucursal.Action.getAll();

        return (
            <SView col={"xs-12"} row center height={60} backgroundColor={STheme.color.background} style={{ borderBottomWidth: 1, borderColor: STheme.color.card, }}  >
                <SView col={"xs-1 md-0.5"} style={{ paddingBottom: 4 }} center height
                    onPress={() => {
                        if (this.props.onBack) {
                            var prevent_default = this.props.onBack();
                            if (prevent_default) {
                                return;
                            }
                        }
                        SNavigation.goBack();
                    }}
                >   <SIconApp height={20} name={"Arrow"} fill={STheme.color.text} />
                </SView>

                <SView col={"xs-4 md-2"} row border="transparent" onPress={() => {
                    // this.seleccionarSucursal()
                    console.log("precioso")

                }}>
                    <SText fontSize={18} bold color={STheme.color.text} style={{ letterSpacing: -0.5, textTransform: "uppercase" }}>Suc. {empresa.razon_social}</SText>
                </SView>



                <SView col={"xs-12  "} row center
                    // onPress={() => this.seleccionarSucursal()}
                >
                    <SView width={45}  >
                        <SView center backgroundColor={STheme.color.background} style={{
                            minWidth: 10, width: 30, minHeight: 10, height: 30, borderRadius: 18, margin: 4,
                            marginRight: (this.data?.cliente?.key ? 6 : 8), overflow: "hidden",
                        }}>
                        </SView>
                    </SView>
                    <SView flex  >
                        <SText style={{ color: STheme.color.text, fontWeight: "bold", fontSize: 12, textTransform: 'uppercase' }}>{this.data?.cliente?.nombres || "Seleccionar Cliente"}</SText>
                    </SView>
                </SView>


                <SView flex />
                <SView col={"xs-4 md-2"} row border="red" >
                    <SText fontSize={18} bold color={STheme.color.text} style={{ letterSpacing: -0.5, textTransform: "uppercase" }}> {empresa.razon_social}</SText>
                </SView>

                <SView flex />
                <SView col={"xs-7 md-5 lg-3"} height row center border="transparent" style={{ justifyContent: "flex-end" }}  >
                    <SView col={"xs-0 md-1 "} backgroundColor='transparent'> <SIconApp name="Wifi" width={20} height={20} fill={"#19b121ff"} /> </SView>
                    <SView flex />
                    <SView col={"xs-10 md-8"} row center backgroundColor='transparent'>
                        <SView center backgroundColor={"transparent"} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8, overflow: "hidden", }} >
                            <FotoUsuario data={usuario} />
                        </SView>
                        <SText fontSize={14} color={STheme.color.text}> {usuario.Nombres + " " + usuario.Apellidos}</SText>
                    </SView>
                    <SView flex />
                    <SView col={"xs-1.5 md-1"} height style={{ paddingTop: 15 }} row center  > <SIconApp name="Menu2" width={28} stroke={STheme.color.text} fill={STheme.color.text} /> </SView>
                    <SView flex />
                </SView>
            </SView>
        );
    }
}