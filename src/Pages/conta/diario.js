import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate, SButtom } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';
import FloatButtom from '../../Components/FloatButtom';
import FloatMenu from '../../Components/FloatMenu';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import FormDiario from './Components/FormDiario';
export default class diario extends Component {
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
        const api = await MDL.contabilidad.diario.getAll();
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
                return { sorters: [{ key: "fecha_on", order: "asc", type: "date" }] }
            }}

            loadData={this.loadInitialData.bind(this)}
            onSelect={(e) => {
                if (this.onSelect) {
                    this.onSelect(e.row);
                    SNavigation.goBack();
                    return;
                }

                const MenuOptions = [];
                if (MDL.rolesPermisos.getPermiso({ url: "/empresa/moneda", permiso: "edit" })) {
                    MenuOptions.push({
                        icon: <SIconApp name='Edit' />,
                        label: "Editar Diario",
                        onPress: () => {
                            FormDiario.open({
                                editObject: e?.row,
                                onSuccess: () => {
                                    this.table.loadData();
                                    this.forceUpdate();
                                }
                            })
                        }
                    })
                }

                if (MDL.rolesPermisos.getPermiso({ url: "/empresa/moneda", permiso: "delete" })) {
                    MenuOptions.push({
                        icon: <SIconApp name='delete' />,
                        label: "Eliminar Diario",
                        onPress: () => {
                            SPopup.confirm({
                                title: "Eliminar diario",
                                message: "¿Estás seguro de eliminar este diario?",
                                onPress: () => {
                                    const data = {
                                        ...e.row,
                                        estado: 0,
                                    }
                                    MDL.contabilidad.diario.editar(data).then(() => {
                                        this.table.loadData();
                                        this.forceUpdate();
                                    }
                                    ).catch(err => {
                                        console.error("response", err);
                                    })
                                }
                            })
                        }
                    })
                }

                FloatMenu.open({
                    e: e.evt,
                    label: "Diario: " + e.row.descripcion,
                    options: MenuOptions
                })
            }
            }


        >
            <DinamicTable.Col key="index" label="#" textStyle={{
                color: STheme.color.lightGray
            }} width={40} data={(e) => e.index + 1} />
            <DinamicTable.Col key="descripcion" label="Nombre del diario" width={80} data={(e) => e.row?.descripcion} />
            {/* <DinamicTable.Col key="observacion" label="Observación" width={90} data={(e) => e.row?.observacion} /> */}
            <DinamicTable.Col key="codigo" label="Codigo" width={90} data={(e) => e.row?.codigo} />
            <DinamicTable.Col key="tipo" label="Tipo" width={90} data={(e) => e.row?.tipo} />
            {/* <DinamicTable.Col key="estado" label="Estado" width={50} data={(e) => e.row?.estado} /> */}
            <DinamicTable.Col
                key={"fecha_on"} label="F.Registro" width={120} dataType="date"
                data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date}
                textStyle={{ fontSize: 10, color: STheme.color.lightGray }} dateFormat="yyyy-MM-dd hh:mm"
            />
            <DinamicTable.Col
                key="admin" label="Admin" width={60} data={(e) => e.row?.usuario?.Nombres ?? ""}
                customComponent={e => <>
                    {(e.row?.key_usuario) ?
                        <SView col={"xs-12"} center row>
                            <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                <SImage src={`${SSocket.api.root}usuario/${e.row?.key_usuario}`} style={{ resizeMode: "cover" }} />
                            </SView>
                        </SView> : null}
                </>}
            />
            <DinamicTable.Col
                key="empresa" label="Empresa" width={60} data={(e) => e.row?.key_empresa ?? ""}
                customComponent={e => <>
                    {(e.row?.key_empresa) ?
                        <SView col={"xs-12"} row center>
                            <SView style={{ width: 28 }}>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.empresa}empresa/${e.row?.key_empresa}`} style={{ resizeMode: "cover" }} />
                                </SView>
                            </SView>
                        </SView> : null}
                </>}
            />
        </DinamicTable>
    }
    render() {
        return (
            <SPage title="Gestión de Monedas" disableScroll>
                {this.mostrarTabla()}
                {this.state.permiso_crear && <FloatButtom onPress={() => {
                    FormDiario.open({
                        onSuccess: () => {
                            this.table.loadData();
                            this.forceUpdate();
                        }
                    })
                }} />}
            </SPage>
        );
    }
}
