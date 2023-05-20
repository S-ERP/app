import React, { Component } from 'react';
import { SButtom, SHr, SLoad, SNavigation, SText, SView } from 'servisofts-component';
import Model from '../../../../Model';

export default class AlmacenActual extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    renderAlmacen() {
        var obj = Model.producto.Action.getByKey(this.props.key_producto);
        if (!obj) return <SLoad />
        if (!obj.key_almacen) return <SView>
            <SHr />
            <SText>{obj.key_almacen}</SText>
            <SHr />
        </SView>
        var almacen = Model.almacen.Action.getByKey(obj.key_almacen);
        if (!almacen) return <SLoad />
        var sucursal = Model.sucursal.Action.getByKey(almacen.key_sucursal);
        if (!sucursal) return <SLoad />
        return <SView col={"xs-12"} card style={{
            padding: 4
        }}>
            <SHr />
            <SText>{sucursal.descripcion}</SText>
            <SText bold>{almacen.descripcion}</SText>
            <SText>{almacen.observacion}</SText>
            <SHr />
        </SView>
    }
    render() {
        var obj = Model.producto.Action.getByKey(this.props.key_producto);
        if (!obj) return <SLoad />
        if (obj.key_cliente) return <SView>
            <SHr />
            <SText>Vendido</SText>
            <SHr />
        </SView>
        return (
            <SView center col={"xs-12"}>
                {this.renderAlmacen()}
                <SHr />
                <SButtom type={"danger"} onPress={() => {
                    SNavigation.navigate("/inventario/almacen/list", {
                        onSelect: (almacen) => {
                            Model.producto.Action.editar({
                                key_usuario: Model.usuario.Action.getKey(),
                                data: {
                                    ...obj,
                                    key_almacen: almacen.key,
                                    key: this.props.key_producto
                                }
                            }).then(r => {
                                console.log("entro en la respuesta")
                            }).catch(e => {

                            })
                        }
                    })
                }}>TRASPASAR</SButtom>
            </SView>
        );
    }
}
