import * as THREE from 'three';
import { loadAsset, TextureLoader } from '../../../Components/SThree';
import { AmmoType } from '../../../Components/SThree/SAmmoView';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SThread } from 'servisofts-component';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
const getGroupHeight = (group: any) => {
    let boundingBox = new THREE.Box3().setFromObject(group);
    return boundingBox.max.y - boundingBox.min.y;
};
export default class Personaje extends THREE.Group {
    radius = 0.3; // Radio de la cápsula
    height = 1.2; // Altura de la cápsula (excluyendo los semiesferos)
    mesh: THREE.Group;
    body?: any;
    transform?: any;
    camera?: THREE.Camera;
    cameraOffset: THREE.Vector3;
    cameraAngle: number;
    key_scene?: any;
    cameraVerticalAngle: number = 1;
    lastSentTime;
    throttleDelay;
    camParams = {
        z: 1,
        y: 1,
        x: 0,
        look: 0.8,
    }
    mixer?: THREE.AnimationMixer;
    actions: { [key: string]: THREE.AnimationAction } = {}
    constructor() {
        super();
        this.lastSentTime = 0;
        this.throttleDelay = 1000 / 10; // 1000 ms
        // this.throttledSendToServer = _.throttle(this.sendToServer.bind(this), 1000);
        // Crear geometría de la cápsula
        const geometry = new THREE.CapsuleGeometry(this.radius, this.height, 8, 16);

        // Crear diferentes materiales
        const materials = [
            new THREE.MeshPhongMaterial({ color: 0xff0000, opacity: 0.1, transparent: true }), // Rojo
            new THREE.MeshPhongMaterial({ color: 0x00ff00, opacity: 0.1, transparent: true }), // Verde
            new THREE.MeshPhongMaterial({ color: 0x0000ff, opacity: 0.1, transparent: true }), // Azul
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

        this.loadGlb();
    }

    loadGlb = async () => {
        // const url = "http://192.168.2.1:30017/models/ruddyWalk.glb";
        // const url = "http://192.168.2.1:30017/models/duende.glb";
        const url = "http://192.168.2.1:30017/models/human.glb";
        new GLTFLoader().load(url, (glb) => {
            const obj = glb.scene;
            obj.rotation.set(0, 180 * (Math.PI / 180), 0)
            const h = getGroupHeight(this.mesh);
            obj.position.y = -(h / 2)
            this.mesh.add(obj)

            if (glb.animations) {
                if (glb.animations.length > 0) {
                    this.mixer = new THREE.AnimationMixer(obj);

                    glb.animations.forEach((clip) => {
                        if (!this.mixer) return;
                        const action = this.mixer.clipAction(clip);
                        this.actions[clip.name] = action;
                    });
                    if (this.actions["idle"]) {
                        this.actions["idle"].play()
                    }

                }
            }
        })
    }


    createText = () => {
        const loader = new FontLoader();
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
            
        })
    }
    ammoWorld?: any;
    createBody(props: { Ammo: AmmoType, ammoWorld: any, position?: any, rotation?: any }) {
        this.ammoWorld = props.ammoWorld;
        const { Ammo } = props;
        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        let y = props?.position?.y;
        if (y < 0 || y > 100) {
            y = 7;
        }
        this.transform.setOrigin(new Ammo.btVector3(props?.position?.x ?? 0, y, props?.position?.z ?? 0));
        if (props.rotation) {
            // const quaternion = new Ammo.btQuaternion(
            //     0,
            //     props.rotation.y ?? 0,
            //     0, 
            //     1
            // );
            // this.transform.setRotation(quaternion);
        }

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

    setKeyScene(key: any) {
        this.key_scene = key;
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
        if (!this.body) return;
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





            // const params = {
            //     maxForwardOffset: 2,
            //     maxBackWard: 1,
            //     look: 1,
            // }
            const forwardOffset = this.camParams.z * Math.cos(this.cameraVerticalAngle);
            this.cameraOffset = new THREE.Vector3(this.camParams.x, this.camParams.y * this.cameraVerticalAngle, forwardOffset);
            // Usar la función coseno para ajustar el forwardOffset


            const cameraOffsetRotated = this.cameraOffset.clone().applyQuaternion(objThree.quaternion);
            // Aplicar la rotación vertical de la cámara independientemente

            // OLD
            // const cameraVerticalRotation = new THREE.Quaternion();
            // cameraVerticalRotation.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.cameraVerticalAngle);
            // cameraOffsetRotated.applyQuaternion(cameraVerticalRotation);

            // Calcular la nueva posición de la cámara
            const cameraPosition = objThree.position.clone().add(cameraOffsetRotated);
            // this.camera.position.lerp(cameraPosition, 0.5); // Suavizar el seguimiento
            this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z); // Suavizar el seguimiento

            // Actualizar la rotación de la cámara para que mire al personaje
            const lookAtPosition = objThree.position.clone().add(new THREE.Vector3(0, this.camParams.look, 0));
            this.camera.lookAt(lookAtPosition);

        }
        // this.body.setLinearVelocity(new this.Ammo.btVector3(0, 0, 0));
        // this.body.setAngularVelocity(new this.Ammo.btVector3(0, 0, 0));
        // }

        if (!this.lastPosition.equals(this.mesh.position) || !this.lastRotation.equals(this.mesh.quaternion)) {
            this.lastPosition.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
            this.lastRotation.set(this.mesh.quaternion.x, this.mesh.quaternion.y, this.mesh.quaternion.z);
            this.throttledSendToServer();
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
        if (this.mixer) {
            this.mixer.update(props.delta);
        }

    }

    rotateCamera(angle: number) {
        if (!this.camera) return;
        // Definir los límites de la rotación vertical
        const maxVerticalAngle = (Math.PI / 2) - 0.1; // Limitar el ángulo a 45 grados
        const minVerticalAngle = (-Math.PI / 2) + 0.1; // Limitar el ángulo a -45 grados

        // Actualizar el ángulo de rotación vertical y asegurarse de que esté dentro de los límites
        this.cameraVerticalAngle = Math.max(minVerticalAngle, Math.min(maxVerticalAngle, this.cameraVerticalAngle + angle));
        // console.log("rotateCamera", this.cameraVerticalAngle);
    }
    rotateObject(angle: number) {
        // console.log(angle);

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

    lastTime: any = 0;
    applyJump() {
        const now = Date.now();
        if (now - this.lastTime >= 1000 / 4) {
            this.checkCollision((col: any) => {
                if (!col) {
                    console.log("El objeto no coliciona", "saltar")
                    return;
                }
                const jumpImpulse = new this.Ammo.btVector3(0, 500, 0); // Ajusta este valor según sea necesario
                const currentVelocity = this.body.getLinearVelocity();
                console.log(currentVelocity)
                this.body.activate();
                this.body.applyCentralImpulse(jumpImpulse);
            })
            this.lastTime = now;
        }


    }
    applyImpulse(e: { x: number, y: number }) {
        if (e.x === 0 && e.y === 0) return;
        if (!this.Ammo) return;
        const currentVelocity = this.body.getLinearVelocity();
        // if (!this.checkCollision()) {
        //     console.log("El objeto no coliciona", currentVelocity.y())
        //     return;
        // }

        // const scalingFactor = 0.27;
        const scalingFactor = 0.8;
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
        console.log("se detuvo", newVelocity)

        if (this.actions.walk) {
            this.actions.walk.play();
            new SThread(1000 / 30, "moviendose", true).start(() => {
                this.mixer?.stopAllAction();
                this.actions.idle.play();
            })
        }
        this.body.applyCentralImpulse(newVelocity);
    }

    inContact: boolean = false
    checkCollision(callback: any) {
        const contactCallback = new this.Ammo.ConcreteContactResultCallback();
        // @ts-ignore
        contactCallback.addSingleResult = (cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1) => {
            const contactPoint = this.Ammo.wrapPointer(cp, this.Ammo.btManifoldPoint);
            const distance = contactPoint.getDistance();

            if (distance <= 0.1) {
                callback({
                    distance: distance,
                    contactPoint: contactPoint,
                })
                this.inContact = true;
            } else {
                callback(false);
                console.log("no in contact")
                this.inContact = false;
            }
        };

        this.ammoWorld.contactTest(this.body, contactCallback);
        return this.inContact;
    }

    throttledSendToServer() {
        const now = Date.now();
        if (now - this.lastSentTime >= this.throttleDelay) {
            this.sendToServer();
            this.lastSentTime = now;
        }
    }
    async sendToServer() {
        SSocket.sendPromise({
            component: "avatar",
            type: "registro",
            key_scene: this.key_scene ?? "default",
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