import React from "react";
import { SInput, SText } from "servisofts-component";
import MDL from "../../MDL";

type SelectorClienteProps = {
    onChangeSelect?: (e: any) => void,
    filterData?: (e: any) => boolean,
    defaultValueTypeKey?: string,
    selectFirst?: boolean
} & SInput["props"];

export default class SelectorCliente extends React.Component<SelectorClienteProps> {
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
            let clientes = await MDL.crm.cliente.getAll();
            console.log("🔍 CLIENTES:", clientes);

            // Si viene como objeto, lo convertimos en array
            if (clientes && !Array.isArray(clientes)) {
                clientes = Object.values(clientes);
            }
            if (!clientes) clientes = [];

            // Filtrar nulos y aplicar filtro personalizado
            clientes = clientes.filter((c: any) => !!c);
            if (this.props.filterData) {
                clientes = clientes.filter(this.props.filterData);
            }

            // Selección por defecto
            let select = null;
            if (this.props.defaultValueTypeKey) {
                select = clientes.find(c => c.key === this.props.defaultValueTypeKey);
            } else if (this.props.selectFirst && clientes.length > 0) {
                select = clientes[0];
            }

            this.setState({ clientes, select }, () => {
                if (this.input && select) {
                    this.input.setValue(this.toString(select));
                }
                if (select && this.props.onChangeSelect) {
                    this.props.onChangeSelect(select);
                }
            });
        } catch (e) {
            console.error("Error cargando clientes:", e);
        }
    }

    toString(e: any) {
        // Intenta distintas propiedades comunes
        return e?.razon_social ?? e?.nombres ?? e?.descripcion ?? "Sin nombre";
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
