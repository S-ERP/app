import React from "react";
import { SDate, SHr, SInput, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import { DinamicTable } from "servisofts-table";
import MDL from "../../MDL";
import Config from "../../Config";
import FloatMenu from "../../Components/FloatMenu";
import SIconApp from "../../Assets/SIconApp";
import SPageConta from "./Components/SPageConta";
import InformacionDeAjustes from "./Components/InformacionDeAjustes";
import AjusteTag from "./Components/AjusteTag";
import AjusteTagInfoPopup from "./Components/AjusteInfoPopup";
import AjusteTagDropBox from "./Components/AjusteTagDropBox";
import ajustes from "../ajustes";
import CuentaContableForm from "./Components/CuentaContableForm";
import tipo from "../whatsapp/tipo";
import { Text } from "react-native";
import FiltroNiveles from "./Components/FiltroNiveles";
import { Container } from "../../Components";



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


    // state = {
    //     ajustes: [],
    //     cuentas: []
    // }
    async loadData() {
        const resp = await MDL.contabilidad.getCuentas();
        const arr = Object.values(resp);
        this.setState({ cuentas: arr })
    }

    constructor(props) {
        super(props);
        this.state = {
            openItems: {}, // { codigo: true/false }
            cuentas: [],
            search: ""
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
        const isOpen = this.state.openItems[item.codigo] || item.autoOpen;
        const hasChildren = item.children && item.children.length > 0;

        return (
            <SView key={item.key} col={"xs-12"}
                style={{
                    borderBottomWidth: 1,
                    borderBottomColor: STheme.color.card
                }}>
                <SView
                    onPress={() => hasChildren && this.toggleItem(item.codigo)}
                    style={{
                        padding: 10,
                        paddingLeft: 10 + level * 15,
                        flexDirection: "row",
                        alignItems: "center"
                    }}
                >
                    {/* Flecha */}
                    <SText style={{ width: 20 }}>
                        {hasChildren ? (isOpen ? "▼" : "▶") : ""}
                    </SText>

                    {/* Texto */}
                    <SText>
                        {item.codigo} - {item.descripcion || item.tipo}
                    </SText>
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
        this.setState({ search: text });
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
                        // 🔥 abrir automáticamente si hay match
                        autoOpen: true
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


    render() {
        // const dataArray = Object.values(this.props.data || {});
        const dataArray = this.state.cuentas;
        dataArray.sort(this.compareCodigos);
        const tree = this.buildTree(dataArray);

        //aplicar búsqueda
        const filteredTree = this.filterTree(tree, this.state.search);

        return (
            <SPage title={"Plan de cuentas anidadas"} >
                <SView col={"xs-12"} row padding={15}>
                    <SInput
                        placeholder={"Buscar cuenta..."}
                        value={this.state.search}
                        onChangeText={(tx) => this.handleSearch(tx)}
                    />
                    <SHr height={10} />
                    <SView col={"xs-12"} style={{ alignItems: "flex-end" }}>
                        <SView style={{ justifyContent: "space-between" }} row>
                            <SView onPress={() => this.expandAll(tree)}>
                                <SText>Expandir todo</SText>
                            </SView>
                            <SView width={10} />
                            <SView onPress={this.collapseAll}>
                                <SText>Colapsar todo</SText>
                            </SView>
                        </SView>
                    </SView>
                    <SHr height={10} />
                    {/* {tree.map(item => this.renderItem(item))} */}
                    {filteredTree.map(item => this.renderItem(item))}
                </SView>
            </SPage >
        );
    }


}
