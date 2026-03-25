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
        const arr = Object.values(resp);

        const ajustes = await MDL.contabilidad.getAjustes();
        const empresa = await MDL.empresa.getFull();

        this.setState({ ajustes: ajustes });
        arr.map((cuenta) => {
            if (cuenta.key_moneda) {
                cuenta.moneda = empresa.monedas.find((m) => m.key == cuenta.key_moneda);
            }
            cuenta.ajustes = ajustes.filter((ajuste) => ajuste?.ajuste_empresa?.key_cuenta_contable == cuenta.key);
        })

        this.setState({ cuentas: arr })
    }

    constructor(props) {
        super(props);
        this.state = {
            openItems: {}, // { codigo: true/false }
            cuentas: [],
            search: "",
            hoveredItem: null,
            selectedItem: null,
            
        };
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

                    let index = "01";
                    let childSize = 0;
                    if (hijos.length > 0) {
                        index = hijos.length + 1
                        if (index.length < 2) {
                            index = "0" + index
                        }
                        childSize = hijos[0].codigo.length
                    } else {
                        // BHuscar
                        const niveles = MDL.contabilidad.armarNiveles(this.state.cuentas);
                        const lvlPadre = item.codigo.length;
                        const indexLvl = niveles.findIndex(n => n == lvlPadre) + 1;
                        if (indexLvl > 0 && niveles[indexLvl]) {
                            childSize = niveles[indexLvl];
                        }
                        console.log("niveles", childSize)
                    }
                    let codigo = item.codigo + "." + index

                    if (codigo.length < childSize) {
                        codigo = item.codigo + "." + "0".repeat(childSize - codigo.length) + index;
                    }

                    let key_moneda = cuenta.key_moneda;
                    if (!key_moneda) {
                        let cc = cuenta;
                        while (cc.parent) {
                            cc = cc.parent;
                            key_moneda = cc.key_moneda;
                            if (key_moneda) break;
                        }
                    }

                    // const hermanas = e.dinamicTable.data.filter(r => r.codigo.startsWith(e.row.codigo + "."));
                    CuentaContableForm.open({
                        cuenta_contable: {
                            tipo: item.tipo,
                            codigo: codigo,
                            descripcion: "",
                            key_moneda: key_moneda,
                        },
                        onChange: (e) => {
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

        // 🔥 PRIORIDAD DE COLORES
        let backgroundColor = "transparent";
        if (isSelected) {
            backgroundColor = STheme.color.card; //  seleccionado
            console.log("SELECT: ", isSelected)
        } else if (isHover) {
            backgroundColor = STheme.color.card; // hover
        }
        return (
            <SView key={item.key} col={"xs-12"}
                style={{
                    // borderBottomWidth: 1,
                    //borderBottomColor: STheme.color.card
                }}>
                <SView
                    onPress={() => {
                        this.setState({ selectedItem: item.codigo });
                        // if (!isSearching && hasChildren) {
                        //     this.toggleItem(item.codigo);
                        // }
                        if (hasChildren) {
                            this.toggleItem(item.codigo);
                        }
                    }}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 10,
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
                            paddingLeft: level * 15
                        }}
                    >
                        {/* Flecha */}
                        <SText style={{ width: 20 }}>
                            {hasChildren ? (isOpen ? "▼" : "▶") : ""}
                        </SText>

                        {/* Texto */}
                        <SText numberOfLines={1}>
                            {item.codigo} - {item.descripcion || item.tipo}
                        </SText>
                        <SView width={15} />
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



                    <SView style={{ width: 80, alignItems: "center" }}>
                        <SText>0</SText>
                    </SView>

                    <SView style={{ width: 80, alignItems: "center" }}>
                        <SText>0</SText>
                    </SView>

                    <SView style={{ width: 80, alignItems: "center" }}>
                        <SText>0</SText>
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
                        <SIconApp name="drive-menu" width={15} height={15} fill={STheme.color.text} />
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
            <SPage title={"Plan de cuentas anidadas"} hidden={this.props.select ? true : false} >
                <SView col={"xs-12"} row padding={15}>
                    <SView col={"xs-12"} style={{ alignItems: "flex-end" }}>
                        <SView style={{ justifyContent: "space-between" }} row>
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
                    <SHr height={10} />
                    <SView width={25} height={25} style={{
                        position: "absolute",
                        top: 67,
                        left: 20
                    }}>
                        <SIconApp name="Search" width={25} height={25} fill={STheme.color.text} />
                    </SView>
                    <SInput
                        placeholder={"Buscar cuenta..."}
                        value={this.state.search}
                        onChangeText={(tx) => this.handleSearch(tx)}
                        style={{
                            paddingLeft: 32
                        }}
                    />
                    <SHr height={10} />

                    {/* {tree.map(item => this.renderItem(item))} */}
                    {filteredTree.map(item => this.renderItem(item))}
                </SView>
            </SPage >
        );
    }


}
