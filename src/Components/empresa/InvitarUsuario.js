import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SText, STheme } from 'servisofts-component';
// import Share from 'react-native-share';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
export default class InvitarUsuario extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (<SText card padding={8} onPress={() => {
            // console.log(SNavigation.INSTANCE.props.linking)
            let usuario = Model.usuario.Action.getUsuarioLog();
            let empresa = Model.empresa.Action.getSelect();
            SSocket.sendPromise({
                component: "invitacion",
                type: "registro",
                key_usuario: Model.usuario.Action.getKey(),
                key_empresa: Model.empresa.Action.getKey(),
                data: {
                    descripcion: `${empresa.razon_social} te invita a formar parte de la empresa.`,
                    observacion: "Te invitamos a formar parte de la empresa. Acepta esta invitación.",
                    fecha_inicio: new SDate().toString(),
                    fecha_fin: new SDate().addDay(1).toString(),
                    color: STheme.color.success,
                    telefono: "",
                    email: "",
                    url: "",
                },
            }).then(e => {
                // let page_link = 'http://192.168.3.3:3000';
                let page_link = 'https://serp.servisofts.com';
                let invitation_link = `${page_link}/invitation?pk=${e.data.key}`
                console.log(invitation_link)
                console.log(e);
            }).catch(e => {
                console.error(e);
            })
            // let page_link = 'https://192.168.3.3:3000';
            // let invitation_link = `${page_link}/invitation`

            // let invitation = ``;
            // return;
            // Share.open({
            //     url: invitation_link
            // })
            //     .then((res) => {
            //         console.log(res);
            //     })
            //     .catch((err) => {
            //         err && console.log(err);
            //     });
            // console.log(invitation_link);
        }}>Invitar</SText>
        );
    }
}
