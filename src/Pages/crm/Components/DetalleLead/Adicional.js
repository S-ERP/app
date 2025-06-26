import React, { Component } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { SButtom, SDate, SForm, SHr, SIcon, SImage, SInput, SList, SLoad, SMath, SNavigation, SNotification, SText, STheme, SThread, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../../../MDL";
import Model from "../../../../Model";
import { cameraPosition } from "three/examples/jsm/nodes/Nodes";
import { ToastAndroid } from "react-native";
export default class Adicional extends Component {

    constructor(props) {
        super(props);

        this.state = {};
        this.old = {}; // Aquí se guarda el estado anterior

    }

    // handleChange = (key, value) => {
    //     this.props.cliente_proyecto[key] = value;
    //     const cp = this.props.cliente_proyecto;


    //     this.forceUpdate();
    //     new SThread(3000, "edit_adicional", true).start(() => {

    //         const sas = MDL.crm.clienteProyecto.editar({
    //             key: this.props.cliente_proyecto.key,
    //             notas: this.props.cliente_proyecto.notas,
    //             instrucciones_especiales: this.props.cliente_proyecto.instrucciones_especiales,
    //             fecha_entrega: this.props.cliente_proyecto.fecha_entrega,
    //             key_usuario_atiende: Model.usuario.Action.getKey(),
    //          })
    //     })
    // }

    // old = {}

    handleChange = (key, value) => {
        const cp = this.props.cliente_proyecto;
        this.old[key] = cp[key];
        cp[key] = value;
        this.forceUpdate();

        new SThread(3000, "edit_adicional", true).start(() => {

            const valores = {
                key: this.props.cliente_proyecto.key,
                key_usuario_atiende: Model.usuario.Action.getKey(),
            }

            if (this.old.notas !== cp.notas) {
                console.log("nota")
                valores.notas = cp.notas
            }

            if (this.old.instrucciones_especiales !== cp.instrucciones_especiales) {
                console.log("espec")
                valores.instrucciones_especiales = cp.instrucciones_especiales
            }

            if (this.old.fecha_entrega !== cp.fecha_entrega) {
                console.log("fecha")
                valores.fecha_entrega = cp.fecha_entrega
            }

            console.log("Valores a guardar:", valores); // ✅ verificación

            MDL.crm.clienteProyecto.editar(valores)
        });
    }


    render() {
        const { cliente_proyecto } = this.props;
        const fecha_capturada = new Date(cliente_proyecto.fecha_entrega).toISOString().split('T')[0];
        console.log("render " + cliente_proyecto.fecha_entrega)


        return <SForm
            ref={ref => this.form = ref}
            inputs={{
                notas: {
                    label: "Notas", col: "xs-12",
                    required: false, type: "textArea",
                    value: cliente_proyecto?.notas ?? "",
                    onChangeText: e => this.handleChange("notas", e),
                },
                instrucciones_especiales: {
                    label: "Instrucciones especiales",
                    col: "xs-12", required: false,
                    value: cliente_proyecto?.instrucciones_especiales ?? "",
                    onChangeText: e => this.handleChange("instrucciones_especiales", e),
                },
                fecha_entrega: {
                    label: "Fecha de entrega",
                    col: "xs-12", required: true, type: "date",
                    value: fecha_capturada ?? "",
                    onChangeText: e => this.handleChange("fecha_entrega", e),
                },
            }}


            onSubmit={(e) => {
                console.log("Adicional Form Submitted", e);
            }}
        />;
    }
}