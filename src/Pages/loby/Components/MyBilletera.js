import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SImage, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import SSocket from 'servisofts-socket';

export default class MyBilletera extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        SSocket.sendPromise({
          component: "billetera",
          type: "saldoBilletera",
          key_empresa: Model.empresa.Action.getKey(),
          key_usuario: Model.usuario.Action.getUsuarioLog()?.key,
        }).then(e => {
          this.setState({ data: e.data })
        }).catch(e => {
    
        })
      }

    render() {
        const usuario = Model.usuario.Action.getUsuarioLog();
        console.log("AQUI")
        console.log(this.state.data)
        // Model.usuarioPage.Action.getRoles();
        return <SView col={"xs-12"} padding={4} center
        onPress={() => {
            // SSocket.emit("openBilletera", {
            //     key_usuario: usuario.key
            // })
            SNavigation.navigate("/billetera")

        }}
        >
            <SView col={"xs-12"} style={{
                borderRadius: 8,
                height: 100,
                backgroundColor: STheme.color.success,
                // backgroundColor: "#002"
            }} padding={8}>
                <SText color={"#fff"} fontSize={16}>BILLETERA MOVIL</SText>
                <SView flex />
                <SView row col={"xs-12"} style={{}} >
                    <SIcon name={"chip"} width={40} height={26} />
                </SView>
                <SText color={"#fff"} fontSize={20} bold col={"xs-12"} style={{
                    alignItems: "flex-end"
                }}>Bs.   {SMath.formatMoney((this.state.data?.monto) ?? 0)}</SText>
            </SView>
        </SView>
    }
}
