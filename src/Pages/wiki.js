import React, { Component } from 'react';
import { Linking } from 'react-native'
import { connect } from 'react-redux';
import { SNavigation, SPage, SText } from 'servisofts-component';

class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        Linking.openURL("https://github.com/servisofts/darmotos/wiki");
        SNavigation.goBack();
    }
    render() {
        return (
            <SPage title={'index'}>

                <SText>{'index'}</SText>

            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);