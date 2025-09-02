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
export default class MonedaTablaHistorial extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
        this.loadInitialData();
    }
    loadInitialData = async () => {
        const key_moneda = SNavigation.getParam("key_moneda");
        const api = await MDL.empresa.getHistorialMoneda(key_moneda);
        return Object.values(api);
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
        >
            <DinamicTable.Col key="index" label="#" width={40} data={(e) => e.index + 1} />
            <DinamicTable.Col key="descripcion" label="Moneda" width={150} data={(e) => e.row?.descripcion} />
            <DinamicTable.Col key="observacion" label="Observación" width={90} data={(e) => e.row?.observacion} />
            <DinamicTable.Col key="tipo_cambio" label="Tipo Cambio" width={90} data={(e) => e.row?.tipo_cambio} />
            <DinamicTable.Col key="estado" label="Estado" width={50} data={(e) => e.row?.estado} />
            <DinamicTable.Col
                key={"fecha_on"} label="F.Registro" width={120} dataType="date"
                data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date}
                textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm"
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
            <SPage title="Historial registro de Moneda" disableScroll>
                {this.mostrarTabla()}
            </SPage>
        );
    }
}
