import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';



export default class TipoModelo extends Component {
    constructor(props) {
        super(props);

        // Atributos internos (sin state)

        this.selectedCategory = this.props.selected || "all";

        // this.selectedCategory = "all";
        this.tipomodelos = [];
    }


    componentDidMount() {
        this.loadApis();
    }

    async loadApis() {
        const tipos = await MDL.inventario.getAllTipoProducto();
        this.tipomodelos = [
            { key: "all", label: "Todos" },
            ...tipos.map(tipo => ({
                key: tipo.key,
                label: tipo.descripcion,
            })),
        ];
        this.forceUpdate();
    }

    handlePress = (key) => {
        this.selectedCategory = key;
        this.props.onSelect?.(key); // notifica al padre
        this.forceUpdate(); // re-render por estilo visual
    }

    renderCategorias() {
        const categorias = this.tipomodelos || [];

        return (
            <SView col={"xs-12"} style={{ padding: 20 }} backgroundColor='transparent'>
                <SView col={"xs-12"} row style={{ justifyContent: "center", marginRight: 50 }}>
                    {categorias.map(cat => (
                        <SView
                            key={cat.key}
                            center
                            onPress={() => this.handlePress(cat.key)}
                            style={{
                                paddingVertical: 8,
                                paddingHorizontal: 16,
                                borderRadius: 20,
                                marginRight: 16,
                                // marginHorizontal: 4,
                                backgroundColor: this.selectedCategory === cat.key ? STheme.color.primary : STheme.color.card,
                                borderWidth: 1,
                                borderColor: this.selectedCategory === cat.key ? STheme.color.primary : STheme.color.gray,
                            }}
                        >
                            <SText fontSize={12} color={this.selectedCategory === cat.key ? STheme.color.white : "black"}>
                                {cat.label}
                            </SText>
                        </SView>
                    ))}
                </SView>
                <SText fontSize={20} bold color={"#111827"}  >
                    {categorias.find((c) => c.key === this.selectedCategory)?.label || "Productos"}
                </SText>
            </SView>
        );
    }

    render() {
        return this.renderCategorias();
    }
}