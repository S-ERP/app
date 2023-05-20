import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SGrid, SHr, SImage, SInput, SList, SLoad, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import SSocket from 'servisofts-socket';
class SelectMonedas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            select: {}
        };
    }

    item(data) {
        var select = false;
        if (this.state.moneda?.key == data.key) {
            select = true;
        }
        return <SView card width={100} style={{
            padding: 4,
            opacity: !select ? 0.5 : 1,
        }} onPress={() => {
            this.setState({ moneda: data })
        }} center>
            <SText center>{data.observacion} {data.tipo_cambio}</SText>
            <SText center fontSize={10}>{data.descripcion}</SText>
        </SView>
    }
    getTotal() {
        if (!this.state.select) return null
        if (this.props.onChange) {
            this.props.onChange(this.state.select)
        }
        var total = 0;
        Object.values(this.state.select).map((obj) => {
            var moneda = this.monedas[obj.key_empresa_moneda];
            var monto = (obj.valor * obj.cantidad) * moneda.tipo_cambio;
            total += monto;
        })
        return <SText fontSize={20}>TOTAL: {total}</SText>
    }

    getCant(obj) {
        var dat = this.state.select[obj.key];
        if (!dat) return;
        if (!dat.cantidad) return;
        var cantidad = dat.cantidad
        return <SView backgroundColor={STheme.color.danger}
            onPress={() => {
                if (!this.state.select[obj.key]) {
                    obj.cantidad = 1;
                    this.state.select[obj.key] = obj;
                } else {
                    this.state.select[obj.key].cantidad = this.state.select[obj.key].cantidad - 1;
                }

                this.setState({ ...this.state })
                // SPopup.alert(obj.valor)
            }}
            style={{
                padding: 12,
                width: 24,
                height: 24,
                position: "absolute",
                borderRadius: 100,
                right: 0,
                bottom: 0,
            }} center>
            <SText bold fontSize={14}>{cantidad}</SText>
        </SView>
    }
    moneda(obj) {

        var col = "xs-6"
        var width = 80;
        var height = 80;
        if (obj.tipo == "billete") {
            col = "xs-12"
            width = width * 2;
            height = height
        }
        return <SView col={col} style={{
            width: width,
            height: height,
            padding: 4,
        }} center onPress={() => {
            if (!this.state.select[obj.key]) {
                obj.cantidad = 1;
                this.state.select[obj.key] = obj;
            } else {
                this.state.select[obj.key].cantidad = this.state.select[obj.key].cantidad + 1;
            }

            this.setState({ ...this.state })
            // SPopup.alert(obj.valor)
        }}>
            <SView col={"xs-12"} height style={{
                // borderRadius: 16,
                overflow: "hidden"
            }}>
                <SImage src={Model.empresa_moneda_detalle._get_image_download_path(SSocket.api, obj.key)} />
            </SView>
            <SView backgroundColor={STheme.color.secondary + "aa"} style={{
                padding: 2,
                position: "absolute",
                borderRadius: 4,
                left: 8,
                top: 8,
            }}>
                <SText bold fontSize={10} primary>{this.state.moneda.observacion}{obj.valor}</SText>
            </SView>
            {this.getCant(obj)}
        </SView>
    }

    renderDetalles() {
        if (!this.state.moneda) return null;
        // var monedas_detalle = Model.empresa_moneda_detalle.Action.getAll({ key_empresa_moneda: this.state.moneda.key });
        var monedas_detalle = Model.empresa_moneda_detalle.Action.getAllByEmpresa({ key_empresa: this.props.key_empresa });
        if (!monedas_detalle) return <SLoad />
        // var billetes = Object.values(monedas).find(a => a.descripcion == "Bolivianos");
        return <SView col={"xs-12"} row>
            <SList
                col={"xs-6"}
                filter={(a) => !!a.key_empresa_moneda && a.key_empresa_moneda == this.state.moneda.key && a.estado != 0 && a.tipo == "billete"}
                data={monedas_detalle}
                horizontal
                center
                space={0}
                order={[{ key: "valor", order: "desc" }]}
                render={this.moneda.bind(this)} />
            <SList
                col={"xs-6"}
                filter={(a) => !!a.key_empresa_moneda && a.key_empresa_moneda == this.state.moneda.key && a.estado != 0 && a.tipo == "moneda"}
                data={monedas_detalle}
                horizontal
                center
                space={0}
                order={[{ key: "valor", order: "desc" }]}
                render={this.moneda.bind(this)} />
        </SView>
    }

    render() {
        if (!this.props.key_empresa) return null;
        var monedas = Model.empresa_moneda.Action.getAll({ key_empresa: this.props.key_empresa });
        this.monedas = monedas;
        if (!monedas) return <SLoad />
        if (!this.state.moneda) {
            var mod = Object.values(monedas).find(a => a.descripcion == "Bolivianos");
            this.setState({ moneda: mod })
        }
        return (
            <SView col={"xs-12"} onLayout={(evt) => {
            }} >
                <SHr h={1} color={STheme.color.card} />
                <SHr height={8} />
                <SList horizontal center data={monedas} render={this.item.bind(this)} order={[{ key: "tipo_cambio", order: "asc" }]} />
                <SHr height={8} />
                {this.getTotal()}
                <SHr h={1} color={STheme.color.card} />
                {this.renderDetalles()}
                <SHr h={1} color={STheme.color.card} />
                <SHr height={50} />
            </SView>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(SelectMonedas);