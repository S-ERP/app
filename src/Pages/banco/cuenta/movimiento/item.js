import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import { SDate, SHr, SList, SLoad, SMath, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../../Model';

class index extends DPA.item {
    constructor(props) {
        super(props, {
            Parent: Parent,
            // row:false
        });
    }
    $getData() {
        var data = super.$getData();
        // var banco = Model.banco.Action.getByKey(data.key_banco);
        // if (!banco) return null;
        // data.banco = banco;
        return data;
    }
    $renderContent() {
        return <SView col={"xs-12"} >

            <SView col={"xs-12"} row>
                <SView col={"xs-8"}>
                    <SText>{this.data.descripcion}</SText>
                    <SView col={"xs-12"} style={{
                        // alignItems: 'flex-end',
                    }}>
                        <SText fontSize={12} color={STheme.color.lightGray}>{new SDate(this.data.fecha_on).toString("dd,MONTH hh:mm")}</SText>
                    </SView>
                </SView>
                <SView col={"xs-4"} style={{
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                }}>
                    <SText fontSize={16}>Bs. {SMath.formatMoney(this.data.monto)}</SText>
                </SView>
            </SView>

        </SView>
    }
}
export default connect(index);