import React, { Component } from 'react';
import { SHr, SPage, SText, STheme, SView } from 'servisofts-component';
import { LoginApiTypes } from "./types"

import LoginGoogle from './LoginGoogle';
import LoginApple from './LoginApple';
import LoginFacebook from './LoginFacebook';

import { config } from './config';
const apis = {
    "google": LoginGoogle,
    "apple": LoginApple,
    "facebook": LoginFacebook,
}

export default class LoginApi extends Component<LoginApiTypes> {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        };
    }


    onPressHandler = () => {
        this._loginItem.onPress().then(resp => {
            this.props.onLogin(resp, this.props.type, config[this.props.type].NombreDato);
        }).catch(e => {
            if (!this.props.onError) {
                console.error(e);
                return;
            }
            this.props.onError(e);
        })
    }

    defaultContent() {
        return <SView >
            <SHr />
            <SText>Login width {this.props.type}.</SText>
            <SHr />
        </SView>
    }
    render() {
        var child = this.props.children;
        if (!child) {
            child = this.defaultContent()
        }
        var LoginTypeItem = apis[this.props.type];
        return <SView col={"xs-12"} height flex onPress={this.onPressHandler}>
            <LoginTypeItem ref={ref => this._loginItem = ref}>
                {child}
            </LoginTypeItem>
        </SView>
    }
}
