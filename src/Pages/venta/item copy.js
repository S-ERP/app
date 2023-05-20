import DPA, { connect } from 'servisofts-page';
import { Parent } from "./index"
import { SDate, SHr, SIcon, SImage, SList, SLoad, SText, STheme, SView } from 'servisofts-component';
import Model from '../../Model';
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

    renderState() {
        var statesInfo = Model.compra_venta.Action.getStateInfo()[this.data.state];

        return <SView row center>
            <SText>{statesInfo.label}</SText>
            <SView width={8} />
            <SView backgroundColor={statesInfo.color} width={10} height={10} style={{
                borderRadius: 100
            }}>

            </SView>
        </SView>
    }
    $renderContent() {
        return <SView col={"xs-12"}>
            <SView col={"xs-12"} row center>
                <SView width={30} height={30} style={{ padding: 4 }}>
                    <SView flex height card style={{
                        overflow: 'hidden',
                    }}>
                        <SImage src={SSocket.api.root + "usuario/" + this.data.key_usuario} />
                    </SView>
                </SView>
                <SText fontSize={12}>{new SDate(this.data.fecha_on).toString("dd de MONTH, yyyy")}</SText>
                <SView flex />
                {this.renderState()}

            </SView>
            <SHr />
            <SText bold>{this.data.descripcion}</SText>
            <SText color={STheme.color.gray}>{this.data.observacion}</SText>
            <SHr />
        </SView>
    }
}
export default connect(index);