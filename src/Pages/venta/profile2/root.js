import React, { Component } from 'react';
import { SHr, SIcon, SInput, SLoad, SNavigation, SNotification, SPage, SText, STheme, SThread, SView } from "servisofts-component";
import MDL from "../../../MDL";
import SIconApp from "../../../Assets/SIconApp";
import { Dimensions, FlatList } from "react-native";
import SSocket from "servisofts-socket";
import Model from "../../../Model";
import States from "./Components/States";
import { Parent } from "..";


export default class Root extends Component {

    constructor(props) {
        super(props);
        this.state = {
            curState: "",
            totales: {
                subtotal: 0,
                descuento: 0,
                total: 0,
                gifcard: 0,
                total_a_pagar: 0,
                credito_fiscal: 0,
            },
        
        }
        this.pk = SNavigation.getParam("pk");

    }

    componentDidMount() {
        if (!Model.usuario.Action.getKey()) {
            SNavigation.navigate("/login");
        }
        this.loadData();

    }

    async loadData() {
        let empresa = MDL.empresa.select
        let data = await MDL.compra_venta.getJson(this.pk);
        let t =  MDL.compra_venta.getTotales(data.detalle)

        if (!empresa) return;
        if (!t) return;

        if (!data) return;

        if (!t.total_a_pagar) {
            t.total_a_pagar = 0;
        }
        if (this.state.totales.total_a_pagar != t.total_a_pagar) {
            this.state.totales = t;
            // this.setState({ ...this.state })
             this.forceUpdate()
        }

        if (!this.state.curState) {
            this.state.curState = data.state;
        } else {
            if (this.state.curState != data.state) {
                this.state.curState = data.state;
            }
        }

        this.state.datas = {
            ...data,
            empresa: empresa
        }
        this.forceUpdate()
      
    }



    render() {

        let dataOk = this.state.datas;
        if (!dataOk) return;

        console.log("STATEOK", dataOk?.state)
        var ITEM = States[dataOk?.state];
        if (!ITEM) {
            ITEM = States["default"];
        }
        return (
            <SPage title={"Detalle de Venta"}  >
                <SView col={"xs-12"} padding={15} >
                    <SView col="xs-12" center  >
                        <ITEM data={dataOk} />
                    </SView>
                </SView>
            </SPage>
        );
    }
}
