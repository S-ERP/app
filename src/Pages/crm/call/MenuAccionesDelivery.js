import React, { Component } from 'react';
import { SHr, SIcon, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import PopupRazon from '../Components/PopupRazon';
import PopupRellamada from '../Components/PopupRellamada';
import Model from '../../../Model';


const OptionItem = ({ key, label, color, icono, onPress }) => {
  return <>
    <SView backgroundColor='transparent' center style={{ alignItems: "center", padding: 4, }}>
      <SView center style={{
        paddingLeft: 16,
        paddingRight: 16,
        padding: 8,
        opacity: 1,
        borderWidth: 1,
        borderColor: STheme.color.card,
        backgroundColor: color,
        borderRadius: 8,
      }} onPress={onPress} row>
        <SIcon name={icono} width={12} height={12} fill={STheme.color.text} />
        <SView width={8} />
        <SText fontSize={12}>{label}</SText>
      </SView>
    </SView>
  </>
};


export default class MenuAccionesDelivery extends Component<{ key_cliente_proyecto: string, onChange?: any }> {
  pk = SNavigation.getParam("key");
  state = {
    data: null,
  }

  handleChange = (type, e) => {
    if (this.props.onChange) {
      this.props.onChange(type, e);
      return;
    }
  }

  render() {
    const space = 16;
    return <SView row center>
      <OptionItem icono={"confirmar"}
        label={"Despachar"} color={STheme.color.success} onPress={() => {
          // if (window.confirm("¿Estás seguro de que quieres Confirmado, continuar?")) {
          MDL.crm.clienteProyecto.editar({
            key: this.pk,
            state: "despacho",
            key_usuario_atiende: Model.usuario.Action.getKey(),
            key_tipo_movimiento_lead: "despacho"
          }).then(e => {
            this.handleChange("despacho", e);
          })
          // }
        }} />



      {/* <OptionItem icono={"cancelado"}
        label={"Cancelado"}
        color={STheme.color.gray}
        onPress={() => {
          PopupRazon.open(
            ({
              tipo: "cancelado",
              onRegister: (e) => {
                MDL.crm.clienteProyecto.editar({
                  key: this.props.key_cliente_proyecto,
                  state: "cancelado",
                  key_tipo_movimiento_lead: e.selectedOption.key,
                  key_usuario_atiende: Model.usuario.Action.getKey(),
                }).then(e => {
                  this.handleChange("cancelado", e);
                })
              }
            }))
        }} /> */}


      {/* 
      <OptionItem icono={"cancelado"}
        label={"devuelto"} color={STheme.color.danger} onPress={() => {
          PopupRazon.open(
            ({
              tipo: "devuelto",
              onRegister: (e) => {
                MDL.crm.clienteProyecto.editar({
                  key: this.props.key_cliente_proyecto,
                  state: "devuelto",
                  key_tipo_movimiento_lead: e.selectedOption.key,
                  key_usuario_atiende: Model.usuario.Action.getKey(),
                }).then(e => {
                  this.handleChange("devuelto", e);
                })
              }
            }))
        }} /> */}



      <OptionItem icono={"cancelado"}
        label={"Rechazo"} color={STheme.color.danger}
        onPress={() => {
          PopupRazon.open(
            ({
              tipo: "rechazo",
              onRegister: (e) => {
                MDL.crm.clienteProyecto.editar({
                  key: this.props.key_cliente_proyecto,
                  state: "rechazo",
                  key_tipo_movimiento_lead: e.selectedOption.key,
                  key_usuario_atiende: Model.usuario.Action.getKey(),
                }).then(e => {
                  this.handleChange("rechazo", e);
                })
              }
            }))
        }} />



      <OptionItem icono={"recall"}
        label={"Llamar luego"} color={STheme.color.warning}
        onPress={() => {
          PopupRellamada.open(({
            onRegister: (e) => {
              MDL.crm.clienteProyecto.editar({
                key: this.props.key_cliente_proyecto,
                state: "delivery_rellamada",
                key_tipo_movimiento_lead: "",
                fecha_rellamada: e.fecha_rellamada,
                key_usuario_atiende: Model.usuario.Action.getKey(),
              }).then(e => {
                this.handleChange("delivery_rellamada", e);
              })

            }
          }))

        }} />



      <OptionItem icono={"llamadafallida"} label={"Llamada fallida"} color={STheme.color.gray} onPress={() => {
        PopupRazon.open(
          ({
            tipo: "llamada_fallida",
            onRegister: (e) => {
              MDL.crm.clienteProyecto.editar({
                key: this.props.key_cliente_proyecto,
                state: "delivery_llamada_fallida",
                key_tipo_movimiento_lead: e.selectedOption.key,
                key_usuario_atiende: Model.usuario.Action.getKey(),
              }).then(e => {
                this.handleChange("delivery_llamada_fallida", e);
              })
            }
          }))
      }} />

    </SView>
  }

}
