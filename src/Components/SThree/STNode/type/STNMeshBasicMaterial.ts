import * as THREE from "three";
import STInput from "../STInput";
import STNode from "../STNode";
import STOutput from "../STOutput";



export default class STNMeshBasicMaterial extends STNode {
    _color = "#2E151C";

    color;
    map;
    alphaMap;
    wireframe;
    transparent;
    fog;
    opacity
    side

    output;
    constructor(key?: string) {
        const material = new THREE.MeshBasicMaterial();
        super("STNMeshBasicMaterial", key)
        this.color = new STInput<string>(this, {
            name: "color",
            connectorType: "color",
            inputType: "ITColor",
            label: "Color",
            value: "#" + material.color.getHexString(),
        });
        this.map = new STInput<THREE.Texture | null>(this, {
            name: "map",
            connectorType: "color",
            label: "Map",
            value: material.map,
        });
        this.alphaMap = new STInput<THREE.Texture | null>(this, {
            name: "alphaMap",
            connectorType: "value",
            label: "Alpha",
            value: material.alphaMap,
        });

        this.transparent = new STInput<boolean>(this, {
            name: "transparent",
            // connectorType: "value",
            inputType: "ITBoolean",
            label: "Transparent",
            value: material.transparent,
        });
        this.opacity = new STInput<number>(this, {
            name: "opacity",
            inputType: "ITNumber",
            connectorType: "value",
            label: "Opacity",
            value: material.opacity,
        });
        this.side = new STInput<THREE.Side>(this, {
            name: "side",
            inputType: "ITSelect",
            options: [{ key: 0, content: "FrontSide" }, { key: 1, content: "BackSide" }, { key: 2, content: "DoubleSide" }],
            label: "Side",
            value: material.side,
        });


        this.wireframe = new STInput<boolean>(this, {
            name: "wireframe",
            // connectorType: "value",
            inputType: "ITBoolean",
            label: "WireFrame",
            value: material.wireframe,
        });
        this.fog = new STInput<boolean>(this, {
            name: "fog",
            // connectorType: "value",
            inputType: "ITBoolean",
            label: "Fog",
            value: material.fog,
        });



        // OUTPUT
        this.output = new STOutput<THREE.MeshBasicMaterial>(this, {
            name: "output",
            connectorType: "shader",
            label: "Material",
            eval: () => {
                material.color = new THREE.Color(this.color.eval())
                material.wireframe = this.wireframe.eval()
                material.opacity = this.opacity.eval()
                // material.transparent = material.opacity >= 1 ? false : true
                material.transparent = this.transparent.eval();
                material.side = this.side.eval();
                material.fog = this.fog.eval();
                material.map = this.map.eval();
                material.alphaMap = this.alphaMap.eval();
                material.needsUpdate = true;
                // material.vertexColors = true
                // material.vert
                return material;
            }
        });
    }

}

