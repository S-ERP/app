import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SPage, SText } from 'servisofts-component';

export default class Perfil extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <SPage title={'Perfil'}>

                <SText>{'Perfil'}</SText>

            </SPage>
        );
    }
}
