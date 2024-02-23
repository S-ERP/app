import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import { SLoad } from 'servisofts-component';
import { SButtom, SDate, SForm, SNavigation, SPage, SPopup, SText, STheme, SView, SIcon } from 'servisofts-component';
import PButtom from '../../Components/PButtom';
import Model from '../../Model';

class recuperar_codigo extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
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
                Codigo: { placeholder: "Ingrese el código recibido", type: "text", isRequired: true },
            }}
            error={this.state.error}
           
            onSubmit={(values) => {
                Model.usuario.Action.verificarCodigoPass({ codigo: values.Codigo }).then(resp => {
                    var usr_rec = resp.data;
                    SNavigation.navigate("/login/recuperar_pass", usr_rec);
                }).catch(e => {
                    console.error(e);
                    if (e?.error == "error_datos") {
                        this.setState({ loading: false, error: "Código erróneo, verifique nuevamente." })
                    } else {
                        this.setState({ loading: false, error: "Ha ocurrido un error al introducir el código." })
                    }
                })
            }}
        />
    }

    render() {
        return (
            <SPage title={"Código de Recuperación"}>
                <SView center>
                    <SView col={"xs-11 md-6 xl-4"} center>
                        <SView height={40} />
                        <SText fontSize={24} color={STheme.color.primary}  center>¡Mensaje Enviado!</SText>
                        <SView height={10} />
                        <SText fontSize={16} color={STheme.color.text} center>Revise su bandeja de entrada e introduzca el código recibido. </SText>
                        <SView height={40} />
                       
                            <SView height={5} ></SView>
                            <SIcon name={"Message"} width={150} height={150} />
                        <SView height={36} />
                        {this.getForm()}
                        <SView height={16} />
                        <SView col={"xs-11"} row center>
                            <PButtom secondary
                                onPress={() => {
                                    this.form.submit();
                                }}>VALIDAR</PButtom>
                        </SView>
                        <SView height={36} />
                    </SView>
                    {/* <RolDeUsuario data={this.usr} /> */}
                </SView>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(recuperar_codigo);