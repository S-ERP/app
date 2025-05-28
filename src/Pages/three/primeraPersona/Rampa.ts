import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { AmmoType } from "../../../Components/SThree/SAmmoView/index.native";

export default class Rampa extends THREE.Group {
    url = "http://192.168.2.1:30017/models/laberinto.glb";
    callback: any;
    Ammo: AmmoType;
    rigidBodies: any[] = [];
    physicsWorld: any;

    constructor(Ammo: AmmoType, physicsWorld: any) {
        super();
        this.Ammo = Ammo;
        this.physicsWorld = physicsWorld;
    }

    handleLoad(gltf: GLTF) {
        const scene = gltf.scene;
        this.add(scene);
        // this.position.x = 2;
        // this.position.z = -4;
        scene.traverse((child: any) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                // Crear cuerpo rígido para el mesh
                const shape = this.createShape(child);
                const transform = new this.Ammo.btTransform();
                transform.setIdentity();
                transform.setOrigin(new this.Ammo.btVector3(child.position.x + this.position.x, child.position.y + this.position.y, child.position.z + this.position.z));
                const motionState = new this.Ammo.btDefaultMotionState(transform);

                const localInertia = new this.Ammo.btVector3(0, 0, 0);
                const mass = 0; // Masa 0 para cuerpos estáticos
                shape.calculateLocalInertia(mass, localInertia);
                // shape.setMargin(0.05)
                const rbInfo = new this.Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
                const body = new this.Ammo.btRigidBody(rbInfo);
                this.physicsWorld.addRigidBody(body);
                this.rigidBodies.push(body);
            }
        });
        if (this.callback) this.callback(gltf);
    }

    handleProgress(e: ProgressEvent) { }

    handleError(e: any) {
        console.error(e);
    }

    async load(callback: any) {
        this.callback = callback;
        const loader = new GLTFLoader();
        loader.load(
            this.url,
            this.handleLoad.bind(this),
            this.handleProgress.bind(this),
            this.handleError.bind(this)
        );
    }

    createShape(mesh: THREE.Mesh) {
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
}
