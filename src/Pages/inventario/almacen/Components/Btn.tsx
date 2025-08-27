import React from "react";
import { ViewStyle } from "react-native";
import { SPage, SText, STheme, SView } from "servisofts-component";

type Props = {
    label: string,
    onPress?: () => void,
    type: "danger" | "primary"

}
export default class Btn extends React.Component<Props> {
    render() {
        const styles: ViewStyle = {

        }

        if (this.props.type == "danger") {
            styles.backgroundColor = STheme.color.danger;
        }
        if (this.props.type == "primary") {
            styles.backgroundColor = STheme.color.primary;
            styles.borderColor = STheme.color.text;
            styles.borderWidth = 1;
        }
        return <SView flex card height={30} center onPress={this.props.onPress} style={styles}>
            <SText>{this.props.label}</SText>
        </SView>
    }
}