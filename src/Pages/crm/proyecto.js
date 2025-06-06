import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SIcon, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import FormRegistroProyecto from './Components/FormRegistroProyecto';
import MDL from '../../MDL';
import { DinamicTable } from 'servisofts-table';
import SSocket from "servisofts-socket";
import FloatButtom from '../../Components/FloatButtom';
import FloatMenu from '../../Components/FloatMenu';
import SMD from '../../SMD';
import FormRegistroCampana from './Components/FormRegistroCampana';
import PopupRellamada from './Components/PopupRellamada';
import PopupRazon from './Components/PopupRazon';
import Model from '../../Model';
import Config from '../../Config';

export default class proyecto extends Component {



    render() {
        return <SPage title={"Proyecto"} icon={<SIcon name='empresa' fill={STheme.color.text} />} disableScroll>

            {/* <SText onPress={() => {
                                PopupRellamada.open(({
                                        onRegister: (e) => {
                                        }
                                }))
                        }}>{"Popup rellamada"}</SText>
                        <SText onPress={() => {
                                PopupRazon.open(({
                                        onRegister: (e) => {
                                        }
                                }))
                        }}>{"Popup razón"}</SText> */}

            <DinamicTable
                ref={ref => this.DinamicTable = ref}
                loadData={async () => {
                    const proyectos = await MDL.crm.proyecto.getAll();
                    const campanas = await MDL.crm.campana.getAll();
                    proyectos.forEach(proyecto => {
                        proyecto.campanas = [];
                        Object.keys(campanas).forEach(key => {
                            if (campanas[key].key_proyecto == proyecto.key) {
                                proyecto.campanas.push(campanas[key]);
                            }
                        });
                    })



                    const productos = await MDL.crm.proyectoProducto.getAllConProductos();
                    proyectos.forEach(proyecto => {
                        proyecto.productos = [];
                        Object.keys(productos).forEach(key => {
                            if (productos[key].key_proyecto == proyecto.key) {
                                proyecto.productos.push(productos[key]);
                            }
                        });
                    });



                    return proyectos;
                }}
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                selectType='single'
                language='es'
                onSelect={(e) => {
                    console.log("Selected project:", e.row);
                    FloatMenu.open({
                        e: e.evt,
                        label: e.row.nombre,

                        options: [
                            {
                                label: "Productos",
                                onPress: () => {
                                    SNavigation.navigate("/productos/producto", {
                                        onSelect: (producto) => {
                                            console.log("Producto seleccionado:", producto);
                                            MDL.crm.proyectoProducto.registrar({
                                                key_producto: producto.key,
                                                key_proyecto: e.row.key,
                                            })
                                            // MDL.crm.x`
                                            // SSocket.sendPromise({
                                            //         service: "crm",
                                            //         component: "producto",
                                            //         type: "editar",
                                            //         data: { ...producto, key_proyecto: e.row.key }
                                            // }).then(e => {
                                            //         console.log("Producto actualizado:", e);
                                            //         this.DinamicTable.loadData();
                                            // }).catch(error => {
                                            //         console.error("Error al actualizar producto:", error);
                                            // });
                                        }
                                    })
                                },
                                icon: <SIcon name="producto" fill={STheme.color.text} />,
                            },
                            {
                                label: "Campañas publicitarias",
                                onPress: () => {
                                    FormRegistroCampana.open({
                                        proyecto: e.row,
                                        onRegister: (e) => {
                                            this.DinamicTable.loadData();
                                        }
                                    })
                                },
                                icon: <SIcon name="campana" fill={STheme.color.text} />,
                            },
                            {
                                label: "Editar proyecto",
                                onPress: () => {
                                    FormRegistroProyecto.open(({
                                        defaultData: e.row, onActualizar: (nuevoDato) => {
                                            this.DinamicTable.loadData();
                                            console.log("Proyecto actualizado:", nuevoDato);
                                        }
                                    }))
                                },
                                icon: <SIcon name="Edit" fill={STheme.color.text} />,
                            },
                            {
                                label: "Eliminar proyecto",
                                icon: <SIcon name="Delete" fill={STheme.color.text} />,
                                onPress: () => {
                                    SPopup.confirm({
                                        title: "Eliminar Proyecto",
                                        message: "¿Estas seguro de eliminar el proyecto?",
                                        onPress: () => {
                                            SSocket.sendPromise({
                                                service: "crm",
                                                component: "proyecto",
                                                type: "editar",
                                                data: { ...e.row, estado: 0 }
                                            }).then(e => {
                                                console.error("❌ Error al recargar proyectos:", e);
                                                SNotification.send({ key: "eliminar", title: "eliminado", type: "loading", time: 1000, body: e.error, color: STheme.color.error, })
                                                this.DinamicTable.loadData();
                                            })
                                        }
                                    })

                                }
                            },


                        ]
                    })

                }}
            >

                <DinamicTable.Col key={"key"} label='Key'
                    width={60}
                    cellStyle={{
                        justifyContent: "flex-start",

                    }}
                    textStyle={{
                        fontSize: 8,
                        color: STheme.color.lightGray
                    }}
                    data={(e) => {
                        return e.row.key
                    }} />
                <DinamicTable.Col key={"codigo"} label='Código'
                    width={60}
                    cellStyle={{
                        justifyContent: "flex-start"
                    }}
                    data={(e) => {
                        return e.row.codigo
                    }} />
                <DinamicTable.Col key={"nombre"} label='Nombre'
                    width={120}
                    cellStyle={{
                        justifyContent: "flex-start"
                    }}
                    data={(e) => {
                        return e.row.nombre
                    }} />
                <DinamicTable.Col key={"descripcion"} label='Descripción'

                    width={150}
                    cellStyle={{
                        justifyContent: "flex-start"
                    }}
                    data={(e) => {
                        return e.row.descripcion
                    }}
                    customComponent={e => {
                        return <SView col={"xs-12"} style={{ overflow: "hidden", paddingHorizontal: 8 }} >
                            <ScrollView>
                                <SText fontSize={12}>{e.row.descripcion} </SText>
                            </ScrollView>
                        </SView>
                    }}
                />
                <DinamicTable.Col key={"campanas"} label='Campañas'
                    width={250}
                    data={(e) => {
                        return e.row.campanas.map(c => c.nombre).join(", ")
                    }}
                    cellStyle={{
                        justifyContent: "flex-start"
                    }}
                    customComponent={e => {
                        return <SView col={"xs-12"} row >
                            {e.row.campanas.map((campana, index) => {
                                return <SView key={index} style={{ padding: 4 }}
                                    onPress={() => {
                                        // Acción al seleccionar la campaña
                                        // if (campana && campana.key) {
                                        //         SNavigation.navigate("/crm/perfilcampana", { key: campana.key });
                                        // }
                                        FormRegistroCampana.open({
                                            defaultData: campana,
                                            proyecto: e.row,
                                            onActualizar: (e) => {
                                                this.DinamicTable.loadData();
                                            }
                                        })
                                    }}>
                                    <SText card padding={4} style={{ maxWidth: 200 }} numberOfLines={1}>{campana.nombre}</SText>
                                </SView>
                            })}
                        </SView>
                    }}
                />
                <DinamicTable.Col key={"productos"} label='Productos'
                    width={250}
                    data={(e) => {
                        return e.row.productos.map(c => c.key_producto).join(", ")
                    }}
                    cellStyle={{
                        justifyContent: "flex-start"
                    }}
                    customComponent={e => {
                        return <SView col={"xs-12"} row >
                            {e.row.productos.map((prd, index) => {
                                return <SView key={index} style={{ padding: 4 }} onPress={() => {
                                    // FormRegistroCampana.open({
                                    //         defaultData: campana,
                                    //         proyecto: e.row,
                                    //         onActualizar: (e) => {
                                    //                 this.DinamicTable.loadData();
                                    //         }
                                    // })
                                }}>
                                    <SText card padding={4} style={{ maxWidth: 200 }} numberOfLines={1}>{prd?.producto?.nombre} x Bs.{prd?.producto?.precio ?? 0}</SText>
                                </SView>
                            })}
                        </SView>
                    }}
                />
                <DinamicTable.Col key={"guion"} label='Guión'
                    width={350}
                    wrap={true}
                    data={(e) => {
                        return e.row.guion
                    }}
                    cellStyle={{
                        padding: 0,
                    }}
                    customComponent={e => {
                        return <SView col={"xs-12"} style={{ maxHeight: 150, overflow: "hidden" }} >
                            <ScrollView>
                                <SMD space={1} fontSize={9} >{e.data}</SMD>
                            </ScrollView>
                        </SView>
                    }}
                />

                {/* <DinamicTable.Col key={"editar"} label='Editar' width={100} data={(e) => ""}
                                        customComponent={e => <SView row card padding={2} onPress={() => {
                                                FormRegistroProyecto.open(({
                                                        defaultData: e.row, onActualizar: (nuevoDato) => {
                                                                this.DinamicTable.loadData();
                                                                console.log("Proyecto actualizado:", nuevoDato);
                                                        }
                                                }))
                                        }}>
                                                <SIcon name='Edit' width={18} />
                                                <SView width={4} />
                                                <SText center color={STheme.color.green} >{"Actualizar"}</SText>
                                        </SView>}
                                />
                                <DinamicTable.Col key={"eliminar"} label='Delete'
                                        width={100}
                                        data={(e) => ""}
                                        customComponent={e => <SView row card padding={2} onPress={() => {
                                                console.log("Delete project:", e.row);
                                                SSocket.sendPromise({
                                                        service: "crm",
                                                        component: "proyecto",
                                                        type: "editar",
                                                        data: { ...e.row, estado: 0 }
                                                }).then(e => {
                                                        console.error("❌ Error al recargar proyectos:", e);
                                                        SNotification.send({ key: "eliminar", title: "eliminado", type: "loading", time: 1000, body: e.error, color: STheme.color.error, })
                                                        this.DinamicTable.loadData();
                                                })
                                                alert("✅ Eliminación exitosa del proyecto.");
                                        }}>
                                                <SIcon name='Delete' width={18} />
                                                <SView width={4} />
                                                <SText center color={STheme.color.danger} > {"Eliminar"}</SText>
                                        </SView>} */}
            </DinamicTable>
            <FloatButtom onPress={() => {
                FormRegistroProyecto.open(({
                    onRegister: (e) => {
                        this.DinamicTable.loadData();
                    }
                }))
            }} />
        </SPage >
    }
}
