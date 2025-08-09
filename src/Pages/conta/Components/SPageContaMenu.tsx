import React from "react";
import { View } from "react-native";
import { SNavigation, SPage, SText, STheme, SView } from "servisofts-component";
import SIconApp from "../../../Assets/SIconApp";
const SizeOpen = 200;
const SizeClose = 40;

export default class SPageContaMenu extends React.Component {
    state = {
        open: true,
        urlPage: "",
    }

    onNavigationChangeListener = (state: any) => {
        this.state.urlPage = state.name;
        this.setState({ ...this.state })
    }
    componentDidMount(): void {
        SNavigation.addOnChangeListener(this.onNavigationChangeListener)
    }
    componentWillUnmount(): void {
        SNavigation.removeOnChangeListener(this.onNavigationChangeListener)
    }
    handleOpen = () => {
        this.setState({
            open: !this.state.open
        });
    }
    close = () => {
        this.setState({
            open: false
        });
    }

    render() {
        return <View style={{
            width: this.state.open ? SizeOpen : SizeClose,
            height: "100%",
            borderRightWidth: 2,
            borderRightColor: STheme.color.card,
            // backgroundColor: STheme.color.card
        }}>
            <SView width={SizeClose} padding={6} onPress={this.handleOpen} >
                <SIconApp name={"Menu"} fill={STheme.color.text} />
            </SView>
            <MenuItem parent={this}
                title={"Inicio"}
                icon={<SIconApp name={"AlertOutline"} fill={STheme.color.text} />}
                url={"/conta"}
            />
            <MenuItem parent={this}
                title={"Plan de cuentas"}
                icon={<SIconApp name={"menuAll"} fill={STheme.color.text} />}
                url={"/conta/cuentas"}
                params={null}
            />
            <MenuItem parent={this}
                title={"Dimensiones"}
                icon={<SIconApp name={"menuAll"} fill={STheme.color.text} />}
                url={"/conta/dimension"}
                params={null}
            />
            <MenuItem parent={this}
                title={"Balance general"}
                icon={<SIconApp name={"menuAll"} fill={STheme.color.text} />}
                url={"/conta/balance"}
                params={null}
            />
            <MenuItem parent={this}
                title={"Crear asiento"}
                icon={<SIconApp name={"adicional"} fill={STheme.color.text} />}
                url={"/contabilidad/asiento"}
                params={null}
            />
            <MenuItem parent={this}
                title={"Sitema antiguo"}
                icon={<SIconApp name={"crmpause"} fill={STheme.color.text} />}
                url={"/contabilidad"}
                params={null}
            />
            <SView flex/>
            <MenuItem parent={this}
                title={"Ajustes"}
                icon={<SIconApp name={"Engranaje"} fill={STheme.color.text} />}
                url={"/contabilidad/ajustes"}
                params={null}
            />

        </View>
    }
}

const MenuItem = (props: { title: string, parent: SPageContaMenu, icon: any, url?: string, params?: any }) => {

    const select= props.url === props.parent.state.urlPage;
    return <SView col={"xs-12"} height={SizeClose} row style={{
        alignItems: "center",
        backgroundColor: select ? STheme.color.card : "transparent",
    }} onPress={() => {
        SNavigation.navigate(props.url || "", props.params);
    }}>
        <SView width={SizeClose} height={SizeClose} center padding={8}>
            {props.icon}
        </SView>
        {props.parent.state.open &&
            <SView flex >
                <SText bold>{props.title}</SText>
            </SView>
        }
    </SView>
}