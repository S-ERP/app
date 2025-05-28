import STInput from "../STInput";
import STNode from "../STNode";
import STOutput from "../STOutput";



export default class STNValue extends STNode {
    _color = "#6F213A";
    output;
    value;
    constructor(key?: string) {
        super("STNValue", key)
        this.value = new STInput<number>(this, {
            name: "value",
            // type: "number",
            inputType: "ITNumber",
            value: 10,
            // allowConnect: (e) => false
        });

        this.output = new STOutput<number>(this, {
            name: "output",
            connectorType: "value",
            label: "Value",
            eval: () => {
                return this.value.eval();
            }
        });

    }

}

