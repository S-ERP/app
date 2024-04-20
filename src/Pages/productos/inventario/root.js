import DPA, { connect } from 'servisofts-page';
import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SHr, SIcon, SImage, SLoad, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
import Container from '../../../Components/Container';
import Model from '../../../Model';
import Labels from './Components/Labels';
import LabelsPie from './Components/LabelsPie';

class index extends DPA.list {
    constructor(props) {
        super(props);
        this.state = {
            cargar: true,
            data: {
                [0]: { key: 0, descripcion: "Nombre 0", color: "#A56EF4" },
                [1]: { key: 1, descripcion: "Nombre producto 1", color: "#D4FF33" },
                [2]: { key: 2, descripcion: "Nombre 2", color: "#33FFD4" },
                [3]: { key: 3, descripcion: "Nombre prueba 3", color: "#8A33FF" },
                [4]: { key: 4, descripcion: "Nombre4", color: "#E233FF" },
                [5]: { key: 5, descripcion: "Nombre ok 5", color: "#FFD433" },
                [6]: { key: 6, descripcion: "Nombre 6", color: "#33FF93" },
            },
            dataAssigned: {}
        };
        // this.data = {
        //     [0]: { key: 0, descripcion: "Nombre 0", color: "#A56EF4" },
        //     [1]: { key: 1, descripcion: "Nombre producto 1", color: "#D4FF33" },
        //     [2]: { key: 2, descripcion: "Nombre 2", color: "#33FFD4" },
        //     [3]: { key: 3, descripcion: "Nombre prueba 3", color: "#8A33FF" },
        //     [4]: { key: 4, descripcion: "Nombre4", color: "#E233FF" },
        //     [5]: { key: 5, descripcion: "Nombre ok 5", color: "#FFD433" },
        //     [6]: { key: 6, descripcion: "Nombre 6", color: "#33FF93" },
        // }
    }

    renderItem({ onPress, label, key, color }) {
        return <SView onPress={onPress} row padding={5}>
            <SView row padding={5}
                style={{
                    borderWidth: 1,
                    borderColor: color,
                    backgroundColor: color + "50",
                    borderRadius: 16
                }} >
                <SView width={27} height={27} center backgroundColor={STheme.color.primary} borderRadius={45}>
                    {/* <SImage source={require("")} width={30} height={30} /> */}
                </SView>
                <SView width={10} />
                <SView center>
                    <SText fontSize={12}>{label}</SText>
                </SView>
            </SView>
        </SView>
    }
    content() {

        return <SView col={"xs-12"} center>
            <SView col={"xs-12 sm-10 md-9 lg-7 xl-6 xxl-5"} center row
                style={{
                    flexDirection: 'row',
                    alignItems: 'stretch',
                }}>
                <SHr h={16} />

                <Labels data={this.state.data} dataF5={this.state.dataAssigned}
                    onChange={(value) => {
                        console.log("value")
                        console.log(value)
                        this.setState({ data: value })
                    }}
                    labelsAssigned={(dato) => {
                        this.setState({ dataAssigned: dato })
                    }}
                />
            </SView >
        </SView >
    }

    getPie() {
        return <SView col={"xs-12"} center card style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
        }} row>
            <SView col={"xs-10"} center>
                <LabelsPie data={this.state.dataAssigned} dataF5={this.state.data}
                    onChange={(value) => {
                        this.setState({ data: value })
                    }}
                    labelsAssigned={(dato) => {
                        this.setState({ dataAssigned: dato })
                    }}
                />
            </SView >
            <SView col={"xs-2"} style={{ alignItems: "flex-end", alignContent: "flex-end", }} row center>
                {(Object.keys(this.state.dataAssigned).length > 1) ?
                    <>
                        <SView center width={40} height={40} backgroundColor={STheme.color.barColor} borderRadius={45}
                            onPress={() => {
                                this.setState({ data: { ...this.state.data, ...this.state.dataAssigned } })
                                this.setState({ dataAssigned: {} })
                            }}
                        >
                            <SIcon name={"deleteAll"} width={20} height={20} fill={STheme.color.text} />
                        </SView >
                        <SView width={5} />
                    </> : <SView width={45} />}
                <SView center width={40} height={40} backgroundColor={STheme.color.barColor} borderRadius={45}
                    onPress={() => {
                        SNavigation.navigate("/productos/inventario_dato")
                    }}
                >
                    <SIcon name={"add1"} width={20} height={20} fill={STheme.color.text} />
                </SView >
                <SView width={5} />
                {/* <SText fontSize={10}>Agregar</SText> */}
            </SView >
        </SView >

    }
    render() {
        return <SPage title="Tipo de productos" onRefresh={(e) => {
            this.setState({ cargar: true })
            Model.publicacion.Action.CLEAR();
            return;
        }} >
            <SHr h={16} />
            <SIcon name={"configuracion"} width={50} height={50} />
            {this.content()}
            <SHr h={20} />
            {this.getPie()}

        </SPage>
    }
}
export default connect(index);
