import React from "react";
import { View } from "react-native";
import { SNavigation, SPage, SText, STheme } from "servisofts-component";
import Barra from "./Barra";
import { Route } from "@react-navigation/native";
import Pages from "../../Pages";

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
        SNavigation.addOnChangeListener(this.onNavigationChange.bind(this))
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

