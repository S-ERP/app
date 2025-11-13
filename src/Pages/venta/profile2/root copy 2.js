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
            }
            // proveedor: {}
        }
        this.pk = SNavigation.getParam("pk");

    }

    componentDidMount() {
        if (!Model.usuario.Action.getKey()) {
            SNavigation.navigate("/login");
        }
        // this.getData();

    }

     async loadData() {
        let pk = SNavigation.getParam("pk");
        console.log("PK", pk)
     }



    render() {
        let pk = SNavigation.getParam("pk");
        console.log("PK", pk)
        let empresa = Model.empresa.Action.getSelect();
        let data = Parent.model.Action.getByKey(pk);
        // let compra_venta_detalle = Model.compra_venta_detalle.Action.getAll({
        //     key_compra_venta: SNavigation.getParam("pk")
        // })

        let t = Model.compra_venta_detalle.Action.getTotales({
            key_compra_venta: pk
        })
        console.log("CERO")
        if (!empresa) return <SLoad />
        console.log("UNO")

        // if (!this.compra_venta_detalleempresa)
        // if (!compra_venta_detalle) return null;
        console.log("DOS")

        console.log("AQUÍ ME TIRO: Model.compra_venta_detalle.Action.getTotales", t)
        if (!t) return <SLoad />;
        console.log("TRES")
        // if (!data) return;

        if (!data) return <SLoad />
        console.log("CUATRO")

        // this.calcularTotal();
        if (!t.total_a_pagar) {
            t.total_a_pagar = 0;
        }
        if (this.state.totales.total_a_pagar != t.total_a_pagar) {
            this.state.totales = t;
            this.setState({ ...this.state })
        }

        if (!this.state.curState) {
            this.state.curState = data.state;
        } else {
            if (this.state.curState != data.state) {
                this.state.curState = data.state;
            }
        }


        let datas = {
            ...data,
            empresa: empresa
        }
        if (!datas) return <SLoad />;
        console.log("CINCO")
        // var ITEM = States[this.data?.state];
        // if (!ITEM) {
        //     ITEM = States["default"];
        // }


        var ITEM = States[datas.state];
        if (!ITEM) {
            ITEM = States["default"];
        }
        return (
            <SPage title={"Detalle de Venta"}  >
                <SView col={"xs-12"} padding={15} >
                    <SView col="xs-12" center  >
                        <ITEM data={datas} />
                    </SView>
                </SView>
            </SPage>
        );
    }
}
