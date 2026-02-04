import React, { Component, createRef } from "react";
import { SText, STheme, SView } from "servisofts-component";
import InputSelector from "../../../../Components/Selectores/InputSelector";

export default class FiltroSelector extends Component {
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
            this.setState({ options }, () => {
                if (this.props.onSelect) {
                    const defaultOption = options.find(o => o.key === this.state.selectedKey) || options[0];
                    this.setState({ selectedKey: defaultOption.key }, () => {
                        this.props.onSelect(defaultOption);
                    });

                    // const defaultOption = options.find(o => o.key === this.state.selectedKey) || options[0];
                    // this.props.onSelect(defaultOption);
                }
            });
        } catch (error) {
            console.error("Error al cargar opciones:", error);
        }
    }

    reset() {
        const defaultOption = { key: null, nombre: "Todos" }; // opción por defecto
        this.setState({ selectedKey: defaultOption.key }, () => {
            // actualiza InputSelector
            if (this.selectorRef.current) {
                this.selectorRef.current.setValue(defaultOption.key);
            }
            // notifica al padre
            this.props.onSelect?.(defaultOption);
        });
    }

    render() {
        const { label } = this.props;
        const { options, selectedKey } = this.state;

        return (
            <SView col={"xs-12"} height={48} backgroundColor="transparent" style={{ paddingHorizontal: 2, top: 5 }}>
                <SText fontSize={9} color={STheme.color.lightGray} style={{ marginBottom: 2, marginLeft: 2 }} bold>
                    {label.toUpperCase()}
                </SText>

                <SView
                    width={"100%"}
                    height={38}

                    style={{
                        backgroundColor: STheme.color.card,
                        borderRadius: 2,
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
                        ref={this.selectorRef}
                        type="custom"
                        customStyle="erp"
                        placeholder={"Selecciona " + label}
                        placeholderTextColor={STheme.color.danger}
                        // value={selectedKey} // controlado
                        style={{
                            fontSize: 13, color: STheme.color.text, paddingHorizontal: 10, backgroundColor: STheme.color.card,
                            opacity: 0.6,

                        }}
                        options={options.map(o => ({
                            label: o.nombre,
                            value: o.key,
                            data: o
                        }))}
                        onSelect={(selectedItem) => {
                            // solo actualizar si existe
                            if (selectedItem?.data) {
                                this.setState({ selectedKey: selectedItem.value });
                                this.props.onSelect?.(selectedItem.data);
                            }
                        }}
                    />
                </SView>
            </SView>
        );
    }
}
