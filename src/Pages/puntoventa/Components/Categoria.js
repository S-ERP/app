import React, { Component } from 'react';
import { SHr, SInput, SText, STheme, SView } from 'servisofts-component';
import { ScrollView } from 'react-native-gesture-handler';
import MDL from '../../../MDL';
import FiltroMoneda from './FiltroMoneda';
export default class Categoria extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedMoneda: MDL.compra_venta.getMonedaSeleccionada() || null,
            selectedCategory: this.props.selected || "all",
            tipomodelos: [],
        };
    }
    componentDidMount() {
        this.loadTipoProducto();
        this.eventoMoneda = () => {
            const moneda = MDL.compra_venta.getMonedaSeleccionada();
            this.setState({ selectedMoneda: moneda ? { ...moneda } : null });
        };
        MDL.compra_venta.addEventListener("moneda_seleccionada", this.eventoMoneda);
    }
    componentWillUnmount() {
        MDL.compra_venta.removeEventListener("moneda_seleccionada", this.eventoMoneda);
    }
    async loadTipoProducto() {
        const tipos = await MDL.inventario.getAllTipoProducto();
        this.setState({
            tipomodelos: [
                { key: "all", label: "Todos" },
                ...tipos.map((tipo) => ({ key: tipo.key, label: tipo.descripcion })),
            ]
        });
    }
    handlePressCategoria = (key) => {
        this.setState({ selectedCategory: key });
        this.props.onSelect?.(key);
    };
    renderCategorias() {
        const { tipomodelos, selectedCategory, selectedMoneda } = this.state;
        return (
            <SView col={"xs-12 md-12"} backgroundColor={STheme.color.darkGray} row center style={{ paddingHorizontal: 8, paddingVertical: 8 }}>
                <SView col={"xs-12"} row>
                    <ScrollView horizontal scroll={false} style={{ flex: 1 }} contentContainerStyle={{ minWidth: "100%" }}>
                        {tipomodelos.map((cat) => (
                            <SView
                                key={cat.key}
                                onPress={() => this.handlePressCategoria(cat.key)}
                                style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: 20, marginRight: 8, backgroundColor: selectedCategory === cat.key ? STheme.color.text : STheme.color.card, opacity: selectedCategory === cat.key ? 1 : 0.6, borderWidth: 1, borderColor: selectedCategory === cat.key ? STheme.color.text : STheme.color.lightGray, }} >
                                <SText fontSize={12} color={selectedCategory === cat.key ? STheme.color.background : STheme.color.text}>
                                    {cat.label}
                                </SText>
                            </SView>
                        ))}
                    </ScrollView>
                </SView>
                <SView col={"xs-12"} height={8} />
                <SView col={"xs-12"} row backgroundColor="transparent" style={{ justifyContent: "space-between" }}>
                    <SView col={"xs-12 md-12 lg-9"} row>
                        <SView col={"xs-12 md-5 lg-2.5"} row center height={32}>
                            <FiltroMoneda
                                onSelect={(moneda) => {
                                    this.setState({ selectedMoneda: moneda ? { ...moneda } : null });
                                    this.props.onSelectMoneda?.(moneda);
                                }}
                            />
                        </SView>
                        <SView width={16} />
                        <SView col={"xs-12 md-5 lg-2.5"} row center>
                            <SView col={"xs-12"} row center height={32}>
                                <SInput
                                    label={"Con Stock"}
                                    style={{ top: -12, fontSize: 12 }}
                                    type="checkBox"
                                    labelStyle={{ left: 14, top: -4 }}
                                    value={this.props.conStock}
                                    onChangeText={(text) => this.props.onChangeConStock?.(text)}
                                />
                            </SView>
                        </SView>
                        

                        <SView col={"xs-12 md-5 lg-2.5"} row center>
                            <SView col={"xs-12"} row center height={32}>
                                <SInput
                                    label={"Con Precio"}
                                    style={{ top: -12, fontSize: 12 }}
                                    type="checkBox"
                                    labelStyle={{ left: 14, top: -4 }}
                                    value={this.props.conPrecio}                  // <-- valor controlado
                                    onChangeText={(text) => this.props.onChangeConPrecio?.(text)}  // <-- actualizar Main
                                />
                            </SView>
                        </SView>

                        {/* <SView width={16} />
                        <SView col={"xs-12 md-5 lg-2.5"} row center>
                            <SView col={"xs-12"} row center height={32}>
                                {selectedMoneda ? ( <SView col="xs-12" row> <SText style={{ marginLeft: 12 }}>Observación: {selectedMoneda.observacion || "-"}</SText> </SView> ) : ( <SText>No hay moneda seleccionada</SText> )}
                            </SView>
                        </SView> */}
                    </SView>
                    <SView col={"xs-12 md-12 lg-2.5"} row center backgroundColor="transparent">
                        <SView col={"xs-12"} row center height={32} style={{ borderRadius: 8, borderWidth: 1, borderColor: STheme.color.card, backgroundColor: STheme.color.background }}>
                            <SInput placeholder="Buscar Producto" center height={30} value={this.props.value} onChangeText={this.props.onChangeText} />
                        </SView>
                    </SView>
                </SView>
            </SView>
        );
    }
    render() {
        return this.renderCategorias();
    }
}
