import React, { Component } from "react";
import { View, Text } from "react-native";
import { STheme, SView, SText } from "servisofts-component";
import InputSelector from "../../../../Components/Selectores/InputSelector";

export default class FiltroAlmacen extends Component {
  // JSON estático de almacenes
  almacen = [
    { key_almacen: "alm-001", nombre: "Almacén Central" },
    { key_almacen: "alm-002", nombre: "Almacén Norte" },
    { key_almacen: "alm-003", nombre: "Almacén Sur" },
    { key_almacen: "alm-004", nombre: "Almacén Este" },
    { key_almacen: "alm-005", nombre: "Almacén Oeste" },
  ];

  render() {
    return (
      <View>
        <Text>Filtro Almacén</Text>
        <SView style={{ width: 200, height: 24, backgroundColor: STheme.color.card }}>
          <InputSelector
            style={{ fontSize: 12 }}
            type="custom"
            customStyle="erp"
            label="Almacén:"
            placeholder="Selecciona un almacén"
            options={this.almacen.map((a) => ({
              label: a.nombre,
              value: a.key_almacen,
              data: a,
              customComponent: (e) => (
                <SText style={{ fontSize: 11, color: STheme.color.lightGray }}>
                  {e.data.nombre}
                </SText>
              ),
            }))}
            defaultValue={""} // Aquí puedes poner un valor por defecto si quieres
            onSelect={(selectedItem) => {
              console.log("Se seleccionó el almacén:", selectedItem);
              if (this.props.onSelect) this.props.onSelect(selectedItem);
            }}
          />
        </SView>
      </View>
    );
  }
}
