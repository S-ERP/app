import React, { Component } from 'react';
import { SHr, SInput, SInput2, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SIconApp from '../../../Assets/SIconApp';
import { ScrollView } from 'react-native-gesture-handler';


export default class Categoria extends Component {
    constructor(props) {
        super(props);
        this.selectedCategory = this.props.selected || "all";
        this.selectedMoneda = this.props.selectedMoneda || null;
        this.tipomodelos = [];
        this.monedas = [];
    }

    componentDidMount() {
        this.loadApis();
        this.loadData();
    }

    async loadApis() {
        const tipos = await MDL.inventario.getAllTipoProducto();
        this.tipomodelos = [
            { key: "all", label: "Todos" },
            ...tipos.map((tipo) => ({
                key: tipo.key,
                label: tipo.descripcion,
            })),
        ];
        this.forceUpdate();
    }

    async loadData() {
        try {
            const data = await MDL.empresa.getFull();
            this.monedas = data.monedas || [];
            if (!this.selectedMoneda && this.monedas.length > 0) {
                this.selectedMoneda = this.monedas.find((e) => e.tipo == "base") || this.monedas[0];
                this.props.onSelectMoneda?.(this.selectedMoneda);
                MDL.compra_venta.setMonedaSeleccionada(this.selectedMoneda);
                MDL.compra_venta.dispatchEvent({ type: "moneda_seleccionada" })

            }
            this.forceUpdate();
        } catch (error) {
            console.error("Error loading monedas:", error);
        }
    }

    handlePress = (key) => {
        this.selectedCategory = key;
        this.props.onSelect?.(key);
        this.forceUpdate();
    };

    handleMonedaChange(monedaKey) {
        const selectedMoneda = this.monedas.find((moneda) => moneda.key === monedaKey) || null;
        this.selectedMoneda = selectedMoneda;
        this.props.onSelectMoneda?.(selectedMoneda);
        console.log("🎪CATEGORIA🎪. MONEDA " + JSON.stringify(this.selectedMoneda));
        MDL.compra_venta.setMonedaSeleccionada(this.selectedMoneda);
        MDL.compra_venta.dispatchEvent({ type: "moneda_seleccionada" })

        this.forceUpdate();
    }

    renderCategorias() {
        const categorias = this.tipomodelos || [];
        return (
            <SView
                col={"xs-12 md-12"}
                backgroundColor={STheme.color.darkGray}
                row
                center
                style={{ paddingHorizontal: 8, paddingVertical: 8 }}
            >
                <SView col={"xs-12"} row>
                    <ScrollView
                        horizontal
                        scroll={false}
                        style={{ flex: 1 }}
                        contentContainerStyle={{ minWidth: "100%" }}
                    >
                        {categorias.map((cat) => (
                            <SView
                                key={cat.key}
                                onPress={() => this.handlePress(cat.key)}
                                style={{
                                    paddingVertical: 4,
                                    paddingHorizontal: 8,
                                    borderRadius: 20,
                                    marginRight: 8,
                                    backgroundColor:
                                        this.selectedCategory === cat.key ? STheme.color.text : STheme.color.card,
                                    opacity: this.selectedCategory === cat.key ? null : 0.6,
                                    borderWidth: 1,
                                    borderColor:
                                        this.selectedCategory === cat.key
                                            ? STheme.color.text
                                            : STheme.color.lightGray,
                                }}
                            >
                                <SText
                                    fontSize={12}
                                    color={
                                        this.selectedCategory === cat.key
                                            ? STheme.color.background
                                            : STheme.color.text
                                    }
                                >
                                    {cat.label}
                                </SText>
                            </SView>
                        ))}
                    </ScrollView>
                </SView>

                <SView col={"xs-12"} height={8} />

                <SView col={"xs-12"} row backgroundColor='transparent' style={{ justifyContent: "space-between" }}>
                    <SView col={"xs-12 md-12 lg-9"} row   >
                        <SView col={"xs-12 md-5 lg-2.5"} row center height={32}  >
                            <SInput
                                type="select"
                                placeholder="Seleccionar Moneda"
                                value={this.selectedMoneda?.key || ""}
                                customStyle="calistenia"
                                style={{ height: 32, backgroundColor: STheme.color.card, borderRadius: 8, paddingHorizontal: 8, }}
                                options={[
                                    { key: "", content: "— Seleccionar —" },
                                    ...this.monedas.map((moneda) => ({
                                        key: moneda.key,
                                        content: `${moneda.descripcion} ${moneda.observacion ? `(${moneda.observacion})` : ""}`,
                                    })),
                                ]}
                                onChangeText={(val) => this.handleMonedaChange(val)}
                            />
                        </SView>
                        <SView width={16} />
                        <SView col={"xs-12 md-5 lg-2.5"} row center   >
                            <SView col={"xs-12 "} row center height={32}   >
                                <SInput
                                    label={"Con Stock"}
                                    style={{ top: -12, fontSize: 12 }}
                                    type="checkBox"
                                    labelStyle={{ left: 14, top: -4 }}
                                    value={this.props.conStock}
                                    onChangeText={(text) => {
                                        this.props.onChangeConStock?.(text);
                                    }}
                                />
                            </SView>
                        </SView>
                    </SView>
                    <SView col={"xs-12 md-12 lg-2.5"} row center backgroundColor='transparent' >
                        <SView col={"xs-12"} row center height={32} style={{ borderRadius: 8, borderWidth: 1, borderColor: STheme.color.card, backgroundColor: STheme.color.background }} >
                            <SInput
                                placeholder="Buscar Producto" center height={30}
                                iconR={<SIconApp name="Search" style={{ paddingRight: 8 }} width={16} height={16} fill={"#6B7280"} />}
                                style={{ fontSize: 12, backgroundColor: STheme.color.background, borderRadius: 8, }}
                                value={this.props.value} onChangeText={this.props.onChangeText}
                                onKeyPress={(e) => {
                                    if (e.nativeEvent.key === "Escape") this.props.onChangeText?.("");
                                }}
                            />
                        </SView>
                    </SView>
                    {/* <SView col={"xs-12"} height={4} /> */}
                </SView>
            </SView>
        );
    }

    render() {
        return this.renderCategorias();
    }
}