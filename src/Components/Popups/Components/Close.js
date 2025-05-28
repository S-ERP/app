import React, { Component } from 'react';
import { SForm, SGradient, SHr, SImage, SLoad, SMath, SNavigation, SPage, SPopup, SStorage, SText, STheme, SView, SIcon, SThread } from 'servisofts-component';
import Model from '../../../Model';
import SSocket from 'servisofts-socket';

type PropsType = {
    label?: String, body?: String,
    onPress?: any
}

export default class Close extends Component<PropsType> {

    constructor(props) {
        super(props);
        this.state = {
        };

    }




    render() {


        return <SView width={35} height={35} style={{
            borderRadius: 100,
            backgroundColor: STheme.color.background,
            position: "absolute",
            right: 5,
            top: 5,
            justifyContent: "center",
            alignItems: "center",
            borderWidth : 1,
            borderColor : STheme.color.gray,
            zIndex : 999

        }} center
        onPress={this.props.onPress}
        // onPress={() => {
        //     console.log("close")
        //     SPopup.close(this.props.onPress)
        // }}
        >
            <SText font='Montserrat-Regular' fontSize={14}>x</SText>
        </SView>
    }
}