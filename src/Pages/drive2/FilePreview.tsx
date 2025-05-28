import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SHr, SImage, SNotification, SText, STheme, SView } from 'servisofts-component';
import { FileItemType } from './Action';
import SSocket from 'servisofts-socket';
import SVideo from '../../Components/SVideo';
import PDFViewer from '../drive/Components/PDFViewer';
import Sounds from '../../Components/Sounds';



const PreviewSound = ({ file }: { file: FileItemType }) => {
    // @ts-ignore
    const url = SSocket.api.drive + "/" + file.path;
    return <audio src={url} controls style={{ width: "100%", height: 50 }} />
    return <SView col={"xs-12"} height onPress={() => {
        const audio = Sounds.play({
            src: url,
            
        })
        audio.stop()
    }}>
        <SText>{ "play"}</SText>
    </SView>
}
const PreviewPdf = ({ file }: { file: FileItemType }) => {
    // @ts-ignore
    const url = SSocket.api.drive + "/" + file.path;
    return <PDFViewer src={url} />
}

const PreviewVideo = ({ file }: { file: FileItemType }) => {
    // @ts-ignore
    const url = SSocket.api.drive + "/" + file.path;
    return <SVideo src={url} paused={true} controls />
}
const PreviewImage = ({ file }: { file: FileItemType }) => {
    // @ts-ignore
    const url = SSocket.api.drive + "/" + file.path;
    return <SImage src={url} />
}
const PreviewDefault = ({ file }: { file: FileItemType }) => {
    return <SText>{"Degault"}</SText>
}


const ExtencionPreview: any = [
    // Formatos de video comunes
    [/\.(mp4|mpg4|mov|mkv|avi|wmv|flv|webm|mpeg|3gp|m4v)$/i, PreviewVideo],

    // Formatos de imagen comunes
    [/\.(png|jpe?g|gif|bmp|webp|tiff?|svg|ico|heic)$/i, PreviewImage],
    // Formatos de documento PDF
    [/\.(pdf)$/i, PreviewPdf],
    // Formatos de audio comunes
    [/\.(mp3|wav|ogg|flac|aac|m4a|wma|opus)$/i, PreviewSound],
    // Otros: por defecto
    [/.*/i, PreviewDefault]
]



export default class FilePreview extends Component {
    state: { file: FileItemType | null, Component: any } = {
        file: null,
        Component: null
    }

    selectFile(file: FileItemType) {
        const elm = ExtencionPreview
        for (let index = 0; index < ExtencionPreview.length; index++) {
            const key = ExtencionPreview[index][0];

            // la key es una exprecion regular
            const regex = new RegExp(key);
            if (regex.test(file.name)) {
                const Component: any = ExtencionPreview[index][1]
                this.setState({ file: file, Component: Component });
                return;
            }
        }
    }

    render() {
        if (!this.state.file) return null;
        const CMP = this.state.Component
        return <SView col={"xs-12"} height>
            <SView col={"xs-12"} height={30} backgroundColor={STheme.color.background} style={{
                justifyContent: "center"
            }}>
                <SText color={STheme.color.lightGray} bold numberOfLines={1}>{this.state.file.path}</SText>
            </SView>
            <SView col={"xs-12"} flex backgroundColor={STheme.color.background}>
                <CMP file={this.state.file} />
            </SView>
        </SView>
    }
}
