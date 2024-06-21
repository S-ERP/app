import React, { Component } from 'react';
import DPA, { connect } from 'servisofts-page';
import { Parent } from ".."
import { SButtom, SHr, SIcon, SList, SLoad, SNavigation, SText, SView } from 'servisofts-component';
import Model from '../../../Model';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import Colores from '../colores';
class index extends DPA.profile {
    constructor(props) {
        super(props, { Parent: Parent, excludes: ["key", "key_usuario", "key_servicio", "estado"] });
    }
    $allowEdit() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }
    $allowDelete() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "delete" })
    }
    $allowAccess() {
        return true;
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
    }
    $getData() {
        return Parent.model.Action.getByKey(this.pk);
    }

    $footer() {
        return <SView col={"xs-12"} >
            <SHr />
            <SText fontSize={16} bold>Menú</SText>
            <SHr />
            <MenuPages path={"/empresa/profile/"} permiso={"ver"} params={{
                pk: this.pk
            }}>
                <MenuButtom url='/empresa/paso2' label='Foto perfil' params={{
                    key: this.pk,
                }} icon={<SIcon name={"ifoto"} />} />
                <MenuButtom url='/empresa/paso3' params={{
                    key: this.pk,
                }} label='Foto background' icon={<SIcon name={"iback"} />} />
                <MenuButtom url='/empresa/colores' params={{
                    key: this.pk,
                }} label='Tema' icon={<SIcon name={"itema"} />}   />
            </MenuPages>
            {/* <Colores key_empresa={this.pk} /> */}
        </SView>
    }

}
export default connect(index);