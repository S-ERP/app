import { SText } from "servisofts-component";
import STInput from "../STInput";
import STNode from "../STNode";
import STOutput from "../STOutput";



export default class STNPreviewValue extends STNode {
    _color = "#225421"
    input;
    output;
    constructor(key?: string) {
        super("STNPreviewValue", key)
        this.input = new STInput<string>(this, {
            name: "input",
            label: "input",
            connectorType: "value",
            // type: "text",
            value: ""
        });
        this.output = new STOutput<string>(this, {
            name: "output",
            outputType: "OTPreviewValue",
            eval:  () => {
                return this.input.eval();
            }
        });
    }

}

