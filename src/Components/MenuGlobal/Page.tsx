import React from "react";
import { View } from "react-native";
import { SHr, SNavigation, SPage, SText, STheme, SView } from "servisofts-component";
import SIconApp, { SIconAppType } from "../../Assets/SIconApp";
import { Route } from "@react-navigation/native";
import MDL from "../../MDL";



type PageProps = {
    label: string,
    url?: string,
    params?: any,
    icon?: React.ReactNode,
    children?: React.ReactNode;
    permiso?: string;
}
export default class Page extends React.Component<PageProps> {
    state = {
        open: false,
        active: false
    }
    componentDidMount(): void {
        SNavigation.addOnChangeListener(this.onNavigationChange.bind(this))
        this.onNavigationChange(SNavigation?.lastRoute?.route)
    }
    onNavigationChange(e: Route<any>) {
        if (!this.props.url) return;
        if ((e.name + "") == (this.props.url + "")) {
            this.setState({
                active: true,
            })
        } else if (this.state?.active) {
            this.setState({
                active: false,
            })
        }
        // if (this.props.url == "/") {
        //     if (e.name == this.props.url) this.setState({
        //         active: true,
        //     })
        //     else this.setState({
        //         active: false,
        //     })
        // } else {
        //     if ((e.name + "").startsWith(this.props.url + "")) {
        //         this.setState({
        //             active: true,
        //         })
        //     } else if (this.state?.active) {
        //         this.setState({
        //             active: false,
        //         })
        //     }
        // }

    }
    componentWillUnmount(): void {
        SNavigation.removeOnChangeListener(this.onNavigationChange)
    }


    inputRefs: React.RefObject<Page | null>[] = [];
    // Recorrido recursivo para encontrar todos los Inputs
    injectRefs = (children: React.ReactNode): React.ReactNode => {
        this.inputRefs = [];
        return React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return child;
            // if (child.type == Page) {
            const ref = React.createRef<Page>();
            this.inputRefs.push(ref);
            const props: PageProps = child.props || {};
            return React.cloneElement(child, {
                ref
            })
            // }
        })
    }
    permisoAceptado() {
        if (this.props.permiso) {
            // if (!MDL.rolesPermisos.getPermiso({ url: this.props.url as any, permiso: this.props.permiso })) return false
            return true;
        } else {
            // if (this.props.children > 0) {
            //     let visibles = 0;
            //     this.inputRefs.forEach(ref => {
            //         if (ref.current?.permisoAceptado()) {
            //             visibles++;
            //         }
            //     })
            //     if (visibles == 0) return false;
            // }
        }

        return true;
    }

    size = 30
    render() {
        const childrenWithRefs = this.injectRefs(this.props.children);
        if (!this.permisoAceptado()) return null;

        return <>
            <SView style={{
                marginTop: 4,
                width: "100%",
                height: this.size,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: this.state.active ? STheme.color.card : "transparent",
            }} onPress={() => {
                if (this.props.url) {
                    SNavigation.navigate(this.props.url, this.props.params);
                } else {
                    this.setState({
                        open: !this.state.open
                    })
                }
            }}>
                <View style={{ width: 4 }} />
                <View style={{
                    width: this.size - 2,
                    height: this.size - 2,
                    borderRadius: 4,
                    overflow: "hidden",
                    // backgroundColor: STheme.color.card,
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                    {this.props.icon}
                    {/* {this.props.icon ? <SIconApp name={this.props.icon} fill={STheme.color.text} /> : <SText bold style={{ opacity: 0.7 }}>{this.props.label.substring(0, 1)}</SText>} */}
                </View>
                <View style={{ width: 8 }} />
                <SText numberOfLines={1} style={{
                    flex: 1,
                }}>{this.props.label}</SText>
                <View style={{ width: 4 }} />
                {this.props.children && <SView width={10} height={10} style={{ transform: [{ rotate: this.state.open ? "90deg" : "-90deg" }] }}><SIconApp name="Back" fill={STheme.color.text} /></SView>}
                <View style={{ width: 4 }} />
            </SView>
            {this.state.open &&
                <SView style={{ paddingStart: this.size / 2, }}>
                    {childrenWithRefs}
                </SView>}
        </>
    }
}