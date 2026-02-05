import React from "react";
import { SInput, SText } from "servisofts-component";
import MDL from "../../MDL";
type SelectorTipoPagoProps = {
    onChangeSelect?: (e: any) => void,
    filterData?: (e: any) => boolean,
    defaultValueTypeKey?: string,
    selectFirst?: boolean
} & SInput["props"];
export default class SelectorTipoPago extends React.Component<SelectorTipoPagoProps> {
    input: SInput | null = null;
    state = {
        clientes: [] as any[],
        select: null as any
    };
    componentDidMount() {
        this.loadData();
    }
    setSelect(elm: any) {
        this.state.select = elm;
        if (this.input) this.input.setValue(this.toString(elm));
        if (this.props.onChangeSelect) {
            // this.props.onChangeSelect(elm);
        }
    }
    async loadData() {
        try {
            let tp = await MDL.empresa.getTipoPago();
            // Si viene como objeto, lo convertimos en array
            
        } catch (e) {
            console.error("Error cargando clientes:", e);
        }
    }
    toString(e: any) {
        // Intenta distintas propiedades comunes
        return  e?.nombres ?? e?.razon_social ?? e?.descripcion ?? "Sin nombre";
    }
    render() {
        const { clientes } = this.state;
        const opciones = clientes.length > 0
            ? clientes.map(c => this.toString(c))
            : ["Cargando clientes..."];
        return (
            <SInput
                {...this.props}
                ref={ref => this.input = ref}
                type="select2"
                options={opciones}
                onChangeText={e => {
                    const elm = clientes.find(elm => this.toString(elm) === e);
                    if (this.props.onChangeSelect && this.state.select !== elm) {
                        this.props.onChangeSelect(elm);
                    }
                    this.state.select = elm;
                    if (this.props.onChangeText) {
                        this.props.onChangeText(e);
                    }
                }}
            />
        );
    }
}
