import React from "react";
import { SDate, SHr, SInput, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import { DinamicTable } from "servisofts-table";
import MDL from "../../MDL";
import Config from "../../Config";
import FloatMenu from "../../Components/FloatMenu";
import SIconApp from "../../Assets/SIconApp";
import CuentaContableForm from "./Components/CuentaContableForm";
import AjusteTag from "./Components/AjusteTag";
import AjusteTagInfoPopup from "./Components/AjusteInfoPopup";
import { ScrollView } from "react-native";
import FloatButtom from "../../Components/FloatButtom";



export default class cuentas_anidadas extends React.Component {

    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: "/conta/cuentas", permiso: "ver" }).then((permit) => {
            if (!permit) {
                SNavigation.goBack();
                return;
            }
            this.loadData();
        }).catch(e => {
            console.error(e);
        })
        this.loadData();
    }

    async loadData() {
        const resp = await MDL.contabilidad.getCuentas();
        let arr = Object.values(resp);

        const ajustes = await MDL.contabilidad.getAjustes();
        const empresa = await MDL.empresa.getFull();

        this.setState({ ajustes: ajustes });

        arr.map((cuenta) => {
            if (cuenta.key_moneda) {
                cuenta.moneda = empresa.monedas.find((m) => m.key == cuenta.key_moneda);
            }
            cuenta.ajustes = ajustes.filter((ajuste) => ajuste?.ajuste_empresa?.key_cuenta_contable == cuenta.key);
        });

        if (this.props.filtroTipo) {
            arr = arr.filter((dat) => dat.tipo === this.props.filtroTipo);
        }

        const tree = this.buildTree(arr);

        // 🔥 MANTENER estado anterior
        let openItems = { ...(this.state.openItems || {}) };
        let selectedItem = this.state.selectedItem || null;

        // 🔥 APLICAR keyEdit SOLO UNA VEZ
        if (this.props.keyEdit && !this.keyEditApplied) {
            this.keyEditApplied = true;

            const cuentaSelected = arr.find(c => c.key == this.props.keyEdit);

            if (cuentaSelected) {
                selectedItem = cuentaSelected.codigo;

                const parts = cuentaSelected.codigo.split(".");
                while (parts.length > 1) {
                    parts.pop();
                    const parentCode = parts.join(".");
                    openItems[parentCode] = true;
                }
            }
        }

        // 🔥 SI HAY FILTRO → ABRIR TODO
        if (this.props.filtroTipo) {
            const allCodes = this.getAllCodesWithChildren(tree);
            allCodes.forEach(code => {
                openItems[code] = true;
            });
        }

        this.setState({
            cuentas: arr,
            openItems,
            selectedItem
        });
    }

    constructor(props) {
        super(props);
        this.state = {
            openItems: {},
            cuentas: [],
            search: "",
            hoveredItem: null,
            selectedItem: null,
            selectPosition: null // { x, y }
        };

        // 🔥 evitar que keyEdit se aplique múltiples veces
        this.keyEditApplied = false;
    }

    toggleItem = (codigo) => {
        this.setState(prev => ({
            openItems: {
                ...prev.openItems,
                [codigo]: !prev.openItems[codigo]
            }
        }));
    };

    compareCodigos = (a, b) => {
        const aParts = a.codigo.split(".").map(Number);
        const bParts = b.codigo.split(".").map(Number);

        const maxLength = Math.max(aParts.length, bParts.length);

        for (let i = 0; i < maxLength; i++) {
            const aVal = aParts[i] || 0;
            const bVal = bParts[i] || 0;

            if (aVal !== bVal) {
                return aVal - bVal;
            }
        }

        return 0;
    };



    buildTree = (data) => {
        const map = {};

        // Crear mapa
        data.forEach(item => {
            map[item.codigo] = { ...item, children: [] };
        });

        const tree = [];

        data.forEach(item => {
            let parts = item.codigo.split(".");

            // 🔥 Buscar padre existente hacia arriba
            let parentFound = false;

            while (parts.length > 1) {
                parts.pop(); // quitamos el último nivel
                const parentCode = parts.join(".");

                if (map[parentCode]) {
                    map[parentCode].children.push(map[item.codigo]);
                    parentFound = true;
                    break;
                }
            }

            // 🔥 Si no encontró padre → es raíz
            if (!parentFound) {
                tree.push(map[item.codigo]);
            }
        });

        // 🔥 Ordenar todo el árbol
        const sortTree = (nodes) => {
            nodes.sort(this.compareCodigos);
            nodes.forEach(n => {
                if (n.children.length > 0) {
                    sortTree(n.children);
                }
            });
        };

        sortTree(tree);

        return tree;
    };

    renderItem = (item, level = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = !!this.state.openItems[item.codigo];
        const isSelected = this.state.selectedItem === item.codigo;
        const isHover = this.state.hoveredItem === item.codigo;
        const isRoot = level === 0;
        const nombreCuenta = `CUENTA: ${item.descripcion ?? 'Sin nombre'}`;
        const options = [];
        if (this.props.select) {
            options.push({
                label: 'Seleccionar',
                icon: <SIconApp name="vineta1" fill={STheme.color.success} />,
                onPress: () => {

                    if (this.props.select) {
                        this.props.select(item);
                    }
                },
            })
        }

        if (MDL.rolesPermisos.getPermiso({ url: "/conta/cuentas", permiso: 'new' })) {
            options.push({
                label: 'Agregar sub cuenta',
                icon: <SIconApp name="Add" />,
                onPress: () => {
                    const grafo = MDL.contabilidad.getCuentasGrafo(this.state.cuentas);
                    const cuenta = grafo.find(n => n.codigo === item.codigo);
                    const hijos = cuenta.childrens || [];

                    // let index = "01";
                    // let childSize = 0;
                    // if (hijos.length > 0) {
                    //     index = hijos.length + 1
                    //     if (index.length < 2) {
                    //         index = "0" + index
                    //     }
                    //     childSize = hijos[0].codigo.length
                    // } else {
                    //     // BHuscar
                    //     const niveles = MDL.contabilidad.armarNiveles(this.state.cuentas);
                    //     const lvlPadre = item.codigo.length;
                    //     const indexLvl = niveles.findIndex(n => n == lvlPadre) + 1;
                    //     if (indexLvl > 0 && niveles[indexLvl]) {
                    //         childSize = niveles[indexLvl];
                    //     }
                    //     console.log("niveles", childSize)
                    // }
                    // let codigo = item.codigo + "." + index

                    // if (codigo.length < childSize) {
                    //     codigo = item.codigo + "." + "0".repeat(childSize - codigo.length) + index;
                    // }

                    // 🔥 Generar código de subcuenta correctamente
                    let codigo = "";

                    if (hijos.length > 0) {
                        // ordenar hijos para asegurar el último correcto
                        hijos.sort((a, b) => this.compareCodigos(a, b));

                        const lastChild = hijos[hijos.length - 1];

                        // dividir el código en partes
                        const parts = lastChild.codigo.split(".");

                        // obtener el último segmento
                        const lastIndex = parts[parts.length - 1];

                        // incrementar respetando formato (con o sin ceros)
                        const nextNumber = (parseInt(lastIndex) + 1)
                            .toString()
                            .padStart(lastIndex.length, "0");

                        // reemplazar último segmento
                        parts[parts.length - 1] = nextNumber;

                        // unir nuevamente
                        codigo = parts.join(".");
                    } else {
                        // 🔥 si no tiene hijos → primer hijo
                        codigo = item.codigo + ".1";
                    }

                    // const hermanas = e.dinamicTable.data.filter(r => r.codigo.startsWith(e.row.codigo + "."));
                    CuentaContableForm.open({
                        cuenta_contable: {
                            tipo: item.tipo,
                            codigo: codigo,
                            descripcion: "",
                            key_moneda: item.key_moneda,
                        },
                        onChange: (e) => {
                            const newCuenta = e?.cuenta_contable || e;

                            const parts = newCuenta.codigo.split(".");
                            parts.pop(); // quitar el último nivel

                            const parentCode = parts.join(".");

                            this.setState(prev => {
                                const parts = newCuenta.codigo.split(".");
                                let newOpenItems = { ...prev.openItems };

                                while (parts.length > 1) {
                                    parts.pop();
                                    const parent = parts.join(".");
                                    newOpenItems[parent] = true;
                                }

                                return {
                                    selectedItem: newCuenta.codigo,
                                    openItems: newOpenItems
                                };
                            });

                            this.loadData();
                            // this.loadData();
                        }
                    })
                },
            })
        }

        if (MDL.rolesPermisos.getPermiso({ url: "/conta/cuentas", permiso: 'edit' })) {
            options.push({
                label: 'Editar',
                icon: <SIconApp name="Edit" fill={STheme.color.warning} />,
                onPress: () => {
                    // const cliente = { ...item, key_usuario: MDL.usuario.session?.key };
                    CuentaContableForm.open({
                        cuenta_contable: item,
                        onChange: (e) => {
                            this.loadData();
                        }
                    })
                },
            })
        }

        if (MDL.rolesPermisos.getPermiso({ url: "/conta/cuentas", permiso: 'delete' })) {
            options.push({
                label: 'Eliminar',
                icon: <SIconApp name="Delete" fill={STheme.color.text} />,
                onPress: () => {
                    SPopup.confirm({
                        title: "Eliminar Cuenta Contable",
                        message: "¿Estás seguro de eliminar la cuenta contable?",
                        onPress: () => {
                            MDL.contabilidad.cuenta_contable.save({
                                key: item.key,
                                estado: 0,
                            }).then(e => {
                                SNotification.send({
                                    title: "Cuenta eliminada",
                                    body: "La cuenta contable ha sido eliminada correctamente.",
                                    color: STheme.color.success,
                                    time: 3000,
                                })
                                this.loadData();
                            }).catch(error => {
                                console.error("Error al eliminar cuenta contable:", error);
                                SNotification.send({
                                    title: "Error",
                                    body: "Error al eliminar cuenta contable.",
                                    color: STheme.color.danger,
                                    time: 3000,
                                })

                            })
                        }

                    })
                },
            })
        }

        // Prioridad de colores para selección, hover y primer nivel.
        let backgroundColor = isRoot ? "#134e4a" : "#111827";
        if (isSelected) {
            backgroundColor = "#1e293b";
        } else if (isHover) {
            backgroundColor = "#172033";
        }

        const tipo = (item.tipo || "").toUpperCase();
        const badgeColorMap = {
            ACTIVO: { borderColor: "#10b981", bg: "rgba(16,185,129,0.15)", color: "#34d399" },
            PASIVO: { borderColor: "#f59e0b", bg: "rgba(245,158,11,0.15)", color: "#fbbf24" },
            PATRIMONIO: { borderColor: "#0ea5e9", bg: "rgba(14,165,233,0.15)", color: "#7dd3fc" },
            INGRESO: { borderColor: "#a855f7", bg: "rgba(168,85,247,0.15)", color: "#c084fc" },
            INGRESOS: { borderColor: "#a855f7", bg: "rgba(168,85,247,0.15)", color: "#c084fc" },
            GASTO: { borderColor: "#ef4444", bg: "rgba(239,68,68,0.15)", color: "#f87171" },
            GASTOS: { borderColor: "#ef4444", bg: "rgba(239,68,68,0.15)", color: "#f87171" },
        };
        const tipoStyle = badgeColorMap[tipo] || {
            borderColor: "#334155",
            bg: "rgba(148,163,184,0.15)",
            color: "#cbd5e1",
        };

        return (
            <SView key={item.key} col={"xs-12"}
                style={{
                    borderBottomWidth: 1,
                    borderBottomColor: "#1e293b",
                    backgroundColor,
                }}>
                <SView
                    // onPress={() => {
                    //     this.setState({ selectedItem: item.codigo });
                    //     // if (!isSearching && hasChildren) {
                    //     //     this.toggleItem(item.codigo);
                    //     // }
                    //     if (hasChildren) {
                    //         this.toggleItem(item.codigo);
                    //     }
                    // }}
                    onPress={(evt) => {
                        const { pageX, pageY } = evt.nativeEvent;

                        this.setState({
                            selectedItem: item.codigo,
                            selectPosition: { x: pageX, y: pageY }
                        });

                        if (hasChildren) {
                            this.toggleItem(item.codigo);
                        }
                    }}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 14,
                        paddingHorizontal: 12,
                        backgroundColor,

                    }}
                    onPressIn={() => this.setState({ hoveredItem: item.codigo })}
                    onPressOut={() => this.setState({ hoveredItem: null })}
                    onMouseEnter={() =>
                        this.setState({ hoveredItem: item.codigo })
                    }
                    onMouseLeave={() =>
                        this.setState({ hoveredItem: null })
                    }

                >
                    <SView
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            paddingLeft: level * 18
                        }}
                    >
                        {/* Flecha */}
                        <SText style={{ width: 24, color: "#94a3b8" }}>
                            {hasChildren ? (isOpen ? "▼" : "▶") : ""}
                        </SText>

                        {/* Texto */}
                        <SText numberOfLines={1} style={{ color: "#f8fafc", fontSize: 14, fontWeight: "600" }}>
                            {item.codigo} - {item.descripcion || item.tipo}
                        </SText>
                        <SView width={10} />
                        <SView style={{ alignItems: "center" }}>
                            <SText clean style={{
                                borderWidth: 1,
                                borderColor: tipoStyle.borderColor,
                                backgroundColor: tipoStyle.bg,
                                color: tipoStyle.color,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 999,
                                fontSize: 9,
                                fontWeight: "700"
                            }}>{item.tipo}</SText>
                        </SView>
                        <SView width={10} />
                        <SView style={{ alignItems: "center" }}>
                            {item?.ajustes.map((ajuste, index) => {
                                return <AjusteTag allowDrag ajuste={ajuste} onPress={() => {
                                    AjusteTagInfoPopup.open({
                                        ajuste: ajuste,
                                        onPress: () => {
                                            this.loadData();
                                        }

                                    })
                                }} />
                            })}
                        </SView>
                    </SView>



                    <SView style={{ width: 100, alignItems: "center" }}>
                        <SText style={{ color: "#e2e8f0", fontWeight: "600" }}>0</SText>
                    </SView>

                    <SView style={{ width: 100, alignItems: "center" }}>
                        <SText style={{ color: "#e2e8f0", fontWeight: "600" }}>0</SText>
                    </SView>

                    <SView style={{ width: 100, alignItems: "center" }}>
                        <SText style={{ color: "#e2e8f0", fontWeight: "600" }}>0</SText>
                    </SView>

                    <SView style={{ width: 50, alignItems: "center" }} onPress={(evt) => {
                        FloatMenu.open({
                            e: evt,
                            label: nombreCuenta,
                            options,
                        });
                    }}>
                        {/* <SView
                            onPress={(e) => this.openMenu(item, e)}
                            style={{
                                padding: 5,
                                borderRadius: 5
                            }}
                        > */}
                        <SIconApp name="drive-menu" width={15} height={15} fill={"#94a3b8"} />
                        {/* </SView> */}
                    </SView>
                </SView>

                {/* Hijos */}
                {isOpen &&
                    item.children.map(child =>
                        this.renderItem(child, level + 1)
                    )}
            </SView>
        );
    };

    /*PARA BUSCAR*/
    handleSearch = (text) => {
        const dataArray = this.state.cuentas;
        const tree = this.buildTree(dataArray);

        if (!text) {
            this.setState({
                search: "",
                openItems: {}
            });
            return;
        }

        const filteredTree = this.filterTree(tree, text);

        // 🔥 obtener todos los nodos que deben abrirse
        const allCodes = this.getAllCodesWithChildren(filteredTree);

        const openItems = {};
        allCodes.forEach(code => {
            openItems[code] = true;
        });

        this.setState({
            search: text,
            openItems
        });
    };

    filterTree = (nodes, search) => {
        if (!search) return nodes;

        const searchLower = search.toLowerCase();

        return nodes
            .map(node => {
                const match =
                    node.descripcion?.toLowerCase().includes(searchLower) ||
                    node.codigo.includes(search);

                const childrenFiltered = this.filterTree(node.children, search);

                if (match || childrenFiltered.length > 0) {
                    return {
                        ...node,
                        children: childrenFiltered,
                        //autoOpen: true // 🔥 SOLO en búsqueda
                    };
                }

                return null;
            })
            .filter(Boolean);
    };
    /*PARA BUSCAR*/



    /*PARA EXPANDIR / OCULTAR*/
    getAllCodesWithChildren = (nodes) => {
        let result = [];

        nodes.forEach(node => {
            if (node.children && node.children.length > 0) {
                result.push(node.codigo);
                result = result.concat(
                    this.getAllCodesWithChildren(node.children)
                );
            }
        });

        return result;
    };

    expandAll = (tree) => {
        const allCodes = this.getAllCodesWithChildren(tree);

        const openItems = {};
        allCodes.forEach(code => {
            openItems[code] = true;
        });

        this.setState({ openItems });
    };

    collapseAll = () => {
        this.setState({ openItems: {} });
    };

    /*PARA EXPANDIR / OCULTAR*/

    selectItem = (codigo) => {
        this.setState({ selectedItem: codigo });
    };

    render() {
        // const dataArray = Object.values(this.props.data || {});
        const dataArray = this.state.cuentas;
        dataArray.sort(this.compareCodigos);
        const tree = this.buildTree(dataArray);

        //aplicar búsqueda
        const filteredTree = this.filterTree(tree, this.state.search);

        const currentTree = this.state.search ? filteredTree : tree;

        const buttonBase = {
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: "#334155",
            backgroundColor: "#1e293b",
            flexDirection: "row",
            alignItems: "center",
        };

        return (
            <SPage title={"Plan de cuentas anidadas"} hidden={this.props.select ? true : false}>

                <SView col={"xs-12"} style={{ flex: 1, backgroundColor: "#0f172a" }}>

                    {/* 🔹 HEADER FIJO */}
                    <SView col={"xs-12"} padding={15}>
                        <SText style={{ fontSize: 28, fontWeight: "700", color: "#ffffff", marginBottom: 16 }}>
                            Plan de cuentas anidadas
                        </SText>

                        <SView style={{ justifyContent: "space-between", alignItems: "center" }} row>

                            <SView col={"xs-12 sm-8 md-8 lg-8 xl-8"}>
                                <SView width={24} height={24} style={{
                                    position: "absolute",
                                    top: 12,
                                    left: 14,
                                    zIndex: 2
                                }}>
                                    <SIconApp name="Search" width={20} height={20} fill={"#94a3b8"} />
                                </SView>

                                <SInput
                                    placeholder={"Buscar cuenta..."}
                                    value={this.state.search}
                                    onChangeText={(tx) => this.handleSearch(tx)}
                                    style={{
                                        paddingLeft: 40,
                                        borderWidth: 1,
                                        borderColor: "#334155",
                                        borderRadius: 14,
                                        backgroundColor: "#1e293b",
                                        color: "#ffffff",
                                        height: 44,
                                    }}
                                />
                            </SView>

                            <SView width={10} />

                            <SView row style={{ alignItems: "center", marginTop: 5 }}>
                                <SView onPress={() => {
                                    const grafo = MDL.contabilidad.getCuentasGrafo(this.state.cuentas);
                                    const cuentas = grafo.filter(n => n.parent === null);
                                    const hijos = cuentas || [];

                                    let codigo = "";

                                    if (hijos.length > 0) {
                                        hijos.sort((a, b) => this.compareCodigos(a, b));
                                        const lastChild = hijos[hijos.length - 1];
                                        const parts = lastChild.codigo.split(".");
                                        const lastIndex = parts[parts.length - 1];
                                        const nextNumber = (parseInt(lastIndex) + 1)
                                            .toString()
                                            .padStart(lastIndex.length, "0");
                                        parts[parts.length - 1] = nextNumber;
                                        codigo = parts.join(".");
                                    } else {
                                        codigo = ".1";
                                    }

                                    CuentaContableForm.open({
                                        cuenta_contable: {
                                            codigo,
                                            descripcion: "",
                                        },
                                        onChange: (e) => {
                                            const newCuenta = e?.cuenta_contable || e;
                                            this.setState(prev => {
                                                const parts = newCuenta.codigo.split(".");
                                                let newOpenItems = { ...prev.openItems };
                                                while (parts.length > 1) {
                                                    parts.pop();
                                                    const parent = parts.join(".");
                                                    newOpenItems[parent] = true;
                                                }
                                                return {
                                                    selectedItem: newCuenta.codigo,
                                                    openItems: newOpenItems
                                                };
                                            });
                                            this.loadData();
                                        }
                                    });
                                }} style={{
                                    ...buttonBase,
                                    backgroundColor: "#10b981",
                                    borderColor: "#10b981",
                                }}>
                                    <SText style={{ color: "#ffffff", fontWeight: "700", fontSize: 13 }}>+ Nueva cuenta</SText>
                                </SView>

                                <SView width={10} />

                                <SView onPress={() => this.expandAll(currentTree)} style={buttonBase}>
                                    <SIconApp name="expand" width={15} height={15} fill={"#cbd5e1"} />
                                    <SView width={5} />
                                    <SText style={{ color: "#cbd5e1", fontWeight: "600" }}>Expandir</SText>
                                </SView>

                                <SView width={10} />

                                <SView onPress={this.collapseAll} style={buttonBase}>
                                    <SIconApp name="collapse" width={15} height={15} fill={"#cbd5e1"} />
                                    <SView width={5} />
                                    <SText style={{ color: "#cbd5e1", fontWeight: "600" }}>Colapsar</SText>
                                </SView>
                            </SView>

                        </SView>
                    </SView>

                    {/* 🔹 LISTA CON SCROLL */}
                    <SView col={"xs-12"} style={{ flex: 1 }} padding={15}>
                        <SView style={{
                            flex: 1,
                            borderRadius: 18,
                            overflow: "hidden",
                            borderWidth: 1,
                            borderColor: "#1e293b",
                            backgroundColor: "#111827",
                        }}>
                            <SView style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: "#0b1220",
                                borderBottomWidth: 1,
                                borderBottomColor: "#1e293b",
                                paddingVertical: 14,
                                paddingHorizontal: 12,
                            }}>
                                <SView style={{ flex: 1 }}>
                                    <SText style={{ color: "#94a3b8", fontSize: 12, fontWeight: "700" }}>CUENTA</SText>
                                </SView>
                                <SView style={{ width: 100, alignItems: "center" }}>
                                    <SText style={{ color: "#94a3b8", fontSize: 12, fontWeight: "700" }}>DEBITO</SText>
                                </SView>
                                <SView style={{ width: 100, alignItems: "center" }}>
                                    <SText style={{ color: "#94a3b8", fontSize: 12, fontWeight: "700" }}>CREDITO</SText>
                                </SView>
                                <SView style={{ width: 100, alignItems: "center" }}>
                                    <SText style={{ color: "#94a3b8", fontSize: 12, fontWeight: "700" }}>SALDO</SText>
                                </SView>
                                <SView style={{ width: 50 }} />
                            </SView>

                            <ScrollView
                                ref={ref => this.scrollViewVertical = ref}
                                style={{ flex: 1 }}
                                showsVerticalScrollIndicator={true}
                            >
                                {filteredTree.map(item => this.renderItem(item))}
                                <SHr height={65} />
                            </ScrollView>
                        </SView>

                    </SView>

                </SView>
                <FloatButtom onPress={() => {
                    const grafo = MDL.contabilidad.getCuentasGrafo(this.state.cuentas);
                    const cuentas = grafo.filter(n => n.parent === null);
                    const hijos = cuentas || [];
                    console.log("AQUIIIIIiiiiI")
                    console.log(grafo)
                    console.log("AQUIIi")

                    console.log(cuentas)
                    console.log("AQUI")
                    // 🔥 Generar código de subcuenta correctamente
                    let codigo = "";

                    if (hijos.length > 0) {
                        // ordenar hijos para asegurar el último correcto
                        hijos.sort((a, b) => this.compareCodigos(a, b));

                        const lastChild = hijos[hijos.length - 1];

                        // dividir el código en partes
                        const parts = lastChild.codigo.split(".");

                        // obtener el último segmento
                        const lastIndex = parts[parts.length - 1];

                        // incrementar respetando formato (con o sin ceros)
                        const nextNumber = (parseInt(lastIndex) + 1)
                            .toString()
                            .padStart(lastIndex.length, "0");

                        // reemplazar último segmento
                        parts[parts.length - 1] = nextNumber;

                        // unir nuevamente
                        codigo = parts.join(".");
                    } else {
                        // 🔥 si no tiene hijos → primer hijo
                        // codigo = item.codigo + ".1";
                        codigo = ".1"

                    }

                    CuentaContableForm.open({
                        cuenta_contable: {
                            // tipo: item.tipo,
                            codigo: codigo,
                            descripcion: "",
                            // key_moneda: item.key_moneda,
                        },
                        onChange: (e) => {
                            const newCuenta = e?.cuenta_contable || e;

                            const parts = newCuenta.codigo.split(".");
                            parts.pop(); // quitar el último nivel

                            const parentCode = parts.join(".");

                            this.setState(prev => {
                                const parts = newCuenta.codigo.split(".");
                                let newOpenItems = { ...prev.openItems };

                                while (parts.length > 1) {
                                    parts.pop();
                                    const parent = parts.join(".");
                                    newOpenItems[parent] = true;
                                }

                                return {
                                    selectedItem: newCuenta.codigo,
                                    openItems: newOpenItems
                                };
                            });

                            this.loadData();
                        }

                    })
                }} />

                {this.props.btnSelect && this.state.selectedItem && this.state.selectPosition && (
                    <SView
                        style={{
                            position: "absolute",
                            top: this.state.selectPosition.y - 65,
                            left: this.state.selectPosition.x + 10,
                            zIndex: 999
                        }}
                    >
                        <SView row
                            onPress={() => {
                                const cuenta = this.state.cuentas.find(
                                    c => c.codigo === this.state.selectedItem
                                );

                                if (this.props.select && cuenta) {
                                    this.props.select(cuenta);
                                }

                                // opcional: ocultar botón después
                                this.setState({ selectPosition: null });
                            }}
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 10,
                                backgroundColor: STheme.color.primary,
                                borderRadius: 8,
                                shadowColor: "#000",
                                shadowOpacity: 0.3,
                                shadowRadius: 5,
                                elevation: 5
                            }}
                        >
                            <SIconApp width={18} height={18} name="vineta1" fill={STheme.color.success} />
                            <SView width={10} />
                            <SText color={STheme.color.white}>Seleccionar</SText>
                        </SView>
                    </SView>
                )}
            </SPage>
        );
    }


}
