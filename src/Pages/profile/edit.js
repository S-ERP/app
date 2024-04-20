import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SNavigation, SPage, SText, SView, STheme, SForm, SPopup, SImage, SLoad, SStorage, SButtom, SIcon, SWebView, STable2, SMath, SDate, SList, } from 'servisofts-component';
import { WebView } from 'react-native';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import PButtom from '../../Components/PButtom';
// import {  PButtom } from '../../Components';
// import usuario_dato from '../../Model/tapeke/usuario_dato';


class index extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    load_data() {
        this.data = Model.usuario.Action.getUsuarioLog();
        return this.data;
    }

    getForm() {
        if (!this.load_data()) return <SLoad />
        // var isApi = this.data.gmail_key || this.data.facebook_key
        console.log((SSocket.api.root + "usuario/" + this.data?.key )+ " fff")
        return <SForm
            ref={(ref) => { this.form = ref; }}
            style={{
                alignItems: "center",
            }}
            inputs={{
                foto_p: { type: "image", isRequired: false, defaultValue: SSocket.api.root + "usuario/" + this.data?.key + "?date=" + new Date().getTime(), col: "xs-4", style: { borderRadius: 100, overflow: 'hidden', width: 140, height: 140, borderWidth: 1, borderColor: STheme.color.lightGray, alignItems: "center", } },
                Nombres: { label: "Nombres", isRequired: true, defaultValue: this.data["Nombres"],  },
                Apellidos: { label: "Apellidos", isRequired: true, defaultValue: this.data.Apellidos,  },
                Correo: { label: "Correo", type: "email", isRequired: true, defaultValue: this.data.Correo,  },
                CI: { label: "CI",  isRequired: true, defaultValue: this.data.CI,  },
                "Telefono": { label: "Telefono", defaultValue: this.data["Telefono"], type: "phone" },
               
                // ...(isApi ? {} : {
                //     Password: { label: "Contraseña", type: "password", isRequired: true, defaultValue: this.data.Password, icon: <SIcon name={"InputPassword"} width={40} height={30} /> },
                //     RepPassword: { label: "Repetir contraseña", type: "password", isRequired: true, defaultValue: this.data.Password, icon: <SIcon name={"InputRePassword"} width={40} height={30} /> }
                // }),
            }}
            onSubmit={(values) => {
                var finalObj = {
                    ...this.data,
                    ...values
                }
                this.form.uploadFiles(Model.usuario._get_image_upload_path(SSocket.api, this.data.key), "foto_p");
                Model.usuario.Action.editar({
                    data: finalObj,
                    key_usuario: Model.usuario.Action.getKey()
                }).then((resp) => {
                    SStorage.setItem("usr_log", JSON.stringify(finalObj)) //Modificar SStorage datos session
                    // Model.usuario.Action.CLEAR(); //Limpiar caché
                    Model.usuario.Action.syncUserLog()
                    SNavigation.goBack();
                }).catch((e) => {
                    SPopup.alert("Error en los datos");
                })
            }}
        />
    }

    alertError(error, icono, mensaje) {
        return <SView col={"xs-12 md-8 xl-6"} row style={{ height: 250, borderRadius: 8, }} backgroundColor={STheme.color.background} center>
            <SView col={"xs-11"}  >
                <SView height={30}></SView>
                <SIcon name={"UserAlert"} height={100} />
            </SView>
            <SView col={"xs-11"} center  >
                <SText color={STheme.color.darkGray} style={{ fontSize: 20, fontWeight: "bold" }}>{mensaje} existente</SText>
                <SText color={STheme.color.darkGray} style={{ fontSize: 15 }}>El {mensaje} que ingresó ya está asociado a una cuenta activa.</SText>
                <SView height={30}></SView>
            </SView>
        </SView>
    }

    alertErrorPassword() {
        return <SView col={"xs-11 md-8 xl-6"} row center style={{ height: 250, borderRadius: 8, }} backgroundColor={STheme.color.background} >
            <SView col={"xs-11"} height={40} />
            <SView col={"xs-11"}  >
                <SIcon name={"InputPassword"} height={100} fill={STheme.color.primary} />
            </SView>
            <SView col={"xs-11"} height={15} />
            <SView col={"xs-12"} center  >
                <SText center color={STheme.color.darkGray} style={{ fontSize: 18, fontWeight: "bold" }}>Las contraseñas no coinciden</SText>
            </SView>
            <SView col={"xs-11"} height={30} />
        </SView>
    }

    render() {
        return (
            <>
                <SPage title={'Editar perfil'} onRefresh={() => {
                    Model.usuario.Action.CLEAR();
                }} >
                    <SView center>
                        <SView col={"xs-11 md-6 xl-4"} center>
                            <SView height={16} />
                            {/* <SView col={"xs-12"} center>
                            <SText color={"#DE5738"} fontSize={18} >MIS DATOS</SText>
                        </SView> */}
                            {this.getForm()}
                            <SView height={16} />
                            <SView col={"xs-12"} row center>
                                <PButtom fontSize={20} onPress={() => {
                                    this.form.submit();
                                }}>CONFIRMAR</PButtom>
                            </SView>
                            <SView height={20} />
                            <PButtom fontSize={20} onPress={() => {
                                 SNavigation.navigate("/profile/changepass")
                                }}>CAMBIAR CONTRASEÑA</PButtom>
                            <SView height={36} />

                        </SView>
                        {/* <RolDeUsuario data={this.data} /> */}
                    </SView>
                </SPage>
            </>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);