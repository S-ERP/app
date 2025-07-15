import React from "react";
import { View } from "react-native";
import { SPage, SText, STheme } from "servisofts-component";
import NavBar from "../../../Components/NavBar";
import SPageContaMenu from "./SPageContaMenu";

type Props = {

} & typeof SPage.prototype.props
export default class SPageConta extends React.Component<Props> {
    render() {
        return <View style={{
            flex: 1,
            width: "100%",
            backgroundColor: STheme.color.background,
        }}>
            <NavBar {...this.props} />
            <View style={{
                flex: 1,
                width: "100%",
                flexDirection: "row",
            }}>
                <SPageContaMenu />
                <View style={{ flex: 1, height: "100%", }}>
                    <SPage {...this.props} hidden>
                        {this.props.children}
                    </SPage>
                </View>
            </View>
        </View>
    }
}