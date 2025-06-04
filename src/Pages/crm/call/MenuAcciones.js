import React, { Component } from 'react';
import { SHr, SIcon, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import PopupRazon from '../Components/PopupRazon';


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


export default class MenuAcciones extends Component<{ key_cliente_proyecto: string }> {
    pk = SNavigation.getParam("key");
    state = {
        data: null,
    }


    render() {
        const space = 16;
        return <SView row center>
            <OptionItem icono={"addTarea"} label={"Confirmado"} color={STheme.color.success} />
            <SView width={space} />
            <OptionItem icono={"addTarea"} label={"Entrega Express"} color={STheme.color.success} />
            <SView width={space} />
            <OptionItem icono={"Check"}
                label={"Cancelado"}
                color={STheme.color.gray}
                onPress={() => {
                    PopupRazon.open(
                        ({
                            tipo: "cancelado",
                            onRegister: (e) => {
                                MDL.crm.clienteProyecto.editar({
                                    key: this.props.key_cliente_proyecto,
                                    state: "cancelado",
                                    key_tipo_movimiento_lead: e.selectedOption.key
                                }).then(e => {
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

}
