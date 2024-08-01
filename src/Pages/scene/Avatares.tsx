import * as THREE from "three"

import SSocket from "servisofts-socket";
import { SThread } from "servisofts-component";
import Model from "../../Model";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
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
    constructor(props: { key_scene: any }) {
        super();
        this.key_scene = props.key_scene;
        this.meshes = {}
        this.data = {}
        this.key_usuario = Model.usuario.Action.getKey();
    }

    createText = () => {
        const loader = new FontLoader();
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
            
        })
    }

    buildMesh() {
        // const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        // const geometry = new THREE.BoxGeometry(1, 1, 1);
        // const cube = new THREE.Mesh(geometry, material);


        const geometry = new THREE.CapsuleGeometry(this.radius, this.height, 8, 16);

        // Crear diferentes materiales
        const materials = [
            new THREE.MeshPhongMaterial({ color: 0xff0000, opacity: 0.1, transparent: true }), // Rojo
            new THREE.MeshPhongMaterial({ color: 0x00ff00, opacity: 0.1, transparent: true }), // Verde
            new THREE.MeshPhongMaterial({ color: 0x0000ff, opacity: 0.1, transparent: true }), // Azul
        ];

        // Crear grupo para contener partes de la cápsula
        const mesh = new THREE.Group();

        // Dividir la geometría en diferentes partes y aplicar diferentes materiales
        const topSphere = new THREE.Mesh(
            new THREE.SphereGeometry(this.radius, 8, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            materials[0]
        );
        topSphere.position.y = this.height / 2;

        const bottomSphere = new THREE.Mesh(
            new THREE.SphereGeometry(this.radius, 8, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            materials[1]
        );
        bottomSphere.position.y = -this.height / 2;
        bottomSphere.rotation.x = Math.PI;

        const cylinder = new THREE.Mesh(
            new THREE.CylinderGeometry(this.radius, this.radius, this.height, 8, 16, true),
            materials[2]
        );

        // Añadir partes al grupo
        mesh.add(topSphere);
        mesh.add(bottomSphere);
        mesh.add(cylinder);

        this.loadGlb(mesh);


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
                if (!mesh) {
                    mesh = this.buildMesh()
                    this.meshes[obj.key] = mesh;
                    this.add(mesh);
                    console.log("creo el objeto")
                }
                const { position, rotation } = obj.data;
                if (position) mesh.position.lerp(position, 0.1)
                if (rotation) mesh.rotation.set(rotation._x, rotation._y, rotation._z)


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
    loadGlb = async (mesh: any) => {
        // const url = "http://192.168.2.1:30017/models/muneca.glb";
        // const url = "http://192.168.2.1:30017/models/duende.glb";
        // const url = "http://192.168.2.1:30017/models/human.glb";
        const url = "https://drive.servisofts.com/http/models/human.glb";
        new GLTFLoader().load(url, (glb) => {
            const obj = glb.scene;
            obj.rotation.set(0, 180 * (Math.PI / 180), 0)
            const h = getGroupHeight(mesh);
            obj.position.y = -(h / 2)
            mesh.add(obj)

            if (glb.animations) {
                if (glb.animations.length > 0) {
                    const mixer = new THREE.AnimationMixer(obj);
                    this.mixers.push(mixer);
                    let anim = glb.animations.find(a => a.name == "idle");
                    if (!anim) {
                        anim = glb.animations[0]
                    }
                    if (anim) {
                        const action = mixer.clipAction(anim);
                        action.play();
                    }
                    // glb.animations.forEach((clip) => {
                    //     const action = mixer.clipAction(clip);
                    //     action.play();

                    // });

                }
            }
        })
    }

    lastTime = 0;
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