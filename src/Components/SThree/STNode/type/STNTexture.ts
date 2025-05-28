import * as THREE from "three";

import STInput from "../STInput";
import STNode from "../STNode";
import STOutput from "../STOutput";
import { TextureLoader } from "../../";



// const WRAP_OPTIONS = ["RepeatWrapping", "ClampToEdgeWrapping", "MirroredRepeatWrapping"] as const;
// type WrapType = typeof WRAP_OPTIONS[number];

const WRAP_OPTION = [
    { key: THREE.RepeatWrapping, content: "RepeatWrapping" },
    { key: THREE.ClampToEdgeWrapping, content: "ClampToEdgeWrapping" },
    { key: THREE.MirroredRepeatWrapping, content: "MirroredRepeatWrapping" }
]

const MINFILTER_OPTIONS = [
    { key: THREE.NearestFilter, content: "NearestFilter" },
    { key: THREE.NearestMipmapNearestFilter, content: "NearestMipmapNearestFilter" },
    { key: THREE.NearestMipMapLinearFilter, content: "NearestMipMapLinearFilter" },
    { key: THREE.LinearFilter, content: "LinearFilter" },
    { key: THREE.LinearMipMapNearestFilter, content: "LinearMipMapNearestFilter" },
    { key: THREE.LinearMipmapLinearFilter, content: "LinearMipmapLinearFilter" },

]


const MAGFILTER_OPTIONS = [
    { key: THREE.NearestFilter, content: "NearestFilter" },
    { key: THREE.LinearFilter, content: "LinearFilter" },
]
const COLOR_SPACE_OPTIONS = [
    { key: THREE.NoColorSpace, content: "NoColorSpace" },
    { key: THREE.DisplayP3ColorSpace, content: "DisplayP3ColorSpace" },
    { key: THREE.SRGBColorSpace, content: "SRGBColorSpace" },
    { key: THREE.LinearDisplayP3ColorSpace, content: "LinearDisplayP3ColorSpace" },
    { key: THREE.LinearSRGBColorSpace, content: "LinearSRGBColorSpace" },
]

export default class STNTexture extends STNode {
    width = 300
    _color = "#653616";
    output;
    // outputAlpha;
    src;
    repeatX;
    repeatY;
    offsetX;
    offsetY;
    wrapS; wrapT;
    minFilter; magFilter;
    colorSpace;
    constructor(key?: string) {
        super("STNTexture", key)
        const textureLoader = new TextureLoader()
        let texture = new THREE.Texture();
        this.src = new STInput<string>(this, {
            name: "src",
            inputType: "ITString",
            label: "src",
            value: "",
        });
        this.repeatX = new STInput<number>(this, {
            name: "repeatX",
            inputType: "ITNumber",
            label: "Repeat X",
            value: texture.repeat.x,
        });
        this.repeatY = new STInput<number>(this, {
            name: "repeatY",
            inputType: "ITNumber",
            label: "Repeat Y",
            value: texture.repeat.y,
        });
        this.offsetX = new STInput<number>(this, {
            name: "offsetX",
            inputType: "ITNumber",
            label: "Offset X",
            value: texture.offset.x,
        });
        this.offsetY = new STInput<number>(this, {
            name: "offsetY",
            inputType: "ITNumber",
            label: "Offset Y",
            value: texture.offset.y,
        });

        this.wrapS = new STInput<THREE.Wrapping>(this, {
            name: "wrapS",
            inputType: "ITSelect",
            value: texture.wrapS,
            label: "wrapS",
            options: WRAP_OPTION
        });
        this.wrapT = new STInput<THREE.Wrapping>(this, {
            name: "wrapT",
            inputType: "ITSelect",
            label: "wrapT",
            value: texture.wrapT,
            options: WRAP_OPTION
        });
        this.minFilter = new STInput<THREE.MinificationTextureFilter>(this, {
            name: "minFilter",
            inputType: "ITSelect",
            label: "minFilter",
            value: texture.minFilter,
            options: MINFILTER_OPTIONS
        });
        this.magFilter = new STInput<THREE.MagnificationTextureFilter>(this, {
            name: "magFilter",
            inputType: "ITSelect",
            label: "magFilter",
            value: texture.magFilter,
            options: MAGFILTER_OPTIONS
        });
        this.colorSpace = new STInput<THREE.ColorSpace>(this, {
            name: "colorSpace",
            inputType: "ITSelect",
            label: "colorSpace",
            value: texture.colorSpace,
            options: COLOR_SPACE_OPTIONS
        });


        this.output = new STOutput<THREE.Texture>(this, {
            name: "output",
            connectorType: "color",
            label: "Color",
            eval:  () => {
                const src = this.src.eval();
                if (src) {
                    texture = textureLoader.load(src, (textur) => {
                        console.log("Load texture")

                    })
                    texture.needsUpdate = true;
                }
                texture.repeat.x = this.repeatX.eval();
                texture.repeat.y = this.repeatY.eval();
                texture.offset.x = this.offsetX.eval();
                texture.offset.y = this.offsetY.eval();
                texture.wrapS = this.wrapS.eval();
                texture.wrapT = this.wrapT.eval();
                texture.minFilter = this.minFilter.eval();
                texture.magFilter = this.magFilter.eval();
                texture.colorSpace = this.colorSpace.eval();
                return texture;
            }
        });
        // this.outputAlpha = new STOutput<THREE.Texture>(this, {
        //     name: "outputAlpha",
        //     connectorType: "color",
        //     label: "Alpha",
        //     eval: () => {
        //         return texture;
        //     }
        // });

    }

}

