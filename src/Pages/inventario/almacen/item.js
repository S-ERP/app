import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import { SHr, SImage, SList, SLoad, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
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
        var sucursal = Model.sucursal.Action.getByKey(data.key_sucursal);
        if (!sucursal) return null;
        data.sucursal = sucursal;
        return data;
    }
    $renderContent() {
        return <SView col={"xs-12"}>
            {super.$renderContent()}
            <SHr h={4}/>
            <SView row center col={"xs-12"}>
                <SView width={4} />
                <SText fontSize={12} color={STheme.color.lightGray}>Sucursal:</SText>
                <SView width={4} />
                <SView width={20} height={20} card style={{
                    overflow: "hidden"
                }}>
                    <SImage src={Model.sucursal._get_image_download_path(SSocket.api, this.data.sucursal.key)} />
                </SView>
                <SView width={4} />
                <SText>{this.data.sucursal.descripcion}</SText>
                <SView flex />
            </SView>
        </SView>
    }
}
export default connect(index);