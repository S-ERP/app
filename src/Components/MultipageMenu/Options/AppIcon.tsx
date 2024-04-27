import React from "react";
import { Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SImage, SNavigation, SText, STheme, SView } from "servisofts-component";
export default class AppIcon extends React.Component<any> {
    // onPress() {
    //     SNavigation.navigate("/loby");
    // }
    render() {
        return <TouchableOpacity style={{
            // width: "100%",
            width: 80,
            height: 80,
            justifyContent: "center",
            alignItems: "center",
        }} onPress={() => {
            SNavigation.navigate("/loby")
        }}>
            <View style={{
                borderRadius: 8,
                width: 50,
                height: 50,
                overflow: "hidden",
                backgroundColor: STheme.color.card
            }}>
                <SImage src={"https://empresa.servisofts.com/http/empresa/c9caa964-88f3-43db-88df-684ecf5c0a1b"} />
            </View>
            <View style={{ height: 8 }} />

            <Text style={{
                flex: 1,
                color: STheme.color.text,
                textAlign: "center",
                flexWrap: "nowrap",
                fontSize: 12,
            }} numberOfLines={1}>{(this.props.data.descripcion ?? "").length < 12 ? (this.props.data.descripcion ?? "S/N") : (this.props.data.descripcion ?? "").substring(0, 12) + "..."}</Text>
        </TouchableOpacity>
    }
}