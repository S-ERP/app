import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SIcon, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import FormRegistroProyecto from './Components/FormRegistroProyecto';
import MDL from '../../MDL';
import { DinamicTable } from 'servisofts-table';
import SSocket from "servisofts-socket";
import FormRegistroCliente from './Components/FormRegistroCliente';
import PButtom from '../../Components/PButtom';
import FloatButtom from '../../Components/FloatButtom';
import Etiqueta from './Components/Etiqueta';
import Alert from 'servisofts-component/img/Alert';
import Config from '../../Config';


export default class lead extends Component {

    componentDidMount() {
        // MDL.crm.clienteProyecto.getAllPendientes().then(e => {
        //     console.log("ultimaaaa :", e);
        // }).catch(e => {
        //     console.error("Error fetching projects:", e);
        // })
    }


    mostrarCarrito(carrito = []) {
        if (!Array.isArray(carrito) || carrito.length === 0) {
            return null;
            // return <SText fontSize={9} color={STheme.color.gray}>Sin items</SText>;
        }

        return carrito.map((item, index) => {
            const nombre = item?.nombre ?? 'Producto';
            const cantidad = item?.cantidad ?? 0;
            const subtotal = item?.subtotal ?? 0;
            const precio = (cantidad > 0) ? (subtotal / cantidad).toFixed(2) : 0;

            return (
                <SView key={index} col={"xs-12"} row  >
                    <SView flex>
                        <SText fontSize={10} >{nombre} {precio}bs x {cantidad}</SText>
                    </SView>
                    <SView col={"xs-2"}>
                        <SText fontSize={10} >{subtotal}bs</SText>
                    </SView>
                </SView>
            );
        });
    }



    render() {
        return <SPage title={"Tipos leads registrados"} disableScroll>

            <DinamicTable
                key='index'

                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                selectType='single'
                textStyle={Config.table.textStyle()}
                language='es'
                ref={ref => this.DinamicTable = ref} loadData={async () => { return await MDL.crm.clienteProyecto.getAll(); }} onSelect={(e) => { console.log("Selected project:", e.row); }}
                loadInitialState={async () => {
                    return {
                        sorters: [
                            // { key: "fecha_on", order: "desc", type: "date" },
                            { key: "fecha_edit", order: "desc", type: "date" }
                        ]
                    }
                }}
            >
                <DinamicTable.Col key={"key"} label='ID' width={20} data={(e) => e.index + 1} />

                <DinamicTable.Col key={"-key"} label='Ver' width={40} data={(e) => e.row?.proyecto?.nombre}
                    customComponent={e => <SView row center card padding={2} onPress={() => { SNavigation.navigate("/crm/call", { key: e.row.key }) }}>
                        <SIcon name='Eyes' height={14} fill={STheme.color.lightGray} ></SIcon>
                    </SView>} />

                <DinamicTable.Col key={"proyecto_nombre"} label='Proyecto nombre' width={120} data={(e) => e.row?.proyecto?.nombre} />
                <DinamicTable.Col key={"proyecto_descripcion"} label='Proyecto descripcion' width={100} data={(e) => e.row?.proyecto?.descripcion} />

                <DinamicTable.Col key={"-keyCarro"} label='Carrito' width={180} data={(e) => e.row?.carrito}


                    customComponent={e => <SView row center padding={2}>

                        {this.mostrarCarrito(e.row.carrito)}
                    </SView>} />


                <DinamicTable.Col key={"state"} label='Leads' width={80} data={(e) => e.row.state}
                    customComponent={e => {
                        return <Etiqueta tipo_leads={e.row.state}></Etiqueta>
                    }}
                />
                <DinamicTable.Col key={"tipo_movimiento_lead"} label='Info' width={100} data={(e) => e.row.tipo_movimiento_lead?.titulo}
                />
                <DinamicTable.Col key={"fecha_on"} label='Fecha Registro' width={120} dataType='date' data={(e) => new SDate(e.row.fecha_on, "yyyy-MM-ddThh:mm:ss").date} dateFormat='yyyy-MM-dd hh:mm' />
                <DinamicTable.Col key={"fecha_edit"} label='Fecha Leads' width={120} dataType='date'
                    data={(e) => new SDate(e.row.fecha_edit ?? e.row.fecha_on, "yyyy-MM-ddThh:mm:ss").date}
                    dateFormat='yyyy-MM-dd hh:mm' />
                <DinamicTable.Col key={"nombres"} label='Nombre completo' width={140} data={(e) => e.row.cliente?.nombres} />
                <DinamicTable.Col key={"telefono"} label='Teléfono' width={120} data={(e) => e.row.cliente?.telefono} />
                <DinamicTable.Col key={"correo"} label='Correo' width={80} data={(e) => e.row.cliente?.correo} />
                <DinamicTable.Col key={"nit"} label='Nit' width={80} data={(e) => e.row.cliente?.nit} />
                <DinamicTable.Col key={"razon_social"} label='Razón social' width={80} data={(e) => e.row.cliente?.razon_social} />
            </DinamicTable>
        </SPage >
    }
}
