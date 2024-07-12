import React from "react";
import { SPage, SText, SView } from "servisofts-component";
import { DBUploadTask } from ".";
import SUploadItem from "./SUploadItem";

export default class SUploadContainer extends React.Component {


    componentDidMount(): void {

    }
    renderTask() {
        return Object.keys(DBUploadTask).map(k => {
            return <SUploadItem key={k} />
        })
    }
    render() {
        return <SView style={{
            position: "absolute",
            top: 10,
            right: 10,
            height: 200,
            width: 200,
            backgroundColor: "#f0f"
        }}>
            {this.renderTask()}
        </SView>;
    }
}