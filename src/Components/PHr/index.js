import React, { Component } from 'react';
import { SHr, SLoad, SText, STheme, SView } from 'servisofts-component';

type PButtom_props = {
 
}

export default class PButtom extends Component<PButtom_props> {
    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    render() {
        return <>
            <SHr h={10} />
            <SHr h={2} color={STheme.color.card} />
            <SHr h={10} />
        </>
    }
}
