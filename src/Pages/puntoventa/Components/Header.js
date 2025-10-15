import React, { Component } from "react";
import {
  SImage,
  SInput,
  SNavigation,
  SNotification,
  SText,
  STheme,
  SView,
} from "servisofts-component";
import SIconApp from "../../../Assets/SIconApp";
import Model from "../../../Model";
import FotoUsuario from "./Foto/FotoUsuario";
import MDL from "../../../MDL";

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sucursal: null,
      monedas: [],
      loading: true,
    };
  }

  async componentDidMount() {
    try {
      await Promise.all([this.cargarSucursalGuardada(), this.loadData()]);
    } catch (e) {
      console.error("Error inicializando Header:", e);
    } finally {
      this.setState({ loading: false });
    }
  }

  /** 🔹 Carga datos de la empresa */
  async loadData() {
    try {
      const data = await MDL.empresa.getFull();
      this.setState({ monedas: data.monedas || [] });
    } catch (e) {
      console.error("Error al cargar monedas:", e);
      SNotification.send({
        title: "Error HEADER",
        body: "No se pudo cargar las monedas.",
        type: "error",
        color: STheme.color.error,
        time: 5000,
      });
    }
  }

  /** 🔹 Carga la sucursal guardada */
  async cargarSucursalGuardada() {
    try {
      const sucursal = await MDL.compra_venta.getSucursalSeleccionada();
      if (sucursal) {
        this.setState({ sucursal });
      }
    } catch (e) {
      console.error("Error al cargar sucursal:", e);
      SNotification.send({
        title: "Error HEADER",
        body: "No se pudo cargar la sucursal guardada.",
        type: "error",
        color: STheme.color.error,
        time: 5000,
      });
    }
  }

  /** 🔹 Render principal */
  render() {
    const usuario = Model.usuario.Action.getUsuarioLog();
    const empresa = Model.empresa.Action.getSelect();
    const { sucursal, loading } = this.state;

    if (loading) {
      return (
        <SView
          height={40}
          col={"xs-12"}
          center
          backgroundColor={STheme.color.background}
        >
          <SText color={STheme.color.text}>Cargando...</SText>
        </SView>
      );
    }

    return (
      <SView
        col={"xs-12"}
        row
        center
        height={40}
        backgroundColor={STheme.color.background}
        style={{
          borderBottomWidth: 1,
          borderColor: STheme.color.card,
          paddingHorizontal: 8,
        }}
      >
        {/* 🔙 Botón atrás */}
        <SView
          width={40}
          height
          center
          onPress={() => {
            if (this.props.onBack) {
              const prevent_default = this.props.onBack();
              if (prevent_default) return;
            }
            SNavigation.goBack();
          }}
        >
          <SIconApp height={20} name={"Arrow"} fill={STheme.color.text} />
        </SView>

        {/* 🏢 Nombre de empresa */}
        <SView col={"xs-4 md-2"} row>
          <SText
            fontSize={15}
            bold
            color={STheme.color.text}
            style={{
              letterSpacing: -0.5,
              textTransform: "uppercase",
            }}
          >
            {empresa?.razon_social ?? "EMPRESA"}
          </SText>
        </SView>

        <SView flex />

        {/* 👤 Usuario + estado */}
        <SView
          col={"xs-7 md-5 lg-3"}
          height
          row
          center
          style={{ justifyContent: "flex-end" }}
        >
          {/* Usuario */}
          <SView
            row
            center
            style={{
              borderRightColor: STheme.color.gray,
              borderRightWidth: 1,
              paddingRight: 8,
            }}
          >
            <SView
              center
              style={{
                width: 28,
                height: 28,
                borderRadius: 16,
                marginRight: 8,
                overflow: "hidden",
              }}
            >
              <FotoUsuario data={usuario} />
            </SView>
            <SText fontSize={13} color={STheme.color.text}>
              {usuario?.Nombres || "Sin usuario"}
            </SText>
          </SView>

          <SView flex />

          {/* Estado de conexión */}
          <SView col={"xs-0 md-1"} center>
            <SIconApp name="Wifi" width={20} height={20} fill={"#19b121ff"} />
          </SView>

          <SView flex />

          {/* Menú */}
          <SView col={"xs-1.5 md-1"} center>
            <SIconApp
              name="Menu2"
              width={28}
              stroke={STheme.color.text}
              fill={STheme.color.text}
            />
          </SView>
        </SView>
      </SView>
    );
  }
}
