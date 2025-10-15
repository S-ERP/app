import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SHr, SImage, SInput, SLoad, SPopup, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';

type ElaborarProps = {
  modelo: any,
  key_sucursal: string
}
export default class Elaborar extends Component<ElaborarProps> {

  static open(props: ElaborarProps) {
    SPopup.open({
      key: "elaborar",
      content: <SView style={{
        width: "100%",
        height: "100%",
        maxHeight: 500,
        maxWidth: 500,
        borderRadius: 8,
        borderColor: STheme.color.card,
        borderWidth: 1,
        backgroundColor: STheme.color.background,
      }} withoutFeedback>
        <Elaborar {...props} />
      </SView>
    })
  }

  state: {
    ready: boolean,
    modelos: any[],
    ingredientes?: any[],
  } = {
      ready: false,
      modelos: []
    }

  componentDidMount(): void {
    this.loadData();
  }

  async loadData() {
    const { modelo, key_sucursal } = this.props;
    const modelos = await MDL.inventario.getAllModeloStockBySucursal(key_sucursal);
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "ingrediente",
      type: "getAll",
      key_modelo: modelo.key,
    })
    const ingredientes = resp.data;
    this.setState({
      modelos,
      ingredientes,

    })
    console.log(ingredientes)
  }

  renderIngredientes() {
    if (!this?.state?.ingredientes) {
      return <SLoad />
    }
    if (Object.values(this.state.ingredientes).length <= 0) {
      return <SText color={STheme.color.warning}>{"No requiere ingredientes para elaborarse. Deberia adquirirse a travez de una compra o al descomponer otro objeto."}</SText>
    }
    return Object.values(this.state.ingredientes).map((ingrediente: any) => {
      return <Ingrediente ingrediente={ingrediente} modelos={this.state.modelos} />
    })
  }

  render() {
    const { modelo } = this.props;
    return <SView style={{
      flex: 1,
      width: "100%"
    }}>
      <ScrollView contentContainerStyle={{
        padding: 16
      }}>
        <SView row style={{
          alignItems: "center"
        }}>
          <SView style={{
            width: 30,
            height: 30,
            overflow: "hidden",
          }} card>
            <SImage src={(SSocket?.api?.inventario) + "modelo/.128_" + modelo.key} style={{
              resizeMode: "cover"
            }} />
          </SView>
          <SView style={{ width: 4 }} />
          <SText bold fontSize={18}>{modelo.descripcion}</SText>

        </SView>
        <SHr />
        <SView>
          {this.renderIngredientes()}
        </SView>
        <SHr h={32} />
        <SView row center>
          <SView padding={8} card>
            <SText>{"Elaborar"}</SText>
          </SView>
        </SView>
      </ScrollView>
    </SView>
  }
}


class Ingrediente extends Component<{ ingrediente: any, modelos: any[] }> {
  ingredientes_ref = {}
  renderModelosDelIngrediente(ingrediente: any) {
    if (!ingrediente) return <SText color={STheme.color.danger}>{"No se encontro el ingrediente."}</SText>
    if (!ingrediente.modelo_ingrediente) return <SText color={STheme.color.warning}>{"El ingrediente no tiene modelos."}</SText>
    return ingrediente.modelo_ingrediente.map((modelo_ingrediente: any) => {
      const modelo = this.props.modelos.find((item: any) => item.key == modelo_ingrediente.key_modelo);
      const h = 28
      return <SView style={{
        alignItems: "center",
        height: h,
        marginTop: 8,
      }} row>
        <SText color={STheme.color.lightGray} >{"-"}</SText>
        <SView width={4} />
        <SView style={{
          width: h,
          height: h,
          overflow: "hidden",
        }} card>
          <SImage src={SSocket.api.inventario + "modelo/.128_" + modelo.key} style={{
            resizeMode: "cover"
          }} />
        </SView>
        <SView width={4} />
        <SText>{modelo.descripcion}</SText>
        <SView width={4} />
        <InputCantidad
          ref={ref => {
            this.ingredientes_ref[modelo_ingrediente.key] = ref;
          }}

          getMax={() => {
            return ingrediente.cantidad;
          }}
          getMin={() => {
            return 0;
          }}
          // clearOther={() => {

          // }}
          onChangeText={(e) => {
            if (e) {
              Object.keys(this.ingredientes_ref).filter(key => key != modelo_ingrediente.key).forEach(key => {
                const ref = this.ingredientes_ref[key];
                if (ref.getValue()) {
                  ref.setValue("");
                }
              })
              if (parseFloat(e) > ingrediente.cantidad) {
                return ingrediente.cantidad;
              }
            }
          }}
        />
      </SView>
    })
  }

