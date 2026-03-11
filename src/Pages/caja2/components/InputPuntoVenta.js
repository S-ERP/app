import React, { Component } from 'react';
import { SInput, SView, SStorage } from 'servisofts-component';
import MDL from '../../../MDL';

export default class InputPuntoVenta extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            sucursales: [],
            puntos_venta: [],
            select: null
        };
    }

    getValue() {
        return this.state.select;
    }

    async componentDidMount() {
        try {

            const data = await MDL.empresa.getByKeyFull();
            let puntos_venta = [];
            let sucursales = data.sucursales ?? [];
            sucursales.forEach(sucursal => {
                (sucursal.puntos_venta ?? []).forEach(pv => {
                    const obj = {
                        ...pv,
                        descripcion_sucursal: sucursal.descripcion,
                        fullName: `${sucursal.descripcion} - ${pv.descripcion}`
                    };
                    puntos_venta.push(obj);
                });
            });

            let select = puntos_venta[0] ?? null;
            try {
                const savedSelect = await SStorage.getItem("puntoVenta_selected");
                if (savedSelect) {
                    const savedObj = JSON.parse(savedSelect);
                    const found = puntos_venta.find(pv => pv.key === savedObj.key);
                    if (found) select = found;
                }
            } catch (e) {
                console.log("Error leyendo storage", e);
            }

            this.setState({
                data, sucursales, puntos_venta, select
            }, () => {
                if (this.input && select) {
                    this.input.setValue(select.fullName);
                }

                if (this.props.onChange) {
                    this.props.onChange(select);
                }
            });

        } catch (e) {
            console.log("Error cargando empresa", e);
        }
    }
    onChangeText = (value) => {
        const obj = this.state.puntos_venta.find(a => a.fullName === value);
        if (obj) {
            this.setState({ select: obj }, () => {
                SStorage.setItem("puntoVenta_selected", JSON.stringify(obj));
                if (this.props.onChange) { this.props.onChange(obj); }
                if (this.input) { this.input.setState({ error: false }); }
            });
        } else {
            this.setState({ select: null }, () => {
                if (this.props.onChange) { this.props.onChange(null); }
                if (this.input) { this.input.setState({ error: true }); }
            });
        }
    }

    render() {
        const options = this.state.puntos_venta.map(a => a.fullName);
        return (
            <SView>
                <SInput ref={(ref) => { this.input = ref }} label={"Sucursal - Punto de Venta"} type="select2" placeholder={"Seleccione una sucursal"} error={!this.state.select} options={options} onChangeText={this.onChangeText} />
            </SView>
        );
    }
}