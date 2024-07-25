// @ts-nocheck
import React, { Component } from 'react';
import { View, Text, Linking, ScrollView, FlatList } from 'react-native';
import { SDate, SHr, SIcon, SImage, SList, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import SVideo from '../../../Components/SVideo';

export default class TypeFile extends Component<{ file: any, path: string }> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    renderPreview() {
        const type = this.props?.file?.type ?? "";
        let finalPath = this.props.path;
        if (this.props.path.startsWith("/")) finalPath = finalPath.slice(1, finalPath.length)
        let DiverPath = SSocket.api.drive + finalPath;
        console.log(DiverPath)
        if (type.indexOf("image") > -1) {
            return <SImage src={DiverPath} />
        }
        if (type.indexOf("video") > -1) {
            return <SVideo paused={false} controls src={DiverPath} />
        }
        return <SView col={"xs-12"} center flex>
            <SView width={140} height={140} backgroundColor={STheme.color.warning} style={{
                borderRadius: 100,
                padding: 16
            }} center>
                <SText bold center fontSize={18} onPress={() => {

                    Linking.openURL(DiverPath)
                }}>{"INICIAR DESCARGA"}</SText>
            </SView>
        </SView>
    }

    render() {
        return <SPage title={this.props.path} disableScroll>
            <SView col={"xs-12"} height backgroundColor={STheme.color.background}>
                {this.renderPreview()}
            </SView>
        </SPage>
    }
}
