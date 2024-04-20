import { SDate, SText, STheme, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../Model';

class index extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "estado", "key_servicio", "key_empresa", "key_usuario", "fecha_on", "lat", "lng", "direccion"],
            defaultParams: { key_rol: "51ee8a95-094b-41eb-8819-4afa1f349394" },
            // params: ["key_rol"],
            onRefresh: (resolve) => {
                Model.cliente.Action.CLEAR();
                // Model.usuario.Action.CLEAR();
                // Model.usuarioRol.Action.CLEAR();
                resolve();
            }
        });
    }

    componentDidMount() {
        // Model.compra_venta.Action.getClientes().then(resp => {
        //     this.setState({ data: resp.data })
        //     console.log(resp);
        // }).catch(e => {
        //     console.error(e);
        // })
    }
    $allowNew() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
    }
    $allowTable() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "table" });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" });
    }
    $filter(data) {
        return data.estado != "0"
    }
    $getData() {
        return Model.cliente.Action.getAll();
    }


}
export default connect(index);