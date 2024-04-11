import { SNavigation } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../Model';
import item from './item';
import SSocket from 'servisofts-socket';
class index extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            itemType: "2",
            item: item,
            excludes: ["key", "fecha_on", "key_usuario", "data", "key_servicio", "estado", "tipo"],
            onRefresh: (resolve) => {
                Model.notification.Action.CLEAR();
                if (resolve) resolve();

            }
            // defaultParams: { key_rol: "51ee8a95-094b-41eb-8819-4afa1f349394" },
            // params: ["key_rol"]
        });
        this.state = {}
    }

    componentDidMount() {
        const limit = 10;
        let page = 0;
        SSocket.sendPromise({
            "version": "1.0",
            "service": "notification",
            "component": "notification",
            "type": "getAll",
            "estado": "cargando",
            "key_usuario": Model.usuario.Action.getKey(),
            "limit": 100,
            "offset": limit * page,
        }).then(e => {
            this.setState({ data: e.data })
        }).catch(e => {

        })
    }
    // $allowNew() {
    //     return true;
    //     return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
    // }
    // $allowTable() {
    //     return true;
    //     return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "table" });
    // }
    $allowAccess() {
        return true;
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" });
    }
    $filter(data) {
        return data.estado != "0"
    }
    $order() {
        return [{ key: "fecha_on", order: "desc" }]
    }
    $onSelect(obj) {
        if (!obj.data) return;
        var data = obj.data;
        if (!data.url) return;
        var parms = data.url.split("?");
        var url = parms[0]
        var search = parms[1]
        var json = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
        SNavigation.navigate(url, json)

    }
    $getData() {
        return this.state.data;
        // return Parent.model.Action.getAll({
        //     fecha_inicio:
        // });
    }
}
export default connect(index);