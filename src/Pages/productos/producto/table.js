import { SLoad, SMath, STable, STable2, HeaderProps } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../Model';

class index extends DPA.table {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key",]
        });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "table" })
    }
    $filter(data) {
        return data.estado != 0
    }
    // $headers() {
    //     let headers = super.$headers();
    //     headers["key_modelo"].render = (itm) => {

    //     }
    //     return headers;
    // }
    $getData() {
        this.data = Parent.model.Action.getAllRecursive();
        this.tipos_de_productos = Model.tipo_producto.Action.getAll();
        this.marcas = Model.marca.Action.getAll();
        this.modelos = Model.modelo.Action.getAll();
        this.inventario_datos = Model.inventario_dato.Action.getAll();
        if (!this.data) return false;
        if (!this.tipos_de_productos) return false;
        if (!this.marcas) return false;
        if (!this.modelos) return false;
        if (!this.inventario_datos) return false;
        return this.data;
    }

    getHeadersForData() {
        let headers: [HeaderProps] = [];
        Object.values(this.inventario_datos).map((inv_dato) => {
            console.log(inv_dato)
            headers.push({
                key: "datos-" + inv_dato.key,
                label: inv_dato.descripcion,
                width: 150,
                render: (arr) => { return arr.find(t => t.key_inventario_dato == inv_dato.key)?.descripcion }
            })

        })
        return headers;
    }
    $render() {
        if (!this.$getData()) return <SLoad />
        console.log(this.inventario_datos);
        console.log(this.data);
        return <STable2
            data={this.data}
            header={[
                { key: "index", label: "#" },
                { key: "modelo/tipo_producto/descripcion", label: "Tipo", width: 100, options: Object.values(this.tipos_de_productos).map(a => a.descripcion) },
                { key: "modelo/marca/descripcion", label: "Marca", width: 100, options: Object.values(this.marcas).map(a => a.descripcion) },
                { key: "modelo/descripcion", label: "Modelo", width: 100, options: Object.values(this.modelos).map(a => a.descripcion) },
                { key: "descripcion", label: "Desc", width: 180 },
                { key: "precio_compra", label: "P.C.", width: 100, sumar: true, renderTotal: (t) => SMath.formatMoney(t), render: (t) => SMath.formatMoney(t) },
                { key: "precio_venta", label: "P.V.", width: 100, sumar: true, renderTotal: (t) => SMath.formatMoney(t), render: (t) => SMath.formatMoney(t) },
                { key: "precio_venta_credito", label: "P.V.C.", width: 100, sumar: true, renderTotal: (t) => SMath.formatMoney(t), render: (t) => SMath.formatMoney(t) },
                { key: "state/label", label: "Estado", width: 150 },
                ...this.getHeadersForData()
            ]}
        />
    }
}
export default connect(index);