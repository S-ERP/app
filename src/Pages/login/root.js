import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Font, SButtom, SForm, SHr, SIcon, SInput, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../../Model';
import CryptoJS from 'crypto-js';
import { Container } from '../../Components';

export default class Login extends Component {
    static HIDDEN = true;
    constructor(props) {
        super(props);
        this.state = {
            type: "email"
        };
    }

    render() {
        if (Model.usuario.Action.getUsuarioLog()) {
            SNavigation.goBack();
            return null;
        }

        return (
            <SPage title={'Login'} hidden >
                <Container>
                    <SHr height={16} />
                    <SView width={300} height={100} center>
                        <SIcon name={"Logo"} fill={STheme.color.secondary} />
                    </SView>
                    <SHr height={16} />
                    <SText fontSize={18}>Iniciar sesión</SText>
                    <SHr height={16} />
                    <SText col={"xs-12"} fontSize={10} color={STheme.color.lightGray}>{"Puedes iniciar session con los siguientes datos: "}</SText>
                    <BTNSelect value={this.state.type} onChange={(e) => {
                        this.setState({ type: e })
                    }} />
                    <SHr height={16} />

                    <SForm
                        col={"xs-12"}
                        ref={ref => this.form = ref}
                        inputs={{
                            usuario: {
                                label: "Ingresa el " + this.state.type,
                                type: this.state.type,
                                required: true,
                                // autoFocus: true,
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
                        //onSubmitName={"Ingresar"}
                        onSubmitProps={{
                            type: "outline"
                        }}
                        onSubmit={(data) => {
                            data["password"] = CryptoJS.MD5(data["password"]).toString();
                            console.log(data);

                            Model.usuario.Action.login(data).then((resp) => {
                                console.log("exito");
                                SNavigation.reset("/")
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

                  
                    <SView style={{


                        backgroundColor: STheme.color.white ,
                        borderRadius: 5,



                    }}
                    onPress={() => {
                        this.form.submit()
                    }}
                       >
                        <SText bold style={{
                            padding: 8,
                            textAlign: 'center',
                            fontSize: 12,
                            color: STheme.color.black

                        }}>Ingresar
                        </SText>
                    </SView>

                    <SHr height={15} />
                    <SView col={"xs-12"} center row>
                        <SText>¿Olvidaste tu contraseña? </SText>
                        <SText onPress={() => {
                            SNavigation.navigate("/login/comorecuperar")
                        }} color={STheme.color.blue}>clic Aquí</SText>
                    </SView>
                    <SHr height={20} />
                    <SHr color={STheme.color.card} />
                    <SHr height={20} />
                    <SView col={"xs-12"} center >
                        <SText>¿No tienes una cuenta?</SText>
                        <SHr height={12} />

                        <SView style={{


                            backgroundColor: STheme.color.white ,
                            borderRadius: 5,



                        }}

                            onPress={() => {
                                SNavigation.navigate("/registro", {
                                    onSelect: (a) => {
                                        this.setState({ tipo_producto: a })
                                    }
                                })
                            }}>
                            <SText bold style={{
                                padding: 8,
                                textAlign: 'center',
                                fontSize: 14,
                                color: STheme.color.black

                            }}>Crear nuevo usuario
                            </SText>
                        </SView>

                    </SView>
                </Container>
            </SPage>
        );
    }
}


const BTNSelect = (props: { onChange?: (e: any) => void, value: "email" | "phone" | "ci" }) => {
    const styleSelect = {
        backgroundColor: STheme.color.text,
    }
    const styleTextSelect = {
        color: STheme.color.primary,
    }


    const styleUnselect = {
        backgroundColor: STheme.color.card,
    }
    const styleUnsestyleTextUnSelectlect = {
        color: STheme.color.text,
    }
    return <SView col={"xs-12"} row center height={30} onPress={props.onChange.bind(this, "email")}>
        <SView flex center border card height style={(props.value == "email") ? styleSelect : styleUnselect}>
            <SText bold style={(props.value == "email") ? styleTextSelect : styleUnsestyleTextUnSelectlect}>{"Email"}</SText>
        </SView>
        <SView flex center border card height style={(props.value == "phone") ? styleSelect : styleUnselect} onPress={props.onChange.bind(this, "phone")}>
            <SText bold style={(props.value == "phone") ? styleTextSelect : styleUnsestyleTextUnSelectlect}>{"Telefono"}</SText>
        </SView>
        <SView flex center border card height style={(props.value == "ci") ? styleSelect : styleUnselect} onPress={props.onChange.bind(this, "ci")}>
            <SText bold style={(props.value == "ci") ? styleTextSelect : styleUnsestyleTextUnSelectlect}>{"CI"}</SText>
        </SView>
    </SView>
}
// const initStates = (state) => {
//     return { state }
// };
// export default connect(initStates)(Login);