import React, { Component } from 'react';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../Model';
import SSocket from 'servisofts-socket'
import { SNavigation, SText, SView, SIcon, SPopup, SButtom, SList, SHr, SImage, SMath, SInput, STheme, SLoad, SDate } from 'servisofts-component';
import {
    ScrollView,
} from 'react-native';

class index extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            limit: 10,
            params: ["key_restaurante"],
            excludes: ["key", "estado", "key_usuario"],
            onRefresh: () => {
                Parent.model.Action.CLEAR()
            }
        });
    }

    componentDidMount() {
        if (!Model.restaurante.Action.getSelect()?.key) {
            SNavigation.goBack();
            return;
        }

        Parent.model.Action.CLEAR()
        Model.categoria_producto.Action.CLEAR()
    }

    $allowNew() {
        // return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
        return true;
    }

    $allowAccess() {
        // return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "view" });
        return true
    }

    $filter(data) {
        return data.estado != 0
    }

    $getData() {
        return Parent.model.Action.getAll({ key_restaurante: this.$params.key_restaurante });
    }

    $getDataCategoriaProducto() {
        return Model.categoria_producto.Action.getAll({ key_restaurante: this.$params.key_restaurante });
    }

    $order() {
        return [{ key: "fecha_on", order: "desc", type: "date" }];
    }

    $menu() {
        let menu = super.$menu();
        menu.push({ children: this.listCategoria() })
        return menu;
    }

    listCategoria() {
        return <>
            <SView padding={7}
                onPress={() => {
                    SNavigation.navigate("/restaurante/categoria_producto/list", { key_restaurante: this.$params.key_restaurante })
                }}
            >
                <SText>Lista Categorías</SText>
            </SView>
        </>
    }

    onEdit(obj) {
        SNavigation.navigate(Parent.path + "/edit", { pk: obj.key, key_restaurante: this.$params.key_restaurante })
    }

    handleChange_habilitado(obj) {
        if (!this.editPermiso) {
            SPopup.alert("No tienes permisos para esta acción.")
            return;
        }

        Model.producto.Action.editar({
            data: {
                ...obj,
                habilitado: !obj.habilitado
            },
            key_usuario: Model.usuario.Action.getKey()
        })
    }

    handleChange_mayor_edad(obj) {
        if (!this.editPermiso) {
            SPopup.alert("No tienes permisos para esta acción.")
            return;
        }

        Model.producto.Action.editar({
            data: {
                ...obj,
                mayor_edad: !obj.mayor_edad
            },
            key_usuario: Model.usuario.Action.getKey()
        })
    }

    handleChange_ley_seca(obj) {
        if (!this.editPermiso) {
            SPopup.alert("No tienes permisos para esta acción.")
            return;
        }

        Model.producto.Action.editar({
            data: {
                ...obj,
                ley_seca: !obj.ley_seca
            },
            key_usuario: Model.usuario.Action.getKey()
        })
    }

    tiempoHabilitacion(fechaHora) {
        const ahora = new SDate();
        const fechaObjetivo = new SDate(fechaHora, "yyyy-MM-ddThh:mm:ss");

        const diferencia = fechaObjetivo.getTime() - ahora.getTime();
        if (diferencia < 0) {
            return "La fecha y hora ya han pasado";
        }

        const segundos = Math.floor(diferencia / 1000);
        const minutos = Math.floor(segundos / 60);
        const horas = Math.floor(minutos / 60);
        // const dias = Math.floor(horas / 24);

        if (horas == 0) {
            return `Faltan ${minutos % 60} minutos para la habilitación`;
        }

        return `Faltan ${horas % 24} horas, ${minutos % 60} minutos para la habilitación`;
    }

    componentHabilitado(producto) {
        let ph = {};

        if (producto?.fecha_habilitacion_automatica) {
            ph = { key: "", content: <SText color={STheme.color.danger}>{this.tiempoHabilitacion(producto?.fecha_habilitacion_automatica)}</SText> };
        } else {
            if (producto?.habilitado) {
                ph = { key: "true", content: <SText color={STheme.color.accent}>Habilitado</SText> };
            } else {
                ph = { key: "false", content: <SText color={STheme.color.danger}>deshabilitado</SText> };
            }
        }


        return <>
            <SView margin={2} row center>
                <SText fontSize={15}>Disponibilidad:</SText>
                <SHr width={10} />
                <SInput customStyle="clean" style={{ height: 50 }} cu ref={ref => this.prodHabilitado = ref} value={ph} type={"select"} options={[
                    { key: "", content: "" },
                    { key: "true", content: <SText color={STheme.color.accent}>Habilitado</SText> },
                    { key: "false", content: <SText color={STheme.color.danger}>deshabilitado</SText> },
                    { key: "30", content: <SText color={STheme.color.danger}>No disponible por 30 Min</SText> },
                    { key: "60", content: <SText color={STheme.color.danger}>No disponible por 1 hora</SText> },
                    { key: "120", content: <SText color={STheme.color.danger}>No disponible por 2 hora</SText> },
                    { key: "180", content: <SText color={STheme.color.danger}>No disponible por 3 hora</SText> },
                    { key: "360", content: <SText color={STheme.color.danger}>No disponible por 6 hora</SText> },
                    { key: "720", content: <SText color={STheme.color.danger}>No disponible por 12 hora</SText> },
                    { key: "1440", content: <SText color={STheme.color.danger}>No disponible por 1  día</SText> },
                ]} onChangeText={(select) => {
                    Model.producto.Action.editar({
                        data: {
                            ...producto,
                            habilitado: select == "true",
                            fecha_habilitacion_automatica: (select != "true" && select != "false") ? new SDate().addMinute(parseInt(select)).toString("yyyy-MM-ddThh:mm:ss") : "null"
                        },
                        key_usuario: Model.usuario.Action.getKey()
                    })
                }} />
            </SView>
        </>
    }


    onDelete(obj) {
        if (this.deletePermiso) {
            SPopup.confirm({
                title: "Eliminar Producto",
                message: "¿Seguro que desea remover el producto?",
                onPress: () => {
                    Model.producto.Action.editar({
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


    viewProductoCategoria(keyCategoria, dataProducto) {
        if (!dataProducto) return null

        this.deletePermiso = Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "delete" });
        this.editPermiso = Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" });

        this.deletePermiso = true;
        this.editPermiso = true;
        // console.log("asd",dataProducto)
        // return <SText>Aqui deberian ir los productos</SText>
        return <>
            <SList
                data={dataProducto}
                filter={(producto) => {
                    if (producto.estado == 0) {
                        return false;
                    }

                    if (producto.key_categoria_producto != keyCategoria) {
                        return false;
                    }

                    return true;
                }}
                render={(producto) => {
                    // return <SText>Un producto</SText>
                    // if (Object.values(producto).length <= 0) return null;
                    return <>
                        <SView flex card style={{
                            padding: 15,
                            borderRadius: 10,
                        }} >
                            <SView>
                                <SText fontSize={20} color={STheme.color.primary} bold padding={3}>{producto?.nombre}</SText>
                                <SHr height={15} />
                                <SView flex row
                                    style={{
                                        justifyContent: "space-evenly",
                                        marginBottom: 15
                                    }}
                                >
                                    <SView height={80} width={80} style={{ marginRight: 10 }}>
                                        <SImage src={Model.producto._get_image_download_path(SSocket.api, producto?.key)} />
                                    </SView>

                                    <SView
                                        style={{
                                            marginLeft: 20
                                        }}
                                    >
                                        <SText margin={5} fontSize={12}>Index: {producto?.index}</SText>
                                        <SText margin={5} fontSize={12}>Limite de compra: {producto?.limite_compra}</SText>
                                        <SText margin={5} fontSize={12}>Precio: {SMath.formatMoney(producto?.precio) + " Bs."}</SText>
                                    </SView>
                                </SView>
                                <SText margin={5} fontSize={12}>Descripción:</SText>
                                <SText margin={5} color={STheme.color.primary} fontSize={12}>{producto?.descripcion}</SText>
                                <SHr height={30} />

                                <SView flex row
                                    style={{
                                        justifyContent: "space-evenly"
                                    }}
                                >
                                    <SView center>
                                        <SView center>
                                            <SText>Mayor de Edad: {JSON.parse(producto?.mayor_edad) == true ? "SI" : "NO"}</SText>
                                            <SText>Ley Seca: {JSON.parse(producto?.ley_seca) == true ? "SI" : "NO"}</SText>
                                            <SHr h={5} />
                                            {this.componentHabilitado(producto)}
                                        </SView>
                                    </SView>
                                    <SView center>
                                        <SView row>
                                            <SView style={{ marginRight: 10 }} onPress={() => this.onEdit(producto)}>
                                                {this.editPermiso ? <SIcon name={"Edit"} height={30} width={30}></SIcon> : <SView />}
                                            </SView>
                                            <SView onPress={() => this.onDelete(producto)}>
                                                {this.deletePermiso ? <SIcon name={"Delete"} height={30} width={30}></SIcon> : <SView />}
                                            </SView>
                                        </SView>
                                        <SHr height={20} />
                                        <SView
                                            style={{
                                                backgroundColor: STheme.color.primary,
                                                fontSize: 15,
                                                padding: 5,
                                                borderRadius: 4
                                            }}
                                            onPress={() => SNavigation.navigate(Parent.path + "/sub_producto/list", { key_producto: producto.key })}>
                                            <SText color={STheme.color.secondary}>Ver sub productos</SText>
                                        </SView>
                                    </SView>
                                </SView>
                            </SView>
                        </SView>
                    </>
                }}
            >
            </SList>
        </>
    }

    $render() {
        // this.deletePermiso = Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "delete" });
        // this.editPermiso = Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" });

        this.deletePermiso = true;
        this.editPermiso = true;

        this.dataProducto = this.$getData();
        this.dataCategoria = this.$getDataCategoriaProducto();

        if (!this.dataProducto && !this.dataCategoria) return <SLoad />
        return <>
            <SHr height={10} />
            <SView col={"xs-12"}>
                <SList
                    data={this.dataCategoria}
                    filter={this.$filter.bind(this)}
                    order={[{ key: "index", order: "asc" }]}
                    render={(categoria) => {
                        if (Object.values(categoria).length <= 0) return null;

                        return <>
                            <SView row>
                                <SText flex fontSize={20}>{categoria.nombre}</SText>
                                <SText fontSize={15} center>Index: {categoria.index}</SText>
                            </SView>
                            <SHr height={10} />
                            {this.viewProductoCategoria(categoria.key, this.dataProducto)}
                        </>
                    }}
                />
            </SView>
        </>
    }
}
export default connect(index);