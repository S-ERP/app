import DPA, { connect } from 'servisofts-page';
import Model from '../../../../Model';
import { SNavigation, SPopup } from 'servisofts-component';

const Parent = {
    name: "empresa_usuario",
    path: "/empresa_usuario",
    model: Model.empresa_usuario
}
class index extends DPA.list {
    constructor(props) {
        super(props, {
            page: false,
            Parent: Parent,
            type: "componentTitle",
            title: "Usuarios",
            excludes: ["key", "fecha_on", "key_usuario", "key_servicio", "estado", "lat", "lng", "observacion", "key_empresa", "direccion"],
            // item: Item,

        });
    }
    $allowNew() {
        return true;
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
    }

    $allowAccess() {
        return true;
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" });
    }
    $filter(data) {
        return data.estado != 0
    }
    onNew() {
        SNavigation.navigate("/usuario", {
            onSelect: (a) => {
                console.log(a);
                // if(this.data.)
                Model.empresa_usuario.Action.registro({
                    data: {
                        key_usuario: a.key,
                        key_empresa: this.props.key_empresa,
                        alias: `${a.Nombres} ${a.Apellidos}`
                    }
                })
            }
        })
        // super.onNew({ key_empresa: this.props.key_empresa })
    }
    // $onSelect(data) {
    //     return;
    // }
    $getData() {
        // var empresa = Model.empresa.Action.getByKey(this.props.key_empresa)
        return Parent.model.Action.getAllByKeyEmpresa(this.props.key_empresa);
    }
}
export default connect(index);