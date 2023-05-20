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
                <SText>{SMath.formatMoney(precio)} X {SMath.formatMoney(cantidad)} </SText>
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
            SNavigation.navigate("/compra/detalle/new", { key_compra_venta: this.data.key })
        }}>
            <SText bold color={STheme.color.danger} center>AGREGAR PRODUCTO O SERVICIO</SText>
        </SView>
    }
    render() {
        this.data = this.props.data;
        this.compra_venta_detalle = Model.compra_venta_detalle.Action.getAll({
            key_compra_venta: this.data.key
        })
        if (!this.compra_venta_detalle) return <SLoad />
        return <SView col={"xs-12"} center>
            <SHr />
            <SText bold>DETALLE</SText>
            <SHr />
            {/* <SText>{JSON.stringify(this.compra_venta_detalle)}</SText> */}
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
