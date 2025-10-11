import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SButtom, SDate, SIcon, SImage, SInput, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import { DBUploadTask, UploadTask } from '../../../Components/SUpload';
import MDL from '../../../MDL';

export default class ListItem extends Component {
    task: UploadTask = null;
    constructor(props) {
        super(props);
        if (this?.props?.obj?.submite_key) {
            this.task = DBUploadTask[this?.props?.obj?.submite_key];
        }
        this.state = {
            progress: this.task?.progress ?? 0,
        };

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

    componentDidMount() {

        if (this.task) {
            this.task.addListener("progress", this.onProgress)
            this.task.addListener("pause", this.onPause)
            this.task.addListener("resume", this.onResume)
            this.task.addListener("complete", this.onComplete)
        }
    }
    componentWillUnmount() {
        if (this.task) {
            this.task.removeListener("progress", this.onProgress)
            this.task.removeListener("pause", this.onPause)
            this.task.removeListener("resume", this.onResume)
            this.task.removeListener("complete", this.onComplete)
        }
    }

    humanReadableFileSize(size) {
        const i = Math.floor(Math.log(size) / Math.log(1024));
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const humanSize = parseFloat((size / Math.pow(1024, i)).toFixed(2));
        if (!humanSize) return;
        return `${humanSize} ${sizes[i]}`;
    }


    renderPreview() {
        const { obj, i, path } = this.props;
        const type = obj.type ?? ""
        let pathfinal = !path ? obj.name : path + "/" + obj.name
        if (type.indexOf("image") > -1) {
            return <SImage card src={SSocket.api.drive + pathfinal} />
        }
        // if (type.indexOf("video") > -1) {
        //     return 
        // }
        // return <SIcon name='Icon2' fill={STheme.color.text} />
        return null;
    }
    renderProgresBar = () => {
        if (!this.task) return null
        return <SView col={"xs-12"} card height={8} style={{
            borderRadius: 8,
            overflow: 'hidden',
        }}>
            <SView width={this.state.progress + "%"} height style={{
                backgroundColor: this.task.isPaused ? STheme.color.warning : STheme.color.success,
            }} />
        </SView>
    }

    render() {
        const { obj, i, path } = this.props;
        const date = new Date(obj.lastModified)


        return <SView col={"xs-12"}
            backgroundColor={i % 2 == 0 ? STheme.color.primary + "44" : STheme.color.card}
            padding={6}
            center
        >
            <SView col={"xs-12"} row center>
                <SView width={30} height={30}>
                    {this.renderPreview()}
                </SView>
                <SText font='OpenSans' fontSize={12} color={STheme.color.link} underLine
                    onPress={() => {
                        let pathfinal = !path ? obj.name : path + "/" + obj.name
                        if (obj.type == "directory") {
                            SNavigation.navigate("/drive", { path: pathfinal, key_empresa: MDL.empresa?.select?.key })
                            if (this.props.reload) this.props.reload(pathfinal)
                            // this.getData(path);
                        } else {
                            SNavigation.navigate("/drive/preview", { path: pathfinal, ...obj, key_empresa: MDL.empresa?.select?.key })
                            // Linking.openURL(SSocket.api.drive + path)
                        }
                    }}
                >{obj.name}{obj.type == "directory" ? "/" : ""}</SText>
                <SView flex />
                {/* <SText width={70} fontSize={8}> {obj.type}</SText> */}
                {/* <SText width={45} fontSize={8}>{new SDate(date).timeSince(new SDate())}</SText> */}
                <SText width={45} style={{
                    textAlign: "right",
                }} fontSize={8}>{this.humanReadableFileSize(obj.size) ?? "-"}</SText>
            </SView>
            <SText onPress={() => {
                let pathfinal = !path ? obj.name : path + "/" + obj.name
                SSocket.sendPromise({
                    service: "drive",
                    component: "file",
                    type: "rm",
                    path: pathfinal
                }).then(e => {
                    // '
                    console.log(e)
                    // this.setState({ data: e.data, path: path })
                }).catch(e => {
                    console.error(e);
                })

            }}>RM</SText>
            <SText onPress={() => {
                let pathfinal = !path ? obj.name : path + "/" + obj.name
                SPopup.open({
                    key: "mv",
                    content: <SView col={"xs-12"} height={200} backgroundColor='#000' withoutFeedback center padding={8}>
                        <SInput ref={ref => this.inp = ref} type='text' defaultValue={pathfinal} />
                        <SButtom onPress={() => {
                            SSocket.sendPromise({
                                service: "drive",
                                component: "file",
                                type: "mv",
                                path: pathfinal,
                                path_to: this.inp.getValue()
                            }).then(e => {
                                SPopup.close("mv")
                                // '
                                console.log(e)
                                // this.setState({ data: e.data, path: path })
                            }).catch(e => {
                                SPopup.close("mv")
                                console.error(e);
                            })
                        }}>SUBIR</SButtom>
                    </SView>
                })
                // let pathfinal = !path ? obj.name : path + "/" + obj.name


            }}>MV</SText>
            {this.renderProgresBar()}

        </SView >
    }
}
