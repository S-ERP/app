import React, { Component } from 'react';
import { Linking } from 'react-native';
import { SLoad, SText, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import { connect } from 'react-redux';
import Model from '../../../Model';

import header from './header';
import body from './body';
// props = {data, cuentas}
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    // componentDidMount() {
    //     Model.caja.Action.reporte_cuentas({ fecha_inicio: this.params.fecha_inicio, fecha_fin: this.params.fecha_fin }).then(resp => {
    //         this.setState({ data: resp.data });
    //     })
    // }
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
            "header": header(this.props),
            "childrens": body(this.props),
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
            window.open(url + e.data, "NombreVentana", "height=612,width=900");
            // Linking.openURL(url + e.data)
        }).catch(e => {
            this.setState({ loading: false })
            console.error(e)
        })
    }

    formatJson() {

    }
    loadData() {
        return true;
    }
    render() {
        if (!this.loadData()) {
            return
            console.log("Cargando")
        }

        return (
            <SView onPress={this.handlePress.bind(this)}>
                <SLoad type='window' hidden={!this.state.loading} />
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