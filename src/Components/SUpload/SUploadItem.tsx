import React from "react";
import { SIcon, SPage, SText, STheme, SView } from "servisofts-component";
import { DBUploadTask, UploadTask } from ".";
import { Linking } from "react-native";
import SSocket from "servisofts-socket";

export default class SUploadItem extends React.Component {
    task: UploadTask
    state;
    constructor(props) {
        super(props);
        this.task = DBUploadTask[props.pk];
        this.state = {
            progress: this.task.progress ?? 0,
        }

    }
    onProgress = (evt) => {
        this.setState({ progress: evt.progress })
    }
    onPause = (evt) => {
        this.setState({ ...this.state })
    }
    onResume = (evt) => {
        this.setState({ ...this.state })
    }
    onComplete = (evt) => {
        this.setState({ ...this.state })
    }

    componentDidMount(): void {
        this.task.addListener("progress", this.onProgress)
        this.task.addListener("pause", this.onPause)
        this.task.addListener("resume", this.onResume)
        this.task.addListener("complete", this.onComplete)
    }
    componentWillUnmount(): void {
        this.task.removeListener("progress", this.onProgress)
        this.task.removeListener("pause", this.onPause)
        this.task.removeListener("resume", this.onResume)
        this.task.removeListener("complete", this.onComplete)
    }

    renderButtomPlay() {
        // let lbl = "START";
        let icon: any = "MessageSend"
        let onPress: any = () => this.task.start()
        let color = STheme.color.text;
        if (this.task.isCompleted) {
            icon = "Check"
            onPress = null;
            color = STheme.color.success
        } else if (this.task.isUploading) {
            if (this.task.isPaused) {
                onPress = () => this.task.resume()
                icon = "MessageSend"
                color = STheme.color.warning;
                // lbl = "MessageSend"
            } else {
                onPress = () => this.task.pause()
                icon = "Close"
                color = STheme.color.danger;
                // lbl = "PAUSE"
            }
        }

        return <SView width={40} height={40} padding={8} onPress={onPress}>
            <SIcon name={icon} fill={color} />
        </SView>
    }

    renderProgresBar = () => {
        return <SView col={"xs-12"} card height={8} style={{
            borderRadius: 8,
            overflow: 'hidden',
        }}>
            <SView width={this.state.progress + "%"} height style={{
                backgroundColor: this.task.isPaused ? STheme.color.warning : STheme.color.success,
            }} />
        </SView>
    }
    humanReadableFileSize(size) {
        const i = Math.floor(Math.log(size) / Math.log(1024));
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const humanSize = parseFloat((size / Math.pow(1024, i)).toFixed(2));
        return `${humanSize} ${sizes[i]}`;
    }
    render() {

        return <SView col={"xs-12"} padding={4} card >
            <SView col={"xs-12"} row center>
                {this.renderButtomPlay()}
                <SView flex>
                    <SText fontSize={12} color={STheme.color.link} onPress={() => {
                        Linking.openURL(SSocket.api.root + (this.task.props.path.replace(/^\//, "")))
                    }}>{this.task.props.path}</SText>
                    <SView row col={"xs-12"}>
                        {this.task.isCompleted ?
                            <SText fontSize={10}>{this.humanReadableFileSize(this.task.file.size)}</SText>
                            : <SText fontSize={10}>{this.humanReadableFileSize((this.task.file.size * (this.state.progress / 100)))} / {this.humanReadableFileSize(this.task.file.size)}</SText>}

                        <SView flex />
                        <SText fontSize={10}>{this.state.progress.toFixed(0)}%</SText>
                    </SView>
                </SView>
            </SView>
            {this.task.isCompleted ? null : this.renderProgresBar()}
            {/* <SText>{this.state.progress} / 100</SText> */}
        </SView>
    }
}