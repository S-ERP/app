import React, { Component } from 'react';
import { SDate, SHr, SIcon, SImage, SLoad, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from "servisofts-socket";
import MDL from '../../MDL';
import FloatButtom from '../../Components/FloatButtom';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';
import PopupCrearCliente from './Components/PopupCrearCliente';
import SIconApp from '../../Assets/SIconApp';
import label from '../ajustes/label';
import AdminsitrarHabilidades from './Components/AdministrarHabilidades';
import TurnoComponent from '../../Components/TurnoComponent';
import PopupArticulos from './Components/PopupArticulos';

const URL = "/crm/cliente";

export default class Perfil extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {}
        };

        this.key = SNavigation.getParam("key");
    }


    componentDidMount() {
        this.loadData();

    }

    // async loadData() {
    //     let habilidad = await MDL.habilidad.getAllWithUsuarios();
    //     let ventas = await MDL.compra_venta.getTransaccion('venta', '2024-09-01', '2026-09-05');
    //     // Obtener resumen de cuotas
    //     let registros = await MDL.compra_venta.getCuotasResumenTotal_ventas();

    //     await MDL.crm.cliente.getByKey(SNavigation.getParam("key")).then(e => {
    //         // this.setState({ data: e });
    //         console.log("Cliente data:", e);
    //         e.habilidades = habilidad.filter(hab => hab.key_usuarios?.includes(e.key));
    //         e.ventas = ventas.filter(venta => venta.key_cliente == e.key);
    //         e.resumen_cuotas = registros ? registros.find(reg => reg.key_cliente == e.key) : [];
    //         // this.setState({ data: e });
    //         this.state.data = e;
    //         this.forceUpdate();

    //     }).catch(error => {
    //         console.error('Error al cargar datos del cliente:', error);
    //         SNotification.send({
    //             title: 'Error',
    //             body: 'No se pudo cargar los datos del cliente.',
    //             time: 3000,
    //             color: STheme.color.danger,
    //         });
    //     });




    //     // this.forceUpdate();
    // }

    loadData = async () => {
        try {
            let habilidad = await MDL.habilidad.getAllWithUsuarios();
            let ventas = await MDL.compra_venta.getTransaccion('venta', '2024-09-01', '2026-09-05');
            let registros = await MDL.compra_venta.getCuotasResumenTotal_ventas();
            let turnos = await MDL.empresa.getTurnosHorariosAtencion();
            let articulos = await MDL.inventario.getModelosByCliente(this.key);

            let e = await MDL.crm.cliente.getByKey(this.key);

            e.habilidades = habilidad.filter(hab => hab.key_usuarios?.includes(e.key));
            e.ventas = ventas.filter(venta => venta.key_cliente == e.key);
            e.resumen_cuotas = registros ? registros.find(reg => reg.key_cliente == e.key) : [];
            e.turno = turnos ? Object.values(turnos).find(t => t.key == e.key_turno) : null;
            // e.horario_atencion = turnos ? turnos.filter(t => t.key_usuario == e.key) : null;
            e.articulos = articulos;
            console.log("articulos", articulos);

            this.setState({ data: e });

        } catch (error) {
            console.error('Error al cargar datos del cliente:', error);
            SNotification.send({
                title: 'Error',
                body: 'No se pudo cargar los datos del cliente.',
                time: 3000,
                color: STheme.color.danger,
            });
        }
    }



    render() {
        console.log("this.data", this.state.data);
        // console.log("this.habilidad", this.state.habilidad);

        if (!this.state.data) return <SView />
        this.data = this.state.data;
        // this.habilidad = this.state.habilidad;

        return (
            <SPage title="Perfil del Cliente" >
                <SView col={"xs-12"} row padding={10}>
                    <SView col={"xs-3"} padding={5}>
                        <Resumen cliente={this.data} />
                    </SView>
                    <SView col={"xs-4.5"} padding={5} >
                        <InfoGeneral cliente={this.data} onReload={this.loadData} />
                    </SView>
                    <SView col={"xs-4.5"} padding={5}>
                        <Calendario cliente={this.data} />
                    </SView>
                    <SView col={"xs-4"} padding={5} height={300}>
                        <Habilidades cliente={this.data} onReload={this.loadData} />
                    </SView>
                    <SView col={"xs-4"} padding={5}>
                        <Horarios cliente={this.data} onReload={this.loadData} />
                    </SView>
                    <SView col={"xs-4"} padding={5}>
                        <CompraVentas cliente={this.data} />
                    </SView>
                    <SView col={"xs-4"} padding={5}>
                        <Articulos cliente={this.data} onReload={this.loadData} />
                    </SView>
                </SView>


            </SPage>
        );
    }
}

