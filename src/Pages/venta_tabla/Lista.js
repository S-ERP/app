import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SNavigation, SPage, SPopup, SStorage, SText, STheme, SView } from 'servisofts-component';
import FloatButtom from '../../Components/FloatButtom';
import FloatMenu from '../../Components/FloatMenu';
import SIconApp from '../../Assets/SIconApp';
import { DinamicTable } from 'servisofts-table';
import Model from '../../Model';
import MDL from '../../MDL';
import Config from '../../Config';

export default class Lista extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }



    onSelect = SNavigation.getParam("onSelect")

    mostrarPopup(aux_key: any, data: any) {
        SPopup.open({
            key: "popup_config_horario",
            content: (
                <SView col={"xs-11 sm-10 md-8"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 450 }} padding={16} withoutFeedback >
                    <SView col={"xs-12"} height={470} center >
                        {/* <Perfil key_proveedor={aux_key} data={data} onReload={() => { this.DinamicTable.loadData(); }} ></Perfil> */}
                    </SView>
                </SView>
            )
        });
    }



    mostrarTabla() {


        return (<DinamicTable
            ref={ref => this.DinamicTable = ref}
            loadData={async () => {
                this.data = Model.compra_venta.Action.getAll();
                if (!this.data) return null;
                this.compras = []
                this.ventas = []
                this.estados_compra = {};
                this.estados_venta = {};
                Object.values(this.data).map(cv => {
                    if (cv.tipo == "compra") {
                        if (!this.estados_compra[cv.state]) this.estados_compra[cv.state] = 0;
                        this.estados_compra[cv.state] += 1;
                        this.compras.push(cv);
                    }
                    if (cv.tipo == "venta") {
                        if (!this.estados_venta[cv.state]) this.estados_venta[cv.state] = 0;
                        this.estados_venta[cv.state] += 1;
                        this.ventas.push(cv);
                    }

                })
                return this.ventas;
            }}
            key="id"
            language="es"
            colors={Config.table.colors()}
            cellStyle={Config.table.cellStyle()}
            textStyle={Config.table.textStyle()}
            selectType='single'
            keyExtractor={e => e.key}


        >
            <DinamicTable.Col key="index" label="N°" width={40} textStyle={{
                fontSize: 10, color: STheme.color.lightGray
            }} data={e => e.index + 1} />

            <DinamicTable.Col key="key" label="Key" width={100} textStyle={{
                fontSize: 10, color: STheme.color.lightGray
            }} data={e => e.row.key} />

            <DinamicTable.Col key="key_empresa" label="key_empresa" width={100} textStyle={{
                fontSize: 10, color: STheme.color.lightGray
            }} data={e => e.row.key_empresa} />

            <DinamicTable.Col key="tipo" label="tipo" width={100} textStyle={{
                fontSize: 10, color: STheme.color.lightGray
            }} data={e => e.row.tipo} />

            <DinamicTable.Col key="tipo_pago" label="tipo_pago" width={100} textStyle={{
                fontSize: 10, color: STheme.color.lightGray
            }} data={e => e.row.tipo_pago} />

            <DinamicTable.Col key="fecha_on" label="fecha_on" width={100} textStyle={{
                fontSize: 10, color: STheme.color.lightGray
            }} data={e => e.row.fecha_on} />

            <DinamicTable.Col key="key_cliente" label="key_cliente" width={100} textStyle={{
                fontSize: 10, color: STheme.color.lightGray
            }} data={e => e.row.key_cliente} />

            <DinamicTable.Col key="cliente" label="cliente" width={100} textStyle={{
                fontSize: 10, color: STheme.color.lightGray
            }} data={e => e.row.cliente} />





        </DinamicTable>

        );
    }



    render() {
        return (
            <SPage title="Gestión de Tabla" disableScroll>
                {this.mostrarTabla()}
                <SHr height={20} />

                <FloatButtom onPress={() => { this.mostrarPopup() }} />
            </SPage>
        );
    }
}
