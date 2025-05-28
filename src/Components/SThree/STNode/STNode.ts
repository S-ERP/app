import { SUuid } from "servisofts-component";
import STInput from "./STInput";
import STOutput from "./STOutput";
import { STNodeTypes } from ".";



export type STConectorType = "value" | "color" | "vector" | "shader"
export const STConectorTypeColor: { [key in STConectorType]: string } = {
    color: "#BBBF20",
    shader: "#54C050",
    value: "#918F90",
    vector: "#4F4AB6"
}

export default class STNode {
    width = 200;
    _color="#666666"
    type;
    key;
    x = 0;
    y = 0;
    _inputs: STInput<any>[];
    _outputs: STOutput<any>[];
    constructor(type: keyof typeof STNodeTypes, key?: string) {
        this.type = type;
        this.key = key ?? SUuid();
        this._inputs = [];
        this._outputs = [];
    }

    toJson() {
        return {
            type: this.type,
            key: this.key,
            x: this.x,
            y: this.y,
            inputs: this._inputs.map(i => i.toJson()),
            outputs: this._outputs.map(o => o.toJson()),
        }
    }

}

