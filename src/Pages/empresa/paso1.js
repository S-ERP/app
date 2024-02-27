import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Linking } from 'react-native'
import { SButtom, SForm, SHr, SIcon, SImage, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import SSocket from "servisofts-socket"
import Model from '../../Model';
import Container from '../../Components/Container';
import Components from '../../Components';
import PButtomFooter from '../../Components/PButtomFooter';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        if (!Model.usuario.Action.getUsuarioLog()) {
            console.log("ggggggg")

            SNavigation.replace("/login");
            return null;
        }
        return (
            <SPage title={''} center onRefresh={(end) => {
                Model.usuarioPage.Action.CLEAR();
                end()

            }}>
                <Container >
                    <SView col={"xs-12"} center>
                        <SHr height={10} />
                        <SImage src={require('../../Assets/png/franja.png')} style={{ width: " 100%", height: 150, borderRadius: 100, resizeMode: "contain" }} />
                        <SHr height={10} />
                    </SView>


                    <SView col={"xs-8"} style={{ padding: 10, borderRadius: 25, borderWidth: 1, borderColor: STheme.color.secondary }} center>
                        <SText center fontSize={18} bold>
                            Debes ingresar todos los datos:</SText>
                    </SView>
                    <SView col={"xs-12"} center>
                        <SHr height={10} />
                        <SImage src={require('../../Assets/png/franja.png')} style={{ width: " 100%", height: 150, borderRadius: 100, resizeMode: "contain" }} />
                        <SHr height={10} />
                    </SView>
                    <SHr height={25} />
                    <SView col={"xs-12"} center>
                        <SForm
                            ref={(ref) => { this.form = ref; }}
                            row
                            style={{
                                justifyContent: "space-between",
                            }}
                            inputProps={{
                                col: "xs-12",
                            }}
                            inputs={{

                              
                                nombre: {
                                    type: "nombre",
                                    label: "NOMBRE",
                                    placeholder: "NOMBRE",
                                    icon: <SIcon name={"email"} />,
                                    validations: { required: true },
                                },



                                nit: {
                                    type: "nit",
                                    label: "NIT",
                                    placeholder: "NIT",
                                    icon: <SIcon name={"email"} />,
                                    validations: { required: true },
                                },

                                razon: {
                                    type: "razon",
                                    label: "RAZON SOCIAL",
                                    placeholder: "RAZON SOCIAL",
                                    icon: <SIcon name={"email"} />,
                                    validations: { required: true },
                                },


                            }}

                            onSubmit={(values) => {
                                Model.usuario.Action.recuperarPass({ correo: (values.correo + "").toLowerCase() }).then(resp => {
                                    SNavigation.navigate("/login/recuperar_codigo");
                                }).catch(e => {
                                    console.error(e);
                                })
                            }}
                        >
                        </SForm>
                    </SView>
                </Container>
                <PButtomFooter url={'paso1'} label="Siguiente" />
                <SHr height={10} />
            </SPage >
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);