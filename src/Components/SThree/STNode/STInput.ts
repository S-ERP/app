import { SUuid } from "servisofts-component";
import STNode, { STConectorType } from "./STNode";
import STOutput from "./STOutput";
import InputTypes from "../ShaderEditor/InputTypes";


type inputsType = "text" | "number" | "select" | "color"


export type InputProps<E> = {
    name: string,
    label?: string,
    value: E,
    // type: inputsType,
    connectorType?: STConectorType,
    inputType?: keyof typeof InputTypes,
    options?: any[],

}
export default class STInput<E> {
    key;
    parent;
    props;
    connectOutput?: STOutput<E>;
    temp: any;
    constructor(parent: STNode, props: InputProps<E>) {
        this.key = SUuid();
        this.parent = parent;
        this.props = props;
        this.temp = {};
        parent._inputs.push(this);
    }
    eval = (): E => {
        if (this.connectOutput) return this.connectOutput.eval();
        return this.props.value;
    }

    isConnected() {
        return !!this.connectOutput
    }
    connect = (output: STOutput<E>) => {
        if (this.connectOutput) {
            this.connectOutput.disconnect(this);
        }
        output.connect(this);
        this.connectOutput = output;
    }
    disconnect() {
        if (this.connectOutput) {
            this.connectOutput.disconnect(this);
        }
        this.connectOutput = undefined;
    }
    setValue = (value: E) => {
        this.props.value = value;
    }
    toJson() {
        const output: any = !this.connectOutput ? null : this.connectOutput.toJson()
        return {
            key: this.key,
            key_node: this.parent.key,
            name: this.props.name,
            value: this.props.value,
            connectOutput: output
        }
    }

}