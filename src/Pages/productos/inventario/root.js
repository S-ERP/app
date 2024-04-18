import DPA, { connect } from 'servisofts-page';
import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SHr, SIcon, SImage, SLoad, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
import Container from '../../../Components/Container';
import Model from '../../../Model';
import Labels from './Components/Labels';

class index extends DPA.list {
    constructor(props) {
        super(props);
        this.state = {
            cargar: true
        };
        this.data = {
            [0]: { key: 0, descripcion: "Nombre 0", color: "#A56EF4" },
            [1]: { key: 1, descripcion: "Nombre 1", color: "#D4FF33" },
            [2]: { key: 2, descripcion: "Nombre 2", color: "#33FFD4" },
            [3]: { key: 3, descripcion: "Nombre 3", color: "#8A33FF" },
            [4]: { key: 4, descripcion: "Nombre 4", color: "#E233FF" },
            [5]: { key: 5, descripcion: "Nombre 5", color: "#FFD433" },
            [6]: { key: 6, descripcion: "Nombre 6", color: "#33FF93" },
        }
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
                    // justifyContent:"space-between",
                    alignItems: 'stretch',
                }}>
                <SHr h={16} />

                <Labels data={this.data}
                // onPress={() => {
                //     this.seleccionarCliente()
                // }}
                />
                {/* <>
                    {this.renderItem({ label: "Nombre 1", key: "", onPress: () => SNavigation.navigate("/menu"), color: "#A56EF4" })}

                </> */}

            </SView >
        </SView >
    }

    getPie(color, label) {
        return <SView col={"xs-12"} center card style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
        }}>
            {/* <SView col={"xs-12"} center> */}

            <SView row padding={5}>
                <SView center width={18} height={18} style={{ position: "absolute", right: 0, top: -3, backgroundColor: STheme.color.danger, borderRadius: 40, zIndex: 999 }}>
                    <SIcon name='eliminar2' width={8} height={8} fill={STheme.color.white} />
                </SView>
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
            {/* </SView> */}
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
            {this.getPie("#A56EF4", "Nombre 1")}

        </SPage>
    }
}
export default connect(index);
