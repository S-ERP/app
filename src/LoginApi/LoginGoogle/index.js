import React, { Component } from 'react';
import GoogleLogin from 'react-google-login';
import { LoginType, UsuarioType } from "../types";
import { config } from '../config';
class LoginGoogle extends Component<LoginType>{
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
        if (response.googleId) {
            this.resolve({
                id: response?.profileObj?.googleId,
                email: response.profileObj.email,
                name: response.profileObj.givenName,
                last_name: response.profileObj.familyName
            })
        }
    }
    render() {
        return (
            <GoogleLogin
                clientId={config.google.clientId}
                onSuccess={this.response}
                onFailure={this.response}
                cookiePolicy={'single_host_origin'}
                render={(renderProps) => {
                    this.renderProps = renderProps;
                    return this.props.children;
                }}
            >
            </GoogleLogin>
        );
    }
}

export default LoginGoogle;