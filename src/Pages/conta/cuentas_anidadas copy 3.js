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

const AMOUNT_COL_WIDTH = 92;
const MENU_COL_WIDTH = 44;
const ROW_HORIZONTAL_PADDING = 14;



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


    registraNuevo() {
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

        // Prioridad de colores por estado de la fila.
        let backgroundColor = "transparent";
        if (isSelected) {
            backgroundColor = "rgba(76, 119, 118, 0.35)";
        } else if (isHover) {
            backgroundColor = "rgba(90, 108, 132, 0.35)";
        }
        return (
            <SView key={item.key} col={"xs-12"}
                style={{
                    borderBottomWidth: 1,
                    borderBottomColor: "rgba(120, 183, 173, 0.35)",
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
                        paddingVertical: 11,
                        paddingHorizontal: ROW_HORIZONTAL_PADDING,
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
                        {/* <SText style={{ width: 20 }}>
                            {hasChildren ? (isOpen ? "▼" : "▶") : ""}
                        </SText> */}

                        <SView style={{ width: 20, alignItems: "center" }}>
                            <SIconApp width={13} height={13} name={hasChildren ? (isOpen ? "arrowDown" : "arrowRight") : ""} stroke={"#d1d5db"} fill={"transparent"} style={{ cursor: "pointer" }} />
                        </SView>
                        {/* <SIconApp width={15} height={15} name={hasChildren ? (isOpen ? "arrowDown" : "arrowRight") : ""} stroke={"#94a3b8"} fill={"transparent"} style={{cursor: "pointer"}}/> */}


                        {/* Texto */}
                        <SText numberOfLines={1} style={{ color: "#f1f5f9", fontWeight: "600" }}> {item.codigo} - {item.descripcion || item.tipo} </SText>
                        <SView width={10} />
                        <SView style={{ alignItems: "center" }}>
                            <SText clean style={{
                                borderWidth: 1,
                                borderColor: MDL.contabilidad.color_tipo[item.tipo],
                                backgroundColor: MDL.contabilidad.color_tipo[item.tipo] + "55",
                                color: "#f8fafc",
                                paddingVertical: 3,
                                paddingHorizontal: 6,
                                borderRadius: 5,
                                fontSize: 8,
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



                    <SView style={{ width: AMOUNT_COL_WIDTH, alignItems: "center" }}>
                        <SText style={{ color: "#e2e8f0", fontWeight: "700" }}>0</SText>
                    </SView>

                    <SView style={{ width: AMOUNT_COL_WIDTH, alignItems: "center" }}>
                        <SText style={{ color: "#e2e8f0", fontWeight: "700" }}>0</SText>
                    </SView>

                    <SView style={{ width: AMOUNT_COL_WIDTH, alignItems: "center" }}>
                        <SText style={{ color: "#e2e8f0", fontWeight: "700" }}>0</SText>
                    </SView>

                    <SView style={{ width: MENU_COL_WIDTH, alignItems: "center" }} onPress={(evt) => {
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
                        <SIconApp name="drive-menu" width={14} height={14} fill={"#e5e7eb"} />
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

        return (
            // <SPage title={"Plan de cuentas anidadas"} hidden={this.props.select ? true : false} >
            //     <SView col={"xs-12"} row padding={15} >
            //         {/* Este bloque quiero que sea fijo cuando se haga scroll */}
            //         <SView col={"xs-12"} >
            //             <SView style={{ justifyContent: "space-between" }} row>
            //                 <SView col={"xs-12 sm-8 md-8 lg-8 xl-8"}>
            //                     <SView width={25} height={25} style={{
            //                         position: "absolute",
            //                         top: 5,
            //                         left: 20
            //                     }}>
            //                         <SIconApp name="Search" width={25} height={25} fill={STheme.color.text} />
            //                     </SView>
            //                     <SInput
            //                         placeholder={"Buscar cuenta..."}
            //                         value={this.state.search}
            //                         onChangeText={(tx) => this.handleSearch(tx)}
            //                         style={{
            //                             paddingLeft: 32
            //                         }}
            //                     />
            //                 </SView>
            //                 <SView width={10} />
            //                 <SView row style={{ alignItems: "flex-end", marginTop: 5 }} >
            //                     <SView onPress={() => this.expandAll(currentTree)} row card padding={8} >
            //                         <SIconApp name="expand" width={15} height={15} fill={STheme.color.text} />
            //                         <SView width={5} />
            //                         <SText>Expandir</SText>
            //                     </SView>
            //                     <SView width={10} />
            //                     <SView onPress={this.collapseAll} row card padding={8}>
            //                         <SIconApp name="collapse" width={15} height={15} fill={STheme.color.text} />
            //                         <SView width={5} />
            //                         <SText>Colapsar</SText>
            //                     </SView>
            //                 </SView>

            //             </SView>
            //         </SView>

            //         <SHr height={10} />


            //         {/* En este bloque debería aparecer el scroll cuando la lista sea muy extensa verticalmente */}
            //         <ScrollView
            //             ref={ref => this.scrollViewVertical = ref}
            //             contentContainerStyle={{
            //                 minHeight: "100%",
            //             }}
            //         >
            //             {filteredTree.map(item => this.renderItem(item))}
            //         </ScrollView>
            //     </SView>
            // </SPage >
            <SPage title={"Plan de cuentas anidadas"} hidden={this.props.select ? true : false}>

                <SView col={"xs-12"} style={{ flex: 1, backgroundColor: "#415f71" }}>

                    {/* 🔹 HEADER FIJO */}
                    <SView col={"xs-12"} padding={15}>
                        <SView style={{ justifyContent: "space-between", alignItems: "center" }} row>

                            <SView col={"xs-12 sm-8 md-8 lg-8 xl-8"}>
                                <SView width={25} height={25} style={{
                                    position: "absolute",
                                    top: 9,
                                    left: 8,
                                    zIndex: 2,
                                }}>
                                    <SIconApp name="Search" width={20} height={20} fill={"#d1fae5"} />
                                </SView>

                                <SInput
                                    placeholder={"Buscar cuenta..."}
                                    value={this.state.search}
                                    onChangeText={(tx) => this.handleSearch(tx)}
                                    style={{
                                        paddingLeft: 36,
                                        height: 38,
                                        borderRadius: 6,
                                        borderWidth: 1,
                                        borderColor: "rgba(152, 240, 205, 0.25)",
                                        backgroundColor: "rgba(58, 166, 136, 0.35)",
                                        color: "#ecfeff",
                                    }}
                                />
                            </SView>

                            <SView width={10} />

                            <SView row style={{ alignItems: "center", marginTop: 5 }}>



                                <SView onPress={() => this.registraNuevo()} row style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 9,
                                    borderRadius: 6,
                                    backgroundColor: "#4d8f88",
                                    borderWidth: 1,
                                    borderColor: "rgba(176, 241, 220, 0.35)",
                                    alignItems: "center",
                                }}>
                                    <SIconApp name="addFoto" width={15} height={15} fill={"#effff8"} />
                                    <SView width={5} />
                                    <SText style={{ color: "#f8fafc", fontWeight: "700" }}>Nueva cuenta</SText>
                                </SView>

                                <SView width={10} />

                                <SView onPress={() => this.expandAll(currentTree)} row style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 9,
                                    borderRadius: 6,
                                    backgroundColor: "#4d8f88",
                                    borderWidth: 1,
                                    borderColor: "rgba(176, 241, 220, 0.35)",
                                    alignItems: "center",
                                }}>
                                    <SIconApp name="expand" width={15} height={15} fill={"#effff8"} />
                                    <SView width={5} />
                                    <SText style={{ color: "#f8fafc", fontWeight: "700" }}>Expandir</SText>
                                </SView>

                                <SView width={10} />

                                <SView onPress={this.collapseAll} row style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 9,
                                    borderRadius: 6,
                                    backgroundColor: "#4d8f88",
                                    borderWidth: 1,
                                    borderColor: "rgba(176, 241, 220, 0.35)",
                                    alignItems: "center",
                                }}>
                                    <SIconApp name="collapse" width={15} height={15} fill={"#effff8"} />
                                    <SView width={5} />
                                    <SText style={{ color: "#f8fafc", fontWeight: "700" }}>Colapsar</SText>
                                </SView>
                            </SView>

                        </SView>
                    </SView>



                    {/* 🔹 LISTA CON SCROLL */}
                    <SView col={"xs-12"} style={{ flex: 1 }} padding={15}>

                        <SView style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: "rgba(115, 174, 171, 0.35)",
                            borderRadius: 0,
                            overflow: "hidden",
                            backgroundColor: "rgba(72, 82, 105, 0.22)",
                        }}>
                            <SView style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: "#092039",
                                borderBottomWidth: 1,
                                borderBottomColor: "rgba(139, 196, 191, 0.30)",
                                paddingVertical: 14,
                                paddingHorizontal: ROW_HORIZONTAL_PADDING,
                            }}>
                                <SView style={{ flex: 1 }}>
                                    <SText style={{ color: "#b7c5d9", fontSize: 12, fontWeight: "700" }}>CUENTA</SText>
                                </SView>
                                <SView style={{ width: AMOUNT_COL_WIDTH, alignItems: "center" }}>
                                    <SText style={{ color: "#b7c5d9", fontSize: 12, fontWeight: "700" }}>DEBITO</SText>
                                </SView>
                                <SView style={{ width: AMOUNT_COL_WIDTH, alignItems: "center" }}>
                                    <SText style={{ color: "#b7c5d9", fontSize: 12, fontWeight: "700" }}>CREDITO</SText>
                                </SView>
                                <SView style={{ width: AMOUNT_COL_WIDTH, alignItems: "center" }}>
                                    <SText style={{ color: "#b7c5d9", fontSize: 12, fontWeight: "700" }}>SALDO</SText>
                                </SView>
                                <SView style={{ width: MENU_COL_WIDTH }} />
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
