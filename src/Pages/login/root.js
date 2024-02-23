import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SForm, SHr, SIcon, SInput, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../../Model';
import CryptoJS from 'crypto-js';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        if (Model.usuario.Action.getUsuarioLog()) {
            SNavigation.goBack();
            return null;
        }

        return (
            <SPage title={'Login'} hidden >
                <SView col={"xs-12"} center>
                    <SHr height={50} />
                    <SView width={300} height={100} center>
                        <SIcon name={"Logo"} fill={STheme.color.secondary} />
                    </SView>
                    <SHr height={50} />
                    <SText fontSize={18}>Iniciar sesión</SText>
                    <SHr height={16} />
                    <SForm
                        col={"xs-11 sm-10 md-8 lg-6 xl-4"}
                        ref={ref => this.form = ref}
                        inputs={{
                            usuario: {
                                label: "Correo, CI o Telefono",
                                type: 'email',
                                required: true,
                                autoFocus: true,
                                keyboardType: 'email-address',
                                onKeyPress: (evt) => {
                                    if (evt.key === 'Enter') {
                                        this.form.focus('password');
                                    }
                                },
                            },
                            password: {
                                label: "Contraseña",
                                type: "password",
                                required: true,
                                onKeyPress: (evt) => {
                                    if (evt.key === 'Enter') {
                                        this.form.submit();
                                    }
                                },
                            }
                        }}
                        loading={this.state.loading}
                        error={this.state.error}
                        onSubmitName={"Ingresar"}
                        onSubmitProps={{
                            type: "outline"
                        }}
                        onSubmit={(data) => {
                            data["password"] = CryptoJS.MD5(data["password"]).toString();
                            console.log(data);
                            Model.usuario.Action.login(data).then((resp) => {
                                console.log("exito");
                            }).catch(e => {
                                // SPopup.alert("usuario no encontrado")
                                if (e?.error == "error_password") {
                                    this.setState({ loading: false, error: "Usuario o contraseña incorrectos." })
                                } else {
                                    this.setState({ loading: false, error: "Ha ocurrido un error al iniciar sesión." })
                                }
                            })
                        }}
                    />
                    <SHr height={15} />
                    <SView col={"xs-12"} center row>
                        <SText>¿Olvidaste tu contraseña? </SText>
                        <SText onPress={() => {
                            SNavigation.navigate("/login/recuperar")
                        }} color={STheme.color.blue}>clic AQUÍ</SText>
                    </SView>
                    <SHr height={20} />
                    <SHr color={STheme.color.card} />
                    <SHr height={20} />
                    <SView col={"xs-12"} center >
                        <SText>¿No tienes una cuenta?</SText>
                        <SHr height={20} />
                        <SButtom type='secondary' style={{textAlign: "center" }} onPress={() => {
                            SNavigation.navigate("/registro", {
                                onSelect: (a) => {
                                    this.setState({ tipo_producto: a })
                                }
                            })
                        }}>Crear nuevo usuario</SButtom>
                    </SView>
                </SView>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(Login);