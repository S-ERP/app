import { Text, View } from 'react-native'
import React, { Component } from 'react'
import { SIcon, STheme, SView } from 'servisofts-component'

export default class RContent extends Component {
    render() {
        return (
            <SView col={"xs-12"} height
                center
                style={{
                    // borderBottomLeftRadius: 8,
                    // borderBottomEndRadius:8,
                    // borderRadius: 8,
                    borderWidth: 1,
                    // borderBottomRightRadius:10,
                    backgroundColor: STheme.color.secondary,
                    overflow: "hidden",
                }}>
                <SView style={{
                    padding: 2,
                }}>
                    <SIcon name={"logoCompleto"} fill={STheme.color.primary} />
                </SView>
            </SView>
        )
    }
}