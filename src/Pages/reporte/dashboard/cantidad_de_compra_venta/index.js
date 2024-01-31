import React, { Component } from 'react';
import { SHr, SImage, SList, SList2, SLoad, SNavigation, SPopup, SText, STheme, SUuid, SView } from 'servisofts-component';
import { connect } from 'react-redux';
import Model from '../../../../Model';
import SSocket from "servisofts-socket"

class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }
    loadData() {
        this.data = Model.compra_venta.Action.getAll();
        if (!this.data) return null;
        this.compras = []
        this.ventas = []
        this.estados_compra = {};
        this.estados_venta = {};
        Object.values(this.data).map(cv => {
            if (cv.tipo == "compra") {
                if (!this.estados_compra[cv.state]) this.estados_compra[cv.state] = 0;
                this.estados_compra[cv.state] += 1;
                this.compras.push(cv);
            }
            if (cv.tipo == "venta") {
                if (!this.estados_venta[cv.state]) this.estados_venta[cv.state] = 0;
                this.estados_venta[cv.state] += 1;
                this.ventas.push(cv);
            }

        })
        return true;
    }

    render_list() {
        this.loadData()
        return <SView col={"xs-12"} row>
            {this.render_item({
                label: "Compras",
                cantidad: this.compras?.length,
                estados: this.estados_compra ?? {},
                blackList: ["vendido"],
                key_page: "18725a49-6a1e-41b0-ae4c-4ca9454b1436",
                onPress: () => {
                    SPopup.confirm({
                        title: "Esta seguro que quiere salir del DashBoard?",
                        message: "Se le enviara a la lista de compras.",
                        onPress: () => { SNavigation.navigate("/compra") }
                    })
                }
            })}
            <SView flex />
            {this.render_item({
                label: "Ventas",
                cantidad: this.ventas?.length,
                estados: this.estados_venta ?? {},
                blackList: ["comprado"],
                key_page: "93573375-ff60-4354-895d-8110bf849399",
                onPress: () => {
                    SPopup.confirm({
                        title: "Esta seguro que quiere salir del DashBoard?",
                        message: "Se le enviara a la lista de ventas.",
                        onPress: () => { SNavigation.navigate("/venta") }
                    })
                }
            })}
        </SView >
    }



    render_item({ label, cantidad, estados, key_page, blackList, onPress }) {
        var props_imp = {
            col: "xs-12 sm-6", card: true, margin: 4,
            padding: 8,
        }
        if (!this.data) return <SLoad type='skeleton' {...props_imp} height={180} />
        // if (!this.estados) return <SLoad type='skeleton' {...props_imp} />
        return <SView {...props_imp} onPress={onPress}>
            <SView row col={"xs-12"} center >
                <SView width={45} height={45} card style={{ overflow: "hidden" }}>
                    <SImage src={Model.page._get_image_download_path(SSocket.api, key_page)} />
                </SView>
                <SView width={8} />
                <SText bold flex fontSize={18}>{label}</SText>
            </SView>
            <SHr />
            <SList2 space={0}
                data={["cotizacion", "aprobado", "vendido", "comprado", "denegado"]}
                horizontal
                key={SUuid()}
                style={{
                    justifyContent: 'space-between',
                }}
                center
                filter={obj => !(blackList ?? []).includes(obj)}
                render={(estado) => {
                    var kcv = Model.compra_venta.Action.getStateInfo(estado)
                    return this.listItem({ label: kcv.label, color: kcv.color, cantidad: estados[estado] ?? 0 })
                }}
            />
            <SView padding={4} row style={{ alignItems: "center" }}>
                <SView style={{ width: 30, height: 30, borderRadius: 100, backgroundColor: STheme.color.card }} center>
                    <SText bold>{cantidad}</SText>
                </SView>
                <SView width={8} />
                <SText bold>{"Total"}</SText>
            </SView>

        </SView >
    }
    listItem({ cantidad, label, color }) {
        return <SView padding={4} row style={{ alignItems: "center" }}>
            <SView style={{ width: 30, height: 30, borderRadius: 100, backgroundColor: color + "66" }} center>
                <SText bold>{cantidad}</SText>
            </SView>
            <SView width={8} />
            <SText bold>{label}</SText>
        </SView>
    }
    render() {
        return <SView col={"xs-12"} center >
            <SText col={"xs-12"} center bold color={STheme.color.lightGray}>Detalle de compras y ventas.</SText>
            <SHr />
            {this.render_list()}
        </SView>
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);