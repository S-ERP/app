import React, { Component } from 'react';
import { View, Text, Linking } from 'react-native';
import { SImage, SNavigation, SPage, SText, STheme, SUtil, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import SVideo from '../publicacion/Components/SVideo';

export default class preview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...SNavigation.getAllParams()
        };
    }




    renderPreview() {
        const type = this.state.type ?? "";
        if (type.indexOf("image") > -1) {
            return <SImage src={SSocket.api.drive + this.state.path} />
        }
        if (type.indexOf("video") > -1) {
            return <SVideo paused={false} controls src={SSocket.api.drive + this.state.path} />
        }
        return <SView col={"xs-12"} center flex>
            <SView width={140} height={140} backgroundColor={STheme.color.warning} style={{
                borderRadius: 100,
                padding: 16
            }} center>
                <SText bold center fontSize={18} onPress={() => {
                    Linking.openURL(SSocket.api.drive + this.state.path)
                }}>{"INICIAR DESCARGA"}</SText>
            </SView>
        </SView>
    }
    render() {
        return <SPage disableScroll title={SUtil.limitString(this.state.name, 40)}>
            {/* <SText>{this.state.path}</SText> */}
            {/* <SText>{this.state.size}</SText> */}
            {/* <SText>{this.state.lastModified}</SText> */}
            {/* <SText>{this.state.type}</SText> */}
            <SView col={"xs-12"} height style={{
                backgroundColor: "#000"
            }}>
                {this.renderPreview()}
            </SView>
        </SPage>
    }
}
