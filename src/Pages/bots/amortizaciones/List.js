import React, { Component } from 'react';
import { SHr, SInput, SList, SLoad, SText, SView } from 'servisofts-component';
import Producto from './Producto';

export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this._ref = {};

    }


    render() {
        let data = this.props.data;
        if (!data) {
            return <SText>Suba un excel para iniciar el proceso de migracion</SText>
        }
        return (
            <SView col={"xs-12"}>
                <SList
                    buscador
                    data={data.productos}
                    limit={10}
                    render={obj => <Producto data={obj} />}
                />
            </SView>
        );
    }
}
