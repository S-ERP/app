import React, { Component } from 'react';
import { SHr, SText, SView } from 'servisofts-component';


export default class index extends Component<propsType> {
    static defaultProps: propsType = {

    }
    props: propsType;
    constructor(props) {
        super(props);
        this.state = {
        };

    }
    render() {
        return <SView col={'xs-12'}>
            <SHr height={50}/>
            <SText>{'Created by'}</SText><SText bold>{"Servisofts S.R.L."}</SText>
        </SView>
    }
}