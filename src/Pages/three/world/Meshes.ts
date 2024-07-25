import * as THREE from 'three';
import Model from '../../../Model';
import SSocket from 'servisofts-socket';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TypeMeshDB } from './types';
import { SNotification } from 'servisofts-component';

export default class Meshes {
    scene: THREE.Scene;
    gltfLoader: GLTFLoader;
    mixers: Array<THREE.AnimationMixer>;
    allMeshes: any;
    lod?: THREE.LOD;
    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.gltfLoader = new GLTFLoader();
        this.mixers = [];
        this.allMeshes = [];
        this.init();

    }



    async requestDataFromServer() {
        const resp: any = await SSocket.sendPromise({
            component: "mesh",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
        });
        return resp.data;
    }

    handleOnLoad = async (mesh: TypeMeshDB, result: GLTF) => {
        const object = result.scene;

        console.log("Scene", result)



        object.traverse((child) => {
            // console.log(child)
            // console.log(child)

            if (child.type == "PointLight") {
                // @ts-ignore
                const plight: THREE.PointLight = child;
                plight.intensity = plight.intensity * 0.001
            }

            if (child.type == "SpotLight") {
                // @ts-ignore
                const plight: THREE.SpotLight = child;
                plight.intensity = plight.intensity * 0.001
            }
            // @ts-ignore
            if (child.isMesh) {

                child.castShadow = true;
                child.receiveShadow = true;
                child.frustumCulled = true;
                // child.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                // if (child.material.map) {

                //     child.material.map.anisotropy = 0.25;
                //     child.material.map.needsUpdate = true;
                // }
                // this.allMeshes.push(child);
            }
        });
        object.name = mesh.descripcion;
        object.rotation.set(mesh?.data?.transform?.rotation?.x ?? 0, mesh?.data?.transform?.rotation?.y ?? 0, mesh?.data?.transform?.rotation?.z ?? 0);
        object.position.set(mesh?.data?.transform?.position?.x ?? 0, mesh?.data?.transform?.position?.y ?? 0, mesh?.data?.transform?.position?.z ?? 0);
        object.scale.set(mesh?.data?.transform?.scale?.x ?? 1, mesh?.data?.transform?.scale?.y ?? 1, mesh?.data?.transform?.scale?.z ?? 1);
        SNotification.remove(mesh.key)
        this.scene.add(object);



        if (result.animations) {
            console.log(result.animations)
            if (result.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(object);
                this.mixers.push(mixer);
                let dur = 0;
                result.animations.forEach((clip) => {

                    // const meshName = clip.name.split('.')[0];
                    // const type = clip.name.split('.')[1];
                    // const mesh = object.getObjectByName(meshName);
                    // console.log(clip.name, meshName, mesh?.userData, mesh)
                    // if (mesh) {
                    // Obtener propiedades personalizadas
                    // const loops = mesh.userData.loops ?? 1;
                    // const delay = mesh.userData.delay ?? 0;

                    // Crear la sacción de animación
                    const action = mixer.clipAction(clip);

                    // Configurar la repetición y el retraso
                    // action.setLoop(THREE.LoopRepeat, 1);
                    // action.clampWhenFinished = true;
                    // action.startAt(dur);
                    action.play();
                    dur += clip.duration
                    // }
                    // let action = mixer.clipAction(clip).play();
                    // // console.log(clip, action)
                    // action.setLoop(THREE.LoopOnce, 1)
                });

            }
        }
    }

    async init() {
        try {
            const data = await this.requestDataFromServer();
            Object.values(data).map(async (mesh: any) => {
                SNotification.send({
                    title: mesh.descripcion,
                    body: "Cargando modelo",
                    type: "loading",
                    key: mesh.key,
                })

                try {
                    this.gltfLoader.load(mesh.url,
                        this.handleOnLoad.bind(this, mesh),
                        (progress) => { },
                        error => {
                            SNotification.remove(mesh.key)
                        })
                } catch (error) {
                    SNotification.remove(mesh.key)
                }
            });
        } catch (error) {

        }

    }
    async update(delta: number) {
        if (this.mixers) {
            this.mixers.forEach((mixer) => {
                mixer.update(delta);
            });
        }

    }
}