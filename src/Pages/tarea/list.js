import { SDate, SNavigation, SText, STheme, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../Model';

class index extends DPA.list {

    // static TOPBAR = <SView col={"xs-12"} height={55} backgroundColor={"#f0f"} />
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "key_servicio", "estado"],
            // item: Item,
            params: ["cuenta?"],
            onRefresh: (resolve) => {
                Parent.model.Action.CLEAR();
                if (resolve) resolve();

            }
        });
    }
    $allowNew() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
    }
    onNew() {
        super.onNew({ key_empresa: this.empresa?.key })
    }

    $onSelect(obj) {
        if (this?.$params?.cuenta) {
            SNavigation.navigate("/banco/profile", {
                pk: obj.key,
                onSelect: super.$onSelect.bind(this)
            })
            return;
        }
        return super.$onSelect(obj);
    }
    $allowTable() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "table" });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" });
    }
    $filter(data) {
        return data.estado != 0
    }
    $getData() {
        return Parent.model.Action.getAll();
    }
    $item(a) {
        const usuario = Model.usuario.Action.getByKey(a.key_usuario)
        return <SView col={"xs-12"} border={STheme.color.card} padding={8} row style={{
            borderRadius: 4,
        }} onPress={this.$onSelect.bind(this, a)}>
            <SView width={20} height={20} style={{ borderRadius: 100, borderColor: STheme.color.success, borderWidth: 2, marginTop: 2, }}>

            </SView>
            <SView width={6} />
            <SView flex>
                <SText bold fontSize={16}>{a.descripcion}</SText>
                <SText fontSize={12} color={STheme.color.gray}>{`#${a.numero ?? 1} creado hace ${new SDate(a.fecha_on, "yyyy-MM-ddThh:mm:ss").timeSince(new SDate())} por ${usuario?.Nombres ?? ""} ${usuario?.Apellidos ?? ""}`}</SText>
            </SView>
        </SView>
    }
}
export default connect(index);