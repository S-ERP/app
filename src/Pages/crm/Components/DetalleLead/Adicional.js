import React, { Component } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { SButtom, SDate, SForm, SHr, SIcon, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../../../MDL";
import Model from "../../../../Model";
export default class Adicional extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    handleChange = (key, value) => {
        this.props.cliente_proyecto[key] = value;
        this.forceUpdate();
        new SThread(3000, "edit_adicional", true).start(() => {
            const sas = MDL.crm.clienteProyecto.editar({
                key: this.props.cliente_proyecto.key,
                notas: this.props.cliente_proyecto.notas,
                instrucciones_especiales: this.props.cliente_proyecto.instrucciones_especiales,
                fecha_entrega: this.props.cliente_proyecto.fecha_entrega,
                key_usuario_atiende: Model.usuario.Action.getKey(),
            })
            console.log("actualizado " + sas)
        })
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