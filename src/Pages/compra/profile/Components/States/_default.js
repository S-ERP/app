import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SPage, SText } from 'servisofts-component';

export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (

            <SText>{'default '}{this.props.data?.state}</SText>
        );
    }
}