  render() {
    const { ingrediente } = this.props;
    return <SView padding={4}>
      <SView row style={{
        alignItems: "center"
      }}>

        <SText bold fontSize={16}>{ingrediente.descripcion}</SText>
        <SView width={8} />
        {ingrediente.is_required && <SText fontSize={8} color={STheme.color.warning}>{"REQUERIDO"}</SText>}
        {!ingrediente.is_required && <SText fontSize={8} color={STheme.color.lightGray}>{"OPCIONAL"}</SText>}
        <SView width={8} />
        <SText fontSize={10}>{"("}{0}/{ingrediente.cantidad}{")"}</SText>
        {/* <SView width={8} /> */}

      </SView>
      <SView padding={4}>
        {this.renderModelosDelIngrediente(ingrediente)}
      </SView>
    </SView>
  }

}



const InputCantidad = React.forwardRef((props: any, ref: any) => {
  const input = React.useRef<SInput>(null);

  React.useImperativeHandle(ref, () => ({
    setValue: (value: any) => {
      if (!input.current) return;
      input.current.setValue(value);
    },
    getValue: () => {
      if (!input.current) return;
      return input.current.getValue();
    }
  }));

  return <SView row center style={{
    width: 120,
    height: 22,
    borderWidth: 1,
    borderColor: STheme.color.card,
    borderRadius: 4,
  }}>
    <SView card style={{ width: 20, height: 20 }} center onPress={() => {
      if (!input.current) return;

      input.current.setValue("");
    }}>
      <SText style={{ fontSize: 7 }} center >{"MIN"}</SText>
    </SView>
    <SView card style={{ width: 20, height: 20 }} center onPress={() => {
      if (!input.current) return;
      const val = parseFloat(input.current.getValue() ?? 0) - 1
      if (val <= 0) {
        input.current.setValue("");
        return;
      }
      input.current.setValue(val);
    }}>
      <SText center



      >{"-"}</SText>
    </SView>
    <SView style={{
      flex: 1,
      height: 20,
    }}>
      <SInput
        ref={input}
        style={{
          height: 20,
          fontSize: 12,
          backgroundColor: "transparent",
          paddingLeft: 2,
          paddingRight: 2,
        }}

        icon={<SView />}
        iconR={<SView />}
        customStyle={"erp"}
        type='money2'
        {...props}
      />
    </SView>
    <SView card style={{ width: 20, height: 20 }} center onPress={() => {
      if (!input.current) return;
      const toValue = parseFloat(input.current.getValue() || "0") + 1
      if (props.getMax() < toValue) {
        return;
      }
      // props.clearOther();
      input.current.setValue(toValue);
    }}>
      <SText center >{"+"}</SText>
    </SView>
    <SView card style={{ width: 20, height: 20 }} center onPress={() => {
      if (!input.current) return;
      input.current.setValue(parseFloat(props.getMax() || "0"));
      // if (props.clearOther) {
      //   props.clearOther();
      // }
    }}>
      <SText style={{ fontSize: 7 }} center >{"MAX"}</SText>
    </SView>

  </SView >
})