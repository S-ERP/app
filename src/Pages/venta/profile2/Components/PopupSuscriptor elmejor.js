import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import {
    SDate,
    SHr,
    SImage,
    SInput,
    SNotification,
    SPopup,
    SText,
    STheme,
    SView
} from 'servisofts-component';
import InputSelector from '../../../../Components/Selectores/InputSelector';
import MDL from '../../../../MDL';
import SSocket from 'servisofts-socket';
import FloatMenu from '../../../../Components/FloatMenu';
import SIconApp from '../../../../Assets/SIconApp';
import Btn from '../../../empresa/config/Components/Btn';

export default class PopupSuscriptor extends Component {
    static open(props) {
        SPopup.open({
            key: "popup-suscriptor",
            type: "1",
            content: <PopupSuscriptor {...props} />
        });
    }

    static close() {
        SPopup.close("popup-suscriptor");
    }

    constructor(props) {
        super(props);

        const dias = this.convertirADias(
            props.data_modelo?.duracion_medida,
            props.data_modelo?.duracion
        );

        this.state = {
            data: {},
            data_modelo: {},
            suscripcionSeleccionada: null,
            fechaInicio: new SDate(this.props.data.fecha_inicio),
            fechaFin: new SDate(this.props.data.fecha_inicio).addDay(dias),
            // fecha_inicio: new SDate(props.data.fecha_inicio).toString("yyyy-MM-dd"),
            // fecha_fin: new SDate(props.data.fecha_inicio).addDay(dias).toString("yyyy-MM-dd"),
            selectedCliente: null,
            loading: true
        };
    }

    componentDidMount() {
        this.loadData();
    }

    // Helpers
    convertirADias = (tipo, cantidad) => {
        if (!tipo || !cantidad || isNaN(cantidad)) return 0;

        const conversiones = {
            horas: cantidad / 24,
            dias: cantidad,
            semanas: cantidad * 7,
            meses: cantidad * 30,
            anos: cantidad * 365
        };

        return conversiones[tipo] ?? 0;
    };

    // Handlers de fechas
    // onChangeFechaInicio = (valor) => {
    //     const fechaInicio = new SDate(valor, "yyyy-MM-dd");
    //     const dias = this.convertirADias(
    //         this.state.data_modelo?.duracion_medida,
    //         this.state.data_modelo?.duracion
    //     );

    //     const fechaFin = fechaInicio.clone().addDay(dias); // ← quitamos -1 como comentaste

    //     this.setState({
    //         fecha_inicio: fechaInicio.toString("yyyy-MM-dd"),
    //         fecha_fin: fechaFin.toString("yyyy-MM-dd")
    //     }, () => {
    //         this.props.onChange?.(
    //             this.state.fecha_inicio,
    //             this.state.fecha_fin
    //         );
    //     });
    // };

    // onChangeFechaFin = (valor) => {
    //     this.setState({ fecha_fin: valor }, () => {
    //         this.props.onChange?.(
    //             this.state.fecha_inicio,
    //             this.state.fecha_fin
    //         );
    //     });
    // };

    onChangeFechaInicio = (valor) => {
        const fechaInicio = new SDate(valor, "yyyy-MM-dd");

        const dias = this.convertirADias(this.state.data_modelo?.modelo?.duracion_medida, this.state.data_modelo?.modelo?.duracion);

        const fechaFin = fechaInicio.clone().addDay(dias - 1);
        // const fechaFin = fechaInicio.clone().addDay(dias-1); aqui puedo quitar -1

        this.setState({ fecha_inicio: fechaInicio.toString("yyyy-MM-dd"), fecha_fin: fechaFin.toString("dd MON yyyy"), });

        if (this.props.onChange) { this.props.onChange(fechaInicio.toString("yyyy-MM-dd"), fechaFin.toString("dd MON yyyy")); }
    };

