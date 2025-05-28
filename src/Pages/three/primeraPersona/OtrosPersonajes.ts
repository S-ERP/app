import * as THREE from 'three';
import { loadAsset, TextureLoader } from '../../../Components/SThree';
import { AmmoType } from '../../../Components/SThree/SAmmoView/index.native';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';

export default class Personaje extends THREE.Group {
    radius = 0.5; // Radio de la cápsula
    height = 1.5; // Altura de la cápsula (excluyendo los semiesferos)
    mesh: THREE.Group;
    body?: any;
    transform?: any;
    camera?: THREE.Camera;
    cameraOffset: THREE.Vector3;
    cameraAngle: number;
    cameraVerticalAngle: number = 0;
    constructor() {
        super();

        // Crear geometría de la cápsula
        const geometry = new THREE.CapsuleGeometry(this.radius, this.height, 8, 16);

        // Crear diferentes materiales
        const materials = [
            new THREE.MeshPhongMaterial({ color: 0xff0000 }), // Rojo
            new THREE.MeshPhongMaterial({ color: 0x00ff00 }), // Verde
            new THREE.MeshPhongMaterial({ color: 0x0000ff }), // Azul
        ];

        // Crear grupo para contener partes de la cápsula
        this.mesh = new THREE.Group();

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
        this.mesh.add(topSphere);
        this.mesh.add(bottomSphere);
        this.mesh.add(cylinder);

        // Añadir el grupo a la escena
        this.add(this.mesh);

        this.cameraOffset = new THREE.Vector3(0, 2, 3);
        this.cameraAngle = 0;
    }
    ammoWorld?: any;
    createBody(props: { Ammo: AmmoType, ammoWorld: any }) {
        this.ammoWorld = props.ammoWorld;
        const { Ammo } = props;
        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        this.transform.setOrigin(new Ammo.btVector3(0, 10, 0));
        const motionState = new Ammo.btDefaultMotionState(this.transform);

        const colShape = new Ammo.btCapsuleShape(this.radius, this.height);
        // colShape.setMargin(0.05);

        const mass = 70;
        const localInertia = new Ammo.btVector3(0, 0, 0);
        colShape.calculateLocalInertia(mass, localInertia);

        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
        this.body = new Ammo.btRigidBody(rbInfo);
        // this.body.setAngularFactor(new Ammo.btVector3(0, 1, 0))

        // Evitar rotaciones alrededor de los ejes X y Z
        this.body.setAngularFactor(new Ammo.btVector3(0, 1, 0));
        // Ajustar fricción
        // this.body.setFriction(0);
        this.body.setRollingFriction(0.1);
        this.body.setSpinningFriction(0.1);

        this.body.setFriction(0.7); // Ajustar la fricción si es necesario
        this.body.setRestitution(0.1); // Ajustar la restitución si es necesario

        const linearDamping = 0.1; // Ajusta este valor según sea necesario
        const angularDamping = 0.99; // Ajusta este valor según sea necesario, más cercano a 1 significa más fricción

        this.body.setDamping(linearDamping, angularDamping);

        this.mesh.userData.physicsBody = this.body;
        return this.body;
    }

    setCamera(camera: THREE.Camera) {
        this.camera = camera;
    }
    calculateSpeed() {
        const velocity = this.body.getLinearVelocity();
        return Math.sqrt(velocity.x() * velocity.x() + velocity.y() * velocity.y() + velocity.z() * velocity.z());
    }

    applyAngularFriction() {
        const angularVelocity = this.body.getAngularVelocity();
        const angularDamping = 0.9; // Ajusta este valor según sea necesario
        angularVelocity.setX(angularVelocity.x() * angularDamping);
        angularVelocity.setY(angularVelocity.y() * angularDamping);
        angularVelocity.setZ(angularVelocity.z() * angularDamping);
        this.body.setAngularVelocity(angularVelocity);
    }
    Ammo: any;
    lastPosition = new THREE.Vector3();
    lastRotation = new THREE.Vector3();
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

        // Limitar la velocidad horizontal
        const velocity = objAmmo.getLinearVelocity();
        const maxHorizontalSpeed = 25; // Ajusta este valor según sea necesario
        const horizontalSpeed = Math.sqrt(velocity.x() * velocity.x() + velocity.z() * velocity.z());
        if (horizontalSpeed > maxHorizontalSpeed) {
            const scale = maxHorizontalSpeed / horizontalSpeed;
            velocity.setX(velocity.x() * scale);
            velocity.setZ(velocity.z() * scale);
            objAmmo.setLinearVelocity(velocity);
        }

        // Aplicar fricción del aire
        const airFriction = 0.98; // Ajusta este valor según sea necesario
        velocity.setX(velocity.x() * airFriction);
        velocity.setY(velocity.y()); // Mantén la componente Y sin cambios
        velocity.setZ(velocity.z() * airFriction);
        objAmmo.setLinearVelocity(velocity);

        // if (this.camera) {
        //     // Calcula la nueva posición de la cámara basado en el ángulo
        //     const offset = this.cameraOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraAngle);
        //     const cameraPosition = objThree.position.clone().add(offset);
        //     this.camera.position.lerp(cameraPosition, 0.5);  // Suavizar el seguimiento
        //     // this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);  // Suavizar el seguimiento
        //     this.camera.lookAt(objThree.position.clone().add(new THREE.Vector3(0, 1, 0))); // Mirar hacia el personaje
        // }
        if (this.camera) {
            // Calcular la posición de la cámara detrás del objeto y aplicar la rotación horizontal
            const cameraOffsetRotated = this.cameraOffset.clone().applyQuaternion(objThree.quaternion);
            // Aplicar la rotación vertical de la cámara independientemente
            // const cameraVerticalRotation = new THREE.Quaternion();
            // cameraVerticalRotation.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.cameraVerticalAngle);
            // cameraOffsetRotated.applyQuaternion(cameraVerticalRotation);
            // Calcular la nueva posición de la cámara
            const cameraPosition = objThree.position.clone().add(cameraOffsetRotated);
            // this.camera.position.lerp(cameraPosition, 0.5); // Suavizar el seguimiento
            this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z); // Suavizar el seguimiento

