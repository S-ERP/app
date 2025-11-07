import React from "react";
import { SPage, SStorage, SText, STheme, SView } from "servisofts-component";
import ImportarExcel from "../../Components/ImportarExcel";
import { DinamicTable } from "servisofts-table";
import Config from "../../Config";

export default class import_odoo extends React.Component {
    state = {
        ventas: null,
        detalles: null
    }
    componentDidMount(){
        SStorage.getItem("import_odoo_ventas").then((data) => {
            if(data){
                this.setState(JSON.parse(data));
            }
        });
    }

    componentWillUnmount(){
        SStorage.setItem("import_odoo_ventas", JSON.stringify(this.state));
    }
    renderSubirVentas() {
        return <SText onPress={() => {
            ImportarExcel.open({
                cols: [
                    { key: "orden", col: "Ref. de la orden", width: 200 },
                    { key: "cliente", col: "Cliente", width: 200 }
                ],
                onSave: (data) => {
                    this.setState({ ventas: data });
                }
            });
        }} fontSize={18} padding={4} card>Importar Ventas</SText>
    }
    renderSubirDetalles() {
        return <SText onPress={() => {
            ImportarExcel.open({
                cols: [
                    { key: "orden", col: "Ref de Orden" },
                    { key: "numero_orden", col: "Numero de orden" },
                    { key: "categoria_producto", col: "Categoria del Producto" },
                    { key: "referencia_interna", col: "Referencia interna" },
                    { key: "producto", col: "Producto" },
                    { key: "cantidad", col: "Cantidad" },
                    { key: "precio_unitario", col: "Precio Unitario" },
                    { key: "total", col: "Total" },
                    { key: "metodo_pago", col: "Metodo de Pago" },
                ],
                onSave: (data) => {
                    this.state.ventas.forEach(venta => {
                        venta.detalles = data.filter(det => det.orden == venta.orden);
                    });
                    this.table.loadData();
                    this.setState({ detalles: data });
                }
            });
        }} fontSize={18} padding={4} card >Importar Detalles</SText>
    }
    render() {
        return <SPage title={"import_odoo"} disableScroll>
            {!this.state.ventas ? this.renderSubirVentas() : null}
            {!!this.state.ventas && !this.state.detalles ? this.renderSubirDetalles() : null}
            {this.state.ventas ?
                <SView col={"xs-12"} flex>
                    <DinamicTable
                        {...Config.table.applyTheme()}
                        ref={ref => this.table = ref}
                        loadData={() => {
                            return this.state.ventas;
                        }}

                    >
                        <DinamicTable.Col key={"orden"} label={"orden"} data={e => e.row.orden}
                            width={200} />
                        <DinamicTable.Col key={"cliente"} label={"cliente"} data={e => e.row.cliente}
                            width={200} />
                        <DinamicTable.Col key={"detalles"} label={"detalles"}
                            width={500}
                            data={e => e.row.detalles}
                            customComponent={e => {
                                return <>
                                    {(e.row.detalles ?? []).map(a => {
                                        return <SView flex row>
                                        <SText backgroundColor={STheme.colorFromText(a.producto) + "66"} style={{
                                            padding: 2,
                                            margin: 2,
                                        }}>{a.producto}</SText>
                                    </SView>
                                    })}
                                </>
                            }}
                        />
                    </DinamicTable>
                </SView>
                : null}

        </SPage>
    }
}