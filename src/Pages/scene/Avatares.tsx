import * as THREE from "three"

import SSocket from "servisofts-socket";
import { SThread } from "servisofts-component";
import Model from "../../Model";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

import GLTFLoaderCache from "./GTLFLoaderCache";
const getGroupHeight = (group: any) => {
    let boundingBox = new THREE.Box3().setFromObject(group);
    return boundingBox.max.y - boundingBox.min.y;
};
export default class Avatares extends THREE.Group {
    radius = 0.3; // Radio de la cápsula
    height = 1.2; // Altura de la cápsula (excluyendo los semiesferos)
    key_scene: any;
    data: any;
    meshes: any;
    key_usuario;
    mixers: any = []
    props;
    constructor(props: { key_scene: any, glftLoaderCache: GLTFLoaderCache }) {
        super();
        this.name = "Avatares"
        this.props = props;
        this.key_scene = props.key_scene;
        this.meshes = {}
        this.data = {}
        this.key_usuario = Model.usuario.Action.getKey();
    }

    createText = (mesh: any, obj: any) => {
        const loader = new FontLoader();

        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
            console.log(obj);
            const textGeometry = new TextGeometry(obj?.data?.alias ?? "guest", {
                font: font,
                size: 0.1,
                height: 0.01,
                curveSegments: 12,
                // bevelEnabled: true,
            });
            textGeometry.center();
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.y = 1

            // textMesh.position.x = 1
            textMesh.rotation.y = Math.PI
            mesh.add(textMesh);

        })
    }

    buildMesh(obj: any) {
        // const geometry = new THREE.BoxGeometry(1, 1, 1);
        // const cube = new THREE.Mesh(geometry, material);



        // // Crear diferentes materiales
        // const materials = [
        //     new THREE.MeshPhongMaterial({ color: 0xff0000, opacity: 0.1, transparent: true }), // Rojo
        //     new THREE.MeshPhongMaterial({ color: 0x00ff00, opacity: 0.1, transparent: true }), // Verde
        //     new THREE.MeshPhongMaterial({ color: 0x0000ff, opacity: 0.1, transparent: true }), // Azul
        // ];

        // Crear grupo para contener partes de la cápsula
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000, visible: false });
        const geometry = new THREE.CapsuleGeometry(this.radius, this.height, 8, 16);
        const cube = new THREE.Mesh(geometry, material);
        const mesh = new THREE.Group();
        mesh.userData.key = obj.key;
        mesh.userData.dbtype = "scene_usuario";
        // this.userData.look = true;
        mesh.name = obj?.data?.alias
        mesh.add(cube)
        // mesh.add(topSphere);
        // Dividir la geometría en diferentes partes y aplicar diferentes materiales
        // const topSphere = new THREE.Mesh(
        //     new THREE.SphereGeometry(this.radius, 8, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        //     materials[0]
        // );
        // topSphere.position.y = this.height / 2;

        // const bottomSphere = new THREE.Mesh(
        //     new THREE.SphereGeometry(this.radius, 8, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        //     materials[1]
        // );
        // bottomSphere.position.y = -this.height / 2;
        // bottomSphere.rotation.x = Math.PI;

        // const cylinder = new THREE.Mesh(
        //     new THREE.CylinderGeometry(this.radius, this.radius, this.height, 8, 16, true),
        //     materials[2]
        // );

        // Añadir partes al grupo
        // mesh.add(topSphere);
        // mesh.add(bottomSphere);
        // mesh.add(cylinder);

        this.loadGlb(mesh, obj?.data?.skinurl ?? "https://drive.servisofts.com/http/models/player/robot.glb");

        this.createText(mesh, obj);
        // Añadir el grupo a la escena
        // this.add(this.mesh);

        // this.cameraOffset = new THREE.Vector3(0, 2, 3);
        // this.cameraAngle = 0;
        // const { position } = data;
        // cube.position.set(position.x, position.y, position.z)
        return mesh;
        // scene.add(cube)
    }

    update(props: { delta: any, Ammo: any }) {
        if (this.data) {
            Object.values(this.data).map((obj: any) => {
                if (obj.key_usuario == this.key_usuario) return;
                let mesh = this.meshes[obj.key];
                const { position, rotation, currentAnimation } = obj.data;

                if (!mesh) {
                    mesh = this.buildMesh(obj)
                    this.meshes[obj.key] = mesh;
                    this.add(mesh);
                    if (position) mesh.position.set(position.x, position.y, position.z)
                } else if (!!obj?.data?.skinurl && mesh?.userData?.skinurl != obj?.data?.skinurl) {
                    this.loadGlb(mesh, obj?.data?.skinurl);
                }
                if (position) mesh.position.lerp(position, 0.1)
                if (rotation) mesh.rotation.set(rotation._x, rotation._y, rotation._z)
                if (currentAnimation) {
                    if (mesh?.userData?.actions) {
                        if (mesh?.userData?.actions[currentAnimation]) {
                            if (mesh.userData.currentAnimation != currentAnimation) {
                                // if (mesh.userData.mixer) mesh.userData.mixer.stopAllAction()
                                if (mesh.userData.actions[currentAnimation]) {
                                    const action = mesh.userData.actions[currentAnimation];
                                    const onPlayAction = mesh?.userData?.actions[mesh.userData.currentAnimation];
                                    mesh.userData.currentAnimation = currentAnimation;

                                    if (onPlayAction) {
                                        // Detener la acción actual antes de iniciar una nueva
                                        onPlayAction.fadeOut(0.2);
                                        action.reset().fadeIn(0.2).play();
                                        action.enabled = true;
                                    } else {
                                        action.play();
                                    }
                                    // action.reset().fadeIn(0.2).play();
                                    // action.enabled = true;
                                };

                            }

                        }
                    }
                }

            })

            if (this.mixers) {
                this.mixers.forEach((mixer: any) => {
                    mixer.update(props.delta);
                });
            }
        }
    }
    run = false;
    hilo() {
        if (!this.run) return;
        new SThread(1000 / 2, "asdasd", false).start(() => {
            this.getAvataresServer();
            this.hilo();
        })
    }

    async init() {
        return await this.getAvataresServer();
        // this.run = true;
        // this.hilo();

    }
    loadGlb = async (mesh: THREE.Object3D, url: string) => {
        // const name = "robot.glb";
        // const url = "http://192.168.2.1:30017/models/muneca.glb";
        // const url = "http://192.168.2.1:30017/models/duende.glb";
        // const url = "http://192.168.2.1:30017/models/human.glb";
        // const url = "https://drive.servisofts.com/http/models/human.glb";
        // const url = `https://drive.servisofts.com/http/models/player/${name}`;
        // const url = "https://drive.servisofts.com/http/models/player/choca.glb";
        // const url = "https://drive.servisofts.com/http/models/player/elchupacabra.glb";

        mesh.userData.skinurl = url;
        const oldMesh = mesh.getObjectByName("gltf");

        new GLTFLoader().load(url, (glb) => {
            if (oldMesh) {
                mesh.remove(oldMesh);
            }
            // this.props.glftLoaderCache.load(url, (glb) => {
            const obj = glb.scene;
            obj.name = "gltf"
            obj.rotation.set(0, 180 * (Math.PI / 180), 0)
            const h = getGroupHeight(mesh);
            obj.position.y = -((h / 2) - 0.1)

            obj.traverse((child: any) => {

                // if (child.type == "PointLight" || child.type == "SpotLight") this.normaliceLight(child)
                if (child.isMesh) {
                    const mesh: THREE.Mesh = child;
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    mesh.frustumCulled = true;

                }

                // if(child.type == "")

            })
            mesh.add(obj)
            if (glb.animations) {
                if (glb.animations.length > 0) {
                    const mixer = new THREE.AnimationMixer(obj);
                    this.mixers.push(mixer);

                    // let anim = glb.animations.find(a => a.name == "idle");
                    // if (!anim) {
                    //     anim = glb.animations[0]
                    // }
                    // if (anim) {
                    //     const action = mixer.clipAction(anim);
                    //     action.play();
                    // }
                    mesh.userData.actions = {};
                    mesh.userData.mixer = mixer;
                    glb.animations.forEach((clip) => {
                        const action = mixer.clipAction(clip);
                        mesh.userData.actions[clip.name] = action;

                    });

                }
            }
        })
    }

    lastTime = 0;
    onExit(message: any) {
        const item: any = Object.values(this.data).find((e: any) => e.key_usuario == message.key_usuario);
        console.log("entro al onecit")
        if (item) {
            const mesh: THREE.Group = this.meshes[item.key];
            delete this.data[item.key]
            delete this.meshes[item.key]
            this.remove(mesh);
            this.lastTime = message.time + 1000;
            console.log("removio")

        }

    }
    onMove(message: any) {
        // console.log("Moviendo objeto", message.time)
        if (message.time > this.lastTime) {
            this.lastTime = message.time;
            this.data[message.data.key] = message.data;
        }

    }
    async getAvataresServer() {
        const resp: any = await SSocket.sendPromise({
            component: "avatar",
            type: "getAll",
            key_scene: this.key_scene
        })
        if (resp) {
            this.data = resp.data;
        }
        return resp;

        // .then((e: any) => {
        //     this.data = e.data;
        //     console.log(e);
        // }).catch(e => {
        //     console.error(e);
        // })
    }
}