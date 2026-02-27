import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SInput, SText, SView, SStorage } from 'servisofts-component';
import MDL from '../../../MDL';
import sucursal from '../../../Model/empresa/sucursal';

export default class InputPuntoVenta extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            sucursales: [],
            puntos_venta: []
        };
    }
    getValue() {
        return this.state.select;
    }


    componentDidMount() {
        MDL.empresa.getByKeyFull().then((data) => {
            this.state.data = data;
            this.state.puntos_venta = [];
            this.state.sucursales = data.sucursales.map(a => {
                this.state.puntos_venta.push(...(a.puntos_venta ?? []).map(pv => {
                    pv.descripcion_sucursal = a.descripcion;
                    pv.fullName = a.descripcion + " - " + pv.descripcion;
                    return pv;
                }));
                return a;
            });
            
            // Intentar cargar la selección previa
            SStorage.getItem("puntoVenta_selected").then((savedSelect) => {
                if (savedSelect) {
                    try {
                        const savedObj = JSON.parse(savedSelect);
                        const foundPV = this.state.puntos_venta.find(pv => pv.key === savedObj.key);
                        this.state.select = foundPV ?? this.state.puntos_venta[0] ?? null;
                    } catch (e) {
                        this.state.select = this.state.puntos_venta[0] ?? null;
                    }
                } else {
                    this.state.select = this.state.puntos_venta[0] ?? null;
                }
                
                this.input.setValue(this.state.select?.fullName ?? "");
                this.forceUpdate();
            }).catch(e => {
                this.state.select = this.state.puntos_venta[0] ?? null;
                this.input.setValue(this.state.select?.fullName ?? "");
                this.forceUpdate();
            });
        }).catch(e => {

        })
    }

    render() {
        return <SView>
            <SInput
                ref={ref => this.input = ref}
                label={"Sucursal - Punto de Venta"}
                type='select2'
                placeholder={"Seleccione una sucursal"}
                error={!this.state.select}
                options={this.state.puntos_venta.map(a => a.fullName)}
                onChangeText={(e) => {
                    const obj = this.state.puntos_venta.find(a => a.fullName == e)
                    if (obj) {
                        this.state.select = obj;
                        console.log("select to obj")
                        // Guardar la selección en SStorage
                        SStorage.setItem("puntoVenta_selected", JSON.stringify(obj));
                        if (this.props.onChange) this.props.onChange(this.state.select)
                        this.input.setState({ error: false })
                        this.forceUpdate();
                        return;
                    }
                    if (this.state.select) {
                        console.log("select to null")
                        this.state.select = null;
                        this.forceUpdate();
                        if (this.props.onChange) this.props.onChange(this.state.select)
                        this.input.setState({ error: true })
                    }

                }}
            />
        </SView>
    }
}
