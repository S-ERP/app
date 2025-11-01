import React from "react";
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { check } from "react-native-permissions";
import { SPage, SText, STheme } from "servisofts-component";
import SIconApp from "../../Assets/SIconApp";


export default class CheckBox extends React.Component<{
    style?: StyleProp<ViewStyle>,
    styleCheck?: StyleProp<ViewStyle>,
    styleUncheck?: StyleProp<ViewStyle>,
    onChange?: (checked: boolean) => void,
    defaultValue?: boolean,
    value?: boolean,

}> {
    state: { checked: boolean } = {
        checked: this.props.defaultValue ?? false
    }
    styleUncheck(): StyleProp<ViewStyle> {
        return [
            styles.default,
            {
                borderWidth: 1,
                borderColor: "gray",
                borderRadius: 4,
            },
            this.props.style,
            this.props.styleUncheck,
        ]
    }
    styleCheck(): StyleProp<ViewStyle> {
        return [
            styles.default,
            {
                // borderWidth: 1,
                // borderColor: STheme.color.success,
                borderRadius: 4,
                backgroundColor: "#258FFF"
            },
            this.props.style,
            this.props.styleCheck
        ]
    }

    componentDidUpdate(prevProps: Readonly<{ style?: StyleProp<ViewStyle>; styleCheck?: StyleProp<ViewStyle>; styleUncheck?: StyleProp<ViewStyle>; onChange?: (checked: boolean) => void; }>, prevState: Readonly<{ checked: boolean; }>, snapshot?: any): void {
        if (prevState.checked !== this.state.checked) {
            if (this.props.onChange) {
                this.props.onChange(this.state.checked);
            }
        }
    }


    render() {
        if (this.props.value !== undefined) {
            this.state.checked = this.props.value;
        }
        return <TouchableOpacity
            style={this.state.checked ? this.styleCheck() : this.styleUncheck()}
            onPress={() => {
                if (this.props.value !== undefined && this.props.onChange) {
                    this.props.onChange(!this.state.checked);
                    return;
                }
                this.setState({ checked: !this.state.checked })
            }}
        >
            {this.state.checked && <SIconApp name="bien" fill={"#fff"} />}
        </TouchableOpacity>
    }
}

const styles = StyleSheet.create({
    "default": {
        width: 16,
        height: 16,
        padding: 3,

    }
})