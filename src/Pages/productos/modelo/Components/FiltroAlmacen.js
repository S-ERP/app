import React, { Component } from "react";
import { SText, STheme, SView } from "servisofts-component";
import InputSelector from "../../../../Components/Selectores/InputSelector";
import MDL from "../../../../MDL";

export default class FiltroAlmacen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            almacenes: [],
            selectedKey: "Todos",
        };
    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        try {
            const response = await MDL.inventario.getAllAlmacen();
            const almacenes = [
                { key: "Todos", nombre: "Todos" },
                ...response.map(a => ({ key: a.key, nombre: a.descripcion }))
            ];

            this.setState({ almacenes });

            // OPCIONAL: Notificar al padre que por defecto está "Todos"
            if (this.props.onSelect) {
                this.props.onSelect({ key: null, nombre: "Todos" });
            }
        } catch (error) {
            console.error("Error al traer almacenes:", error);
        }
    }

    render() {
        const { almacenes, selectedKey } = this.state;

        return (
            <SView col={"xs-12"} height={48} style={{ paddingHorizontal: 4 }}>
                <SText
                    fontSize={9}
                    color={STheme.color.lightGray}
                    style={{ marginBottom: 3, marginLeft: 2 }}
                    bold
                >
                    ALMACÉN
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
                        placeholder="Almacén"
                        placeholderTextColor={STheme.color.lightGray}

                        // ← USAMOS value EN LUGAR DE defaultValue
                        value={selectedKey}

                        style={{
                            fontSize: 13,
                            color: STheme.color.text,
                            paddingHorizontal: 10,
                        }}
                        options={almacenes.map(a => ({
                            label: a.nombre,
                            value: a.key,
                            data: a,
                        }))}
                        onSelect={(selectedItem) => {
                            // Actualizamos el estado local
                            this.setState({ selectedKey: selectedItem.value });

                            // Notificamos al padre
                            if (this.props.onSelect) {
                                this.props.onSelect(selectedItem.data);
                            }
                        }}
                    />
                </SView>
            </SView>
        );
    }
}