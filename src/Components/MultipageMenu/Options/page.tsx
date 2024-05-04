import React from "react";
import { Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SImage, SNavigation, SText, STheme, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
export default class page extends React.Component<any> {
    // onPress() {
    //     SNavigation.navigate("/loby");
    // }

    render() {
        const api: any = SSocket.api
        return <TouchableOpacity style={{
            // width: "100%",
            width: 80,
            height: 80,
            justifyContent: "center",
            alignItems: "center",
        }} onPress={() => {
            if (this.props?.data?.url) {
                SNavigation.navigate(this.props?.data?.url, this.props?.data?.data)
            }
        }}>
            <View style={{
                borderRadius: 8,
                width: 50,
                height: 50,
                overflow: "hidden",
                backgroundColor: STheme.color.card
            }}>
                <SImage style={{
                    resizeMode: "cover"
                }} src={api.roles_permisos + "page/" + this.props?.data?.key_page} />
            </View>
            {this.props.nolabel ? null :
                <>
                    <View style={{ height: 8 }} />
                    <Text style={{
                        flex: 1,
                        color: STheme.color.text,
                        textAlign: "center",
                        flexWrap: "nowrap",
                        fontSize: 12,
                    }} numberOfLines={1}>{(this.props.data.descripcion ?? "").length < 16 ? (this.props.data.descripcion ?? "S/N") : (this.props.data.descripcion ?? "").substring(0, 12) + "..."}</Text>
                </>
            }
        </TouchableOpacity>
    }
}