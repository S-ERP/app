import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SDate, SMath, SNotification, } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import MDL from '../MDL';
import Config from '../Config';
import FloatButtom from '../Components/FloatButtom';
import TestPopup from './TestPopup';
import FloatMenu from '../Components/FloatMenu';
import SIconApp from '../Assets/SIconApp';
export default class Test extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: new Date().getTime(),
        };
    }
    renderUsuario(usuario = {}) {
        const nombre = `${usuario?.Nombres || "Sin"} ${usuario?.Apellidos || "usuario"}`;
        return (
            <SView col="xs-12" center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66", }} >
                    {usuario?.key ? (
                        <SImage src={`${SSocket.api.root}usuario/${usuario.key}`} style={{ resizeMode: "cover" }} />
                    ) : null}
                </SView>
                <SView width={5} />
                <SText flex numberOfLines={1} style={{ fontSize: 10 }}>
                    {nombre}
                </SText>
            </SView>
        );
    }
    renderSucursal(sucursal = {}) {
        if (!sucursal?.key) return null;
        return (
            <SView col="xs-12" center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66", }} >
                    <SImage
                        src={`${SSocket.api.empresa}sucursal/${sucursal.key}`}
                        style={{ resizeMode: "cover" }}
                    />
                </SView>
                <SView width={5} />
                <SText flex numberOfLines={1} style={{ fontSize: 10 }}> {sucursal?.descripcion || "Sucursal"} </SText>
            </SView>
        );
    }
    renderEmpresa(empresa = {}) {
        if (!empresa?.key) return null;
        return (
            <SView col="xs-12" center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66", }} >
                    <SImage src={`${SSocket.api.empresa}empresa/${empresa?.key}`} style={{ resizeMode: "cover" }} />
                </SView>
                <SView width={5} />
                <SText flex numberOfLines={1} style={{ fontSize: 10 }}> {empresa?.razon_social || "empresa"} </SText>
            </SView>
        );
    }
    async loadInitialData() {
        try {
            const res = await MDL.inventario.getAllTipoCosto();
            const empresa = await MDL.empresa.getFull();
            const keysUsuarios = [
                ...new Set(
                    res.flatMap(e => [e.key_usuario, e.key_cliente]).filter(Boolean)
                )
            ];
            const usuariosArr = await MDL.usuario.getByKeys(keysUsuarios) || [];
            const usuariosMap = Object.fromEntries(
                usuariosArr.map(u => [u.key, u])
            );
            const cuentasObj = await MDL.contabilidad.getCuentas();
            const cuentasArr = Object.values(cuentasObj || {});
            const cuentasMap = Object.fromEntries(
                cuentasArr.map(c => [c.key, c])
            );
            if (!Array.isArray(res)) return [];
            const data_mejorada = res.map(e => ({
                ...e,
                usuario: usuariosMap[e.key_usuario] || {},
                empresa,
                cuenta_contable: cuentasMap[e.key_cuenta_contable] || null,
            }));
            return data_mejorada;
        } catch (error) {
            console.error("❌ Error en loadInitialData:", error);
            SPopup.alert("Error al cargar los datos.");
            return [];
        }
    }
    mostrarTabla() {
        return (
            <DinamicTable
                ref={ref => (this.DinamicTable = ref)}
                loadData={async () => {
                    return this.loadInitialData();
                }}
                language="es"
                center
                {...Config.table.applyTheme()}
                selectType="single"
                keyExtractor={(e) => e.key}
                loadInitialState={async () => {
                    return { sorters: [{ key: "fecha_on", order: "desc", type: "date" }] }
                }}
                onSelect={(e) => {
                    if (this.onSelect) {
                        this.onSelect(e.row)
                        SNavigation.goBack();
                        return;
                    }
                    const Menu = [];
                    Menu.push({
                        icon: <SIconApp name='crmeditar' fill='#8b8b8a25' stroke='#a8a89fff' width={20} />,
                        label: "Editar Tipo de Costo",
                        onPress: () => {
                            const item = {
                                ...e.row,
                                key_usuario: MDL.usuario.session?.key,
                            }
                            TestPopup.open({
                                editObject: item,
                                onSuccess: async () => {
                                    this.DinamicTable.loadData();
                                },
                            })
                        }
                    })
                    Menu.push({
                        icon: <SIconApp name='crmeliminar' fill='#ed3a4318' stroke='#ed3a43' width={20} />,
                        label: "Eliminar Almacen",
                        onPress: () => {
                            SPopup.confirm({
                                title: "Eliminar Tipo de Costo",
                                message: "¿Desea eliminar este Tipo de Costo?",
                                onPress: () => {
                                    MDL.inventario.saveTipoCosto({
                                        key: e.row.key,
                                        estado: 0,
                                    }).then(() => {
                                        SNotification.send({
                                            title: "Tipo de Costo Eliminado",
                                            body: "El Tipo de Costo se ha eliminado correctamente.",
                                            time: 3000,
                                            color: STheme.color.success,
                                        });
                                        if (this.DinamicTable) {
                                            this.DinamicTable.loadData();
                                        }
                                    });
                                }
                            })
                        }
                    })
                    FloatMenu.open({
                        e: e.evt,
                        label: e.row?.descripcion,
                        options: Menu
                    })
                }}
            >
                <DinamicTable.Col key="index" label="N°" width={30} data={(e) => e.index + 1} />
                <DinamicTable.Col key="descripcion" label="Descripción" width={120} data={(e) => e.row?.descripcion ?? ""} />
                <DinamicTable.Col key={"key_cuenta_contable"} label="cuenta contable" width={350} textStyle={{ color: STheme.color.lightGray }} data={e => e.row.cuenta_contable ? `${e.row.cuenta_contable.codigo} ${e.row.cuenta_contable.descripcion}` : ""} />
                <DinamicTable.Col key={"fecha_on"} label="F.Creación" width={110} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.lightGray, }} dateFormat="yyyy-MM-dd hh:mm" />
                <DinamicTable.Col key="key_usuario" label="Administrador" width={100} data={(e) => e.row?.key_usuario ?? ""} customComponent={e => this.renderUsuario(e.row?.usuario)} />
                <DinamicTable.Col key="key_empresa" label="key_empresa" width={100} data={(e) => e.row?.key_empresa ?? ""} customComponent={e => this.renderEmpresa(e.row?.empresa)} />
            </DinamicTable>
        );
    }
    render() {
        return (
            <SPage title="Tipos de costo" disableScroll>
                {this.mostrarTabla()}
                <SHr height={20} />
                <FloatButtom onPress={() => {
                    TestPopup.open({
                        onSuccess: () => {
                            if (this.DinamicTable) {
                                this.DinamicTable.loadData();
                                this.state.time = new Date().getTime();
                            }
                        }
                    })
                }} />
            </SPage>
        );
    }
}