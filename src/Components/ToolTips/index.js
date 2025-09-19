import React, { Component } from 'react';
import { Dimensions, ScrollView, Vibration } from 'react-native';
import { SHr, SIcon, SLoad, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import SMD from '../../SMD';

type ToolTips_props = {
    primary?: boolean,
    secondary?: boolean,
    danger?: boolean,
    // outline?: boolean,
    onPress?: () => void,
    loading?: boolean,
    small?: boolean,
    style?: any,
    width?: number,
    height?: number,
    // children?: any,
    type?: "info" | "question",
    flex?: number | boolean,
    color?: string,
    icon?: string,
    descripcion?: string,
    itemWidth?: number,
    itemHeight?: number,
    url?: string,
}

export default class ToolTips extends Component<ToolTips_props> {
    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    render() {
        var bgColor = this.props.primary ? STheme.color.primary : this.props.secondary ? STheme.color.secondary : this.props.danger ? STheme.color.danger : STheme.color.primary;

        let icon = "";

        var colorText = STheme.color.text;
        if (this.props.white) {
            bgColor = STheme.color.secondary;
            colorText = STheme.color.primary;
        }
        var size = {
            width: this.props.width ?? "100%",
            height: this.props.height ?? 40,
        }
        if (this.props.small) {
            size.width = 14;
            size.height = 14;
        }
        if (this.props.medium) {
            size.width = 300;
            size.height = 60;
        }
        icon = 'toolinfo';
        if (this.props.type == "question") {
            icon = 'toolquestion';
        }

        return (<SView
            {...this.props}
            height={size.height} flex={this.props.flex} style={{
                borderRadius: 8,
                width: "100%",
                width: size.width,
                // paddingLeft: 10,
                // ...(this.props.outline ? { borderWidth: 1, borderColor: bgColor } : { backgroundColor: bgColor }),
                ...(this.props.style ?? {}),
            }} center
            activeOpacity={this.props.loading ? 1 : 0.5}

            onPress={(e) => {
                Vibration.vibrate(100)
                e.currentTarget.measure((x, y, width, height, pageX, pageY) => {
                    const key_popup = "popupkey";
                    const windowheight = Dimensions.get("window").height
                    const itemWidth = this.props.itemWidth ?? 240;
                    const itemHeight = this.props.itemHeight ?? 100;
                    let top = pageY;
                    if (itemHeight + top > windowheight) {
                        top = windowheight - itemHeight;
                    }

                    let left = pageX - itemWidth + width;

                    if (left < 0) {
                        left = 0;
                    }
                    if (this.props.loading) return;
                    if (this.props.type == "info") {
                        SPopup.open({
                            content: <SView style={{
                                borderRadius: 8,
                                backgroundColor: bgColor,
                                left: left,
                                top: top,
                                width: itemWidth,
                                height: itemHeight,
                                position: "absolute",
                                overflow: "hidden", // evita que el texto se desborde
                            }} center>

                                <ScrollView >
                                    {/* <SText style={{
                                        textAlign: "center",
                                        flexWrap: "wrap",   // obliga a que el texto haga salto de línea
                                        overflow: "hidden", // evita que se salga
                                    }} color={colorText} fontSize={14} center>{this.props.descripcion}</SText> */}
                                    <SMD fontSize={12} padding={8} space={2} >{this.props.descripcion}</SMD>
                                </ScrollView>


                            </SView>,
                            key: "FormToolTips",
                            type: "2",

                        });

                    }
                    if (this.props.type == "question") {
                        SNavigation.navigate(this.props.url ?? "/");
                    }
                })
            }} >
            {this.props.loading ? <SLoad /> : <SIcon name={this.props.icon ?? icon} fill={this.props.color ?? STheme.color.text} width={this.props.width} height={this.props.height} />}
        </SView>);
    }
}
