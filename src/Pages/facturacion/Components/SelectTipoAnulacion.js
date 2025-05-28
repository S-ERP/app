import React, { Component } from 'react';
import { View, Text } from 'react-native';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';
import { SInput } from 'servisofts-component';
import MDL from '../../../MDL';

export default class SelectTipoAnulacion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            parametricas: this.props.parametricas
        };
    }

    componentDidMount() {
        // MDL.factura.getSiat().then(e => {
        //     this.setState({ siat: e })
        // })


        // SSocket.sendPromise({
        //     service: "facturacion",
        //     component: "siat",
        //     type: "getAll",
        //     estado: "cargando",
        //     key_usuario: Model.usuario.Action.getKey(),
        //     key_empresa: Model.empresa.Action.getKey(),
        // }).then(e => {
        //     const siat = Object.values(e.data)[0] ?? {}
        //     this.setState({ siat: siat })
        // }).catch(e => {
        //     console.error(e);
        // })

    }
    getValue() {
        return this.input.getValue()
    }
    render() {
        // const { siat } = this.state
        if (!this.state.parametricas.motivoAnulacion) return <View><Text> Cargando...</Text></View>

        return <SInput type='select'
            ref={ref => this.input = ref}
            defaultValue={1}
            options={(this.state.parametricas.motivoAnulacion ?? []).filter(a => !(a.descripcion.indexOf("\\") > -1)).map(a => { return { key: a.codigoClasificador, content: a.descripcion } })}
            {...this.props} />
    }
}
