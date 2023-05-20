import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SImage, SPage, SText, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
class QRCompra extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    getQR() {
        var content = `https://darmotos.servisofts.com/compra/profile?pk=${this.props?.data?.key}`;
        return SSocket.sendPromise({
            "service": "sqr",
            "component": "qr",
            "type": "registro",
            "estado": "cargando",
            "data": {
                "image_src": "https://darmotos.servisofts.com/logo512.png",
                // "image_src": "https://rolespermisos.servisofts.com/http//page/18725a49-6a1e-41b0-ae4c-4ca9454b1436",
                "framework": "Rounded",
                // "colorImageBackground": "#ffffff",
                "header": "Circle",
                // "colorHeader": "#ffffff",
                "body": "Dot",
                "content": content,
                "colorBody2": "#AD44E7",
                "colorBody": "#FFFFFF",
                "type_color": "radial",
            }
        })
    }
    componentDidMount() {
        this.setState({ loading: true })
        this.getQR().then(e => {
            this.setState({ data: e.data, loading: false })
            console.log(e);
        }).catch(e => {
            this.setState({ loading: false, error: e.error })
            console.error(e);
        })
    }
    render() {
        return (
            <SView width={180} height={180} center {...this.props} >
                <SImage enablePreview src={"data:image/jpg;base64, " + this.state?.data?.b64} />
            </SView>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(QRCompra);

