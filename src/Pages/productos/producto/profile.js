import React, { Component } from 'react';
import { SButtom, SHr, SList, SNavigation, SPopup, SText, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { MenuPages } from 'servisofts-rn-roles_permisos';
import { Parent } from "."
import Model from '../../../Model';
import AlmacenActual from './Components/AlmacenActual';
import AlmacenProductoHistory from './Components/AlmacenProductoHistory';
import DatosDocumentos from './Components/DatosDocumentos';
import item from './item';
import QRProducto from '../../../Components/QRProducto';
import Ingrediente from './Components/Ingrediente';
import SSocket from 'servisofts-socket';
class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            itemType: "1",
            excludes: ["key", "key_usuario", "key_servicio",],
            onRefresh: (resolve) => {
                Parent.model.Action.CLEAR();
                Model.inventario_dato.Action.CLEAR();
                Model.producto_inventario_dato.Action.CLEAR();
                resolve();
            },
            item: item

        });
    }
    componentDidMount() {
        if (!Model.usuario.Action.getKey()) {
            SNavigation.navigate("/login");
            return;
        }
        SSocket.sendPromise({
            service: "inventario",
            component: "producto_ingrediente",
            type: "getAll",
            key_producto: this.pk,
        }).then(e => {
            this.setState({ producto_ingrediente: e.data })
            console.log(e);
        }).catch(e => {
            console.error(e)
        })
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
        if (!Model.usuario.Action.getKey()) {
            return null;
        }
        return Parent.model.Action.getByKey(this.pk);
    }



    $footer() {
        return <SView col={"xs-12"} center>
            <DatosDocumentos key_producto={this.pk} />
            <SHr />
            <SView col={"xs-12"} row>
                <SView flex ></SView>
                <QRProducto pk={this.pk} />
            </SView>
            <SHr />
            <AlmacenActual key_producto={this.pk} />
            <SHr />
            <AlmacenProductoHistory key_producto={this.pk} />
            <SHr />
            <SHr h={50} />
            <SText>{"INGREDIENTES"}</SText>
            <SHr />
            <SList
                data={this.state.producto_ingrediente ?? []}
                render={(obj) => {
                    return <SView col={"xs-12"} padding={8} card row>
                        <SView flex>
                            <SText>{obj?.modelo?.descripcion}</SText>
                            <SText>{obj?.marca?.descripcion}</SText>
                            <SText>{obj?.tipo_producto?.descripcion}</SText>
                            <SText>{obj?.producto?.descripcion}</SText>
                        </SView>
                        <SView>
                            <SText>x {obj.cantidad}</SText>
                        </SView>
                    </SView>
                }}
            />
            {/* <Ingrediente key_producto={this.pk} /> */}

        </SView>

    }
    // $footer() {
    //     return <SView col={"xs-12"} center>
    //         <MenuPages path={"/productos/producto/profile"} >

    //         </MenuPages>

    //     </SView>
    // }
}
export default connect(index);