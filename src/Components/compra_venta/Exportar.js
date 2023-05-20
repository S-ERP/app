import React, { Component } from 'react';
import { SDate, SHr, SImage, SList, SLoad, SMath, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import { Linking } from 'react-native';
import Model from '../../Model';
import PDF from '../PDF';
export default class Exportar extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    data = {}



    renderButtoms() {
        if (this.state.loading) return <SLoad />
        return <SView col={"xs-12"} row center>
            <SView card style={{ padding: 16 }} onPress={() => {
                this.setState({ loading: true })
                Model.compra_venta.Action.pdf({ key_compra_venta: this.data.key }).then((resp) => {
                    this.setState({ loading: false })
                    Linking.openURL(SSocket.api.compra_venta + "pdf/" + resp.data);
                }).catch(e => {
                    this.setState({ loading: false })
                    console.error(e)
                });
            }}>
                <SText bold color={STheme.color.success}>PDF Rollo</SText>
            </SView>
            <SView width={8} />
            <PDF.venta data={this.data} />
            {/* 
            <SView card style={{ padding: 16 }} onPress={() => {
            }}>
                <SText bold color={STheme.color.warning}>PNG</SText>
            </SView> */}
        </SView>
    }
    render() {
        this.data = this.props.data;
        return <SView col={"xs-12"} center>
            <SHr />
            <SText bold>EXPORTAR</SText>
            <SHr />
            {this.renderButtoms()}

        </SView>
    }
}
