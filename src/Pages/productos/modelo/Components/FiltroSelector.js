import React, { Component } from "react";
import { SText, STheme, SView } from "servisofts-component";
import InputSelector from "../../../../Components/Selectores/InputSelector";

export default class FiltroSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            options: [],
            selectedKey: props.defaultValue || "Todos",
        };
    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        try {
            const data = await this.props.loadData();
            const options = [{ key: "Todos", nombre: "Todos" }, ...data.map(this.props.mapOption)];
            this.setState({ options });

            // Notifica al padre el valor por defecto
            if (this.props.onSelect) {
                const defaultOption = options.find(o => o.key === this.state.selectedKey);
                this.props.onSelect(defaultOption);
            }
        } catch (error) {
            console.error("Error al cargar opciones:", error);
        }
    }

    // reset() {
    //     const defaultKey = this.props.defaultValue || "Todos";
    //      this.state.selectedKey="Todos";
    //     this.setState({ selectedKey: defaultKey }, () => {
    //         const defaultOption = this.state.options.find(o => o.key === defaultKey) || { key: defaultKey, nombre: defaultKey };
    //         this.props.onSelect?.(defaultOption);
    //     });
    // }

    render() {
        const { label } = this.props;
        const { options, selectedKey } = this.state;
        return (
            <SView col={"xs-12"} height={48} style={{ paddingHorizontal: 4 }}>
                <SText fontSize={9} color={STheme.color.lightGray} style={{ marginBottom: 3, marginLeft: 2 }} bold>
                    {label.toUpperCase()}
                </SText>

                <SView
                    width={"100%"}
                    height={32}
                    style={{
                        backgroundColor: STheme.color.card,
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: STheme.color.lightGray + "40",
                        overflow: "hidden",
                        elevation: 1,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 1.5,
                    }}
                >
                    <InputSelector
                        type="custom"
                        customStyle="erp"
                        placeholder={label}
                        placeholderTextColor={STheme.color.lightGray}

                        value={selectedKey}
                        style={{ fontSize: 13, color: STheme.color.text, paddingHorizontal: 10 }}
                        options={options.map(o => ({ label: o.nombre, value: o.key, data: o }))}
                        onSelect={(selectedItem) => {
                            this.setState({ selectedKey: selectedItem.value });
                            this.props.onSelect?.(selectedItem.data);
                        }}
                    />
                </SView>
            </SView>
        );
    }
}
