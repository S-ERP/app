import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SForm, SHr, SIcon, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import Container from '../../Components/Container';
// import Header from '../registro/components/Header';
import CryptoJS from 'crypto-js';
import BtnSend from '../registro/components/BtnSend';
import Model from '../../Model';
import PButtom from '../../Components/PButtom';

class password extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.params = SNavigation.getAllParams();
    }

    alertErrorPassword() {
        return <SView col={"xs-11 md-8 xl-6"} row center style={{ height: 250, borderRadius: 8, }} backgroundColor={STheme.color.background} >
            <SView col={"xs-11"} height={40} />
            <SView col={"xs-11"}  >
                <SIcon name={"Password"} height={100} fill={STheme.color.primary} />
            </SView>
            <SView col={"xs-11"} height={15} />
            <SView col={"xs-12"} center  >
                <SText center color={STheme.color.darkGray} style={{ fontSize: 18, fontWeight: "bold" }}>Las contraseñas no coinciden</SText>
            </SView>
            <SView col={"xs-11"} height={30} />
        </SView>
    }

    alertErrorPasswordLength() {
        return <SView col={"xs-11 md-8 xl-6"} row center style={{ height: 250, borderRadius: 8, }} backgroundColor={STheme.color.background} >
            <SView col={"xs-11"} height={40} />
            <SView col={"xs-11"}  >
                <SIcon name={"InputPassword"} height={100} fill={STheme.color.primary} />
            </SView>
            <SView col={"xs-11"} height={15} />
            <SView col={"xs-12"} center  >
                <SText center color={STheme.color.darkGray} style={{ fontSize: 18, fontWeight: "bold" }}>Las contraseñas deben contener más de 8 caracteres.</SText>
            </SView>
            <SView col={"xs-11"} height={30} />
        </SView>
    }

    onSubmit(values) {
        // if ((values["Password"].length <= 8) && (values["RepPassword"].length <= 8)) {
        //     SPopup.open({ content: this.alertErrorPasswordLength() });
        //     return null;
        // }
        if (values["Password"] != values["RepPassword"]) {
            SPopup.open({ content: this.alertErrorPassword() });
            return null;
        }
        var password = CryptoJS.MD5(values["Password"]).toString();
        let usuario = Model.usuario.Action.getUsuarioLog();
        this.setState({ loading: true, error: "" })
        Model.usuario.Action.editar({
            data: {
                ...usuario,
                Password: password,
            },
            key_usuario: Model.usuario.Action.getKey()
        }).then((resp) => {
            this.setState({ loading: false, error: "" })
            SNavigation.goBack();
        }).catch((e) => {
            this.setState({ loading: false, error: e.error })
            SPopup.alert("Error en los datos");
        })
        // delete values["RepPassword"];
    }

    render() {
        return (
            <SPage  >
                {/* <Header title={"Cambia la contraseña de acceso."} /> */}
                <SView col={"xs-12"} center>
                    <SHr height={30} />
                    <SView center width={100} height={100} style={{
                        borderRadius: 100,
                        backgroundColor: STheme.color.card,
                        padding: 10,
                        borderWidth: 2,
                        borderColor: STheme.color.primary,
                    }}>
                        <SIcon name={"pass"} width={50} height={50} fill={STheme.color.text} />
                    </SView>
                    <SHr height={16} />
                    <SText center fontSize={18} color={STheme.color.text}>{"Cambia la contraseña de acceso"}</SText>
                    <SHr height={20} />
                </SView>
                <Container>
                    <SForm
                        col={"xs-12"}
                        ref={(form) => { this.form = form; }}
                        inputProps={{ separation: 16 }}
                        inputs={{
                            Password: { placeholder: "Password", isRequired: true, type: "password" },
                            RepPassword: { placeholder: "Repetir password", type: "password", isRequired: true },
                        }}
                        onSubmit={this.onSubmit.bind(this)}
                    />
                    <SHr height={20} />
                    <PButtom onPress={() => this.form.submit()}>{"CONFIRMAR"}</PButtom>
                </Container>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(password);