import Ammo from 'ammojs3';
import React, { Component } from 'react';

export type AmmoType = typeof Ammo

type SAmmoViewProps = {
    children?: any,
    onCreate: (props: { Ammo: AmmoType }) => any;
}
export default class SAmmoView extends Component<SAmmoViewProps> {

    state = {
        ready: false
    }

    componentDidMount(): void {
        this.initammo();
    }

    async initammo() {
        const ammo: AmmoType = await Ammo();
        if (this.props.onCreate) this.props.onCreate({ Ammo: ammo })
        this.setState({ ready: true });
    }
    render() {
        if (!this.state.ready) return null;
        return this.props.children
    }
}