// @ts-nocheck
import React, { Component } from 'react';
import { View, Text, Linking, ScrollView, FlatList } from 'react-native';
import { SDate, SHr, SIcon, SImage, SList, SNavigation, SNotification, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import SVideo from '../../../Components/SVideo';
import PDFViewer from './PDFViewer';
import { Actions } from '..';
import VideoCut from './VideoCut';
import MDL from '../../../MDL';

export default class TypeFile extends Component<{ file: any, path: string }> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    getType() {
        return Actions.getFileType(this.props?.file, this.props?.path);
    }

    renderPreview() {
        const type = this.getType();
        let finalPath = Actions.root_path + "" + this.props.path;
        if (this.props.path.startsWith("/")) finalPath = finalPath.slice(1, finalPath.length)
        let DiverPath = SSocket.api.drive + finalPath;
        DiverPath = encodeURI(DiverPath).replace("#", "%23")

        if (type.indexOf("image") > -1) {
            return <SImage src={DiverPath} />
        }
        if (type.indexOf("video") > -1) {
            // return <SVideo paused={false} controls src={DiverPath} />
            return <VideoCut url={DiverPath} onAccept={({ startSec, endSec, crf, newName }) => {
                SNotification.send({
                    key: "video_cutting",
                    title: "Cortando video",
                    body: "El video se esta cortando, esto puede tardar un momento...",
                    color: STheme.color.warning,
                    type: "loading"
                })
                // const decoded = decodeURIComponent(url.split("?")[0]);
                // const currentName = decoded.split("/").filter(Boolean).pop() ?? "output.mp4";
                // let inputRef = null;
                const pathto = finalPath.split("/").slice(0, -1).join("/") + "/" + newName;
                Actions.video_trim({ path: finalPath, path_to: pathto, startSec, endSec, crf }).then(() => {
                    SNotification.send({
                        key: "video_cutting",
                        title: "Video cortado",
                        body: "El video se ha cortado correctamente.",
                        color: STheme.color.success,
                        time: 5000,
                    })
                }).catch(e => {
                    SNotification.send({
                        key: "video_cutting",
                        title: "Error al cortar video",
                        body: e?.error,
                        color: STheme.color.danger,
                        time: 5000,
                    })
                })
            }} />
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
        return <SPage title={this.props.path} disableScroll backAlternative={e => {
            const path = this.props.path ?? '/';
            if (path === '/') {
                SNavigation.goBack();
                return;
            }
            const trimmed = path.endsWith('/') ? path.slice(0, -1) : path;
            const lastSlash = trimmed.lastIndexOf('/');
            const parentPath = lastSlash <= 0 ? '/' : trimmed.slice(0, lastSlash);
            SNavigation.lastRoute.navigation.replace('/drive', { path: parentPath, key_empresa: MDL.empresa?.select?.key });
        }}>
            <SView col={"xs-12"} height >
                {this.renderPreview()}
            </SView>
        </SPage>
    }
}
