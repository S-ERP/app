import { SUuid } from "servisofts-component";
import STInput from "./STInput";
import STNode, { STConectorType } from "./STNode";
import OutputTypes from "../ShaderEditor/OutputTypes";

export type OutputProps<E> = {
    name: string,
    label?: string,
    connectorType?: STConectorType,
    outputType?: keyof typeof OutputTypes,
    eval: () => E


}
export default class STOutput<E> {
    parent;
    props;
    key;
    connectInputs: STInput<E>[];
    temp: any;
    constructor(parent: STNode, props: OutputProps<E>) {
        this.key = SUuid();
        this.connectInputs = [];
        this.parent = parent;
        this.props = props;
        this.temp = {}
        parent._outputs.push(this);
    }
    eval =  (): E => {
        if (this.props.eval) return this.props.eval();
        throw "Eval not implement"
    }

    connect = (input: STInput<E>) => {
        this.connectInputs.push(input);
        // output
        // this.connectOutput = output;
    }
    disconnect(input: STInput<E>) {
        const index = this.connectInputs.indexOf(input);
        if (index !== -1) {
            this.connectInputs.splice(index, 1);
        }
    }
    toJson() {
        return {
            key: this.key,
            name: this.props.name,
            key_node: this.parent.key,
        }
    }
}

