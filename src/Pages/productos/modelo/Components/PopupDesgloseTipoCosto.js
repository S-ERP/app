import React, { Component } from 'react';
import { SHr, SImage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import Config from '../../../../Config';
import PopupAgregarTipoCosto from './PopupAgregarTipoCosto';
import FloatButtom from '../../../../Components/FloatButtom';
import MDL from '../../../../MDL';
import FloatMenu from '../../../../Components/FloatMenu';
import SIconApp from '../../../../Assets/SIconApp';
import SSocket from 'servisofts-socket';

// | Opción              | Icono sugerido        | Descripción visual                   |
// | ------------------- | --------------------- | ------------------------------------ |
// | Configurar costos   | `settings` o `cogs`   | Engranaje para configuración         |
// | Ver desglose costos | `eye` o `list-alt`    | Ojo o lista para visualización       |
// | Editar              | `edit` o `pencil`     | Lápiz para edición                   |
// | Eliminar            | `trash` o `trash-alt` | Basurero para borrar                 |
// | Agregar Proveedor   | `user-plus` o `plus`  | Persona con símbolo + para agregar   |
// | Agregar Tag         | `tags` o `tag`        | Etiqueta para tags                   |
// | Ingrediente         | `leaf` o `carrot`     | Hoja o vegetal para ingredientes     |
// | Ver desglose        | `eye` o `list`        | Ojo o lista para visualizar desglose |
// | Ver Cardex          | `book` o `clipboard`  | Libro o portapapeles para historial  |

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
            <SText numberOfLines={1}>Desglose de costos</SText>
            <SHr h={16} />

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
                        label: e.row.cliente.nombres,
                        options: [
                            {
                                label: "Editar",
                                icon: <SIconApp name='Edit' />,
                                onPress: () => {
                                    PopupAgregarTipoCosto.open({
                                        editObject: e.row,
                                        onSuccess: () => {
                                            if (this.table) {
                                                this.table.loadData();
                                                if (this.props.onSuccess) this.props.onSuccess();
                                            }
                                        }
                                    });
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
                {/* <DinamicTable.Col key="key_modelo" label="key_modelo" width={200} data={e => e.row?.modelo} /> */}
                <DinamicTable.Col key="index" label="#" width={24} data={e => e.row?.index + 1} />

                <DinamicTable.Col key="cliente" label="Cliente" width={240} data={(e) => e.row?.cliente?.nombres ?? ""}
                    customComponent={e => <>
                        {(e.row?.key_cliente) ?
                            <SView col={"xs-12"} row center >
                                <SView style={{ width: 28 }}>
                                    <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                        <SImage src={`${SSocket.api.root}usuario/${e.row?.key_cliente}`} style={{ resizeMode: "cover" }} />
                                    </SView>
                                </SView>
                                <SView width={5} />
                                <SText flex  >{e.row?.cliente?.nombres}</SText>
                            </SView> : null}
                    </>}
                />

                {/* <DinamicTable.Col key="cliente" label="Cliente" width={150} data={e => e.row?.cliente?.nombres} /> */}
                <DinamicTable.Col key="tipo_costo" label="Tipo Costo" width={120} data={e => e.row?.tipo_costo} />
                <DinamicTable.Col key="comision" label="Comisión" width={70} data={e => e.row?.comision} />
                <DinamicTable.Col key="tipo_producto" label="Tipo Producto" width={130} data={e => e.row?.tipo_producto} />
                <DinamicTable.Col key={"tipo_producto_tipo"} label='Tipo' width={80}  
                    data={(e) => e.row?.tipo}
                    cellStyle={{ alignItems: "center", justifyContent: "flex-start", }}
                    customComponent={e => {
                        return <SView style={{ padding: 2, borderRadius: 4, backgroundColor: STheme.colorFromText(e.data) + "44", borderWidth: 1, borderColor: STheme.colorFromText(e.data) }}>
                            <SText fontSize={10} style={{ textTransform: "uppercase" }} >{e.data}</SText>
                        </SView>
                    }}
                />

                {/* <DinamicTable.Col key="tipo" label="Tipo" width={90} data={e => e.row?.tipo} center /> */}
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