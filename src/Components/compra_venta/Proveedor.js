import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate, SButtom } from 'servisofts-component';
import * as XLSX from "xlsx";
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import SCharts from 'servisofts-charts';
import Usuarios from 'servisofts-component/img/Usuarios';
import { version } from 'process';
import MDL from '../../MDL';
import Config from '../../Config';
import Model from '../../Model';
import FloatButtom from '../FloatButtom';
import TurnoComponent from '../TurnoComponent';
import Container from '../Container';
import ProveedorFormulario from './ProveedorFormulario';
import FloatMenu from '../FloatMenu';
import SIconApp from '../../Assets/SIconApp';

export default class Proveedor extends Component {


    onSelect = SNavigation.getParam("onSelect")
    constructor(props) {
        super(props);
        this.state = {
        };

    }

    mostrarPopup(aux_key: any, data: any) {
        SPopup.open({
            key: "popup_config_horario",
            content: (
                <SView col={"xs-11 sm-10 md-8"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 450 }} padding={16} withoutFeedback >
                    <SView col={"xs-12"} height={600} center >
                        <ProveedorFormulario key_proveedor={aux_key} data={data} onReload={() => { this.DinamicTable.loadData(); }} ></ProveedorFormulario>
                    </SView>
                </SView>
            )
        });
    }


    mostrarTabla() {
        return <DinamicTable
            key="tabla"
            ref={ref => this.DinamicTable = ref}
            center
            language="es"
            selectType="single"
            colors={{
                background: STheme.color.background,
                header: STheme.color.card,
            }}
            cellStyle={{
                borderWidth: 0,
            }}
            textStyle={{
                fontSize: 12,
                color: "white",
            }}

            ref={ref => this.DinamicTable = ref}


            onSelect={(e) => {
                if (this.onSelect) {
                    this.onSelect(e.row)
                    SNavigation.goBack();
                    return;
                }

                FloatMenu.open({
                    e: e.evt,
                    label: "Razón Social: " + e.row.razon_social,
                    options: [
                        {
                            icon: <SIconApp name='Edit' />,
                            label: "Actualizar Proveedor",
                            onPress: () => {
                                this.mostrarPopup(e.row.key, e.row);
                            }
                        },
                        {
                            icon: <SIconApp name='Delete' />,
                            label: "Eliminar Proveedor",
                            onPress: () => {
                                SPopup.confirm({
                                    title: "desea elimin",
                                    message: "esta seguro",
                                    onPress: () => {

                                        const data = e?.row;
                                        data.estado = 0;
                                        MDL.compra_venta.proveedor.editar(data).then((res) => {
                                            this.DinamicTable.loadData();
                                            console.log("actualizacion exitosa  ");
                                        }).catch(
                                            console.log("actualizacion erronea  ")
                                        )
                                    }
                                })

                            }
                        }
                    ]
                })


            }}

            loadData={async () => {
                const proveedores = await MDL.compra_venta.proveedor.getAllProveedor();
                const keysUsuarios = Object.values(proveedores).map(p => p.key_usuario).filter(Boolean);

                // Obtener usuarios desde el backend
                const usuarios = await MDL.usuario.getByKeys(keysUsuarios);

                // Adjuntar cada usuario a su proveedor correspondiente
                Object.values(proveedores).forEach(proveedor => {
                    proveedor.usuario = usuarios.find(u => u.key === proveedor.key_usuario);
                });
                return proveedores;
            }}

        >
            <DinamicTable.Col key="index" label="#" width={40} data={(e) => e.index + 1} />


            {/* <DinamicTable.Col key={"foto"} label='User'
                data={(e) => e.row?.key_usuario}
                width={45}
                customComponent={e => <SView style={{
                    width: 24,
                    height: 24,
                    borderRadius: 100,
                    overflow: "hidden",
                    backgroundColor: STheme.color.card + "66",
                }}>
                    <SImage src={SSocket.api.root + "usuario/" + e.data} style={{
                        resizeMode: "cover",
                    }} />
                </SView>} /> */}

            {/* <DinamicTable.Col key="key_usuario" label="Usuario" width={250} data={(e) => e.row?.usuario.Nombres} /> */}
            <DinamicTable.Col key="razon_social" label="Razón Social" width={100} data={(e) => e.row?.razon_social} />
            <DinamicTable.Col key="nit" label="NIT" width={100} data={(e) => e.row?.nit} />
            <DinamicTable.Col key="nombre" label="Nombre de Contacto" width={150} data={(e) => e.row?.nombre} />
            <DinamicTable.Col key="telefono" label="Teléfono" width={130} data={(e) => e.row?.telefono} />
            {/*
            <DinamicTable.Col key={"eliminar"} label='eliminar' width={100} data={(e) => ""}
                customComponent={e => <SView row card padding={2} onPress={() => {

                    const data = e?.row;
                    data.estado = 0;
                    MDL.compra_venta.proveedor.editar(data).then((res) => {
                        console.log("actualizacion exitosa  ")
                    }).catch(
                        console.log("actualizacion erronea  ")
                    )
                    this.DinamicTable.loadData();
                }}>
                    <SIcon name='Edit' width={18} />
                    <SView width={4} />
                    <SText center color={STheme.color.green} >{"eliminar"}</SText>
                </SView>}
            /> */}

        </DinamicTable>
    }

    render() {
        return (
            <SPage title="Gestión de Proveedores" disableScroll>
                {this.mostrarTabla()}
                <SHr height={20} />

                <FloatButtom onPress={() => { this.mostrarPopup() }} />
            </SPage>
        );
    }


}
