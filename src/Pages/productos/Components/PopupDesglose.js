import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SIcon, SImage, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import Config from '../../../Config';
import MDL from '../../../MDL';
import SSocket from 'servisofts-socket';
import FormularioModelo from './FormularioModelo';
import FloatButtom from '../../../Components/FloatButtom';
import FloatMenu from '../../../Components/FloatMenu';
import SIconApp from '../../../Assets/SIconApp';
import FormularioAgregarInventario from './FormularioAgregarInventario';
import BarcodeIcon from '../../../Components/BarcodeScanner/BarcodeIcon';
import PopupDetalleModelo from './PopupDetalleModelo';

export default class PopupDesglose extends Component {
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
                //    const keysUsuarios = Object.values(proveedores).map(p => p.key_usuario).filter(Boolean);

                //    // Obtener usuarios desde el backend
                //    const usuarios = await MDL.usuario.getByKeys(keysUsuarios);

                //    // Adjuntar cada usuario a su proveedor correspondiente
                //    Object.values(proveedores).forEach(proveedor => {
                //        proveedor.usuario = usuarios.find(u => u.key === proveedor.key_usuario);
                //    });
                return produc;
            }}
        >
            <DinamicTable.Col key="index" label="#" textStyle={{ color: STheme.color.lightGray }} width={40} data={(e) => e.index + 1} />


            <DinamicTable.Col key={"nombre"} label='Nombre' width={220} data={(e) => e.row?.nombre} />
            <DinamicTable.Col key={"precio"} label='P. venta' width={70} data={(e) => e.row?.precio} />
            <DinamicTable.Col key={"precio_compra"} label='P. compra' width={70} data={(e) => e.row?.precio_compra} />
            <DinamicTable.Col key={"cantidad"} label='Cantidad' width={70} data={(e) => e.row?.cantidad} />
            <DinamicTable.Col key={"key_almacen"} label='key_almacen' width={150} data={(e) => e.row?.key_almacen} />
            {/* <DinamicTable.Col key={"barcode"} label='BarCode' width={100} data={(e) => e.row?.barcode} /> */}
        </DinamicTable>

    }
}
