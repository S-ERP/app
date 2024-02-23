import React, { Component } from 'react';
import { Platform } from 'react-native';
import { SPopup, SStorage, SView } from 'servisofts-component';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { LoginType } from "../types";

class LoginApple extends Component<LoginType> {



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

    signIn = async () => {
        if (Platform.OS == "android") {
            SPopup.alert("Not Support In Android")
            return null;
        }
        const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            // Note: it appears putting FULL_NAME first is important, see issue #293
            requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        });

        // get current authentication state for user
        // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
        const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

        // use credentialState response to ensure the user is authenticated
        if (credentialState === appleAuth.State.AUTHORIZED) {
            // user is authenticated
            const { email, user } = appleAuthRequestResponse;
            if (email) {
                this.state.sessions[user] = appleAuthRequestResponse
                this.save();

            }
            if (this.props.onLogin) {
                var usuario = this.state.sessions[user];
                this.props.onLogin({
                    id: user,
                    email: usuario?.email,
                    name: usuario?.fullName?.givenName,
                    last_name: usuario?.fullName?.familyName
                });
            }
        }
    };
    render() {

        return (
            <SView onPress={this.signIn.bind(this)}>
                {this.props.children}
            </SView>
        );
    }
}

export default LoginApple;