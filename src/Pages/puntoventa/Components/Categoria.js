import React, { Component } from 'react';
import { SHr, SInput, SInput2, SText, STheme, SView } from 'servisofts-component';
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
        this.selectedMoneda = this.props.selectedMoneda || null; // Initialize selected currency
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


    async loadData() {
        try {
            const data = await MDL.empresa.getFull();
            this.monedas = data.monedas || []; // Fallback to empty array if undefined
            // Set default moneda if none selected and monedas exist
            if (!this.selectedMoneda && this.monedas.length > 0) {
                this.selectedMoneda = this.monedas[0]; // Default to first currency
                this.props.onSelectMoneda?.(this.selectedMoneda);
            }
            this.forceUpdate();
        } catch (error) {
            console.error('Error loading monedas:', error);
        }
    }


    // async loadData() {
    //     const data = await MDL.empresa.getFull()
    //     data.monedas.map((moneda) => {
    //         console.log("money " + JSON.stringify(moneda.observacion));
    //         this.monedas = moneda;
    //     })
    //     console.log("money " + JSON.stringify(this.monedas.observacion));
    // }

    handleMonedaChange(monedaKey) {
        const selectedMoneda = this.monedas.find(moneda => moneda.key === monedaKey) || null;
        this.selectedMoneda = selectedMoneda;
        this.props.onSelectMoneda?.(selectedMoneda);

        console.log("selectedMoneda.................... " + JSON.stringify(this.selectedMoneda));

        this.forceUpdate();
    }
    renderCategorias() {
        const categorias = this.tipomodelos || [];
        // const categoriasMoney = this.monedas || [];
        return (
            <SView col={"xs-12 md-12"} backgroundColor={STheme.color.darkGray} row center style={{ paddingHorizontal: 8, paddingVertical: 5 }} >
                <SView col={"xs-12 md-12 lg-8.8"} row  >
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

                {/* <SView col={"xs-12 md-12 lg-0.2"} height={14} /> */}
                <SView flex height={14} />
                {/* Currency Dropdown */}
                <SView col={'xs-12 md-12 lg-8.8'} row>
                    <SInput
                        type="select"
                        placeholder="Seleccionar Moneda"
                        value={this.selectedMoneda?.key || ''}
                        customStyle="calistenia"
                        style={{
                            width: 200,
                            height: 40,
                            backgroundColor: STheme.color.card,
                            borderRadius: 8,
                            paddingHorizontal: 8,
                        }}

                        //  options={[{ key: "none", content: "-" }, ...columnasDetectadas.map(col => ({ key: col, content: col }))]}
                        //         onChangeText={(val) => tempMapeo[campo] = val}
                        //         style={{ textAlign: "center" }}

                        options={[
                            { key: "", content: "— Seleccionar —" },
                            ...this.monedas.map(moneda => ({
                                key: moneda.key,
                                content: `${moneda.descripcion} ${moneda.observacion ? `(${moneda.observacion})` : ""}`,
                            })),
                        ]}
                        onChangeText={(val) => this.handleMonedaChange(val)}
                    />
                </SView>

                <SView flex height={14} />


                <SView col={"xs-12 md-12 lg-3"} center   >
                    <SView col={"xs-12  "} row center style={{ borderRadius: 8, borderWidth: 1, borderColor: STheme.color.card, paddingHorizontal: 12, backgroundColor: STheme.color.background }}>
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