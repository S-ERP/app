import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate, SButtom } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';
import FloatButtom from '../../Components/FloatButtom';
import FloatMenu from '../../Components/FloatMenu';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
 import PopupCrearMoneda from './config/Components/PopupCrearMoneda';

export default class MonedaTabla extends Component {



    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.loadInitialData();
    }

    async loadInitialData() {
        try {

            const apiFull = await MDL.empresa.getFull();
            if (!apiFull) return null;
            return apiFull.monedas;
            // this.forceUpdate();

        } catch (error) {
            console.error('Error loading initial data:', error);
            return [];
        }
    }

    mostrarTabla() {
        return <DinamicTable
            key="tabla"
            ref={ref => this.table = ref}
            loadData={this.loadInitialData.bind(this)}

            {...Config.table.applyTheme()}
            // ref={ref => this.DinamicTable = ref}
            center
            language="es"
            selectType="single"
            onSelect={(e) => {
                if (this.onSelect) {
                    this.onSelect(e.row);
                    SNavigation.goBack();
                    return;
                }

                FloatMenu.open({
                    e: e.evt,
                    label: "Moneda: " + e.row.descripcion,
                    options: [
                        {
                            icon: <SIconApp name='Edit' />,
                            label: "Actualizar Moneda",
                            onPress: () => {
                                PopupCrearMoneda.open({
                                    editObject: e?.row,
                                    key_empresa: e?.row?.key_empresa,
                                    onSuccess: () => {
                                        console.log("onSuccess");
                                        // this.table.loadData();
                                        // this.forceUpdate();
                                        // this.loadData.bind(this)
                                    }
                                })
                                // this.loadData.bind(this)

                            }
                        },
                        {
                            icon: <SIconApp name='Delete' />,
                            label: "Eliminar Moneda",
                            onPress: () => {
                                SPopup.confirm({
                                    title: "Eliminar Moneda",
                                    message: "¿Estás seguro de eliminar esta moneda?",
                                    onPress: () => {
                                        const moneda_ = {
                                            ...e.row,
                                            estado: 0,
                                        }
                                        SSocket.sendPromise({
                                            service: "empresa",
                                            component: "moneda", // 🔥 corregido
                                            type: "editar",
                                            data: moneda_,
                                            key_usuario: MDL.usuario.session?.key,
                                        }).then(() => {
                                            this.table.loadData();
                                            this.forceUpdate();
                                        }).catch(err => {
                                            console.error("response", err);
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
        >
            <DinamicTable.Col key="index" label="#" width={40} data={(e) => e.index + 1} />
            <DinamicTable.Col key="descripcion" label="Moneda" width={120} data={(e) => e.row?.descripcion} />
            <DinamicTable.Col key="observacion" label="Observación" width={120} data={(e) => e.row?.observacion} />
            <DinamicTable.Col key="tipo_cambio" label="Tipo Cambio" width={120} data={(e) => e.row?.tipo_cambio} />
            <DinamicTable.Col key="estado" label="Estado" width={150} data={(e) => e.row?.estado} />

            <DinamicTable.Col
                key={"fecha_on"}
                label="F.Registro"
                width={120}
                dataType="date"
                data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date}
                textStyle={{ fontSize: 12, color: STheme.color.text }}
                dateFormat="yyyy-MM-dd hh:mm"
            />

            <DinamicTable.Col
                key="admin"
                label="Admin"
                width={90}
                data={(e) => e.row?.usuario?.Nombres ?? ""}
                customComponent={e => <>
                    {(e.row?.key_usuario) ?
                        <SView col={"xs-12"} center row>
                            <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                <SImage src={`${SSocket.api.root}usuario/${e.row?.key_usuario}`} style={{ resizeMode: "cover" }} />
                            </SView>
                            <SView width={5} />
                            <SText color={STheme.color.text}>{e.row?.usuario?.Nombres}</SText>
                        </SView> : null}
                </>}
            />

            <DinamicTable.Col
                key="empresa"
                label="Empresa"
                width={60}
                data={(e) => e.row?.key_empresa ?? ""}
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
                <FloatButtom onPress={() => {
                    PopupCrearMoneda.open({
                        key_empresa: MDL.empresa.select?.key,
                        onSuccess: () => {
                            this.table.loadInitialState.bind(this);
                        }
                    })
                }} />
            </SPage>
        );
    }
}
