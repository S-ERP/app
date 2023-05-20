import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation, SPopup } from 'servisofts-component';
import Model from '../../../../Model';

class index extends DPA.edit {
    constructor(props) {
        super(props, {
            Parent: Parent,
            params: ["key_empresa_moneda"],
            excludes: []
        });
    }




    $allowAccess() {
        return true;
        return Parent.model.Action.getByKey(this.pk, { key_empresa_moneda: this._params.key_empresa_moneda });
        // return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }

    getOptionsTipo() {
        return [
            { key: "", content: "--" },
            { key: "billete", content: "Billete" },
            { key: "moneda", content: "Moneda" },
        ]
    }
    $inputs() {
        var inp = super.$inputs();
        // inp["observacion"].type = "textArea"
        inp["tipo"] = { label: "Tipo de dato", required: true, type: "select", defaultValue: this.data["tipo"], options: this.getOptionsTipo() }
        return inp;
    }
    $getData() {
        return Parent.model.Action.getByKey(this.pk, { key_empresa_moneda: this.$params.key_empresa_moneda });
    }
    $onSubmit(data) {
        Parent.model.Action.editar({
            data: {
                ...this.data,
                ...data
            },
            key_usuario: Model.usuario.Action.getKey()
        }).then((resp) => {
            SNavigation.goBack();
        }).catch(e => {
            console.error(e);

        })
    }
}

export default connect(index);