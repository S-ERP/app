import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import { SDate, SHr, SIcon, SImage, SList, SLoad, SText, STheme, SView } from 'servisofts-component';
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
        this.modelo = Model.modelo.Action.getByKey(data.key_modelo)
        if (!this.modelo) return null;
        this.marca = Model.marca.Action.getByKey(this.modelo.key_marca)
        this.tipo_producto = Model.tipo_producto.Action.getByKey(this.modelo.key_tipo_producto)
        // if (!this.marca) return null;
        // if (!this.tipo_producto) return null;
        return data;
    }

    // renderState() {
    //     var statesInfo = Model.compra_venta.Action.getStateInfo()[this.data.state];
    //     return <SView row center>
    //         <SText>{statesInfo.label}</SText>
    //         <SView width={8} />
    //         <SView backgroundColor={statesInfo.color} width={10} height={10} style={{
    //             borderRadius: 100
    //         }}>

    //         </SView>
    //     </SView>
    // }


    renderCreador() {
        return <SView col={"xs-12"} row center>
            <SView width={30} height={30} style={{ padding: 4 }}>
                <SView flex height card style={{
                    overflow: 'hidden',
                }}>
                    <SImage src={SSocket.api.root + "usuario/" + this.data.key_usuario} />
                </SView>
            </SView>
            <SText fontSize={12}>{new SDate(this.data.fecha_on).toString("dd de MONTH, yyyy")}</SText>
            <SView flex />
            {/* {this.renderState()} */}

        </SView>
    }
    getEstado() {
        var text = "";
        if (this.data.key_almacen) {
            text = "En almacen"
        }
        if (this.data.key_cliente) {
            text = "Vendido"
        }
        return <SText>{text}</SText>
    }
    $renderContent() {
        return <SView col={"xs-12"}>

            <SHr />
            <SView col={"xs-12"}>
                <SText bold fontSize={18}>{this.data.descripcion}</SText>
                <SText color={STheme.color.gray}>{this.data.observacion}</SText>
                <SHr />
                {this.buildLabel({ label: "Tipo", value: this.tipo_producto?.descripcion })}
                {this.buildLabel({ label: "Marca", value: this.marca?.descripcion })}
                {this.buildLabel({ label: "Modelo", value: this.modelo?.descripcion })}
                {/* {this.buildLabel({ label: "P. Compra", value: "Bs. " + (this.data.precio_compra ?? 0) })} */}
                {/* {super.$renderContent()} */}
                {this.getEstado()}
            </SView>
            <SHr />
            {this.renderCreador()}
        </SView>
    }
}
export default connect(index);