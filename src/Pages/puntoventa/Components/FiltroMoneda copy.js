import React, { Component } from "react";
import { SView, STheme } from "servisofts-component";
import InputSelector from "../../../Components/Selectores/InputSelector";
import MDL from "../../../MDL";
export default class FiltroMoneda extends Component {
    state = {
        selectedMoneda: MDL.compra_venta.getMonedaSeleccionada() || null,
        options: MDL.empresa.monedas || [],
    };
    componentDidMount() {
        this.mounted = true;
        this.evento = () => {
            const moneda = MDL.compra_venta.getMonedaSeleccionada();
            if (!moneda) return;
            if (!this.state.selectedMoneda || this.state.selectedMoneda.key !== moneda.key) {
                this.setState({ selectedMoneda: moneda });
                this.props.onSelect?.(moneda);
                if (this.rapido) {
                    this.rapido.setValue(moneda.key);
                }
            }
        };
        MDL.compra_venta.addEventListener("moneda_seleccionada", this.evento);
        if (!this.state.options.length) {
            this.cargar();
        } else {
            this.validarMonedaSeleccionada(this.state.options);
        }
    }
    componentWillUnmount() {
        MDL.compra_venta.removeEventListener("moneda_seleccionada", this.evento);
        this.mounted = false;
    }
    // La moneda seleccionada es un singleton global (MDL.compra_venta) que puede quedar
    // desactualizada respecto a las monedas de la empresa actual (ej. al cambiar de empresa).
    // Si ya no existe en la lista, se cae al valor base para no mostrar su key cruda en el input.
    resolverMonedaSeleccionada(monedas) {
        let monedaSeleccionada = MDL.compra_venta.getMonedaSeleccionada();
        const existeEnLista = monedaSeleccionada && monedas.some(m => m.key === monedaSeleccionada.key);
        if (!existeEnLista) {
            monedaSeleccionada = monedas.find(m => m.tipo === "base") || monedas[0];
            MDL.compra_venta.setMonedaSeleccionada(monedaSeleccionada);
            MDL.compra_venta.dispatchEvent({ type: "moneda_seleccionada" });
        }
        return monedaSeleccionada;
    }
    validarMonedaSeleccionada(monedas) {
        const monedaSeleccionada = this.resolverMonedaSeleccionada(monedas);
        this.setState({ selectedMoneda: monedaSeleccionada });
        this.props.onSelect?.(monedaSeleccionada);
    }
    async cargar() {
        try {
            const monedas = await MDL.empresa.getMonedas();
            if (!Array.isArray(monedas)) return;
            MDL.empresa.monedas = monedas;
            if (!this.mounted) return;
            const monedaSeleccionada = this.resolverMonedaSeleccionada(monedas);
            this.setState({ options: monedas, selectedMoneda: monedaSeleccionada });
            this.props.onSelect?.(monedaSeleccionada);
        } catch (error) {
            console.error("Error cargando monedas:", error);
        }
    }
    selectMoneda = (key) => {
        const moneda = this.state.options.find(m => m.key === key);
        if (!moneda) return;
        MDL.compra_venta.setMonedaSeleccionada(moneda);
        MDL.compra_venta.dispatchEvent({ type: "moneda_seleccionada" });
    }
    render() {
        const { selectedMoneda, options } = this.state;
        return (
            <SView col="xs-12" center row height={32}>
                {options.length > 0 && (
                    <InputSelector
                        type="custom"
                        ref={(ref) => (this.rapido = ref)}
                        customStyle="erp"
                        placeholder="Seleccione moneda"
                        placeholderTextColor={STheme.color.lightGray}
                        value={selectedMoneda?.key}
                        style={{ height: 32, backgroundColor: STheme.color.card, borderRadius: 4, paddingHorizontal: 8 }}
                        options={options.map((o) => ({ label: o.descripcion, value: o.key, data: o }))}
                        onSelect={(item) => this.selectMoneda(item.value)}
                    />
                )}
            </SView>
        );
    }
}
