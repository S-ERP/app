import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Linking } from 'react-native'
import { SButtom, SForm, SHr, SIcon, SImage, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import SSocket from "servisofts-socket"
import Model from '../../Model';
import Container from '../../Components/Container';
import Adornos from '../../Components/Adornos';
import BtnNext from './Components/BtnNext';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.pk = SNavigation.getParam("key");
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
                        <Adornos.titulo label={"Sube el logo de tu empresa"} fontSize={18} />

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
                                        label: "Foto",
                                        placeholder: "Foto",
                                        isRequired: true,
                                        defaultValue: SSocket.api.root + "empresa/" + this.pk,
                                        style: {
                                            height: 159
                                        }
                                    },
                                   
                                }}

                                onSubmit={(data) => {

                                    // this.form.submit();
                                    data.key_servicio = "1427e867-c4f7-4602-a1aa-5deabf2d0372";
                                    console.log("this.pk")
                                    console.log(this.pk)
                                    this.form.uploadFiles(
                                        SSocket.api.root + "upload/empresa/" + this.pk,
                                        "foto"
                                    );
                                    SNavigation.replace("/empresa/list", { key: this.pk })
                                   
                                }}
                            >
                            </SForm>

                            {/* <SIcon name="picture" width={200} height={159} fill={STheme.color.darkGray} /> */}
                            <SHr height={25} />
                          
                            <BtnNext onPress={() => {this.form.submit() }}>{"SIGUIENTE"}</BtnNext>
                            <SHr height={25} />
                            <SView col={"xs-12"} center onPress={() => { SNavigation.navigate("/sucursal/paso1")}}>
                                <SText center fontSize={18} bold color={STheme.color.text}>Configurar más tarde</SText>
                            </SView>

                        </SView>
                    </Container>

                    <SHr height={40} />
                </SPage >
               
            </>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);