import React, { Component } from 'react';
import { Platform } from 'react-native';
import { SView } from 'servisofts-component';
import {
    AccessToken,
    LoginManager,
    GraphRequest,
    GraphRequestManager,
} from 'react-native-fbsdk';

import { LoginType, UsuarioType } from "../types";

// Settings.initializeSDK();

class LoginFacebook extends Component<LoginType> {

    resolve(user: UsuarioType) { }

    constructor(props) {
        super(props);
        this.state = {
            userInfo: {}
        };
    }

    onPress() {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            this.signIn();
        })

    }
    getInfoFromToken = token => {
        const PROFILE_REQUEST_PARAMS = {
            fields: {
                string: 'id, name,  first_name, last_name, email',
            },
        };
        const profileRequest = new GraphRequest(
            '/me',
            { token, parameters: PROFILE_REQUEST_PARAMS },
            (error, result) => {
                if (error) {
                    this.reject(error);
                } else {
                    this.resolve({
                        id: result.id,
                        name: result.first_name,
                        email: result.email,
                        last_name: result.last_name

                    });
                }
            },
        );
        new GraphRequestManager().addRequest(profileRequest).start();
    };
    signIn = async () => {
        try {

            if (Platform.OS === "android") {
                LoginManager.setLoginBehavior("web_only")
            }
            // LoginManager.logInWithReadPermissions(['public_profile']).then(
            LoginManager.logInWithPermissions(['public_profile']).then(
                login => {
                    console.log("ASdasd")
                    if (login.isCancelled) {
                        this.reject(login);
                    } else {
                        AccessToken.getCurrentAccessToken().then(data => {
                            const accessToken = data.accessToken.toString();
                            this.getInfoFromToken(accessToken);
                        });
                    }
                }
            ).catch(error => {
                console.error(error)
                this.reject(error);
            })
        } catch (e) {
            console.error(e);
        }
    };
    render() {

        return this.props.children;
    }
}

export default LoginFacebook;