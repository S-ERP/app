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
                {/* <SView col={"xs-11  "} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 700 }} padding={16} withoutFeedback > */}
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
            loadData={async () => {
                const produc = await MDL.inventario.getAllProductos(this.props.key_modelo);
                console.clear();
                console.log("%c" + JSON.stringify(produc, null, 2), "color: #2ECC40; font-weight: bold;");
                return produc;
            }}
        >
            <DinamicTable.Col key="index" label="#" textStyle={{ color: STheme.color.lightGray }} numberOfLines={1} width={20} data={(e) => e.index + 1} />
            <DinamicTable.Col key={"nombre"} label='Producto' width={90} data={(e) => e.row?.nombre} numberOfLines={1} />
            <DinamicTable.Col key={"precio"} label='Precio Venta' width={60} numberOfLines={1} data={(e) => e.row?.precio} />
            <DinamicTable.Col key={"precio_costo"} label='Precio Compra' width={60} numberOfLines={1} data={(e) => e.row?.precio_costo} />

            <DinamicTable.Col key={"fecha_vencimiento"} label="Vencimiento" width={124} dataType="date" dateFormat="yyyy-MM-dd"
                data={(e) => e.row?.fecha_vencimiento ? new SDate(e.row.fecha_vencimiento, "yyyy-MM-ddThh:mm:ss").date : null}
            />
            <DinamicTable.Col key={"cantidad"} label='Cantidad' width={50} numberOfLines={1} data={(e) => e.row?.cantidad} />
            <DinamicTable.Col key={"almacen"} label='Ubicación' width={120} numberOfLines={1} data={(e) => e.row?.almacen?.descripcion} />
            <DinamicTable.Col key={"almacen"} label='Estado' width={120} numberOfLines={1} data={(e) => e.row?.almacen?.descripcion} />
            {/* <DinamicTable.Col key={"depreciacion"} label='Depreciacion' width={80} numberOfLines={1} data={(e) => e.row?.depreciacion} /> */}
            <DinamicTable.Col key={"fecha_on"} label='Registrado' width={110} numberOfLines={1} data={(e) => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} dataType="date" dateFormat="yyyy-MM-dd hh:mm" />
        </DinamicTable>

    }
}
