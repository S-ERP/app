import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';

import { SDate, SHr, SImage, SInput, SPopup, SText, STheme, SView } from 'servisofts-component';
import MDL from '../MDL';
import InputSelector from '../Components/Selectores/InputSelector';
import SSocket from 'servisofts-socket';
import FechasBetween from '../Components/FechasBetween';
import theme from '../Config/theme';

const ImageLabel = (props) => {
  return <SView row style={{ alignItems: "center", }}>
    <SView style={{ width: 25, height: 25, borderRadius: 4, borderWidth: 1, borderColor: STheme.color.card, overflow: "hidden", backgroundColor: STheme.color.card + "66", }}>
      <SImage src={props.src} enablePreview srcPreview={props.srcPreview} style={{ resizeMode: "cover", }} /> </SView>
    <SView width={8} />
    <SText flex style={props.textStyle} numberOfLines={props.colData.wrap ? 0 : 1} >{props.data}</SText>
  </SView>
}
export default class test extends Component {


  constructor(props) {
    super(props);
    this.state = {
      time: new Date().getTime(),

      data: {
        "descripcion": null,
        "estado": 1,
        "codigo": null,
        "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
        "key_empresa": "f894ea35-5ad1-4b61-a2d0-9294965be169",
        "fecha_on": "2025-12-18T00:59:38.772",
        "precio_compra": null,
        "index": null,
        "key_categoria_producto": null,
        "nombre": "Promo 2 personas 1 mes",
        "ley_seca": null,
        "precio": 500,
        "depreciacion": null,
        "suscripciones": [
          {
            "descripcion": null,
            "estado": 1,
            "key_producto": "04f04217-9dc0-4763-9aa2-78fd13b40064",
            "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
            "fecha_inicio": "2025-10-18T09:00:00",
            "fecha_on": "2025-12-18T01:21:21.339",
            "fecha_fin": "2025-12-25T09:00:00",
            "key_cliente": "83d10974-3f38-443a-8c74-2a60b49dfe15",
            "key": "bc0605e7-a6b8-4362-ac6f-d3cf65513f21"
          },
          {
            "descripcion": null,
            "estado": 1,
            "key_producto": "04f04217-9dc0-4763-9aa2-78fd13b40064",
            "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
            "fecha_inicio": "2025-10-18T09:00:00",
            "fecha_on": "2025-12-18T01:21:21.339",
            "fecha_fin": "2025-12-25T09:00:00",
            "key_cliente": "83d10974-3f38-443a-8c74-2a60b49dfe15",
            "key": "bc0605e7-a6b8-4362-ac6f-d3cf65513f21"
          },
          {
            "descripcion": null,
            "estado": 1,
            "key_producto": "04f04217-9dc0-4763-9aa2-78fd13b40064",
            "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
            "fecha_inicio": "2025-10-18T09:00:00",
            "fecha_on": "2025-12-18T01:21:21.339",
            "fecha_fin": "2025-12-25T09:00:00",
            "key_cliente": "83d10974-3f38-443a-8c74-2a60b49dfe15",
            "key": "bc0605e7-a6b8-4362-ac6f-d3cf65513f21"
          },
          {
            "descripcion": null,
            "estado": 1,
            "key_producto": "04f04217-9dc0-4763-9aa2-78fd13b40064",
            "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
            "fecha_inicio": "width={50}",
            "fecha_inicio": "2025-10-18T09:00:00",
            "fecha_fin": "2025-12-25T09:00:00",
            "key_cliente": "e23e119d-e866-4195-8e45-0a2204c26bce",
            "key": "1d3e0d09-ea02-4437-ad59-6a7fd4ab6dd9"
          }
        ],
        "limite_compra": null,
        "key_compra_venta_detalle": "4da98ce7-b20f-44fc-b6b1-acebb9f0e11f",
        "habilitado": null,
        "fecha_habilitacion_automatica": null,
        "key_modelo": "2085a0a2-26bf-41c9-bab9-fb4c0d1107d8",
        "key": "04f04217-9dc0-4763-9aa2-78fd13b40064",
        "observacion": null,
        "mayor_edad": null
      }
    };
  }


