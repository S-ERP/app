import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation, SPopup, SText, SView } from 'servisofts-component';
import Model from '../../../Model';

class index extends DPA.edit {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: []
        });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }

    $getData() {
        var data = Parent.model.Action.getByKey(this.pk);
        if (!data) return null;
        if (!this.state.marca) {
            if (data.key_marca) {
                this.state.marca = Model.marca.Action.getByKey(data.key_marca);
            } else {
                this.state.marca = {}
            }
        }
        if (!this.state.tipo_producto) {
            if (data.key_tipo_producto) {
                this.state.tipo_producto = Model.tipo_producto.Action.getByKey(data.key_tipo_producto);
            } else {
                this.state.tipo_producto = {}
            }
        }

        if (!this.state.marca || !this.state.tipo_producto) return null;
        return data;
    }
    $inputs() {
        var inp = super.$inputs();
        inp["key_marca"] = {
            ...inp["key_marca"],
            editable: false,
            value: this.state?.marca?.key,
            render: (ref) => {
                var value = ref.getValue();
                if (!value) {
                    return null;
                }
                return <SView col={"xs-12"} height center style={{ padding: 8 }}>
                    <SText col={"xs-12"}>{this.state.marca?.descripcion}</SText>
                </SView>
            },
            onPress: () => {
                SNavigation.navigate("/productos/marca", {
                    onSelect: (item) => {
                        this.setState({ marca: item })
                    }
                })
            }
        }
        inp["key_tipo_producto"] = {
            ...inp["key_tipo_producto"],
            editable: false,
            value: this.state?.tipo_producto?.key,
            render: (ref) => {
                var value = ref.getValue();
                if (!value) {
                    return null;
                }
                return <SView col={"xs-12"} height center style={{ padding: 8 }}>
                    <SText col={"xs-12"}>{this.state.tipo_producto?.descripcion}</SText>
                </SView>
            },
            onPress: () => {
                SNavigation.navigate("/productos/tipo_producto", {
                    onSelect: (item) => {
                        this.setState({ tipo_producto: item })
                    }
                })
            }
        }
        return inp;
    }
    $onSubmit(data) {
        Parent.model.Action.editar({
            data: {
                ...this.data,
                ...data
            },
            key_usuario: ""
        }).then((resp) => {
            SNavigation.goBack();
        }).catch(e => {
            console.error(e);

        })
    }
}

export default connect(index);