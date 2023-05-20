import React, { Component } from 'react';
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import Model from '../../Model';
type planesType = "contado" | "pp_discrecional" | "pp_financiero"
type PropsType = {
    data: any,
    defaultValue?: planesType,
    disabled?: Boolean,
    onChange: (obj: planesType) => any,
}

export default class TipoDePago extends Component<PropsType> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render_tipos() {
        return <SInput type='select'
            defaultValue={this.props?.data?.tipo_pago ?? (this.props.defaultValue ?? "contado")}
            center
            disabled={this.props.disabled}
            style={{
                textAlign: "center"
            }}
            options={[
                { key: "contado", content: "Al contado" },
                { key: "pp_discrecional", content: "Credito Discrecional" },
                { key: "pp_financiero", content: "Credito Financiero" },
                { key: "excel", content: "Excel" },
            ]}
            onChangeText={(evt) => {
                // this.setState({ tipo_pago: evt })
                if (this.props.onChange) {
                    this.props.onChange(evt)
                    return;
                }
                if (this.props.data) {
                    if (this.props.data.tipo_pago == evt) return;
                    this.props.data.tipo_pago = evt;
                    Model.compra_venta.Action.editar({
                        data: this.props.data,
                        key_usuario: Model.usuario.Action.getKey()
                    }).then((resp) => {
                        if (this.props.data.tipo == "compra") return;
                        Model.compra_venta_detalle.Action.cambiarPrecios({
                            key_compra_venta: this.props.data.key
                        }).then((e) => {
                            console.log(e);
                            Model.compra_venta_detalle.Action.CLEAR();
                        }).catch(e => {
                            console.error(e);
                        })
                        console.log("Se agrego el cliente con exito")
                    })
                }

            }} />
    }
    render() {

        return <SView width={200}>
            {this.render_tipos()}
        </SView>
    }
}
