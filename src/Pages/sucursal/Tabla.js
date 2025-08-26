import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate, SButtom } from 'servisofts-component';
import * as XLSX from "xlsx";
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import SCharts from 'servisofts-charts';
import Usuarios from 'servisofts-component/img/Usuarios';
import { version } from 'process';
import MDL from '../../MDL';
import FloatButtom from '../../Components/FloatButtom';
import FloatMenu from '../../Components/FloatMenu';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import PopupCrearSucursal from '../empresa/config/Components/PopupCrearSucursal';


export default class Tabla extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }


    componentDidMount() {
        // navigator.geolocation.obtenerUbicacion(
        //     pos => console.log("Lat:", pos.coords.latitude, "Lng:", pos.coords.longitude),
        //     err => console.error(err)
        // )
    }


    obtenerUbicacion = () => {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
                    error => reject(error)
                );

                console.log("Lat:", pos.coords.latitude, "Lng:", pos.coords.longitude)

            } else {
                reject(new Error("Geolocalización no soportada"));
            }
        });
    }


    mostrarTabla() {
        return <DinamicTable
            key="tabla"
            {...Config.table.applyTheme()}
            ref={ref => this.DinamicTable = ref}
            center
            language="es"
            selectType="single"

            onSelect={(e) => {
                if (this.onSelect) {
                    this.onSelect(e.row)
                    SNavigation.goBack();
                    return;
                }

                FloatMenu.open({
                    e: e.evt,
                    label: "Sucursal: " + e.row.descripcion,
                    options: [
                        {
                            icon: <SIconApp name='Edit' />,
                            label: "Actualizar Sucursal",
                            onPress: async () => {

                                let ubicacion = { lat: null, lng: null };
                                try {
                                    ubicacion = await this.obtenerUbicacion();
                                } catch (error) {
                                    console.warn("No se pudo obtener la ubicación:", error.message);
                                }

                                console.log("traifo " + JSON.stringify(ubicacion))

                                const sucursal = {
                                    ...e.row,
                                    key_usuario: MDL.usuario.session?.key,
                                    lat: ubicacion?.lat,
                                    lng: ubicacion?.lng,
                                }

                                console.log("se esta editando sucursal " + JSON.stringify(sucursal))
                                PopupCrearSucursal.open({
                                    editObject: sucursal,
                                    key_empresa: e.row.key_empresa,
                                    onSuccess: (e) => {
                                        this.DinamicTable.loadData();
                                    }
                                })
                            }
                        },
                        {
                            icon: <SIconApp name='Delete' />,
                            label: "Eliminar Proveedor",
                            onPress: () => {
                                // SPopup.confirm({
                                //     title: "Eliminar Sucursal",
                                //     message: "¿Estás seguro de eliminar esta sucursal?",
                                //     onPress: () => {

                                //            const sucursal = {
                                //     ...e.row,
                                //     key_usuario: "1e4b2e09-94f1-4f9e-9d58-80d4d2f9ab3b",
                                //                                             data.estado = 0,

                                // }
                                //         SSocket.sendPromise({
                                //             service: "empresa",
                                //             component: "sucursal",
                                //             type:   "editar"  ,
                                //             key_usuario: MDL.usuario.login(),
                                //             data: sucursal
                                //         }).then(e => {
                                //             if (this.props.onSuccess) this.props.onSuccess(e)
                                //             console.log("response", e);
                                //         }).catch(e => {
                                //             console.error("response", e);
                                //         })

                                //     }
                                // })

                            }
                        }
                    ]
                })


            }}

            loadData={async () => {
                const sucursales = await MDL.empresa.getAllSucursales();
                const keysUsuarios = Object.values(sucursales).map(p => p.key_usuario).filter(Boolean);
                // Obtener usuarios desde el backend
                const usuarios = await MDL.usuario.getByKeys(keysUsuarios);
                // Adjuntar cada usuario a su proveedor correspondiente
                Object.values(sucursales).forEach(proveedor => {
                    proveedor.usuario = usuarios.find(u => u.key === proveedor.key_usuario);
                });
                console.log("todoo el data " + JSON.stringify(sucursales))
                return sucursales;
            }}

        >
            <DinamicTable.Col key="index" label="#" width={40} data={(e) => e.index + 1} />
            <DinamicTable.Col key={"foto"} label='Foto' data={(e) => e.row?.key} width={45}
                customComponent={e => <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                    <SImage src={SSocket.api.empresa + "sucursal/" + e.row?.key} style={{ resizeMode: "cover" }} /> </SView>} />
            <DinamicTable.Col key="descripcion" label="Descripción" width={90} data={(e) => e.row?.descripcion} />
            <DinamicTable.Col key={"fecha_on"} label="F.Registro" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />
            <DinamicTable.Col key="observacion" label="Observación" width={150} data={(e) => e.row?.observacion} />
            <DinamicTable.Col key="telefono" label="Teléfono" width={150} data={(e) => e.row?.telefono} />
            <DinamicTable.Col key="direccion" label="Dirección" width={100} data={(e) => e.row?.direccion} />
            <DinamicTable.Col key="municipio" label="Municipio" width={100} data={(e) => e.row?.municipio} />
            <DinamicTable.Col key="correo" label="Correo" width={100} data={(e) => e.row?.correo} />
            <DinamicTable.Col key="lat" label="Lat" width={40} data={(e) => e.row?.lat} />
            <DinamicTable.Col key="lng" label="Lng" width={40} data={(e) => e.row?.lng} />
            <DinamicTable.Col key="codigo_facturacion" label="Código facturación" width={130} data={(e) => e.row?.codigo_facturacion} />
            {/* <DinamicTable.Col key="punto_venta" label="punto_venta" width={130} data={(e) => e.row?.punto_venta} /> */}
            <DinamicTable.Col key="key_usuario" label="Usuario" width={80} data={(e) => e.row?.key_usuario} />
            <DinamicTable.Col key="key_empresa" label="Empresa" width={100} data={(e) => e.row?.key_empresa} />
        </DinamicTable>
    }

    render() {
        return (
            <SPage title="Gestión de Sucursales" disableScroll>
                {this.mostrarTabla()}
                <SHr height={20} />

                <FloatButtom onPress={() => {
                    PopupCrearSucursal.open({
                        key_empresa: MDL.empresa.select?.key,
                        onSuccess: (e) => {
                            this.DinamicTable.loadData();

                        }
                    })



                }} />
            </SPage>
        );
    }


}