const Resumen = ({ cliente }) => {
    return <SView col={"xs-12"} card center padding={15}>
        {/* <SImage src={SIconApp.direccion} style={{ width: 100, height: 100, resizeMode: "contain" }} /> */}
        <SView col="xs-12" center row>
            <SView
                style={{
                    width: 110,
                    height: 110,
                    borderRadius: 100,
                    overflow: 'hidden',
                    backgroundColor: `${STheme.color.card}66`,
                    borderWidth: 2,
                    borderColor: STheme.color.primary,
                }}
            >
                <SImage src={SSocket.api.root + "usuario/" + cliente?.key} style={{ resizeMode: 'cover' }} enablePreview />
            </SView>
        </SView>
        <SHr height={10} />
        <SText bold fontSize={18}>{cliente.razon_social}</SText>
        <SText>{cliente.nit}</SText>
        <SHr height={5} />
        <SText underLine center color={STheme.color.link}>{cliente.telefono}</SText>
        <SHr height={5} />
        <SText color={STheme.color.lightGray} fontSize={12}>{cliente.correo}</SText>
        <SHr height={5} />
    </SView>
}

const InfoGeneral = ({ cliente, onReload }) => {
    return <SView col={"xs-12"} card padding={15} height>
        <SView width={40} height={40} style={{
            position: "absolute",
            top: 0,
            right: 0,
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 10
        }}
            onPress={() => {
                // Opción de editar cliente
                console.log("cliente", cliente);
                if (MDL.rolesPermisos.getPermiso({ url: URL, permiso: 'edit' })) {

                    // const cliente = { ...row, key_usuario: MDL.usuario.session?.key };
                    // const cliente = { cliente, key_usuario: MDL.usuario.session?.key };
                    // console.log("cliente", cliente);
                    PopupCrearCliente.open({
                        editObject: cliente,
                        key_empresa: cliente.key_empresa,
                        onSuccess: () => onReload(),
                    });

                }

            }} center>
            <SIcon name='crmeditar' width={20} height={20} fill={STheme.color.text} />
        </SView>
        <SText bold fontSize={16}>Información General</SText>
        <SHr height={10} />
        <SView col={"xs-12"} row>
            <SView col={"xs-6"}>
                <SText color={STheme.color.lightGray}>Nombres:</SText>
                <SText>{cliente.nombres ?? "---"}</SText>
            </SView>
            <SView col={"xs-6"}>
                <SText color={STheme.color.lightGray}>Apellidos:</SText>
                <SText>{cliente.apellidos ?? "---"}</SText>
            </SView>
        </SView>
        <SHr height={10} />
        <SView col={"xs-12"} row>
            <SView col={"xs-6"}>
                <SText color={STheme.color.lightGray}>Teléfono:</SText>
                <SText>{cliente.telefono ?? "---"}</SText>
            </SView>
            <SView col={"xs-6"}>
                <SText color={STheme.color.lightGray}>Correo:</SText>
                <SText>{cliente.correo ?? "---"}</SText>
            </SView>
        </SView>
        <SHr height={10} />
        <SView col={"xs-12"}>
            <SText color={STheme.color.lightGray}>Dirección:</SText>
            <SText>{cliente.direccion ?? "---"}</SText>
        </SView>
        <SHr height={10} />
        <SView col={"xs-12"} row>
            <SView col={"xs-6"}>
                <SText color={STheme.color.lightGray}>Razón social:</SText>
                <SText>{cliente.razon_social ?? "---"}</SText>
            </SView>
            <SView col={"xs-6"}>
                <SText color={STheme.color.lightGray}>Nit:</SText>
                <SText>{cliente.nit ?? "---"}</SText>
            </SView>
        </SView>
    </SView>
}

