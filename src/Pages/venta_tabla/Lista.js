import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SNavigation, SPage, SPopup, SStorage, SText, STheme, SView } from 'servisofts-component';
import FloatButtom from '../../Components/FloatButtom';
import FloatMenu from '../../Components/FloatMenu';
import SIconApp from '../../Assets/SIconApp';
import { DinamicTable } from 'servisofts-table';
import Model from '../../Model';
import MDL from '../../MDL';

export default class Lista extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }



    // onSelect = SNavigation.getParam("onSelect")

    // mostrarPopup(aux_key: any, data: any) {
    //     SPopup.open({
    //         key: "popup_config_horario",
    //         content: (
    //             <SView col={"xs-11 sm-10 md-8"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 450 }} padding={16} withoutFeedback >
    //                 <SView col={"xs-12"} height={470} center >
    //                     {/* <Perfil key_proveedor={aux_key} data={data} onReload={() => { this.DinamicTable.loadData(); }} ></Perfil> */}
    //                 </SView>
    //             </SView>
    //         )
    //     });
    // }



    mostrarTabla() {


        return (<DinamicTable
            ref={ref => this.DinamicTable = ref}
            // loadData={async () => await MDL.whatsapp.device.getAll()}
            loadData={async () => {
                // const data_empresa_ = await SStorage.getItem("empresa_select");
                // const data_empresa = JSON.parse(data_empresa_);
                // let key_empresa = data_empresa?.key;
                // const data = Model.compra_venta.Action.getAll({});
                // console.log("toso " + JSON.stringify(data_empresa?.key) )
                // return data.filter(item => item.key_empresa === key_empresa);



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
                console.log("aquiiii   " + JSON.stringify(this.ventas))

                return this.ventas;
                // return asdsad.filter(item => item.key_empresa === key_empresa);

            }}
            key="id"
            language="es"
        // colors={Config.table.colors()}
        // cellStyle={Config.table.cellStyle()}
        // textStyle={Config.table.textStyle()}
        // selectType='single'
        // keyExtractor={e => e.key}


        >
            <DinamicTable.Col key="index" label="N°" width={40} textStyle={{
                fontSize: 10, color: STheme.color.lightGray
            }} data={e => e.index + 1} />

            {/* <DinamicTable.Col key="key" label="Key" width={100} textStyle={{
                    fontSize: 10, color: STheme.color.lightGray
                }} data={e => e.row.key} /> */}




        </DinamicTable>

        );
    }



    render() {
        return (
            <SPage title="Gestión de Tabla" disableScroll>
                {this.mostrarTabla()}
                <SHr height={20} />

                {/* <FloatButtom onPress={() => { this.mostrarPopup() }} /> */}
            </SPage>
        );
    }
}
