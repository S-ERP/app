import React, { Component } from "react";
import { View } from "react-native";
import { STheme, SView, SText } from "servisofts-component";
import InputSelector from "../../../../Components/Selectores/InputSelector";

export default class FiltroStock extends Component {

    stockOptions = [
        { key: "todos", nombre: "Todos" },
        { key: "con_stock", nombre: "Con stock" },
        { key: "sin_stock", nombre: "Sin stock" },
    ];


 render() {
    return (
        <SView col={"xs-12"} height={48} style={{ paddingHorizontal: 4 }}>
            <SText fontSize={9} color={STheme.color.lightGray} style={{ marginBottom: 3, marginLeft: 2 }} bold > ESTADO DE STOCK </SText>

            <SView
                width={"100%"}
                height={32}
                style={{
                    backgroundColor: STheme.color.card,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: STheme.color.lightGray + "40",
                    overflow: "hidden",
                    elevation: 1,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 1.5,
                }}
            >
                <InputSelector
                    type="custom"
                    customStyle="erp"
                    placeholder="Estado"
                    placeholderTextColor={STheme.color.lightGray}
                    defaultValue="todos"
                    style={{
                        fontSize: 13,
                        color: STheme.color.text,
                        paddingHorizontal: 10,
                    }}
                    options={this.stockOptions.map(item => ({
                        label: item.nombre,
                        value: item.key,
                        data: item,
                    }))}
                    onSelect={(selectedItem) => {
                        if (this.props.onSelect) {
                            this.props.onSelect(selectedItem.data);
                        }
                    }}
                />
            </SView>
        </SView>
    );
}

    // render() {
    //     return (
    //         <View>
    //             <SView style={{ width: 200, height: 24, backgroundColor: STheme.color.card }}>
    //                 <InputSelector
    //                     style={{ fontSize: 12 }}
    //                     type="custom"
    //                     customStyle="erp"
    //                     label="Stock:"
    //                     placeholder="Selecciona un stock"
    //                     defaultValue="todos"
    //                     options={this.stockOptions.map(item => ({
    //                         label: item.nombre,
    //                         value: item.key,
    //                         data: item,
    //                         customComponent: (e) => (
    //                             <SText style={{ fontSize: 11, color: STheme.color.lightGray }}>
    //                                 {e.data.nombre}
    //                             </SText>
    //                         ),
    //                     }))}
    //                     onSelect={(selectedItem) => {
    //                         const stock = selectedItem.data; // 🔥 ESTE ERA EL DETALLE
    //                         console.log("Stock seleccionado:", stock);

    //                         if (this.props.onSelect) {
    //                             this.props.onSelect(stock);
    //                         }
    //                     }}
    //                 />
    //             </SView>
    //         </View>
    //     );
    // }
}
