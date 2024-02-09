import React, { Component } from 'react';
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import Model from '../../Model';
import SSocket from 'servisofts-socket';
type PropsType = {
    data: any,
}

export default class GenerarAsiento extends Component<PropsType> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    render() {

        return <SView >
            <SView card style={{ padding: 16, width: 155 }} center onPress={() => {
                SSocket.sendPromise({
                    service: "compra_venta",
                    component: "compra_venta",
                    type: "generarAsientoContable",
                    key_compra_venta: this.props.data?.key

                }).then(e => { console.log(e) }).catch(e => console.error(e))
            }}>
                <SText bold color={STheme.color.success}>GENERAR ASIENTO</SText>
            </SView>
        </SView>
    }
}