    onChangeFechaFin = (value) => {
        this.setState({ fecha_fin: value }, () => {
            if (this.props.onChange) {
                this.props.onChange(this.state.fecha_inicio, this.state.fecha_fin);
            }
        });
    }
    // Carga de datos
    async loadData() {
        try {
            const resp = await SSocket.sendPromise({
                service: "inventario",
                component: "suscripcion",
                type: "getByKeyCompraVentaDetalle",
                key_compra_venta_detalle: this.props.data.key,
                estado: "cargando",
            });

            const [clientes, modelos] = await Promise.all([
                MDL.crm.cliente.getAll(),
                MDL.inventario.getAllModelo()
            ]);

            const cliente = resp?.data?.key_cliente
                ? await MDL.crm.cliente.getByKey(resp.data.key_cliente) ?? {}
                : {};

            const dataActualizada = {
                ...resp.data,
                suscripciones: resp.data.suscripciones?.map(subs => ({
                    ...subs,
                    cliente: clientes.find(c => c?.key === subs.key_cliente) ?? {}
                })) ?? []
            };

            const dataModelo = {
                ...this.props.data,
                modelo: modelos.find(m => m?.key === this.props.data.key_modelo) ?? {}
            };

            this.setState({
                data: dataActualizada,
                data_modelo: dataModelo,
                loading: false
            });

        } catch (error) {
            console.error("Error al cargar datos de suscripción:", error);
            this.setState({ loading: false });
        }
    }

    // Registro de suscriptor
    handleRegistrarSuscriptor = async () => {
        const { fecha_inicio, fecha_fin, selectedCliente, data } = this.state;
        const item = this.props.data;
        const modelo = this.state.data_modelo?.modelo ?? {};
        const maxSuscriptores = modelo.cantidad_suscriptores ?? 0;
        const suscriptoresActuales = data.suscripciones?.length ?? 0;

        // Validaciones
        if (!fecha_inicio) {
            SNotification.send({
                title: "Fecha de inicio requerida",
                color: STheme.color.danger,
                time: 4000
            });
            return;
        }

        if (!fecha_fin) {
            SNotification.send({
                title: "Fecha de fin requerida",
                color: STheme.color.danger,
                time: 4000
            });
            return;
        }

        if (!selectedCliente?.value) {
            SNotification.send({
                title: "Cliente requerido",
                color: STheme.color.danger,
                time: 4000
            });
            return;
        }

        if (suscriptoresActuales >= maxSuscriptores) {
            SNotification.send({
                title: "Límite de suscriptores alcanzado",
                color: STheme.color.danger,
                time: 4000
            });
            return;
        }

        try {
            await SSocket.sendPromise({
                service: "inventario",
                component: "suscripcion",
                type: "registro",
                data: {
                    key_producto: data.key,
                    key_cliente: selectedCliente.value,
                    fecha_inicio,
                    fecha_fin,
                    key_sucursal: item.sucursal?.key
                },
                key_usuario: MDL.usuario.session.key
            });

            SNotification.send({
                title: "¡Suscriptor registrado!",
                color: STheme.color.success,
                time: 4000
            });

            this.loadData();

        } catch (e) {
            console.error("Error al registrar suscriptor:", e);
        }
    };
    calcularFechaFin = (fechaInicio) => {
        const modelo = this.state.data_modelo?.modelo;
        if (!modelo?.duracion || !modelo?.duracion_medida) return null;

        const dias = this.convertirADias(
            modelo.duracion_medida,
            modelo.duracion
        );

        return new SDate(fechaInicio).addDay(dias - 1); // -1 si quieres que el último día incluya inicio
    };

