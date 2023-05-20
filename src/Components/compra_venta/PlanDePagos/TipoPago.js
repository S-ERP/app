import React, { Component } from 'react';
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
// props = {disabled}
export default class TipoPago extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render_tipos() {
        return <SInput type='select'
            defaultValue={this.props.defaultValue ?? "contado"}
            center
            style={{
                textAlign: "center"
            }}
            options={[
                { key: "contado", content: "Al contado" },
                { key: "pp_discrecional", content: "Credito Discrecional" },
                { key: "pp_financiero", content: "Credito Financiero" },
            ]}
            onChangeText={(evt) => {
                // this.setState({ tipo_pago: evt })
                if (this.props.onChange) {
                    this.props.onChange(evt)
                }
            }} />
    }

    render() {

        return <SView width={200}>
            {this.render_tipos()}
        </SView>
    }
}
