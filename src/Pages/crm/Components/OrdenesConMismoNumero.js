import React, { Component } from "react";
import {
    SDate,
    SHr,
    SImage,
    SInput,
    SList,
    SLoad,
    SMath,
    SNavigation,
    SText,
    STheme,
    SView,
} from "servisofts-component";
import SSocket from "servisofts-socket";
import Etiqueta from "./Etiqueta";
import { ScrollView } from "react-native";
export default class OrdenesConMismoNumero extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
        this.traerAllOrdenes();
    }

    async traerAllOrdenes() {
        try {
            const resp: any = await SSocket.sendPromise(
                {
                    service: "crm",
                    component: "cliente_proyecto",
                    type: "getConElMismoNumero",
                    estado: "cargando",
                    key: this.props.key_cliente_proyecto,
                },
                1000 * 60
            );

            const obj: Orden[] = Object.values(resp.data);
            this.setState({ data_ordenes: obj, loading: false });
            console.log("componente OrdenesConMismoNumero ", obj);
        } catch (error) {
            console.error("Error al traer ordenes:", error);
            this.setState({ loading: false });
        }
    }

    colorState(state) {
        const colorsMap = {
            pagado: "#A3B7F0",
            doble: "#272E35",
            cancelado: "#272E35",
            nuevo: "#A2B9F3",
        };
        // const state = state.toLowerCase();
        return colorsMap[state] || "#000000"; // negro por defecto
    }

    pintado() {
        const { data_ordenes, loading } = this.state;
        if (loading) return <SLoad />;
        if (!data_ordenes || data_ordenes.length === 0) {
            return <>
                <SText center color={STheme.color.lightGray}>No hay órdenes para mostrar.</SText>;
            </>
        }

        return data_ordenes.sort((a, b) => a.fecha_on >= b.fecha_on ? -1 : 1).map((orden, idx) => (
            <React.Fragment key={idx}>

                {/* <SView col={"xs-12"} key={idx} card style={{ margin: 8, padding: 8 }}> */}
                <SView col="xs-12" row center>
                    <SView col="xs-4" row>

                        <Etiqueta tipo_leads={orden?.state}></Etiqueta>


                        {/* <SView style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: this.colorState(orden.state), marginRight: 8, }} >
         <SText fontSize={14} color="#fff">{orden.state}</SText>
        </SView> */}
                    </SView>
                    <SView col="xs-5">
                        <SText>{orden?.proyecto?.nombre}</SText>
                    </SView>
                    <SView col="xs-3">
                        <SText col="xs-12" >{orden.codigo}</SText>
                    </SView>
                </SView>
                {/* </SView> */}

                <SHr col={"xs-12"} height={8} />
                <SHr col={"xs-12"} height={1} color={STheme.color.card} />
                <SHr col={"xs-12"} height={8} />
            </React.Fragment>

        ));
    }


    render() {
        return (
            <SView col={"xs-12"}>
                <SView
                    col={"xs-12"}
                    style={{ padding: 16, borderRadius: 16, borderWidth: 2, }}
                    border={STheme.color.card}
                    backgroundColor={STheme.color.card}
                >
                    <SView col="xs-12" row center>
                        <SView col="xs-12">
                            <SText fontSize={14} bold> Órdenes con el mismo número </SText>
                        </SView>
                    </SView>
                    <SHr col={"xs-12"} height={8} />
                    <SHr col={"xs-12"} height={1} color={STheme.color.card} />
                    <SHr col={"xs-12"} height={8} />
                    <ScrollView style={{ width: "100%", flex: 1, maxHeight: 250 }} >
                        {this.pintado()}
                    </ScrollView>

                </SView>
                <SHr height={8} />
            </SView>
        )
    }
}
