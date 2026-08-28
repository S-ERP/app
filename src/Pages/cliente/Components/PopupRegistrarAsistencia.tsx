import React, { Component } from "react";
import { SPopup, SView, SText, STheme, SForm, SHr, SNotification, SImage, SDate, SScrollView2 } from "servisofts-component";
import MDL from "../../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../../Assets/SIconApp";
type Props = {
    onSuccess?: () => void
}

type State = {
    clientes: any[],
    sucursales: any[],
    resultado: any,
    paquete: any,
    selectedSucursal: any,
}

export default class PopupRegistrarAsistencia extends Component<Props, State> {
    form: SForm | undefined;
    state: State = {
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
                }} withoutFeedback>
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
        this.setState({ sucursales }, () => this.preseleccionarSucursalCaja());
    };

    // Si hay una caja abierta, dejar seleccionada por defecto su sucursal.
    preseleccionarSucursalCaja = async () => {
        try {
            const caja = MDL.caja.activa ?? await MDL.caja.getActiva();
            const key_sucursal = caja?.key_sucursal;
            if (!key_sucursal) return;
            const selected = this.state.sucursales.find((s: any) => s.key === key_sucursal);
            if (selected) this.setState({ selectedSucursal: selected });
        } catch (err) {
            console.error(err);
        }
    };

    loadClientes = async () => {
        const clientes = await MDL.crm.cliente.getAll();
        this.setState({ clientes });
    };

    // setResultado = (data) => {
    //     this.setState({ resultado: data });
    //     if (!data) return;

    //     SSocket.sendPromise({
    //         service: "inventario",
    //         component: "suscripcion",
    //         estado: "cargando",
    //         type: "getByKeyCliente",
    //         key_cliente: data.key
    //     }).then(e => {
    //         const hoy = new Date();
    //         const vigente = e.data.filter(item => {
    //             const inicio = new Date(item.fecha_inicio);
    //             const fin = new Date(item.fecha_fin);
    //             return hoy >= inicio && hoy <= fin;
    //         });
    //         let sucursales = Object.values(this.getSucursales());
    //         console.log(sucursales)

    //         vigente[0].sucursal = sucursales.find(u => u.key === e.key_sucursal)
    //         console.log("paquete actual ", vigente)
    //         this.setState({ paquete: vigente[0] });
    //     }).catch(console.error);
    // };

    setResultado = async (data) => {
        this.setState({ resultado: data });
        if (!data) return;

        try {
            const e = await SSocket.sendPromise({
                service: "inventario",
                component: "suscripcion",
                estado: "cargando",
                type: "getByKeyCliente",
                key_cliente: data.key
            });

            const hoy = new Date();

            const vigente = e.data.filter(item => {
                const inicio = new Date(item.fecha_inicio);
                const fin = new Date(item.fecha_fin);
                return hoy >= inicio && hoy <= fin;
            });

            // ✅ AQUÍ el await
            const sucursalesObj = await this.getSucursales();
            const sucursales = Object.values(sucursalesObj);

            console.log(sucursales);

            if (vigente.length > 0) {
                vigente[0].sucursal = sucursales.find(
                    u => u.key === vigente[0].key_sucursal
                );
            }

            console.log("paquete actual ", vigente);

            this.setState({ paquete: vigente[0] });

        } catch (err) {
            console.error(err);
        }
    };

    async getSucursales() {
        return await MDL.empresa.getAllSucursales();
    }

    registrarAsistencia = (data: any = {}) => {
        // Resuelve la sucursal desde el valor del form o desde la caja activa como respaldo.
        const sucursalForm = data?.sucursal
            ? this.state.sucursales.find((s: any) => s.descripcion === data.sucursal)
            : null;
        const sucursal = sucursalForm ?? this.state.selectedSucursal;

        if (!this.state.resultado || !this.state.paquete || !sucursal) {
            SNotification.send({
                key: "Asistencia",
                title: "Datos incompletos",
                body: "Faltan datos obligatorios para registrar la asistencia.",
                color: STheme.color.warning,
                time: 4000
            });
            return;
        }

        const fecha = data?.fecha || new Date().toISOString().split("T")[0];
        const hora = data?.hora || `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`;

        const dataFormateada = {
            key_cliente: this.state.resultado.key,
            key_suscripcion: this.state.paquete.key,
            key_sucursal: sucursal.key,
            key_empresa: MDL.empresa.select.key,
            fecha_on: `${fecha} ${hora}:00`,
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
            <SScrollView2 >
                <SView col={"xs-12"} center padding={16}>
                    <SText fontSize={16}>{"Registrar Asistencia"}</SText>
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
                                    {this.state.paquete?.producto && (<>
                                        <SHr height={15} />
                                        <SView col={"xs-12"} height={2} style={{ borderBottomColor: STheme.color.card, borderBottomWidth: 1 }} />
                                        <SHr height={15} />
                                        <SView col={"xs-12"}>
                                            <SView col={"xs-12"} row>
                                                <SIconApp name="blender/group" fill={STheme.color.text} width={18} height={18} />
                                                <SView width={8} />
                                                <SText fontSize={16} bold>{this.state.paquete?.producto?.nombre}</SText>
                                            </SView>
                                            <SHr height={7} />
                                            <SView col={"xs-12"} row>
                                                <SIconApp name="iconUbicacion" fill={STheme.color.text} width={18} height={18} />
                                                <SView width={8} />
                                                <SText fontSize={16} bold>{this.state.paquete?.sucursal?.descripcion}</SText>
                                            </SView>
                                            <SHr height={15} />
                                            <SView col={"xs-12"} row>
                                                <SView col={"xs-6"} flex style={{ alignItems: "flex-start" }}>
                                                    <SText fontSize={16} >
                                                        {new SDate(this.state.paquete?.fecha_inicio).toString("dd/MM/yyyy")}
                                                    </SText>
                                                    <SText color={STheme.color.lightGray}>Fecha de inicio</SText>
                                                </SView>
                                                <SView col={"xs-6"} flex style={{ alignItems: "flex-end" }}>
                                                    <SText fontSize={16} >
                                                        {new SDate(this.state.paquete?.fecha_fin).toString("dd/MM/yyyy")}
                                                    </SText>
                                                    <SText color={STheme.color.lightGray}>Fecha vencimiento</SText>
                                                </SView>

                                            </SView>
                                        </SView>
                                    </>)}

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
                                                onSubmit={(data: any) => this.registrarAsistencia(data)}
                                                inputs={{
                                                    fecha: {
                                                        col: "xs-5.5", label: "Fecha", type: "date", defaultValue: new Date().toISOString().split("T")[0],
                                                        style: { pointerEvents: "none", backgroundColor: STheme.color.background, borderColor: STheme.color.card, borderWidth: 1, },
                                                        inputStyle: { borderWidth: 0, },
                                                        iconR: (
                                                            <SView width={15} height={15} center style={{ marginRight: 8, }} >
                                                                <SIconApp name="Evento" fill={STheme.color.lightGray} />
                                                            </SView>
                                                        ),
                                                    },
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
                                                        isRequired: true,
                                                        defaultValue: this.state.selectedSucursal?.descripcion,
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
                                                    <SView width={"100%"} height={40} center backgroundColor={"#292929"} onPress={() => this.form?.submit()} style={{ borderRadius: 4 }}>
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
                                    )
                                    }
                                </SView>
                            </SView>
                        </>
                    )}
                </SView>
            </SScrollView2>
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