import React, { useState } from "react";
import { SForm, SHr, SIcon, SImage, SInput, SNavigation, SPage, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";

import { Container } from "../../Components";
import SSocket from "servisofts-socket";

export default class root extends React.Component {
    state = {
        clientes: [],
        resultado: null,
    }
    componentDidMount() {
        this.loadData().then((data) => {
            this.setState({ clientes: data });
        });
    }
    async loadData() {
        const contactos = await MDL.crm.cliente.getAll();

        return contactos;
    }
    setResultado = (data) => {
        this.setState({ resultado: data });
    }
    render() {
        const now = new Date();
        const hora = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        return <SPage title={"Buscar cliente para asistencia"} >
            <Container >
                <SHr height={20} />
                <SView col={"xs-12"} card padding={15}>
                    <SText>Buscar Cliente</SText>
                    <AgregarContacto clientes={this.state.clientes} onResultado={this.setResultado} />
                </SView>
                <SHr height={20} />
                {this.state.resultado && <SView col={"xs-12"} card padding={15}>
                    <SText>Resultado:</SText>
                    <SHr width={30} />
                    {/* <SText>{JSON.stringify(this.state.resultado)}</SText> */}
                    <SView col={"xs-12"} row>
                        <SView width={70} height={70} center style={{ overflow: "hidden", borderRadius: 100, backgroundColor: STheme.color.card }} padding={5}>
                            <SImage src={SSocket.api.root + "usuario/" + this.state.resultado.key}
                                style={{ width: "100%", height: "100%", resizeMode: "cover" }} enablePreview />
                        </SView>
                        <SView width={10} />
                        <SView col={"xs-8"}>
                            <SView col={"xs-12"} row>
                                <SText color={STheme.color.lightGray}>Nombre: </SText>
                                <SView width={5} />
                                <SText bold>{this.state.resultado.nombres}</SText>
                            </SView>
                            <SView col={"xs-12"} row>
                                <SText color={STheme.color.lightGray}>Nit: </SText>
                                <SView width={5} />
                                <SText>{this.state.resultado.nit}</SText>
                            </SView>
                            <SView col={"xs-12"} row>
                                <SText color={STheme.color.lightGray}>Teléfono: </SText>
                                <SView width={5} />
                                <SText>{this.state.resultado.telefono}</SText>
                            </SView>
                            <SView col={"xs-12"} row>
                                <SText color={STheme.color.lightGray}>Correo: </SText>
                                <SView width={5} />
                                <SText>{this.state.resultado.correo}</SText>
                            </SView>
                        </SView>



                    </SView>
                    <SHr height={20} />
                    <SView col={"xs-12"} style={{
                        borderBottomColor: STheme.color.card,
                        borderBottomWidth: 1,
                    }} />
                    <SHr height={20} />
                    <SView col={"xs-12"}  >
                        <SForm
                            row
                            style={{ justifyContent: "space-between" }}
                            ref={ref => this.form = ref}
                            col={"xs-12 sm-8 md-8 lg-8 xl-8"}
                            inputs={{
                                fecha_inicio: { col: "xs-5.5", label: "Fecha de Ingreso", type: "fecha", isRequired: true, defaultValue: new Date().toISOString().split("T")[0] },
                                hora: { col: "xs-5.5", label: "Hora", type: "hour", isRequired: true, defaultValue: hora }
                            }}

                        />
                        <SView width={120} height={40} center card backgroundColor={STheme.color.primary} onPress={() => {
                            SNavigation.navigate("asistencia/nueva", { cliente: this.state.resultado });
                        }}>
                            <SText color={STheme.color.white}>Registrar entrada</SText>
                        </SView>
                        {/* <SView width={10} /> */}

                    </SView>

                </SView>}
                <SHr height={20} />
            </Container>
        </SPage>
    }
}

const AgregarContacto = ({ clientes, onResultado }) => {
    // let proveedor = null;
    // let verBoton = false;

    return (
        <SView row col={"xs-12"} style={{
            marginTop: 5,
            padding: 5,
            borderWidth: 1,
            borderColor: STheme.color.card,
            backgroundColor: STheme.color.card,
            marginBottom: 5,
            borderRadius: 4,
        }} >
            <SInput
                // ref={ref => this.inputCliente = ref}
                icon={<SText color={STheme.color.lightGray} bold>{"Cliente:"}</SText>}
                placeholder={"Escriba el nombre del cliente"}
                height={30}
                type="select2"
                options={clientes.map(c => (c?.nombres || "").trim()).filter(a => !!a)}
                onChangeText={(text) => {
                    const t = (text || "").trim();
                    // buscar match exacto (case-insensitive)
                    const encontrado = (clientes || []).find(c =>
                        ((c?.nombres || "").trim().toLowerCase() === t.toLowerCase())
                    );

                    if (encontrado) {
                        // ✅ existe: setea proveedor y limpia "nuevo"
                        console.log("encontrado", encontrado)
                        onResultado(encontrado);

                    } else {
                        // ✅ no existe: habilita +
                        onResultado(null);


                    }
                }}

            />



        </SView>
    );

}