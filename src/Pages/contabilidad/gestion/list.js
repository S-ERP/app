import React, { Component } from 'react';
import { SDate, SHr, SIcon, SInput, SLoad, SNavigation, SText, STheme, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../Model';
import item from "./item";
class index extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            item: item,
            excludes: ["key", "fecha_on", "key_usuario", "key_empresa"],
        });
    }
    // $allowNew() {
    //     return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
    // }
    // onNew() {
    // }
    // $allowTable() {
    //     return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "table" });
    // }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
    }
    $filter(data) {
        return data.estado != 0
    }
    $order() {
        return [{ key: "fecha", order: "desc" }]
    }
    $getData() {
        this.data = Parent.model.Action.getAll();
        return this.data;
    }

    abrir_gestion() {
        let fecha = this.input_fecha.getValue();
        this.setState({ loading: true, error: "" })
        Model.gestion.Action.cerrar({ fecha: fecha, key_usuario:Model.usuario.Action.getKey() }).then(resp => {
            this.setState({ loading: false, error: "" })
            Model.gestion.Action.CLEAR();
            SNavigation.navigate("/contabilidad/gestion/profile", { pk: resp?.data?.key })
        }).catch(e => {
            this.setState({ loading: false, error: e.error })
        })
    }
    $render() {
        if (!this.$getData()) return <SLoad />
        if (Object.values(this.data).length <= 0) {
            return <SView col={"xs-12"} center>
                <SHr h={16} />
                <SIcon name='Alert' fill='transparent' width={50} />
                <SHr h={8} />
                <SText fontSize={20} bold>{"¿Primera vez que abrirás una gestión?"}</SText>
                <SHr h={8} />
                <SText fontSize={16} color={STheme.color.lightGray} justify>{`Es necesario abrir una gestión en el sistema contable para que puedas registrar correctamente tus actividades económicas y mantener un seguimiento adecuado de las mismas. Si no abres una gestión, es posible que la información financiera de tu empresa no esté completa o no sea precisa, lo que podría dificultar la toma de decisiones en el futuro.

Por lo tanto, te recomendamos abrir una gestión en el sistema contable tan pronto como sea posible para comenzar a registrar tus actividades económicas y tener un registro ordenado y preciso de tus transacciones financieras.`}</SText>
                <SHr h={16} />
                <SHr h={1} color={STheme.color.card} />
                <SHr h={16} />
                <SText fontSize={16} color={STheme.color.lightGray}>{"Ingresa el mes y el año de la gestión: "}</SText>
                <SHr h={4} />
                <SView width={100}>
                    <SInput ref={ref => this.input_fecha = ref} type='date_my' iconR={<SView width={10} />} style={{
                        textAlign: "center"
                    }} defaultValue={new SDate().toString("yyyy-MM")} />
                </SView>
                <SHr h={16} />
                <SText color={STheme.color.danger}>{this.state.error}</SText>
                {!this.state.loading ? <SText underLine padding={8} onPress={this.abrir_gestion.bind(this)}>{"Presione aquí para iniciar una gestión"}</SText> : <SLoad />}
                <SHr h={16} />
            </SView>
        }
        return super.$render();
    }

}
export default connect(index);