import React from "react";
import { SHr, SInput, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import FloatMenu from "../../Components/FloatMenu";
import SIconApp from "../../Assets/SIconApp";
import CuentaContableForm from "./Components/CuentaContableForm";
import AjusteTag from "./Components/AjusteTag";
import AjusteTagInfoPopup from "./Components/AjusteInfoPopup";
import { ScrollView } from "react-native";
import FloatButtom from "../../Components/FloatButtom";

export default class cuentas_anidadas extends React.Component {

    tipoComprobante = "Todos";
    baseDataCache = null;
    reporteTodosPorCodigo = null;
    reporteTipoRaw = null;
    reporteTipoPorCodigo = {};
    searchDebounceTimeout = null;
    cachedTree = null;
    cachedTreeData = null;
    cachedFilteredTree = null;
    cachedFilteredSearch = null;
    hoveredItemLocal = null;

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
        if (typeof window !== "undefined") {
            window.addEventListener("keydown", this.handleKeyDown);
        }
    }

    componentWillUnmount() {
        if (typeof window !== "undefined") {
            window.removeEventListener("keydown", this.handleKeyDown);
        }
        if (this.searchDebounceTimeout) {
            clearTimeout(this.searchDebounceTimeout);
            this.searchDebounceTimeout = null;
        }
    }

    resetFiltros = () => {
        if (this.searchDebounceTimeout) {
            clearTimeout(this.searchDebounceTimeout);
            this.searchDebounceTimeout = null;
        }
        this.tipoComprobante = "Todos";
        this.setState({
            search: "",
            openItems: {},
            tipoComprobante: "Todos",
        }, () => {
            this.loadData();
        });
    };

    handleKeyDown = (e) => {
        const key = e?.key || e?.nativeEvent?.key;
        if (key === "Escape") {
            this.resetFiltros();
        }
    };

    filterTree = (nodes, search) => {
        if (!search) return nodes;
        const searchLower = search.toLowerCase();
        const filtered = [];
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const match =
                node.descripcion?.toLowerCase().includes(searchLower) ||
                node.codigo.includes(search);
            const childrenFiltered = node.children?.length ? this.filterTree(node.children, search) : [];
            if (match || childrenFiltered.length > 0) {
                filtered.push({
                    ...node,
                    children: childrenFiltered,
                });
            }
        }
        return filtered;
    };

    invalidateCaches = () => {
        this.baseDataCache = null;
        this.reporteTodosPorCodigo = null;
        this.reporteTipoRaw = null;
        this.reporteTipoPorCodigo = {};
        this.cachedTree = null;
        this.cachedTreeData = null;
        this.cachedFilteredTree = null;
        this.cachedFilteredSearch = null;
    };

    async getBaseData(forceRefresh = false) {
        if (!forceRefresh && this.baseDataCache) return this.baseDataCache;

        const [resp, ajustes, empresa] = await Promise.all([
            MDL.contabilidad.getCuentas(),
            MDL.contabilidad.getAjustes(),
            MDL.empresa.getFull(),
        ]);
        const cuentasObj = resp || {};
        const ajustesArr = ajustes || [];
        const monedas = empresa?.monedas || [];
        const ajustesPorCuenta = {};
        ajustesArr.forEach((ajuste) => {
            const keyCuenta = ajuste?.ajuste_empresa?.key_cuenta_contable;
            if (!keyCuenta) return;
            if (!ajustesPorCuenta[keyCuenta]) ajustesPorCuenta[keyCuenta] = [];
            ajustesPorCuenta[keyCuenta].push(ajuste);
        });
        const cuentasBase = Object.values(cuentasObj).map((cuenta) => ({
            ...cuenta,
            moneda: cuenta.key_moneda ? monedas.find((m) => m.key == cuenta.key_moneda) : null,
            ajustes: ajustesPorCuenta[cuenta.key] || [],
        }));

        this.baseDataCache = { cuentasBase, ajustes: ajustesArr };
        return this.baseDataCache;
    }

    async getReportePorCodigo(tipoComprobante, forceRefresh = false) {
        if (tipoComprobante === "Todos") {
            if (!forceRefresh && this.reporteTodosPorCodigo) return this.reporteTodosPorCodigo;
            const reporteBalanceTodos = await MDL.contabilidad.reporte_balance_general();
            const reportePorCodigo = {};
            (reporteBalanceTodos || []).forEach((cuenta) => {
                if (!cuenta?.codigo) return;
                reportePorCodigo[cuenta.codigo] = cuenta;
            });
            this.reporteTodosPorCodigo = reportePorCodigo;
            return reportePorCodigo;
        }

        const tipoLower = (tipoComprobante || "").toLowerCase();
        if (!forceRefresh && this.reporteTipoPorCodigo[tipoLower]) {
            return this.reporteTipoPorCodigo[tipoLower];
        }

        if (forceRefresh || !this.reporteTipoRaw) {
            this.reporteTipoRaw = await MDL.contabilidad.reporte_balance_general_tipo_comprobante();
            this.reporteTipoPorCodigo = {};
        }

        const reportePorCodigo = {};
        (this.reporteTipoRaw || []).forEach((cuenta) => {
            if (!cuenta?.codigo) return;
            if ((cuenta.tipo_comprobante || "").toLowerCase() === tipoLower) {
                reportePorCodigo[cuenta.codigo] = cuenta;
            }
        });
        this.reporteTipoPorCodigo[tipoLower] = reportePorCodigo;
        return reportePorCodigo;
    }

    async loadData({ forceRefresh = false } = {}) {
        const [{ cuentasBase, ajustes }, reportePorCodigo] = await Promise.all([
            this.getBaseData(forceRefresh),
            this.getReportePorCodigo(this.tipoComprobante, forceRefresh),
        ]);

        let arr = cuentasBase.map((cuenta) => {
            const reporte = reportePorCodigo[cuenta.codigo] || {};
            const debe = parseFloat(reporte.debe || 0);
            const haber = parseFloat(reporte.haber || 0);
            return {
                ...cuenta,
                ...reporte,
                debe,
                haber,
                saldo: ["ACTIVO", "GASTO"].includes(cuenta.tipo)
                    ? (debe - haber)
                    : (haber - debe),
            };
        });
        const uniqueByCodigo = {};
        arr.forEach(item => {
            if (!uniqueByCodigo[item.codigo]) {
                uniqueByCodigo[item.codigo] = item;
            }
        });
        arr = Object.values(uniqueByCodigo);
        this.setState({ ajustes: ajustes });
        if (this.props.filtroTipo) {
            arr = arr.filter((dat) => dat.tipo === this.props.filtroTipo);
        }
        const tree = this.buildTree(arr);
        this.cachedTree = tree;
        this.cachedTreeData = arr;
        let openItems = { ...(this.state.openItems || {}) };
        let selectedItem = this.state.selectedItem || null;
        if (this.props.keyEdit && !this.keyEditApplied) {
            this.keyEditApplied = true;
            const cuentaSelected = arr.find(c => c.key == this.props.keyEdit);
            if (cuentaSelected) {
                selectedItem = cuentaSelected.key;
                const parts = cuentaSelected.codigo.split(".");
                while (parts.length > 1) {
                    parts.pop();
                    const parentCode = parts.join(".");
                    openItems[parentCode] = true;
                }
            }
        }
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
            tipoComprobante: "Todos",
            hoveredItem: null,
            selectedItem: null,
            selectPosition: null
        };
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

    registraNuevo() {
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
            codigo = ".1"
        }

        CuentaContableForm.open({
            cuenta_contable: {
                codigo: codigo,
                descripcion: "",
            },
            onChange: (e) => {
                const newCuenta = e?.cuenta_contable || e;
                const parts = newCuenta.codigo.split(".");
                parts.pop();
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
                        selectedItem: newCuenta.key,
                        openItems: newOpenItems
                    };
                });
                this.loadData({ forceRefresh: true });
            }
        })
    }

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
        data.forEach(item => {
            map[item.codigo] = { ...item, children: [] };
        });
        const tree = [];
        data.forEach(item => {
            let parts = item.codigo.split(".");
            let parentFound = false;
            while (parts.length > 1) {
                parts.pop();
                const parentCode = parts.join(".");
                if (map[parentCode]) {
                    map[parentCode].children.push(map[item.codigo]);
                    parentFound = true;
                    break;
                }
            }
            if (!parentFound) {
                tree.push(map[item.codigo]);
            }
        });
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
        const isSelected = this.state.selectedItem === item.key;
        const isHover = this.hoveredItemLocal === item.codigo;
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
                        codigo = item.codigo + ".1";
                    }
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
                            parts.pop();
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
                                    selectedItem: newCuenta.key,
                                    openItems: newOpenItems
                                };
                            });
                            this.loadData({ forceRefresh: true });
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
                    CuentaContableForm.open({
                        cuenta_contable: item,
                        onChange: (e) => {
                            this.loadData({ forceRefresh: true });
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
                                this.loadData({ forceRefresh: true });
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
        let backgroundColor = "transparent";
        if (isSelected) {
            backgroundColor = STheme.color.card;
        } else if (isHover) {
            backgroundColor = STheme.color.card;
        }
        return (
            <SView key={item.key} col={"xs-12"}>
                <SView
                    onPress={(evt) => {
                        const { pageX, pageY } = evt.nativeEvent;
                        this.setState({
                            selectedItem: item.key,
                            selectPosition: { x: pageX, y: pageY }
                        });
                        if (hasChildren) {
                            this.toggleItem(item.codigo);
                        }
                    }}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",

                        paddingVertical: 8,
                        minHeight: 32,
                        borderBottomWidth: 0.2,
                        borderColor: STheme.color.card,
                        backgroundColor,
                    }}
                    onMouseEnter={() => {
                        this.hoveredItemLocal = item.codigo;
                        this.forceUpdate();
                    }}
                    onMouseLeave={() => {
                        this.hoveredItemLocal = null;
                        this.forceUpdate();
                    }}
                >
                    <SView
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            paddingLeft: level * 15,
                        }}
                    >
                        <SIconApp width={14} height={14} name={hasChildren ? (isOpen ? "arrowDown" : "arrowRight") : ""} stroke={STheme.color.lightGray} fill={"transparent"} style={{ cursor: "pointer", marginLeft: 4 }} />
                        <SText numberOfLines={1}>{item.codigo} - {item.descripcion || item.tipo}</SText>
                        {/* > {item.codigo} - {item.descripcion || item.tipo} www </SText> */}

                        <SView width={15} />
                        <SView style={{ alignItems: "center" }}>
                            <SText clean style={{
                                borderWidth: 1,
                                borderColor: MDL.contabilidad.color_tipo[item.tipo],
                                backgroundColor: MDL.contabilidad.color_tipo[item.tipo] + "55",
                                fontSize: 10,
                                paddingHorizontal: 6,
                                paddingVertical: 3,
                                borderRadius: 10,
                            }}>{item.tipo}</SText>
                        </SView>
                        <SView width={10} />
                        <SView style={{ alignItems: "center" }}>
                            {item?.ajustes.map((ajuste, index) => {
                                return <AjusteTag key={ajuste?.key || index} allowDrag ajuste={ajuste} onPress={() => {
                                    AjusteTagInfoPopup.open({
                                        ajuste: ajuste,
                                        onPress: () => {
                                            this.loadData({ forceRefresh: true });
                                        }
                                    })
                                }} />
                            })}
                        </SView>
                    </SView>
                    <SView style={{ width: 100, alignItems: "center" }}>
                        <SText style={{ color: (item.tipo_comprobante ? STheme.color.text : STheme.color.lightGray + "55"), fontSize: 10, textAlign: "center" }}>{item.tipo_comprobante ? item.tipo_comprobante.toUpperCase() : "-"}</SText>
                    </SView>
                    <SView style={{ width: 80, alignItems: "center" }}> <SText style={{ color: (item.debe ? STheme.color.text : STheme.color.lightGray + "55"), fontSize: 12 }}>{SMath.formatMoney(item.debe || 0)}</SText> </SView>
                    <SView style={{ width: 80, alignItems: "center" }}> <SText style={{ color: (item.haber ? STheme.color.text : STheme.color.lightGray + "55"), fontSize: 12 }}>{SMath.formatMoney(item.haber || 0)}</SText> </SView>
                    <SView style={{ width: 80, alignItems: "center" }}> <SText style={{ color: (item.saldo ? STheme.color.text : STheme.color.lightGray + "55"), fontSize: 12 }}>{SMath.formatMoney(item.saldo || 0)}</SText> </SView>
                    <SView style={{ width: 60, alignItems: "center" }} onPress={(evt) => { FloatMenu.open({ e: evt, label: nombreCuenta, options, }); }}> <SIconApp name="drive-menu" width={10} height={10} fill={STheme.color.text} /> </SView>
                </SView>
                {isOpen && item.children.map(child => this.renderItem(child, level + 1))}
            </SView>
        );
    };

    handleSearch = (text) => {
        if (this.searchDebounceTimeout) {
            clearTimeout(this.searchDebounceTimeout);
        }
        if (!text) {
            this.cachedFilteredTree = null;
            this.cachedFilteredSearch = null;
            this.setState({
                search: "",
                openItems: {}
            });
            this.searchDebounceTimeout = null;
            return;
        }
        this.setState({ search: text });
        this.searchDebounceTimeout = setTimeout(() => {
            const tree = this.cachedTree;
            if (tree) {
                const filteredTree = this.filterTree(tree, text);
                this.cachedFilteredTree = filteredTree;
                this.cachedFilteredSearch = text;
                const allCodes = this.getAllCodesWithChildren(filteredTree);
                const openItems = {};
                for (let i = 0; i < allCodes.length; i++) {
                    openItems[allCodes[i]] = true;
                }
                this.setState({ openItems });
            }
            this.searchDebounceTimeout = null;
        }, 300);
    };

    handleSearchKeyDown = (e) => {
        const key = e?.key || e?.nativeEvent?.key;
        if (key === "Escape") {
            e?.preventDefault?.();
            e?.stopPropagation?.();
            this.resetFiltros();
        }
    };

    getAllCodesWithChildren = (nodes) => {
        const result = [];
        const stack = [...nodes];
        while (stack.length > 0) {
            const node = stack.pop();
            if (node.children && node.children.length > 0) {
                result.push(node.codigo);
                stack.push(...node.children);
            }
        }
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

    selectItem = (key) => {
        this.setState({ selectedItem: key });
    };

    render() {
        let tree = this.cachedTree;
        let filteredTree = this.cachedFilteredTree || [];

        if (!tree && this.state.cuentas.length > 0) {
            const dataArray = [...this.state.cuentas];
            dataArray.sort(this.compareCodigos);
            tree = this.buildTree(dataArray);
            this.cachedTree = tree;
        }

        if (this.state.search) {
            if (this.cachedFilteredSearch !== this.state.search && tree) {
                filteredTree = this.filterTree(tree, this.state.search);
                this.cachedFilteredTree = filteredTree;
                this.cachedFilteredSearch = this.state.search;
            }
        } else {
            filteredTree = tree || [];
            this.cachedFilteredTree = null;
            this.cachedFilteredSearch = null;
        }

        const currentTree = filteredTree;
        return (
            <SPage title={"Plan de cuentas anidadas"} hidden={this.props.select ? true : false}>
                <SView col={"xs-12"} style={{ flex: 1 }}>
                    <SView col={"xs-12"} padding={14}>
                        <SView style={{ justifyContent: "space-between", alignItems: "center" }} row>
                            <SView style={{ flex: 1, position: "relative", top: -3 }}>
                                <SView width={18} height={18} style={{ position: "absolute", top: 12, left: 2, zIndex: 1 }}>
                                    <SIconApp name="Search" width={25} height={25} fill={STheme.color.text} />
                                </SView>
                                <SInput
                                    placeholder={"Buscar cuenta..."}
                                    value={this.state.search}
                                    onChangeText={(tx) => this.handleSearch(tx)}
                                    onKeyPress={this.handleSearchKeyDown}
                                    style={{
                                        top: 4,
                                        paddingLeft: 28,
                                        height: 33,
                                        borderRadius: 4,
                                        color: "#ecfeff",
                                    }}
                                />
                            </SView>



                            <SView width={10} />
                            <SView row style={{ alignItems: "center" }}>
                                <SView width={110} height={30} >
                                    <SInput
                                        type="select2"
                                        label={"Tipo comprobaneete"}
                                        customStyle={"erp"}
                                        style={{ height: 30, width: "100%", borderRadius: 4 }}
                                        value={this.state.tipoComprobante}
                                        onKeyPress={this.handleKeyDown}
                                        options={["Todos", "Fiscal", "Interno"]}
                                        onChangeText={e => {
                                            this.tipoComprobante = e;
                                            this.setState({ tipoComprobante: e });
                                            this.loadData();
                                        }}
                                    />
                                </SView>
                                <SView width={10} />

                                <SView onPress={() => this.registraNuevo()} row card padding={8}>
                                    <SIconApp name="addFoto" width={15} height={15} fill={STheme.color.text} />
                                    <SView width={5} />
                                    <SText>Nueva cuenta</SText>
                                </SView>
                                <SView width={10} />
                                <SView onPress={() => this.expandAll(currentTree)} row card padding={8}>
                                    <SIconApp name="expand" width={15} height={15} fill={STheme.color.text} />
                                    <SView width={5} />
                                    <SText>Expandir</SText>
                                </SView>
                                <SView width={10} />
                                <SView onPress={this.collapseAll} row card padding={8}>
                                    <SIconApp name="collapse" width={15} height={15} fill={STheme.color.text} />
                                    <SView width={5} />
                                    <SText>Colapsar</SText>
                                </SView>
                            </SView>
                        </SView>
                    </SView>
                    <SView col={"xs-12"} style={{ flex: 1 }} padding={15}>


                        <SView style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: STheme.color.background,
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                            paddingVertical: 8,
                            height: 36,
                        }}>
                            <SView style={{ flex: 1, }}>
                                {/* alvaro */}
                                <SText style={{ color: STheme.color.text, fontSize: 13, fontWeight: "700", paddingLeft: 4 }}>CUENTA</SText>
                            </SView>
                            <SView style={{ width: 100, alignItems: "center", justifyContent: "center", minHeight: 32, paddingVertical: 8 }}>
                                <SText style={{ color: STheme.color.text, fontSize: 10, fontWeight: "700", textAlign: "center" }}>TIPO COMPROBANTE</SText>
                            </SView>
                            <SView style={{ width: 80, alignItems: "center" }}>
                                <SText style={{ color: STheme.color.text, fontSize: 13, fontWeight: "700" }}>DEBE</SText>
                            </SView>
                            <SView style={{ width: 80, alignItems: "center" }}>
                                <SText style={{ color: STheme.color.text, fontSize: 13, fontWeight: "700" }}>HABER</SText>
                            </SView>
                            <SView style={{ width: 80, alignItems: "center" }}>
                                <SText style={{ color: STheme.color.text, fontSize: 13, fontWeight: "700" }}>SALDO</SText>
                            </SView>
                            <SView style={{ width: 60, alignItems: "center" }}> </SView>
                        </SView>
                        <ScrollView ref={ref => this.scrollViewVertical = ref}
                            style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
                            {filteredTree.map(item => this.renderItem(item))}
                            <SHr height={65} />
                        </ScrollView>
                    </SView>
                </SView>
                <FloatButtom onPress={() => {
                    this.registraNuevo();
                }} />
                {this.props.btnSelect && this.state.selectedItem && this.state.selectPosition && (
                    <SView style={{ position: "absolute", top: this.state.selectPosition.y - 65, left: this.state.selectPosition.x + 10, zIndex: 999 }}>
                        <SView row
                            onPress={() => {
                                const cuenta = this.state.cuentas.find(
                                    c => c.key === this.state.selectedItem
                                );
                                if (this.props.select && cuenta) {
                                    this.props.select(cuenta);
                                }
                                this.setState({ selectPosition: null });
                            }}
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 16,
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