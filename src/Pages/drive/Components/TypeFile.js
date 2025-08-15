// @ts-nocheck
import React, { Component } from 'react';
import { View, Text, Linking, ScrollView, FlatList } from 'react-native';
import { SDate, SHr, SIcon, SImage, SList, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import SVideo from '../../../Components/SVideo';
import PDFViewer from './PDFViewer';
import { Actions } from '..';

export default class TypeFile extends Component<{ file: any, path: string }> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    renderPreview() {
        const type = this.props?.file?.type ?? "";
        let finalPath = Actions.root_path + "" + this.props.path;
        if (this.props.path.startsWith("/")) finalPath = finalPath.slice(1, finalPath.length)
        let DiverPath = SSocket.api.drive + finalPath;
        DiverPath = encodeURI(DiverPath).replace("#", "%23")
        if (type.indexOf("image") > -1) {
            return <SImage src={DiverPath} />
        }
        if (type.indexOf("video") > -1) {
            return <SVideo paused={false} controls src={DiverPath} />
        }
        if (type.indexOf("pdf") > -1) {
            return <PDFViewer src={DiverPath} />
        }
        if (type.indexOf("officedocument") > -1) {
            return <>
                {this.state.loaded ? null : <div>Cargando presentación...</div>}
                <iframe
                    src={"https://view.officeapps.live.com/op/embed.aspx?src=" + DiverPath}
                    width="100%"
                    height="100%"
                    frameborder="0"
                    onLoad={() => this.setState({ loaded: true })}
                >
                </iframe >
            </>


        }
        return <SView col={"xs-12"} center flex>

            <SText>{type}</SText>
            <SView width={140} height={140} backgroundColor={STheme.color.warning} style={{
                borderRadius: 100,
                padding: 16
            }} center>
                <SText bold center fontSize={18} onPress={() => {
                    // console.log(DiverPath);
                    // console.log(encodeURI(DiverPath));
                    Linking.openURL(DiverPath)
                }}>{"INICIAR DESCARGA"}</SText>
            </SView>
        </SView>
    }

    render() {
        return <SPage title={this.props.path} disableScroll>
            <SView col={"xs-12"} height >
                {this.renderPreview()}
            </SView>
        </SPage>
    }
}
