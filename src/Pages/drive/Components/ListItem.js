import React, { Component } from 'react';
import { SButtom, SDate, SIcon, SImage, SInput, SLoad, SNavigation, SPopup, SText, STheme, SThread, SUtil, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MenuItem from './MenuItem';
import ItemIcon from './ItemIcon';
import { DBUploadTask } from '../../../Components/SUpload';

const h = 44

export default class ListItem extends Component {
    constructor(props) {
        super(props);


        // this.task = DBUploadTask[props.obj.submite_key]
        this.task = this.findTask()
        this.state = {
            progress: this?.task?.progress ?? 0
        }
    }

    findTask() {
        let name = encodeURI(this.props?.obj?.name);
        // let pathfinal = !this.props.path ? name : this.props.path + "/" + name
        let pathfinal = this.props.path + "/" + name;
        // console.log("entro aca", pathfinal, DBUploadTask)

        const task = Object.values(DBUploadTask).find(a => {
            const pa = a.props.path;
            const pb = pathfinal
            // console.log(pa, pb)
            if (pa != pb) return false;
            // console.log(pa, pb)

            return true;
        })
        // console.log(task)

        return task;
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
        this.componentWillUnmount();
        this.task = null;
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


    buildName() {
        const { obj, i, path } = this.props;
        return SUtil.limitString(obj.name, (this.props?.width - 90) / 7);
        // return obj.name
    }
    buildFecha() {
        const { obj, i, path } = this.props;
        const date = new Date(obj.lastModified)
        return new SDate(date).toString("dd MON yyyy  HH")
        // return new SDate(date).timeSince(new SDate())
    }
    buildIcon() {
        return <ItemIcon obj={this.props.obj} path={this.props.path} time={this.props.time} />
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
    renderWhenTask() {
        return <>
            <SView width={h} height center padding={8}>

            </SView>
            <SView flex height style={{
                justifyContent: "center"
            }}>
                <SText col={"xs-12"} clean row fontSize={14}>{this.buildName()}</SText>
                {this.renderProgresBar()}
            </SView>
            <SView width={40} height center padding={16} onPress={e => {
                MenuItem.open({ obj: this.props.obj, path: this.props.path, onEvent: this.props.onEvent })
                e.preventDefault()
            }}>
                <SIcon name='drive-menu' fill={STheme.color.gray} />
            </SView>
        </>
    }
    humanReadableFileSize(size) {
        const i = Math.floor(Math.log(size) / Math.log(1024));
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const humanSize = parseFloat((size / Math.pow(1024, i)).toFixed(2));
        if (!humanSize) return;
        return `${humanSize} ${sizes[i]}`;
    }

    renderContent() {
        if (this.task && !this.task.isCompleted) {
            return this.renderWhenTask();
        }
        return <>
            <SView width={h} height center padding={8}>
                {this.buildIcon()}
            </SView>
            <SView flex height style={{
                justifyContent: "center"
            }}>
                <SText col={"xs-12"} clean row fontSize={14} color={(this?.props?.obj?.name ?? "").startsWith(".") ? STheme.color.gray : STheme.color.text}>{this.buildName()}</SText>
                {/* {!this.task ? null : <SLoad type={"bar"} />} */}
                <SText clean fontSize={8} color={STheme.color.gray}>{"Modificado:"} {this.buildFecha()} {this.props?.obj?.lastModified/1000}</SText>
                {/* <SText clean fontSize={10} color={STheme.color.gray}></SText> */}
                <SText clean fontSize={8} color={STheme.color.gray}>{this.humanReadableFileSize(this.props?.obj?.size) ?? "-"}</SText>
            </SView>
            <SView width={40} height center padding={h / 4} onPress={e => {
                MenuItem.open({ obj: this.props.obj, path: this.props.path, onEvent: this.props.onEvent })
                e.preventDefault()
            }}>
                <SIcon name='drive-menu' fill={STheme.color.gray} />
            </SView>
        </>
    }
    render() {
        if (!this.task) {
            this.task = this.findTask();
            if (this.task) {
                this.componentDidMount();
            }
        }
        return <SView
            col={"xs-12"}
            row
            style={{
                height: h,
                backgroundColor: (this.props.index % 2)==0 ? "#00000011" : "#ffffff11",
                borderBottomColor: STheme.color.card,
                borderBottomWidth: 1,
            }}
            onPress={this.props.onPress} >
            {this.renderContent()}
        </SView>
    }
}
