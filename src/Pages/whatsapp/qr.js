import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SImage } from 'servisofts-component';
import SSocket from 'servisofts-socket';

export default class qr extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        SSocket.sendPromise({
            "service": "sqr",
            "component": "qr",
            "type": "registro",
            "estado": "cargando",
            "data": {
                "content": this.props.content,
                "colorBackground": "#FFFFFF",
                "errorCorrectionLevel": "L",
                // "type_color": "linear",
                // "colorBody": "#0302F9",
                // "colorBody2": "#F90203",
                "body": "Dot",
                "framework": "Rounded",
                "header": "Rounded"
            }
        }).then(e => {
            this.setState({ data: e.data.b64 })
        }).catch(e => {

        })
    }
    render() {
        return (
            <SImage enablePreview src={"data:image/jpg;base64, " + this.state?.data} />
        );
    }
}
