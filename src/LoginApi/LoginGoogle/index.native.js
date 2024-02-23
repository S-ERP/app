import React, { Component } from 'react';
import { SView } from 'servisofts-component';
import { GoogleSignin, statusCodes, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { LoginType, UsuarioType } from "../types";
GoogleSignin.configure();

class LoginGoogle extends Component<LoginType> {
    resolve(user: UsuarioType){}
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    onPress() {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            this.signIn();
        })

    }
    signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            this.setState({ userInfo });
            GoogleSignin.signOut();
            // console.log(userInfo);
            if (userInfo.user) {
                this.resolve({
                    email: userInfo.user.email,
                    id: userInfo.user.id,
                    name: userInfo.user.givenName,
                    last_name: userInfo.user.familyName,
                });
            }
        } catch (error) {
            // if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            // } else if (error.code === statusCodes.IN_PROGRESS) {
            // } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            // } else {
            // }
            this.reject(error)
        }
    };
    render() {
        return this.props.children
    }
}

export default LoginGoogle;