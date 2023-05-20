import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import { SDate, SHr, SIcon, SImage, SList, SLoad, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
class index extends DPA.item {
    constructor(props) {
        super(props, {
            Parent: Parent,
            // row:false
        });
    }
    $getData() {
        var data = super.$getData();
        return data;
    }

    $renderContent() {
        return <SView col={"xs-12"}>
            <SText fontSize={16} bold>{this.data?.descripcion}</SText>
            <SText fontSize={12} >{this.data?.observacion}</SText>
            <SView col={"xs-12"} row>
                <SView flex />
                <SText fontSize={12} color={STheme.color.lightGray}>{new SDate(this.data?.fecha_on).toString("dd de MONTH del yyyy, hh:mm")}</SText>
            </SView>
        </SView>
    }
}
export default connect(index);