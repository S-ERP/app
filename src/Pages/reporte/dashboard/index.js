import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SPage, SText, SView } from 'servisofts-component';
import { dashboardPropsType } from './type';
import cantidad_de_usuario_por_rol from "./cantidad_de_usuario_por_rol"
import cantidad_de_compra_venta from './cantidad_de_compra_venta';
import test from "./test"
import grafico_cuentas from './grafico_cuentas';
import grafico_almacenes from './grafico_almacenes';
import grafico_pendientes_de_recepcion from './grafico_pendientes_de_recepcion';
const GRAPHICS = {
    cantidad_de_compra_venta,
    cantidad_de_usuario_por_rol,
    grafico_cuentas,
    grafico_almacenes,
    grafico_pendientes_de_recepcion,
    test
}
const SPACE = 20;
class index extends Component<dashboardPropsType> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <SPage title={'Graficos'}>
                <SHr h={SPACE} />
                <SView style={{
                    padding: 8
                }}>
                    {Object.values(GRAPHICS).map(Item => <><Item {...this.props} /><SHr h={SPACE} /></>)}
                </SView>
            </SPage>
        );
    }
}

const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);