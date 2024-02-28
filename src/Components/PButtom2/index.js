import React, { Component } from 'react';
import { SLoad, SText, STheme, SView } from 'servisofts-component';

type PButtom2_props = {
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
}

export default class PButtom extends Component<PButtom2_props> {
    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    render() {
        var bgColor = STheme.color.darkGray;
        var colorText = STheme.color.white;
        if (this.props.withe) {
            bgColor = "#fff"
            colorText = STheme.color.primary;
        }
        var size = {
            width: this.props.width ?? 300,
            height: this.props.height ?? 65,
        }
        if (this.props.small) {
            size.width = 100;
            size.height = 30;
        }
        return (<SView height={size.height} style={{
            borderBottomWidth:4,
            borderBottomColor: STheme.color.black,
            borderRadius: 40,
            width: 300,
            maxWidth: size.width,
            backgroundColor: bgColor,
            // ...(this.props.outline ? { borderWidth: 1, borderColor: bgColor } : { backgroundColor: bgColor }),
        }} center
            activeOpacity={this.props.loading ? 1 : 0.5}
            {...this.props}
            onPress={() => {
                if (this.props.loading) return;
                if (this.props.onPress) {
                    this.props.onPress();
                }
            }} >
            {this.props.loading ? <SLoad /> : <SText fontSize={22} {...this.props} color={this.props.outline ? bgColor : colorText} >
                {/* {this.props.children} */}
                
                </SText>}
        </SView>);
    }
}
