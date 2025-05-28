// @ts-nocheck
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import * as THREE from 'three';

type onLoadEvent = (data: GLTF) => void;

class GLTFLoaderCacheObject {
    url;
    glftLoader: GLTFLoader;
    obj?: GLTF;
    listaDeEspera: onLoadEvent[] = [];
    constructor(url: string, glftLoader: GLTFLoader) {
        this.url = url;
        THREE.Ske
        this.glftLoader = glftLoader;
        this.load();
    }

    load() {
        this.glftLoader.load(this.url, (gltf) => {
            this.obj = gltf;
            this.listaDeEspera.forEach(_onload => {
                this.callOnLoad(_onload)
            })
            this.listaDeEspera = [];
        })
    }


    setListener(onLoad: onLoadEvent) {
        if (this.obj) {
            this.callOnLoad(onLoad)
        } else {
            this.listaDeEspera.push(onLoad);
        }
    }

    callOnLoad(onLoad: onLoadEvent) {
        if (this.obj) onLoad(this.cloneGltf(this.obj));
    }

    processMaterials(object) {
        object.traverse(function (node) {
            if (node.isMesh) {
                const materials = Array.isArray(node.material) ? node.material : [node.material];
                materials.forEach(material => {
                    // console.log("Revisando material", material);
                    // if (material.emissiveIntensity > 0) {
                    //     // console.log("Material emisivo encontrado", material);
                    //     material.emissiveMap = null;
                    //     material.emissiveIntensity = 0;
                    //     material.emissive.setHex(0x000000);
                    //     material.needsUpdate = true;
                    // }
                });
            }
        });
    }

    cloneGltf(gltf: GLTF) {
        const clone: GLTF = {
            // parser: gltf.parser,
            // scenes: gltf.scenes,
            // userData: gltf.userData,
            // scene: SkeletonUtils.clone(gltf.scene),
            scene: gltf.scene.clone(true),
            // scene: gltf.scene,
            animations: gltf.animations,
            // animations: gltf.animations.map(clip => clip.clone()),
            // cameras: gltf.cameras.map(camera => camera.clone()),
            // asset: Object.assign({}, gltf.asset)
        };
        if (gltf.animations.length > 0) {
            clone.scene = SkeletonUtils.clone(gltf.scene);
            clone.animations = gltf.animations.map(clip => clip.clone())
        }

        this.processMaterials(gltf.scene)

        clone.scene.traverse((child) => {
            if (child.isMesh) {
                if (Array.isArray(child.material)) {
                    child.material = child.material.map(material => {
                        return material.clone();
                    });
                } else {
                    child.material = child.material.clone();
                }
            }
        });
        // // Clonar los huesos y las mallas con el esqueleto
        // const skinnedMeshes = {};
        // gltf.scene.traverse(node => {
        //     if (node.isSkinnedMesh) {
        //         skinnedMeshes[node.name] = node;
        //     }
        // });

        // const cloneBones = {};
        // const cloneSkinnedMeshes = {};
        // clone.scene.traverse(node => {
        //     if (node.isBone) {
        //         cloneBones[node.name] = node;
        //     }
        //     if (node.isSkinnedMesh) {
        //         cloneSkinnedMeshes[node.name] = node;
        //     }
        // });

        // for (let name in skinnedMeshes) {
        //     const skinnedMesh = skinnedMeshes[name];
        //     const skeleton = skinnedMesh.skeleton;
        //     const cloneSkinnedMesh = cloneSkinnedMeshes[name];

        //     const orderedCloneBones = [];
        //     for (let i = 0; i < skeleton.bones.length; ++i) {
        //         const cloneBone = cloneBones[skeleton.bones[i].name];
        //         orderedCloneBones.push(cloneBone);
        //     }

        //     cloneSkinnedMesh.bind(
        //         new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses),
        //         cloneSkinnedMesh.matrixWorld
        //     );
        // }

        return clone;
    }

}


export default class GLTFLoaderCache {
    static INSTANCE;
    static getInstance() {
        if (!GLTFLoaderCache.INSTANCE) GLTFLoaderCache.INSTANCE = new GLTFLoaderCache();
        return GLTFLoaderCache.INSTANCE;
    }
    glftLoader = new GLTFLoader();
    instances: { [key: string]: GLTFLoaderCacheObject } = {}

    load(url: string, onLoad: onLoadEvent, onProgress?: (event: ProgressEvent) => void, onError?: (err: unknown) => void,) {
        if (!this.instances[url]) {
            this.instances[url] = new GLTFLoaderCacheObject(url, this.glftLoader);
        }
        this.instances[url].setListener(onLoad);
    }



}