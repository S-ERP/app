import React, { Component } from 'react';
import { SHr, SIcon, SInput, SText, STheme, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../Model';
import item from './item';
class index extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            title: "Lista de productos",
            item: item,
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_servicio", "key_modelo"],
            onRefresh: (resolve) => {
                Parent.model.Action.CLEAR();
                Model.marca.Action.CLEAR();
                Model.modelo.Action.CLEAR();
                Model.tipo_producto.Action.CLEAR()
                Model.compra_venta_detalle.Action.CLEAR();
                resolve();
            }
        });

        this.state = {
            select: {
                "no_elavorado": true,
                // "disponible": true,
                // "aprobado": true,
            },
            ...this.state,
        }
    }
    $allowNew() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
    }
    $allowTable() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "table" });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
    }
    $filter(data) {
        if (!data.estado) return false;


        if (this.state.select["no_elavorado"]) {
            if (!data.precio_compra || data.precio_compra <= 0) {
                return true;
            }
        }

        if (this.state.select["pendiente_entrega"]) {
            if (data?.venta_sin_entregar?.length > 0) {
                return true;
            }
        }
        if (this.state.select["vendido"]) {
            if (data.key_cliente) {
                return true;
            }
        }
        if (this.state.select["disponible"]) {
            if (data.key_almacen && !data.key_cliente && data?.venta_sin_entregar?.length <= 0) {
                return true;
            }
        }


        return false;
    }

    optionItem({ key, label, color }) {
        var select = !!this.state.select[key]
        return <SView height center style={{
            paddingLeft: 8,
            paddingRight: 8,
            opacity: select ? 1 : 0.5,
            backgroundColor: color + "99",
        }} onPress={() => {

            if (!select) {
                this.state.select[key] = true;
            } else {
                delete this.state.select[key];
            }
            this.setState({ ...this.state })
        }} flex>
            <SView row center>
                {!select ? null : <SView ><SIcon name={"Close"} width={12} height={12} fill={STheme.color.text} /><SView width={15} /></SView>}
                <SText>{label}</SText>
            </SView>
        </SView>
    }

    $menu() {
        var items = super.$menu();
        items.push({
            children: this.optionItem({ key: "no_elavorado", label: "Sin precio de compra", color: STheme.color.accent })
        })
        items.push({
            children: this.optionItem({ key: "disponible", label: "Disponible", color: STheme.color.accent })
        })
        items.push({
            children: this.optionItem({ key: "pendiente_entrega", label: "Pendientes de entrega", color: STheme.color.warning })
        })
        items.push({
            children: this.optionItem({ key: "vendido", label: "Vendido", color: STheme.color.danger })
        })
        return items;
    }

    $render() {
        return <>
            <SView col={"xs-12"} >
                {/* <SInput placeholder={"Filtrars por # de chasis"} onChangeText={val => this.setState({ chasis: val })} /> */}
                {/* <SHr h={4} /> */}

            </SView>
            {super.$render()}
        </>
    }
    $order() {
        return [{ key: "fecha_on", type: "date", order: "desc" }]
    }
    $getData() {
        var data = Parent.model.Action.getAllRecursive();
        // this.marcas = Model.marca.Action.getAll();
        // this.modelos = Model.modelo.Action.getAll();
        // this.tipo_productos = Model.tipo_producto.Action.getAll();
        // this.ventas_sin_entregar = Model.compra_venta_detalle.Action.ventasSinEntregar({});
        // if (!data) return null;
        // if (!this.modelos) return null;
        // if (!this.marcas) return null;
        // if (!this.tipo_productos) return null;
        // if (!this.ventas_sin_entregar) return null;
        // const arr_vse = Object.values(this.ventas_sin_entregar);
        // Object.values(data).map(obj => {
        //     obj.venta_sin_entregar = arr_vse.filter(o => o.key_producto == obj.key)
        //     obj.modelo = this.modelos[obj.key_modelo];
        //     obj.marca = this.marcas[obj.modelo.key_marca];
        //     obj.tipo_producto = this.tipo_productos[obj.modelo.key_tipo_producto];
        // })
        return data;
    }
}
export default connect(index);