import React from "react";
import { SInput, SPage, SText } from "servisofts-component";
import MDL from "../../MDL";
type SelectorAlmacenProps = {
    onChangeSelect?: (e: any) => void,
    filterData?: (e: any) => boolean,
    defaultValueTypeKey?: string,
    selectFirst: boolean
} & SInput["props"]
export default class SelectorAlmacen extends React.Component<SelectorAlmacenProps> {
    input: SInput | null = null;
    state: {
        almacenes: any[],
        select: any
    } = {
            almacenes: [],
            select: null
        }
    componentDidMount(): void {
        this.loadData();
    }
    async loadData() {
        let almacenes = await MDL.inventario.getAllAlmacen();
        if (this.props.filterData) {
            almacenes = almacenes.filter(this.props.filterData)
        }
        this.state.almacenes = almacenes;
        if (this.props.defaultValueTypeKey) {
            const elm = almacenes.find((elm: any) => elm.key == this.props.defaultValueTypeKey);
            if (elm) {
                this.state.select = elm;
                if (this.input) this.input.setValue(this.toString(elm));
                if (this.props.onChangeSelect) {
                    this.props.onChangeSelect(elm);
                }
            }
        } else if (this.props.selectFirst && almacenes[0]) {
            this.state.select = almacenes[0];
            if (this.input) this.input.setValue(this.toString(this.state.select));
            if (this.props.onChangeSelect) {
                this.props.onChangeSelect(almacenes[0]);
            }
        }
        this.setState({
            almacenes
        })
    }
    toString(e: any) {
        return e ? e.descripcion : ""
    }
    render() {
        return <SInput {...this.props}
            ref={ref => this.input = ref}
            type="select2"
            options={this.state.almacenes.map(this.toString)}
            onChangeText={e => {
                const elm = this.state.almacenes.find(elm => this.toString(elm) == e);
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