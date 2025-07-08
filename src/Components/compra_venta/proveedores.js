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
import FloatButtom from '../../Components/FloatButtom';
import TurnoComponent from '../../Components/TurnoComponent';
import Container from '../../Components/Container';


export default class proveedores extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }

    mostrarPopup(aux_key: any) {
        SPopup.open({
            key: "popup_config_horario",
            content: (
                <SView col={"xs-11 sm-10 md-8"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 450 }} padding={16} withoutFeedback >
                    <SView col={"xs-12"} height={600} center >
                        {/* <Proveedor key_turno={aux_key} onReload={() => {
                            this.DinamicTable.loadData();
                            console.log("✅ Se guardó el turno y se ejecutó el callback");
                            // Aquí puedes refrescar listas, volver a cargar datos, etc.
                        }}

                        ></TurnoComponent> */}
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

            loadData={async () => {
                const proveedores = await MDL.compra_venta.getAllProveedor();
                // Extraer todas las keys de usuario únicos
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
            <DinamicTable.Col key="key_usuario" label="key_usuario" width={180} data={(e) => e.row?.key_usuario} />
            <DinamicTable.Col key="asdsad" label="Usuario" width={250} data={(e) => e.row?.usuario.Nombres} />

            <DinamicTable.Col key="razon_social" label="razon_social" width={180} data={(e) => e.row?.razon_social} />
            <DinamicTable.Col key="nit" label="nit" width={180} data={(e) => e.row?.nit} />
            <DinamicTable.Col key="nombre" label="nombre" width={180} data={(e) => e.row?.nombre} />
            <DinamicTable.Col key="telefono" label="telefono" width={150} data={(e) => e.row?.telefono} />

            <DinamicTable.Col key="key_cuenta_contable" label="key_cuenta_contable" width={150} data={(e) => e.row?.key_cuenta_contable} />
            <DinamicTable.Col key="key_empresa" label="key_empresa" width={180} data={(e) => e.row?.key_empresa} />

            <DinamicTable.Col key={"foto"} label='User'
                data={(e) => e.row?.key_usuario}
                width={35}
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
                </SView>} />
        </DinamicTable>
    }

    render() {
        return (
            <SPage title="proveedor" disableScroll>

                {this.mostrarTabla()}

                <SHr height={20} />
                <FloatButtom onPress={() => { this.mostrarPopup() }} />
            </SPage>
        );
    }


}
