import { SHr, SMath, SNavigation, SOrdenador, SText, STheme, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from ".."
import Model from '../../../../../Model';
import item from '../item';

class index extends DPA.list {
    constructor(props) {
        super(props, {
            item: item,
            type: "componentTitle",
            title: "Movimientos",
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_cuenta", "observacion"],
            params: ["key_cuenta"]
            // item: Item,

        });
        this.state = {};
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
        return data.estado != 0 && data.key_cuenta == this.$params.key_cuenta
    }
    onNew() {
        super.onNew({ key_cuenta: this.$params.key_cuenta, })
    }
    $onSelect(obj) {
        SNavigation.navigate(Parent.path, { pk: obj.key })
    }

    $getData() {
        var data = Parent.model.Action.getAll();
        if (!data) return;
        var total = 0;
        Object.values(data).filter(data => data.estado != 0 && data.key_cuenta == this.$params.key_cuenta).map((cm) => {
            total += cm.monto;
        })
        if (this.state.total != total) {
            this.setState({ total: total });
        }
        return new SOrdenador([{ key: "fecha_on", order: "desc", peso: 1 }]).ordenar(data);
    }
    $header() {
        return <SView col={"xs-12"} center>
            <SView center card style={{
                padding: 16
            }}>
                <SText fontSize={20} bold>Bs. {SMath.formatMoney(this.state.total ?? 0)}</SText>
                <SText color={STheme.color.gray}>{"Monto en la cuenta"}</SText>
            </SView>
            <SHr />
        </SView>
    }

}
export default connect(index);