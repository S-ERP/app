import { SDate, SIcon, SNavigation, SText, STheme, SView } from 'servisofts-component';
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
            menuType: "flex",
            onRefresh: (resolve) => {
                Parent.model.Action.CLEAR();
                if (resolve) resolve();

            }
        });
        this.state = {
            select: {
                "close": false,
                "open": true,
            },
            ...this.state,
        }
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
        if (!this.state.select.close) {
            if (data.estado == 2) return false;
        }
        if (!this.state.select.open) {
            if (data.estado == 1) return false;
        }
        return data.estado != 0
    }
    $order() {
        return [{ key: "numero", order: "desc",  }]
    }
    $getData() {
        return Parent.model.Action.getAll();
    }

    optionItem({ key, label, backgroundColor }) {
        var select = !!this.state.select[key]
        return <SView style={{
            paddingLeft: 8,
            paddingRight: 8,
            opacity: select ? 1 : 0.5,
            width: 100,
            backgroundColor: backgroundColor,
        }} onPress={() => {

            if (!select) {
                this.state.select[key] = true;
            } else {
                delete this.state.select[key];
            }
            this.setState({ ...this.state })
        }} row center>
            {!select ? null : <><SIcon name={"Close"} width={12} height={12} fill={STheme.color.text} /><SView width={8} /></>}
            <SText >{label}</SText>
        </SView>
    }

    $menu() {
        var items = super.$menu();
        items.push({
            children: this.optionItem({ key: "open", label: "Abiertas", backgroundColor: STheme.color.success })
        })
        items.push({
            children: this.optionItem({ key: "close", label: "Cerradas", backgroundColor: "#7C57E0" })
        })

        return items;
    }
    $item(a) {
        const usuario = Model.usuario.Action.getByKey(a.key_usuario)
        return <SView col={"xs-12"} border={STheme.color.card} padding={8} row style={{
            borderRadius: 4,
        }} onPress={this.$onSelect.bind(this, a)}>
            <SView width={26} height={26} style={{ borderRadius: 100, backgroundColor: a?.estado == 2 ? "#7C57E0" : STheme.color.success, overflow: "hidden", padding: 5 }}>
                <SIcon name='tareaclose' fill={STheme.color.text} />
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