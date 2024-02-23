import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import { SHr, SLoad, SThread } from 'servisofts-component';
import { SButtom, SDate, SForm, SNavigation, SPage, SPopup, SText, STheme, SView, SIcon } from 'servisofts-component';
// import { Container, PButtom } from '../../Components';
import Container from '../../Components/Container';
import PButtom from '../../Components/PButtom';


import Model from '../../Model';

class recuperar extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.key = SNavigation.getParam("key");
        this.key_rol = SNavigation.getParam("key_rol");
        if (!this.key_rol) {
            this.key_rol = "d16d800e-5b8d-48ae-8fcb-99392abdf61f";
        }
    }
    componentDidMount() {
        new SThread(100, "render_window").start(() => {
            this.setState({ ready: true })
        })
    }
    getForm() {
        return <SForm
            ref={(ref) => { this.form = ref; }}
            row
            style={{
                justifyContent: "space-between",
            }}
            inputProps={{
                col: "xs-12",
            }}
            inputs={{
                correo: { placeholder: "email@example.com", type: "email", isRequired: true },
            }}
          
            onSubmit={(values) => {
                Model.usuario.Action.recuperarPass({ correo: (values.correo + "").toLowerCase() }).then(resp => {
                    SNavigation.navigate("/login/recuperar_codigo");
                }).catch(e => {
                    console.error(e);
                })
            }}
        />
    }

    render() {
        // var error = Usuario.Actions.getError("recuperarPass", this.props);
        // if (error) {
        //     SPopup.alert("Usuario no encontrado, Verifique sus datos.");
        // }
        // if (this.props.state.usuarioReducer.estado == "exito" && this.props.state.usuarioReducer.type == "recuperarPass") {
        //     this.props.state.usuarioReducer.estado = "";
        //     SNavigation.navigate(Usuario.component + "/codigoRecuperarContrasena");
        // }
        return (
            <SPage title={"Recuperar Contraseña"}>
                <SView center>
                    <Container loading={!this.state.ready}>
                        <SView height={40} />
                        <SText fontSize={16} color={STheme.color.text} center >Le enviaremos un mensaje para configurar o restablecer su nueva contraseña. </SText>
                        <SView height={40} />
                        {this.getForm()}
                        <SView height={16} />
                        <SView col={"xs-11"} row center>
                            <PButtom secondary onPress={() => {
                                this.form.submit();
                            }}>ENVIAR CÓDIGO</PButtom>
                        </SView>
                        <SHr />
                        <SHr />
                        <SHr />
                        <SView col={"xs-11"} row center onPress={() => {
                            SNavigation.navigate("/login/recuperar_codigo");
                        }}>
                            <SText fontSize={14} style={{
                                textDecorationLine: "underline",
                            }}>¡Ya tengo un código!</SText>
                        </SView>
                        <SView height={36} />
                    </Container>
                </SView>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(recuperar);