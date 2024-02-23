import React, { Component } from 'react';
import GoogleLogin from 'react-google-login';
import { SStorage, SView } from 'servisofts-component';
import { LoginType, UsuarioType } from "../types";
import AppleLogin from 'react-apple-login'
import { config } from '../config';

class LoginApple extends Component<LoginType>{
    resolve(user: UsuarioType) { }
    constructor(props) {
        super(props);
        this.state = {
            userInfo: {},
            sessions: {}
        };
        SStorage.getItem("apple_sessions", (resp) => {
            if (!resp) this.state.sessions = {};
            this.state.sessions = JSON.parse(resp);
            if (!this.state.sessions) this.state.sessions = {};

        });
    }
    save() {
        SStorage.setItem("apple_sessions", JSON.stringify(this.state.sessions));
    }

    onPress() {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            this.renderProps.onClick();
        })
    }
    response = (response) => {

        const { user, authorization } = response;
        if (authorization) {

            var token = authorization.id_token
            if (!token) return null;
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            var obj = JSON.parse(jsonPayload);
            const { email, sub } = obj;

            if (user) {
                this.state.sessions[sub] = user;
                this.save();
            }
            var usuario = this.state.sessions[sub];
            this.resolve({
                id: sub,
                email: email,
                name: usuario?.name?.firstName ?? "",
                last_name: usuario?.name?.lastName ?? ""
            })

        }

        // if (response.googleId) {
        //     this.resolve({
        //         id: response?.profileObj?.googleId,
        //         email: response.profileObj.email,
        //         name: response.profileObj.givenName,
        //         last_name: response.profileObj.familyName
        //     })
        // }
    }
    render() {
        return <AppleLogin
            usePopup={true}
            scope={"name email"}
            clientId={config.apple.clientId}
            redirectURI={config.apple.redirectURI}
            callback={this.response}
            responseMode={"form_post"}


            render={(p) => {
                this.renderProps = p;
                return this.props.children
            }}
        />

    }
}

export default LoginApple;