import React, { Component } from 'react';
import { Dimensions, Vibration } from 'react-native';
import { SHr, SIcon, SLoad, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';

type ToolTips_props = {
    primary?: boolean,
    secondary?: boolean,
    danger?: boolean,
    withe?: boolean,
    outline?: boolean,
    onPress?: () => void,
    loading?: boolean,
    small?: boolean,
    style?: any,
    width?: number,
    height?: number,
    children?: any,
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

        var colorText = STheme.color.text;
        if (this.props.white) {
            // bgColor = "#fff"
            bgColor = STheme.color.secondary;
            colorText = STheme.color.primary;
            // colorText = "red";
        }
        var size = {
            width: this.props.width ?? "100%",
            // width: this.props.width ?? 350,
            height: this.props.height ?? 40,
        }
        if (this.props.small) {
            size.width = 200;
            size.height = 40;
        }
        if (this.props.medium) {
            size.width = 300;
            size.height = 60;
        }

        // switch (this.props.type) {
        //     case "primary":
        //         bgColor = STheme.color.primary;
        //         colorText = STheme.color.text;
        //         break;
        //     case "secondary":
        //         bgColor = STheme.color.secondary;
        //         colorText = STheme.color.primary;
        //         break;
        //     case "danger":
        //         bgColor = STheme.color.danger;
        //         colorText = STheme.color.white;
        //         break;
        // }


        return (<SView
            {...this.props}
            height={size.height} flex={this.props.flex} style={{
                borderRadius: 8,
                width: "100%",
                maxWidth: size.width,
                paddingLeft: 10,
                // ...(this.props.outline ? { borderWidth: 1, borderColor: bgColor } : { backgroundColor: bgColor }),
                ...(this.props.style ?? {}),
            }} center
            activeOpacity={this.props.loading ? 1 : 0.5}

            onPress={(e) => {
                Vibration.vibrate(100)
                e.currentTarget.measure((x, y, width, height, pageX, pageY) => {
                    const key_popup = "popupkey";
                    const windowheight = Dimensions.get("window").height
                    const itemWidth = this.props.itemWidth ?? 200;
                    const itemHeight = this.props.itemHeight ?? 50;
                    let top = pageY - (height * 2.6);
                    if (itemHeight + top > windowheight) {
                        top = windowheight - itemHeight;
                    }
                    let left = pageX - itemWidth + width;
                    if (this.props.loading) return;
                    if (this.props.type == "info") {
                        // this.props.onPress();
                        SPopup.open({
                            content: <SView style={{
                                borderRadius: 8,
                                padding: 6,
                                backgroundColor: bgColor,
                                left: left,
                                top: top,
                                width: itemWidth,
                                height: itemHeight,
                                position: "absolute",
                                overflow: "hidden", // evita que el texto se desborde
                            }} center>
                                <SView scroll>
                                    <SText style={{
                                        textAlign: "center",
                                        flexWrap: "wrap",   // obliga a que el texto haga salto de línea
                                        overflow: "hidden", // evita que se salga
                                    }} color={colorText} fontSize={14} center>{this.props.descripcion}</SText>
                                </SView>
                            </SView>,
                            key: "FormToolTips",
                            type: "2",
                            // title: "Información",
                            // message: this.props.descripcion,
                        });

                    }
                    if (this.props.type == "question") {
                        SNavigation.navigate(this.props.url ?? "/" );
                    }
                })
            }} >
            {this.props.loading ? <SLoad /> : <SIcon name={this.props.icon} fill={this.props.color} width={this.props.width} height={this.props.height} />}
        </SView>);
    }
}
