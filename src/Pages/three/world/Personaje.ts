import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


export default class Personaje {
    scene: THREE.Scene | THREE.Group;

    mesh = {
        "descripcion": "amongus",
        "tipo": "glb",
        "estado": 1,
        "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
        "data": {},
        "key_empresa": "c9caa964-88f3-43db-88df-684ecf5c0a1b",
        "fecha_on": "2024-07-20T05:04:41.000624",
        "key": "b395059f-273e-4ca1-8df1-6d66b043ce4e",
        "url": "http://192.168.2.1:30017/models/amongus.glb",
        "observacion": "amongus"
    }

    actions: any = {

    }
    cameraServer: any;
    constructor(scene: THREE.Scene | THREE.Group, cameraServer: any) {
        this.scene = scene;
        this.cameraServer = cameraServer
    }

    mixer?: THREE.AnimationMixer;
    handleLoad(gltf: GLTF) {
        const object = gltf.scene;
        object.name = this.mesh.descripcion;
        const data: any = this.mesh.data;
        object.rotation.set(0, Math.PI / 2, 0);
        const scl = .55
        object.scale.set(scl, scl, scl);
        object.position.set(.65, -this.scene.position.y, 0.3);

        object.traverse(child => {
            // @ts-ignore
            if (child.isMesh) {
                // @ts-ignore
                // child.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            }
        })
        // object.scale.set(data?.traansform?.scale?.x ?? 1, data?.transform?.scale?.y ?? 1, data?.transform?.scale?.z ?? 1);
        this.scene.add(object);

        if (gltf.animations) {
            if (gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(object);
                gltf.animations.forEach((clip) => {
                    const meshName = clip.name.split('.')[0];
                    const type = clip.name.split('.')[1];
                    const mesh = object.getObjectByName(meshName);
                    if (mesh && this.mixer) {
                        // Obtener propiedades personalizadas
                        const loops = mesh.userData.loops ?? 1;
                        const delay = mesh.userData.delay ?? 0;
                        // Crear la sacción de animación
                        const action = this.mixer.clipAction(clip);
                        this.actions[type] = action;

                        // console.log(action)
                        // action.setLoop(THREE.LoopRepeat, 1);
                        // action.clampWhenFinished = true;
                        // action.startAt(delay);
                        // action.play();
                    }
                    // let action = mixer.clipAction(clip).play();
                    // // console.log(clip, action)
                    // action.setLoop(THREE.LoopOnce, 1)
                });
                // this.mixers.push(mixer);
            }
        }
    }
    handleProgress(e: ProgressEvent) {

    }
    handleError(e: any) {
        console.error(e);
    }
    load() {
        const loader = new GLTFLoader();
        loader.load(this.mesh.url,
            this.handleLoad.bind(this),
            this.handleProgress.bind(this),
            this.handleError.bind(this)
        )
    }

    update(delta: number) {
        if (this.mixer) this.mixer.update(delta);
    }
}