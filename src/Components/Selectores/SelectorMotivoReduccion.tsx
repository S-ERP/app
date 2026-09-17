import React from "react";
import { SInput, SPage, SText } from "servisofts-component";
import MDL from "../../MDL";
type SelectorMotivoReduccionProps = {
    onChangeSelect?: (e: any) => void,
    filterData?: (e: any) => boolean,
    defaultValueTypeKey?: string,
    selectFirst: boolean
} & SInput["props"]
export default class SelectorMotivoReduccion extends React.Component<SelectorMotivoReduccionProps> {
    input: SInput | null = null;
    state: {
        motivos: any[],
        select: any
    } = {
            motivos: [],
            select: null
        }
    componentDidMount(): void {
        this.loadData();
    }
    async loadData() {
        // let motivos = await MDL.inventario.getAllAlmacen();
        let motivos = ["Seleccionar motivo","Caducidad", "Deterioro", "Robo", "Devolución", "Consumo interno", "Otros"].map((descripcion, index) => {
            return {
                key: index,
                descripcion
            }
        })
        // let motivos = ["Caducidad", "Deterioro", "Robo", "Devolución", "Otros"]
        if (this.props.filterData) {
            motivos = motivos.filter(this.props.filterData)
        }
        this.state.motivos = motivos;
        if (this.props.defaultValueTypeKey) {
            const elm = motivos.find((elm: any) => elm.key == this.props.defaultValueTypeKey);
            if (elm) {
                this.state.select = elm;
                if (this.input) this.input.setValue(this.toString(elm));
                if (this.props.onChangeSelect) {
                    this.props.onChangeSelect(elm);
                }
            }
        } else if (this.props.selectFirst && motivos[0]) {
            this.state.select = motivos[0];
            if (this.input) this.input.setValue(this.toString(this.state.select));
            if (this.props.onChangeSelect) {
                this.props.onChangeSelect(motivos[0]);
            }
        }
        this.setState({
            motivos
        })
    }
    toString(e: any) {
        return e ? e.descripcion : ""
    }
    render() {
        return <SInput {...this.props}
            ref={ref => this.input = ref}
            type="select2"
            options={this.state.motivos.map(this.toString)}
            onChangeText={e => {
                const elm = this.state.motivos.find(elm => this.toString(elm) == e);
                if (this.props.onChangeSelect && this.state.select != elm) {
                    this.props.onChangeSelect(elm);
                }
                this.state.select = elm;
                if (this.props.onChangeText) {
                    this.props.onChangeText(e);
                }
            }}
        />
    }
}