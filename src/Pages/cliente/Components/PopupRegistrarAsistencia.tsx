import React, { Component } from "react";
import { SPopup, SView, SText, STheme, SForm, SHr, SNotification, SImage } from "servisofts-component";
import MDL from "../../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../../Assets/SIconApp";
type Props = {
    onSuccess?: () => void
}

export default class PopupRegistrarAsistencia extends Component<Props> {
    form: SForm | undefined;
    state = {
        clientes: [],
        sucursales: [],
        resultado: null,
        paquete: null,
        selectedSucursal: null,
    };

    static open(props: Props) {
        SPopup.open({
            key: "PopupRegistrarAsistencia",
            content: (
                <SView style={{
                    width: "100%",
                    height: 550,
                    maxHeight: "100%",
                    maxWidth: 500,
                    borderRadius: 8,
                    borderColor: STheme.color.card,
                    borderWidth: 1,
                    backgroundColor: STheme.color.background
                }} withoutFeedback >
                    <PopupRegistrarAsistencia {...props} />
                </SView>
            ),
        });
    }

    componentDidMount() {
        this.loadDataSucursales();
        this.loadClientes();
    }

    loadDataSucursales = async () => {
        const empresa = await MDL.empresa.getFull();
        const sucursales = empresa?.sucursales ? Object.values(empresa.sucursales) : [];
        this.setState({ sucursales });
    };

    loadClientes = async () => {
        const clientes = await MDL.crm.cliente.getAll();
        this.setState({ clientes });
    };

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

    registrarAsistencia = () => {
        if (!this.state.resultado || !this.state.paquete || !this.state.selectedSucursal) {
            SNotification.send({
                key: "Asistencia",
                title: "Datos incompletos",
                body: "Faltan datos obligatorios para registrar la asistencia.",
                color: STheme.color.warning,
                time: 4000
            });
            return;
        }

        const dataFormateada = {
            key_cliente: this.state.resultado.key,
            key_suscripcion: this.state.paquete.key,
            key_sucursal: this.state.selectedSucursal.key,
            key_empresa: MDL.empresa.select.key
        };

        SNotification.send({ key: "AsistenciaLoading", title: "Registrando asistencia", body: "Por favor espere...", color: STheme.color.info, time: 0 });

        MDL.inventario.asistencia.registrar(dataFormateada)
            .then(() => {
                SNotification.remove("AsistenciaLoading");
                SNotification.send({ key: "Asistencia", title: "Asistencia registrada correctamente", body: "La operación se realizó con éxito.", color: STheme.color.success, time: 4000 });
                SPopup.close("PopupRegistrarAsistencia");
                this.props.onSuccess?.();
            })
            .catch(error => {
                SNotification.remove("AsistenciaLoading");
                SNotification.send({ key: "Asistencia", title: "Error al registrar asistencia", body: error?.error || JSON.stringify(error), color: STheme.color.danger, time: 4000 });
            });
    }

