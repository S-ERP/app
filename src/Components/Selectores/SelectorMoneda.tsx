import React from "react";
import { SInput, SPage, SText } from "servisofts-component";
import MDL from "../../MDL";
type SelectorMonedaProps = {
    onChangeSelect?: (e: any) => void,
    filterData?: (e: any) => boolean,
    defaultValueTypeKey?: string,
    selectFirst?: boolean,
    findInitialSelect?: (arr: any[]) => any
} & SInput["props"]
export default class SelectorMoneda extends React.Component<SelectorMonedaProps> {
    input: SInput | null = null;
    state: {
        data: any[],
        select: any
    } = {
            data: [],
            select: null
        }
    componentDidMount(): void {
        this.loadData();
    }
    async loadData() {
        let data = await MDL.empresa.getMonedas();
        if (this.props.filterData) {
            data = data.filter(this.props.filterData)
        }
        this.state.data = data;
        if (this.props.defaultValueTypeKey) {
            const elm = data.find((elm: any) => elm.key == this.props.defaultValueTypeKey);
            this.state.select = elm;
        } else if (this.props.findInitialSelect) {
            this.state.select = this.props.findInitialSelect(data);
        } else if (this.props.selectFirst) {
            this.state.select = data[0];
        }
        if (this.input) this.input.setValue(this.toString(this.state.select));
        if (this.props.onChangeSelect) {
            this.props.onChangeSelect(this.state.select);
        }
        this.setState({
            data
        })
    }
    toString(e: any) {
        return e.descripcion
    }
    render() {
        return <SInput {...this.props}
            ref={ref => this.input = ref}
            type="select2"
            options={this.state.data.map(this.toString)}
            onChangeText={e => {
                const elm = this.state.data.find(elm => this.toString(elm) == e);
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