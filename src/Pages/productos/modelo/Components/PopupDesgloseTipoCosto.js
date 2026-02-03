import React, { Component } from 'react';
import { SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import Config from '../../../../Config';
import PopupAgregarTipoCosto from './PopupAgregarTipoCosto';
import FloatButtom from '../../../../Components/FloatButtom';
import MDL from '../../../../MDL';
import FloatMenu from '../../../../Components/FloatMenu';
import SIconApp from '../../../../Assets/SIconApp';
export default class PopupDesgloseTipoCosto extends Component {
    static open({ key_modelo, onSuccess }) {
        SPopup.open({
            key: "popup_config_horario",
            content: (
                <SView col={"xs-11"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 700 }} padding={16} withoutFeedback >
                    <SView col={"xs-12"} height={470} center >
                        <PopupDesgloseTipoCosto key_modelo={key_modelo} onSuccess={onSuccess} ></PopupDesgloseTipoCosto>
                    </SView>
                </SView>
            )
        });
    }
    constructor(props) {
        super(props);
    }
    async loadData() {
        const contactosKeys = await MDL.inventario.getContactosByModelo(this.props.key_modelo);
        const clientes = await MDL.crm.cliente.getAll();
        const contactos = contactosKeys.map((item) => {
            const { key_cliente, comision, key_modelo_cliente } = item;
            const cliente = clientes.find(c => c.key === key_cliente);
            return cliente
                ? { ...item, key: cliente.key, nombre: cliente.nombres || cliente.razon_social || key_cliente, cliente }
                : { ...item, key: key_cliente, nombre: key_cliente, cliente: null };
        });
        return contactos;
    }
    render() {
        return (<>
            <SText numberOfLines={1}  >Desglose de costos</SText>
            <DinamicTable
                ref={ref => this.table = ref}
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                selectType='single'
                language='es'

                onSelect={e => {
                    FloatMenu.open({
                        e: e.evt,
                        height: 330,
                        label: e.row.descripcion,
                        options: [

                            {
                                label: "Editar",
                                icon: <SIconApp name='Edit' />,
                                onPress: () => {
                                    // FormularioModelo.open({
                                    //     editObject: e.row,
                                    //     onSuccess: () => {
                                    //         if (this.table) {
                                    //             this.table.loadData();
                                    //         }
                                    //     }
                                    // })
                                }
                            },
                            {
                                label: "Eliminar",
                                icon: <SIconApp name='Delete' />,
                                onPress: () => {
                                    SPopup.confirm({
                                        title: "Eliminar Modelo",
                                        message: "¿Está seguro de eliminar el modelo " + e.row.descripcion + "?",
                                        onPress: () => {
                                            MDL.inventario.editModeloCliente({
                                                key: e.row.key_modelo_cliente,
                                                estado: 0,
                                            }).then(() => {

                                                if (this.table) {
                                                    this.table.loadData();
                                                    if (this.props.onSuccess) this.props.onSuccess();
                                                }


                                            });
                                        }
                                    });
                                }
                            },

                        ]
                    });
                }}

                loadData={this.loadData.bind(this)} // <-- ahora la tabla recibe todos los contactos
            >
                <DinamicTable.Col key="index" label="#" width={24} data={e => e.row?.index + 1} />
                {/* <DinamicTable.Col key="key_modelo_cliente" label="key_modelo_cliente" width={200} data={e => e.row?.key_modelo_cliente} /> */}
                {/* <DinamicTable.Col key="key_modelo" label="key_modelo" width={200} data={e => e.row?.key_modelo} /> */}
                {/* <DinamicTable.Col key="modelo" label="Modelo" width={200} data={e => e.row?.modelo} /> */}
                <DinamicTable.Col key="cliente" label="Cliente" width={150} data={e => e.row?.cliente?.nombres} />
                <DinamicTable.Col key="tipo_costo" label="Tipo Costo" width={120} data={e => e.row?.tipo_costo} />
                <DinamicTable.Col key="comision" label="Comisión" width={70} data={e => e.row?.comision} />
                {/* <DinamicTable.Col key="key_tipo_costo" label=" key Tipo Costo" width={150} data={e => e.row?.key_tipo_costo} /> */}
                {/* <DinamicTable.Col key="key_cuenta" label="key Cuenta Contable" width={150} data={e => e.row?.key_cuenta_contable} /> */}
                <DinamicTable.Col key="tipo_producto" label="Tipo Producto" width={130} data={e => e.row?.tipo_producto} />
                <DinamicTable.Col key="tipo" label="Tipo" width={90} data={e => e.row?.tipo} />
            </DinamicTable>
            <FloatButtom onPress={() => {
                PopupAgregarTipoCosto.open({
                    key_modelo: this.props.key_modelo,
                    onSuccess: () => {
                        if (this.table) {
                            this.table.loadData();
                            if (this.props.onSuccess) this.props.onSuccess();
                        }
                    }
                });
            }} />
        </>
        );
    }
}