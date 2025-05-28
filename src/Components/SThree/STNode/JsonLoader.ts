
// import test_json from "./test_json.json"
import { STNodeTypes, STNode } from ".";

export default class JsonLoader {

    load(test_json: any[], onLoad?: (evt: STNode[]) => void) {
        const nodeList: STNode[] = [];
        // Para Crearlos
        test_json.map((nodojson) => {
            const type = nodojson.type as keyof typeof STNodeTypes
            let CLASSTYPE = STNodeTypes[type];
            if (!CLASSTYPE) return;
            const node = new CLASSTYPE(nodojson.key);
            node.x = nodojson.x;
            node.y = nodojson.y;
            nodojson.inputs.map((inp: any) => {
                const inpnode = node._inputs.find(ni => ni.props.name == inp.name)
                if (inpnode) {
                    inpnode.key = inp.key;
                    inpnode.setValue(inp.value);
                }
            })
            nodojson.outputs.map((out: any) => {
                const outnode = node._outputs.find(ni => ni.props.name == out.name)
                if (outnode) {
                    outnode.key = out.key;
                }
            })
            nodeList.push(node);
        })

        // Para conectarlos
        test_json.map((nodojson) => {
            nodojson.inputs.map((inp: any) => {
                if (inp.connectOutput) {
                    const node = nodeList.find(n => n.key == nodojson.key);
                    const input = node?._inputs.find(ni => ni.key == inp.key);
                    if (input) {
                        const nodeTo = nodeList.find(n => n.key == inp.connectOutput.key_node);
                        if (nodeTo) {
                            const output = nodeTo._outputs.find(no => no.key == inp.connectOutput.key);
                            if (output) {
                                input.connect(output);
                            }
                        }
                    }
                }
            })
        })
        if(onLoad) onLoad(nodeList);
        return nodeList;
    }
}

