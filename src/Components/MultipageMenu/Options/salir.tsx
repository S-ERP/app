import React from "react";
import { Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SIcon, SImage, SNavigation, SText, STheme, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
export default class page extends React.Component<any> {
    // onPress() {
    //     SNavigation.navigate("/loby");
    // }

    render() {
        return <TouchableOpacity style={{
            // width: "100%",
            width: 60,
            height: 60,
            justifyContent: "center",
            alignItems: "center",
        }} onPress={() => {
            SNavigation.navigate("/root")
            // if (this.props?.data?.url) {
            //     SNavigation.navigate(this.props?.data?.url, this.props?.data?.data)
            // }
        }}>
            <View style={{
                borderRadius: 8,
                width: 40,
                height: 40,
                overflow: "hidden",
                backgroundColor: STheme.color.card
            }}>
                <SIcon name="Salir" />
            </View>
            {this.props.nolabel ? null :
                <>
                    <View style={{ height: 4 }} />
                    <Text style={{
                        flex: 1,
                        color: STheme.color.text,
                        textAlign: "center",
                        flexWrap: "nowrap",
                        fontSize: 12,
                    }} numberOfLines={1}>{"Salir"}</Text>
                </>
            }
        </TouchableOpacity>
    }
}