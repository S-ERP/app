import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SIcon, SImage, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import Config from '../../../Config';
import MDL from '../../../MDL';


export default class PopupDesglose extends Component {

    static open({ key_modelo }) {
        SPopup.open({
            key: "popup_config_horario",
            content: (
                <SView col={"xs-11  "} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 700 }} padding={16} withoutFeedback >
                    <SView col={"xs-12"} height={470} center >
                        <PopupDesglose key_modelo={key_modelo}  ></PopupDesglose>
                    </SView>
                </SView>
            )
        });

    }
    constructor(props) {
        super(props);
        this.state = {
            // time: new Date().getTime()
        };
    }

    // listenerQr = null;

    render() {
        return <DinamicTable
            ref={ref => this.table = ref}
            colors={Config.table.colors()}
            cellStyle={Config.table.cellStyle()}
            textStyle={Config.table.textStyle()}
            selectType='single'
            language='es'
            // loadData={this.loadData.bind(this)}
            loadData={async () => {
                const produc = await MDL.inventario.getAllProductos(this.props.key_modelo);
                return produc;
            }}
        >
            <DinamicTable.Col key="index" label="#" textStyle={{ color: STheme.color.lightGray }} width={40} data={(e) => e.index + 1} />
            <DinamicTable.Col key={"nombre"} label='Nombre' width={220} data={(e) => e.row?.nombre} />
            <DinamicTable.Col key={"precio"} label='P. venta' width={70} data={(e) => e.row?.precio} />
            <DinamicTable.Col key={"precio_compra"} label='P. compra' width={70} data={(e) => e.row?.precio_compra} />
            <DinamicTable.Col key={"cantidad"} label='Cantidad' width={70} data={(e) => e.row?.cantidad} />
            <DinamicTable.Col key={"almacen"} label='Almacen' width={150} data={(e) => e.row?.almacen?.descripcion} />
            <DinamicTable.Col key={"depreciacion"} label='Depreciacion' width={150} data={(e) => e.row?.depreciacion} />
            <DinamicTable.Col key={"fecha_on"} label='Fecha de On' width={100} data={(e) => new SDate(e.row?.fecha_on,"yyyy-MM-ddThh:mm:ss").date} />
        </DinamicTable>

    }
}
