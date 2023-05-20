import React, { Component } from 'react';
import { SDate, SHr, SImage, SList, SLoad, SMath, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../../../../Model';
import PopupDetalleItem from './PopupDetalleItem';
export default class Detalle extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    data = {}
    detalle_item({ key, key_usuario, nombre, precio, cantidad, descuento, tipo }) {
        var onPress = null;
        if (!this.props.disabled) {
            onPress = () => {
                SPopup.open({
                    key: "popup-detalle-item",
                    content: <PopupDetalleItem data={{ key, key_usuario, nombre, precio, cantidad, descuento }} key_compra_venta={this.data.key} />,
                })
            }
        }
        return <SView col={"xs-12"} row center onPress={onPress}>
            <SView width={40} height={40} style={{ padding: 4 }}>
                <SView flex height card style={{
                    overflow: 'hidden',
                }}>
                    <SImage src={SSocket.api.root + "usuario/" + key_usuario} />
                </SView>
            </SView>
            <SView flex>
                <SText bold >{nombre}</SText>
                <SText>{SMath.formatMoney(precio)} X {parseInt(cantidad)} </SText>
                <SText fontSize={10} bold color={STheme.color.lightGray}>{tipo}</SText>
            </SView>
            <SView width={8} />
            <SView col={"xs-3"} style={{ alignItems: 'end', textAlign: "end" }}>
                <SText style={{ alignItems: 'end', textAlign: "end" }}>{SMath.formatMoney((precio * cantidad))}</SText>
                {descuento ? <SText color={STheme.color.danger}>- {SMath.formatMoney(descuento)}</SText> : null}
            </SView>
        </SView>
    }
    getButtom() {
        if (this.props.disabled) return null;
        return <SView card style={{
            padding: 16
        }} onPress={() => {
            // SNavigation.navigate("/venta/detalle/new", { key_compra_venta: this.data.key })
            SNavigation.navigate("/productos/producto", {
                onSelect: (resp) => {
                    if (resp?.venta_sin_entregar && resp?.venta_sin_entregar.length > 0) {
                        SPopup.alert("Lamentablemente, no puedes seleccionar este producto ya que está pendiente de entrega. Parece que ha sido vendido, pero aún no ha llegado a su destino. Si tienes alguna pregunta o inquietud, por favor ponte en contacto con el administrador de la tienda para obtener más información. ¡Gracias por tu comprensión!");
                        return true;
                    }
                    console.log(resp);
                    if (!resp?.modelo?.tipo_producto) {
                        SPopup.alert("No se encontro tipo producto");
                        return true;
                    }
                    if (!resp?.modelo?.tipo_producto?.key_cuenta_contable_credito) {
                        SPopup.alert("No se encontro tipo producto key_cuenta_contable_credito");
                        return true;
                    }
                    if (!resp?.modelo?.tipo_producto.key_cuenta_contable_contado) {
                        SPopup.alert("No se encontro tipo producto key_cuenta_contable_contado");
                        return true;
                    }
                    var precio_unitario = resp.precio_venta;
                    if (this.props.data.tipo_pago != "contado") {
                        precio_unitario = resp.precio_venta_credito;
                    }

                    var exite_producto = Object.values(this.compra_venta_detalle).filter((cvd => {
                        let producto = cvd.productos.find(p => p.key_producto == resp.key)
                        if(producto){
                            return true;
                        }
                        return false;
                    }))
                    if (exite_producto) {
                        if (exite_producto.length > 0) {
                            console.log("sadasd", resp);
                            console.log(exite_producto)
                            SPopup.alert("El producto ya esta en la lista.");
                            return true;
                        }
                    }
                    Model.compra_venta_detalle.Action.registro({
                        data: {
                            key_compra_venta: this.data.key,
                            tipo: "producto",
                            descripcion: resp.descripcion,
                            cantidad: 1,
                            precio_unitario: precio_unitario,
                            descuento: 0,
                            data: {
                                precio_venta: resp.precio_venta,
                                precio_venta_credito: resp.precio_venta_credito,
                                key_cuenta_contable_contado: resp?.modelo?.tipo_producto.key_cuenta_contable_contado,
                                key_cuenta_contable_credito: resp?.modelo?.tipo_producto.key_cuenta_contable_credito,
                            }
                        },
                        key_producto: resp.key,
                        key_usuario: Model.usuario.Action.getKey()
                    }).then(resp => {
                        Model.compra_venta_detalle_producto.Action._dispatch({
                            ...Model.compra_venta_detalle_producto.info,
                            type: "registro",
                            estado: "exito",
                            data: resp?.productos[0]
                        })
                    })
                    console.log(resp);
                }
            })
        }}>
            <SText bold color={STheme.color.danger} center>AGREGAR PRODUCTO O SERVICIO</SText>
        </SView>
    }
    render() {
        this.data = this.props.data;
        this.compra_venta_detalle = Model.compra_venta_detalle.Action.getAllConProductos({
            key_compra_venta: this.data.key
        })
        console.log(this.compra_venta_detalle)
        if (!this.compra_venta_detalle) return <SLoad />
        return <SView col={"xs-12"} center>
            <SHr />
            <SText bold>DETALLE</SText>
            <SHr />
            <SList
                data={this.compra_venta_detalle}
                filter={obj => obj.estado != 0 && obj.key_compra_venta == this.data.key}
                order={[{ "key": "fecha_on", order: "asc" }]}
                render={(obj) => {
                    return this.detalle_item({
                        key: obj.key,
                        nombre: obj.descripcion,
                        cantidad: obj.cantidad,
                        precio: obj.precio_unitario,
                        key_usuario: obj.key_usuario,
                        descuento: obj.descuento,
                        tipo: obj.tipo
                    })
                }}
            />
            <SHr />
            <SHr />
            {this.getButtom()}
        </SView>
    }
}
