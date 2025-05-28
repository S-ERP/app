import * as THREE from 'three';
import { AmmoType } from '../../Components/SThree/SAmmoView/index.native';
import GLTFLoaderCache from './GTLFLoaderCache';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import { GLTF, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader';
import { SNotification } from 'servisofts-component';
import { TextureLoader } from '../../Components/SThree';
import Sprite from './Sprite';
import SpriteTexture from './SpriteTexture';
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';


type PropsType = {
    scene: THREE.Scene,
    key_scene: any,
    Ammo: AmmoType,
    physicsWorld: any,
    toRaycaster?: any[],
    glftLoaderCache: GLTFLoaderCache
}

export default class Meshes extends THREE.Group {
    props: PropsType;

    data: { [key: string]: MeshItem }
    constructor(props: PropsType) {
        super();
        this.name = "Meshes"
        this.props = props;
        this.init();
        this.data = {};
        props.scene.add(this);

    }

    loadMesh(mesh: any) {
        if (this.data[mesh.key]) return;
        this.data[mesh.key] = new MeshItem({ data: mesh, group: this, ...this.props, });
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
    async requestDataFromServer() {
        const resp: any = await SSocket.sendPromise({
            component: "scene_mesh",
            type: "getAll",
            key_scene: this.props.key_scene,
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
        });
        return resp.data;
    }
    update(delta: number) {
        Object.values(this.data).forEach(e => {
            e.update(delta)
        })
        // throw new Error('Method not implemented.');
    }
    onMove(obj: any) {
        if (obj?.data?.estado == 0) {
            console.log("removiendo el objeto start")
            if (this.data[obj?.data?.key].group) {
                const group = this.data[obj?.data?.key].group;
                if (group) {
                    console.log("removiendo el objeto")
                    this.remove(group);
                    if (this.data[obj?.data?.key].body) {
                        this.props.physicsWorld.removeRigidBody(this.data[obj?.data?.key].body)
                    }
                    if (this.props.toRaycaster) {
                        const index = this.props.toRaycaster.findIndex(a => a?.userData?.key == obj?.data?.key)
                        if (index !== -1) {
                            this.props.toRaycaster.splice(index, 1);
                        }
                    }

                    delete this.data[obj?.data?.key];
                }

            }
            return;
        }
        if (this.data[obj?.data?.key]) {

            if (Model.usuario.Action.getKey() == obj.key_usuario) return;
            this.data[obj?.data?.key].onMove(obj.data);
        } else {
            this.loadMesh(obj.data)
        }
        // throw new Error('Method not implemented.');
    }

}



type MeshItemPropsType = {
    data: any,
    group: THREE.Group,
} & PropsType

export class MeshItem {

    props: MeshItemPropsType;
    group?: THREE.Group;
    mixer?: THREE.AnimationMixer;
    gltf?: GLTF;
    body?: any;
    sprites: SpriteTexture[] = [];
    constructor(props: MeshItemPropsType) {
        this.props = props;

        if (props.data.tipo == "text") {
            this.loadText();
        } else {
            this.loadGLTF();
        }
    }
    normaliceLight(light: any) {
        light.intensity = light.intensity * 0.001
        light.castShadow = true;
        light.shadow.mapSize.width = 128;
        light.shadow.mapSize.height = 128;
        light.shadow.bias = -0.001;
        // light.shadow.bias = -0.009;
        // light.shadow.bias = -0.00005;
    }

    handleOnLoad(gltf: GLTF) {
        SNotification.remove(this.props.data.key)
        const object: THREE.Group = gltf.scene;
        this.group = object;
        this.gltf = gltf;
        object.name = this.props.data.descripcion;
        object.userData["key"] = this.props.data.key;
        object.userData["dbtype"] = "mesh_scene";
        object.userData["timeMoved"] = new Date().getTime();
        object.userData["timeLoad"] = new Date().getTime();
        object.userData["deeplink"] = this.props.data.deeplink;

        object.scale.set(this.props.data?.data?.scale?.x ?? 1, this.props.data?.data?.scale?.y ?? 1, this.props.data?.data?.scale?.z ?? 1);
        object.position.set(this.props.data?.data?.position?.x ?? 1, this.props.data?.data?.position?.y ?? 1, this.props.data?.data?.position?.z ?? 1);
        object.rotation.set(this.props.data?.data?.rotation?.x ?? 1, this.props.data?.data?.rotation?.y ?? 1, this.props.data?.data?.rotation?.z ?? 1);
        // this.processMaterials(object)
        object.traverse((child: any) => {

            if (child.type == "PointLight" || child.type == "SpotLight") this.normaliceLight(child)
            if (child.type == "Mesh") {
                const mesh: THREE.Mesh = child;

                if (!this.isPlane(child)) {
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    mesh.frustumCulled = true;
                    if (this.props.data.tipo != "text") {
                        this.createBody(mesh, object)
                    }

                } else {
                    mesh.receiveShadow = true;
                    mesh.castShadow = false;
                }


                const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                materials.forEach((material: any) => {
                    if (material.transparent) {
                        const opacity = material.opacity;
                        if (mesh.castShadow) {
                            mesh.castShadow = opacity > 0.3; // Desactivar la sombra si la opacidad es muy baja    
                        }

                    }
                    // for (const key in material) {
                    //     if (material[key]?.isTexture) {
                    //         console.log("Textura encontrada")
                    //         const oldTexture = material[key];
                    //         oldTexture.wrapS = THREE.RepeatWrapping;
                    //         oldTexture.wrapT = THREE.RepeatWrapping;
                    //         oldTexture.repeat.set(100, 100); // Ajusta según sea necesario
                    //         oldTexture.needsUpdate = true;
                    //         material.needsUpdate = true;
                    //     }
                    // }
                    this.applySprite(material)
                })

            }

            // if(child.type == "")

        })

        if (this.props.data?.data?.texture) {
            this.changeTexture(this.props.data?.data?.texture)
        }

        if (this.props.toRaycaster) this.props.toRaycaster.push(object)
        this.loadAnimations(gltf)
        this.props.group.add(object)
        this.applyModify(this.props.data.data ?? {});
    }

    loadAnimations(gltf: GLTF) {
        const object: THREE.Group = gltf.scene;
        if (gltf.animations) {
            if (gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(object);
                const action = this.mixer.clipAction(gltf.animations[0]);
                action.play();
            }
        }
    }
    onMove(obj: any) {

        if (!this.group) return;
        if (this.props.data.key == obj.key) {
            if (obj?.data?.texture) {
                if (this.props?.data?.data?.texture != obj?.data?.texture) {
                    this.changeTexture(obj?.data?.texture);
                    return;
                } else {
                }
            }
            if (obj?.data?.text) {
                if (this.props?.data?.data?.text != obj?.data?.text) {
                    this.changeText(obj?.data?.text, false);
                    return;
                } else {
                }
            }

            this.props.data = obj;
            this.group.position.set(this.props.data?.data?.position?.x ?? 1, this.props.data?.data?.position?.y ?? 1, this.props.data?.data?.position?.z ?? 1);
            this.group.scale.set(this.props.data?.data?.scale?.x ?? 1, this.props.data?.data?.scale?.y ?? 1, this.props.data?.data?.scale?.z ?? 1);
            this.group.rotation.set(this.props.data?.data?.rotation?.x ?? 1, this.props.data?.data?.rotation?.y ?? 1, this.props.data?.data?.rotation?.z ?? 1);

            // this.group.scale.lerp(new THREE.Vector3(this.props.data?.data?.scale?.x ?? 1, this.props.data?.data?.scale?.y ?? 1, this.props.data?.data?.scale?.z ?? 1), 0.2);
            // this.group.position.lerp(new THREE.Vector3(this.props.data?.data?.position?.x ?? 1, this.props.data?.data?.position?.y ?? 1, this.props.data?.data?.position?.z ?? 1), 0.2);
            // this.group.rotation.set(
            //     THREE.MathUtils.lerp(this.group.rotation.x, this.props.data?.data?.rotation?.x ?? 1, 0.2),
            //     THREE.MathUtils.lerp(this.group.rotation.y, this.props.data?.data?.rotation?.y ?? 1, 0.2),
            //     THREE.MathUtils.lerp(this.group.rotation.z, this.props.data?.data?.rotation?.z ?? 1, 0.2)
            // );

            if (this.props.data.data.child_modify) {
                this.applyModify(this.props.data.data);
            }

        }
    }

    applyChildModifyRecursive(modify: any, obj: any) {
        if (typeof modify != "object") return;
        // console.log("Aplicando modificadior al objeto", obj.name)
        Object.keys(modify).forEach(k => {
            if (k == "child_modify") {
                this.applyChildModify(modify[k])
                return;
            };
            let modval = modify[k];
            if (modval === null) return;
            if (typeof modval != "object") {
                // console.log(k, modval)
                if (k == "color") {
                    const hexPattern = /^#?([0-9A-F]{6})$/i;

                    // Verifica si el valor en obj[k] es un string y coincide con el patrón hexadecimal
                    if (typeof modval === 'string' && hexPattern.test(modval)) {
                        const hexValue = modval.replace('#', ''); // Remover el '#' si está presente
                        obj[k].setHex(parseInt(hexValue, 16)); // Convertir a número hexadecimal y establecer el color
                    } else if (typeof modval === 'number') {
                        obj[k].setHex(modval);
                    } else {
                        console.error("El valor no es un hexadecimal válido");
                    }

                } else {
                    // console.log("Apllico modificador", k, modval)
                    obj[k] = modval;
                }
            } else {

                if (k == "material") {
                    let material = obj[k]
                    Object.keys(modval).map(k2 => {
                        if (Array.isArray(material)) {
                            material = material.find(mat => mat.name == k)
                        }
                        this.applyChildModifyRecursive(modval[k2], material)
                    })

                } else {
                    if (!obj[k]) {
                        // console.log(k, obj[k])
                        obj[k] = {}
                    }
                    this.applyChildModifyRecursive(modval, obj[k])
                }

            }

        })
    }
    applyChildModify(childModify: any) {
        if (!childModify) return;
        if (this.group) this.group.userData.child_modify = childModify;
        Object.keys(childModify).map(name => {
            const obj: any = this.group?.getObjectByName(name);
            if (!obj) return;
            const modify = childModify[name];
            this.applyChildModifyRecursive(modify, obj);
            // Object.keys(modify).forEach(k => {
            //     obj[k] = modify[k];
            // })
        })

    }
    applyModify(modify: any) {
        if (!modify) return;
        // if (this.group) this.group.userData = modify;
        this.applyChildModifyRecursive(modify, this.group);
        // Object.keys(modify).map(key => {
        //     if (key == "child_modify") {
        //         this.applyChildModify(modify[key])
        //     } else {


        //     }

        // })

    }
    moveObject({ x = 0, y = 0, z = 0 }) {
        const mesh = this?.group;
        if (!mesh) return;
        mesh.position.set(x, y, z);
        this.throttledSendToServer()
    }
    rotateObject({ x = 0, y = 0, z = 0 }) {
        const mesh = this?.group;
        if (!mesh) return;
        mesh.rotation.set(x, y, z);
        this.throttledSendToServer()
    }
    scaleObject({ x = 0, y = 0, z = 0 }) {
        const mesh = this?.group;
        if (!mesh) return;
        mesh.scale.set(x, y, z);
        this.throttledSendToServer()
    }

    applySprite(material: THREE.Material) {
        if (material.userData.sprite_time) {
            console.log("Aplico el sprite")
            const row = material.userData.sprite_row;
            const col = material.userData.sprite_col;
            const time = material.userData.sprite_time;
            //@ts-ignore
            const map: any = material.map;
            if (map) {
                // console.log("material", material)
                const sprite2 = new SpriteTexture({ texture: map, col: col, row: row, tileDisplayDuration: time });
                this.sprites.push(sprite2);
            }

        }
    }
    changeText(text: string, send: boolean) {
        this.props.data.data.text = text;
        if (send) {
            this.throttledSendToServer()
        }

        const meshText = this.group?.children[0] as THREE.Mesh;
        if (meshText) {
            meshText.geometry.dispose();

            // Crea una nueva geometría con el nuevo texto
            const textGeometry = new TextGeometry(text, {
                font: this.font,
                size: 0.1,
                height: 0.01,
                curveSegments: 12,
            });
            textGeometry.center();
            // Asigna la nueva geometría al mesh
            meshText.geometry = textGeometry;
        }
    }
    changeTexture(url: string) {
        // if (!this._props) return;
        const mesh = this.group;
        const key = this.props.data.key;
        console.log("Cambiando la textura")
        if (!mesh) return;

        const textureLoader = new TextureLoader();
        textureLoader.load(url, (newTexture) => {
            // newTexture.
            mesh.traverse((e: any) => {
                if (e.isMesh) {
                    const materials = Array.isArray(e.material) ? e.material : [e.material];
                    materials.forEach((material: any, i: any) => {
                        for (const key in material) {
                            if (material[key]?.isTexture) {
                                const oldTexture = material[key];

                                // // Crear una nueva textura y copiar todas las propiedades
                                // const clonedTexture = new THREE.Texture(newTexture.image, oldTexture.mapping);
                                // newTexture.set
                                // clonedTexture.needsUpdate = true;

                                // clonedTexture.rotation = oldTexture.rotation;
                                // clonedTexture.repeat.copy(oldTexture.repeat);
                                // clonedTexture.offset.copy(oldTexture.offset);
                                // clonedTexture.center.copy(oldTexture.center);
                                // clonedTexture.wrapS = oldTexture.wrapS;
                                // clonedTexture.wrapT = oldTexture.wrapT;
                                // clonedTexture.minFilter = oldTexture.minFilter;
                                // clonedTexture.magFilter = oldTexture.magFilter;
                                // clonedTexture.anisotropy = oldTexture.anisotropy;
                                // // @ts-ignore
                                // clonedTexture.normalScale = oldTexture.normalScale ? oldTexture.normalScale.clone() : undefined;

                                // // Copiar otras propiedades relevantes
                                newTexture.flipY = oldTexture.flipY;
                                newTexture.premultiplyAlpha = oldTexture.premultiplyAlpha;
                                newTexture.format = oldTexture.format;
                                newTexture.type = oldTexture.type;

                                // newTexture.wrapS = THREE.RepeatWrapping;
                                // newTexture.wrapT = THREE.RepeatWrapping;
                                // newTexture.repeat.set(3, 3); // Ajusta según sea necesario
                                // newTexture.needsUpdate = true;

                                // // @ts-ignore
                                // clonedTexture.encoding = oldTexture.encoding;
                                // clonedTexture.generateMipmaps = oldTexture.generateMipmaps;

                                // clonedTexture.userData = oldTexture.userData;
                                // // Asignar la nueva textura clonada al material
                                // material[key] = clonedTexture;
                                material[key] = newTexture;
                            }
                        }
                        this.applySprite(material)
                    });
                }
            })
            // console.log(newTexture);

        })

        this.props.data.data.texture = url;
        this.throttledSendToServer()
    }
    isPlane(mesh: THREE.Mesh) {
        if (mesh.geometry instanceof THREE.PlaneGeometry) {
            return true;
        }
        if (!mesh.geometry) return false;
        // Verificar manualmente las propiedades geométricas
        const vertices = mesh.geometry.attributes.position.array;
        if (!mesh.geometry.index) return false;
        const faces = mesh.geometry.index.array;

        if (vertices.length === 12 && faces.length === 6) { // 4 vértices (3 coordenadas c/u) y 2 caras (3 índices c/u)
            return true;
        }

        return false;
    }
    transform: any;
    createBody(child: any, parent: THREE.Group) {
        const { Ammo } = this.props;
        console.log(child.type, child);

        // Crear la forma de colisión para Ammo.js
        const shape = createShape(child, Ammo);

        // Crear un nuevo transform para Ammo.js
        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();

        // Obtener la posición global del hijo directamente
        const childWorldPosition = new THREE.Vector3();
        child.getWorldPosition(childWorldPosition);

        // Establecer la posición global del hijo en Ammo.js
        this.transform.setOrigin(new Ammo.btVector3(
            childWorldPosition.x,
            childWorldPosition.y,
            childWorldPosition.z
        ));

        // Obtener la rotación global del hijo directamente
        const childWorldQuaternion = new THREE.Quaternion();
        child.getWorldQuaternion(childWorldQuaternion);
        // Establecer la rotación global en Ammo.js
        const targetRotation = new Ammo.btQuaternion(childWorldQuaternion.x, childWorldQuaternion.y, childWorldQuaternion.z, childWorldQuaternion.w);
        this.transform.setRotation(targetRotation);
        // Obtener la escala global acumulada
        const childWorldScale = new THREE.Vector3();
        child.getWorldScale(childWorldScale);
        // Crear el motion state para Ammo.js
        const motionState = new Ammo.btDefaultMotionState(this.transform);

        // Ajustar la escala de la forma de colisión utilizando la escala global acumulada
        shape.setLocalScaling(new Ammo.btVector3(childWorldScale.x, childWorldScale.y, childWorldScale.z));
        const localInertia = new Ammo.btVector3(0, 0, 0);
        const mass = 0; // Masa 0 para cuerpos estáticos
        shape.calculateLocalInertia(mass, localInertia);
        // Crear el cuerpo rígido en Ammo.js
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
        this.body = new Ammo.btRigidBody(rbInfo);

        // Asignar un identificador al cuerpo
        // @ts-ignore
        this.body.threeObject = {
            deeplink: this?.props?.data?.deeplink
        };
        this.props.physicsWorld.addRigidBody(this.body);

        // Asignar el cuerpo rígido al hijo para futuras referencias
        child.userData.body = this.body;
    }

    transformBodyToMesh(mesh: THREE.Mesh, body: any) {
        const { Ammo } = this.props;

        // Obtener las transformaciones actuales del mesh
        const currentWorldPosition = new THREE.Vector3();
        mesh.getWorldPosition(currentWorldPosition);

        const currentWorldQuaternion = new THREE.Quaternion();
        mesh.getWorldQuaternion(currentWorldQuaternion);

        const currentWorldScale = new THREE.Vector3();
        mesh.getWorldScale(currentWorldScale);

        // Verificar si los parámetros del mesh han cambiado
        const hasPositionChanged = !mesh.userData.prevPosition || !mesh.userData.prevPosition.equals(currentWorldPosition);
        const hasRotationChanged = !mesh.userData.prevQuaternion || !mesh.userData.prevQuaternion.equals(currentWorldQuaternion);
        const hasScaleChanged = !mesh.userData.prevScale || !mesh.userData.prevScale.equals(currentWorldScale);

        // Solo actualizar el cuerpo de Ammo.js si alguno de los parámetros ha cambiado
        if (hasPositionChanged || hasRotationChanged || hasScaleChanged) {
            // Actualizar posición
            console.log("Actualizo la fisica")
            this.transform.setOrigin(new Ammo.btVector3(
                currentWorldPosition.x,
                currentWorldPosition.y,
                currentWorldPosition.z
            ));

            // Actualizar rotación
            const targetRotation = new Ammo.btQuaternion(currentWorldQuaternion.x, currentWorldQuaternion.y, currentWorldQuaternion.z, currentWorldQuaternion.w);
            this.transform.setRotation(targetRotation);

            // Actualizar escala
            body.getCollisionShape().setLocalScaling(new Ammo.btVector3(currentWorldScale.x, currentWorldScale.y, currentWorldScale.z));

            // Actualizar las transformaciones almacenadas en userData para futuras comparaciones
            mesh.userData.prevPosition = currentWorldPosition.clone();
            mesh.userData.prevQuaternion = currentWorldQuaternion.clone();
            mesh.userData.prevScale = currentWorldScale.clone();
        }
    }
    font?: any;
    async loadText() {
        const loader = new FontLoader();
        const INSTANCE = this;
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
            INSTANCE.font = font;
            const textGeometry = new TextGeometry(INSTANCE.props.data?.data?.text ?? "Nuevo Texto", {
                font: font,
                size: 0.1,
                height: 0.01,
                curveSegments: 12,
                // bevelEnabled: true,
            });
            textGeometry.center();
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            // textMesh.position.y = 1

            // textMesh.position.x = 1
            // textMesh.rotation.y = Math.PI
            const group = new THREE.Group();
            group.add(textMesh);
            const parser: any = null;
            INSTANCE.handleOnLoad({
                animations: [],
                asset: {},
                cameras: [],
                parser: null as any,
                scene: group,
                scenes: [],
                userData: {}

            })

            // mesh.add(textMesh);

        })
    }
    async loadGLTF() {
        SNotification.send({
            title: this.props.data.descripcion,
            body: "Cargando modelo",
            type: "loading",
            key: this.props.data.key,
        })
        this.props.glftLoaderCache.load(this.props.data.url,
            this.handleOnLoad.bind(this),
            (progress) => { },
            error => {
                SNotification.remove(this.props.data.key)
            })
    }

    lastSentTime = 0;
    throttleDelay = 1000 / 20
    throttledSendToServer() {
        if (!this.props.data) return;

        const now = Date.now();
        if (now - this.lastSentTime >= this.throttleDelay) {
            if (!this.props.data.data) {
                this.props.data.data = {}
            }
            if (this.group) {
                if (this.group.userData) {
                    this.props.data.data = {
                        ...this.props.data.data,
                        ...this.group.userData
                    }
                    if (this.props.data.data.timeMoved) delete this.props.data.data.timeMoved
                    if (this.props.data.data.timeLoad) delete this.props.data.data.timeLoad
                    if (this.props.data.data.sendServer !== null) delete this.props.data.data.sendServer
                    if (this.props.data.data.key) delete this.props.data.data.key
                    if (this.props.data.data.dbtype) delete this.props.data.data.dbtype
                }
            }
            this.props.data.data.position = { x: this.group?.position.x, y: this.group?.position.y, z: this.group?.position.z }
            this.props.data.data.rotation = { x: this.group?.rotation.x, y: this.group?.rotation.y, z: this.group?.rotation.z }
            this.props.data.data.scale = { x: this.group?.scale.x, y: this.group?.scale.y, z: this.group?.scale.z }
            // this.props.data.data.child_modify = this.group?.userData?.child_modify ?? {}

            this.sendToServer(this.props.data);
            this.lastSentTime = now;
        }
    }
    async sendToServer(mesh: any) {
        SSocket.sendPromise({
            component: "scene_mesh",
            type: "editar",
            key_scene: this.props.key_scene,
            key_usuario: Model.usuario.Action.getKey(),
            data: mesh
        }).then(e => {
            console.log(e);
        }).catch(e => {
            console.error(e);
        })
    }
    yatiro = false
    tempVector: any;
    tempQuaternion: any;
    previousState = {
        position: new THREE.Vector3(),
        rotation: new THREE.Quaternion(),
        scale: new THREE.Vector3()
    };
    update(delta: number) {

        const { Ammo } = this.props;
        if (!this.group) return;
        if (this.mixer) this.mixer.update(delta);
        this.sprites.forEach(sprite => {
            sprite.update({ delta: delta })
        })
        const parentScale = this.group.scale.clone();
        this.group.traverse((child: any) => {
            if (!this.group) return;
            if (!Ammo) return;
            if (child.userData.body) {
                this.transformBodyToMesh(child, child.userData.body);

            }
        });
        if (this.group.userData.sendServer) {
            this.group.userData.sendServer = false;
            this.throttledSendToServer();
        }

    }
}


