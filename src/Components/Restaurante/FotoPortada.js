import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SImage, SPage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
export type FotoPortadaPropsType = {
    data: any
}
class index extends Component<FotoPortadaPropsType> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    render() {
        var { key, nombre } = this.props.data;
        return <SView col={"xs-12"} height backgroundColor={STheme.color.card}
            {...this.props}
            style={{
                overflow: "hidden",
                ...this.props.style
            }}
        >
            <SImage src={SSocket.api.empresa + "empresa_portada/" + key + "?date=" + new Date().getTime()} style={{
                // resizeMode: "center"
                // resizeMode: "repeat"
                resizeMode: "cover"
                // resizeMode: "contain"
                // resizeMode: "strech"
            }} />
        </SView>
    }
}
export default (index);