            // Actualizar la rotación de la cámara para que mire al personaje
            const lookAtPosition = objThree.position.clone().add(new THREE.Vector3(0, 1, 0));
            this.camera.lookAt(lookAtPosition);

        }
        // this.body.setLinearVelocity(new this.Ammo.btVector3(0, 0, 0));
        // this.body.setAngularVelocity(new this.Ammo.btVector3(0, 0, 0));
        // }

        if (!this.lastPosition.equals(this.mesh.position) || !this.lastRotation.equals(this.mesh.quaternion)) {
            this.lastPosition.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
            this.lastRotation.set(this.mesh.quaternion.x, this.mesh.quaternion.y, this.mesh.quaternion.z);
            this.sendToServer();
            // console.log(this.calculateSpeed())
        }




        // this.applyAngularFriction();
        // const maxHorizontalSpeed = 10; // Ajusta este valor según sea necesario
        // const horizontalSpeed = Math.sqrt(velocity.x() * velocity.x() + velocity.z() * velocity.z());
        // if (horizontalSpeed > maxHorizontalSpeed) {
        //     const scale = maxHorizontalSpeed / horizontalSpeed;
        //     velocity.setX(velocity.x() * scale);
        //     velocity.setZ(velocity.z() * scale);
        //     objAmmo.setLinearVelocity(velocity);
        // }

    }

    rotateCamera(angle: number) {
        if (!this.camera) return;
        // Definir los límites de la rotación vertical
        const maxVerticalAngle = Math.PI / 4; // Limitar el ángulo a 45 grados
        const minVerticalAngle = -Math.PI / 4; // Limitar el ángulo a -45 grados

        // Actualizar el ángulo de rotación vertical y asegurarse de que esté dentro de los límites
        this.cameraVerticalAngle = Math.max(minVerticalAngle, Math.min(maxVerticalAngle, this.cameraVerticalAngle + angle));
        console.log("rotateCamera", this.cameraVerticalAngle);
    }
    rotateObject(angle: number) {
        console.log(angle);

        if (angle <= 0.3 && angle >= -0.3) return;
        // Crear el cuaternión de rotación en THREE.js
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        this.mesh.quaternion.multiply(quaternion);

        // Convertir la rotación de THREE.js a Ammo.js
        const ammoQuat = new this.Ammo.btQuaternion(
            this.mesh.quaternion.x,
            this.mesh.quaternion.y,
            this.mesh.quaternion.z,
            this.mesh.quaternion.w
        );

        // Calcular la velocidad angular necesaria para la rotación
        const currentAngularVelocity = this.body.getAngularVelocity();
        const desiredAngularVelocity = new this.Ammo.btVector3(0, angle, 0);

        this.body.activate();
        // Aplicar el impulso angular al cuerpo rígido
        this.body.setAngularVelocity(desiredAngularVelocity);

        // Mantener las velocidades lineales actuales
        const currentLinearVelocity = this.body.getLinearVelocity();
        this.body.setLinearVelocity(currentLinearVelocity);

    }

    applyJump() {
        console.log("saltar")
        // if (!this.checkCollision()) {
        //     console.log("El objeto no coliciona", "saltar")
        //     return;
        // }
        const jumpImpulse = new this.Ammo.btVector3(0, 400, 0); // Ajusta este valor según sea necesario
        this.body.activate();
        this.body.applyCentralImpulse(jumpImpulse);
    }
    applyImpulse(e: { x: number, y: number }) {
        if (e.x === 0 && e.y === 0) return;
        if (!this.Ammo) return;
        const currentVelocity = this.body.getLinearVelocity();
        // if (!this.checkCollision()) {
        //     console.log("El objeto no coliciona", currentVelocity.y())
        //     return;
        // }

        const scalingFactor = 0.27;
        // const scalingFactor = 0.005;
        const direction = new THREE.Vector3(e.x, 0, e.y).applyQuaternion(this.camera!.quaternion);
        const impulse = new this.Ammo.btVector3(direction.x, 0, direction.z);
        impulse.op_mul(scalingFactor);
        this.body.activate();


        // Obtener la velocidad actual
        // Mantener la componente vertical de la velocidad
        const newVelocity = new this.Ammo.btVector3(impulse.x(), currentVelocity.y(), impulse.z());
        // this.body.setLinearVelocity(newVelocity);
        // this.body.setLinearVelocity(impulse);
        this.body.applyCentralImpulse(newVelocity);
    }

    inContact: boolean = false
    checkCollision() {
        const contactCallback = new this.Ammo.ConcreteContactResultCallback();
        // @ts-ignore
        contactCallback.addSingleResult = (cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1) => {
            const contactPoint = this.Ammo.wrapPointer(cp, this.Ammo.btManifoldPoint);
            const distance = contactPoint.getDistance();

            if (distance <= 0) {
                this.inContact = true;
            } else {
                this.inContact = false;
            }
        };

        this.ammoWorld.contactTest(this.body, contactCallback);
        return this.inContact;
    }

    async sendToServer() {
        SSocket.sendPromise({
            component: "avatar",
            type: "registro",
            key_scene: "default",
            key_usuario: Model.usuario.Action.getKey(),
            data: {
                position: this.mesh.position,
                rotation: this.mesh.rotation,
                scale: this.mesh.scale,

            }
        }).then(e => {

        }).catch(e => {

        })
    }
}