import React, { Component } from 'react';
import { Linking } from 'react-native'
import { SNavigation, SPage, SText, STheme } from 'servisofts-component';
import SMD from '../SMD';

export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: ""
        };
    }

    componentDidMount() {
        fetch("https://raw.githubusercontent.com/S-ERP/.github/main/profile/README.md").then((response) => {
            return response.text()
        }).then((text) => {
            this.setState({ text })
        })

        // Linking.openURL("https://github.com/S-ERP/.github/wiki");
        // SNavigation.goBack();
    }
    render() {
        return (
            <SPage title={'index'}>
                <SMD textColor={STheme.color.text} colorCard={STheme.color.card} >
                    {this.state.text}
                </SMD>
            </SPage>
        );
    }
}
