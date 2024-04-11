import React, { Component } from 'react'
import { STheme, SView } from 'servisofts-component';
import Types, { TopBarTypes } from './type';
export type TopBarPropsType = {
    type: TopBarTypes,
    title?: string,
    preventBack?: boolean,
    onBack?: () => boolean,
    
}
export default class TopBar extends Component<TopBarPropsType> {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        var type = this.props.type;
        if (!type) type = "default";
        var ITM = Types[type];
        return <ITM {...this.props}></ITM>
    }
}