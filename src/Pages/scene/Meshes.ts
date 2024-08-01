import * as THREE from 'three';
import Model from '../../Model';
import SSocket from 'servisofts-socket';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SNotification } from 'servisofts-component';
import { AmmoType } from '../../Components/SThree/SAmmoView';
import { DBModelMesh, MeshObject } from './MeshInfo';
import GLTFLoaderCache from './GTLFLoaderCache';


type PropsType = {
    scene: THREE.Scene, key_scene: any, Ammo: AmmoType, physicsWorld: any, toRaycaster?: any[],
    glftLoaderCache: GLTFLoaderCache
}
function lerp(start: any, end: any, t: any) {
    return start + (end - start) * t;
}
function degreesToRadians(degrees: number) {
    return degrees * (Math.PI / 180);
}
function radiansToDegrees(radians: number) {
    return radians * (180 / Math.PI);
}
const slerp = (Ammo: any, q1: any, q2: any, t: any) => {
    const x1 = q1.x();
    const y1 = q1.y();
    const z1 = q1.z();
    const w1 = q1.w();

    let x2: any = q2.x();
    let y2: any = q2.y();
    let z2: any = q2.z();
    let w2: any = q2.w();

    let cosTheta = x1 * x2 + y1 * y2 + z1 * z2 + w1 * w2;

    if (cosTheta < 0) {
        x2 = -x2;
        y2 = -y2;
        z2 = -z2;
        w2 = -w2;
        cosTheta = -cosTheta;
    }

    let scale0, scale1;
    if (cosTheta > 0.9995) {
        // If the inputs are too close for comfort, linearly interpolate
        scale0 = 1 - t;
        scale1 = t;
    } else {
        const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
        const theta = Math.atan2(sinTheta, cosTheta);
        scale0 = Math.sin((1 - t) * theta) / sinTheta;
        scale1 = Math.sin(t * theta) / sinTheta;
    }

    const result = new Ammo.btQuaternion(
        scale0 * x1 + scale1 * x2,
        scale0 * y1 + scale1 * y2,
        scale0 * z1 + scale1 * z2,
        scale0 * w1 + scale1 * w2
    );
    return result;
}
export default class Meshes {
    scene: THREE.Scene;
    // gltfLoader: GLTFLoader;
    gltfLoaderCache: GLTFLoaderCache;
    mixers: Array<THREE.AnimationMixer>;
    meshes: { [key: string]: MeshObject };
    meshesBody?: any[];
    lod?: THREE.LOD;
    Ammo: AmmoType;
    physicsWorld: any;
    key_scene: any;
    lastSentTime;
    throttleDelay;
    props: PropsType;
    constructor(props: PropsType) {
        this.lastSentTime = 0;
        this.throttleDelay = 1000 / 10; // 1000 ms
        this.props = props;
        this.key_scene = props.key_scene;
        this.physicsWorld = props.physicsWorld;
        this.Ammo = props.Ammo;
        this.scene = props.scene;
        // this.gltfLoader = new GLTFLoader();
        this.gltfLoaderCache = props.glftLoaderCache;
        this.meshesBody = [];
        this.mixers = [];
        this.meshes = {};
        this.init();

    }



    async requestDataFromServer() {
        const resp: any = await SSocket.sendPromise({
            component: "scene_mesh",
            type: "getAll",
            key_scene: this.key_scene,
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
        });
        console.log(resp)
        return resp.data;
    }

