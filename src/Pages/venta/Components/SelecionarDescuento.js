import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SInput, SText, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';

export default class SelecionarDescuento extends Component<{ onSelect?: (descuento) => void }> {
    state = {
    };
    componentDidMount() {
        this.loadData();
    }
    loadData() {
        SSocket.sendPromise({
            service: "compra_venta",
            component: "descuento",
            type: "getAll",
            key_empresa: MDL.empresa?.select?.key
        }).then(e => {
            const descuentos = Object.values(e.data)
            //  this.props.onSelect && this.props.onSelect(descuentos[0]);
            this.setState({ descuentos: descuentos })
        })
    }
    toString(item) {
        return `${item.descripcion} - ${item.porcentaje}%`;
    }
    render() {
        return <SView >

            {this.state.descuentos ?
                <SInput type='select2'
                    customStyle={"erp"}
                    label={"Descuento:"}
                    options={this.state.descuentos.map(item => this.toString(item))}
                    // defaultValue={this.toString(this.state.descuentos[0])}
                    onChangeText={e => {
                        const encontrado = this.state.descuentos.find(item => this.toString(item) === e);
                        if (encontrado) {
                            this.props.onSelect && this.props.onSelect(encontrado);
                        }else{
                            this.props.onSelect && this.props.onSelect(null);
                        }
                    }}
                />
                :
                <SText>Cargando...</SText>
            }
        </SView>;
    }
}
