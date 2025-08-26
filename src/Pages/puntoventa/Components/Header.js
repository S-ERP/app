import React, { Component } from 'react';
import { SImage, SInput, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SIconApp from '../../../Assets/SIconApp';
import Model from '../../../Model';
import FotoUsuario from './Foto/FotoUsuario';
import MDL from '../../../MDL';

export default class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sucursal: null,
        };
    }

    componentDidMount() {
        this.cargarSucursalGuardada();
    }

    cargarSucursalGuardada() {
        MDL.compra_venta.getSucursalSeleccionada()
            .then(sucursal => {
                if (sucursal) {
                    this.setState({ sucursal });
                }
            })
            .catch(e => {
                console.error("Error cargando sucursal guardada:", e);
            });
    }

    seleccionarSucursal() {
        SNavigation.navigate("/sucursal", {
            onSelect: (obj) => {
                const sucu = {
                    descripcion: obj.descripcion,
                    telefono: obj.telefono,
                    correo: obj.correo,
                    direccion: obj.direccion,
                    key_sucursal: obj.key,
                }
                MDL.compra_venta.setSucursalSeleccionada(sucu)
                    .then(() => {
                        // Actualiza propiedad interna del modelo (opcional)
                        MDL.compra_venta.sucursalSeleccionada = sucu;
                        // Actualiza el estado local para refrescar UI
                        this.setState({ sucursal: sucu });
                    })
                    .catch(() => {
                        console.log("Error al guardar sucursal");
                    });
            }
        });
    }

    render() {
        let usuario = Model.usuario.Action.getUsuarioLog();
        let empresa = Model.empresa.Action.getSelect();
        let sucursal = this.state.sucursal;

        return (
            <SView col={"xs-12"} row center height={40} backgroundColor={STheme.color.background} style={{ borderBottomWidth: 1, borderColor: STheme.color.card }}>
                <SView width={40} style={{ paddingBottom: 4 }} center height
                    onPress={() => {
                        if (this.props.onBack) {
                            const prevent_default = this.props.onBack();
                            if (prevent_default) return;
                        }
                        SNavigation.goBack();
                    }}
                >
                    <SIconApp height={20} name={"Arrow"} fill={STheme.color.text} />
                </SView>

                <SView col={"xs-4 md-2"} row border="transparent" >
                    <SText fontSize={15} bold color={STheme.color.text} style={{ letterSpacing: -0.5, textTransform: "uppercase" }}>
                        {empresa?.razon_social || ""}
                    </SText>
                </SView>

                {/* <SView flex />

                <SView col={"xs-4 md-2"} row border="transparent"
                    onPress={() => this.seleccionarSucursal()}
                    style={{
                        padding: 5,
                        borderRadius: 8,
                        backgroundColor: STheme.color.card,
                    }} center
                >
                    <SText fontSize={14} bold color={STheme.color.text} style={{ letterSpacing: -0.5, textTransform: "uppercase" }}>
                        Suc: {sucursal?.descripcion || "Selecciona"}
                    </SText>
                    <SView width={10} />
                    <SView style={{
                        top: -1,
                        width: 0,
                        height: 0,
                        borderLeft: "8px solid transparent",
                        borderRight: "8px solid transparent",
                        borderBottom: "12px solid",
                        borderBottomColor: STheme.color.text,
                        borderRadius:3,
                        transform: "rotate(180deg)"
                    }} />
                </SView> */}

                <SView flex />

                <SView col={"xs-7 md-5 lg-3"} height row center border="transparent" style={{ justifyContent: "flex-end" }}>
                    
                    <SView col={"xs-10 md-8"} row center backgroundColor='transparent' style={{
                        borderRightColor: STheme.color.gray,
                        borderRightWidth: 1,
                    }}>
                        <SView center backgroundColor={"transparent"} style={{ width: 28, height: 28, borderRadius: 16, marginRight: 8, overflow: "hidden" }}>
                            <FotoUsuario data={usuario} />
                        </SView>
                        <SText fontSize={14} color={STheme.color.text}>
                            {/* {usuario?.Nombres + " " + usuario?.Apellidos} */}
                            {usuario?.Nombres}
                        </SText>
                    </SView>
                      <SView flex />
                    <SView col={"xs-0 md-1"} backgroundColor='transparent'>
                        <SIconApp name="Wifi" width={20} height={20} fill={"#19b121ff"} />
                    </SView>
                    <SView flex />
                    <SView col={"xs-1.5 md-1"} height style={{ paddingTop: 15 }} row center>
                        <SIconApp name="Menu2" width={28} stroke={STheme.color.text} fill={STheme.color.text} />
                    </SView>
                    <SView flex />
                </SView>
            </SView>
        );
    }
}