    handleOnLoad = async (mesh: DBModelMesh, result: GLTF) => {
        let object = result.scene.clone(true)


        object.name = mesh.descripcion;
        // object.rotation.set(mesh?.data?.rotation?.x ?? 0, mesh?.data?.rotation?.y ?? 0, mesh?.data?.rotation?.z ?? 0);
        // object.position.set(mesh?.data?.position?.x ?? 0, mesh?.data?.position?.y ?? 0, mesh?.data?.position?.z ?? 0);
        object.scale.set(mesh?.data?.scale?.x ?? 1, mesh?.data?.scale?.y ?? 1, mesh?.data?.scale?.z ?? 1);

        object.userData["key"] = mesh.key;
        object.userData["timeMoved"] = new Date().getTime();
        object.userData["timeLoad"] = new Date().getTime();
        object.userData["deeplink"] = mesh.deeplink;
        SNotification.remove(mesh.key)
        const pmesh = {
            x: mesh?.data?.position?.x ?? 0,
            y: mesh?.data?.position?.y ?? 0,
            z: mesh?.data?.position?.z ?? 0

        }
        const rmesh = {
            x: mesh?.data?.rotation?.x ?? 0,
            y: mesh?.data?.rotation?.y ?? 0,
            z: mesh?.data?.rotation?.z ?? 0,
            w: mesh?.data?.rotation?.w ?? 0

        }
        // let physics: any[] = [];
        object.traverse((child) => {
            // console.log(child)
            // console.log(child)

            if (child.type == "PointLight") {
                // @ts-ignore
                const plight: THREE.PointLight = child;
                plight.intensity = plight.intensity * 0.001
                plight.castShadow = true;
                plight.shadow.mapSize.width = 512;
                plight.shadow.mapSize.height = 512;
                plight.shadow.bias = -0.00005;
            }

            if (child.type == "SpotLight") {
                // @ts-ignore
                const plight: THREE.SpotLight = child;
                plight.intensity = plight.intensity * 0.001
                plight.castShadow = true;
                plight.shadow.mapSize.width = 512;
                plight.shadow.mapSize.height = 512;
                plight.shadow.bias = -0.00005;
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

                const shape = this.createShape(child);
                const transform = new this.Ammo.btTransform();
                transform.setIdentity();
                // console.log(child.position.x, child.position.y, child.position.z)
                // console.log(child.position.x + pmesh.x, !pmesh.y ? child.position.y : pmesh.y, child.position.z + pmesh.z)
                // transform.setOrigin(new this.Ammo.btVector3(child.position.x + pmesh.x, !pmesh.y ? child.position.y : pmesh.y, child.position.z + pmesh.z));
                transform.setOrigin(new this.Ammo.btVector3(child.position.x + pmesh.x, child.position.y + pmesh.y, child.position.z + pmesh.z));
                const targetRotation = new this.Ammo.btQuaternion();
                const tarr = new THREE.Quaternion(rmesh.x, rmesh.y, rmesh.z, rmesh.w);
                targetRotation.setValue(tarr.x, tarr.y, tarr.z, tarr.w);
                // targetRotation.setEulerZYX(rmesh.z, rmesh.y, rmesh.x);
                transform.setRotation(targetRotation);
                const motionState = new this.Ammo.btDefaultMotionState(transform);

                const localInertia = new this.Ammo.btVector3(0, 0, 0);
                const mass = 0; // Masa 0 para cuerpos estáticos
                shape.calculateLocalInertia(mass, localInertia);
                // shape.setMargin(0.05)
                const rbInfo = new this.Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
                const body = new this.Ammo.btRigidBody(rbInfo);
                this.physicsWorld.addRigidBody(body);
                child.userData.body = body;
                child.userData.scene_mesh = mesh;
                child.userData.lastRotation = new THREE.Quaternion();
                // child.userData["timeMoved"] = new Date().getTime();
                this.meshesBody?.push(child);
                // physics.push(body);
                // this.rigidBodies.push(body);
            }
        });

        this.scene.add(object);
        this.meshes[mesh.key] = {
            data: mesh,
            mesh: object,
            key: mesh.key,
            // physics: physics
        }
        if (this.meshesLoading[mesh.key]) delete this.meshesLoading[mesh.key];
        this.props.toRaycaster?.push(object)
        if (result.animations) {
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


    meshesLoading: any = {};
    loadMesh(mesh: any) {
        this.meshesLoading[mesh.key] = true;
        SNotification.send({
            title: mesh.descripcion,
            body: "Cargando modelo",
            type: "loading",
            key: mesh.key,
        })
        try {
            this.gltfLoaderCache.load(mesh.url,
                this.handleOnLoad.bind(this, mesh),
                (progress) => { },
                error => {
                    SNotification.remove(mesh.key)
                })
        } catch (error) {
            SNotification.remove(mesh.key)
        }
    }

    onMove(obj: any) {
        const data = obj.data
        const mesh = this.meshes[data.key];
        if (this.meshesLoading[data.key]) {
            return;
        }
        if (!mesh) {
            console.log("Cargar el modelo nuevo")
            this.loadMesh(data);
        } else {
            if (obj.key_usuario != Model.usuario.Action.getKey() && new Date().getTime() - (mesh.mesh.userData.timeMoved ?? 0) > 1000) {
                // if
                const targetRotation = new this.Ammo.btQuaternion();
                const tarr = new THREE.Quaternion(data?.data?.rotation?.x ?? 0, data?.data?.rotation?.y ?? 0, data?.data?.rotation?.z ?? 0, data?.data?.rotation?.w ?? 0);
                // targetRotation.setEulerZYX(data?.data?.rotation?.z ?? 0, data?.data?.rotation?.y ?? 0, data?.data?.rotation?.x ?? 0);
                // targetRotation.setEulerZYX(degreesToRadians(data?.data?.rotation?.z ?? 0), degreesToRadians(data?.data?.rotation?.y ?? 0), degreesToRadians(data?.data?.rotation?.x ?? 0));
                // targetRotation.setEulerZYX(radiansToDegrees(data?.data?.rotation?.z ?? 0), radiansToDegrees(data?.data?.rotation?.y ?? 0), radiansToDegrees(data?.data?.rotation?.x ?? 0));
                targetRotation.setValue(tarr.x, tarr.y, tarr.z, tarr.w);


                mesh.mesh.traverse(child => {
                    // @ts-ignore
                    if (child.userData.body) {
                        const body = child.userData.body;

                        const transform = new this.Ammo.btTransform();
                        const position = transform.getOrigin();
                        const q = transform.getRotation();

                        body.getMotionState().getWorldTransform(transform);
                        const taget = new this.Ammo.btVector3(data?.data?.position?.x ?? 0, child.position.y + data?.data?.position?.y ?? 0, data?.data?.position?.z ?? 0);

                        // const currentRotation = new THREE.Quaternion(q.x(), q.y(), q.z(), q.w());
                        // const rotationDifference = currentRotation.angleTo(this.lastRotation);

                        const interpolatedX = lerp(position.x(), taget.x(), 0.5);
                        const interpolatedY = lerp(position.y(), taget.y(), 0.5);
                        const interpolatedZ = lerp(position.z(), taget.z(), 0.5);
                        const newPosition = new this.Ammo.btVector3(interpolatedX, interpolatedY, interpolatedZ);

                        const rotation = new this.Ammo.btQuaternion();
                        // const interpolatedRotation = slerp(this.Ammo, rotation, targetRotation, 0.5);

                        transform.setOrigin(newPosition);
                        transform.setRotation(targetRotation);
                        // transform.setRotation(interpolatedRotation);

                        body.setWorldTransform(transform);
                        body.getMotionState().setWorldTransform(transform);
                    }
                })
            } else {
                // console.log("esperando termine animaciones iniciales")
            }

        }
    }
    async init() {
        try {
            const data = await this.requestDataFromServer();
            Object.values(data).map(async (mesh: any) => {
                this.loadMesh(mesh);

            });
        } catch (error) {
            console.error(error)
        }

    }
    async update(delta: number) {
        if (this.meshesBody) {
            this.meshesBody.map((child) => {
                const objThree: THREE.Group = child;
                const objAmmo = child.userData.body;
                const ms = objAmmo.getMotionState();
                if (ms) {
                    const transform = new this.Ammo.btTransform();
                    ms.getWorldTransform(transform);
                    const p = transform.getOrigin();
                    const q = transform.getRotation();
                    const px = p.x();
                    const py = p.y();
                    const pz = p.z();

                    const qx = q.x();
                    const qy = q.y();
                    const qz = q.z();
                    // child.userData.
                    const currentRotation = new THREE.Quaternion(q.x(), q.y(), q.z(), q.w());
                    const rotationDifference = currentRotation.angleTo(child.userData.lastRotation);
                    if (objThree.userData.scene_mesh) {
                        if (
                            (objThree.position.x.toFixed(4) != px.toFixed(4) || objThree.position.y.toFixed(4) != py.toFixed(4) || objThree.position.z.toFixed(4) != pz.toFixed(4))
                            || rotationDifference >= 0.001
                        ) {
                            const scene_mesh = objThree.userData.scene_mesh;
                            child.userData.lastRotation.copy(currentRotation);

                            scene_mesh.data.position = {
                                x: px,
                                y: py,
                                z: pz
                            }

                            // const eulerRotation = new THREE.Euler().setFromQuaternion(currentRotation, 'XYZ');
                            // scene_mesh.data.rotation = {
                            //     x: eulerRotation.x,
                            //     y: eulerRotation.y,
                            //     z: eulerRotation.z
                            // }
                            scene_mesh.data.rotation = {
                                x: currentRotation.x,
                                y: currentRotation.y,
                                z: currentRotation.z,
                                w: currentRotation.w
                            }
                            if (new Date().getTime() - child.userData.timeMoved < 1000) {
                                this.throttledSendToServer(scene_mesh)
                            }
                        }
                    }
                    objThree.position.lerp(new THREE.Vector3(px, py, pz), 0.1);
                    objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
                    this.Ammo.destroy(transform);
                }
            });
        }


        // }
        if (this.mixers) {
            this.mixers.forEach((mixer) => {
                mixer.update(delta);
            });
        }

    }


    throttledSendToServer(mesh: any) {
        const now = Date.now();
        if (now - this.lastSentTime >= this.throttleDelay) {
            this.sendToServer(mesh);
            this.lastSentTime = now;
        }
    }
    async sendToServer(mesh: any) {
        console.log("envio al server")
        SSocket.sendPromise({
            component: "scene_mesh",
            type: "editar",
            key_scene: this.key_scene,
            key_usuario: Model.usuario.Action.getKey(),
            data: mesh
        }).then(e => {
            console.log(e);
        }).catch(e => {
            console.error(e);
        })
    }
    createShape2(mesh: any) {
        const { Ammo } = this;
        const geometry = mesh.geometry;
        const attributes = geometry.attributes;

        // Obtener la escala del objeto
        const scale = mesh.scale;

        // Crear la forma de colisión basada en la geometría
        const btShape = new Ammo.btConvexHullShape();
        for (let i = 0; i < attributes.position.count; i++) {
            const vertex = new Ammo.btVector3(
                attributes.position.getX(i) * scale.x,
                attributes.position.getY(i) * scale.y,
                attributes.position.getZ(i) * scale.z
            );
            btShape.addPoint(vertex, true);
        }
        return btShape;
    }
    createShape(mesh: any) {
        const { Ammo } = this;
        const geometry = mesh.geometry;
        const attributes = geometry.attributes;
        const index = geometry.index;

        // Obtener la escala del objeto
        const scale = mesh.scale;

        // Crear el índice de los triángulos
        const btTriangleMesh = new Ammo.btTriangleMesh();

        if (index) {
            // Si la geometría tiene un índice, utilizamos el índice para los triángulos
            for (let i = 0; i < index.count; i += 3) {
                const vertex1 = new Ammo.btVector3(
                    attributes.position.getX(index.getX(i)) * scale.x,
                    attributes.position.getY(index.getX(i)) * scale.y,
                    attributes.position.getZ(index.getX(i)) * scale.z
                );
                const vertex2 = new Ammo.btVector3(
                    attributes.position.getX(index.getX(i + 1)) * scale.x,
                    attributes.position.getY(index.getX(i + 1)) * scale.y,
                    attributes.position.getZ(index.getX(i + 1)) * scale.z
                );
                const vertex3 = new Ammo.btVector3(
                    attributes.position.getX(index.getX(i + 2)) * scale.x,
                    attributes.position.getY(index.getX(i + 2)) * scale.y,
                    attributes.position.getZ(index.getX(i + 2)) * scale.z
                );
                btTriangleMesh.addTriangle(vertex1, vertex2, vertex3, true);
            }
        } else {
            // Si no hay un índice, usamos los atributos de posición directamente
            for (let i = 0; i < attributes.position.count; i += 3) {
                const vertex1 = new Ammo.btVector3(
                    attributes.position.getX(i) * scale.x,
                    attributes.position.getY(i) * scale.y,
                    attributes.position.getZ(i) * scale.z
                );
                const vertex2 = new Ammo.btVector3(
                    attributes.position.getX(i + 1) * scale.x,
                    attributes.position.getY(i + 1) * scale.y,
                    attributes.position.getZ(i + 1) * scale.z
                );
                const vertex3 = new Ammo.btVector3(
                    attributes.position.getX(i + 2) * scale.x,
                    attributes.position.getY(i + 2) * scale.y,
                    attributes.position.getZ(i + 2) * scale.z
                );
                btTriangleMesh.addTriangle(vertex1, vertex2, vertex3, true);
            }
        }

        // Crear la forma de colisión
        const btShape = new Ammo.btBvhTriangleMeshShape(btTriangleMesh, true, true);
        return btShape;
    }



}