  render() {
    return <SView style={{
      width: "100%",
      height: "100%",
      padding: 32,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <SView style={{
        width: "100%",
        // maxWidth: 700,
        maxWidth: 500,
        height: 400,
        maxHeight: "100%",
        backgroundColor: STheme.color.background + "F0",
        borderWidth: 1,
        borderColor: STheme.color.card,
        borderRadius: 10,

      }} withoutFeedback>
        <ScrollView contentContainerStyle={{ padding: 16 }}>






          {/* <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}> */}
          <SView row style={{ justifyContent: "space-between", alignItems: "center" }}>
            {/* ACCIONES */}
            <SView width={140} height={40} center border="cyan" style={{ borderRadius: 4, }} >
              <SelectorCliente onSelect={(cliente) => { this.setState({ selectedCliente: cliente }); }} />
            </SView>

            <SView width={220} center     >
              <FechasBetween onChange={(fecha_inicio, fecha_fin) => { this.setState({ fecha_inicio: fecha_inicio, fecha_fin: fecha_fin }); }} />
            </SView>

            <SView width={80} height={40} center backgroundColor={STheme.color.card} style={{ borderRadius: 4, }} >
              <SView col={"xs-12"} height center card >

                <SText >{"ENVIAR"}</SText> </SView>
            </SView>
          </SView>



          <SHr height={18} />


          {/* CARDS */}


          {this.state.data.suscripciones?.map((suscripcion) => {
            return <>
              <SView col={"xs-12"} row style={{ justifyContent: "space-between", padding: 8, borderRadius: 8 }} border={STheme.color.card}   >
                <SView col={"xs-12"} row center  >
                  <SView width={40} height={40} style={{ padding: 4 }}>
                    <SView flex height card style={{ overflow: 'hidden', }}>
                      <SImage src={SSocket.api.inventario + "modelo/.128_" + this.state.data.key_modelo} />
                    </SView>
                  </SView>
                  <SView flex>
                    <SText fontSize={12} color={STheme.color.text}>Promo 2</SText>
                    <SText bold fontSize={13}>{"40 Bs"}</SText>
                  </SView>
                  <SView width={8} />
                  <SView width={40} height={40} style={{ padding: 4 }}>
                    <SView flex height card style={{ overflow: 'hidden', }}>
                      <SImage src={`${SSocket.api.root}usuario/${suscripcion.key_cliente}`} enablePreview style={{ resizeMode: "cover", }} />
                    </SView>
                  </SView>
                  <SView flex>
                    <SText fontSize={12} color={STheme.color.text}>Cliente</SText>
                    <SText bold fontSize={13}>{"Juan perez"}</SText>
                  </SView>
                </SView>
                <SHr height={8} />
                <SText>Sucrpcion Activa </SText>
                <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}   >
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
              <SHr height={16} />
            </>
          })}

        </ScrollView>
      </SView>
    </SView>
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
  }
  return <SView style={{
    width: "100%",
    // width: 200,
    height: 40,
    backgroundColor: STheme.color.card
  }}>
    <InputSelector
      options={state.clientes.map(cliente => ({
        label: cliente.nombres ?? "-", value: cliente.key, customComponent: (e) => {
          return <>
            <SText fontSize={12} color={STheme.color.card}>{cliente.correo}</SText>
            <SText fontSize={12} color={STheme.color.card}>{cliente.telefono}</SText>
          </>
        }
      }))}
      onSelect={props.onSelect}


    />
  </SView>
}


const InfoItem = (props) => {
  const data = props.data;
  return <SView col={"xs-12"} row center>
    <SView flex>
      <SText>{data.nombre}</SText>
    </SView>
    <SView>
      <SText>{data.cantidad}</SText>
    </SView>
  </SView>
}