const Habilidades = ({ cliente, onReload }) => {
    return <SView col={"xs-12"} card padding={15} height>
        <SView width={40} height={40} style={{
            position: "absolute",
            top: 0,
            right: 0,
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 10
        }}
            onPress={() => {
                AdminsitrarHabilidades.open({
                    key_usuario: cliente.key,
                    onSuccess: () => {
                        onReload();
                    }
                });
            }} center>
            <SIcon name='crmeditar' width={20} height={20} fill={STheme.color.text} />
        </SView>
        <SText bold fontSize={16}>Habilidades</SText>
        <SHr height={30} />
        <SView col={"xs-12"}  >
            {cliente?.habilidades?.length === 0 && (<SText fontSize={16} color={STheme.color.lightGray}>No se han asignado habilidades.</SText>)}

            {cliente?.habilidades?.map((hab, index) => {
                return <SView col={"xs-6"} key={index} flex
                    style={{
                        padding: 5,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        borderRadius: 4,
                        marginBottom: 5,
                        backgroundColor: STheme.color.card,
                    }}>
                    <SText style={{ textTransform: "uppercase" }}>{hab?.descripcion}</SText>
                </SView>
            })}
        </SView>
    </SView>
}

const horaToMinutos = (hora) => {
    const [h, m, s] = hora.split(":").map(Number);
    return h * 60 + m + (s || 0) / 60;
};
const agruparPorDia = (data) => {
    return data.reduce((acc, item) => {
        if (!acc[item.dia]) acc[item.dia] = [];
        acc[item.dia].push(item);
        return acc;
    }, {});
};
const ordenarHorariosPorDia = (data) => {
    const agrupado = agruparPorDia(data);

    Object.keys(agrupado).forEach((dia) => {
        agrupado[dia].sort(
            (a, b) =>
                horaToMinutos(a.hora_inicio) -
                horaToMinutos(b.hora_inicio)
        );
    });

    return agrupado;
};

const Horarios = ({ cliente, onReload }) => {
    let dataTurnOrdenado = [];
    if (cliente?.turno) {
        dataTurnOrdenado = ordenarHorariosPorDia(cliente.turno.horario_atencion);
    }
    let dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    return <SView col={"xs-12"} card padding={15} height>
        <SView width={40} height={40} style={{
            position: "absolute",
            top: 0,
            right: 0,
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 10
        }}
            onPress={() => {
                // SPopup.open({
                //     key: "popup_habilidades",
                //     // content: <AdministrarHabilidades cliente={cliente} />
                // })
                SPopup.open({
                    key: "popup_config_horario",
                    content: (
                        <SView col={"xs-11 sm-10 md-8"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 450 }} padding={16} withoutFeedback >
                            <SView col={"xs-12"} height={600} center >
                                <TurnoComponent key_turno={cliente?.key_turno} onReload={async (res) => {
                                    console.log("✅ Resultado recibido en Turnos.js:", res);
                                    cliente.horario_atencion = res;
                                    let data = {
                                        key: cliente.key,
                                        key_turno: res.key,
                                        key_usuario: MDL.usuario.session?.key,

                                    }
                                    await MDL.crm.cliente.editar(data).then(e => {
                                        console.log("✅ Horario de atención actualizado en el cliente:", e)
                                        onReload();
                                    }).catch(err => {
                                        console.error("Error al actualizar el horario de atención en el cliente:", err)
                                    });
                                }}
                                ></TurnoComponent>
                            </SView>
                        </SView>
                    )
                });
            }} center>
            <SIcon name='crmeditar' width={20} height={20} fill={STheme.color.text} />
        </SView>
        <SText bold fontSize={16}>Horarios de atención</SText>
        <SView col={"xs-12"}  >
            <SHr height={30} />
            {cliente?.turno ? (<SView col={"xs-12"} row>
                <SView col={"xs-6"} row >
                    <SText col={"xs-12"} color={STheme.color.lightGray}>Turno: </SText>
                    <SText col={"xs-12"} bold>{cliente?.turno?.nombre}</SText>
                </SView>
                <SView col={"xs-6"} row style={{ alignItems: "flex-end" }}>
                    <SText col={"xs-12"} style={{ alignItems: "flex-end" }} color={STheme.color.lightGray}>¿Atención en feriado?</SText>
                    <SText col={"xs-12"} style={{ alignItems: "flex-end" }}>{cliente?.turno?.atiende_feriado === 0 ? "No" : "Sí"}</SText>
                </SView>
                <SHr height={10} />
                <SView col={"xs-12"}>
                    {Object.keys(dataTurnOrdenado).map((dia) => (
                        <SView col={"xs-12"} row key={dia}
                            style={{
                                marginBottom: 5,
                                // padding: 5,
                                borderWidth: 1,
                                borderColor: STheme.color.card,
                                borderRadius: 4,
                                backgroundColor: STheme.color.card,
                                overflow: "hidden",
                            }}>
                            <SView col={"xs-4"} backgroundColor={STheme.color.background + "80"} padding={5} center>
                                <SText bold>{dias[dia]}</SText>
                            </SView>
                            <SView col={"xs-8"} row padding={5}>
                                {dataTurnOrdenado[dia].map((horario, index) => (
                                    <SView col={"xs-12"} row key={index} padding={5}>
                                        <SText>{`${horario.hora_inicio.slice(0, 5)} - ${horario.hora_fin.slice(0, 5)}`}</SText>
                                    </SView>
                                ))}
                            </SView>
                        </SView>
                    ))}</SView>
            </SView>
            ) : (
                <SText fontSize={16} color={STheme.color.lightGray}>No se ha configurado un horario de atención.</SText>
            )}
        </SView>
        <SHr height={10} />
    </SView>
}

