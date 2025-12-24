import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SDate, SHr, SImage, SInput, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import InputSelector from '../../../../Components/Selectores/InputSelector';
import MDL from '../../../../MDL';
import SSocket from 'servisofts-socket';
import FechasBetween from '../../../../Components/FechasBetween';
import FloatMenu from '../../../../Components/FloatMenu';
import SIconApp from '../../../../Assets/SIconApp';
import Btn from '../../../empresa/config/Components/Btn';

export default class PopupSuscriptor extends Component {
    static open(props) {
        SPopup.open({
            key: "popup-suscriptor",
            type: "1",
            content: <PopupSuscriptor {...props} />
        })
    }
    static close() {
        SPopup.close("popup-suscriptor");
    }
    constructor(props) {
        super(props);

        const dias = this.convertirADias(this.props.data_modelo?.duracion_medida, this.props.data_modelo?.duracion);

        this.state = {
            data: {},
            data_modelo: {},
            suscripcionSeleccionada: null, // Almacenamos la suscripción seleccionada
            fechaInicio: new SDate(this.props.data.fecha_inicio),
            fechaFin: new SDate(this.props.data.fecha_inicio).addDay(dias),
        };
    }


    onChangeFechaInicio = (valor) => {
        const fechaInicio = new SDate(valor, "yyyy-MM-dd");

        const dias = this.convertirADias(this.state.data_modelo?.modelo?.duracion_medida, this.state.data_modelo?.modelo?.duracion);

        const fechaFin = fechaInicio.clone().addDay(dias - 1);
        // const fechaFin = fechaInicio.clone().addDay(dias-1); aqui puedo quitar -1

        this.setState({ fecha_inicio: fechaInicio.toString("yyyy-MM-dd"), fecha_fin: fechaFin.toString("yyyy-MM-dd"), });

        if (this.props.onChange) { this.props.onChange(fechaInicio.toString("yyyy-MM-dd"), fechaFin.toString("yyyy-MM-dd")); }
    };

    onChangeFechaFin = (value) => {
        this.setState({ fecha_fin: value }, () => {
            if (this.props.onChange) {
                this.props.onChange(this.state.fecha_inicio, this.state.fecha_fin);
            }
        });
    }

    componentDidMount() {
        this.loadData();
    }

    handleFechaInicioChange = (text) => {
        const dias = this.convertirADias(
            this.state.data_modelo?.duracion_medida,
            this.state.data_modelo?.duracion
        );
        const nuevaFechaInicio = new SDate(text);
        this.setState({
            fechaInicio: nuevaFechaInicio,
            fechaFin: nuevaFechaInicio.addDay(dias),
        });
    };

    async loadData() {
        try {
            const resp = await SSocket.sendPromise({
                service: "inventario",
                component: "suscripcion",
                type: "getByKeyCompraVentaDetalle",
                key_compra_venta_detalle: this.props.data.key,
                estado: "cargando",
            });

            let cliente = {};
            if (resp?.data?.key_cliente) {
                try {
                    cliente = await MDL.crm.cliente.getByKey(resp.data.key_cliente) || {};
                } catch (error) {
                    console.error("Error al obtener datos del cliente:", error);
                }
            }

            let modelo = {};
            if (resp?.data?.key_modelo) {
                try {
                    modelo = await MDL.inventario.getAllModeloStock();
                } catch (error) {
                    console.error("Error al obtener datos del cliente:", error);
                }
            }

            // const sssssss = modelo.find(a => a?.key === "fc7898a0-c68b-4e2f-954e-de48fa3a4589") || {}

            // console.log("%c" + cliente, "color: #1584dfff; font-weight: bold;");
            // console.clear();

            const clientes = await MDL.crm.cliente.getAll();
            const modelos = await MDL.inventario.getAllModelo();

            // console.log("%c" + "sssss" + JSON.stringify(modelos, null, 2), "color: #2ECC40; font-weight: bold;");

            const _update_data = {
                ...resp.data,
                suscripciones: resp.data.suscripciones.map(subs => ({
                    ...subs,
                    cliente: clientes.find(a => a?.key === subs.key_cliente) || {},
                    // modelo: modelos.find(a => a?.key === '2085a0a2-26bf-41c9-bab9-fb4c0d1107d8') || {}
                    // modleo: modelos.find(a => a?.key === subs.key_producto) || {}
                }))
            };

            let adasd = this.props.data;

            const _ddddddddddf = {
                ...adasd,
                // suscripciones: resp.data.suscripciones.map(subs => ({
                // ...subs,
                // cliente: clientes.find(a => a?.key === subs.key_cliente) || {},
                // extra: modelos.find(a => a?.key === '2085a0a2-26bf-41c9-bab9-fb4c0d1107d8') || {}
                modelo: modelos.find(a => a?.key === adasd.key_modelo) || {}
                // }))
            };
            // mnodelo deberia ir la keymoloe 
            console.log("%c ssssssss" + JSON.stringify(_update_data, null, 2), "color: #15df15ff; font-weight: bold;");
            console.log("%c" + JSON.stringify(_ddddddddddf, null, 2), "color: #1584dfff; font-weight: bold;");
            // 
            this.setState({ data: _update_data, data_modelo: _ddddddddddf });

        } catch (error) {
            console.error("Error al cargar los datos:", error);
        }
    }

