import * as THREE from 'three';
import { loadAsset, TextureLoader } from '../../../Components/SThree';
import { AmmoType } from '../../../Components/SThree/SAmmoView/index.native';

export default class Pelota extends THREE.Group {
    radius = 33 / 100; // Radio de la cápsula
    height = 1.5; // Altura de la cápsula (excluyendo los semiesferos)
    mesh: THREE.Mesh;
    body?: any;
    transform?: any;
    constructor() {
        super();
        const geometry = new THREE.SphereGeometry(this.radius, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(geometry, material);

        this.add(this.mesh)
    }

    createBody(props: { Ammo: AmmoType }) {
        const { Ammo } = props;
        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        this.transform.setOrigin(new Ammo.btVector3(2, 10, 0));
        const motionState = new Ammo.btDefaultMotionState(this.transform);

        const colShape = new Ammo.btSphereShape(this.radius);
        // colShape.setMargin(0.05);

        const mass = 0.4;
        const localInertia = new Ammo.btVector3(0, 0, 0);
        colShape.calculateLocalInertia(mass, localInertia);

        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);

        this.body = new Ammo.btRigidBody(rbInfo);
        // this.body.setFriction(0.1);
        this.body.setDamping(0.2, 0.2); // Configurar damping lineal y angular
        this.body.setRestitution(0.99); // Configurar restitución para que la pelota rebote

        // this.body.setAngularFactor(new Ammo.btVector3(0, 1, 0))
        this.mesh.userData.physicsBody = this.body;
        return this.body;
    }



    Ammo: any;
    update(props: { delta: number, Ammo: AmmoType }) {
        this.Ammo = props.Ammo;
        const objThree = this.mesh;
        const objAmmo = this.body;
        const ms = objAmmo.getMotionState();
        if (ms) {
            ms.getWorldTransform(this.transform);
            const p = this.transform.getOrigin();
            const q = this.transform.getRotation();
            objThree.position.set(p.x(), p.y(), p.z());
            objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());

        }
    }


    applyImpulse(e: { x: number, y: number }) {
        // if (e.x === 0 && e.y === 0) return;

        // const scalingFactor = 0.1;
        // const direction = new THREE.Vector3(e.x, 0, e.y).applyQuaternion(this.camera!.quaternion);
        // const impulse = new this.Ammo.btVector3(direction.x, 0, direction.z);
        // impulse.op_mul(scalingFactor);

        // this.body.activate();
        // this.body.setLinearVelocity(impulse);
    }
}