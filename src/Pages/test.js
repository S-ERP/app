import React, { Component } from 'react';
import { SPage, SText, SView, STheme } from 'servisofts-component';
import SSocket from 'servisofts-socket';

export default class Test extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
        };
    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        try {
            const resp = await SSocket.sendPromise({
                service: "inventario",
                component: "suscripcion",
                type: "getByKeyCliente",
                key_cliente: "e68dffe3-6b6a-4190-8617-5ce2e49c80c1",
                estado: "cargando",
            });

            this.setState({ data: resp.data }); // Guardamos solo el array de suscripciones
        } catch (error) {
            console.error("Error al cargar los datos:", error);
        }
    }

    render() {
        return (
            <SPage title="Suscripciones" disableScroll>
                {this.state.data ? (
                    this.state.data.map((item, index) => (
                        <SView
                            key={index}
                            row
                            col={"xs-12"}
                            style={{
                                backgroundColor: "#fff",
                                borderBottomWidth: 1,
                                borderColor: STheme.color.lightGray + "30",
                                padding: 12,
                                marginBottom: 5,
                            }}
                        >
                            <SText>Producto: {item.key_producto}</SText>
                            <SText style={{ marginLeft: 10 }}>Estado: {item.estado}</SText>
                            <SText style={{ marginLeft: 10 }}>
                                Inicio: {item.fecha_inicio ? item.fecha_inicio.split("T")[0] : "-"}
                            </SText>
                        </SView>
                    ))
                ) : (
                    <SText style={{ margin: 12 }}>Cargando...</SText>
                )}
            </SPage>
        );
    }
}
