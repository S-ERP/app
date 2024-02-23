import React, { Component } from 'react';
import { SButtom, SPage, SText, SView } from 'servisofts-component';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'
import { LoginType, UsuarioType } from "../types";
import { config } from '../config';

class LoginFacebook extends Component<LoginType> {
    resolve(user: UsuarioType) { }
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    onPress() {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            this.renderProps.onClick();
        })
    }
    response = (response) => {
        if (!response.id) {
            this.reject(response);
            return null;
        }
        this.resolve({
            id: response.id,
            name: response.first_name,
            email: response.email,
            last_name: response.last_name

        });
    }
    render() {
        return (
            <FacebookLogin
                appId={config.facebook.appId}
                fields="id,name,first_name,last_name,email"
                callback={this.response}
                render={renderProps => {
                    this.renderProps = renderProps;
                    return this.props.children;
                }}
            />
        );
    }
}

export default LoginFacebook;