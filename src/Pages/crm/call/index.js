import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SMD from '../../../SMD';
import OrdenesConMismoNumero from '../Components/OrdenesConMismoNumero';
import HorarioDeCliente from '../Components/HorarioDeCliente';
import PopupRazon from '../Components/PopupRazon';
import Model from '../../../Model';

const CardContent = ({ children }) => {
    return <SView col={"xs-4"} padding={8} center>
        <SView col={"xs-12"} card padding={8}>
            {children}
        </SView>
    </SView>
}

const OptionItem = ({ key, label, color, icono, onPress }) => {
    return <>
        <SView backgroundColor='transparent' center style={{ alignItems: "center", }}>
            <SView center style={{
                paddingLeft: 16,
                paddingRight: 16,
                padding: 8,
                opacity: 1,
                borderWidth: 1,
                borderColor: STheme.color.card,
                backgroundColor: color,
                borderRadius: 8
            }} onPress={onPress} row>
                <SIcon name={icono} width={12} height={12} fill={STheme.color.text} />
                <SView width={8} />
                <SText fontSize={12}>{label}</SText>
            </SView>
        </SView>
    </>
};


export default class index extends Component {
    pk = SNavigation.getParam("key");
    state = {
        data: null,
    }
    componentDidMount() {
        MDL.crm.clienteProyecto.getFull(this.pk).then((e) => {
            this.setState({ data: e })
            if (e.state == "en_proceso") {
                // verificar si soy yo el que esta llamando
            } else {
                MDL.crm.clienteProyecto.editar({
                    key: this.pk,
                    state: "en_proceso",
                    key_usuario_atiende: Model.usuario.Action.getKey()
                });
            }

        })

    }

    renderMenuActions() {
        const space = 16;
        return <SView row center>
            <OptionItem icono={"addTarea"} label={"Confirmado"} color={STheme.color.success} />
            <SView width={space} />
            <OptionItem icono={"addTarea"} label={"Entrega Express"} color={STheme.color.success} />
            <SView width={space} />
            <OptionItem icono={"Check"} label={"Cancelado"} color={STheme.color.gray} onPress={() => {
                PopupRazon.open(
                    ({
                        tipo: "cancelado",
                        onRegister: (e) => {
                            MDL.crm.clienteProyecto.editar({ key: this.pk, state: "cancelado", key_tipo_movimiento_lead: e.selectedOption.key }).then(e => {
                                SNavigation.goBack();
                            })
                        }
                    }))
            }} />
            <SView width={space} />
            <OptionItem icono={"World"} label={"Double"} color={STheme.color.gray} />
            <SView width={space} />
            <OptionItem icono={"Egreso"} label={"Spam"} color={STheme.color.gray} />
            <SView width={space} />
            <OptionItem icono={"tpGa"} label={"Recall"} color={STheme.color.warning} />
            <SView width={space} />
            <OptionItem icono={"addTarea"} label={"Failure call"} color={STheme.color.gray} />
        </SView>
    }
    render() {
        const { proyecto, state, fecha_on } = this.state.data || {};
        return <SPage title={"Call"}>
            <SHr h={25} />
            {this.renderMenuActions()}
            <SHr h={25} />
            <SView row col={"xs-12"} style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <CardContent>
                    <HorarioDeCliente key_cliente_proyecto={this.pk} clienteProyecto={this.state?.data} ></HorarioDeCliente>
                </CardContent>
                <CardContent>
                    <SMD padding={0} fontSize={11} space={0}>{proyecto?.guion}</SMD>
                </CardContent>
                <CardContent>
                    <OrdenesConMismoNumero key_cliente_proyecto={this.pk} />
                </CardContent>
            </SView>
        </SPage >
    }
}
