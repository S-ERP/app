import { SHr, SIcon, SText, STheme, SView, SNavigation } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "../../asiento_contable"
import Model from '../../../../Model';
import item from "../../asiento_contable/item"

class ListaAsientos extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            type: "component",
            params: ["key_gestion"],
            item: item,
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_empresa", "key_gestion"],
        });
        this.state = {
            select: {
                "ingreso": true,
                "egreso": true,
                "traspaso": true
            },
            ...this.state,
        }
    }
    // $allowNew() {
    //     return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
    // }
    // $allowTable() {
    //     return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "table" });
    // }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
    }
    $order() {
        // var orden = super.$order();
        // orden["codigo"] = { key: "codigo", order: "desc" }
        return [{ key: "codigo", order: "desc" }];
    }


    $filter(data) {
        return data.estado != 0 && Object.keys(this.state.select).includes(data.tipo)
    }
    $onSelect(data) {
        SNavigation.navigate(Parent.path + "/profile", { pk: data.key, key_gestion: this.$params.key_gestion })
    }

    $getData() {
        this.gestion = Model.gestion.Action.getByKey(this.$params.key_gestion);
        this.data = Parent.model.Action.getAll({ key_gestion: this.$params.key_gestion });
        if (!this.gestion || !this.data) return null;
        return this.data;
    }

    optionItem({ key, label }) {
        var select = !!this.state.select[key]
        return <SView height center style={{
            paddingLeft: 8,
            paddingRight: 8,
            opacity: select ? 1 : 0.5,
            backgroundColor: Model.asiento_contable.Action.getStateInfo(key).color + "AA"
        }} onPress={() => {

            if (!select) {
                this.state.select[key] = true;
            } else {
                delete this.state.select[key];
            }
            this.setState({ ...this.state })
        }} row>
            {!select ? null : <> <SIcon name={"Close"} width={12} height={12} fill={STheme.color.text} /> <SView width={8} /></>}
            <SText>{label}</SText>
        </SView>
    }
    $menu() {
        var items = super.$menu();

        items.push({
            label: "exportar", onPress: () => {
                console.log(this.data)
                SNavigation.navigate("/contabilidad/gestion/exportar_gestion", { pk: this.$params.key_gestion })
            }
        })
        items.push({
            children: this.optionItem({ key: "ingreso", label: "Ingreso" })
        })
        items.push({
            children: this.optionItem({ key: "egreso", label: "Egreso" })
        })
        items.push({
            children: this.optionItem({ key: "traspaso", label: "Traspaso" })
        })


        return items;
    }

}
export default connect(ListaAsientos);