import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SImage, SPage, SText, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
class QRCaja extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    getQR() {
        var content = `https://darmotos.servisofts.com/caja?pk=${this.props?.pk}`;
        return SSocket.sendPromise({
            "service": "sqr",
            "component": "qr",
            "type": "registro",
            "estado": "cargando",
            "data": {
                content,
                key: this.props.pk,
                "reponse_type": "image",
                "image_src": "https://darmotos.servisofts.com/logo512.png",
                "type_color": "solid",
                "colorBody": "#000000",
                "colorBackground": "#ffffff",
                "body": "DiamondConectVH",
                "framework": "Rounded",
                "header": "Circle"
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
        if (this.state?.data?.src != this.src) {
            this.src = this.state?.data?.src;
            if (this.props.onChange) {
                this.props.onChange(this.src)
            }
        }
        return (
            <SView width={180} height={180} center {...this.props} card>
                <SImage enablePreview src={SSocket.api.sqr + this.props.pk} />
            </SView>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(QRCaja);