    render() {
        const { data, data_modelo, fecha_inicio, fecha_fin, selectedCliente } = this.state;
        const item = this.props.data;
        const modelo = data_modelo?.modelo ?? {};
        const maxSuscriptores = modelo.cantidad_suscriptores ?? 0;

        return (
            <SView style={{
                width: "100%",
                height: "100%",
                padding: 32,
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <SView style={{
                    width: "100%",
                    maxWidth: 500,
                    height: 400,
                    maxHeight: "100%",
                    backgroundColor: STheme.color.background + "F0",
                    borderWidth: 1,
                    borderColor: STheme.color.card,
                    borderRadius: 8,
                }} withoutFeedback>

                    <ScrollView contentContainerStyle={{ padding: 16 }}>

                        {/* Controles principales */}
                        <SView row style={{ justifyContent: "space-between", alignItems: "center" }}>
                            <SView width={140} height={40} center>
                                <SelectorCliente
                                    onSelect={(cliente) => this.setState({ selectedCliente: cliente })}
                                />
                            </SView>

                            <SView width={220} center>
                                <SView col="xs-12" row style={{ height: 40, justifyContent: "space-between" }}>
                                    <SView col="xs-5.8">
                                        <SInput
                                            type="date"
                                            border="cyan"
                                            placeholder="Fecha Iniciossssss"
                                            editable={false}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                borderRadius: 4,
                                                backgroundColor: STheme.color.card,
                                                // pointEvent:"none"

                                            }}
                                            value={fecha_inicio}
                                            onChangeText={this.onChangeFechaInicio}
                                        />
                                    </SView>

                                    <SView col="xs-5.8">
                                        <SInput
                                            type="date"
                                            border="cyan"
                                            placeholder="Fecha Fin"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                borderRadius: 4,
                                                pointerEvents: "none",

                                                backgroundColor: STheme.color.card
                                            }}
                                            value={fecha_fin}
                                            onChangeText={this.onChangeFechaFin}
                                        />
                                    </SView>
                                </SView>
                            </SView>

                            <SView
                                width={80}
                                height={40}
                                center
                                backgroundColor={STheme.color.card}
                                style={{ borderRadius: 4 }}
                                onPress={this.handleRegistrarSuscriptor}
                            >
                                <SText>ENVIAR</SText>
                            </SView>
                        </SView>

                        <SHr height={24} />

                        <SText>Duración: {modelo.duracion} {modelo.duracion_medida}</SText>
                        <SText>Cantidad máxima: {maxSuscriptores}</SText>

                        <SHr height={16} />

