import React, { Component } from 'react';
import { SDate, SLoad, SPopup, SText, SView } from 'servisofts-component';
import { connect } from 'react-redux';
import * as SPDF from 'servisofts-rn-spdf'
import Model from '../../../Model';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        // if (!this.props.data) return;
        // if (!this.cuotas) return;
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
        SPDF.create(<SPDF.Page style={{ width: 612, height: 791, margin: 50, padding: 10, }} >
            <SPDF.Text style={{ fontWeight: "bold", fontSize: 25 }}>{"RECIBO"}</SPDF.Text>
            <SPDF.View style={{ width: "100%", height: 8 }}></SPDF.View>
            <SPDF.View style={{
                width: "100%",
                padding: 4,
            }}>
                <SPDF.View style={{
                    width: "100%",
                    flexDirection: "row",
                }}>
                    <SPDF.View >
                        <SPDF.Text style={{ width: "100%", }}>{"DARMOTOS SRL"}</SPDF.Text>
                        <SPDF.View style={{ width: "100%", height: 4 }}></SPDF.View>
                        <SPDF.Text style={{ width: "100%", }}>{"Suc. Ciudad Satelite"}</SPDF.Text>
                        <SPDF.View style={{ width: "100%", height: 4 }}></SPDF.View>
                        <SPDF.Text style={{ width: "100%", }}>{"P.V. PUESTO DE CAJA 1"}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1 }}></SPDF.View>
                    <SPDF.View style={{ width: 100 }}>
                        <SPDF.Text style={{}}>{new SDate().toString("DAY, dd de MONTH del yyyy")}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
            <SPDF.View style={{ width: "100%", height: 16 }}></SPDF.View>
            <SPDF.View style={{
                width: "100%",
                borderWidth: 1,
                padding: 4,
            }}>
                <SPDF.View style={{ width: "100%", height: 4 }}></SPDF.View>
                <SPDF.Text style={{ width: "100%", }}>{"Cliente:  Ricardo Paz Demiquel"}</SPDF.Text>
                <SPDF.View style={{ width: "100%", height: 4 }}></SPDF.View>
                <SPDF.Text style={{ width: "100%", }}>{"Nit:  6392496"}</SPDF.Text>
                <SPDF.View style={{ width: "100%", height: 4 }}></SPDF.View>
            </SPDF.View>
            <SPDF.View style={{ width: "100%", height: 16 }}></SPDF.View>
            {/* {this.getPlanDePagos()} */}
        </SPDF.Page >)
    }

    render() {
        // this.cuotas = Model.cuota.Action.getAllByKeyCompraVenta({
        //     key_compra_venta: this.props.data.key
        // })
        // if (!this.cuotas) return <SLoad />
        console.log(this.props)
        return (<SView onPress={this.handlePress.bind(this)}>
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