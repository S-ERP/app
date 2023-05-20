import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation, SPopup, SText, SView } from 'servisofts-component';
import Model from '../../../Model';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "key_servicio", "estado"],
            params: ["key_marca?"]
        });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    }
    $getData() {
        if (this._params.key_marca) {
            var marca = Model.marca.Action.getByKey(this._params.key_marca);
            if (!marca) return false;
            if (marca.key != this.state.marca?.key) {
                this.setState({ marca: marca })
            }
            return {};
        }
        return {};
    }


    $inputs() {
        var inp = super.$inputs();
        inp["key_marca"] = {
            ...inp["key_marca"],
            editable: false,
            value: this.state?.marca?.key,
            required:true,
            render: (ref) => {
                var value = ref.getValue();
                if (!value) {
                    return null;
                }
                return <SView col={"xs-12"} height center style={{ padding: 8 }}>
                    <SText col={"xs-12"}>{this.state?.marca?.descripcion}</SText>
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
            required:true,
            render: (ref) => {
                var value = ref.getValue();
                if (!value) {
                    return null;
                }
                return <SView col={"xs-12"} height center style={{ padding: 8 }}>
                    <SText col={"xs-12"}>{this.state?.tipo_producto?.descripcion}</SText>
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
        Parent.model.Action.registro({
            data: data,
            key_usuario: Model.usuario.Action.getKey()
        }).then((resp) => {
            this.$submitFile(resp.data.key);
            SNavigation.replace(Parent.path + "/profile", { pk: resp.data.key });
        }).catch(e => {
            console.error(e);

        })
    }
}

export default connect(index);