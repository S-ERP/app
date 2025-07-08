import React from "react";

export default class DropZoneWeb extends React.Component<{ children: any, handleDropFiles?: (files: File[]) => void }> {

    render() {
        return this.props.children
    }
}