                        {/* Lista de suscripciones */}
                        {/* Lista de suscripciones */}
                        {data.suscripciones?.map((suscripcion) => {
                            const isSelected = this.state.suscripcionSeleccionada === suscripcion.key;

                            return (
                                <SView
                                    key={suscripcion.key}
                                    col={"xs-12"}
                                    style={{
                                        marginBottom: 12,
                                        padding: 8,
                                        borderRadius: 8,
                                        borderColor: isSelected ? 'yellow' : STheme.color.card,
                                        borderWidth: isSelected ? 2 : 1,
                                        backgroundColor: STheme.color.card + '22',
                                    }}
                                    // Dentro del map de suscripciones, en el onPress del item:
                                    onPress={(e) => {
                                        this.setState({ suscripcionSeleccionada: suscripcion.key });

                                        const menuOptions = [
                                            {
                                                label: 'Editar Contacto',
                                                icon: <SIconApp name="Pencil" fill="#e4e4e4ff" width={16} />,
                                                onPress: () => {
                                                    const EditarContent = () => {

                                                        const [fechaInicio, setFechaInicio] = React.useState(
                                                            new SDate(suscripcion.fecha_inicio).toString("yyyy-MM-dd")
                                                        );

                                                        // Función para calcular fecha fin según modelo
                                                        const calcularFechaFin = (fecha) => {
                                                            const modelo = this.state.data_modelo?.modelo;
                                                            if (!modelo?.duracion || !modelo?.duracion_medida) return null;
                                                            const dias = this.convertirADias(modelo.duracion_medida, modelo.duracion);
                                                            return new SDate(fecha).addDay(dias); // -1 si quieres incluir el primer día
                                                        };

                                                        const [fechaFin, setFechaFin] = React.useState(
                                                            calcularFechaFin(suscripcion.fecha_inicio)?.toString("yyyy-MM-dd")
                                                        );

                                                        // Cada vez que cambie fechaInicio, recalcular fechaFin
                                                        const handleChangeFechaInicio = (nuevoValor) => {
                                                            setFechaInicio(nuevoValor);
                                                            setFechaFin(calcularFechaFin(nuevoValor)?.toString("yyyy-MM-dd"));
                                                        };

                                                        const handleGuardar = () => {
                                                            const datosParaEnviar = {
                                                                key: suscripcion.key,
                                                                key_cliente: suscripcion.key_cliente,
                                                                fecha_inicio: fechaInicio,
                                                                fecha_fin: fechaFin,
                                                                // Aquí podrías agregar más campos si tu backend los requiere
                                                            };



                                                            MDL.inventario.editSuscripcion(datosParaEnviar).then((resp) => {
                                                                console.log("Artículo del cliente eliminado", resp);
                                                                SNotification.send({
                                                                    title: 'Éxito',
                                                                    body: 'Artículo del cliente eliminado correctamente.',
                                                                    time: 3000,
                                                                    color: STheme.color.success,
                                                                });
                                                                // onReload();
                                                                this.loadData();

                                                            }).catch((err) => {
                                                                console.error("Error al eliminar el artículo del cliente", err);
                                                                SNotification.send({
                                                                    title: 'Error',
                                                                    body: 'No se pudo eliminar el artículo del cliente.',
                                                                    time: 3000,
                                                                    color: STheme.color.danger,
                                                                });
                                                            });


                                                            // Mostramos en consola lo que se enviaría
                                                            console.log("Datos a enviar para actualizar suscripción:", datosParaEnviar);

                                                            // ← Aquí iría la llamada real al backend cuando esté lista
                                                            // await SSocket.sendPromise({...})

                                                            SNotification.send({
                                                                title: "Datos preparados para guardar (ver consola)",
                                                                description: "Revisa la consola del navegador/dispositivo",
                                                                color: STheme.color.info,
                                                                time: 5000
                                                            });

                                                            SPopup.close("editar-suscriptor-popup");
                                                        };

                                                        return (
                                                            <SView style={{
                                                                width: "100%",
                                                                height: "100%",
                                                                padding: 24,
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}>
                                                                <SView style={{
                                                                    width: "100%",
                                                                    maxWidth: 500,
                                                                    backgroundColor: STheme.color.background + "F0",
                                                                    borderRadius: 12,
                                                                    borderWidth: 1,
                                                                    borderColor: STheme.color.card,
                                                                    overflow: "hidden",
                                                                }} withoutFeedback>

                                                                    <SView col="xs-12" center style={{
                                                                        paddingVertical: 16,
                                                                        backgroundColor: STheme.color.card,
                                                                    }}>
                                                                        <SText bold fontSize={18}>Editar Suscriptor</SText>
                                                                        <SText fontSize={13} color={STheme.color.gray}>
                                                                            {item.nombre}
                                                                        </SText>
                                                                    </SView>

                                                                    <ScrollView contentContainerStyle={{ padding: 20 }}>

                                                                        {/* Cliente - solo informativo */}
                                                                        <SView marginBottom={24}>
                                                                            <SText fontSize={13} bold marginBottom={8}>Cliente</SText>
                                                                            <SView row center>
                                                                                <SView width={48} height={48} marginRight={12}>
                                                                                    <SView flex height card style={{ overflow: 'hidden', borderRadius: 8 }}>
                                                                                        <SImage
                                                                                            src={`${SSocket.api.root}usuario/${suscripcion.key_cliente}`}
                                                                                            style={{ resizeMode: "cover" }}
                                                                                        />
                                                                                    </SView>
                                                                                </SView>
                                                                                <SView flex>
                                                                                    <SText bold fontSize={16}>
                                                                                        {suscripcion.cliente?.nombres || '—'}
                                                                                    </SText>
                                                                                </SView>
                                                                            </SView>
                                                                        </SView>

                                                                        {/* Fechas */}
                                                                        <SView row style={{ justifyContent: "space-between", marginBottom: 32 }}>


                                                                            {/* Fechas */}
                                                                            <SView row style={{ justifyContent: "space-between", marginBottom: 32 }}>
                                                                                <SView flex>
                                                                                    <SText fontSize={13} bold marginBottom={8}>Fecha de inicio</SText>
                                                                                    <SInput
                                                                                        type="date"
                                                                                        value={fechaInicio}
                                                                                        onChangeText={handleChangeFechaInicio}
                                                                                        style={{
                                                                                            height: 48,
                                                                                            borderRadius: 6,
                                                                                            backgroundColor: STheme.color.card
                                                                                        }}
                                                                                    />
                                                                                </SView>

                                                                                <SView width={16} />

                                                                                <SView flex>
                                                                                    <SText fontSize={13} bold marginBottom={8}>Fecha de fin</SText>
                                                                                    <SInput
                                                                                        type="date"
                                                                                        value={fechaFin}
                                                                                        editable={false} // siempre calculada automáticamente
                                                                                        style={{
                                                                                            height: 48,
                                                                                            borderRadius: 6,
                                                                                            backgroundColor: STheme.color.card
                                                                                        }}
                                                                                    />
                                                                                </SView>
                                                                            </SView>
                                                                            {/* <SView flex>
                                                                                <SText fontSize={13} bold marginBottom={8}>Fecha de inicssio</SText>
                                                                                <SInput
                                                                                    type="date"
                                                                                    value={fechaInicio}

                                                                                    onChangeText={setFechaInicio}
                                                                                    style={{
                                                                                        height: 48,
                                                                                        borderRadius: 6,
                                                                                        backgroundColor: STheme.color.card
                                                                                    }}
                                                                                />
                                                                            </SView>

                                                                            <SView width={16} />

                                                                            <SView flex>
                                                                                <SText fontSize={13} bold marginBottom={8}>Fecha de fin</SText>
                                                                                <SInput
                                                                                    type="date"
                                                                                    value={fechaFin}
                                                                                    onChangeText={setFechaFin}
                                                                                    style={{
                                                                                        height: 48,
                                                                                        borderRadius: 6,
                                                                                        pointerEvents: "none",

                                                                                        backgroundColor: STheme.color.card
                                                                                    }}
                                                                                />
                                                                            </SView> */}
                                                                        </SView>

                                                                        {/* Botones */}
                                                                        <SView row>
                                                                            <Btn
                                                                                type="danger"
                                                                                label="CANCELAR"
                                                                                style={{ flex: 1 }}
                                                                                onPress={() => SPopup.close("editar-suscriptor-popup")}
                                                                            />
                                                                            <SView width={16} />
                                                                            <Btn
                                                                                type="primary"
                                                                                label="GUARDAR CAMBIOS"
                                                                                style={{ flex: 1 }}
                                                                                onPress={handleGuardar}
                                                                            />
                                                                        </SView>

                                                                    </ScrollView>
                                                                </SView>
                                                            </SView>
                                                        );
                                                    };

                                                    SPopup.open({
                                                        key: "editar-suscriptor-popup",
                                                        type: "1",
                                                        content: <EditarContent />
                                                    });
                                                }
                                            },
                                            {
                                                label: 'Eliminar Suscriptor',
                                                icon: <SIconApp name="crmeliminar" fill={STheme.color.danger} width={16} />,
                                                onPress: () => {

                                                    SPopup.confirm({
                                                        title: (
                                                            <SView center style={{ padding: 20 }}>
                                                                <SText style={{ fontSize: 18, fontWeight: 'bold', color: STheme.color.text }}>
                                                                    Eliminar Suscriptor
                                                                </SText>
                                                                <SHr height={16} />
                                                                <SView style={{
                                                                    width: 64,
                                                                    height: 64,
                                                                    borderRadius: 32,
                                                                    backgroundColor: 'rgba(220, 38, 38, 0.15)',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}>
                                                                    <SIconApp name="AlertOutline" width={32} fill="#dc2626" />
                                                                </SView>
                                                                <SHr height={16} />
                                                                <SText style={{ fontSize: 16, color: STheme.color.text, textAlign: 'center' }}>
                                                                    ¿Estás seguro de eliminar a
                                                                </SText>
                                                                <SText bold style={{ fontSize: 18, color: STheme.color.text }}>
                                                                    {suscripcion.cliente?.nombres || "este suscriptor"}
                                                                </SText>
                                                                <SText style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>
                                                                    Esta acción no se podrá deshacer
                                                                </SText>
                                                            </SView>
                                                        ),

                                                        onPress: () => {

                                                            const datosParaEnviar = {
                                                                key: suscripcion.key,
                                                                estado: 0,
                                                            };


                                                            MDL.inventario.editSuscripcion(datosParaEnviar).then((resp) => {
                                                                console.log("Artículo del cliente eliminado", resp);
                                                                SNotification.send({
                                                                    title: 'Éxito',
                                                                    body: 'Artículo del cliente eliminado correctamente.',
                                                                    time: 3000,
                                                                    color: STheme.color.success,
                                                                });
                                                                // onReload();
                                                                this.loadData();

                                                            }).catch((err) => {
                                                                console.error("Error al eliminar el artículo del cliente", err);
                                                                SNotification.send({
                                                                    title: 'Error',
                                                                    body: 'No se pudo eliminar el artículo del cliente.',
                                                                    time: 3000,
                                                                    color: STheme.color.danger,
                                                                });
                                                            });
                                                        },

                                                    });
                                                }
                                            }
                                        ];

                                        FloatMenu.open({
                                            e,
                                            label: `Opciones - ${suscripcion.cliente?.nombres || "Suscriptor"}`,
                                            options: menuOptions
                                        });
                                    }}
                                >
                                    <SView col={"xs-12"} row center>
                                        <SView width={48} height={48} style={{ padding: 4 }}>
                                            <SView flex height card style={{ overflow: 'hidden', borderRadius: 8 }}>
                                                <SImage
                                                    src={SSocket.api.inventario + "modelo/.128_" + this.state.data.key_modelo}
                                                    style={{ resizeMode: "cover" }}
                                                />
                                            </SView>
                                        </SView>

                                        <SView flex>
                                            <SText fontSize={13} color={STheme.color.text}>{item.nombre}</SText>
                                            <SText bold fontSize={15}>{item.precio} {item.moneda?.observacion}</SText>
                                        </SView>

                                        <SView width={12} />

                                        <SView width={48} height={48} style={{ padding: 4 }}>
                                            <SView flex height card style={{ overflow: 'hidden', borderRadius: 8 }}>
                                                <SImage
                                                    src={`${SSocket.api.root}usuario/${suscripcion.key_cliente}`}
                                                    enablePreview
                                                    style={{ resizeMode: "cover" }}
                                                />
                                            </SView>
                                        </SView>

                                        <SView flex>
                                            <SText fontSize={13} color={STheme.color.text}>Cliente</SText>
                                            <SText bold fontSize={15}>{suscripcion.cliente?.nombres || '—'}</SText>
                                        </SView>
                                    </SView>

                                    <SHr height={12} />

                                    <SText bold color={STheme.color.success} fontSize={14}>Suscripción Activa</SText>

                                    <SHr height={8} />

                                    <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                                        <SView flex border="#56bb78" backgroundColor='#e1f0e6' style={{
                                            padding: 12,
                                            borderRadius: 8,
                                            borderWidth: 1
                                        }}>
                                            <SText color="#56bb78" bold fontSize={11}>FECHA INICIO</SText>
                                            <SText color={STheme.color.primary} bold fontSize={14}>
                                                {new SDate(suscripcion.fecha_inicio).toString("dd MON yyyy")}
                                                {/* {new SDate(suscripcion.fecha_inicio).toString("dd/MM/yyyy")} */}
                                            </SText>
                                        </SView>

                                        <SView width={16} />

                                        <SView flex border="#df1313" backgroundColor='#dfc0c0' style={{
                                            padding: 12,
                                            borderRadius: 8,
                                            borderWidth: 1
                                        }}>
                                            <SText color="#df1313" bold fontSize={11}>FECHA FIN</SText>
                                            <SText color={STheme.color.primary} bold fontSize={14}>
                                                {new SDate(suscripcion.fecha_fin).toString("dd MON yyyy")}
                                            </SText>
                                        </SView>
                                    </SView>
                                </SView>
                            );
                        })}

                    </ScrollView>
                </SView>
            </SView>
        );
    }
}

// Componente SelectorCliente se mantiene igual
const SelectorCliente = ({ onSelect }) => {
    const [state, setState] = React.useState({ clientes: [] });

    React.useEffect(() => {
        MDL.crm.cliente.getAll().then(clientes => {
            setState({ clientes });
        });
    }, []);

    return (
        <SView style={{ width: "100%", height: 40, backgroundColor: STheme.color.card }}>
            <InputSelector
                options={state.clientes.map(c => ({
                    label: c.nombres ?? "-",
                    value: c.key,
                    customComponent: () => (
                        <>
                            <SText fontSize={12} color={STheme.color.card}>{c.correo}</SText>
                            <SText fontSize={12} color={STheme.color.card}>{c.telefono}</SText>
                        </>
                    )
                }))}
                onSelect={onSelect}
            />
        </SView>
    );
};