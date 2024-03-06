import { Text, View } from 'react-native'
import React, { Component } from 'react'
import { SIcon, SImage, STheme, SView } from 'servisofts-component'
import Model from '../../Model'
import SSocket from 'servisofts-socket';

export default class RContent extends Component {
    render() {
        let key_empresa = Model.empresa.Action.getKey();
        return (
            <SView col={"xs-12"} height
                center
                style={{
                    // borderBottomLeftRadius: 8,
                    // borderBottomEndRadius:8,
                    // borderRadius: 8,
                    borderWidth: 1,
                    // borderBottomRightRadius:10,
                    // backgroundColor: STheme.color.card,
                    // backgroundColor: STheme.color.danger,
                    overflow: "hidden",
                }}>
                {/* <SView flex col={"xs-12"} style={{
                    padding: 2,
                }}> */}

                {!key_empresa ? <SIcon name={"logoCompleto"} fill={STheme.color.primary} /> : <SImage src={Model.empresa._get_image_download_path(SSocket.api, key_empresa)} />}
                {/* </SView> */}
            </SView>
        )
    }
}