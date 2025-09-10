import React from "react";
import Linea, { LineaInstance, LineaProps } from "./Linea";
import { usePizarra } from "./Pizarra";
import { PuertoInstance } from "./Puerto";
import { SharedValue } from "react-native-reanimated";

export default class Lineas extends React.Component<{
    lineas: React.MutableRefObject<Record<string, LineaInstance>>,
    scale: SharedValue<number>,
}> {

    state: {
        lines: { [key: string]: LineaProps }
    } = {
            lines: {}
        }


        
    drawLineParams(p: {
        portA: PuertoInstance,
        portB: PuertoInstance
    }) {

        // + ((p.portA.layout.value.width / this.props.scale.value) / 2);
        // + ((p.portA.layout.value.height / this.props.scale.value) / 2);
        // + ((p.portB.layout.value.width / this.props.scale.value) / 2);
        // + ((p.portB.layout.value.height / this.props.scale.value) / 2);

        const x1 = p.portA.nodo.translateX.value + (p.portA.layout.value.x) - ((p.portA.layout.value.width) / 2);
        const y1 = p.portA.nodo.translateY.value + (p.portA.layout.value.y) - ((p.portA.layout.value.height) / 2);
        const x2 = p.portB.nodo.translateX.value + (p.portB.layout.value.x) - ((p.portB.layout.value.width) / 2);
        const y2 = p.portB.nodo.translateY.value + (p.portB.layout.value.y) -((p.portB.layout.value.height) / 2);
        return { id: p.portA.nodo.id + "_" + p.portA.id + "__" + p.portB.nodo.id + "_" + p.portB.id, x1, y1, x2, y2 }
    }
    drawLine(p: {
        portA: PuertoInstance,
        portB: PuertoInstance
    }) {
        console.log("drawline")
        const id = p.portA.nodo.id + "_" + p.portA.id + "__" + p.portB.nodo.id + "_" + p.portB.id;

        const calc = this.drawLineParams(p);

        const lineInstance = this.props.lineas.current[id];
        if (lineInstance) {
            lineInstance.x1.value = calc.x1;
            lineInstance.y1.value = calc.y1;
            lineInstance.x2.value = calc.x2;
            lineInstance.y2.value = calc.y2;
            return;
        }

        this.state.lines[id] = {
            id: id, x1: calc.x1, y1: calc.y1, x2: calc.x2, y2: calc.y2,
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
                    if (!lineInstance.portB) return;
                    // console.log("lineInstance.portA.layout.addListener")
                    const calcal = this.drawLineParams({ portA: lineInstance.portA, portB: lineInstance.portB });
                    line.x1.value = calcal.x1;
                    line.y1.value = calcal.y1;
                    line.x2.value = calcal.x2;
                    line.y2.value = calcal.y2;
                })

                lineInstance.portB.layout.addListener(idLis + 1, (value) => {
                    if (!lineInstance.portB) return;
                    if (!lineInstance.portA) return;
                    // console.log("lineInstance.portB.layout.addListener")
                    const calcal = this.drawLineParams({ portA: lineInstance.portA, portB: lineInstance.portB });
                    line.x1.value = calcal.x1;
                    line.y1.value = calcal.y1;
                    line.x2.value = calcal.x2;
                    line.y2.value = calcal.y2;

                })


                lineInstance.portA.nodo.translateX.addListener(idLis + 1, (value) => {
                    if (!lineInstance.portA) return;
                    if (!lineInstance.portB) return;

                    const calcal = this.drawLineParams({ portA: lineInstance.portA, portB: lineInstance.portB });
                    line.x1.value = calcal.x1;
                });
                lineInstance.portA.nodo.translateY.addListener(idLis + 1, (value) => {
                    if (!lineInstance.portA) return;
                    if (!lineInstance.portB) return;

                    const calcal = this.drawLineParams({ portA: lineInstance.portA, portB: lineInstance.portB });
                    line.y1.value = calcal.y1;
                });
                lineInstance.portB.nodo.translateX.addListener(idLis + 1, (value) => {
                    if (!lineInstance.portA) return;
                    if (!lineInstance.portB) return;

                    const calcal = this.drawLineParams({ portA: lineInstance.portA, portB: lineInstance.portB });
                    line.x2.value = calcal.x2;
                });
                lineInstance.portB.nodo.translateY.addListener(idLis + 1, (value) => {
                    if (!lineInstance.portA) return;
                    if (!lineInstance.portB) return;
                    const calcal = this.drawLineParams({ portA: lineInstance.portA, portB: lineInstance.portB });
                    line.y2.value = calcal.y2;
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