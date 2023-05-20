import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";



export default new SModel<Action, Reducer>({
    info: {
        service: "compra_venta",
        component: "compra_venta_detalle"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "key_usuario": { type: "text", fk: "usuario" },
        "fecha_on": { type: "timestamp", label: "F. Creacion" },
        "estado": { type: "integer" },
        "key_compra_venta": { type: "text", fk: "compra_venta" },
        "key_sucursal": { type: "text", fk: "sucursal" },
        "tipo": { type: "text", editable: true, label: "Tipo" },
        "observacion": { type: "text", editable: true, label: "Codigo" },
        "descripcion": { type: "text", notNull: true, editable: true, label: "Descripcion" },
        "cantidad": { type: "double", editable: true, label: "Cantidad", notNull: true },
        "unidad_medida": { type: "text", editable: true, label: "Unidad de medida" },
        "precio_unitario": { type: "double", editable: true, label: "Precio unitario", notNull: true },
        "descuento": { type: "double", editable: true, label: "Descuento" },

    },
    Action,
    Reducer,
});