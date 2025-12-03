import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SIcon, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView, SButtom } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';

export default class tabla extends Component {
    state = {
        data: [],
        loading: true
    }

    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({
            url: "/habilidad/tabla",
            permiso: "ver"
        }).then((permit) => {
            if (!permit) {
                SNavigation.goBack();
                return;
            }
            this.loadData();
        }).catch(e => {
            console.error(e);
        })
    }

    handleRegistro = async () => {
        try {
            const newHabilidad = await MDL.habilidad.registro();
        } catch (error) {
            console.error(error);
        }
    }

    async loadData() {
        try {
            const array = await MDL.habilidad.getAll();
            console.log("Datos obtenidos:", array); // Para verificar en consola
            this.setState({
                data: array,
                loading: false
            });
        } catch (error) {
            console.error(error);
            this.setState({
                data: [],
                loading: false
            });
        }
    }

    render() {
        return <SPage title={"Habilidades"} disableScroll>
            <SView row center>
                <SView flex />
                <SButtom
                    style={{
                        marginRight: 8,
                        backgroundColor: STheme.color.primary,
                        padding: 8,
                        borderRadius: 4
                    }}
                    onPress={this.handleRegistro}
                >
                    <SText color={STheme.color.white} bold>Registrar</SText>
                </SButtom>
            </SView>
            {this.state.loading ? (
                <SView center>
                    <SText>Cargando...</SText>
                </SView>
            ) : (
                <DinamicTable
                    data={this.state.data}
                >
                    <DinamicTable.Col
                        key={"key"}
                        label='Key'
                        width={50}
                        data={e => e.row.key}
                        textStyle={{
                            fontSize: 10,
                            color: STheme.color.lightGray,
                        }}
                    />
                    <DinamicTable.Col
                        key={"descripcion"}
                        label='Descripcion'
                        width={260}
                        wrap
                        textStyle={{
                            // fontWeight: "bold"
                        }}
                        data={e => e.row.descripcion}
                    />

                </DinamicTable>



            )}
        </SPage>
    }
}