import DPA, { connect } from 'servisofts-page';
import { Parent } from "./index"
import Model from '../../Model';
import Item from "./item"
import { SHr, SIcon, SText, STheme, SView } from 'servisofts-component';
class index extends DPA.list {

    constructor(props) {
        super(props, {
            Parent: Parent,
            item: Item,
            title: "Compras",
            onRefresh: (resolve) => {
                Parent.model.Action.CLEAR();
                resolve(true)
            },
        });
        this.state = {
            select: {
                "cotizacion": true,
                "aprobado": true,
            },
            ...this.state,
        }
    }

    $allowNew() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
    }
    $allowTable() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "table" });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
    }
    $order() {
        return [{ key: "fecha_on", order: "desc" }]
    }
    $filter(data) {
        return data.estado != 0 && data.tipo == "compra" && Object.keys(this.state.select).includes(data.state)
    }

    optionItem({ key, label }) {
        var select = !!this.state.select[key]
        return <SView height center style={{
            paddingLeft: 8,
            paddingRight: 8,
            opacity: select ? 1 : 0.5,
            backgroundColor: Model.compra_venta.Action.getStateInfo(key).color + "88"
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
            children: this.optionItem({ key: "cotizacion", label: "Cotizaciones" })
        })
        items.push({
            children: this.optionItem({ key: "aprobado", label: "Aprobadas" })
        })
        items.push({
            children: this.optionItem({ key: "comprado", label: "Compradas" })
        })
        items.push({
            children: this.optionItem({ key: "denegado", label: "Denegadas" })
        })
        return items;
    }


    $render() {
        if (Object.keys(this.state.select).length <= 0) {
            return <SView col={"xs-12"} flex center >
                <SHr h={50} />
                <SIcon name='Alert' width={100} fill={STheme.color.card} />
                <SText center fontSize={18} style={{
                    padding: 20
                }}>"Por favor, seleccione al menos un filtro para poder ver los elementos disponibles".</SText>
                <SHr h={50} />
            </SView>
        }
        return super.$render()
    }
    $getData() {
        return Parent.model.Action.getAll();
    }

}
export default connect(index);