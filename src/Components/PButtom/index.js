import React, { Component } from 'react';
import { SLoad, SText, STheme, SView } from 'servisofts-component';

type PButtom_props = {
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
    type?: "primary" | "secondary" | "danger",
    flex?: number | boolean,
}

export default class PButtom extends Component<PButtom_props> {
    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    render() {
        var bgColor = this.props.primary ? STheme.color.primary : this.props.secondary ? STheme.color.secondary : this.props.danger ? STheme.color.danger : STheme.color.primary;

        var colorText = STheme.color.info;
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

        switch (this.props.type) {
            case "primary":
                bgColor = STheme.color.primary;
                colorText = STheme.color.text;
                break;
            case "secondary":
                bgColor = STheme.color.secondary;
                colorText = STheme.color.primary;
                break;
            case "danger":
                bgColor = STheme.color.danger;
                colorText = STheme.color.white;
                break;
        }


        return (<SView
            {...this.props}
            height={size.height} flex={this.props.flex} style={{
                borderRadius: 8,
                width: "100%",
                maxWidth: size.width,
                ...(this.props.type === "primary" ? {borderColor: STheme.color.text, borderWidth: 1} : {}),
                ...(this.props.outline ? { borderWidth: 1, borderColor: bgColor } : { backgroundColor: bgColor }),
                ...(this.props.style ?? {}),
            }} center
            activeOpacity={this.props.loading ? 1 : 0.5}

            onPress={() => {
                if (this.props.loading) return;
                if (this.props.onPress) {
                    this.props.onPress();
                }
            }} >
            {this.props.loading ? <SLoad /> : <SText font={"AlbertSans"} style={{ fontWeight: 600 }} color={this.props.outline ? bgColor : colorText} >
                {this.props.children}
            </SText>}
        </SView>);
    }
}
