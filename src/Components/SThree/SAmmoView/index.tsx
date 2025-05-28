import _AmmoType from 'ammojs-typed';
import React, { Component } from 'react';


export type AmmoType = typeof _AmmoType;


type SAmmoViewProps = {
    children?: any,
    onCreate: (props: { Ammo: AmmoType }) => any;
}
export default class SAmmoView extends Component<SAmmoViewProps> {

    state = {
        ready: false
    }

    // shouldComponentUpdate(nextProps: any, nextState: any, nextContext: any): boolean {
    //     if (!!this.state.ready && nextState.ready) return true;
    //     return false;
    // }

    componentDidMount(): void {
        this.initammo();
    }

    async initammo() {
        const { default: Ammo }: { default: any } = await import('ammojs3');
        const ammo: AmmoType = await Ammo();
        if (this.props.onCreate) this.props.onCreate({ Ammo: ammo });
        this.setState({ ready: true });

        // const ammo: AmmoType = await Ammo();
        // if (this.props.onCreate) this.props.onCreate({ Ammo: ammo })
        // this.setState({ ready: true });
    }
    render() {
        if (!this.state.ready) return null;
        return this.props.children
    }
}