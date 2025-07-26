import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SInput, SScrollView2, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SIconApp from '../../../Assets/SIconApp';



export default class Categoria extends Component {
    constructor(props) {
        super(props);
        this.selectedCategory = this.props.selected || "all";
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
            // <SView col={"xs-12"}   >
                <SView col={"xs-12 md-12"} row center >
                    <SView col={"xs-12 md-12 lg-9"} row style={{ padding: 14 }}>

                        {categorias.map(cat => (
                            // <SScrollView2>

                            <SView key={cat.key} onPress={() => this.handlePress(cat.key)}
                                style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    borderRadius: 20,
                                    marginRight: 8,
                                    backgroundColor: this.selectedCategory === cat.key ? STheme.color.text : STheme.color.card,
                                    opacity: this.selectedCategory === cat.key ? null : 0.6,
                                    borderWidth: 1,
                                    borderColor: this.selectedCategory === cat.key ? STheme.color.text : STheme.color.lightGray,
                                }} >
                                <SText fontSize={12} color={this.selectedCategory === cat.key ? STheme.color.primary : STheme.color.text}> {cat.label} </SText>
                            </SView>
                            // </SScrollView2>
                        ))}


                    </SView>



                    <SView col={"xs-12 md-12 lg-3"} center backgroundColor='transparent' style={{ padding: 14 }}>
                        <SView col={"xs-12  "} row center style={{ borderRadius: 8, borderWidth: 1, borderColor: STheme.color.card, paddingHorizontal: 12 }}>
                            <SInput placeholder="Buscar Producto" center style={{ flex: 1, fontSize: 14, backgroundColor: "transparent" }}
                                value={this.props.value}
                                onChangeText={this.props.onChangeText}
                                onKeyPress={(e) => { if (e.nativeEvent.key === "Escape") this.props.onChangeText?.(""); }} />
                            <SIconApp name="Search" width={16} height={16} fill={"#6B7280"} />
                        </SView>
                    </SView>
                </SView>

            // </SView>
        );
    }

    render() {
        return this.renderCategorias();
    }
}