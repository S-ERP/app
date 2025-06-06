import React, { Component } from 'react';
import { SHr, SIcon, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import PopupRazon from '../Components/PopupRazon';
import PopupRellamada from '../Components/PopupRellamada';


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


export default class MenuAcciones extends Component<{ key_cliente_proyecto: string }> {
  pk = SNavigation.getParam("key");
  state = {
    data: null,
  }


  render() {
    const space = 16;
    return <SView row center>
      <OptionItem icono={"confirmar"}
        label={"Confirmado"} color={STheme.color.success} onPress={() => {
          if (window.confirm("¿Estás seguro de que quieres Confirmado, continuar?")) {
            console.log("Confirmado");
            MDL.crm.clienteProyecto.editar({ key: this.pk, state: "confirmado", key_tipo_movimiento_lead: "confirmado" }).then(e => {
              SNavigation.goBack();
            })
          } else {
            console.log("Cancelado");
          }
        }} />



      <OptionItem icono={"confirmar"}
        label={"Entrega Express"} color={STheme.color.success} onPress={() => {
          if (window.confirm("¿Estás seguro de que quieres Entrega Express, continuar?")) {
            console.log("Entrega Express");
            MDL.crm.clienteProyecto.editar({ key: this.pk, state: "entrega_express", key_tipo_movimiento_lead: "entrega_express" }).then(e => {
              SNavigation.goBack();
            })
          } else {
            console.log("Cancelado");
          }
        }} />



      <OptionItem icono={"cancelado"}
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
                  key_tipo_movimiento_lead: e.selectedOption.key
                }).then(e => {
                  SNavigation.goBack();
                })
              }
            }))
        }} />



      <OptionItem icono={"double"}
        label={"Doble"} color={STheme.color.gray} onPress={() => {
          PopupRazon.open(
            ({
              tipo: "double",
              onRegister: (e) => {
                MDL.crm.clienteProyecto.editar({
                  key: this.props.key_cliente_proyecto,
                  state: "double",
                  key_tipo_movimiento_lead: e.selectedOption.key
                }).then(e => {
                  SNavigation.goBack();
                })
              }
            }))
        }} />



      <OptionItem icono={"spam"}
        label={"Spam"} color={STheme.color.gray}
        onPress={() => {
          PopupRazon.open(
            ({
              tipo: "spam",
              onRegister: (e) => {
                MDL.crm.clienteProyecto.editar({
                  key: this.props.key_cliente_proyecto,
                  state: "spam",
                  key_tipo_movimiento_lead: e.selectedOption.key
                }).then(e => {
                  SNavigation.goBack();
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
                state: "rellamada",
                key_tipo_movimiento_lead: ""
              }).then(e => {
                SNavigation.goBack();
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
                state: "llamada_fallida",
                key_tipo_movimiento_lead: e.selectedOption.key
              }).then(e => {
                SNavigation.goBack();
              })
            }
          }))
      }} />

    </SView>
  }

}
