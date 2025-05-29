import React from "react";
import { GestureResponderEvent, TouchableOpacityProps } from "react-native";
import { SHr, SIcon, SPage, SPopup, SText, STheme, SView, SViewProps } from "servisofts-component";

type Option = {
    label: string,
    onPress: (e: any) => void,
    icon?: string,
}
type FloatMenuProps = {
    label?: string,
    e: GestureResponderEvent,
    options: Option[],
    onClose: () => void,
}
export default class FloatMenu extends React.Component<FloatMenuProps> {

    static open(props: FloatMenuProps) {
        const { e } = props;
        SPopup.open({
            key: "popup_menu_alvaro",
            type: "2",
            onClose: () => {
                if(props.onClose) {
                    props.onClose();
                }
            },
            content: (
                <SView
                    withoutFeedback
                    style={[
                        {
                            position: "absolute",
                            top: e.nativeEvent.pageY,
                            left: e.nativeEvent.pageX,
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
        return <SView>
            <SText col={"xs-12"} numberOfLines={1} fontSize={11} bold>{this.props.label}</SText>
            <SHr />
            {this.props.options.map((option, index) => {
                return (
                    <SView
                        key={index}
                        col={"xs-12"}
                        height={40}
                        width={180}
                        onPress={() => {
                            SPopup.close("popup_menu_alvaro");
                            option.onPress(null);
                        }}
                        style={{
                            borderTopWidth: 1,
                            borderColor: STheme.color.card,
                            // paddingHorizontal: 8,
                            alignItems: "center",
                        }}
                        row
                    >
                        <SView width={40} height={40} center padding={8} >
                            {option.icon}
                        </SView>
                        <SView width={4} />
                        <SText flex fontSize={12} numberOfLines={1} color={STheme.color.text}>{option.label}</SText>
                        {/* <SView width={30} /> */}
                    </SView>
                );
            })}
        </SView>
    }
}