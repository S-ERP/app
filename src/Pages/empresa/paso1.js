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
            <>
                <SPage title={''} center onRefresh={(end) => {
                    Model.usuarioPage.Action.CLEAR();
                    end()

                }}>
                    <Container >
                        <Adornos.titulo time={30} label={"Debes ingresar los datos de tu empresa."} fontSize={18} />

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
                                    this.setState({ loading: true })
                                    data.key_servicio = "1427e867-c4f7-4602-a1aa-5deabf2d0372";
                                    Model.empresa.Action.registro({
                                        // Parent.model.Action.registro({
                                        data: data,
                                        key_usuario: Model.usuario.Action.getKey()
                                    }).then((resp) => {
                                        this.setState({ loading: false })
                                        Model.empresa.Action.setEmpresa(resp.data);
                                        new SThread(500, "navigate_init").start(() => {
                                            //     path: "/empresa/paso2",
                                            //     key: resp.data.key
                                            // }
                                            SNavigation.navigate("/empresa/paso2", {
                                                key: resp.data.key
                                            })
                                            SNavigation.navigate("/empresa/init")
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

                    <SHr height={40} />
                </SPage >
                {/* <Container center >
                    <PButtomFooter url={'paso1'} label="Siguiente" />
                </Container> */}
            </>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);
