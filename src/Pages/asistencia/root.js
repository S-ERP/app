import React, { useState } from "react";
import { SForm, SHr, SImage, SInput, SPage, SText, STheme, SView, SDate, SNotification } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import { Container } from "../../Components";

export default class Root extends React.Component {
    state = {
        clientes: [],
        sucursales: [],
        resultado: null,
        paquete: null,
        selectedSucursal: null,
    };

    componentDidMount() {
        this.loadDataSucursales().then((data) => {
            this.setState({ sucursales: data });
        });
        this.loadData().then((data) => {
            this.setState({ clientes: data });
        });
    }

    loadDataSucursales = async () => {
        MDL.empresa._full = null;
        const empresa = await MDL.empresa.getFull();
        const sucursales = empresa.sucursales ? Object.values(empresa.sucursales) : [];
        console.log("Sucursales:", sucursales);
        return sucursales;
    };

    async loadData() {
        const contactos = await MDL.crm.cliente.getAll();
        return contactos;
    }

    setResultado = (data) => {
        this.setState({ resultado: data });
        if (!data) return;

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
        }).catch(console.error);
    };

    render() {
        const now = new Date();
        const hora = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        return (
            <SPage title={"Buscar cliente para asistencia"}>
                <Container>
                    <SHr height={20} />
                    <SView col={"xs-12"} card padding={15}>
                        <SText>Buscar Cliente</SText>
                        <AgregarContacto clientes={this.state.clientes} onResultado={this.setResultado} />
                    </SView>

                    {this.state.resultado && (
                        <>
                            <SHr height={20} />
                            <SView col={"xs-12"} card padding={15}>
                                <SText>Resultado:</SText>
                                <SHr width={30} />
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

                                {this.state.paquete && (
                                    <SView col={"xs-12"} style={{ borderWidth: 1, borderColor: STheme.color.warning, borderRadius: 4 }} padding={15}>
                                        <SForm
                                            row
                                            style={{ justifyContent: "space-between" }}
                                            ref={ref => this.form = ref}
                                            col={"xs-12 sm-8 md-8 lg-8 xl-8"}
                                            inputs={{
                                                fecha_inicio: { col: "xs-5.5", label: "Fecha de Ingreso", type: "fecha", isRequired: true, defaultValue: new Date().toISOString().split("T")[0] },
                                                hora: { col: "xs-5.5", label: "Hora", type: "hour", isRequired: true, defaultValue: hora },

                                                sucursales: {
                                                    col: "xs-12",
                                                    type: "select2",
                                                    label: "Sucursal",
                                                    placeholder: "Selecciona una sucursal",
                                                    options: (this.state.sucursales || []).map(s => s.descripcion),
                                                    onChangeText: (text) => {
                                                        const selected = (this.state.sucursales || []).find(s => s.descripcion === text);
                                                        this.setState({ selectedSucursal: selected });
                                                    }
                                                }
                                            }}
                                        />

                                        <SView col={"xs-12"} style={{ alignItems: "flex-end" }}>
                                            <SView width={150} height={40} center backgroundColor={STheme.color.primary} onPress={this.registrarAsistencia} style={{ borderRadius: 4 }}>
                                                <SText center color={STheme.color.white}>Registrar asistencia</SText>
                                            </SView>
                                        </SView>
                                    </SView>
                                )}
                            </SView>
                        </>
                    )}
                </Container>
            </SPage>
        );
    }

    registrarAsistencia = () => {
        // const cajaActiva = MDL?.caja?.activa;
        // if (!cajaActiva) {
        //     SNotification.send({ key: "Asistencia", title: "Caja no activa", body: "No existe una caja activa para continuar.", color: STheme.color.danger, time: 4000 });
        //     return;
        // }

        const dataFormateada = {
            key_suscripcion: this.state?.paquete?.key ?? null,
            key_empresa: MDL.empresa.select.key,
            key_sucursal: this.state.selectedSucursal?.key,
            // key_empresa: cajaActiva.key_empresa,
            // key_sucursal: this.state.selectedSucursal?.key ?? cajaActiva.key_sucursal,
            key_cliente: this.state?.resultado?.key ?? null
        };

        if (!dataFormateada.key_cliente || !dataFormateada.key_suscripcion) {
            SNotification.send({ key: "Asistencia", title: "Datos incompletos", body: "Faltan datos obligatorios para registrar la asistencia.", color: STheme.color.warning, time: 4000 });
            return;
        }

        SNotification.send({ key: "AsistenciaLoading", title: "Registrando asistencia", body: "Por favor espere...", color: STheme.color.info, time: 0 });

        MDL.inventario.asistencia.registrar(dataFormateada)
            .then(() => {
                SNotification.remove("AsistenciaLoading");
                SNotification.send({ key: "Asistencia", title: "Asistencia registrada correctamente", body: "La operación se realizó con éxito.", color: STheme.color.success, time: 4000 });
                this.props.onSuccess?.();
            })
            .catch(error => {
                SNotification.remove("AsistenciaLoading");
                SNotification.send({ key: "Asistencia", title: "Error al registrar asistencia", body: error?.error || JSON.stringify(error), color: STheme.color.danger, time: 4000 });
            });
    }
}

const AgregarContacto = ({ clientes, onResultado }) => {
    return (
        <SView row col={"xs-12"} style={{
            marginTop: 5, padding: 5, borderWidth: 1, borderColor: STheme.color.card, backgroundColor: STheme.color.card, marginBottom: 5, borderRadius: 4,
        }} >
            <SInput
                icon={<SText color={STheme.color.lightGray} bold>{"Cliente:"}</SText>}
                placeholder={"Escriba el nombre del cliente"}
                height={30}
                type="select2"
                options={clientes.map(c => (c?.nombres || "").trim()).filter(a => !!a)}
                onChangeText={(text) => {
                    const t = (text || "").trim().toLowerCase();
                    const encontrado = (clientes || []).find(c => ((c?.nombres || "").trim().toLowerCase() === t));
                    onResultado(encontrado || null);
                }}
            />
        </SView>
    );
};
