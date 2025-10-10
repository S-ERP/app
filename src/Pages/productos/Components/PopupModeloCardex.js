import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SIcon, SImage, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import Config from '../../../Config';
import MDL from '../../../MDL';
import SIconApp from '../../../Assets/SIconApp';


export default class PopupModeloCardex extends Component {

    static open({ key_modelo }) {
        SPopup.open({
            key: "PopupModeloCardex",
            content: (
                <SView col={"xs-11  "} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 700 }} padding={16} withoutFeedback >
                    <SView col={"xs-12"} height={470} center >
                        <PopupModeloCardex key_modelo={key_modelo} />
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
            key={"tabla_modelo_cardex"}
            ref={ref => this.table = ref}
            colors={Config.table.colors()}
            cellStyle={Config.table.cellStyle()}
            textStyle={Config.table.textStyle()}
            selectType='single'
            language='es'
            // loadData={this.loadData.bind(this)}
            loadData={async () => {
                const produc = await MDL.inventario.exec(`
                    SELECT inventario_cardex.* , almacen.descripcion as descripcion_almacen
                    FROM producto JOIN inventario_cardex ON producto.key = inventario_cardex.key_producto
                    JOIN almacen ON inventario_cardex.key_almacen = almacen.key
                    WHERE producto.key_modelo = '${this.props.key_modelo}'
                    AND producto.estado > 0 
                    AND inventario_cardex.estado > 0
                    ORDER BY inventario_cardex.fecha_on DESC
                    `)
                return produc;
            }}
        >
            <DinamicTable.Col key="index" label="#" textStyle={{ color: STheme.color.lightGray }} width={40} data={(e) => e.index + 1} />
            {/* <DinamicTable.Col key={"cantidad"} label='Cantidad' width={220} data={(e) => e.row?.cantidad} /> */}
            {/* <DinamicTable.Col key={"precio_compra"} label='P. compra' width={70} data={(e) => e.row?.precio_compra} /> */}
            <DinamicTable.Col key={"key_producto"} label='Producto' width={70}
                textStyle={{ fontSize: 10, color: STheme.color.lightGray }}
                data={(e) => e.row?.key_producto} />
            <DinamicTable.Col key={"tipo"} label='tipo' width={130} data={(e) => e.row?.tipo} />
            <DinamicTable.Col key={"icon"} label='IE' width={30} cellStyle={{
                alignItems: "center"
            }} data={(e) => e.row?.cantidad > 0 ? "Ingreso" : "Egreso"}
                customComponent={e => {
                    return e.data === "Ingreso" ? <SIconApp name='Ingreso' width={16} height={16} /> : <SIconApp name='Egreso' width={16} height={16} />
                }} />
            <DinamicTable.Col key={"cantidad"} label='Cantidad' width={70} data={(e) => e.row?.cantidad}
                footerComponent={(e) => {
                    let total = 0;
                    e.dinamicTable.dataFiltrada.map((item) => {
                        total += parseFloat(item?.cantidad ?? "0")
                    });
                    return <SView col={"xs-12"} height={30} center style={{
                        backgroundColor: STheme.color.card,

                    }}>
                        <SText>{`Total: ${total}`}</SText>
                    </SView>
                }}
            />
            <DinamicTable.Col key={"almacen"} label='Almacen' width={120} data={(e) => e.row?.descripcion_almacen} />
            <DinamicTable.Col key={"fecha_on"} label='Fecha' width={150}
                textStyle={{ fontSize: 10, color: STheme.color.lightGray }}
                dataType='date'
                data={(e) => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date}
                dateFormat='yyyy-MM-dd a las hh:mm'
            />


            {/* <DinamicTable.Col key={"almacen"} label='Almacen' width={150} data={(e) => e.row?.almacen?.descripcion} /> */}
            {/* <DinamicTable.Col key={"barcode"} label='BarCode' width={100} data={(e) => e.row?.barcode} /> */}
        </DinamicTable>

    }
}
