import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SIcon, SImage, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
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
                        <SText fontSize={12} >{nombre} {precio}bs x {cantidad}</SText>
                    </SView>
                    <SView col={"xs-2"}>
                        <SText fontSize={12} >{subtotal}bs</SText>
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
                center
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
                <DinamicTable.Col key={"key"} label='ID' width={28} textStyle={{
                    color: STheme.color.lightGray,
                    fontSize: 10
                }} data={(e) => e.index + 1} />

                <DinamicTable.Col key={"-key"} label='Ver' width={40} data={(e) => e.row?.proyecto?.nombre}
                    customComponent={e => <SView row center card padding={2} onPress={() => { SNavigation.navigate("/crm/call", { key: e.row.key }) }}>
                        <SIcon name='Eyes' height={14} fill={STheme.color.lightGray} ></SIcon>
                    </SView>} />
                <DinamicTable.Col key={"foto"} label='User'
                    data={(e) => e.row?.key_usuario_atiende}
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

                <DinamicTable.Col key={"state"} label='Leads' width={110}
                    data={(e) => e.row.state}
                    customComponent={e => {
                        return <SView col={"xs-12"} row center>
                            <Etiqueta size={10} tipo_leads={e.row.state} />
                        </SView>
                    }}
                />
                <DinamicTable.Col key={"codigo"} label='Codigo' width={50} center data={(e) => e.row?.codigo}
                    customComponent={e => <SView style={{ borderRadius: 100, borderWidth: 1, borderColor: STheme.color.card, padding: 3 }} center>
                        <SText bold fontSize={12}>{e.data}</SText>
                    </SView>} />
                <DinamicTable.Col key={"proyecto_nombre"} label='Proyecto' width={100} center data={(e) => e.row?.proyecto?.nombre} />
                <DinamicTable.Col key={"nombres"} label='Nombre completo' width={170} textStyle={{
                    fontWeight: "bold",
                    fontSize: 13,
                }} data={(e) => e.row.cliente?.nombres} />
                <DinamicTable.Col key={"telefono"} label='Teléfono' width={110} data={(e) => e.row.cliente?.telefono} />
                <DinamicTable.Col key={"departamento"} label='Departamento' width={110} data={(e) => e.row?.cliente?.departamento}

                    customComponent={e => {
                        if (!e.data) return null;
                        return <SView style={{ padding: 3, backgroundColor: STheme.colorFromText(e.data), borderRadius: 1, flexDirection: "row", borderRadius: 4, marginRight: 4, marginBottom: 4 }} center>
                            <SText style={{ maxWidth: 90 }} fontSize={10} numberOfLines={1} bold color={STheme.color.text}>{!e.data ? "" : e.data}</SText>
                        </SView>
                    }} />
                {/* <DinamicTable.Col key={"proyecto_descripcion"} label='Descripción' width={340} data={(e) => e.row?.proyecto?.descripcion} /> */}

                <DinamicTable.Col key={"-keyCarro"} label='Carrito' width={200}
                    data={(e) => e.row?.carrito}
                    customComponent={e => <SView row center >{this.mostrarCarrito(e.row.carrito)}</SView>}
                />



                {/* <DinamicTable.Col key={"tipo_movimiento_lead"} label='Info' width={100} data={(e) => e.row.tipo_movimiento_lead?.titulo}
                /> */}
                <DinamicTable.Col key={"fecha_on"} label='Fecha Registro' width={125} dataType='date' data={(e) => new SDate(e.row.fecha_on, "yyyy-MM-ddThh:mm:ss").date} dateFormat='yyyy-MM-dd hh:mm' />
                <DinamicTable.Col key={"fecha_edit"} label='Fecha Leads' width={125} dataType='date'
                    data={(e) => new SDate(e.row.fecha_edit ?? e.row.fecha_on, "yyyy-MM-ddThh:mm:ss").date}
                    dateFormat='yyyy-MM-dd hh:mm' />

                <DinamicTable.Col key={"correo"} label='Correo' width={120} data={(e) => e.row.cliente?.correo} />

                <DinamicTable.Col key={"nit"} label='Nit' width={120} data={(e) => e.row.cliente?.nit} />
                <DinamicTable.Col key={"razon_social"} label='Razón social' width={120} data={(e) => e.row.cliente?.razon_social} />
                <DinamicTable.Col key={"campana"} label='Campaña' width={100} center data={(e) => e.row?.campana?.nombre} />

            </DinamicTable>
        </SPage >
    }
}
