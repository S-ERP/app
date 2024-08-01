import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

type onLoadEvent = (data: GLTF) => void;

class GLTFLoaderCacheObject {
    url;
    glftLoader: GLTFLoader;
    obj?: GLTF;
    listaDeEspera: onLoadEvent[] = [];
    constructor(url: string, glftLoader: GLTFLoader) {
        this.url = url;
        this.glftLoader = glftLoader;
        this.load();
    }

    load() {
        this.glftLoader.load(this.url, (gltf) => {
            this.obj = gltf;
            this.listaDeEspera.forEach(_onload => {
                _onload(gltf);
            })
            this.listaDeEspera = [];
        })
    }


    setListener(onLoad: onLoadEvent) {
        if (this.obj) {
            onLoad(this.obj);
        } else {
            this.listaDeEspera.push(onLoad);
        }
    }
}

export default class GLTFLoaderCache {

    glftLoader = new GLTFLoader();
    instances: { [key: string]: GLTFLoaderCacheObject } = {}

    load(url: string, onLoad: onLoadEvent, onProgress?: (event: ProgressEvent) => void, onError?: (err: unknown) => void,) {
        if (!this.instances[url]) {
            this.instances[url] = new GLTFLoaderCacheObject(url, this.glftLoader);
        }
        this.instances[url].setListener(onLoad);
    }
}