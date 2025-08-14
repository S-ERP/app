import React, { Component } from 'react';
import { SHr, SInput, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SIconApp from '../../../Assets/SIconApp';
import { ScrollView } from 'react-native-gesture-handler';
const categoriasEjemplo = [
    { key: "frutas", descripcion: "Frutas" },
    { key: "verduras", descripcion: "Verduras" },
    { key: "lacteos", descripcion: "Lácteos" },
    { key: "bebidas", descripcion: "Bebidas" },
    { key: "panaderia", descripcion: "Panadería" },
    { key: "carnes", descripcion: "Carnes" },
    { key: "pescados", descripcion: "Pescados" },
    { key: "snacks", descripcion: "Snacks" },
    { key: "congelados", descripcion: "Congelados" },
    { key: "limpieza", descripcion: "Limpieza" },
    { key: "higiene", descripcion: "Higiene Personal" },
    { key: "bebes", descripcion: "Productos para Bebés" },
    { key: "electrodomesticos", descripcion: "Electrodomésticos" },
    { key: "ropa", descripcion: "Ropa" },
    { key: "papeleria", descripcion: "Papelería" },
];
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
        this.props.onSelect?.(key);
        this.forceUpdate();
    }
    renderCategorias() {
        const categorias = this.tipomodelos || [];
        return (
            <SView col={"xs-12 md-12"} backgroundColor={STheme.color.darkGray} row center style={{ paddingHorizontal: 8, paddingVertical: 5 }} >
                <SView col={"xs-12 md-12 lg-8.8"} backgroundColor='transparent' row  >
                    <ScrollView horizontal scroll={true} style={{ flex: 1, }} contentContainerStyle={{ minWidth: "100%" }}  >
                        {categorias.map(cat => (
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
                        ))}
                    </ScrollView>
                </SView>
                <SView col={"xs-12 md-12 lg-0.2"} height={14} />
                <SView col={"xs-12 md-12 lg-3"} center backgroundColor='transparent'  >
                    <SView col={"xs-12  "} row center style={{ borderRadius: 8, borderWidth: 1, borderColor: STheme.color.card, paddingHorizontal: 12 ,backgroundColor: STheme.color.background}}>
                        <SInput placeholder="Buscar Producto" center style={{ flex: 1, fontSize: 14, backgroundColor: STheme.color.background }}
                            value={this.props.value}
                            onChangeText={this.props.onChangeText}
                            onKeyPress={(e) => { if (e.nativeEvent.key === "Escape") this.props.onChangeText?.(""); }} />
                        <SIconApp name="Search" width={16} height={16} fill={"#6B7280"} />
                    </SView>
                </SView>
            </SView>
        );
    }
    render() {
        return this.renderCategorias();
    }
}