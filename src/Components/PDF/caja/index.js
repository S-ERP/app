import React, { Component } from 'react';
import { Linking } from 'react-native';
import { SLoad, SText, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import { connect } from 'react-redux';
import Model from '../../../Model';

import header from './header';
import body from './body';

class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    handlePress() {
        let url = SSocket.api.spdf
        this.setState({ loading: true })

        const QRDATA = {
            "type": "page",
            "style": {
                "width": 612,
                "height": 791,
                "margin": 50,
                "padding": 12
            },
            "header": header({ qr_src: SSocket.api.sqr + "/" + this.props.pk, caja: this.props.caja, cajero: this.cajero, sucursal: this.sucursal, pv: this.punto_venta }),
            "childrens": body({ caja_detalles: this.caja_detalles }),
            "footer": require("./footer.json"),
        }
        // return;
        SSocket.sendHttpAsync(url + "api", {
            "component": "pdf",
            "type": "registro",
            "data": QRDATA
        }).then(e => {
            this.setState({ loading: false })
            console.log(e)
            Linking.openURL(url + e.data)
        }).catch(e => {
            this.setState({ loading: false })
            console.error(e)
        })
    }

    formatJson() {

    }
    loadData() {
        // this.tipo_pago = Model.tipo_pago.Action.getAll();
        this.caja_detalles = Model.caja_detalle.Action.getAll({ key_caja: this.props.pk });
        this.cajero = Model.usuario.Action.getByKey(this.props.caja.key_usuario)
        let arrpv = Model.punto_venta.Action.getAll();
        if (!arrpv) return null;
        this.punto_venta = arrpv[this.props.caja.key_punto_venta]
        // if (!this.tipo_pago) return false;
        if (!this.caja_detalles || !this.cajero || !this.punto_venta) return false;
        this.sucursal = Model.sucursal.Action.getByKey(this.punto_venta.key_sucursal);
        if (!this.sucursal) return false;
        return true;
    }
    render() {
        if (!this.loadData()) {
            return
            console.log("Cargando")
        }

        return (
            <SView onPress={this.handlePress.bind(this)}>
                 <SLoad type='window' hidden={!this.state.loading}/>
                {this.props.children ?? <SView padding={8} card >
                    <SText>ENVIAR</SText>
                </SView>}
            </SView>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);