const createShape = (mesh: any, Ammo: any) => {
    const geometry = mesh.geometry;
    const attributes = geometry.attributes;
    const index = geometry.index;

    // Obtener la escala del objeto
    const scale = mesh.scale;

    // Crear el índice de los triángulos
    const btTriangleMesh = new Ammo.btTriangleMesh();

    if (index) {
        console.log("La geometria tiene index")
        // Si la geometría tiene un índice, utilizamos el índice para los triángulos
        for (let i = 0; i < index.count; i += 3) {
            const vertex1 = new Ammo.btVector3(
                attributes.position.getX(index.getX(i)),
                attributes.position.getY(index.getX(i)),
                attributes.position.getZ(index.getX(i))
            );
            const vertex2 = new Ammo.btVector3(
                attributes.position.getX(index.getX(i + 1)),
                attributes.position.getY(index.getX(i + 1)),
                attributes.position.getZ(index.getX(i + 1))
            );
            const vertex3 = new Ammo.btVector3(
                attributes.position.getX(index.getX(i + 2)),
                attributes.position.getY(index.getX(i + 2)),
                attributes.position.getZ(index.getX(i + 2))
            );
            btTriangleMesh.addTriangle(vertex1, vertex2, vertex3, true);
        }
    } else {
        console.log("La geometria NO tiene index")
        // Si no hay un índice, usamos los atributos de posición directamente
        for (let i = 0; i < attributes.position.count; i += 3) {
            const vertex1 = new Ammo.btVector3(
                attributes.position.getX(i),
                attributes.position.getY(i),
                attributes.position.getZ(i)
            );
            const vertex2 = new Ammo.btVector3(
                attributes.position.getX(i + 1),
                attributes.position.getY(i + 1),
                attributes.position.getZ(i + 1)
            );
            const vertex3 = new Ammo.btVector3(
                attributes.position.getX(i + 2),
                attributes.position.getY(i + 2),
                attributes.position.getZ(i + 2)
            );
            btTriangleMesh.addTriangle(vertex1, vertex2, vertex3, true);
        }
    }

    // Crear la forma de colisión
    const btShape = new Ammo.btBvhTriangleMeshShape(btTriangleMesh, true, true);
    return btShape;
}