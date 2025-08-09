import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SButtom, SNavigation, SText, STheme, SView } from 'servisofts-component';

class alvaro extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
        <SView col={"xs-11"} backgroundColor={STheme.color.card}>

            <SText color='blue'>
                se desarrollo esto inveantrio
            </SText>

            proveedor: Proveedor,

            <SButtom
                onPress={() => {
                    proveedor
                    // SNavigation.navigate("/proveedor");
            }}
            >
                gestion de proveedor
            </SButtom>
            <SButtom
                onPress={() => {
                    SNavigation.navigate("/inventario/almacen/profile/registro_inventario");
            }}
            >
                registro_inventario
            </SButtom>

             <SButtom
                onPress={() => {
                    SNavigation.navigate("/productos/reporte_conteo_inventario");
            }}
            >
                conteo inveantrio
            </SButtom>


            <SButtom
                onPress={() => {
                    SNavigation.navigate("/productos/reporte_conteo_inventario");
            }}
            >
                Punto venta
            </SButtom>

        </SView>

    );
  }
}

export default alvaro;
