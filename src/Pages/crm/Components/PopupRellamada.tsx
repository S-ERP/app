
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import MDL from '../../../MDL';
import { DinamicTable } from 'servisofts-table';
import { SDate, SForm, SHr, SIcon, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import PButtom from '../../../Components/PButtom';


type PopupRellamadaType = {
    onRegister: (e: any) => void;
    onActualizar: (e: any) => void;
    onCancel?: () => void;
    defaultData?: any;
};

interface State {
    tiempo_cliente: string;
}

export default class PopupRellamada extends Component<PopupRellamadaType, State> {
    form: SForm | null = null;

    constructor(props: PopupRellamadaType) {
        super(props);
        const now = new SDate().toString("hh:mm");
        this.state = {
            tiempo_cliente: props.defaultData?.tiempo_cliente || now,
        };
    }

    static open(props: PopupRellamadaType) {
        SPopup.open({
            key: "ppuprellamada",
            content: (
                <SView
                    backgroundColor={STheme.color.background}
                    style={{ borderRadius: 8, maxWidth: 320 }}
                    padding={16}
                    withoutFeedback
                    col={"xs-11"}
                >
                    <PopupRellamada
                        {...props}
                        onRegister={(e) => {
                            SPopup.close("ppuprellamada");
                            if (props.onRegister) props.onRegister(e);
                        }}
                        onCancel={() => {
                            SPopup.close("ppuprellamada");
                            if (props.onCancel) props.onCancel();
                        }}
                    />
                </SView>
            ),
        });
    }

    setTiempoCliente = (val: string) => {
        this.setState({ tiempo_cliente: val });
        if (this.form) {
            // Actualiza el valor en el formulario, si SForm acepta esta forma (depende de implementación)
            // Si no funciona, lo manejamos solo por estado y en onSubmit tomamos el estado
            this.form.setValue && this.form.setValue("tiempo_cliente", val);
        }
    };

    time(text: string) {
        const tiempoSeleccionado = this.state.tiempo_cliente;

        // Convertimos el texto del botón a hora en formato "hh:mm"
        let date = new SDate();
        if (text.includes("min")) {
            const minutos = parseInt(text.split(" ")[0]);
            date.addMinute(minutos);
        } else if (text.includes("hrs")) {
            const horas = parseInt(text.split(" ")[0]);
            date.addHour(horas);
        }
        const horaBoton = date.toString("hh:mm");

        // Comparamos si la hora actual seleccionada es igual a la del botón
        const esSeleccionado = tiempoSeleccionado === horaBoton;

        return (
            <SView col={"xs-2.4"} style={{ padding: 4 }}>
                <SView
                    padding={5}
                    style={{
                        backgroundColor: esSeleccionado
                            ? STheme.color.danger // Color de fondo cuando está seleccionado
                            : STheme.color.card,   // Color por defecto
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onPress={() => {
                        this.setTiempoCliente(horaBoton);
                    }}
                >
                    <SText
                        fontSize={10}
                        color={esSeleccionado ? STheme.color.white : STheme.color.text}
                        bold
                    >
                        {text}
                    </SText>
                </SView>
            </SView>
        );
    }


    render() {
        const { defaultData } = this.props;
        const { tiempo_cliente } = this.state;

        return (
            <SView center>
                <SText bold>{defaultData ? "Editar Proyecto" : "Fecha de hora de rellamada"}</SText>
                <SHr height={20} />
                <SView row>
                    <SText justify fontSize={12} color={STheme.color.text} bold style={{ textAlign: "center" }}>
                        La rellamada solo se coloca a petición
                    </SText>
                    <SText fontSize={12} color={STheme.color.text} style={{ textAlign: "center" }}>
                        En otros casos utilice botón "Llamada fallida"
                    </SText>
                    <SText justify fontSize={12} color={STheme.color.text} bold style={{ textAlign: "center" }}>
                        Programar rellamadas no más de 1d 0h
                    </SText>
                </SView>
                <SHr height={15} />
                <SView col={"xs-12"} row>
                    {this.time("10 min")}
                    {this.time("20 min")}
                    {this.time("30 min")}
                    {this.time("1 hrs")}
                    {this.time("2 hrs")}
                </SView>

                <SForm
                    row
                    ref={(ref: any) => (this.form = ref)}
                    style={{
                        justifyContent: "space-between",
                    }}
                    inputs={{
                        fecha: {
                            col: "xs-5.8",
                            label: "Fecha *",
                            type: "date",
                            autoFocus: true,
                            required: true,
                            defaultValue: new SDate().toString("yyyy-MM-dd"),
                            onSubmitEditing: () => {
                                this.form?.focus?.("tiempo_cliente");
                            },
                        },
                        tiempo_cliente: {
                            col: "xs-5.8",
                            label: "Tiempo de cliente *",
                            type: "hour",
                            required: true,
                            value: tiempo_cliente,
                            onChange: (val: string) => this.setTiempoCliente(val),
                            onSubmitEditing: () => {
                                this.form?.focus?.("comentario");
                            },
                        },
                        comentario: {
                            col: "xs-12",
                            label: "Comentario *",
                            type: "textArea",
                            required: true,
                            defaultValue: defaultData?.descripcion || "",
                            onSubmitEditing: () => {
                                this.form?.submit?.();
                            },
                        },
                        fijar: {
                            col: "xs-12",
                            label: "¿Fijar la llamada?",
                            type: "checkBox",
                            defaultValue: defaultData?.fijar || false,
                        },
                    }}
                    onSubmit={(e: any) => {
                        const comentario = e?.comentario?.trim?.();



                        if (!comentario) {
                            SNotification.send({
                                key: "formulario_error_comentario",
                                title: "Falta comentario",
                                body: "⚠️ Debes escribir algo en el campo comentario.",
                                type: "warning",
                                time: 3000,
                            });
                            this.form?.focus?.("comentario");
                            return;
                        }

                        // Verificar si se seleccionó un tiempo
                        const tiempo_cliente = this.state.tiempo_cliente;
                        if (!tiempo_cliente) {
                            SNotification.send({
                                key: "formulario_error_tiempo",
                                title: "Tiempo no seleccionado",
                                body: "⏱️ Debes seleccionar un tiempo antes de continuar.",
                                type: "warning",
                                time: 3000,
                            });
                            return;
                        }



                        const data = {
                            ...defaultData,
                            ...e,
                            comentario, // comentario limpio
                            tiempo_cliente: this.state.tiempo_cliente,
                        };

                        console.log("✅ Datos a registrar:", data);

                        if (this.props?.onRegister) {
                            this.props.onRegister(data);
                        }
                    }}
                />

                <SHr />
                <SView row col={"xs-12"}>
                    {this.props.onCancel && (
                        <>
                            <PButtom
                                flex
                                type="danger"
                                onPress={() => {
                                    if (this.props.onCancel) this.props.onCancel();
                                }}
                            >
                                CANCELAR
                            </PButtom>
                            <SView width={8} />
                        </>
                    )}

                    <PButtom flex type="secondary" onPress={() => this.form?.submit && this.form.submit()}>
                        {defaultData ? "ACTUALIZAR" : "ACEPTAR"}
                    </PButtom>
                </SView>
            </SView>
        );
    }
}
