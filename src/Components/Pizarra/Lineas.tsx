import React from "react";
import Linea, { LineaInstance, LineaProps } from "./Linea";
import { usePizarra } from "./Pizarra";
import { PuertoInstance } from "./Puerto";

export default class Lineas extends React.Component<{
    lineas: React.MutableRefObject<Record<string, LineaInstance>>
}> {

    state: {
        lines: { [key: string]: LineaProps }
    } = {
            lines: {}
        }
    drawLine(p: {
        portA: PuertoInstance,
        portB: PuertoInstance
    }) {
        console.log("drawline")
        const id = p.portA.nodo.id + "_" + p.portA.id + "__" + p.portB.nodo.id + "_" + p.portB.id;
        const lineInstance = this.props.lineas.current[id];
        const x1 = p.portA.nodo.translateX.value + p.portA.layout.value.x + (p.portA.layout.value.width / 2);
        const y1 = p.portA.nodo.translateY.value + p.portA.layout.value.y + (p.portA.layout.value.height / 2);
        const x2 = p.portB.nodo.translateX.value + p.portB.layout.value.x + (p.portB.layout.value.width / 2);
        const y2 = p.portB.nodo.translateY.value + p.portB.layout.value.y + (p.portB.layout.value.height / 2);
        if (lineInstance) {
            lineInstance.x1.value = x1;
            lineInstance.y1.value = y1;
            lineInstance.x2.value = x2;
            lineInstance.y2.value = y2;
            return;
        }

        this.state.lines[id] = {
            id: id, x1, y1, x2, y2,
            portA: p.portA,
            portB: p.portB,
            onCreate: (line: LineaInstance) => {
                console.log("Linea creada", line.id)
                const lineInstance = this.state.lines[line.id];

                if (!lineInstance) return;
                if (!lineInstance.portA) return;
                if (!lineInstance.portB) return;
                const idLis = Object.values(this.state.lines).findIndex(l => l.id == line.id);


                lineInstance.portA.layout.addListener(idLis + 1, (value) => {
                    if (!lineInstance.portA) return;
                    if (!lineInstance.portA) return;
                    if (!lineInstance.portB) return;
                    line.x1.value = lineInstance.portA.nodo.translateX.value + lineInstance.portA.layout.value.x + (lineInstance.portA.layout.value.width / 2);
                    line.y1.value = lineInstance.portA.nodo.translateY.value + lineInstance.portA.layout.value.y + (lineInstance.portA.layout.value.height / 2);
                    line.x2.value = lineInstance.portB.nodo.translateX.value + lineInstance.portB.layout.value.x + (lineInstance.portB.layout.value.width / 2);
                    line.y2.value = lineInstance.portB.nodo.translateY.value + lineInstance.portB.layout.value.y + (lineInstance.portB.layout.value.height / 2);

                })
                lineInstance.portB.layout.addListener(idLis + 1, (value) => {
                    if (!lineInstance.portB) return;
                    if (!lineInstance.portA) return;
                    if (!lineInstance.portB) return;
                    line.x1.value = lineInstance.portA.nodo.translateX.value + lineInstance.portA.layout.value.x + (lineInstance.portA.layout.value.width / 2);
                    line.y1.value = lineInstance.portA.nodo.translateY.value + lineInstance.portA.layout.value.y + (lineInstance.portA.layout.value.height / 2);
                    line.x2.value = lineInstance.portB.nodo.translateX.value + lineInstance.portB.layout.value.x + (lineInstance.portB.layout.value.width / 2);
                    line.y2.value = lineInstance.portB.nodo.translateY.value + lineInstance.portB.layout.value.y + (lineInstance.portB.layout.value.height / 2);

                })


                lineInstance.portA.nodo.translateX.addListener(idLis + 1, (value) => {
                    if (!lineInstance.portA) return;
                    if (!lineInstance.portB) return;
                    line.x1.value = value + lineInstance.portA.layout.value.x + (lineInstance.portA.layout.value.width / 2);
                });
                lineInstance.portA.nodo.translateY.addListener(idLis + 1, (value) => {
                    if (!lineInstance.portA) return;
                    if (!lineInstance.portB) return;
                    line.y1.value = value + lineInstance.portA.layout.value.y + (lineInstance.portA.layout.value.height / 2);
                });
                lineInstance.portB.nodo.translateX.addListener(idLis + 1, (value) => {
                    if (!lineInstance.portA) return;
                    if (!lineInstance.portB) return;
                    line.x2.value = value + lineInstance.portB.layout.value.x + (lineInstance.portB.layout.value.width / 2);
                });
                lineInstance.portB.nodo.translateY.addListener(idLis + 1, (value) => {
                    if (!lineInstance.portA) return;
                    if (!lineInstance.portB) return;
                    line.y2.value = value + lineInstance.portB.layout.value.y + (lineInstance.portB.layout.value.height / 2);
                });
            }
        }
        this.forceUpdate();

    }
    render() {
        return Object.values(this.state.lines).map((line) => {
            return <Linea {...line} key={line.id} />
        });
    }
}