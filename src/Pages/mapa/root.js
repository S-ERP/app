import React, { Component } from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import { SHr, SIcon, SInput, SLoad, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
import UsuariosActivos from './Components/UsuariosActivos';
import Container from '../../Components/Container';
import MyPerfil from './Components/MyPerfil';
import Notas from './Components/Notas';
import MyBilletera from './Components/MyBilletera';
import Actividades from './Components/Actividades';
import PerfilEmpresa from './Components/PerfilEmpresa';
import PHr from '../../Components/PHr';
import Model from '../../Model';
import Chat from './Components/Chat';
import Publicaciones from './Components/Publicaciones';
import InvitarUsuario from '../../Components/empresa/InvitarUsuario';
import { ScrollView as ScrollViewGesture } from 'react-native-gesture-handler';
import SSocket from 'servisofts-socket';
import MenuOpciones from './Components/MenuOpciones';

import { GeolocationMapSelect } from 'servisofts-rn-geolocation'
import PButtom from '../../Components/PButtom';

export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cargar: true
        };
        this.callback = SNavigation.getParam("callback");
        this.hiddeDescripcion = SNavigation.getParam("hiddeDescripcion");
        this.datosNav = SNavigation.getAllParams();
        // console.log("loadDataUser", SNavigation.lastRoute)
    }

    getImput() {
        if (this.hiddeDescripcion) return null;

        //  if (!this.props.state.direccion_usuarioReducer.miDireccion) return null;
        return <SView col={"xs-12"} >
            <SInput fontSize={16} placeholder={"Nombre de dirección"}
                // customStyle={"kolping"}
                isRequired={true}
                height={55}
                icon={<SIcon name={"mapk"} width={40} height={30} />}
                style={{ backgroundColor: STheme.color.white, borderRadius: 8 }}
                ref={(ref) => { this.inpNombreUbicacion = ref }}
            />
        </SView>
    }

    getComponentBottom() {
        return <SView col={"xs-12"} height={220} row center style={{
            backgroundColor: STheme.color.primary,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: "hidden",
        }}>
            <Container>
                <SHr height={16} />
                <SView col={"xs-11"} center row border={'transparent'}>
                    {this.getImput()}
                    <SHr height={10} />
                </SView>
                <SHr />
                <SView col={"xs-12"} row center border={'transparent'}>
                    <SView width={40} center>
                        <SIcon name={'miUbi'} height={14} width={14} />
                    </SView>
                    <SView width={200} onPress={() => {
                        this.map.getMap().center();
                        // console.log("TODO: center map")
                    }}>
                        <SText fontSize={15} color={STheme.color.white} bold>Utilizar mi ubicación actual</SText>
                    </SView>
                </SView>
                <SHr />
                <SView col={"xs-8.8"} row center border={'transparent'}  >
                    <PButtom secondary loading={this.state.loading} fontSize={16} onPress={() => {
                        var descripcion = "";
                        if (!this.hiddeDescripcion) {
                            if (!this.inpNombreUbicacion.verify()) {
                                return null;
                            }
                            descripcion = this.inpNombreUbicacion.getValue();
                        }
                        var data = {
                            descripcion: descripcion,
                            latitude: this.state?.data?.latitude,
                            longitude: this.state?.data?.longitude,
                            direccion: this.state?.data?.direccion,
                        }
                        if (this.callback) {
                            this.callback(data);
                            // SNavigation.goBack();
                        } else {
                            //this.setState({ loading: true })
                            console.log("hhhhhhhh")

                            // Model.direccion_usuario.Action.registro({
                            //     data: data,
                            //     key_usuario: Model.usuario.Action.getKey(),
                            // }).then((resp) => {
                            //     this.setState({ loading: false })
                            //     SNavigation.goBack();
                            // }).catch((e) => {
                            //     this.setState({ loading: false })
                            // })
                            SNavigation.navigate("ficha/paciente/facturacion", { direccion: data, ...this.datosNav })
                        }

                    }}>ELEGIR ESTA UBICACIÓN</PButtom>
                </SView>
                <SHr height={10} />
            </Container>
        </SView>
    }
    render() {

        return <SPage center>
            <GeolocationMapSelect
                ref={(map) => this.map = map}
                icon={<SIcon name="mapIcon" width={35} height={57} fill={STheme.color.info} />}
                onChange={(evt) => {
                    this.setState({ data: evt })
                }} />
            {this.getComponentBottom()}
        </SPage>
    }
}
