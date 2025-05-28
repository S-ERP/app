import STInput from "../STInput";
import STNode from "../STNode";
import STOutput from "../STOutput";


export default class STNodeRGB extends STNode {
    _color="#6F213A";
    output;
    value;
    constructor(key?: string) {
        super("STNRGB", key)

        this.value = new STInput<string>(this, {
            name: "value",
            inputType: "ITColor",
            value: "#FFFFFF",
        });


        this.output = new STOutput<string>(this, {
            name: "output",
            connectorType: "color",
            label:"Color",
            eval:  () => {
                return this.value.eval();
            }
        });

    }

}

