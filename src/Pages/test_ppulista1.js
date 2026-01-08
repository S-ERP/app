import React, { Component } from "react";
import { ScrollView } from "react-native";
import { SDate, SHr, SText, STheme, SView, SImage } from "servisofts-component";
import InputSelector from "../Components/Selectores/InputSelector"; // puedes reemplazar por tu componente de selección si quieres

export default class Test extends Component {
  constructor(props) {
    super(props);
    // JSON estático con 5 suscripciones para scroll
    this.state = {
      data: {
        nombre: "Promo 2 personas 1 mes",
        precio: 500,
        key_modelo: "2085a0a2-26bf-41c9-bab9-fb4c0d1107d8",
        suscripciones: [
          { key_cliente: "C1", fecha_inicio: "2025-10-18T09:00:00", fecha_fin: "2025-12-25T09:00:00" },
          { key_cliente: "C2", fecha_inicio: "2025-10-19T09:00:00", fecha_fin: "2025-12-26T09:00:00" },
          { key_cliente: "C3", fecha_inicio: "2025-10-20T09:00:00", fecha_fin: "2025-12-27T09:00:00" },
          { key_cliente: "C4", fecha_inicio: "2025-10-21T09:00:00", fecha_fin: "2025-12-28T09:00:00" },
          { key_cliente: "C5", fecha_inicio: "2025-10-22T09:00:00", fecha_fin: "2025-12-29T09:00:00" },
        ],
      },
      selectedCliente: null,
      fecha_inicio: null,
      fecha_fin: null,
    };
  }

  render() {
    const { data } = this.state;

    return (
      <SView
        style={{
          flex: 1,
          padding: 16,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: STheme.color.background,
        }}
      >
        <SView
          style={{
            width: "100%",
            maxWidth: 500,
            backgroundColor: STheme.color.background + "F0",
            borderWidth: 1,
            borderColor: STheme.color.card,
            borderRadius: 10,
            padding: 16,
          }}
        >
          {/* PARAMETROS: Cliente, Fechas, Botón */}
          <SView row style={{ justifyContent: "space-between", marginBottom: 16 }}>
            {/* Selector Cliente */}
            <SView width={140} height={40} style={{ backgroundColor: STheme.color.card, borderRadius: 4 }}>
              <InputSelector
                options={[
                  { label: "Cliente 1", value: "C1" },
                  { label: "Cliente 2", value: "C2" },
                  { label: "Cliente 3", value: "C3" },
                  { label: "Cliente 4", value: "C4" },
                  { label: "Cliente 5", value: "C5" },
                ]}
                onSelect={(cliente) => this.setState({ selectedCliente: cliente })}
              />
            </SView>

            {/* Fechas */}
            <SView width={220} height={40} style={{ backgroundColor: STheme.color.card, borderRadius: 4 }} center>
              <SText>Fecha Inicio - Fecha Fin</SText>
            </SView>

            {/* Botón ENVIAR */}
            <SView width={80} height={40} center style={{ backgroundColor: STheme.color.card, borderRadius: 4 }}>
              <SText bold>ENVIAR</SText>
            </SView>
          </SView>

          <SHr height={16} />

          {/* LISTA DE SUSCRIPCIONES */}
          {/* <ScrollView> */}
                    <ScrollView contentContainerStyle={{ padding: 16 }}>
            
            {data.suscripciones.map((suscripcion, index) => (
              <SView
                key={index}
                style={{
                  marginBottom: 16,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: STheme.color.card,
                  borderRadius: 8,
                }}
              >
                {/* FILA PRODUCTO Y CLIENTE */}
                <SView row center>
                  {/* Imagen Producto */}
                  <SView width={40} height={40} style={{ marginRight: 8 }}>
                    <SImage src="https://picsum.photos/40" style={{ resizeMode: "cover", borderRadius: 4 }} />
                  </SView>

                  {/* Datos Producto */}
                  <SView flex>
                    <SText fontSize={12} color={STheme.color.text}>{data.nombre}</SText>
                    <SText bold fontSize={13}>{data.precio} Bs</SText>
                  </SView>

                  <SView width={8} />

                  {/* Imagen Cliente */}
                  <SView width={40} height={40} style={{ marginRight: 8 }}>
                    <SImage src="https://picsum.photos/40" style={{ resizeMode: "cover", borderRadius: 4 }} />
                  </SView>

                  {/* Datos Cliente */}
                  <SView flex>
                    <SText fontSize={12} color={STheme.color.text}>Cliente</SText>
                    <SText bold fontSize={13}>{suscripcion.key_cliente}</SText>
                  </SView>
                </SView>

                <SHr height={8} />

                {/* Fechas Suscripción */}
                <SView row style={{ justifyContent: "space-between" }}>
                  <SView flex style={{ padding: 8, borderWidth: 1, borderColor: "#56bb78", borderRadius: 8, backgroundColor: "#e1f0e6" }}>
                    <SText color="#56bb78" bold fontSize={10}>FECHA INICIO</SText>
                    <SText bold fontSize={13}>{new SDate(suscripcion.fecha_inicio).toString("dd MON yyyy")}</SText>
                  </SView>

                  <SView width={8} />

                  <SView flex style={{ padding: 8, borderWidth: 1, borderColor: "#df1313", borderRadius: 8, backgroundColor: "#dfc0c0" }}>
                    <SText color="#df1313" bold fontSize={10}>FECHA FIN</SText>
                    <SText bold fontSize={13}>{new SDate(suscripcion.fecha_fin).toString("dd MON yyyy")}</SText>
                  </SView>
                </SView>
              </SView>
            ))}
          </ScrollView>
        </SView>
      </SView>
    );
  }
}
