import { THREE } from "expo-three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default class Carreteras {
    scene: THREE.Scene;
    url = "http://192.168.2.1:30017/models/asfalto.glb";
    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.load();
    }

    handleLoad(gltf: GLTF) {
        const scene = gltf.scene;
        this.scene.add(scene)
        scene.traverse(e => {
            console.log(e);
            if (e.type == "Mesh") {
                e.castShadow = true;
                e.receiveShadow = true;
            }
        })
    }
    handleProgress(e: ProgressEvent) {

    }
    handleError(e: any) {
        console.error(e);
    }
    load() {
        const loader = new GLTFLoader();
        loader.load(this.url,
            this.handleLoad.bind(this),
            this.handleProgress.bind(this),
            this.handleError.bind(this)
        )
    }
}