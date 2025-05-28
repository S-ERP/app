import React from 'react';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../../Model';
import { SButtom, SHr, SList, SNavigation, SSwitch, SText, STheme, SView, SIcon, SPopup } from 'servisofts-component';

class index extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            limit: 10,
            params: ["key_producto"],
            excludes: ["key", "estado", "key_usuario"],
            onRefresh: () => {
                Parent.model.Action.CLEAR()
            }
        });

        // this.editPermisoSubProducto = Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" });
        // this.deletePermisoSubProducto = Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "delete" });

        this.editPermisoSubProducto = true;
        this.deletePermisoSubProducto = true;

        this.editPermisoDetalleSubProducto = true;
        this.deletePermisoDetalleSubProducto = true;
    }

    componentDidMount() {
        Parent.model.Action.CLEAR()
    }

    $allowNew() {
        // return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
        return true;
    }

    $allowAccess() {
        // return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "view" });
        return true;
    }

    $filter(data) {
        return data.estado != 0
    }

    $getData() {
        this.subProductoDetalle = Model.sub_producto_detalle.Action.getAll();
        return Parent.model.Action.getAll({ key_producto: this.$params.key_producto });
    }


    $order() {
        return [{ key: "index", order: "asc", type: "integer" }];
    }

    handleChange_habilitado(obj, habilitado) {
        // if (!this.editPermiso) {
        //     SPopup.alert("No tienes permisos para esta acción.")
        //     return;
        // }

        if (obj.estado == 1) {
            obj.estado = -1;
        } else {
            obj.estado = 1;
        }

        Model.sub_producto.Action.editar({
            data: {
                ...obj,
                estado: obj.estado
            },
            key_usuario: Model.usuario.Action.getKey()
        })
    }

    handleChange_sub_producto_detalle_habilitado(obj) {
        // if (!this.editPermiso) {
        //     SPopup.alert("No tienes permisos para esta acción.")
        //     return;
        // }

        if (obj.estado == 1) {
            obj.estado = -1;
        } else {
            obj.estado = 1;
        }

        Model.sub_producto_detalle.Action.editar({
            data: {
                ...obj,
                estado: obj.estado
            },
            key_usuario: Model.usuario.Action.getKey()
        })
    }

    onEditSubProducto(key_sub_producto) {
        SNavigation.navigate(Parent.path + "/edit", { pk: key_sub_producto })
    }

    onDeleteSubProducto(obj) {
        if (this.deletePermisoSubProducto) {
            SPopup.confirm({
                title: "Eliminar Producto",
                message: "¿Seguro que desea remover el producto?",
                onPress: () => {
                    Parent.model.Action.editar({ //TODO no edita.
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

    onEditSubProductoDetalle(key_sub_producto_detalle) {
        SNavigation.navigate(Parent.path + "/sub_producto_detalle/edit", { pk: key_sub_producto_detalle })
    }

    onDeleteSubProductoDetalle(obj) {
        if (this.deletePermisoDetalleSubProducto) {
            SPopup.confirm({
                title: "Eliminar Detalle Sub Producto",
                message: "¿Seguro que desea remover el Detalle Sub Producto?",
                onPress: () => {
                    Model.sub_producto_detalle.Action.editar({ //TODO no edita.
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

    cardSubProductoDetalle(key_sub_producto) {
        let sizeButtons = 30;
        return <>
            <SView>
                <SHr height={5} />
                <SHr height={1} color={STheme.color.secondary} />
                <SText center fontSize={15}>Sub Producto Detalles</SText>
                <SHr height={1} color={STheme.color.secondary} />
                <SView style={{ color: STheme.color.text, margin: 5 }}
                    onPress={() =>
                        SNavigation.navigate(Parent.path + "/sub_producto_detalle/new", { key_sub_producto: key_sub_producto })
                    }
                ><SText>+ Crear</SText></SView>
                <SList
                    data={this.subProductoDetalle}
                    space={0}
                    order={[{ key: "index", order: "asc", peso: 1 }]}
                    filter={obj => (obj.key_sub_producto == key_sub_producto && obj.estado != 0)}
                    render={(obj) => {
                        let habilitado = obj.estado == -1 ? false : true;
                        return <>
                        <SView card row flex
                            style={{
                                margin: 5,
                                padding: 5,
                                justifyContent: "space-between",
                            }}
                        >
                            <SView flex>
                                <SText padding={3}>Index: {obj.index}</SText>
                                <SText padding={3} width={150}>Nombre: {obj.nombre}</SText>
                                <SText padding={3}>Descripción:</SText>
                                <SText padding={3} width={150}>{!!obj.descripcion ? obj.descripcion : "No hay Descripción"}</SText>
                                <SText padding={3}>Precio: {!!obj.precio ? obj.precio : "No hay precio"}</SText>
                            </SView>

                            <SView row center>

                                <SSwitch center key={this.state.key_zona} size={20} loading={this.state.loading} onChange={this.handleChange_sub_producto_detalle_habilitado.bind(this, obj)} value={!!habilitado} />

                                <SView style={{ marginRight: 10, marginLeft: 10,width:sizeButtons, height:sizeButtons}} onPress={() => this.onEditSubProductoDetalle(obj.key)}>
                                    {this.editPermisoDetalleSubProducto ? <SIcon name={"Edit"} height={28} width={28}></SIcon> : <SView />}
                                </SView>

                                <SView style={{width:sizeButtons, height:sizeButtons}} onPress={() => this.onDeleteSubProductoDetalle(obj)}>
                                    {this.deletePermisoDetalleSubProducto ? <SIcon name={"Delete"} height={28} width={28}></SIcon> : <SView />}
                                </SView>
                            </SView>

                        </SView>

                    </>
                    }}
                />
            </SView >
        </>
    }

    $item(obj) {
        let habilitado = obj.estado == -1 ? false : true;
        return <>
            <SView card
                style={{
                    margin: 4,
                    padding: 8,
                    borderRadius: 10,
                }}
            >
                <SView flex row
                    style={{
                        justifyContent: "space-between"
                    }}
                >
                    <SView col={"xs-8"}>
                        <SText padding={3}>Index: {obj.index ? obj.index : "No hay index"}</SText>
                        <SText padding={3}>Nombre:</SText>
                        <SText color={STheme.color.primary} padding={3}>{obj.nombre}</SText>
                        <SText padding={3}>Descripción:</SText>
                        <SText padding={3} color={STheme.color.primary} width={220}>{!!obj.descripcion ? obj.descripcion : "No hay descripción"}</SText>
                        <SText padding={3}>Cantidad de Selección Maxima: {!!obj.cantidad_seleccion ? obj.cantidad_seleccion : "No hay de selección máximo"}</SText>
                        <SText padding={3}>Cantidad de Selección Minima: {!!obj.cantidad_seleccion_minima ? obj.cantidad_seleccion_minima : "No hay mínimo de selección"}</SText>
                    </SView>

                    <SView col={"xs-4"} center>
                        <SView row center>
                            <SView marginRight={5} onPress={() => this.onEditSubProducto(obj.key)}>
                                {this.editPermisoSubProducto ? <SIcon name={"Edit"} height={30} width={30}></SIcon> : <SView />}
                            </SView>

                            <SView margin={5} onPress={() => this.onDeleteSubProducto(obj)}>
                                {this.deletePermisoSubProducto ? <SIcon name={"Delete"} height={30} width={30}></SIcon> : <SView />}
                            </SView>
                        </SView>

                        <SHr height={20} />
                        <SSwitch center key={this.state.key_zona} size={20} loading={this.state.loading} onChange={this.handleChange_habilitado.bind(this, obj)} value={!!habilitado} />
                    </SView>
                </SView>
                {this.cardSubProductoDetalle(obj.key)}
            </SView>
        </>
    }
}
export default connect(index);