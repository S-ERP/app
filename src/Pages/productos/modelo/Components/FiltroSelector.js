import React, { Component, createRef } from "react";
import { SText, STheme, SView } from "servisofts-component";
import InputSelector from "../../../../Components/Selectores/InputSelector";

export default class FiltroSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            options: [],
            // defaultOption: 'todos', '', o undefined
            selectedKey: props.defaultOption !== undefined ? props.defaultOption : "todos",
        };
        this.selectorRef = createRef();
    }

    componentDidMount() {
        this.loadData();
    }
// alvaro
    async loadData() {
        try {
            const data = await this.props.loadData();
            const firstOption = this.props.defaultOption === ""
                ? { key: "", nombre: "Seleccionar" }
                : { key: "todos", nombre: "Todos" };
            const options = [firstOption, ...data.map(this.props.mapOption)];
            this.setState({ options }, () => {
                const previousKey = this.state.selectedKey;
                const found = options.find(o => o.key === previousKey);
                // Si ya traía un código propio (ej. al duplicar/editar una factura) pero no aparece
                // en el catálogo recién cargado (puede diferir entre ambientes Producción/Prueba),
                // conservamos el código original visible en vez de resetear a "Todos".
                const keepOriginal = !found && !!previousKey && previousKey !== "todos" && previousKey !== "";
                const resolvedKey = found ? found.key : (keepOriginal ? previousKey : (this.props.defaultOption === "" ? "" : "todos"));
                const payload = resolvedKey === "todos" ? { key: null, nombre: "Todos" } : (resolvedKey === "" ? { key: "", nombre: "Seleccionar" } : found);
                this.setState({ selectedKey: resolvedKey }, () => {
                    // Asegurar que el input muestre el valor por defecto correcto
                    this.selectorRef.current?.setValue(resolvedKey);
                    // skipInitialOnSelect: usado por filas ya cargadas con datos (ej. duplicar factura)
                    // para no sobrescribir el valor existente con el default al montar.
                    if (this.props.onSelect && !this.props.skipInitialOnSelect && !keepOriginal) {
                        console.log("🔷 FiltroSelector.loadData - Llamando onSelect con:", payload);
                        this.props.onSelect(payload);
                    }
                });
            });
        } catch (error) {
            console.error("Error al cargar opciones:", error);
        }
    }

    // reset() {
    //     const defaultOption = { key: null, nombre: "Todos" }; // opción por defecto
    //     this.setState({ selectedKey: defaultOption.key }, () => {
    //         if (this.selectorRef.current) {
    //             this.selectorRef.current.setValue(defaultOption.key);
    //         }
    //         this.props.onSelect?.(defaultOption);
    //     });
    // }

    // notifica al padre
    reset(notify = false) {
        const defaultOption = { key: "todos", nombre: "Todos" };
        this.setState({ selectedKey: defaultOption.key }, () => {
            if (this.selectorRef.current) {
                this.selectorRef.current.setValue(defaultOption.key);
            }
            // 🔹 Solo notifica si explícitamente lo piden
            if (notify) {
                this.props.onSelect?.({ key: null, nombre: "Todos" });
            }
        });
    }


    render() {
        const { label } = this.props;
        const { options, selectedKey } = this.state;

        return (
            <SView col={"xs-12"}   style={{ paddingHorizontal: 2 }}>
                <SText fontSize={9} color={STheme.color.lightGray} style={{}} bold>
                    {label.toUpperCase()}
                </SText>

                <SView
                    width={"100%"}
                    height={30}

                    style={{
                        backgroundColor: STheme.color.card,
                        borderRadius: 2,
                        borderWidth: this.props.error ? 2 : 1,
                        borderColor: this.props.error ? STheme.color.danger : STheme.color.lightGray + "40",
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
                        defaultValue={selectedKey}
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
                            console.log("📍 FiltroSelector.onSelect fired:", selectedItem?.data);
                            if (!selectedItem) return;
                            const isTodos = selectedItem.value === "todos";
                            const payload = isTodos ? { key: null, nombre: "Todos" } : selectedItem.data;
                            this.setState({ selectedKey: selectedItem.value }, () => {
                                this.props.onSelect?.(payload);
                            });
                        }}
                    />
                </SView>
            </SView>
        );
    }
}
