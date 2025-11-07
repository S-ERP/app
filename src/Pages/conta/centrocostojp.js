import React from "react";
import {
    SHr, SInput, SNavigation, SPage, SText, STheme, SView
} from "servisofts-component";
import MDL from "../../MDL";
import FloatMenu from "../../Components/FloatMenu";
import SIconApp from "../../Assets/SIconApp";

export default class centro_costo extends React.Component {

    onSelect = SNavigation.getParam("onSelect");
    centro_costo_tipo = [];
    _ref = {};

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        this.centro_costo_tipo = await MDL.contabilidad.centro_costo_tipo.getAll();
        this.centro_costo = await MDL.contabilidad.centro_costo.getAll();
        this.centro_costo_tipo.map(cct => {
            cct.centros = this.centro_costo.filter(a => a.key_centro_costo_tipo == cct.key);
        });
        this.forceUpdate();
    }

    renderTipo(tipo) {
        return (
            <SView
                key={tipo.key}
                style={{
                    backgroundColor: STheme.color.card,
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 12,
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2
                }}
            >
                {/* Header tipo */}
                <SView row center style={{ justifyContent: "space-between" }}>
                    <SText bold fontSize={16}>{tipo.descripcion}</SText>
                    <SView
                        onPress={(e) => {
                            FloatMenu.open({
                                e,
                                options: [
                                    {
                                        icon: <SIconApp name="Delete" />,
                                        label: "Eliminar tipo",
                                        onPress: () => {
                                            MDL.contabilidad.centro_costo_tipo.eliminar({ key: tipo.key })
                                                .then(() => this.loadData());
                                        }
                                    }
                                ]
                            });
                        }}
                    >
                        <SIconApp name="More" width={18} height={18} />
                    </SView>
                </SView>

                <SHr h={8} />

                {/* Centros de costo */}
                {tipo.centros.map((cc) => {
                    // Estado de edición inline
                    if (cc.isEditing) {
                        return (
                            <SView
                                key={cc.key}
                                row
                                style={{
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    paddingVertical: 4,
                                }}
                            >
                                <SInput
                                    defaultValue={cc.descripcion}
                                    ref={(ref) => cc._input = ref}
                                    placeholder="Editar nombre"
                                    style={{ flex: 1, marginRight: 8 }}
                                />
                                <SView row>
                                    {/* GUARDAR */}
                                    <SView
                                        width={28}
                                        height={28}
                                        center
                                        style={{
                                            backgroundColor: STheme.color.success,
                                            borderRadius: 6,
                                            marginRight: 4
                                        }}
                                        onPress={async () => {
                                            const newValue = cc._input.getValue()?.trim();
                                            if (!newValue || newValue === cc.descripcion) {
                                                cc.isEditing = false;
                                                this.forceUpdate();
                                                return;
                                            }

                                            try {
                                                // 🔹 Actualizar en BD
                                                await MDL.contabilidad.centro_costo.editar({
                                                    key: cc.key,
                                                    descripcion: newValue,
                                                });

                                                // 🔹 Actualizar solo en memoria sin recargar todo
                                                cc.descripcion = newValue;
                                                cc.isEditing = false;
                                                this.forceUpdate();
                                            } catch (e) {
                                                console.error("Error al editar centro de costo", e);
                                            }
                                        }}
                                    >
                                        <SText color={STheme.color.white}>✔</SText>
                                    </SView>

                                    {/* CANCELAR */}
                                    <SView
                                        width={28}
                                        height={28}
                                        center
                                        style={{
                                            backgroundColor: STheme.color.danger,
                                            borderRadius: 6
                                        }}
                                        onPress={() => {
                                            cc.isEditing = false;
                                            this.forceUpdate();
                                        }}
                                    >
                                        <SText color={STheme.color.white}>✖</SText>
                                    </SView>
                                </SView>
                            </SView>
                        );
                    }

                    // 🔹 Vista normal
                    return (
                        <SView
                            key={cc.key}
                            row
                            style={{
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingVertical: 4,
                                borderBottomWidth: 0.5,
                                borderColor: STheme.color.gray
                            }}
                            onPress={(e) => {
                                FloatMenu.open({
                                    e,
                                    options: [
                                        {
                                            icon: <SIconApp name="Eyes" />,
                                            label: "Seleccionar",
                                            onPress: () => {
                                                if (this.onSelect) {
                                                    this.onSelect(cc);
                                                    SNavigation.goBack();
                                                }
                                            }
                                        },
                                        {
                                            icon: <SIconApp name="Edit" />,
                                            label: "Editar",
                                            onPress: () => {
                                                cc.isEditing = true;
                                                this.forceUpdate();
                                            }
                                        },
                                        {
                                            icon: <SIconApp name="Delete" />,
                                            label: "Eliminar",
                                            onPress: () => {
                                                MDL.contabilidad.centro_costo.eliminar({ key: cc.key })
                                                    .then(() => this.loadData());
                                            }
                                        }
                                    ]
                                });
                            }}
                        >
                            <SText fontSize={14}>{cc.descripcion}</SText>
                            <SIconApp name="DotsVertical" width={16} height={16} />
                        </SView>
                    );
                })}

                {/* Input para nuevo centro */}
                <SHr h={8} />
                <SInput
                    ref={ref => this._ref[tipo.key] = ref}
                    placeholder="Nuevo centro de costo"
                    customStyle="secondary"
                    iconR={
                        <SView
                            width={30}
                            height={30}
                            center
                            style={{
                                backgroundColor: STheme.color.primary,
                                borderRadius: 6
                            }}
                            onPress={() => {
                                const value = this._ref[tipo.key].getValue();
                                if (!value) return;
                                MDL.contabilidad.centro_costo.registrar({
                                    descripcion: value,
                                    key_centro_costo_tipo: tipo.key
                                }).then(() => {
                                    this.loadData();
                                    this._ref[tipo.key].setValue("");
                                });
                            }}
                        >
                            <SText color={STheme.color.white}>+</SText>
                        </SView>
                    }
                />
            </SView>
        );
    }

    render() {
        return (
            <SPage title={"Centro de costo"}>
                <SView padding={16} style={{ maxWidth: 600, alignSelf: "center" }}>
                    {/* Crear tipo */}
                    <SInput
                        ref={ref => this.ref_tipo = ref}

                        placeholder="Escribe el tipo"
                        customStyle="secondary"
                        iconR={
                            <SView
                                width={30}
                                height={30}
                                center
                                style={{
                                    backgroundColor: STheme.color.primary,
                                    borderRadius: 6
                                }}
                                onPress={() => {
                                    const value = this.ref_tipo.getValue();
                                    if (!value) return;
                                    MDL.contabilidad.centro_costo_tipo.registrar({
                                        descripcion: value,
                                    }).then(() => {
                                        this.loadData();
                                        this.ref_tipo.setValue("");
                                    });
                                }}
                            >
                                <SText color={STheme.color.white}>+</SText>
                            </SView>
                        }
                    />
                    <SHr h={16} />
                    {this.centro_costo_tipo.map(tipo => this.renderTipo(tipo))}
                </SView>
            </SPage>
        );
    }
}
