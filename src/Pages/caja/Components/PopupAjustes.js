import React, { Component } from 'react';
import { SButtom, SHr, SIcon, SInput, SList, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import PopupSubirBaucher from './PopupSubirBaucher';

type PropsTypes = {

}

const POPUP_KEY = "PopupAJustes"
export default class PopupAjustes extends Component<PropsTypes> {
    static open(props: PropsTypes) {
        SPopup.open({
            key: POPUP_KEY,
            content: <PopupAjustes {...props} />
        })
    }
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    close() {
        SPopup.close(POPUP_KEY)
    }

    item(data) {
        return <SView col={"xs-12"} onPress={data.onPress}>
            <SHr h={8} />
            <SView col={"xs-12"} row center>
                <SView width={25} height={25}>
                    <SIcon name={data.icon} />
                </SView>
                <SView width={8} />
                <SText bold fontSize={18}>{data.label}</SText>
                <SView flex />
            </SView>
            <SHr h={8} />
            <SHr h={1} color={STheme.color.card} />
        </SView>
    }
    render() {
        return (
            <SView width={200} backgroundColor={STheme.color.background} style={{
                borderRadius: 8,
            }} center withoutFeedback padding={16}>
                <SHr height={16} />
                <SList data={[{
                    icon: "Cheque",
                    label: "Subir baucher",
                    onPress: () => {
                        PopupSubirBaucher.open({
                            ...this.props, onSucces: () => {
                                this.close();
                            }
                        })
                    }
                }, {
                    icon: "Delete",
                    label: "Eliminar",
                    onPress: () => {
                        SPopup.confirm({
                            title: "Seguro de eliminar el movimiento?",
                            onPress: () => {
                                Model.caja_detalle.Action.editar({
                                    data: {
                                        ...this.props.data,
                                        estado: 0,
                                    },
                                    key_usuario: Model.usuario.Action.getKey()
                                }).then(e => {
                                    this.close();
                                }).catch(e => {
                                    SPopup.alert("Ocurrio un error inesperado.")
                                })
                            }
                        })
                    }
                }
                ]} render={this.item} />
                <SHr height={16} />
            </SView>
        );
    }
}
