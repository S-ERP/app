import React from "react";
import Linea, { LineaInstance, LineaProps } from "./Linea";
import { usePizarra } from "./Pizarra";
import { PuertoInstance } from "./Puerto";

export default class Lineas extends React.Component<{
    lineas: React.MutableRefObject<Record<string, LineaInstance>>
}> {

    state: {
        lines: LineaProps[]
    } = {
            lines: []
        }
    drawLine(p: {
        portA: PuertoInstance,
        portB: PuertoInstance
    }) {
        const id = p.portA.nodo.id + "_" + p.portA.id + "__" + p.portB.nodo.id + "_" + p.portB.id;
        const lineInstance = this.props.lineas.current[id];
        
        
        // if (lineInstance) {
        //     lineInstance.x1.value = nodo.translateX.value + layout.value.x + (layout.value.width / 2);
        //     lineInstance.y1.value = nodo.translateY.value + layout.value.y + (layout.value.height / 2);
        //     lineInstance.x2.value = port.nodo.translateX.value + port.layout.value.x + (port.layout.value.width / 2);
        //     lineInstance.y2.value = port.nodo.translateY.value + port.layout.value.y + (port.layout.value.height / 2);
        //     return;
        // }
        // const lines = this.state.lines.filter(l => l.id != id);

        // this.setState(prevState => ({
        //     lines: [...lines, line]
        // }));

    }
    render() {
        return this.state.lines.map((line) => {
            return <Linea {...line} key={line.id} />
        });
    }
}