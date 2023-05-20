import React, { Component } from 'react';
import { SButtom, SHr, SIcon, SImage, SList, SLoad, SMath, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
type PropsType = {
    key_usuario: any,
    size: any
}
export default class ProfileImage extends Component<PropsType> {
    static defaultProps = {
        size: 40
    }
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        return <SView height={this.props.size} width={this.props.size} card style={{ overflow: "hidden" }}>
            <SImage src={Model.usuario._get_image_download_path(SSocket.api, this.props.key_usuario)} enablePreview />
        </SView>
    }
}