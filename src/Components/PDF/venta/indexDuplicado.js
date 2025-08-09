import React, { Component } from 'react';
import { Linking } from 'react-native'
import { SDate, SLoad, SPopup, SText, SView } from 'servisofts-component';
import { connect } from 'react-redux';
import * as SPDF from 'servisofts-rn-spdf'
import header from './header';
import body from './body';
import SSocket from 'servisofts-socket'
import Model from '../../../Model';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        if (!this.props.data) return;
        if (!this.cuotas) return;
        // this.handlePress();
    }

    getPlanDePagos() {
        if (!this.cuotas) return null
        return Object.values(this.cuotas).sort((a, b) => a.codigo - b.codigo).map((a) => {
            return <SPDF.View style={{ width: "100%", padding: 4, flexDirection: "row" }}>
                <SPDF.View style={{
                    flex: 1,
                    height: 30
                }}>
                </SPDF.View>
                <SPDF.View style={{
                    flex: 1,
                    height: 30
                }}>
                    <SPDF.Text style={{ width: "100%", fontWeight: "bold" }}>{a.codigo} - {a.descripcion}</SPDF.Text>
                    <SPDF.Text style={{ width: "100%" }}>{new SDate(a.fecha).toString("yyyy-MM-dd")}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{
                    flex: 1
                }}>
                    {/* <SPDF.Text style={{ width: "100%" }}>{new SDate(a.fecha).toString("yyyy-MM-dd")}</SPDF.Text> */}
                </SPDF.View>
                <SPDF.View style={{
                    flex: 1,
                    alignItems: "end"
                }}>
                    <SPDF.Text >{parseFloat(a.monto ?? 0).toFixed(2)}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        })
    }

    handlePress() {
        SPDF.create(<SPDF.Page style={{ width: 612, height: 791, margin: 20, padding: 20, borderWidth: 1, }} >
            <SPDF.View style={{ width: "100%", height: 4 }}></SPDF.View>
            <SPDF.Text style={{ fontWeight: "bold", width: "100%" }}>{this.props.data.descripcion}</SPDF.Text>
            <SPDF.View style={{ width: "100%", height: 4 }}></SPDF.View>
            <SPDF.Text style={{ width: "100%" }}>{this.props.data.observacion}</SPDF.Text>
            <SPDF.View style={{ width: "100%", height: 8 }}></SPDF.View>
            <SPDF.View style={{ backgroundColor: "#000000", width: "100%", height: 1 }}></SPDF.View>
            <SPDF.View style={{ width: "100%", height: 8 }}></SPDF.View>
            <SPDF.View style={{ width: "100%", height: 30, backgroundColor: "#71AF4A", alignItems: "center", justifyContent: "center" }}>
                <SPDF.Text>{this.props.data.state.toUpperCase()}</SPDF.Text>
            </SPDF.View>
            <SPDF.View style={{ width: "100%", height: 8 }}></SPDF.View>
            <SPDF.View style={{ backgroundColor: "#000000", width: "100%", height: 1 }}></SPDF.View>
            <SPDF.View style={{ width: "100%", height: 8 }}></SPDF.View>
            <SPDF.View style={{ width: "100%", height: 8 }}></SPDF.View>
            {this.getPlanDePagos()}
        </SPDF.Page >)
    }

    render() {
        this.cuotas = Model.cuota.Action.getAllByKeyCompraVenta({
            key_compra_venta: this.props.data.key
        })
        if (!this.cuotas) return <SLoad />
        return (
            <SView onPress={this.handlePress.bind(this)}>
                <SLoad type='window' hidden={!this.state.loading} />
                {this.props.children ?? <SView padding={16} card >
                    <SText>PDF Carta</SText>
                </SView>}
            </SView>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);