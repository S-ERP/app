import { SText } from "servisofts-component";
import STInput from "../STInput";
import STNode from "../STNode";
import STOutput from "../STOutput";
import * as THREE from "three";



export default class STNMaterialOutput extends STNode {
    _color = "#231015"
    input;
    output;
    constructor(key?: string) {
        super("STNMaterialOutput", key)
        this.input = new STInput<THREE.Material>(this, {
            name: "input",
            label: "Material",
            connectorType: "shader",
            value: new THREE.Material()
        });
        this.output = new STOutput<THREE.Material>(this, {
            name: "output",
            outputType: "OTDefault",
            eval:  () => {
                return this.input.eval();
            }
        });
    }

}

