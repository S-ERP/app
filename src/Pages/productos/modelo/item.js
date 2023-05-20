import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import { SHr, SList, SLoad, SText, SView } from 'servisofts-component';
import Model from '../../../Model';

class index extends DPA.item {
    constructor(props) {
        super(props, {
            Parent: Parent,
            // row:false
        });
    }
    $getData() {
        var data = super.$getData();
        var marca = Model.marca.Action.getByKey(data.key_marca);
        var tipo_producto = Model.tipo_producto.Action.getByKey(data.key_tipo_producto);
        // if (!marca) return null;
        // if (!tipo_producto && data.key_tipo_producto) return null;
        data.marca = marca;
        data.tipo_producto = tipo_producto;
        return data;
    }
    $render(){
        let item = super.$render();
        if (!this.data?.marca?.key) return null;
        if (!this.data?.tipo_producto?.key) return null;
        return item;
    }
    $renderContent() {
        
        return <SView col={"xs-12"}>
            {this.buildLabel({ label: "Tipo", value: this.data.tipo_producto?.descripcion })}
            {this.buildLabel({ label: "Marca", value: this.data.marca?.descripcion })}
            {super.$renderContent()}
        </SView>
    }
}
export default connect(index);