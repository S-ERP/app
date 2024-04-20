import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Linking } from 'react-native'
import { SButtom, SForm, SHr, SIcon, SImage, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import SSocket from "servisofts-socket"
import Model from '../../Model';
import Container from '../../Components/Container';
import Adornos from '../../Components/Adornos';
import BtnNext from './Components/BtnNext';
import { Parent } from '.';
export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        if (!this.register && !Model.usuario.Action.getUsuarioLog()) {
            SNavigation.replace("/login");
            return null;
        }
        return (
            <>
                <SPage title={''} center onRefresh={(end) => {
                    Model.usuarioPage.Action.CLEAR();
                    end()

                }} >
                    <SHr height={20} />
                    <SView style={{ position: "absolute", left: -20, top: '10%', overflow: "hidden" }}>
                        <SIcon name="emp4" height={400} width fill={STheme.color.gray + "20"} />
                    </SView>
                    <Container >
                        <SHr height={40} />
                        <Adornos.titulo time={30} label={"Debes ingresar los datos de tu empresa."} fontSize={18} />
                        <SHr height={10} />
                        <SView col={"xs-12"} center>
                            <SForm
                                ref={(form) => { this.form = form; }}
                                row
                                style={{
                                    justifyContent: "space-between",
                                }}
                                inputProps={{
                                    col: "xs-12",
                                }}
                                inputs={{
                                    foto: {
                                        type: "image",
                                        label: "FOTO",
                                        placeholder: "Foto",
                                        isRequired: true,
                                        defaultValue: this.pk ? SSocket.api.empresa + "empresa/" + this.pk : "",
                                        style: {
                                            height: 159
                                        }
                                    },

                                    nit: {
                                        type: "nit",
                                        label: "NIT",
                                        placeholder: "NIT",
                                        icon: <SIcon name={"email"} />,
                                        // validations: { required: true },
                                        isRequired: true,
                                    },
                                    razon_social: {
                                        type: "razon_social",
                                        label: "RAZON SOCIAL",
                                        placeholder: "RAZON SOCIAL",
                                        icon: <SIcon name={"email"} />,
                                        // validations: { required: true },
                                        isRequired: true,
                                    },
                                }}

                                onSubmit={(data) => {

                                    // this.form.submit();
                                    this.form.uploadFiles(
                                        SSocket.api.empresa + "upload/empresa/" + this.pk,
                                        "foto"
                                    );
                                    this.register = true;
                                    this.setState({ loading: true })
                                    data.key_servicio = "1427e867-c4f7-4602-a1aa-5deabf2d0372";
                                    Model.empresa.Action.registro({
                                        // Parent.model.Action.registro({
                                        data: data,
                                        key_usuario: Model.usuario.Action.getKey()
                                    }).then((resp) => {

                                        this.form.uploadFiles(
                                            SSocket.api.empresa + "upload/empresa/" + resp.data.key,
                                            "foto"
                                        );

                                        Model.empresa.Action.setEmpresa(resp.data);
                                        new SThread(500, "navigate_init").start(() => {
                                            //     path: "/empresa/paso2",
                                            //     key: resp.data.key
                                            // }

                                            SNavigation.navigate("/empresa/init", {
                                                onEnd: () => {
                                                    SNavigation.replace("/tarea")
                                                    // SNavigation.navigate("/empresa/paso2", {
                                                    //     key: resp.data.key
                                                    // })
                                                }
                                            })
                                        })

                                        // SNavigation.goBack();
                                    }).catch(e => {
                                        this.setState({ loading: false })
                                        console.error(e);

                                    })
                                    // Model.usuario.Action.recuperarPass({ correo: (values.correo + "").toLowerCase() }).then(resp => {
                                    //     SNavigation.navigate("/login/recuperar_codigo");
                                    // }).catch(e => {
                                    //     console.error(e);
                                    // })
                                }}
                            >
                            </SForm>
                            <SHr height={15} />
                            {/* <PButtom label="Siguiente" onPress={() => {
                                this.form.submit();
                                
                            }
                            } /> */}

                            <BtnNext loading={this.state.loading} onPress={() => this.form.submit()}>{"SIGUIENTE"}</BtnNext>
                            <SHr height={25} />
                            {/* <SView col={"xs-12"} center onPress={() => { SNavigation.navigate("/empresa/paso2"); }}>
                                <SText center fontSize={18} bold color={STheme.color.text}>Configurar más tarde</SText>
                            </SView> */}


                        </SView>
                    </Container>

                    {/* <SHr height={40} /> */}
                </SPage >
                {/* <Container center >
                    <PButtomFooter url={'paso1'} label="Siguiente" />
                </Container> */}
            </>
        );
    }
}
// const initStates = (state) => {
//     return { state }
// };
// export default connect(initStates)(index);
