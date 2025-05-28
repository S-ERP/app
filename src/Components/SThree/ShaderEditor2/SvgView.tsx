import React, { Ref } from "react";
import { Path, Svg } from "react-native-svg";
import { SDate, SPage, SText, SView } from "servisofts-component";

export default class SvgView extends React.Component<{ width: number, height: number}> {
    static _INSTANCE: SvgView;

    static createLine(props: { d: string }) {
        if (!SvgView._INSTANCE) return;
        SvgView._INSTANCE.instances.push({
            d: props.d
        })
        SvgView._INSTANCE.setState({ timeLoad: new SDate().toString() })
    }

    instances: any[] = [];
    state = {
        timeLoad: new SDate().toString()
    }
    constructor(props: any) {
        super(props);
        SvgView._INSTANCE = this;


    }

    render() {
        return <SView style={{ position: "absolute", width: "100%", height: "100%" }}>
            <Svg width={"100%"} height={"100%"} viewBox={`0 0 ${this.props.width} ${this.props.height}`} >
                {this.instances.map(a => {
                    return <Path d={a.d} strokeWidth={10} stroke={"#f0f"} />
                })}
            </Svg>
        </SView>
    }
}