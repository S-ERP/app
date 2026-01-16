import React, { useState } from "react";
import { SForm, SHr, SIcon, SImage, SInput, SNavigation, SPage, SText, STheme, SView, SDate } from "servisofts-component";
import MDL from "../../MDL";

import { Container } from "../../Components";
import SSocket from "servisofts-socket";
import Paquete from "servisofts-component/img/Paquete";

export default class root extends React.Component {
    state = {
        clientes: [],
        resultado: null,
        paquete: null,
    }
    componentDidMount() {
        this.loadData().then((data) => {
            this.setState({ clientes: data });
        });

        // SSocket.sendPromise({
        //     service: "inventario",
        //     component: "suscripcion",
        //     estado: "cargando",
        //     type: "getByKeyCliente",
        //     key_cliente: "e68dffe3-6b6a-4190-8617-5ce2e49c80c1"

        // }).then(e => {

        //     console.log(e);
        // }).catch(e => {
        //     console.error(e);
        // })
    }
    async loadData() {
        const contactos = await MDL.crm.cliente.getAll();

        return contactos;
    }
    setResultado = (data) => {
        this.setState({ resultado: data });
        SSocket.sendPromise({
            service: "inventario",
            component: "suscripcion",
            estado: "cargando",
            type: "getByKeyCliente",
            key_cliente: data.key

        }).then(e => {
            const hoy = new Date();
            const vigente = e.data.filter(item => {
                const inicio = new Date(item.fecha_inicio);
                const fin = new Date(item.fecha_fin);

                return hoy >= inicio && hoy <= fin;
            });
            console.log("paquete actual ", vigente)
            this.setState({ paquete: vigente[0] });
        }).catch(e => {
            console.error(e);
        })

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
                    <SView col={"xs-12"} center>
                        <SView width={200} height={40} padding={15} backgroundColor={this.state.paquete ? STheme.color.success + "60" : STheme.color.danger + "60"}
                            style={{
                                borderWidth: 1,
                                borderColor: this.state.paquete ? STheme.color.success : STheme.color.danger,
                                borderRadius: 4
                            }} center>
                            <SText bold fontSize={16}>{this.state.paquete ? "PAQUETE ACTIVO" : "PAQUETE INACTIVO"}</SText>
                        </SView>
                    </SView>
                    <SHr height={20} />
                    <SView col={"xs-12"} style={{
                        borderBottomColor: STheme.color.card,
                        borderBottomWidth: 1,
                    }} />
                    <SHr height={20} />
                    {this.state.paquete?.producto &&
                        <SView col={"xs-12"} row padding={15} style={{
                            borderWidth: 1,
                            borderColor: STheme.color.card,
                            borderRadius: 4,
                        }} backgroundColor={STheme.color.card}>
                            <SView col={"xs-12"} row>
                                <SText fonSize={16} color={STheme.color.lightGray}>Paquete:</SText>
                                <SView width={5} />
                                <SText fonSize={16} bold>{this.state.paquete?.producto?.nombre}</SText>
                            </SView>
                            <SHr />
                            <SView col={"xs-6"} row>
                                <SText fonSize={16} color={STheme.color.lightGray}>Fecha Inicio:</SText>
                                <SView width={5} />
                                <SText fonSize={16} bold>{new SDate(this.state.paquete?.fecha_inicio).toString("dd/MM/yyyy")}</SText>
                            </SView>
                            <SView col={"xs-6"} row>
                                <SText fonSize={16} color={STheme.color.lightGray}>Fecha Fin:</SText>
                                <SView width={5} />
                                <SText fonSize={16} bold>{new SDate(this.state.paquete?.fecha_fin).toString("dd/MM/yyyy")}</SText>
                            </SView>
                        </SView>
                    }
                    <SHr height={20} />
                    {this.state.paquete &&
                        <SView col={"xs-12"} style={{
                            borderWidth: 1,
                            borderColor: STheme.color.warning,
                            borderRadius: 4,
                        }} padding={15}>
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
                            <SView col={"xs-12"} style={{
                                alignItems: "flex-end"
                            }}>
                                <SView width={150} height={40} center backgroundColor={STheme.color.primary} onPress={() => {
                                    // SSocket.sendPromise({
                                    //     service: "inventario",
                                    //     component: "suscripcion",
                                    //     estado: "cargando",
                                    //     type: "getByKeyCliente",
                                    //     key_cliente: data.key

                                    // }).then(e => {
                                    //     console.log(e)
                                    // }).catch(e => {
                                    //     console.error(e);
                                    // })
                                }} style={{ borderRadius: 4 }} >
                                    <SText center color={STheme.color.white}>Registrar asistencia</SText>
                                </SView>
                            </SView>
                            {/* <SView width={10} /> */}

                        </SView>}


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