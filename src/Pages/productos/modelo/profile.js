import React, { Component } from 'react';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../Model';
// import Editar_modelo_inventario_dato from './Components/Editar_modelo_inventario_dato';
import { SHr, SNavigation, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import item from './item';
import Ingrediente from './Components/Ingrediente';
import SSocket from 'servisofts-socket';

class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            title: "Perfil del modelo",
            excludes: ["key", "key_usuario", "key_servicio", "key_marca", "estado", "key_tipo_producto"],
            item: item

        });
    }
    $allowEdit() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }
    $allowDelete() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "delete" })
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
    }
    $getData() {
        return Parent.model.Action.getByKey(this.pk);
    }

    buscar_ingredientes() {
        SNavigation.navigate("/productos/modelo/elavorar", {
            pk: this.pk
        })
    }

    descuartizar() {
        SNavigation.navigate("/productos/modelo/descuartizar", {
            pk: this.pk
        })
    }

    
    $footer() {
        return <SView col={"xs-12"}>
            <SHr h={50} />
            <SView col={"xs-12"} center>
                <SText underLine onPress={this.buscar_ingredientes.bind(this)}>{"BUSCAR INGREDIENTES PARA ELAVORAR"}</SText>
                <SText underLine onPress={this.descuartizar.bind(this)}>{"DESCUARTIZAR"}</SText>
            </SView>
            <SHr h={50} />
            <Ingrediente key_modelo={this.pk} />
            <SHr h={50} />
        </SView>

    }
}
export default connect(index);