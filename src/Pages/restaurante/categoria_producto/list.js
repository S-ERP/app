import React from 'react';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../Model';
import { SNavigation, SText, SView, SIcon, SPopup, STheme } from 'servisofts-component';

class index extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            limit: 10,
            params: [],
            excludes: ["key", "estado", "key_usuario"],
            onRefresh: () => {
                Parent.model.Action.CLEAR()
            }
        });

        this.deletePermiso = Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "delete" });
        this.editPermiso = Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" });
    }

    $allowNew() {
        // return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
        return true
    }

    $allowAccess() {
        // return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" });
        return true
    }

    $filter(data) {
        return data.estado != 0
    }

    $getData() {
        return Parent.model.Action.getAll({ key_empresa: Model.empresa.Action.getKey() });
    }

    $order() {
        return [{ key: "index", order: "asc", type: "integer" }];
    }

    onEdit(obj) {
        SNavigation.navigate(Parent.path + "/edit", { pk: obj.key })
    }

    onDelete(obj) {
        if (this.deletePermiso) {
            SPopup.confirm({
                title: "Eliminar Categoria Producto",
                message: "¿Seguro que desea remover Categoria Producto?",
                onPress: () => {
                    Parent.model.Action.editar({
                        data: {
                            // ...obj,  
                            key: obj.key,
                            estado: 0
                        },
                        key_usuario: Model.usuario.Action.getKey()
                    })
                }
            })
        } else {
            SPopup.alert("No tiene permisos para eliminar el tag")
        }
    }

    $item(obj) {
        let global = !obj.key_empresa;
        return <>
            <SView card flex onPress={this.$onSelect.bind(this, obj)}>
                <SView row padding={10}
                    style={{
                        padding: 10,
                        alignContent: "flex-end",
                    }}
                >
                    <SView flex>
                        {!!global ? <SText color={STheme.color.primary}>Categoria Global</SText> : null}
                        <SText>Index: {obj.index}</SText>
                        <SText>Nombre: {obj.nombre}</SText>
                    </SView>
                    {!global ? <SView row>
                        <SView style={{ marginRight: 5 }} onPress={() => this.onEdit(obj)}>
                            {this.editPermiso ? <SIcon name={"Edit"} height={30} width={30}></SIcon> : <SView />}
                        </SView>
                        <SView onPress={() => this.onDelete(obj)}>
                            {this.deletePermiso ? <SIcon name={"Delete"} height={30} width={30}></SIcon> : <SView />}
                        </SView>
                    </SView> : null}
                </SView>
            </SView>
        </>
    }
}
export default connect(index);