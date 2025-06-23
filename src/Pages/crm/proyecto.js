import React, { Component } from "react";
import { View, Text, ScrollView } from "react-native";
import {
    SIcon, SImage, SNavigation, SNotification, SPage, SPopup, SText, STheme,
    SView,
} from "servisofts-component";
import FormRegistroProyecto from "./Components/FormRegistroProyecto";
import MDL from "../../MDL";
import { DinamicTable } from "servisofts-table";
import SSocket from "servisofts-socket";
import FloatButtom from "../../Components/FloatButtom";
import FloatMenu from "../../Components/FloatMenu";
import SMD from "../../SMD";
import FormRegistroCampana from "./Components/FormRegistroCampana";
import PopupRellamada from "./Components/PopupRellamada";
import PopupRazon from "./Components/PopupRazon";
import Model from "../../Model";
import Config from "../../Config";
import PopupDispositivo from "./Components/PopupDispositivo";
import { any } from "three/examples/jsm/nodes/Nodes";
import FileChooser from "../../Components/SUpload/FileChooser";

export default class proyecto extends Component {
    constructor(props) {
        super(props);
        this.state = {
            descripcionesDispositivo: {}, // <--- clave: key_device, valor: descripción
        };
    }

    componentDidMount() {
        MDL.whatsapp.device.getAll().then((e) => {
            this.setState({ devices: e });
        }).catch(e => {
            console.log("Dispositivos cargados:", e);
        })
    }

    async cargarDescripcionDispositivo(key) {
        if (!key) return;

        // Evitar repetir si ya está cargado
        if (this.state.descripcionesDispositivo[key]) return;

        try {
            const devices = await MDL.whatsapp.device.getAll();
            const dispositivo = devices.find((d) => d?.key === key);
            const descripcion = dispositivo?.descripcion ?? "No encontrado";

            this.setState((prevState) => ({
                descripcionesDispositivo: {
                    ...prevState.descripcionesDispositivo,
                    [key]: "dispositivo: " + descripcion,
                },
            }));
        } catch (e) {
            console.error("Error al obtener dispositivo:", e);
            this.setState((prevState) => ({
                descripcionesDispositivo: {
                    ...prevState.descripcionesDispositivo,
                    [key]: "Error al cargar dispositivo",
                },
            }));
        }
    }

    render() {
        return (
            <SPage
                title={"Proyecto"}
                icon={<SIcon name="empresa" fill={STheme.color.text} />}
                disableScroll
            >
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
                    ref={(ref) => (this.DinamicTable = ref)}
                    loadData={async () => {
                        const proyectos = await MDL.crm.proyecto.getAll();
                        const campanas = await MDL.crm.campana.getAll();
                        proyectos.forEach((proyecto) => {
                            proyecto.campanas = [];
                            Object.keys(campanas).forEach((key) => {
                                if (campanas[key].key_proyecto == proyecto.key) {
                                    proyecto.campanas.push(campanas[key]);
                                }
                            });
                        });

                        const productos =
                            await MDL.crm.proyectoProducto.getAllConProductos();
                        proyectos.forEach((proyecto) => {
                            proyecto.productos = [];
                            Object.keys(productos).forEach((key) => {
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
                    selectType="single"
                    language="es"
                    onSelect={(e) => {
                        console.log("Selected project:", e.row);
                        FloatMenu.open({
                            e: e.evt,
                            label: e.row.nombre,

                            options: [
                                {
                                    label: "Agregar Productos",
                                    onPress: () => {

                                        // aqui estubo alvaro
                                        SNavigation.navigate("/restaurante/producto", {
                                            onSelect: (producto) => {
                                                MDL.crm.proyectoProducto.registrar({
                                                    key_producto: producto.key,
                                                    key_proyecto: e.row.key,
                                                });
                                                console.log("Producto seleccionado:", producto);
                                            }
                                        });

                                        // SNavigation.navigate("/productos/producto", {
                                        //     onSelect: (producto) => {
                                        //         console.log("Producto seleccionado:", producto);
                                        //         MDL.crm.proyectoProducto.registrar({
                                        //             key_producto: producto.key,
                                        //             key_proyecto: e.row.key,
                                        //         });
                                        //     },
                                        // });

                                        SNavigation.navigate("/productos/producto", {
                                            onSelect: (producto) => {
                                                console.log("Producto seleccionado:", producto);
                                                MDL.crm.proyectoProducto.registrar({
                                                    key_producto: producto.key,
                                                    key_proyecto: e.row.key,
                                                });
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
                                            },
                                        });
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
                                            },
                                        });
                                    },
                                    icon: <SIcon name="campana" fill={STheme.color.text} />,
                                },
                                {
                                    label: "Editar proyecto",
                                    onPress: () => {
                                        FormRegistroProyecto.open({
                                            defaultData: e.row,
                                            onActualizar: (nuevoDato) => {
                                                this.DinamicTable.loadData();
                                                console.log("Proyecto actualizado:", nuevoDato);
                                            },
                                        });
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
                                                    data: { ...e.row, estado: 0 },
                                                }).then((e) => {
                                                    console.error("❌ Error al recargar proyectos:", e);
                                                    SNotification.send({
                                                        key: "eliminar",
                                                        title: "eliminado",
                                                        type: "loading",
                                                        time: 1000,
                                                        body: e.error,
                                                        color: STheme.color.error,
                                                    });
                                                    this.DinamicTable.loadData();
                                                });
                                            },
                                        });
                                    },
                                },
                            ],
                        });
                    }}
                >
                    <DinamicTable.Col
                        key={"key"}
                        label="ID"
                        cellStyle={{
                            justifyContent: "flex-start",
                        }}
                        width={30}
                        data={(e) => e.index + 1}
                    />