    // handleSuscripcionSelect = (suscripcion) => {
    //     // Cambiar el estado de la suscripción seleccionada
    //     this.setState({ suscripcionSeleccionada: suscripcion.key });

    //     // Mostrar la alerta
    //     alert(
    //         "Suscripción Seleccionada",
    //         `Seleccionaste la suscripción de ${suscripcion.cliente.nombres}`,
    //         [{ text: "OK" }]
    //     );
    // }

    convertirADias(tipo, cantidad) {
        // Validaciones para evitar errores en render
        if (!tipo || !cantidad || isNaN(cantidad)) {
            return 0;
        }

        switch (tipo) {
            case "horas":
                return cantidad / 24;

            case "dias":
                return cantidad;

            case "semanas":
                return cantidad * 7;

            case "meses":
                return cantidad * 30;

            case "anos":
                return cantidad * 365;

            default:
                return 0; // ❗ Nunca lanzar error en render
        }
    }


    render() {
        const _item = this.props.data;
        const _item2 = this.state?.data_modelo?.modelo;
        const _cantidad_suscriptores_permitida = _item2?.cantidad_suscriptores;

        const duracion = _item2?.duracion || 0;
        const duracionMedida = _item2?.duracion_medida || "";

        const dias = this.convertirADias(duracionMedida, duracion);


        const { fecha_inicio, fecha_fin, selectedCliente, data, data_modelo } = this.state;


        // const { fecha_inicio } = this.state;
        // const { fecha_fin } = this.state;

        // const fechaBase = new SDate();
        // const fechaFinal = new SDate().addDay(dias);



        // console.log(
        //     "%cSuscripción",
        //     "color: #2ECC40; font-weight: bold;",
        //     {
        //         _cantidad_suscriptores_permitida,
        //         duracion,
        //         duracionMedida,
        //         dias,
        //         fechaBase: fechaBase.toString("dd/MM/yyyy"),
        //         fechaFinal: fechaFinal.toString("dd/MM/yyyy"),
        //     }
        // );

        // return null; // o tu JSX



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
                        {/* Acciones */}
                        <SView row style={{ justifyContent: "space-between", alignItems: "center" }}>
                            <SView width={140} height={40} center border="cyan" style={{ borderRadius: 4, }}>
                                <SelectorCliente onSelect={(cliente) => { this.setState({ selectedCliente: cliente }); }} />
                            </SView>
                            <SView width={220} center>


                                <SView col="xs-12" row style={{ height: 40, justifyContent: "space-between", alignItems: "center" }}>
                                    <SView col="xs-5.8" style={{ height: "100%" }}>
                                        <SInput
                                            type="date"
                                            border="cyan"
                                            placeholder="Fecha Inicio"
                                            style={{ width: "100%", height: "100%", borderRadius: 4, backgroundColor: STheme.color.card }}
                                            value={this.state.fecha_inicio}
                                            onChangeText={this.onChangeFechaInicio}
                                        />
                                    </SView>

                                    <SView col="xs-5.8" style={{ height: "100%" }}>
                                        <SInput
                                            type="date"
                                            border="cyan"
                                            placeholder="Fecha Fin"
                                            style={{ width: "100%", height: "100%", borderRadius: 4, backgroundColor: STheme.color.card }}
                                            value={this.state.fecha_fin}
                                            onChangeText={this.onChangeFechaFin}
                                        />
                                    </SView>
                                </SView>
                                {/* <FechasBetween onChange={(fecha_inicio, fecha_fin) => { this.setState({ fecha_inicio: fecha_inicio, fecha_fin: fecha_fin }); }} /> */}
                            </SView>
                            <SView width={80} height={40} center backgroundColor={STheme.color.card} style={{ borderRadius: 4, }} >

                                <SView col={"xs-12"} height center card onPress={() => {



                                    // Validaciones
                                    if (!fecha_inicio) {
                                        SNotification.send({
                                            title: "Fecha de inicio requerida",
                                            body: "Por favor, selecciona una fecha de inicio para la suscripción.",
                                            color: STheme.color.danger,
                                            time: 4000,
                                        });
                                        return;
                                    }

                                    if (!fecha_fin) {
                                        SNotification.send({
                                            title: "Fecha de fin requerida",
                                            body: "Por favor, selecciona una fecha de fin para la suscripción.",
                                            color: STheme.color.danger,
                                            time: 4000,
                                        });
                                        return;
                                    }

                                    if (!selectedCliente?.value) {
                                        SNotification.send({
                                            title: "Cliente requerido",
                                            body: "Debes seleccionar un cliente para asignar la suscripción.",
                                            color: STheme.color.danger,
                                            time: 4000,
                                        });
                                        return;
                                    }



                                    const cantidad_suscripto = Array.isArray(this.state.data.suscripciones) ? this.state.data.suscripciones.length : 0;

                                    // Muestra la cantidad permitida y la cantidad actual de suscriptores
                                    // console.log(`%cCantidad permitida de suscriptores: ${_cantidad_suscriptores_permitida}`, 'color: #2ECC40; font-weight: bold;');
                                    // console.log(`%cCantidad de suscriptores actuales: ${cantidad_suscripto}`, 'color: #2ECC40; font-weight: bold;');





                                    // Verifica si la cantidad de suscriptores actuales es menor que la cantidad permitida
                                    if (_cantidad_suscriptores_permitida > cantidad_suscripto) {
                                        // Si se puede registrar más suscriptores
                                        console.log("%cRegistro de nuevos suscriptores permitido.", 'color: #2ECC40; font-weight: bold;');
                                        // Notificación de éxito
                                        SNotification.send({
                                            key: "success_sus",
                                            title: "¡Registro exitoso!",
                                            body: "Puedes registrar más suscriptores.",
                                            color: STheme.color.success,
                                            time: 4000,
                                        });

                                        // Enviar solicitud para registrar al nuevo suscriptor
                                        SSocket.sendPromise({
                                            service: "inventario",
                                            component: "suscripcion",
                                            type: "registro",
                                            data: {
                                                key_producto: this.state.data.key,
                                                key_cliente: this.state.selectedCliente?.value,
                                                fecha_inicio: this.state.fecha_inicio,
                                                fecha_fin: this.state.fecha_fin,
                                            },
                                            key_usuario: MDL.usuario.session.key,
                                        }).then((resp) => {
                                            // Recargar los datos después de un registro exitoso
                                            this.loadData();
                                        }).catch((e) => {
                                            console.error("Error al registrar suscripción:", e);
                                        });
                                    } else {
                                        // Si no se puede registrar más suscriptores
                                        console.log("%cNo se puede registrar más suscriptores. Límite alcanzado.", 'color: #cc602eff; font-weight: bold;');

                                        // Notificación de error
                                        SNotification.send({
                                            key: "error_sus",
                                            title: "Error: Límite de suscriptores alcanzado",
                                            body: "No se pueden registrar más suscriptores en este momento.",
                                            color: STheme.color.danger,
                                            time: 4000,
                                        });

                                        return; // Evita que se ejecute el código siguiente si no se puede registrar
                                    }
                                }}>

                                    <SText>{"ENVIAR"}</SText>

                                </SView>



                            </SView>
                        </SView>

                        <SHr height={24} />


                        <SText>Duracion {duracion} {duracionMedida} </SText>


                        <SText>cantidad {_cantidad_suscriptores_permitida}</SText>

                        {/* Mapeo de suscripciones */}
                        {this.state.data.suscripciones?.map((suscripcion) => {
                            const isSelected = this.state.suscripcionSeleccionada === suscripcion.key;
                            return (
                                <SView
                                    key={suscripcion.key}
                                    col={"xs-12"}
                                    row
                                    style={{
                                        justifyContent: "space-between",
                                        padding: 8,
                                        borderRadius: 8,
                                        borderColor: isSelected ? 'yellow' : STheme.color.card,
                                        borderWidth: isSelected ? 2 : 1,
                                    }}
                                    onPress={(e) => {

                                        this.setState({ suscripcionSeleccionada: suscripcion.key });

                                        // console.log("AQUI", e)
                                        // const { row, evt } = e;
                                        const menuOptions = [
                                            // {
                                            //     label: 'Llamar',
                                            //     icon: <SIconApp name="tareaclose" fill="#e4e4e4ff" width={16} />,
                                            //     onPress: () => {
                                            //         alert("trabajandolo")
                                            //     },
                                            // },
                                            {
                                                label: 'Editar Contacto',
                                                icon: <SIconApp name="Pencil" fill="#e4e4e4ff" width={16} />,
                                                onPress: () => {
                                                    SPopup.open({
                                                        key: "aaaaaaaaaaaaaaa",
                                                        content: (
                                                            <SView col="xs-12" center style={{ backgroundColor: STheme.color.background, maxWidth: 340, borderRadius: 8, overflow: "hidden", }} withoutFeedback >
                                                                {/* Encabezado */}
                                                                <SView
                                                                    col="xs-12"
                                                                    center
                                                                    style={{
                                                                        borderBottomWidth: 1,
                                                                        borderColor: STheme.color.lightGray + "55",
                                                                        paddingVertical: 8,
                                                                    }}
                                                                >
                                                                    <SText color={STheme.color.white}>Ingrese sus datos</SText>
                                                                    <SHr height={4} />
                                                                </SView>

                                                                <SHr height={8} />

                                                                {/* Campos de entrada */}
                                                                <SView col="xs-12" style={{ paddingHorizontal: 14 }}>
                                                                    <SInput
                                                                        placeholder="Nombre"
                                                                        value={suscripcion.key}
                                                                        style={{ height: 36, borderRadius: 4, marginBottom: 8 }}
                                                                        onChangeText={(text) => { this.firstName = text; }}
                                                                    />

                                                                    <SInput
                                                                        placeholder="Produto"
                                                                        value={_item.nombre}
                                                                        style={{ height: 36, borderRadius: 4, marginBottom: 8 }}
                                                                        onChangeText={(text) => { this.firstName = text; }}
                                                                    />







                                                                    {/* <SText color={STheme.color.primary} bold fontSize={13}>{new SDate(suscripcion.fecha_fin).toString("dd MON yyyy")}</SText> */}
                                                                    {/* <SText bold fontSize={13}>{suscripcion.cliente.nombres}</SText> */}





                                                                    <SInput
                                                                        placeholder="Fecha inicio"
                                                                        value={new SDate(suscripcion.fecha_inicio).toString("dd MON yyyy")}
                                                                        style={{ height: 36, borderRadius: 4, marginBottom: 8 }}
                                                                        onChangeText={(text) => { this.lastName = text; }}
                                                                    />

                                                                    <SInput
                                                                        placeholder="Fecha Fin"
                                                                        value={new SDate().addDay(dias).toString("dd MON yyyy")}
                                                                        // value={new SDate().addDay(dias).toString("dd MON yyyy")}
                                                                        style={{ height: 36, borderRadius: 4, marginBottom: 8 }}
                                                                        onChangeText={(text) => { this.lastName = text; }}
                                                                    />



                                                                </SView>

                                                                <SHr height={8} />
                                                                <SView row col={"xs-12"}>
                                                                    <Btn type='danger' label='CANCELAR'
                                                                        onPress={() => {
                                                                            SPopup.close("aaaaaaaaaaaaaaa")
                                                                            console.log("Se presionó");
                                                                        }}
                                                                    />
                                                                    <SView width={8} />

                                                                    <Btn type='primary' label='GUARDAR'

                                                                        onPress={() => {
                                                                            console.clear();
                                                                            console.log("%c" + this.state.data.key_modelo, `color: #2ECC40; font-weight: bold;`);
                                                                            console.log("Se guardo");
                                                                        }}
                                                                    />
                                                                </SView>










                                                            </SView>
                                                        ),
                                                    });

                                                    // alert("trabajandolo")
                                                    // FormRegistroCliente.open({
                                                    //     defaultData: card,
                                                    //     onActualizar: (nuevoDato) => {
                                                    //         // this.DinamicTable.loadData();
                                                    //         this.props.onLoadData(); // ✅ PROP NUEVA PARA RECARGAR
                                                    //         console.log("Cliente actualizado:", nuevoDato);
                                                    //     }
                                                    // });
                                                },
                                            },
                                            {
                                                label: 'Eliminar Suciotro',
                                                icon: <SIconApp name="crmeliminar" fill={STheme.color.danger} width={16} />,
                                                onPress: () => {

                                                    SPopup.confirm({
                                                        title: (
                                                            <SView center style={{
                                                                textAlign: 'center',
                                                                gap: 16,
                                                                paddingTop: 18,
                                                                paddingBottom: 14,
                                                                paddingHorizontal: 20
                                                            }}>
                                                                <SView col="xs-12" row style={{
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    marginBottom: 8
                                                                }}>
                                                                    <SView flex> <SText style={{ fontSize: 18, fontWeight: 'bold', color: STheme.color.text }}> Eliminar Contacto </SText> </SView>

                                                                    <SView> <SIconApp name="Cerrar" width={10} fill="#9ca3af" onPress={() => SPopup.close('confirm')} /> </SView>
                                                                </SView>
                                                                <SView style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(220, 38, 38, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <SIconApp name="AlertOutline" width={24} fill="#dc2626" />
                                                                </SView>
                                                                <SView style={{ marginBottom: 4 }}> <SText style={{ fontSize: 16, color: STheme.color.text, textAlign: 'center' }}> ¿Estás seguro de que deseas eliminar a </SText> </SView>
                                                                <SView style={{ marginBottom: 8 }}> <SText style={{ fontSize: 18, fontWeight: 'bold', color: STheme.color.text, textAlign: 'center' }}> {"juanita"} </SText> </SView>
                                                                <SText style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}> Esta acción no se podrá deshacer </SText>
                                                            </SView>
                                                        ),
                                                        onPress: () => {
                                                            console.log("%c" + "ingresar_texto", `color: #2ECC40; font-weight: bold;`);
                                                        }

                                                    });

                                                },
                                            },

                                        ];

                                        FloatMenu.open({ e: e, label: 'Opciones Contacto - ' + "juan", options: menuOptions, });
                                    }
                                    }
                                // this.handleSuscripcionSelect(suscripcion)}
                                >



                                    <SView col={"xs-12"} row center>
                                        <SView width={40} height={40} style={{ padding: 4 }}>
                                            <SView flex height card style={{ overflow: 'hidden' }}>
                                                <SImage src={SSocket.api.inventario + "modelo/.128_" + this.state.data.key_modelo} />
                                            </SView>
                                        </SView>
                                        <SView flex>
                                            <SText fontSize={12} color={STheme.color.text}>{_item.nombre}</SText>
                                            <SText bold fontSize={13}>{_item.precio} {_item.moneda.observacion}</SText>
                                        </SView>
                                        <SView width={8} />
                                        <SView width={40} height={40} style={{ padding: 4 }}>
                                            <SView flex height card style={{ overflow: 'hidden' }}>
                                                <SImage src={`${SSocket.api.root}usuario/${suscripcion.key_cliente}`} enablePreview style={{ resizeMode: "cover" }} />
                                            </SView>
                                        </SView>
                                        <SView flex>
                                            <SText fontSize={12} color={STheme.color.text}>Cliente</SText>
                                            <SText bold fontSize={13}>{suscripcion.cliente.nombres}</SText>
                                        </SView>
                                    </SView>
                                    <SHr height={8} />


                                    <SText>Suscripción Activa</SText>
                                    <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                                        <SView flex border="#56bb78" backgroundColor='#e1f0e6' style={{ padding: 10, borderRadius: 8, borderWidth: 1 }}>
                                            <SText color="#56bb78" bold style={{ paddingBottom: 2, fontSize: 10 }}>FECHA INICIO</SText>
                                            <SText color={STheme.color.primary} bold fontSize={13}>{new SDate(suscripcion.fecha_inicio).toString("dd MON yyyy")}</SText>
                                        </SView>
                                        <SView width={20} />
                                        <SView flex border="#df1313" backgroundColor='#dfc0c0' style={{ padding: 10, borderRadius: 8, borderWidth: 1 }}>
                                            <SText color="#df1313" bold style={{ paddingBottom: 2, fontSize: 10 }}>FECHA FIN</SText>
                                            <SText color={STheme.color.primary} bold fontSize={13}>{new SDate(suscripcion.fecha_fin).toString("dd MON yyyy")}</SText>
                                        </SView>
                                    </SView>
                                </SView>
                            );
                        })}
                    </ScrollView>
                </SView >
            </SView >
        );
    }
}

const SelectorCliente = (props) => {
    const [state, setState] = React.useState({
        clientes: [],
    });

    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const clientes = await MDL.crm.cliente.getAll();
        setState({ ...state, clientes });
    };

    return (
        <SView style={{ width: "100%", height: 40, backgroundColor: STheme.color.card }}>
            <InputSelector
                options={state.clientes.map(cliente => ({
                    label: cliente.nombres ?? "-", value: cliente.key, customComponent: () => (
                        <>
                            <SText fontSize={12} color={STheme.color.card}>{cliente.correo}</SText>
                            <SText fontSize={12} color={STheme.color.card}>{cliente.telefono}</SText>
                        </>
                    )
                }))}
                onSelect={props.onSelect}
            />
        </SView>
    );
};
