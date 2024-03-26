import React, { Component } from 'react';
import { SIcon, SLoad, SText, STheme, SView } from 'servisofts-component';

type PButtom3_props = {
    primary?: boolean,
    secondary?: boolean,
    withe?: boolean,
    outline?: boolean,
    onPress?: () => void,
    loading?: boolean,
    small?: boolean,
    style?: any,
    width?: number,
    height?: number,
    bg?: string,
    icon?: any,

}

export default class PButtom3 extends Component<PButtom3_props> {
    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    render() {
        console.log("this.props.bg")
        console.log(this.props)
        var bgColor = this.props.bg ? this.props.bg : STheme.color.primary;
        var colorText = STheme.color.white;
        if (this.props.withe) {
            bgColor = "#fff"
            colorText = STheme.color.primary;
        }
        var size = {
            width: this.props.width ?? 350,
            height: this.props.height ?? 55,
        }
        if (this.props.small) {
            size.width = 90;
            size.height = 27;
        }
        return (<SView height={size.height} row style={{
            borderRadius: 12,
            width: "100%",
            maxWidth: size.width,
            ...(this.props.outline ? { borderWidth: 1, borderColor: bgColor } : { backgroundColor: bgColor }),
        }} center
            activeOpacity={this.props.loading ? 1 : 0.5}
            {...this.props}
            onPress={() => {
                if (this.props.loading) return;
                if (this.props.onPress) {
                    this.props.onPress();
                }
            }} >
            <SIcon name={this.props.icon} width={17} height={17} fill={colorText} />
            <SView width={5} />
            <SText {...this.props} color={this.props.outline ? bgColor : colorText} >
                {/* {this.props.children} */}
            </SText>
        </SView>);
    }
}
