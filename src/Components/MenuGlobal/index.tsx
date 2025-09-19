import React from "react";
import { Platform, View } from "react-native";
import { SNavigation, SPage, SText, STheme } from "servisofts-component";
import Barra from "./Barra";
import { Route } from "@react-navigation/native";
import Pages from "../../Pages";
import MDL from "../../MDL";

type MenuGlobalProps = {
    children?: React.ReactNode;
}

export default class MenuGlobal extends React.Component<MenuGlobalProps> {
    static INSTACE: MenuGlobal;
    _barra: Barra | null = null;
    state = {
        visible: true,
    }
    componentDidMount(): void {
        MenuGlobal.INSTACE = this;
        MDL.rolesPermisos.addEventListener("change", (e) => {
            this.loadData();
        })
        this.loadData();
        SNavigation.addOnChangeListener(this.onNavigationChange.bind(this))
    }
    loadData() {
        MDL.rolesPermisos.getPermisoAsync({ url: "/", permiso: "ver" }).then(() => {
            this.forceUpdate();
        }).catch(e => {
            console.error(e);
        })
    }
    onNavigationChange(e: Route<any>) {
        // @ts-ignore
        const pageClass = Pages[e.name]
        if (pageClass?.HIDDEN && this.state.visible) {
            this.setState({
                visible: false,
            })
        } else if (!pageClass?.HIDDEN && !this.state.visible) {
            this.setState({
                visible: true,
            })
        }
        // if (pageClass?.TITLE) {
        if (Platform.OS == "web") {
            // const title = MDL.empresa?.select?.razon_social || "S-ERP"
            const title = "S-ERP"
            window.document.title = title + " - " + (pageClass.TITLE || e.name);
        }
        // }

    }
    componentWillUnmount(): void {
        SNavigation.removeOnChangeListener(this.onNavigationChange)
    }
    render() {
        MenuGlobal.INSTACE = this;
        if (!this.state.visible) return this.props.children;
        return <View style={{
            flex: 1,
            width: "100%",
            flexDirection: "row"
        }}>
            <Barra ref={ref => this._barra = ref} />
            <View style={{
                flex: 1,
                height: "100%",
            }}>
                {this.props.children}
            </View>
        </View>
    }
}

