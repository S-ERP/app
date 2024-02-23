
import React, { Component } from 'react';
import { SForm, SHr, SIcon, SNavigation, SPopup, SText, SView } from 'servisofts-component';
import Model from '../../../Model';
import CryptoJS from 'crypto-js';

export default class SectionForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    submit() {
        this.form.submit();
    }
    render() {
        return (
            <SView col={"xs-12"} center>
                <SForm
                    ref={(ref) => { this.form = ref; }}
                    props={{
                        col: "xs-12",
                    }}
                    inputProps={{
                        separation: 16,
                    }}
                    inputs={{
                        usuario: {
                            // defaultValue:"rickypazd@icloud.com",
                            placeholder: "Correo",
                            isRequired: true, keyboardType: "email-address", autoCapitalize: "none", type: "email",  onKeyPress: (evt) => {
                                if (evt.key === "Enter") {
                                    this.form.focus("password");
                                }
                            },
                            // icon: <SIcon name={"InputEmail"} width={40} height={30} />
                        },
                        password: {
                            placeholder: "Contraseña",
                            type: "password", isRequired: true, onKeyPress: (evt) => {
                                if (evt.key === "Enter") {
                                    this.form.submit();
                                }
                            },
                            // icon: <SIcon name={"InputPassword"} width={40} height={30} />
                        },
                    }}
                    onSubmit={(data) => {
                        if (data) {
                            // data["password"] = CryptoJS.MD5(data["password"]).toString();
                            // Parent.Actions.login(data, this.props);
                            Model.usuario.Action.login(data).then((resp)=>{
                                SNavigation.goBack();
                                // SNavigation.reset("/");
                            }).catch((e)=>{
                                SPopup.alert("Error en los datos");
                            })
                        }
                    }}
                />
            </SView >
        );
    }
}
