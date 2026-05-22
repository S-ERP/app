import React from "react";
import { SHr, SInput, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
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
        let openItems = { ...(this.state.openItems || {}) };
        let selectedItem = this.state.selectedItem || null;
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
        console.log(grafo)
        console.log("AQUIIi")
        console.log(cuentas)
        console.log("AQUI")
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
                parts.pop(); // quitamos el último nivel
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
        const isSelected = this.state.selectedItem === item.codigo;
        const isHover = this.state.hoveredItem === item.codigo;
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
        let backgroundColor = "transparent";
        if (isSelected) {
            backgroundColor = STheme.color.card; //seleccionado
            console.log("SELECT: ", isSelected)
        } else if (isHover) {
            backgroundColor = STheme.color.card; // hover
        }
        return (
            <SView key={item.key} col={"xs-12"}
                style={{
                    paddingRight: 12,
                }}>
                <SView
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
                        // alvaro: 1,
                        paddingVertical: 1,
                        // paddingVertical: 4,
                        borderBottomWidth: 0.5,
                        borderColor: STheme.color.card,
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
                            paddingLeft: level * 15,
                            // paddingRight: level * 1,
                            // paddingRight: 50,

                            // paddingVertical: 8,
                            // paddingHorizontal: 12,

                        }}
                    >
                        <SIconApp width={14} height={14} name={hasChildren ? (isOpen ? "arrowDown" : "arrowRight") : ""} stroke={STheme.color.lightGray} fill={"transparent"} style={{ cursor: "pointer", marginLeft: 4 }} />
                        <SText numberOfLines={1}> {item.codigo} - {item.descripcion || item.tipo} </SText>
                        <SView width={15} />
                        <SView style={{ alignItems: "center" }}>
                            <SText clean style={{
                                borderWidth: 1,
                                borderColor: MDL.contabilidad.color_tipo[item.tipo],
                                backgroundColor: MDL.contabilidad.color_tipo[item.tipo] + "55",
                                padding: 3,
                                borderRadius: 4,
                                fontSize: 7
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
                    <SView style={{ width: 80, alignItems: "center", backgroundColor: STheme.color.danger }}>
                        <SText style={{ color: STheme.color.text, fontSize: 12, fontWeight: "700" }}>0</SText>
                    </SView>
                    {/* <SView style={{ width: 80, alignItems: "center" }} center>
                        <SText width={"100%"} center>220</SText>
                    </SView> */}

                    <SView style={{ width: 80, alignItems: "center", backgroundColor: STheme.color.danger }}>
                        <SText style={{ color: STheme.color.text, fontSize: 12, fontWeight: "700" }}>DEBITO</SText>
                    </SView>

                    <SView style={{ width: 80, alignItems: "center", backgroundColor: STheme.color.danger }}>
                        <SText style={{ color: STheme.color.text, fontSize: 12, fontWeight: "700" }}>DEBITO</SText>
                    </SView>

                    {/* <SView style={{ width: 50, backgroundColor: "blue" }} /> */}

                    <SView style={{ width: 50, alignItems: "center", backgroundColor: "blue" }}>
                        <SText style={{ color: STheme.color.text, fontSize: 12, fontWeight: "700" }}>SALDO</SText>
                    </SView>

                    {/* <SView style={{ width: 50, alignItems: "center" }} onPress={(evt) => {
                        FloatMenu.open({ e: evt, label: nombreCuenta, options, });
                    }}>
                        <SIconApp name="drive-menu" width={15} height={15} fill={STheme.color.text} />
                    </SView> */}
                </SView>
                {isOpen &&
                    item.children.map(child =>
                        this.renderItem(child, level + 1)
                    )}
            </SView>
        );
    };

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
                    };
                }
                return null;
            })
            .filter(Boolean);
    };

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

    selectItem = (codigo) => {
        this.setState({ selectedItem: codigo });
    };

    render() {
        const dataArray = this.state.cuentas;
        dataArray.sort(this.compareCodigos);
        const tree = this.buildTree(dataArray);
        const filteredTree = this.filterTree(tree, this.state.search);
        const currentTree = this.state.search ? filteredTree : tree;
        return (
            <SPage title={"Plan de cuentas anidadas"} hidden={this.props.select ? true : false}>
                <SView col={"xs-12"} style={{ flex: 1 }}>
                    <SView col={"xs-12"} padding={14}>
                        <SView style={{ justifyContent: "space-between" }} row>
                            <SView col={"xs-12 sm-8 md-8 lg-8 xl-8"}>
                                <SView width={18} height={18} style={{ position: "absolute", top: 12, left: 2 }}> <SIconApp name="Search" width={25} height={25} fill={STheme.color.text} /> </SView>
                                <SInput
                                    placeholder={"Buscar cuenta..."}
                                    value={this.state.search}
                                    onChangeText={(tx) => this.handleSearch(tx)}
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
                            <SView row style={{ alignItems: "flex-end", marginTop: 5 }}>
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
                            // alvaro: 1,
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                        }}>
                            <SView style={{ flex: 1 }}>
                                {/* alvaro */}
                                <SText style={{ color: STheme.color.text, fontSize: 11, fontWeight: "700" }}>CUENTA</SText>
                            </SView>
                            <SView style={{ width: 80, alignItems: "center", backgroundColor: STheme.color.danger }}>
                                <SText style={{ color: STheme.color.text, fontSize: 12, fontWeight: "700" }}>DEBITO</SText>
                            </SView>
                            <SView style={{ width: 80, alignItems: "center", backgroundColor: STheme.color.danger }}>
                                <SText style={{ color: STheme.color.text, fontSize: 12, fontWeight: "700" }}>CREDITO</SText>
                            </SView>
                            <SView style={{ width: 80, alignItems: "center", backgroundColor: STheme.color.danger }}>
                                <SText style={{ color: STheme.color.text, fontSize: 12, fontWeight: "700" }}>SALDO</SText>
                            </SView>

                            <SView style={{ width: 50, alignItems: "center", backgroundColor: "blue" }}>
                                <SText style={{ color: STheme.color.text, fontSize: 12, fontWeight: "700" }}>SALDO</SText>
                            </SView>

                            {/* <SView style={{ width: 50, backgroundColor: "blue" }} /> */}
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
                <FloatButtom onPress={() => {
                    this.registraNuevo();
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