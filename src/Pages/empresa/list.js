import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../Model';
import { SGradient, SNavigation, SThread, SView } from 'servisofts-component';

class index extends DPA.list {

    constructor(props) {
        super(props, {
            Parent: Parent,
            params: ["onSelect?", "pk?"],
            excludes: ["key", "fecha_on", "key_usuario", "key_servicio", "estado"],
            onRefresh: (resolve) => {
                Parent.model.Action.CLEAR();
                resolve()
            }
        });
    }
    componentDidMount() {
        if (this.$params.pk) {
            SNavigation.goBack()
            return;
        }
        if (!this.$params.onSelect) {
            if (Model.empresa.Action.getKey()) {
                new SThread(50, "asldas").start(() => {
                    SNavigation.replace("/empresa/profile", { pk: Model.empresa.Action.getKey() })
                })
            }
        }
    }
    $allowNew() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
    }
    $allowTable() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "table" });
    }
    $allowAccess() {
        return true;
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
    }
    $item(obj) {
        return <SView backgroundColor={obj?.theme?.barColor + "55"}>
            <SGradient colors={[obj?.theme?.barColor+"66", obj?.theme?.background+"66"]} deg={90} />
            {super.$item(obj)}
        </SView>
    }
    $filter(data) {
        return data.estado != 0
    }
    $getData() {
        return Parent.model.Action.getAll();
    }
}
export default connect(index);