import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation, SPopup, SText, SView } from 'servisofts-component';
import Model from '../../../Model';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "key_servicio", "estado"]
        });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    }
    $inputs() {
        var inp = super.$inputs();
        inp["key_sucursal"] = {
            ...inp["key_sucursal"],
            editable: false,
            value: this.state?.sucursal?.key,
            render: (ref) => {
                var value = ref.getValue();
                if (!value) {
                    return null;
                }
                return <SView col={"xs-12"} height center style={{ padding: 8 }}>
                    <SText col={"xs-12"}>{this.state?.sucursal?.descripcion}</SText>
                </SView>
            },
            onPress: () => {
                SNavigation.navigate("/sucursal", {
                    onSelect: (item) => {
                        this.setState({ sucursal: item })
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