    render() {
        const now = new Date();
        const hora = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        return (
            <SView col={"xs-12"} center padding={16}>
                <SText fontSize={16}>{"Registrar Aistsencia"}</SText>
                <SView col="xs-12" padding={10}>
                    <SText bold>Buscar Cliente</SText>
                    <AgregarContacto clientes={this.state.clientes} onResultado={this.setResultado} />
                </SView>
                {this.state.resultado && (
                    <>
                        <SView col="xs-12" padding={10}>
                            <SView col="xs-12" row
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 18,
                                    borderWidth: 1,
                                    borderColor: STheme.color.card,
                                    borderRadius: 8,
                                    backgroundColor: STheme.color.background,
                                }}
                            >
                                <SView style={{ width: 64, height: 64, borderRadius: 64, overflow: "hidden", backgroundColor: STheme.color.card, }} >
                                    <SImage src={SSocket.api.root + "usuario/" + this.state.resultado.key} style={{ resizeMode: "cover" }} enablePreview />
                                </SView>
                                <SView width={8} />
                                <SView col="xs-6" justify="center">
                                    <SView col={"xs-12"} row>
                                        <SText color={STheme.color.lightGray}>Nombres: </SText>
                                        <SText color={STheme.color.text} bold>{this.state.resultado.nombres ?? "---"}</SText>
                                    </SView>
                                    <SView col={"xs-12"} row>
                                        <SText color={STheme.color.lightGray}>NIT: </SText>
                                        <SText color={STheme.color.text} bold>{this.state.resultado.nit ?? "---"}</SText>
                                    </SView>
                                    <SView col={"xs-12"} row>
                                        <SText color={STheme.color.lightGray}>Tel: </SText>
                                        <SText color={STheme.color.text} bold>{this.state.resultado.telefono ?? "---"}</SText>
                                    </SView>
                                    <SView col={"xs-12"} row>
                                        <SText color={STheme.color.lightGray}>Correo: </SText>
                                        <SText color={STheme.color.text} bold>{this.state.resultado.correo ?? "---"}</SText>
                                    </SView>
                                </SView>
                                <SView width={8} />
                                <SView flex center>
                                    <SView padding={8} center style={{ borderRadius: 4, borderWidth: 1, borderColor: this.state.paquete ? STheme.color.success : STheme.color.danger, backgroundColor: (this.state.paquete ? STheme.color.success : STheme.color.danger) + "30", }} >
                                        <SText bold fontSize={11} center>PAQUETE {this.state.paquete ? "ACTIVO" : "INACTIVO"} </SText>
                                    </SView>
                                </SView>
                            </SView>
                            <SHr height={16} />
                            <SView
                                col="xs-12"
                                padding={14}
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 18,
                                    borderWidth: 1,
                                    borderColor: STheme.color.card,
                                    borderRadius: 8,
                                    backgroundColor: STheme.color.background,
                                }}
                            >
                                {this.state.paquete ? (
                                    <>
                                        <SForm
                                            ref={ref => this.form = ref}
                                            row
                                            style={{ justifyContent: "space-between" }}
                                            inputs={{
                                                fecha: {
                                                    col: "xs-5.5", label: "Fecha", type: "date", defaultValue: new Date().toISOString().split("T")[0],

                                                    style: { pointerEvents: "none", backgroundColor: STheme.color.background, borderColor: STheme.color.card, },
                                                    inputStyle: { borderColor: STheme.color.card, borderWidth: 1, },
                                                    iconR: (
                                                        <SView width={15} height={15} center style={{ marginRight: 8, }} >
                                                            <SIconApp name="Evento" fill={STheme.color.lightGray} />
                                                        </SView>
                                                    ),
                                                }
                                                ,
                                                hora: {
                                                    isRequired: true, col: "xs-5.5", label: "Hora", type: "hour", defaultValue: hora,
                                                    iconR: (
                                                        <SView width={15} height={15} center style={{ marginRight: 8 }} >
                                                            <SIconApp name="history" fill={STheme.color.lightGray} />
                                                        </SView>
                                                    ),
                                                },
                                                sucursal: {
                                                    col: "xs-12",
                                                    type: "select2",
                                                    label: "Sucursal",
                                                    placeholder: "Selecciona una sucursal",
                                                    options: this.state.sucursales.map(s => s.descripcion),
                                                    onChangeText: (text) => {
                                                        const selected = this.state.sucursales.find(s => s.descripcion === text);
                                                        this.setState({ selectedSucursal: selected });
                                                    }
                                                }
                                            }}
                                        />
                                        <SHr height={8} />
                                        {this.state.paquete && (
                                            <SView col="xs-12">
                                                <SView width={"100%"} height={40} center backgroundColor={"#292929"} onPress={this.registrarAsistencia} style={{ borderRadius: 4 }}>
                                                    <SText color={STheme.color.white} bold>Registrar asistencia</SText>
                                                </SView>
                                            </SView>
                                        )}
                                    </>
                                ) : (
                                    <SView
                                        col="xs-12"
                                        padding={12}
                                        card
                                        style={{
                                            borderRadius: 6,
                                        }}
                                    >
                                        <SText bold color={STheme.color.lightGray + "30"}>
                                            Cliente sin paquete activo
                                        </SText>
                                    </SView>
                                )}
                            </SView>
                        </SView>
                    </>
                )}
            </SView>
        );
    }
}
const AgregarContacto = ({ clientes, onResultado }) => {
    return (
        <SView row col="xs-12" height={54} center style={{ marginTop: 8, padding: 5, borderWidth: 1, borderColor: STheme.color.card, borderRadius: 8 }}>
            <SForm
                backgroundColor="transparent"
                inputs={{
                    cliente: {
                        type: "select2",
                        placeholder: "Escriba el nombre del cliente...",
                        options: clientes.map(c => c.nombres).filter(Boolean),
                        onChangeText: (text) => {
                            const encontrado = clientes.find(c => c.nombres === text);
                            onResultado(encontrado || null);
                        }
                    }
                }}
            />
        </SView>
    );
};