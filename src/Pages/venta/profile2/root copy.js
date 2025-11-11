import React from "react";
import { SHr, SIcon, SInput, SLoad, SNavigation, SNotification, SPage, SText, STheme, SThread, SView } from "servisofts-component";
import MDL from "../../../MDL";
import SIconApp from "../../../Assets/SIconApp";
import { Dimensions, FlatList } from "react-native";
import SSocket from "servisofts-socket";
import Model from "../../../Model";
import States from "./Components/States";
import { Parent } from "..";


export default class Root extends React.Component {

    constructor(props) {
        super(props, {
            Parent: Parent,
            type: "pageContainer",
            title: "Venta",
            excludes: ["key", "key_usuario", "key_servicio"]
        });
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

    getData() {
        console.log("PK", this.pk)
        this.empresa = Model.empresa.Action.getSelect();
        var data = Parent.model.Action.getByKey(this.pk);
        this.compra_venta_detalle = Model.compra_venta_detalle.Action.getAll({
            key_compra_venta: this.pk
        })

        var t = Model.compra_venta_detalle.Action.getTotales({
            key_compra_venta: this.pk
        })
        console.log("empresa", this.empresa)
        // if (!this.empresa) return null;
        if (!this.empresa) {
            console.log("Esperando empresa...");
            SThread(500, "reload_empresa", () => this.getData()).start();
            return null;
        }

        //   console.log("compra_venta_detalle", this.compra_venta_detalleempresa)
        // if (!this.compra_venta_detalleempresa)
        console.log("compra_venta_detalle", this.compra_venta_detalle)
        if (!this.compra_venta_detalle) return;
        console.log("t", t)
        console.log("dataqq", data)
        if (!t) return null;
        // if (!data) return;
        if (!data) {
            console.log("Esperando datos de ventas...");
            SThread(500, "reload_datas", () => this.getData()).start();
            return null;
        }
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
        console.log("DATAaaaa", data)

        // this.setState({
        //     datas: {
        //         ...data,
        //         empresa: this.empresa
        //     }
        // })
        let datas = {
            ...data,
            empresa: this.empresa
        }
        this.state.datas = {
            ...data,
            empresa: this.empresa
        }

        // if (!datas) return <SLoad />;
        return datas
    }

    render() {
        const { datas } = this.state;
        // console.log("STATE0", this.state)
        // console.log("STATE", this.state.datas)
        // console.log("STATE2", datas)
        // if (!this.state.datas) return <SLoad />;
        // this.data = this.state.datas;
        // if (!this.getData()) return <SLoad />;
        let datos = this.getData();
        console.log("DATA", datos)
        if (!datos) return <SLoad />;

        this.data = datos;

        // if (!datas) return <SLoad />;
        // this.data = datas;

        var ITEM = States[this.data?.state];
        if (!ITEM) {
            ITEM = States["default"];
        }
        return (
            <SPage title={"Detalle de Venta"}  >
                <SView col={"xs-12"} padding={15} >
                    <SView col="xs-12" center  >
                        <ITEM data={this.data} />
                    </SView>
                </SView>
            </SPage>
        );
    }
}
