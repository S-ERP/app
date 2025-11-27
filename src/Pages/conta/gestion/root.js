import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate, SButtom } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../../MDL';
import FloatButtom from '../../../Components/FloatButtom';
import FloatMenu from '../../../Components/FloatMenu';
import SIconApp from '../../../Assets/SIconApp';
import Config from '../../../Config';
import Menu from 'servisofts-component/img/Menu';
// import FormDiario from './Components/FormDiario';
export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
            permiso_crear: true
        };
    }
    componentDidMount() {
        // this.loadInitialData();
        // MDL.rolesPermisos.getPermisoAsync({ url: "/empresa/moneda", permiso: "new" }).then(e => {
        //     this.setState({ permiso_crear: e });
        // }).catch(e => {

        // })
    }
    loadInitialData = async () => {
        // const api = await MDL.contabilidad.diario.getAll();
        const api = await MDL.contabilidad.gestion.getAll();
        return api;
    }
    mostrarTabla() {
        return <DinamicTable
            key="tabla"
            ref={ref => this.table = ref}
            {...Config.table.applyTheme()}
            center
            language="es"
            selectType="single"
            loadInitialState={async () => {
                return { sorters: [{ key: "fecha", order: "desc", type: "date" }] }
            }}

            loadData={this.loadInitialData.bind(this)}
            onSelect={(e) => {
                if (this.onSelect) {
                    this.onSelect(e.row);
                    console.log("select ", this.onSelect)

                    SNavigation.goBack();
                    return;
                }

                const MenuOptions = [];
                // if (MDL.rolesPermisos.getPermiso({ url: "/empresa/moneda", permiso: "edit" })) {
                //     MenuOptions.push({
                //         icon: <SIconApp name='Edit' />,
                //         label: "Editar Diario",
                //         onPress: () => {
                //             // FormDiario.open({
                //             //     editObject: e?.row,
                //             //     onSuccess: () => {
                //             //         this.table.loadData();
                //             //         this.forceUpdate();
                //             //     }
                //             // })
                //         }
                //     })
                // }

                (e.row.estado == 1) ? MenuOptions.push({
                    icon: <SIconApp name='Edit' />,
                    label: "Abrir gestión",
                    onPress: () => {

                        SPopup.confirm({
                            title: "¿Estás seguro de abrir esta gestión?",
                            message: "Antes de continuar, queremos informarte que al abrir esta gestión, la que está actualmente abierta se cerrará automáticamente. Sin embargo, no te preocupes, todos los comprobantes que generes a partir de ahora se registrarán en esta gestión que estás abriendo. ¿Deseas continuar?",
                            onPress: () => {
                                MDL.contabilidad.gestion.abrir(e.row.key).then(resp => {
                                    this.table.loadData();
                                    this.forceUpdate();
                                }).catch(e => {
                                    console.log(e)
                                })

                                // Model.gestion.Action.abrir({ key_gestion: this.data.key }).then(resp => {
                                //     Model.gestion.Action.CLEAR();
                                // }).catch(e => {
                                //     console.log(e)
                                // })
                            }
                        })

                    }
                }) :
                    MenuOptions.push({
                        icon: <SIconApp name='Edit' />,
                        label: "Cerrar gestión",
                        onPress: () => {
                            SPopup.confirm({
                                title: "¿Estás seguro de cerrar esta gestión?",
                                message: "Antes de continuar, queremos informarte que al cerrar esta gestión, se abrirá automáticamente la gestión más reciente disponible. En caso de que esta sea la gestión más reciente, se abrirá una nueva en el siguiente mes. No te preocupes, todos tus comprobantes y registros están seguros y disponibles en la gestión correspondiente. ¿Deseas continuar?",
                                onPress: () => {
                                    MDL.contabilidad.gestion.cerrar().then(resp => {
                                        this.table.loadData();
                                        this.forceUpdate();
                                    }).catch(e => {
                                        console.log(e)
                                    })
                                }
                            })
                        }
                    })


                // if (MDL.rolesPermisos.getPermiso({ url: "/empresa/moneda", permiso: "delete" })) {
                //     MenuOptions.push({
                //         icon: <SIconApp name='delete' />,
                //         label: "Eliminar Diario",
                //         onPress: () => {
                //             SPopup.confirm({
                //                 title: "Eliminar diario",
                //                 message: "¿Estás seguro de eliminar este diario?",
                //                 onPress: () => {
                //                     const data = {
                //                         ...e.row,
                //                         estado: 0,
                //                     }
                //                     MDL.contabilidad.diario.editar(data).then(() => {
                //                         this.table.loadData();
                //                         this.forceUpdate();
                //                     }
                //                     ).catch(err => {
                //                         console.error("response", err);
                //                     })
                //                 }
                //             })
                //         }
                //     })
                // }

                FloatMenu.open({
                    e: e.evt,
                    label: "Gestión: " + new SDate(e.row?.fecha, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM"),
                    options: MenuOptions
                })
            }
            }


        >
            <DinamicTable.Col key="index" label="#" textStyle={{
                color: STheme.color.lightGray
            }} width={40} data={(e) => e.index + 1} />
            <DinamicTable.Col key={"-keyprofile"} label='Ver' width={40} data={(e) => e.row?.key}
                customComponent={e => <>
                    <SView row center card padding={2} onPress={() => { SNavigation.replace("/venta/profile2", { pk: e.row.key }) }}>
                        <SIconApp name='Eyes' height={14} fill={STheme.color.lightGray} ></SIconApp>
                    </SView>
                </>} />
            <DinamicTable.Col key="fecha" label="Año" width={120} dataType="date" data={(e) => new SDate(e.row?.fecha, "yyyy-MM-ddThh:mm:ss").date}
                dateFormat="yyyy-MM" textStyle={{ fontSize: 15, alignContent: "center", alignItems: "center" }}
                customComponent={e => <SText color={(e.row.estado == 2) ? STheme.color.success : STheme.color.gray}>{new SDate(e.row?.fecha, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM")}</SText>}
            />
            <DinamicTable.Col
                key={"fecha_on"} label="F.Registro" width={120} dataType="date"
                data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date}
                textStyle={{ fontSize: 10, color: STheme.color.lightGray }} dateFormat="yyyy-MM-dd hh:mm"
            />

        </DinamicTable>
    }
    render() {
        console.log("seleccion: ", this.onSelect)
        return (
            <SPage title="Gestiones" disableScroll>
                {this.mostrarTabla()}
                {this.state.permiso_crear && <FloatButtom onPress={() => {
                    SPopup.confirm({
                        title: "¿Estás seguro de cerrar esta gestión?",
                        message: "Antes de continuar, queremos informarte que al cerrar esta gestión, se abrirá automáticamente la gestión más reciente disponible. En caso de que esta sea la gestión más reciente, se abrirá una nueva en el siguiente mes. No te preocupes, todos tus comprobantes y registros están seguros y disponibles en la gestión correspondiente. ¿Deseas continuar?",
                        onPress: () => {
                            MDL.contabilidad.gestion.cerrar().then(resp => {
                                this.table.loadData();
                                this.forceUpdate();
                            }).catch(e => {
                                console.log(e)
                            })
                        }
                    })
                }} />}
            </SPage>
        );
    }
}
