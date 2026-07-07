import React, { Component } from "react";
import { SText, STheme, SView } from "servisofts-component";
import InputSelector from "../../../../Components/Selectores/InputSelector";

const ESTADOS_CAJA = [
    { key: "Todos", nombre: "Todos" },
    { key: "abierta", nombre: "Abierta" },
    { key: "cerrada", nombre: "Cerrada" },
];

export default class FiltroCaja extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedEstadoKey: "abierta",
        };
    }

    componentDidMount() {
        // Por defecto se filtra por cajas abiertas
        if (this.props.onSelectEstado) {
            this.props.onSelectEstado({ key: "abierta", nombre: "Abierta" });
        }
    }

    render() {
        const { selectedEstadoKey } = this.state;

        return (
            <SView col={"xs-12 sm-6"} height={48} style={{ paddingHorizontal: 4 }}>
                <SText
                    fontSize={9}
                    color={STheme.color.lightGray}
                    style={{ marginBottom: 3, marginLeft: 2 }}
                    bold
                >
                    ESTADO DE CAJA
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
                        placeholder="Estado de Caja"
                        placeholderTextColor={STheme.color.lightGray}
                        value={selectedEstadoKey}
                        style={{
                            fontSize: 13,
                            color: STheme.color.text,
                            paddingHorizontal: 10,
                        }}
                        options={ESTADOS_CAJA.map(a => ({
                            label: a.nombre,
                            value: a.key,
                            data: a,
                        }))}
                        onSelect={(selectedItem) => {
                            this.setState({ selectedEstadoKey: selectedItem.value });

                            if (this.props.onSelectEstado) {
                                this.props.onSelectEstado(selectedItem.value === "Todos" ? { key: null, nombre: "Todos" } : selectedItem.data);
                            }
                        }}
                    />
                </SView>
            </SView>
        );
    }
}
