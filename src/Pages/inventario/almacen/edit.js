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
        return Parent.model.Action.getByKey(this.pk);
    }
    $getData() {
        var data = Parent.model.Action.getByKey(this.pk);
        if(!data) return null;
        if (!this.state.sucursal) {
            this.state.sucursal = Model.sucursal.Action.getByKey(data.key_sucursal);
        }
        if (!this.state.sucursal || !data) return null;
        return data;
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