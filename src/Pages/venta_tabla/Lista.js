 import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';

import FloatButtom from '../../Components/FloatButtom';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import Model from '../../Model';
import ReciboCarta from '../../Components/PDF/venta/ReciboCarta';

export default class Lista extends Component {
    onSelect = SNavigation.getParam("onSelect");

    mostrarPopup(key, data) {
        SPopup.open({
            key: "popup_config_horario",
            content: (
                <SView col={"xs-11 sm-10 md-8"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 450 }} padding={16} withoutFeedback>
                    <SView col={"xs-12"} height={470} center>
                        {/* Aquí podrías renderizar un componente Perfil */}
                    </SView>
                </SView>
            )
        });
    }

    renderUsuario = (srcKey) => (
        <SView style={{
            width: 24,
            height: 24,
            borderRadius: 100,
            overflow: "hidden",
            backgroundColor: STheme.color.card + "66",
        }}>
            <SImage src={`${SSocket.api.root}usuario/${srcKey}`} style={{ resizeMode: "cover" }} />
        </SView>
    );
 
    
    renderCliente = (srcKey) => (
        <SView style={{
            width: 24,
            height: 24,
            borderRadius: 100,
            overflow: "hidden",
            backgroundColor: STheme.color.card + "66",
        }}>
            <SImage src={`${SSocket.api.crm}cliente/${srcKey}`} style={{ resizeMode: "cover" }} />
        </SView>
    );
 

    async loadData() {
        const registros = Model.compra_venta.Action.getAll();
        if (!registros) return [];

        const estados_compra = {};
        const estados_venta = {};
        const { compras, ventas } = Object.values(registros).reduce(
            (acc, cv) => {
                if (cv.tipo === "compra") {
                    estados_compra[cv.state] = (estados_compra[cv.state] || 0) + 1;
                    acc.compras.push(cv);
                } else if (cv.tipo === "venta") {
                    estados_venta[cv.state] = (estados_venta[cv.state] || 0) + 1;
                    acc.ventas.push(cv);
                }
                return acc;
            },
            { compras: [], ventas: [] }
        );

        this.estados_compra = estados_compra;
        this.estados_venta = estados_venta;
        this.compras = compras;
        this.ventas = ventas;

        return ventas;
    }

    mostrarTabla() {
        return (
            <DinamicTable
                ref={ref => (this.DinamicTable = ref)}
                loadData={() => this.loadData()}
                key="id"
                language="es"
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                selectType="single"
                keyExtractor={(e) => e.key}
            >
                <DinamicTable.Col key="index" label="N°" width={40} data={(e) => e.index + 1} />

                <DinamicTable.Col key="key" label="Key" width={100} data={(e) => e.row.key} />
                <DinamicTable.Col key="key_empresa" label="Empresa" width={100} data={(e) => e.row.key_empresa} />
                <DinamicTable.Col key="tipo" label="Tipo" width={100} data={(e) => e.row.tipo} />
                <DinamicTable.Col key="tipo_pago" label="Pago" width={100} data={(e) => e.row.tipo_pago} />
                <DinamicTable.Col key="fecha_on" label="Fecha" width={100} data={(e) => e.row.fecha_on} />
                <DinamicTable.Col key="key_cliente" label="Key Cliente" width={100} data={(e) => e.row.key_cliente} />
                <DinamicTable.Col key="cliente" label="Cliente" width={100} data={(e) => e.row.cliente} />

                <DinamicTable.Col key="usuario" label="Usuario" width={50} data={(e) => e.row?.key_usuario}
                    customComponent={(e) => this.renderUsuario(e.data)} />

                <DinamicTable.Col key="cliente_img" label="Cliente" width={50} data={(e) => e.row?.cliente?.key}
                    customComponent={(e) => this.renderCliente(e.data)} />

             

                <DinamicTable.Col key="perfil" label="Perfil Venta" width={110} data={() => ""}
                    customComponent={(e) => (
                        <SView row card padding={2} height={40} center
                            onPress={() => SNavigation.navigate("/venta/profile", { pk: e?.row?.key })}
                        >
                            <SIconApp name="whatsapp" fill="green" width={18} />
                            <SText center color={STheme.color.green}>Perfil</SText>
                        </SView>
                    )}
                />

                <DinamicTable.Col key="pdf" label="PDF" width={110} data={() => ""}
                    customComponent={(e) => (
                        <SView row card padding={2} height={40} center
                            onPress={() => ReciboCarta.imprimir(e?.row?.key)}
                        >
                            <SIconApp name="pdf" fill="red" width={18} />
                            <SText center color={STheme.color.danger}>PDF</SText>
                        </SView>
                    )}
                />
            </DinamicTable>
        );
    }

    render() {
        return (
            <SPage title="Gestión de Ventas" disableScroll>
                {this.mostrarTabla()}
                <SHr height={20} />
                <FloatButtom onPress={() => this.mostrarPopup()} />
            </SPage>
        );
    }
}
