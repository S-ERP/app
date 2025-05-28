import React  from "react";
import Svg from "react-native-svg";
import { Path, PathProps } from "react-native-svg";
import { SDate, SPage, SText, SView } from "servisofts-component";


export const buildLinePath = ({ size = 0, x = 0, y = 0, ny = 0, nx = 0 }) => {
    // const { nx, ny } = value.value;
    return `M ${x + (size / 2)} ${y + (size / 2)}
        C ${(x + nx) / 2} ${y}, 
          ${(x + nx) / 2} ${ny}, 
          ${nx + (size / 2)} ${ny + (size / 2)}`
}

export default class SvgView extends React.Component<{ width: number, height: number }> {
    instances: any = {};
    constructor(props: any) {
        super(props);

    }

    createPath(props: PathProps, key: string) {
        this.instances[key] = props
        this.setState({ ...this.state })
    }
    removePath(key: string) {
        if (!this.instances[key]) return;
        delete this.instances[key]
        this.setState({ ...this.state })
    }
    clear() {
        // if (!this.instances[key]) return;
        this.instances = {};
        this.setState({ ...this.state })
    }


    render() {
        return <SView style={{ position: "absolute", width: "100%", height: "100%" }}>
            <Svg width={"100%"} height={"100%"} viewBox={`0 0 ${this.props.width} ${this.props.height}`} fill={"transparent"} >
                {Object.values(this.instances).map((a: any) => {
                    return <Path {...a} />
                })}
            </Svg>
        </SView>
    }
}