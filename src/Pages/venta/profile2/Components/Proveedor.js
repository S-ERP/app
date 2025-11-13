import React, { Component } from 'react';
import { SDate, SHr, SImage, SList, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../../../../Model';
import MDL from '../../../../MDL';
// props = {disabled}
export default class Proveedor extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    data = {}

    async componentDidMount() {
        try {
            const proveedor = await MDL.crm.cliente.getByKey(this.props.data.key_proveedor);
            this.setState({ proveedor });
        } catch (error) {
            console.error("Error al cargar cliente:", error);
        }
    }

    seleccionarProveedor() {
        SNavigation.navigate("/sucursal", {
            onSelect: (obj) => {
                var proveedor = {
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
                this.data.proveedor = proveedor;
                this.data.key_sucursal = obj.key;
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
        console.log("PROVEEDOR", this.props.data)
        this.empresa = MDL.empresa.select;
        // this.data = this.props.data;
        this.data.proveedor = this.state.proveedor;
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
                    <SText bold color={STheme.color.danger} >SELECCIONE LA SUCURSAL</SText>
                </SView>
                <SHr height={24} />
            </SView>
        }

        var { nit, razon_social, key_sucursal, telefono, correo, direccion,key_usuario, key } = this.data.proveedor
        var onPress;
        if (!this.props.disabled) {
            onPress = this.seleccionarProveedor.bind(this)
        }
        var urlFoto = "";
        if (key_sucursal) {
            urlFoto = SSocket.api.empresa + "sucursal/" + key_sucursal;
        } else if (key) {
            urlFoto = SSocket.api.root + "usuario/" + key;
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
                <SView col={"xs-12 sm-7 md-7 lg-7 xl-7"} row style={{ paddingBottom: 6 }}>
                    <SView width={35} height={35} style={{ borderRadius: 100, overflow: 'hidden', backgroundColor: STheme.color.card }}>
                        <SImage src={urlFoto} enablePreview style={{ borderRadius: 100, overflow: 'hidden', resizeMode: "cover" }} />
                    </SView>
                    <SView width={8} />
                    <SText center>{razon_social}</SText>
                    <SHr height={1} />
                    <SText center>Email: {correo}</SText>
                </SView>
                <SView col={"xs-12 sm-5 md-5 lg-5 xl-5"} style={{ paddingBottom: 6 }}>
                    <SText >{`NIT/CI/CEX: ${nit}`}</SText>
                    <SHr />
                    <SText  >{telefono ? `Teléfono: ${telefono}` : ""}</SText>
                </SView>
                <SText col={"xs-12"}>Dirección: {direccion}</SText>
                <SHr />
            </SView>
            <SHr />
        </SView>
        // return <SView col={"xs-12"} center >
        //     <SHr />
        //     <SView center onPress={onPress}>
        //         <SView width={40} height={40} style={{ padding: 4 }}>
        //             <SView flex height card>
        //                 <SImage src={Model.sucursal._get_image_download_path(SSocket.api, key_sucursal)} />
        //             </SView>
        //         </SView>
        //         <SHr />
        //         <SText center col={"xs-10"}>{razon_social}</SText>
        //         <SHr />
        //         <SText center col={"xs-10"}>{`Nit. ${nit}`}</SText>
        //         <SText center col={"xs-10"}>{`Tel. ${telefono ?? ""}`}</SText>
        //         <SText center col={"xs-10"}>{correo}</SText>
        //         <SText center col={"xs-10"}>{direccion}</SText>
        //     </SView>

        //     <SHr />
        // </SView>
    }
}
