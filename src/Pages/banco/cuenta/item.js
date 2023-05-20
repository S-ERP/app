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
        var banco = Model.banco.Action.getByKey(data.key_banco);
        if (!banco) return null;
        data.banco = banco;
        return data;
    }
    $renderContent() {
        return <SView col={"xs-12"}>
            {this.buildLabel({ label: "Banco", value: this.data.banco.descripcion })}
            {super.$renderContent()}
        </SView>
    }
}
export default connect(index);