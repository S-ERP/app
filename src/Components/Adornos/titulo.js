import React, { Component } from 'react';
import { SHr, SIcon, SImage, SText, STheme, SUuid, SView } from 'servisofts-component';
import STextPlay from '../STextPlay';
type PropsType = {
    label: any,
}
export default class index extends Component<PropsType> {
    static defaultProps = {
        size: 40
    }
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        // return <SText col={"xs-12"} style={{
        //     position: "absolute",
        //     top: 2,
        //     left: 2,
        // }} color={STheme.color.lightGray} fontSize={10}>{this.props.label}</SText>

        return <>
            {/* <SView col={"xs-12"} center>
                <SImage src={require('../../Assets/png/franja.png')} style={{ width: " 100%", height: 50, borderRadius: 100, resizeMode: "contain" }} />
            </SView> */}   
            <SView col={"xs-9"} center style={{ padding: 15, borderRadius: 25, borderWidth: 3, borderColor: STheme.color.card, height: 140, backgroundColor: STheme.color.card }}  >
                <STextPlay center key={SUuid()} time={this.props.time ?? 30} col={"xs-12"} color={STheme.color.text} fontSize={this.props.fontSize} bold>{this.props.label}</STextPlay>
            </SView>

            <SView col={"xs-8"} style={{ position: "relative", top: -6, left: 10, zIndex: 9 }}>
                <SIcon name="cola" width={35} height={24} fill={STheme.color.card} stroke={STheme.color.card} />
            </SView>

            {/* <SView col={"xs-12"} center>
                <SImage src={require('../../Assets/png/franja.png')} style={{ width: " 100%", height: 50, borderRadius: 100, resizeMode: "contain" }} />
            </SView> */}
        </>
    }
}