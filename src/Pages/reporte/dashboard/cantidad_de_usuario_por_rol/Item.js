import React, { Component } from 'react';
import { SHr, SImage, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../../Model';
import { ItemStyle } from './styles';
import SSocket from "servisofts-socket"
export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render_content() {
        var cant = Object.values(this.props?.data?.usuarios ?? {}).length
        return <SView col={"xs-12"} padding={4} flex

            onPress={() => {
                SPopup.confirm({
                    title: "Esta seguro que quiere salir del DashBoard?",
                    message: "Se le enviara a la lista de usuarios en este rol.",
                    onPress: () => { SNavigation.navigate("/rol/profile/usuarios", { pk: this.props?.data?.key }) }
                })

            }}>
            <SView row col={"xs-12"} center>
                <SView width={25} height={25} card style={{ overflow: "hidden" }}>
                    <SImage src={Model.rol._get_image_download_path(SSocket.api, this.props?.data?.key)} />
                </SView>
                <SView width={4} />
                <SText bold flex fontSize={12}>{this.props?.data?.descripcion}</SText>
            </SView>
            <SHr h={6} />
            <SView col={"xs-12"} center>
                <SView style={{
                    width: 80,
                    height: 30,
                    borderRadius: 8,
                    backgroundColor: STheme.color.card
                }} center>
                    <SText bold>{cant}</SText>
                </SView>
            </SView>
        </SView >
    }
    render() {
        return <SView {...ItemStyle}>
            {this.render_content()}
        </SView>
    }
}