import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SIcon, SImage, SPage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
export type DisponiblesPropsType = {
    cantidad: any
}
class index extends Component<DisponiblesPropsType> {
    constructor(props) {
        super(props);
        this.state = {

        };
    }



    render() {
        var cantidad = this.props.cantidad ?? 0;
        return <SView
            {...this.props}
            center
            style={{
                width: 110,
                height: 26,
                borderRadius: 4, overflow: 'hidden', backgroundColor: 'white',
                borderColor: "#AAAAAA22",
                borderWidth: 2,
                borderTopWidth: 0,
                borderBottomWidth: 3,
                // backgroundColor: "#FCBB3E",
                backgroundColor: '#979797',
                ...this.props?.style
            }}>
            {/* <SView height={13} /> */}
            <SText fontSize={9} color={STheme.color.secondary} >{`Cerrado`}</SText>
            {/* <SIcon name={"Favorite"} width={this.state.size * this.state.scale} height={this.state.size * this.state.scale} fill={!this.state.isFavorito ? "#ADB5BD" : '#FA4A0C'} /> */}
        </SView>
    }
}
export default (index);