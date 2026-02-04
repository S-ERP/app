import React from "react";
import { Dimensions, FlatList, GestureResponderEvent, TouchableOpacityProps, ViewStyle } from "react-native";
import { SHr, SIcon, SPage, SPopup, SText, STheme, SView, SViewProps } from "servisofts-component";
import SIconApp from "../Assets/SIconApp";

type Option = {
    label: string,
    onPress: (e: any) => void,
    icon?: string,
}
type FloatMenuProps = {
    label?: string,
    e: GestureResponderEvent,
    height?: number,
    options: Option[],
    onClose: () => void,
    style?: ViewStyle,
    numColumns?: number
}
export default class FloatMenu extends React.Component<FloatMenuProps> {

    static open(props: FloatMenuProps) {
        const { e } = props;

        let width = 196;
        if (props?.style?.width) {
            width = (props.style.width as number) + 16;
        }
        let top = e.nativeEvent.pageY;
        const h = props.height || ((props.options.length * 40) + 50);
        if (top + h > Dimensions.get("window").height) {
            top = Dimensions.get("window").height - h;
        }
        let left = e.nativeEvent.pageX;
        if (left + width > Dimensions.get("window").width) {
            left = Dimensions.get("window").width - width;
        }

        SPopup.open({
            key: "popup_menu_alvaro",
            type: "2",
            onClose: () => {
                if (props.onClose) {
                    props.onClose();
                }
            },
            content: (
                <SView
                    withoutFeedback
                    style={[
                        {
                            position: "absolute",
                            top: top,
                            left: left,
                            backgroundColor: STheme.color.background,
                            padding: 8,
                            borderWidth: 1,
                            borderColor: STheme.color.card,
                            borderRadius: 4,
                        },
                    ]}
                    center
                >
                    <FloatMenu {...props} />
                </SView>
            ),
        });
    }
    render() {
        return <SView style={this.props.style}>
            <SView row>
                <SText flex numberOfLines={1} fontSize={11} bold>{this.props.label}</SText>
                <SView style={{
                    width: 16, height: 16,
                }} onPress={() => {
                    SPopup.close("popup_menu_alvaro");
                }}>
                    <SIconApp name="Close" fill={STheme.color.text} />
                </SView>
            </SView>
            <SHr />
            <FlatList
                data={this.props.options}
                scrollEnabled={false}
                numColumns={this.props.numColumns || 1}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item: option, index }) => (
                    <SView
                        key={index}
                        col={"xs-12"}
                        height={40}
                        flex={this.props.numColumns && this.props.numColumns > 1 ? 1 : undefined}
                        onPress={() => {
                            SPopup.close("popup_menu_alvaro");
                            option.onPress(null);
                        }}
                        style={{
                            borderTopWidth: 1,
                            borderColor: STheme.color.card,
                            alignItems: "center",
                            marginHorizontal: this.props.numColumns && this.props.numColumns > 1 ? 2 : 0,
                        }}
                        row
                    >
                        <SView width={40} height={40} center padding={8} >
                            {option.icon}
                        </SView>
                        <SView width={4} />
                        <SText flex fontSize={12} numberOfLines={1} color={STheme.color.text}>{option.label}</SText>
                    </SView>
                )}
            />
        </SView>
    }
}