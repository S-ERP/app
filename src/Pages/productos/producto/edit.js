import React, { Component } from 'react';
import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation, SPopup, SText, SView } from 'servisofts-component';
import Model from '../../../Model';
import DatosDocumentosEditar from './Components/DatosDocumentosEditar';
import label from '../../ajustes/label';

class index extends DPA.edit {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "key_servicio", "estado", "unidad_medida", "key_cliente", "codigo"]
        });
        this.onSelect = SNavigation.getParam("onSelect")
        this.key_compra_venta_detalle = SNavigation.getParam("key_compra_venta_detalle")
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }
    $getData() {
        // return Parent.model.Action.getByKey(this.pk);
        var data = Parent.model.Action.getByKey(this.pk);
        if (!data) return null;
        if (!this.state.modelo) {
            if (data.key_modelo) {
                this.state.modelo = Model.modelo.Action.getByKey(data.key_modelo);
            } else {
                this.state.modelo = {}
            }
        }
        if (!this.state.almacen) {
            if (data.key_almacen) {
                this.state.almacen = Model.almacen.Action.getByKey(data.key_almacen);
            } else {
                this.state.almacen = {}
            }
        }

        if (!this.state.modelo || !this.state.almacen) return null;
        return data;
    }
    $inputs() {
        var inp = super.$inputs();
        inp["key_modelo"] = {
            ...inp["key_modelo"],
            label: "Modelo",
            editable: false,
            // defaultValue: this.data["key_modelo"],
            value: this.state?.modelo?.key,
            required: true,
            render: (ref) => {
                var value = ref.getValue();
                if (!value) {
                    return null;
                }
                return <SView col={"xs-12"} height center style={{ padding: 8 }}>
                    <SText col={"xs-12"}>{this.state.modelo.descripcion}</SText>
                </SView>
            },
            onPress: () => {
                SNavigation.navigate("/productos/modelo", {
                    onSelect: (item) => {
                        this.setState({ modelo: item })
                    }
                })
            }
        }
        inp["descripcion"].editable = true
        inp["descripcion"].required = true
        inp["descripcion"].label = "Descripción"
        inp["observacion"].label = "Observación"
        inp["precio_compra"].type = "money"
        inp["precio_compra"].editable = true
        inp["precio_compra"].defaultValue = parseFloat(this.data["precio_compra"] ?? 0).toFixed(2)
        inp["precio_venta"].required = false
        inp["precio_venta"].type = "money"
        inp["precio_venta"].required = true
        inp["precio_venta"].defaultValue = parseFloat(this.data["precio_venta"] ?? 0).toFixed(2)
        // inp["precio_venta_credito"].type = "money"

        // inp["cantidad"].defaultValue = "1"

        inp["key_almacen"] = {
            label: "Almacén",
            editable: false,
            value: this.state?.almacen?.key,
            render: (ref) => {
                var value = ref.getValue();
                if (!value) {
                    return null;
                }
                return <SView col={"xs-12"} height center style={{ padding: 8 }}>
                    <SText col={"xs-12"}>{this.state.almacen.descripcion}</SText>
                </SView>
            },
            onPress: () => {
                SNavigation.navigate("/inventario", {
                    onSelect: (item) => {
                        this.setState({ almacen: item })
                    }
                })
            }
        }
        return inp;
    }
    $onSubmit(data) {
        data.cantidad = parseFloat(data.cantidad ?? "0")
        console.log("Entro alalalalal")

        if (!this.data.key_empresa) this.data.key_empresa = Model.empresa.Action.getKey()

        Parent.model.Action.editar({
            data: {
                ...this.data,
                ...data,

            },
            key_usuario: ""
        }).then((resp) => {
            // this.presolve({
            // key: this.pk,
            // callback: () => {
            Model.inventario_dato.Action.CLEAR();
            Model.producto_inventario_dato.Action.CLEAR();
            // SNavigation.navigate("/productos/producto/profile", { pk: this.pk })
            // }
            // })
            SNavigation.goBack();
        }).catch(e => {
            console.error(e);

        })
    }
    // $submitName() {
    //     return ""
    // }
    // $footer() {
    //     return <DatosDocumentosEditar key_producto={this.pk} onSubmit={() => {
    //         return new Promise((resolve, reject) => {
    //             this.presolve = resolve;
    //             this.form.submit();
    //             // resolve("KEY_USUARIO");
    //         })
    //     }} />
    // }
}

export default connect(index);