const Calendario = ({ cliente }) => {
    return <SView col={"xs-12"} card padding={15} height>
        <SText bold fontSize={16}>Calendario</SText>
        <SHr height={10} />
    </SView>
}

const CompraVentas = ({ cliente }) => {
    return <SView col={"xs-12"} card padding={15} height row>
        <SText bold fontSize={16}>Compra / Venta</SText>
        <SHr height={20} />
        <BloqueVentas dato={`Bs ${SMath.formatMoney((cliente?.resumen_cuotas?.monto_pagado ?? 0))}`} color={STheme.color.success} title="Monto Pagado" />
        <BloqueVentas dato={cliente?.resumen_cuotas?.cantidad_pagada ?? "--"} color={STheme.color.success} title="Cuotas Pagadas" />
        <BloqueVentas dato={`Bs ${SMath.formatMoney(cliente?.resumen_cuotas?.monto_en_mora ?? 0)}`} color={STheme.color.danger} title="Monto en Mora" />
        <BloqueVentas dato={cliente?.resumen_cuotas?.cantidad_en_mora ?? "--"} color={STheme.color.danger} title="Cuotas en Mora" />
        <BloqueVentas dato={`Bs ${SMath.formatMoney(cliente?.resumen_cuotas?.monto_pendiente ?? 0)}`} color={STheme.color.warning} title="Monto Pendiente" />
        <BloqueVentas dato={cliente?.resumen_cuotas?.cantidad_pendiente ?? "--"} color={STheme.color.warning} title="Cuotas Pendientes" />

    </SView>
}

const BloqueVentas = ({ dato, color, title }) => {
    return <SView col={"xs-6"} padding={5}>
        <SText col={"xs-12"} bold>{title}</SText>
        <SView col={"xs-12"}
            style={{
                padding: 5,
                borderWidth: 1,
                borderColor: color,
                borderRadius: 4,
                marginBottom: 5,
                backgroundColor: color + "22",
            }}>
            <SText style={{ textTransform: "uppercase" }}>{dato}</SText>
        </SView>
    </SView>
}

const Articulos = ({ cliente, onReload }) => {
    return <SView col={"xs-12"} card padding={15} height>
        <SView width={40} height={40} style={{
            position: "absolute",
            top: 0,
            right: 0,
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 10
        }}
            onPress={() => {
                PopupArticulos.open({
                    key_cliente: cliente.key,
                    onSuccess: () => {
                        onReload();
                    }
                });
            }} center>
            <SIcon name='crmeditar' width={20} height={20} fill={STheme.color.text} />
        </SView>
        <SText bold fontSize={16}>Artículos</SText>
        <SHr height={10} />
        {/* {cliente?.articulos?.length > 0 && (
            <SView col={"xs-12"}  >
                {cliente?.articulos?.map((art, index) => {
                    return <SView col={"xs-12"} key={index} flex
                        style={{
                            padding: 5,
                            borderWidth: 1,
                            borderColor: STheme.color.card,
                            borderRadius: 4,
                            marginBottom: 5,
                            backgroundColor: STheme.color.card,
                        }}>
                        <SText style={{ textTransform: "uppercase" }}>{art?.descripcion}</SText>
                    </SView>
                })}
            </SView>
        )} */}
        {cliente?.articulos ?? (<SText fontSize={16} color={STheme.color.lightGray}>No se han asignado artículos.</SText>)}
    </SView>
}

