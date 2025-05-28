import React from "react";
import { SPage, SText, SView } from "servisofts-component";

type Props = {
    label: string,
    onPress?: () => void,
    type: "danger" | "primary"

}
export default class Btn extends React.Component<Props> {
    render() {
        return <SView flex card height={30} center onPress={this.props.onPress}>
            <SText>{this.props.label}</SText>
        </SView>
    }
}