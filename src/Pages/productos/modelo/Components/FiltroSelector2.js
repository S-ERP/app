import React, { Component, createRef } from "react";
import { SText, STheme, SView } from "servisofts-component";
import InputSelector from "../../../../Components/Selectores/InputSelector";
export default class FiltroSelector2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            options: [],
            selectedKey: props.defaultValue ?? "Todos",
        };
        this.selectorRef = createRef();
    }
    componentDidMount() {
        this.loadData();
    }
    async loadData() {
        try {
            const data = await this.props.loadData();
            const options = [{ key: null, nombre: "Todos" }, ...data.map(this.props.mapOption)];
            const defaultOption =
                options.find(o => o.key === this.state.selectedKey) || options[0];
            this.setState({
                options,
                selectedKey: defaultOption.key
            });
            this.props.onSelect?.(defaultOption);
        } catch (error) {
            console.error("Error al cargar opciones:", error);
        }
    }
    // async loadData() {
    //     try {
    //         const data = await this.props.loadData();
    //         const options = [{ key: null, nombre: "Todos" }, ...data.map(this.props.mapOption)];
    //         this.setState({ options }, () => {
    //             if (this.props.onSelect) {
    //                 const defaultOption = options.find(o => o.key === this.state.selectedKey) || options[0];
    //                 this.setState({ selectedKey: defaultOption.key }, () => {
    //                     this.props.onSelect(defaultOption);
    //                 });
    //             }
    //         });
    //     } catch (error) {
    //         console.error("Error al cargar opciones:", error);
    //     }
    // }
    reset(notify = false) {
        const defaultOption = { key: null, nombre: "Todos" };
        this.setState({ selectedKey: defaultOption.key }, () => {
            if (this.selectorRef.current) {
                this.selectorRef.current.setValue(defaultOption.key);
            }
            if (notify) {
                this.props.onSelect?.(defaultOption);
            }
        });
    }
    render() {
        const { label } = this.props;
        const { options, selectedKey } = this.state;
        return (
            <SView col={"xs-12"}  >
                <SView
                    width={"100%"}
                    height={30}
                    style={{
                        backgroundColor: STheme.color.card,
                        borderRadius: 2,
                        borderWidth: 1,
                        borderColor: STheme.color.lightGray + "40",
                        overflow: "hidden"
                    }}
                >
                    <InputSelector
                        ref={this.selectorRef}
                        type="custom"
                        customStyle="erp"
                        placeholder={"Selecciona " + label}
                        placeholderTextColor={"red"}
                        style={{
                            fontSize: 11, color: STheme.color.text, paddingHorizontal: 10, backgroundColor: STheme.color.card,
                            opacity: 1,    
                        }}
                        options={options.map(o => ({
                            label: o.nombre,
                            value: o.key,
                            data: o
                        }))}
                        onSelect={(selectedItem) => {
                            if (selectedItem?.data) {
                                this.setState({ selectedKey: selectedItem.value });
                                this.props.onSelect?.(selectedItem.data);
                            }
                        }}
                    />
                </SView>
                <SView style={{ position: "absolute", top: -8, left: 4, paddingHorizontal: 4, paddingVertical: 2, backgroundColor: STheme.color.darkGray, borderRadius: 2 }}>
                    <SText fontSize={7} color={STheme.color.lightGray} style={{}} bold>
                        {label.toUpperCase()}
                    </SText>
                </SView>
            </SView>
        );
    }
}