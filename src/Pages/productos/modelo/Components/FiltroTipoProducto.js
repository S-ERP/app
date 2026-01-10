import React, { Component } from "react";
import { SText, STheme, SView } from "servisofts-component";
import InputSelector from "../../../../Components/Selectores/InputSelector";
import MDL from "../../../../MDL";

export default class FiltroTipoProducto extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tipo_cuentas: [],
            selectedKey: "Todos",
        };
    }

    componentDidMount() {
        this.loadData();
    }

    // Método para resetear el filtro
    reset() {
        this.setState({ selectedKey: "Todos" }, () => {
            if (this.props.onSelect) {
                this.props.onSelect({ key: "Todos", nombre: "Todos" });
            }
        });
    }
    // const tipos = await MDL.inventario.getAllTipoProducto()

    async loadData() {
        try {

            const response = await MDL.inventario.getAllTipoProducto()
            // console.log()
            console.clear();
            console.log("%c" + JSON.stringify(response, null, 2), "color: #f53403ff; font-weight: bold;");
            // const response = MDL.inventario.TIPOS_DE_PRODUCTOS;
            const tipo_cuentas = [
                { key: "Todos", nombre: "Todos" },
                ...response.map(a => ({ key: a.descripcion, nombre: a.descripcion }))
            ];
            this.setState({ tipo_cuentas });

            // Notificar al padre que por defecto está "Todos"
            if (this.props.onSelect) {
                this.props.onSelect({ key: "Todos", nombre: "Todos" });
            }
        } catch (error) {
            console.error("Error al traer TIPOS_DE_PRODUCTOS:", error);
        }
    }

    render() {
        const { tipo_cuentas, selectedKey } = this.state;
        return (
            <SView col={"xs-12"} height={48} style={{ paddingHorizontal: 4 }}>
                <SText fontSize={9} color={STheme.color.lightGray} style={{ marginBottom: 3, marginLeft: 2 }} bold > TIPO PRODUCTO </SText>
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
                        placeholder="Tipo Producto"
                        placeholderTextColor={STheme.color.lightGray}
                        value={selectedKey}
                        style={{ fontSize: 13, color: STheme.color.text, paddingHorizontal: 10 }}
                        options={tipo_cuentas.map(a => ({
                            label: a.nombre,
                            value: a.key,
                            data: a,
                        }))}
                        onSelect={(selectedItem) => {
                            this.setState({ selectedKey: selectedItem.value });
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
