import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate, SButtom } from 'servisofts-component';
import * as XLSX from "xlsx";
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';
import FloatButtom from '../../Components/FloatButtom';
import FloatMenu from '../../Components/FloatMenu';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import PopupCrearSucursal from '../empresa/config/Components/PopupCrearSucursal';


export default class tabla extends Component {

    constructor(props) {
        super(props);
        this.state = {};
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
                            label: "Editar Sucursal",
                            onPress: () => {
                                // let ubicacion = { lat: null, lng: null };
                                // try {
                                //     ubicacion = await this.obtenerUbicacion();
                                // } catch (error) {
                                //     console.warn("No se pudo obtener la ubicación:", error.message);
                                // }
                                const sucursal = {
                                    ...e.row,
                                    key_usuario: MDL.usuario.session?.key,
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
                            label: "Eliminar Sucursal",
                            onPress: () => {
                                SPopup.confirm({
                                    title: "Eliminar Sucursal",
                                    message: "¿Estás seguro de eliminar esta sucursal?",
                                    onPress: () => {
                                        const sucursal_ = {
                                            ...e.row,
                                            estado: 0,
                                        }
                                        SSocket.sendPromise({
                                            service: "empresa",
                                            component: "sucursal",
                                            type: "editar",
                                            data: sucursal_,
                                            key_usuario: MDL.usuario.session?.key,
                                        }).then(e => {
                                            this.DinamicTable.loadData();
                                        }).catch(e => {
                                            console.error("response", e);
                                        })

                                    }
                                })

                            }
                        }
                    ]
                })


            }}

            // loadInitialState={async () => {
            //     return { sorters: [{ key: "fecha_on", order: "asc", type: "date" }] }
            // }}

            loadData={async () => {
                const api = await MDL.empresa.getAllSucursales();

                const empresa = MDL.empresa.select?.razon_social;
                const keysUsuarios = Object.values(api).map(p => p.key_usuario).filter(Boolean);
                const usuarios = await MDL.usuario.getByKeys(keysUsuarios);
                Object.values(api).forEach(itm => {
                    itm.usuario = usuarios.find(u => u.key === itm.key_usuario);
                    itm.razon_social = empresa
                });

                return api;
            }}

        >
            <DinamicTable.Col key="index" label="#" width={40} data={(e) => e.index + 1} />

            <DinamicTable.Col key="sucursal" label="Sucursal" width={200} data={(e) => e.row?.key ?? ""}
                customComponent={e => <>
                    {(e.row?.key) ?
                        <SView col={"xs-12"} row  >
                            <SView style={{ width: 28 }}>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key}?date=${new Date().getTime()}`} style={{ resizeMode: "cover" }} />
                                </SView>
                            </SView>
                            <SView width={5} />
                            <SText flex color={STheme.color.text} numberOfLines={e.colData.wrap ? 0 : 1}>{e.row?.descripcion}</SText>
                        </SView> : null}
                </>}
            />


            <DinamicTable.Col key="observacion" label="Observación" width={120} data={(e) => e.row?.observacion} />

            {/* necesito que se actualice el componente DinamicTable que lleve el codigo para que se sleeciono por defecto, que on este el de oblivia por defecto  */}

            <DinamicTable.Col key="telefono" label="Teléfono" width={150} data={(e) => e.row?.telefono} />
            <DinamicTable.Col key="direccion" label="Dirección" width={200} data={(e) => e.row?.direccion} />
            <DinamicTable.Col key="municipio" label="Municipio" width={100} data={(e) => e.row?.municipio} />
            <DinamicTable.Col key="correo" label="Correo" width={100} data={(e) => e.row?.correo} />
            <DinamicTable.Col key="lat" label="Lat" width={40} data={(e) => e.row?.lat} />
            <DinamicTable.Col key="lng" label="Lng" width={40} data={(e) => e.row?.lng} />
            <DinamicTable.Col key="codigo_facturacion" label="Código facturación" width={130} data={(e) => e.row?.codigo_facturacion} />
            {/* <DinamicTable.Col key="punto_venta" label="punto_venta" width={130} data={(e) => e.row?.punto_venta} /> */}


            <DinamicTable.Col key={"fecha_on"} label="F.Registro" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />
            <DinamicTable.Col key="admin" label="Admin" width={120} data={(e) => e.row?.usuario?.Nombres ?? ""}
                customComponent={e => <>
                    {(e.row?.key_usuario) ?
                        <SView col={"xs-12"} center row  >
                            <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                <SImage src={`${SSocket.api.root}usuario/${e.row?.key_usuario}`} style={{ resizeMode: "cover" }} />
                            </SView>
                            <SView width={5} />
                            <SText color={STheme.color.text}>{e.row?.usuario?.Nombres}</SText>
                        </SView> : null}
                </>}
            />

            {/* <DinamicTable.Col key="empresa" label="Empresa" width={180} data={(e) => e.row?.key_empresa ?? ""}
                customComponent={e => <>
                    {(e.row?.key_empresa) ?
                        <SView col={"xs-12"} row  >
                            <SView style={{ width: 28 }}>

                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.empresa}empresa/${e.row?.key_empresa}`} style={{ resizeMode: "cover" }} />
                                </SView>
                            </SView>
                            <SView width={5} />
                            <SText center color={STheme.color.text} style={{ fontSize: 15, textTransform: "capitalize" }} >{e.row?.razon_social}</SText>
                        </SView> : null}
                </>}
            /> */}

        </DinamicTable>
    }

    render() {
        return (
            <SPage title="Gestión de Sucursales" disableScroll>
                {this.mostrarTabla()}
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
