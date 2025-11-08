import React from "react";
import { SDate, SIcon, SNotification, SPage, SPopup, SText, STheme } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../MDL";
import { DinamicTable } from "servisofts-table";
import Config from '../../Config';
import FloatMenu from "../../Components/FloatMenu";
import FormRegistroDescuento from "./Components/FormRegistroDescuento";
import FloatButtom from "../../Components/FloatButtom";

const URL = "/descuento";

export default class root extends React.Component {

    componentDidMount() {
        this.loadData();
    }
    async loadData() {
        const resp = await SSocket.sendPromise({
            service: "compra_venta",
            component: "descuento",
            type: "getAll",
            key_empresa: MDL.empresa.select.key,
        })

        const cuentas = await MDL.contabilidad.getCuentasCache();
        return Object.values(resp.data).map(desc => {
            desc.cuenta_contable = cuentas[desc.key_cuenta_contable];
            return desc;
        });
    }
    render() {
        return <SPage title={"Descuento"} disableScroll>

            {/* <SText onPress={() => {
                SSocket.sendPromise({
                    service: "compra_venta",
                    component: "descuento",
                    type: "registro",
                    data: {
                        descripcion: "2 Porciento de descuento",
                        porcentaje: 0.02,
                        monto: 0,

                    },
                    key_usuario: MDL.usuario.session.key,
                    key_empresa: MDL.empresa.select.key,
                })
            }}>{"REGISTRAR"}</SText> */}
            <DinamicTable loadData={this.loadData}
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                selectType='single'
                language='es'
                ref={ref => this.DinamicTable = ref}
                onSelect={(e) => {
                    const { row, evt } = e;
                    const nombreDescuento = "DESCUENTO: " + (row?.descripcion ?? "");
                    const options = [];

                    if (MDL.rolesPermisos.getPermiso({
                        url: URL,
                        permiso: "edit",
                    })) {
                        options.push({

                            label: "Editar",
                            icon: <SIcon name="Edit" fill={STheme.color.text} />,
                            onPress: () => {
                                FormRegistroDescuento.open({
                                    defaultData: row,
                                    onActualizar: (nuevoDato) => {
                                        this.DinamicTable.loadData();
                                        console.log("Descuento actualizado:", nuevoDato);
                                    }
                                });
                            }
                        })
                    }

                    if (MDL.rolesPermisos.getPermiso({
                        url: URL,
                        permiso: "delete",
                    })) {
                        options.push({
                            label: "Eliminar",
                            icon: <SIcon name="Delete" fill={STheme.color.text} />,
                            onPress: () => {
                                SPopup.confirm({
                                    title: "Eliminar descuento",
                                    message: `¿Estás seguro de eliminar a ${nombreDescuento}?`,
                                    onPress: () => {
                                        SSocket.sendPromise({
                                            service: "compra_venta",
                                            component: "descuento",
                                            type: "editar",
                                            data: { ...row, estado: 0 }
                                        })
                                            .then(() => {
                                                SNotification.send({
                                                    key: "eliminar_ok",
                                                    title: "Descuento eliminado",
                                                    type: "success",
                                                    time: 1500,
                                                    body: `${nombreDescuento} fue eliminado correctamente.`
                                                });
                                                this.DinamicTable.loadData();
                                            })
                                            .catch(err => {
                                                console.error("❌ Error al eliminar descuento:", err);
                                                SNotification.send({
                                                    key: "eliminar_error",
                                                    title: "Error al eliminar",
                                                    type: "error",
                                                    time: 3000,
                                                    body: "❌ Ocurrió un error al eliminar. Intenta nuevamente.",
                                                    color: STheme.color.error
                                                });
                                            });
                                    }
                                });
                            }

                        })
                    }
                    if (this.onSelect) {
                        options.push({
                            label: "select",
                            icon: <SIcon name="Check" fill={STheme.color.text} />,
                            onPress: () => {
                                this.onSelect(e.row)
                                SNavigation.goBack();
                            }
                        })
                    }
                    // const nombreCliente = "CLIENTE: "+ row?.nombres ?? "El cliente";
                    FloatMenu.open({
                        e: evt,
                        label: nombreDescuento,
                        options: options
                    });
                }}
            >
                <DinamicTable.Col key="index" label="#" width={40} data={(e) => e.index + 1} />
                <DinamicTable.Col
                    key={"descripcion"}
                    label={"Descripción"}
                    width={200}
                    data={e => e.row.descripcion}></DinamicTable.Col>
                <DinamicTable.Col
                    key={"porcentaje"}
                    label={"Porcentaje"}
                    data={e => e.row.porcentaje}></DinamicTable.Col>
                <DinamicTable.Col
                    key={"monto"}
                    label={"Monto"}
                    data={e => e.row.monto}></DinamicTable.Col>

                <DinamicTable.Col
                    key={"key_cuenta_contable"}
                    label={"Cuenta"}
                    width={200}
                    data={e => `${e.row.cuenta_contable?.codigo} - ${e.row.cuenta_contable?.descripcion}`}></DinamicTable.Col>
                <DinamicTable.Col key={"fecha_on"} label="Fecha"
                    width={110} dataType="date"
                    // textStyle={{ fontSize: 10 }}
                    data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date}
                    dateFormat="yyyy-MM-dd hh:mm" />
                {/* <DinamicTable.Col
                    key={"key_tipo_cliente"}
                    label={"key_tipo_cliente"}
                    data={e => ""}></DinamicTable.Col> */}
            </DinamicTable>
            {/* {MDL.rolesPermisos.getPermiso({ url: URL, permiso: "new", }) && */}
            <FloatButtom
                onPress={() => {
                    FormRegistroDescuento.open({
                        onRegister: (e) => {
                            this.DinamicTable.loadData();
                        },
                    });
                }}
            />
            {/* } */}
        </SPage>
    }
}