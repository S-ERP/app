import React, { Component } from "react";
import {
    SView,
    SText,
    STheme,
    SButtom,
    SNavigation,
} from "servisofts-component";

const styles = {
    rootBg: STheme.color.card,
    sidebarBg: "#111827",
    sidebarBorder: "#334155",
    textPrimary: STheme.color.text,
    textMuted: "#9ca3af",
    accent: "#10b981",
    cardBg: "#1f2937",
    cardBorder: "#334155",
};

const modules = [
    {
        id: "proveedor-form",
        title: "Formulario de Proveedor",
        description:
            "Captura de proveedores con validaciones, campos clave y preparación para envío a base de datos.",
        route: "/proveedor/perfil",
    },
    {
        id: "gestion-proveedores",
        title: "Gestión de Proveedores",
        description: "Listado, búsqueda y acciones de edición/eliminación. Paginación preparada.",
        route: "/proveedor",
    },
    {
        id: "registro-inventario",
        title: "Registro de Inventario",
        description: "Altas y movimientos de inventario con control de existencias y costos.",
        route: "/inventario/almacen/profile/registro_inventario",
    },
    {
        id: "reporte-conteo",
        title: "Reporte de Conteo de Inventario",
        description: "Generación de reporte con filtros por fecha y categoría, exportable.",
        route: "/inventario/reporteConteoInventario",
    },
    {
        id: "punto-venta",
        title: "Punto de Venta",
        description:
            "Flujo de venta, carrito, cálculo de totales e impuestos; soporte para lector de código de barras.",
        route: "/puntoventa",
    },
];

export default class alvaro2 extends Component {
    navigateTo = (route) => {
        SNavigation.navigate(route);
    };

    renderSidebar() {
        return (
            <SView
                col={"xs-3"}
                style={{
                    backgroundColor: styles.sidebarBg,
                    borderRightWidth: 1,
                    borderRightColor: styles.sidebarBorder,
                    padding: 24,
                    minHeight: "100vh",
                    position: "sticky",
                    top: 0,
                    overflowY: "auto",
                }}
            >
                {/* Logo + Título */}
                <SView row center style={{ marginBottom: 30, gap: 10 }}>
                    <SView
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            backgroundColor: styles.accent,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <SText bold color={"#052e2b"} fontSize={20}>
                            SI
                        </SText>
                    </SView>
                    <SText bold fontSize={20} color={styles.textPrimary}>
                        Sistema Integral
                    </SText>
                </SView>

                {/* Bienvenida y descripción */}
                <SText
                    fontSize={22}
                    bold
                    color={styles.accent}
                    style={{ marginBottom: 12 }}
                >
                    Bienvenidos a mis actividades
                </SText>
                <SText
                    fontSize={14}
                    color={styles.textMuted}
                    style={{ marginBottom: 30, maxWidth: "90%" }}
                >
                    Aquí podrás revisar los avances desarrollados en los diferentes módulos del sistema.
                </SText>

                {/* Botones de navegación */}
                <SView col={"xs-12"}>
                    {modules.map((mod) => (
                        <SButtom
                            key={mod.id}
                            col={"xs-12"}
                            style={{
                                marginBottom: 12,
                                backgroundColor: "transparent",
                                borderWidth: 1,
                                borderColor: styles.sidebarBorder,
                                borderRadius: 8,
                                paddingVertical: 12,
                                paddingHorizontal: 10,
                            }}
                            onPress={() => this.navigateTo(mod.route)}
                        >
                            <SText color={styles.textPrimary} fontSize={15}>
                                {mod.title}
                            </SText>
                        </SButtom>
                    ))}
                </SView>
            </SView>
        );
    }

    renderModuleCard(mod) {
        return (
            <SView
                key={mod.id}
                col={"xs-12 md-5"}
                style={{
                    backgroundColor: styles.cardBg,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: styles.cardBorder,
                    padding: 20,
                    minHeight: 160,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                }}
            >
                <SText
                    fontSize={19}
                    bold
                    color={styles.textPrimary}
                    style={{ marginBottom: 10 }}
                >
                    {mod.title}
                </SText>
                <SText fontSize={15} color={styles.textMuted} style={{ flexGrow: 1 }}>
                    {mod.description}
                </SText>
                <SButtom
                    style={{
                        marginTop: 16,
                        backgroundColor: styles.accent,
                        borderRadius: 8,
                        alignSelf: "flex-start",
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                    }}
                    onPress={() => this.navigateTo(mod.route)}
                >
                    <SText color="#052e2b" fontSize={15} bold>
                        Abrir módulo
                    </SText>
                </SButtom>
            </SView>
        );
    }

    renderMainContent() {
        return (
            <SView
                col={"xs-9"}
                style={{
                    padding: 32,
                    minHeight: "100vh",
                    backgroundColor: styles.rootBg,
                    overflowY: "auto",
                }}
            >
                <SView row wrap col={"xs-12"} style={{ gap: 24 }}>
                    {modules.map((mod) => this.renderModuleCard(mod))}
                </SView>

                <SText
                    fontSize={13}
                    color={styles.textMuted}
                    style={{ marginTop: 48, textAlign: "center" }}
                >
                    © {new Date().getFullYear()} Área de Sistemas · Entrega de avances
                </SText>
            </SView>
        );
    }

    render() {
        return (
            <SView row col={"xs-12"} style={{ minHeight: "100vh" }}>
                {this.renderSidebar()}
                {this.renderMainContent()}
            </SView>
        );
    }
}
