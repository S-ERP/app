import React from "react";
import { View } from "react-native";
import { SHr, SNavigation, SPage, SText, STheme, SView } from "servisofts-component";
import SIconApp, { SIconAppType } from "../../Assets/SIconApp";
import { Route } from "@react-navigation/native";
import MDL from "../../MDL";
import MenuGlobal from ".";



type PageProps = {
    label: string,
    url?: string,
    params?: any,
    icon?: React.ReactNode,
    children?: React.ReactNode;
    permiso?: string;
    permiso_url?: string,
    size?: number,
}
export default class Page extends React.Component<PageProps> {
    state = {
        open: true,
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
            const ref = React.createRef<Page>();
            this.inputRefs.push(ref);
            const props: PageProps = child.props || {};
            return React.cloneElement(child, {
                ref,
                size: this.size * 0.8
            })
            // }
        })
    }
    permisoAceptado(props: PageProps) {
        if (props.permiso) {
            if (!MDL.rolesPermisos.getPermiso({ url: props.permiso_url || props.url as any, permiso: props.permiso })) return false
            return true;
        } else {
            if (props.children) {
                let validos = 0;
                React.Children.map(props.children, (child) => {
                    if (!React.isValidElement(child)) return child;
                    const props: PageProps = child.props || {};
                    if (this.permisoAceptado(child.props)) {
                        validos++;
                    }
                })
                if (validos == 0) return false;

                //     let visibles = 0;
                //     this.inputRefs.forEach(ref => {
                //         if (ref.current?.permisoAceptado()) {
                //             visibles++;
                //         }
                //     })
                //     if (visibles == 0) return false;
            }
        }

        return true;
    }

    size = this.props.size || 30
    render() {

        if (!this.permisoAceptado(this.props)) return null;

        return <>
            <SView style={{
                marginTop: 2,
                width: "100%",
                height: this.size,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: this.state.active ? STheme.color.card : "transparent",
            }} onPress={() => {
                if (this.props.url) {
                    SNavigation.navigate(this.props.url, this.props.params);
                } else {
                    if (MenuGlobal.INSTACE?._barra) {
                        if (!MenuGlobal.INSTACE?._barra.state.open) {
                            if (!this.state.open) {
                                MenuGlobal.INSTACE?._barra?.open();
                            }
                        }

                    }
                    this.setState({
                        open: !this.state.open
                    })
                }
            }}>
                <View style={{ width: 4 }} />
                <View style={{
                    width: this.size - 3,
                    height: this.size - 3,
                    borderRadius: 4,
                    overflow: "hidden",
                    backgroundColor: this.props.icon ? "transparent" : STheme.color.card,
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                    {/* {this.props.icon} */}
                    {this.props.icon ? this.props.icon : <SText bold style={{ opacity: 0.7, fontSize: 10 }}>{(this.props?.label).match(/\b\p{L}/gu)?.join("").toUpperCase()}</SText>}
                </View>
                <View style={{ width: 8 }} />
                <SText numberOfLines={1} style={{
                    flex: 1,
                    fontSize: 12,
                }}>{this.props.label}</SText>
                <View style={{ width: 4 }} />
                {this.props.children && <SView width={10} height={10} style={{ transform: [{ rotate: this.state.open ? "90deg" : "-90deg" }] }}><SIconApp name="Back" fill={STheme.color.text} /></SView>}
                <View style={{ width: 4 }} />
            </SView>
            {(this.state.open) &&
                <SView style={{ paddingStart: MenuGlobal.INSTACE?._barra?.state?.open ? this.size / 2 : this.size / 8, }}>
                    {this.injectRefs(this.props.children)}
                </SView>}
        </>
    }
}