                    {/* <DinamicTable.Col key={"key"} label='Key'
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
                    }} /> */}
                    <DinamicTable.Col
                        key={"codigo"}
                        label="Código"
                        width={60}
                        cellStyle={{
                            justifyContent: "flex-start",
                        }}
                        data={(e) => {
                            return e.row.codigo;
                        }}
                    />
                    <DinamicTable.Col
                        key={"nombre"}
                        label="Nombre"
                        width={170}
                        cellStyle={{
                            justifyContent: "flex-start",
                        }}
                        data={(e) => {
                            return e.row.nombre;
                        }}
                    />
                    <DinamicTable.Col
                        key={"descripcion"}
                        label="Descripción"
                        width={200}
                        cellStyle={{
                            justifyContent: "flex-start",
                        }}
                        data={(e) => {
                            return e.row.descripcion;
                        }}
                        customComponent={(e) => {
                            return (
                                <SView
                                    col={"xs-12"}
                                    style={{ overflow: "hidden", paddingHorizontal: 8 }}
                                >
                                    <ScrollView>
                                        <SText fontSize={12}>{e.row.descripcion} </SText>
                                    </ScrollView>
                                </SView>
                            );
                        }}
                    />
                    <DinamicTable.Col
                        key={"campanas"}
                        label="Campañas"
                        width={250}
                        data={(e) => {
                            return e.row.campanas.map((c) => c.nombre).join(", ");
                        }}
                        cellStyle={{
                            justifyContent: "flex-start",
                        }}
                        customComponent={(e) => {
                            return (
                                <SView col={"xs-12"} row>
                                    {e.row.campanas.map((campana, index) => {
                                        return (
                                            <SView
                                                key={index}
                                                style={{ padding: 4 }}
                                                onPress={(f) => {
                                                    // FormRegistroCampana.open({
                                                    //     defaultData: campana,
                                                    //     proyecto: e.row,
                                                    //     onActualizar: (e) => {
                                                    //         this.DinamicTable.loadData();
                                                    //     }
                                                    // })

                                                    FloatMenu.open({
                                                        e: f,
                                                        label: campana.nombre,
                                                        options: [
                                                            {
                                                                label: "Editar Campaña",
                                                                onPress: () => {
                                                                    FormRegistroCampana.open({
                                                                        defaultData: campana,
                                                                        proyecto: e.row,
                                                                        onActualizar: (e) => {
                                                                            this.DinamicTable.loadData();
                                                                        },
                                                                    });
                                                                },
                                                                icon: (
                                                                    <SIcon name="Edit" fill={STheme.color.text} />
                                                                ),
                                                            },
                                                            {
                                                                label: "Eliminar Campaña",
                                                                onPress: () => {
                                                                    SPopup.confirm({
                                                                        title: "Eliminar Campaña",
                                                                        message:
                                                                            "¿Estas seguro de eliminar la campaña?",
                                                                        onPress: () => {
                                                                            SSocket.sendPromise({
                                                                                service: "crm",
                                                                                component: "campana",
                                                                                type: "editar",
                                                                                data: { ...campana, estado: 0 },
                                                                            }).then((e) => {
                                                                                console.error(
                                                                                    "❌ Error al recargar campañas:",
                                                                                    e
                                                                                );
                                                                                SNotification.send({
                                                                                    key: "eliminar",
                                                                                    title: "eliminado",
                                                                                    type: "loading",
                                                                                    time: 1000,
                                                                                    body: e.error,
                                                                                    color: STheme.color.error,
                                                                                });
                                                                                this.DinamicTable.loadData();
                                                                            });
                                                                        },
                                                                    });
                                                                },
                                                                icon: (
                                                                    <SIcon
                                                                        name="Delete"
                                                                        fill={STheme.color.text}
                                                                    />
                                                                ),
                                                            },
                                                            {
                                                                label: "importar/subir leads",
                                                                onPress: () => {
                                                                    SNavigation.navigate("/crm/proyectoImportarExcel", {
                                                                        key_campana: campana.key, key_proyecto: e.row.key,
                                                                    });
                                                                },
                                                                icon: (
                                                                    <SIcon name="Edit" fill={STheme.color.text} />
                                                                ),
                                                            },
                                                            {
                                                                label: "subir wasap",
                                                                onPress: () => {
                                                                    SNavigation.navigate("/crm/proyectoImportarWasap", {
                                                                        key_campana: campana.key, key_proyecto: e.row.key,
                                                                    });
                                                                },
                                                                icon: (
                                                                    <SIcon name="Edit" fill={STheme.color.text} />
                                                                ),
                                                            },
                                                        ],
                                                    });
                                                }}
                                            >
                                                <SText
                                                    card
                                                    padding={4}
                                                    style={{ maxWidth: 200 }}
                                                    numberOfLines={1}
                                                >
                                                    {campana.nombre}
                                                </SText>
                                            </SView>
                                        );
                                    })}
                                </SView>
                            );
                        }}
                    />
                    <DinamicTable.Col
                        key={"productos"}
                        label="Productos"
                        width={250}
                        data={(e) => {
                            return e.row.productos.map((c) => c.key_producto).join(", ");
                        }}
                        cellStyle={{
                            justifyContent: "flex-start",
                        }}
                        customComponent={(e) => {
                            return (
                                <SView col={"xs-12"} row>
                                    {e.row.productos.map((prd, index) => {
                                        return (
                                            <SView
                                                key={index}
                                                style={{ padding: 4 }}
                                                onPress={(f) => {
                                                    FloatMenu.open({
                                                        e: f,
                                                        label: prd?.producto?.nombre,
                                                        options: [
                                                            {
                                                                label: "Editar Producto",
                                                                onPress: () => {
                                                                    SNavigation.navigate(
                                                                        "/restaurante/producto/edit",
                                                                        { pk: prd?.producto?.key }
                                                                    );
                                                                },
                                                                icon: (
                                                                    <SIcon name="Edit" fill={STheme.color.text} />
                                                                ),
                                                            },
                                                            {
                                                                label: "Eliminar Producto",
                                                                onPress: () => {
                                                                    console.log(
                                                                        "Eliminar Producto:",
                                                                        prd?.producto?.key
                                                                    );
                                                                    SPopup.confirm({
                                                                        title: "Eliminar Producto",
                                                                        message:
                                                                            "¿Estás seguro de eliminar el producto?",
                                                                        onPress: () => {
                                                                            MDL.crm.proyectoProducto
                                                                                .eliminar({ ...prd, estado: 0 })
                                                                                .then((e) => {
                                                                                    console.error(
                                                                                        "Producto eliminado:",
                                                                                        e
                                                                                    );
                                                                                    SNotification.send({
                                                                                        key: "eliminar",
                                                                                        title: "eliminado",
                                                                                        type: "loading",
                                                                                        time: 1000,
                                                                                        body: e.error,
                                                                                        color: STheme.color.error,
                                                                                    });
                                                                                    this.DinamicTable.loadData();
                                                                                })
                                                                                .catch((error) => {
                                                                                    console.error(
                                                                                        "Error al eliminar producto:",
                                                                                        error
                                                                                    );
                                                                                    SNotification.send({
                                                                                        key: "eliminar",
                                                                                        title: "error",
                                                                                        type: "danger",
                                                                                        time: 1000,
                                                                                        body: error.message,
                                                                                        color: STheme.color.error,
                                                                                    });
                                                                                });
                                                                        },
                                                                    });
                                                                },
                                                                icon: (
                                                                    <SIcon
                                                                        name="Delete"
                                                                        fill={STheme.color.text}
                                                                    />
                                                                ),
                                                            },
                                                        ],
                                                    });
                                                }}
                                                row
                                                center
                                            >
                                                <SView width={20} height={20} style={{ borderRadius: 4, overflow: "hidden" ,overflow:"hidden" }} card>
                                                    <SImage src={SSocket.api.inventario + "producto/" + prd.key_producto} />
                                                </SView>
                                                <SText
                                                    card
                                                    padding={4}
                                                    style={{ maxWidth: 200 }}
                                                    numberOfLines={1}
                                                >
                                                    {prd?.producto?.nombre}  Bs.
                                                    {prd?.producto?.precio ?? 0}
                                                </SText>
                                            </SView>
                                        );
                                    })}
                                </SView>
                            );
                        }}
                    />
                    <DinamicTable.Col
                        key={"guion"}
                        label="Guión"
                        width={350}
                        wrap={true}
                        data={(e) => {
                            return e.row.guion;
                        }}
                        cellStyle={{
                            padding: 0,
                        }}
                        customComponent={(e) => {
                            return (
                                <SView
                                    col={"xs-12"}
                                    style={{ maxHeight: 155, overflow: "hidden" }}
                                >
                                    <ScrollView>
                                        <SMD space={1} fontSize={9}>
                                            {e.data}
                                        </SMD>
                                    </ScrollView>
                                </SView>
                            );
                        }}
                    />
                    <DinamicTable.Col
                        key={"key_whatsapp_device"}
                        label="Dispositivo WhatsApp"
                        width={240}
                        wrap={true}
                        data={(e) => {
                            return e.row.key_whatsapp_device;
                        }}
                        cellStyle={{
                            padding: 0,
                        }}
                        customComponent={(ex) => {
                            const device = (this.state.devices ?? []).find(
                                (a) => a.key == ex?.row?.key_whatsapp_device
                            );
                            return (
                                <SView
                                    col={"xs-12"} center
                                    style={{ maxHeight: 155, overflow: "hidden" }}
                                >
                                    <SView
                                        width={120}
                                        padding={4}
                                        row
                                        center
                                        backgroundColor="white"
                                        style={{ borderRadius: 12 }}
                                        onPress={() => {
                                            PopupDispositivo.open({
                                                key_whatsapp_device: ex?.row?.key_whatsapp_device,
                                                onRegister: (e) => {
                                                    MDL.crm.proyecto
                                                        .editar({
                                                            key: ex.row.key,
                                                            key_whatsapp_device: e.selectedOption.key,
                                                        })
                                                        .then((e) => {
                                                            this.DinamicTable.loadData();
                                                        });
                                                },
                                            });
                                        }}
                                    >

                                        <SView width={8} />

                                        <SIcon name="add1" fill={STheme.color.black} width={14} />
                                        <SView width={8} />
                                        <SText center color={STheme.color.black}>
                                            Add Device
                                        </SText>
                                        <SView width={8} />

                                    </SView>


                                    {device?.descripcion ?

                                        <SView center card col={"xs-8"} style={{ maxHeight: 155, overflow: "hidden", marginTop: 16 }}>
                                            <SText>Dispositivo vinculado:</SText>
                                            <SText> <SView width="80" backgroundColor="red" borderRadius={50} />   {device?.descripcion}</SText>
                                        </SView>
                                        : ""}

                                </SView>
                            );
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
                <FloatButtom
                    onPress={() => {
                        FormRegistroProyecto.open({
                            onRegister: (e) => {
                                this.DinamicTable.loadData();
                            },
                        });
                    }}
                />
            </SPage >
        );
    }
}
