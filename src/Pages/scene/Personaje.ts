import * as THREE from 'three';
import { AmmoType } from '../../Components/SThree/SAmmoView/index.native';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SThread } from 'servisofts-component';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import GLTFLoaderCache from './GTLFLoaderCache';
import Attack from './Attack';
const getGroupHeight = (group: any) => {
    let boundingBox = new THREE.Box3().setFromObject(group);
    return boundingBox.max.y - boundingBox.min.y;
};

let GLTFCache: any;
let skinurl: any;
export default class Personaje extends THREE.Group {
    flyMode = false
    // jumpVelocityMS = 3.5; //realista
    jumpVelocityMS = 4.2; //realista
    // jumpVelocityMS = 65;
    radius = 0.2; // Radio de la cápsula
    height = 1.2; // Altura de la cápsula (excluyendo los semiesferos)
    mesh: THREE.Group;
    body?: any;
    transform?: any;
    camera?: THREE.PerspectiveCamera;
    cameraOffset: THREE.Vector3;
    key_scene?: any;
    cameraVerticalAngle: number = 1;
    lastSentTime;
    throttleDelay;
    // linterna
    // camParams = { x: 0, y: 0.8, z: 0.1, look: 0.8, upDownVelocity: 0.1 }
    camParams = { x: 0, y: 5, z: 4, look: 1.3, upDownVelocity: 1, near: 0.1 }
    mixer?: THREE.AnimationMixer;
    actions: { [key: string]: THREE.AnimationAction } = {}
    props;
    skinurl?: string;
    constructor(props: { glftLoaderCache: GLTFLoaderCache }) {
        super();
        this.props = props;
        this.name = "My Personaje"
        this.userData.key = Model.usuario.Action.getKey();
        this.userData.dbtype = "personaje"
        // this.userData.look = true;

        this.lastSentTime = 0;
        this.throttleDelay = 1000 / 10; // 1000 ms
        // this.throttledSendToServer = _.throttle(this.sendToServer.bind(this), 1000);
        // Crear geometría de la cápsula
        // const geometry = new THREE.CapsuleGeometry(this.radius, this.height, 8, 16);

        // Crear diferentes materiales
        const materials = [
            new THREE.MeshPhongMaterial({ color: 0xff0000, opacity: 0.5, transparent: true }), // Rojo
            new THREE.MeshPhongMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true }), // Verde
            new THREE.MeshPhongMaterial({ color: 0x0000ff, opacity: 0.5, transparent: true }), // Azul
        ];

        // Crear grupo para contener partes de la cápsula
        this.mesh = this;

        // Dividir la geometría en diferentes partes y aplicar diferentes materiales
        const topSphere = new THREE.Mesh(
            new THREE.SphereGeometry(this.radius, 8, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            materials[0]
        );
        topSphere.name = "personaje.topSphere"
        topSphere.position.y = this.height / 2;

        const bottomSphere = new THREE.Mesh(
            new THREE.SphereGeometry(this.radius, 8, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            materials[1]
        );
        bottomSphere.name = "personaje.bottomSphere"
        bottomSphere.position.y = -this.height / 2;
        bottomSphere.rotation.x = Math.PI;

        const cylinder = new THREE.Mesh(
            new THREE.CylinderGeometry(this.radius, this.radius, this.height, 8, 16, true),
            materials[2]
        );
        cylinder.name = "personaje.cylinder"


        topSphere.visible = false;
        bottomSphere.visible = false;
        cylinder.visible = false;

        // Añadir partes al grupo
        this.mesh.add(topSphere);
        this.mesh.add(bottomSphere);
        this.mesh.add(cylinder);

        // Añadir el grupo a la escena
        this.add(this.mesh);

        // this.linterna = new THREE.SpotLight(0xffffff, 10, 40, 0.9, 0, 1)
        // this.linterna.castShadow = true;
        // this.linterna.position.set(0, this.height / 3, 0); // Posición de la linterna
        // this.linterna.target.position.set(0, this.height / 3, -1); // Apunta hacia adelante

        // this.mesh.add(this.linterna.target);
        // this.mesh.add(this.linterna)

        this.mesh.position.y = 10;
        this.cameraOffset = new THREE.Vector3(0, 2, 3);
        // const url = "https://drive.servisofts.com/http/models/player/mujer.glb";
        // this.loadGlb("https://drive.servisofts.com/http/models/player/mujer.glb");
    }

    async getAvatarDB() {
        const resp: any = await SSocket.sendPromise({
            component: "avatar",
            type: "getByKeyUsuario",
            key_usuario: Model.usuario.Action.getKey()
        })
        return resp.data;
    }
    personajeBody: any;
    async init(p: { Ammo: AmmoType, ammoWorld: any, startPosition: { x: number, y: number, z: number, }, startRotation: { x: number, y: number, z: number, } }) {

        const myAvatar = await this.getAvatarDB()

        // const myAvatar: any = {}
        const avatar_position: any = { x: p.startPosition.x, y: p.startPosition.y ?? 10, z: p.startPosition.z }
        const avatar_rotation: any = { x: p.startRotation.x, y: p.startRotation.y, z: p.startRotation.z }
        if (myAvatar.key_scene == this.key_scene) {
            avatar_position.x = myAvatar?.data?.position?.x ?? 0
            avatar_position.y = myAvatar?.data?.position?.y ?? 0
            avatar_position.z = myAvatar?.data?.position?.z ?? 0
            avatar_rotation.x = myAvatar?.data?.rotation?._x ?? 0
            avatar_rotation.y = myAvatar?.data?.rotation?._y ?? 0
            avatar_rotation.z = myAvatar?.data?.rotation?._z ?? 0
        }
        // console.log(myAvatar)
        // console.log("Iniciando mi avatar", myAvatar?.data?.position, this.sx, this.sy, this.sz, myAvatar?.data?.rotation)
        this.loadGlb(myAvatar?.data?.skinurl ?? "https://drive.servisofts.com/http/models/player/robot.glb")
        this.personajeBody = this.createBody({
            Ammo: p.Ammo,
            ammoWorld: p.ammoWorld,
            position: { x: avatar_position.x, y: avatar_position.y, z: avatar_position.z },
            rotation: { x: avatar_rotation.x, y: avatar_rotation.y, z: avatar_rotation.z },

        });
        this.personajeBody.name = "personaje"
        p.ammoWorld.addRigidBody(this.personajeBody)
    }

    changeSkin(url: string) {
        this.skinurl = url;
        const gltf = this.mesh.getObjectByName("gltf");
        if (gltf) {
            this.mesh.remove(gltf);
            this.loadGlb(url);
            this.sendToServer();
        }

    }
    loadGlb = async (url: string) => {
        this.skinurl = url;
        if (this.skinurl != url) {
            GLTFCache = null;
            this.skinurl = url;
        }


        // const url = "http://192.168.2.1:30017/models/ruddyWalk.glb";
        // const url = "http://192.168.2.1:30017/models/duende.glb";
        // const url = "https://drive.servisofts.com/http/models/human.glb";
        // const url = "https://drive.servisofts.com/http/models/player/elchupacabra.glb";
        // const url = "https://drive.servisofts.com/http/models/player/choca.glb";
        // this.props.glftLoaderCache.load(url, (glb) => {
        if (!!GLTFCache) {
            this.handleLoadGLTF(GLTFCache)
        } else {
            new GLTFLoader().load(url, this.handleLoadGLTF.bind(this))
        }
    }

    handleLoadGLTF = (glb: any) => {
        GLTFCache = glb;
        const obj = glb.scene;
        obj.name = "gltf"
        obj.rotation.set(0, 180 * (Math.PI / 180), 0)
        const h = getGroupHeight(this.mesh);
        obj.position.y = -(h / 2)
        this.mesh.add(obj)

        obj.traverse((child: any) => {
            // @ts-ignore
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        })
        if (glb.animations) {
            if (glb.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(obj);

                glb.animations.forEach((clip: any) => {
                    if (!this.mixer) return;
                    const action = this.mixer.clipAction(clip);
                    this.actions[clip.name] = action;
                });
                // if (this.actions["idle"]) {
                //     this.actions["idle"].play()
                // }

            }
        }
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
            this.mesh.rotation.set(props.rotation.x, props.rotation.y, props.rotation.z);
            // Crear un quaternion a partir de la rotación del mesh
            const euler = new THREE.Euler(props.rotation.x, props.rotation.y, props.rotation.z);
            const quaternion = new THREE.Quaternion();
            quaternion.setFromEuler(euler);

            // Convertir el quaternion de Three.js a Ammo.js
            const ammoQuaternion = new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
            this.transform.setRotation(ammoQuaternion);
        }


        const motionState = new Ammo.btDefaultMotionState(this.transform);

        const colShape = new Ammo.btCapsuleShape(this.radius, this.height);

        // console.log(props.ammoWorld.getGravity().y()); // Debería imprimir -9.8
        // No debe haber límites estrictos de velocidad

        // colShape.setMargin(0.05);

        const mass = 80;
        const localInertia = new Ammo.btVector3(0, 0, 0);
        colShape.calculateLocalInertia(mass, localInertia);

        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
        this.body = new Ammo.btRigidBody(rbInfo);
        // this.body.setAngularFactor(new Ammo.btVector3(0, 1, 0))

        // Evitar rotaciones alrededor de los ejes X y Z
        this.body.setAngularFactor(new Ammo.btVector3(0, 0, 0));
        // Ajustar fricción
        this.body.setFriction(0.50);

        // Ajustar fricción
        // this.body.setFriction(0.85); // Incrementar la fricción general
        // this.body.setRollingFriction(0.1); // Incrementar la fricción de rodadura
        // this.body.setSpinningFriction(0.1); // Incrementar la fricción de giro

        this.body.setRestitution(0.1); // Ajustar la restitución si es necesario


        const linearDamping = 0; // Ajusta este valor según sea necesario
        const angularDamping = 0.99; // Ajusta este valor según sea necesario, más cercano a 1 significa más fricción

        // this.body.setDamping(linearDamping, angularDamping);
        this.body.setDamping(0, 0);

        this.body.setCcdMotionThreshold(0.1);  // Establece un umbral bajo para activar CCD
        this.body.setCcdSweptSphereRadius(this.radius);  // Ajusta el radio de CCD

        this.mesh.userData.physicsBody = this.body;
        // this.body.setMaxVelocity(1000);  // Asegura que la velocidad máxima sea alta

        return this.body;
    }

    setKeyScene(key: any) {
        this.key_scene = key;
    }
    setCamera(camera: THREE.PerspectiveCamera) {
        this.camera = camera;
    }
    calculateSpeed() {
        const velocity = this.body.getLinearVelocity();
        return Math.sqrt(velocity.x() * velocity.x() + velocity.y() * velocity.y() + velocity.z() * velocity.z());
    }
    onPlay = "";
    lastPlay = "";
    lastAnimationChange = Date.now();
    playAnimation(name: string) {
        const action = this.actions[name];
        // console.log("Ejecutando animacion", name)
        if (action) {
            if (this.currentAnimation == name) {
                return;
            }
            this.currentAnimation = name;
            if (this.onPlay != name) {
                // console.log(name);
                const currentAction = this.actions[this.onPlay];
                this.lastPlay = this.onPlay;
                this.onPlay = name;

                // this.mixer?.stopAllAction();
                // action.play();

                if (currentAction) {
                    // Detener la acción actual antes de iniciar una nueva
                    currentAction.fadeOut(0.2);
                    action.reset().fadeIn(0.2).play();
                    action.enabled = true;
                } else {
                    action.play();
                }
                if (name == "jump") {
                    new SThread(action.getClip().duration * 1000, "stop", true).start(() => {
                        // action.stop();
                        this.playAnimation(this.lastPlay);
                    })
                }

                // this.throttledSendToServer();

                // console.log() action.time

            }
        }
    }
    currentAnimation: any;
    applyAngularFriction() {
        if (!this.body) return;
        if (!this.body.getAngularVelocity) return;
        const angularVelocity = this.body.getAngularVelocity();
        const angularDamping = 0.9; // Ajusta este valor según sea necesario
        angularVelocity.setX(angularVelocity.x() * angularDamping);
        angularVelocity.setY(angularVelocity.y() * angularDamping);
        angularVelocity.setZ(angularVelocity.z() * angularDamping);
        this.body.setAngularVelocity(angularVelocity);
    }

    updateDamping() {
        // Obtener la velocidad lineal actual
        const linearVelocity = this.body.getLinearVelocity();

        // Establecer diferentes factores de amortiguación para los ejes x, y, z
        const dampingX = 0.93; // Amortiguación para el eje x
        const dampingY = 1; // Amortiguación para el eje y
        const dampingZ = 0.93; // Amortiguación para el eje z

        // Aplicar la amortiguación a cada componente de la velocidad lineal
        linearVelocity.setValue(
            linearVelocity.x() * dampingX,
            linearVelocity.y() * dampingY,
            linearVelocity.z() * dampingZ
        );

        // Establecer la nueva velocidad lineal
        this.body.setLinearVelocity(linearVelocity);

        // Aplicar la amortiguación angular de manera uniforme
        const angularDamping = 0.99; // Ajusta este valor según sea necesario, más cercano a 1 significa más fricción
        this.body.setAngularVelocity(
            this.body.getAngularVelocity().op_mul(angularDamping)
        );
    }
    //  ********* UPDATE ***********
    Ammo: any;
    lastPosition = new THREE.Vector3();
    lastRotation = new THREE.Quaternion();
    async update(props: { delta: number, Ammo: AmmoType }) {
        this.Ammo = props.Ammo;
        if (!this.body) return;
        this.body.activate();
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
        const speed = velocity.length();
        const velocityVector = new THREE.Vector3(velocity.x(), velocity.y(), velocity.z());
        const localVelocity = velocityVector.clone().applyQuaternion(objThree.quaternion.clone().invert());
        // Calcular la dirección de movimiento local
        const movementDirection = localVelocity.clone().normalize();

        // const maxHorizontalSpeed = 25; // Ajusta este valor según sea necesario
        const horizontalSpeed = Math.sqrt(velocity.x() * velocity.x() + velocity.z() * velocity.z());
        // if (horizontalSpeed > maxHorizontalSpeed) {
        //     const scale = maxHorizontalSpeed / horizontalSpeed;
        //     velocity.setX(velocity.x() * scale);
        //     velocity.setZ(velocity.z() * scale);
        //     objAmmo.setLinearVelocity(velocity);
        // }

        // Aplicar fricción del aire
        // const airFriction = 0.98; // Ajusta este valor según sea necesario
        // velocity.setX(velocity.x() * airFriction);
        // velocity.setY(velocity.y()); // Mantén la componente Y sin cambios
        // velocity.setZ(velocity.z() * airFriction);
        // objAmmo.setLinearVelocity(velocity);

        this.updateDamping();

        if (this.camera) {
            const forwardOffset = this.camParams.z * Math.cos(this.cameraVerticalAngle);
            this.cameraOffset = new THREE.Vector3(this.camParams.x, this.camParams.y * this.cameraVerticalAngle, forwardOffset);
            const cameraOffsetRotated = this.cameraOffset.clone().applyQuaternion(objThree.quaternion);

            const cameraPosition = objThree.position.clone().add(cameraOffsetRotated);
            this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z); // Suavizar el seguimiento
            const lookAtPosition = objThree.position.clone().add(new THREE.Vector3(0, this.camParams.look, 0));
            this.camera.lookAt(lookAtPosition);
            if (this.camera.near != this.camParams.near) {
                this.camera.near = this.camParams.near
                this.camera.updateProjectionMatrix();
            }

            // if (this.linterna) {
            //     this.linterna.position.set(0, this.cameraOffset.z - 1, 1);
            //     this.linterna.target.position.set(0, this.cameraOffset.z - 1, -1);
            //     // this.linterna.target.position.copy(lookAtPosition);
            //     // this.linterna.target.updateMatrixWorld();
            // }
        }


        const p = this.transform.getOrigin();
        const q = this.transform.getRotation();
        // Convertir las posiciones y rotaciones de Ammo.js a Three.js
        const currentPosition = new THREE.Vector3(p.x(), p.y(), p.z());
        const currentRotation = new THREE.Quaternion(q.x(), q.y(), q.z(), q.w());

        // Comparar la s posiciones y rotaciones actuales con las almacenadas anteriormente
        const positionDifference = currentPosition.distanceTo(this.lastPosition);
        const rotationDifference = currentRotation.angleTo(this.lastRotation);

        if (positionDifference >= 0.0001 || rotationDifference >= 0.001) {
            this.lastPosition.copy(currentPosition);
            this.lastRotation.copy(currentRotation);

            this.throttledSendToServer();
        }

        if (this.mixer) {
            const now = Date.now();
            const animationChangeDelay = 200;
            if (this.onPlay != "jump") {
                let newAnimation = this.currentAnimation;

                if (horizontalSpeed > 0.01) {
                    const isRunning = horizontalSpeed > 8; // Define una velocidad mínima para correr
                    const animation = isRunning ? 'run' : 'walk';

                    if (Math.abs(movementDirection.x) > Math.abs(movementDirection.z)) {
                        if (movementDirection.x > 0) {
                            // Movimiento hacia la derecha
                            newAnimation = animation;
                        } else {
                            // Movimiento hacia la izquierda
                            newAnimation = animation;
                        }
                    } else {
                        if (movementDirection.z < 0) {
                            // Movimiento hacia adelante
                            newAnimation = animation;
                        } else {
                            // Movimiento hacia atrás
                            newAnimation = animation === 'run' ? 'runback' : 'walkback';
                        }
                    }
                } else if (horizontalSpeed < 0.01 && (["run", "walk", "walkback", "runback"].includes(this.currentAnimation) || !this.currentAnimation)) {
                    // Estar quieto
                    newAnimation = 'idle';
                }

                if (newAnimation !== this.currentAnimation && now - this.lastAnimationChange > animationChangeDelay) {
                    this.playAnimation(newAnimation);
                    this.currentAnimation = newAnimation;
                    this.lastAnimationChange = now;
                    this.sendToServer();

                }
            }


            this.mixer.update(props.delta);
        }

    }

    rotateCamera(angle: number) {
        if (!this.camera) return;
        // Definir los límites de la rotación vertical
        const maxVerticalAngle = (Math.PI / 2) - 0.1; // Limitar el ángulo a 45 grados
        const minVerticalAngle = (-Math.PI / 2) + 0.1; // Limitar el ángulo a -45 grados

        let variance = this.camParams.upDownVelocity;
        // Actualizar el ángulo de rotación vertical y asegurarse de que esté dentro de los límites
        this.cameraVerticalAngle = Math.max(minVerticalAngle, Math.min(maxVerticalAngle, this.cameraVerticalAngle + (angle * variance)));
        // console.log("rotateCamera", this.cameraVerticalAngle);
    }
    rotateObject(angle: number) {
        // console.log(angle);

        // if (angle <= 0.3 && angle >= -0.3) return;
        // console.log(angle)
        // Crear el cuaternión de rotación en THREE.js
        if (!this.body) return;
        const currentLinearVelocity = this.body.getLinearVelocity();
        const currentAngularVelocity = this.body.getAngularVelocity();

        // Crear el cuaternión de rotación en THREE.js
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        this.mesh.quaternion.multiply(quaternion);

        // Crear una matriz de transformación de THREE.js
        const matrix = new THREE.Matrix4();
        matrix.makeRotationFromQuaternion(this.mesh.quaternion);

        // Convertir la matriz de transformación de THREE.js a Ammo.js
        const ammoMatrix = new this.Ammo.btTransform();
        ammoMatrix.setFromOpenGLMatrix(matrix.elements);

        // Obtener la posición actual del cuerpo rígido
        const origin = this.body.getWorldTransform().getOrigin();
        ammoMatrix.setOrigin(new this.Ammo.btVector3(origin.x(), origin.y(), origin.z()));

        // Establecer la nueva transformación del cuerpo rígido
        this.body.setWorldTransform(ammoMatrix);

        // Activar el cuerpo rígido para asegurarse de que no se desactive
        this.body.activate();

        // Restaurar la velocidad lineal y angular
        this.body.setLinearVelocity(currentLinearVelocity);
        this.body.setAngularVelocity(currentAngularVelocity);


    }

    lastTime: any = 0;
    applyJump() {

        if (!this.flyMode && !this.checkGrounded()) return;
        // const jumpImpulse = new this.Ammo.btVector3(0, 250, 0);
        const currentVelocity = this.body.getLinearVelocity();
        const jumpVelocity = new this.Ammo.btVector3(currentVelocity.x(), this.jumpVelocityMS + (!this.flyMode ? 0 : 10), currentVelocity.z());  // Ajustar la velocidad vertical
        this.body.setLinearVelocity(jumpVelocity);  //
        // const currentVelocity = this.body.getLinearVelocity();

        // console.log("jump")
        // const now = Date.now();
        // // this.checkCollision((col: any) => {
        // //     if (!col) {
        // //         console.log("El objeto no coliciona", "saltar")
        // //         return;
        // //     }
        // // console.log("jump")
        // const jumpImpulse = new this.Ammo.btVector3(0, 250, 0); // Ajusta este valor según sea necesario
        // // console.log(currentVelocity.y())
        // // if (currentVelocity.y() < 14) {
        // //     this.body.activate();
        //     this.body.applyCentralImpulse(jumpImpulse);
        // // } else {
        // //     console.log("Velocidad en Y demasiado alta, no se aplica el impulso de salto");
        // // }
        // // console.log(currentVelocity)
        // // this.body.activate();
        // // this.body.applyCentralImpulse(jumpImpulse);
        // // this.playAnimation("jump")
        // // })
        // this.lastTime = now;


    }
    applyImpulse(e: { x: number, y: number }) {
        if (e.x === 0 && e.y === 0) return;
        if (!this.Ammo) return;
        if (!this.body) return;
        if (!this.body.getLinearVelocity) return;

        const currentVelocity = this.body.getLinearVelocity();
        // if (!this.checkCollision()) {
        //     console.log("El objeto no coliciona", currentVelocity.y())
        //     return;
        // }

        // const scalingFactor = 0.27;
        let scalingFactor = 3;
        if (!this.flyMode && !this.checkGrounded()) {
            scalingFactor = 1
        }
        // const scalingFactor = 0.5;
        const direction = new THREE.Vector3(e.x, 0, e.y).applyQuaternion(this.camera!.quaternion);
        const impulse = new this.Ammo.btVector3(direction.x, 0, direction.z);
        impulse.op_mul(scalingFactor);
        this.body.activate();


        // Obtener la velocidad actual
        // Mantener la componente vertical de la velocidad
        const newVelocity = new this.Ammo.btVector3(impulse.x(), 0, impulse.z());
        // this.body.setLinearVelocity(newVelocity);
        // this.body.setLinearVelocity(impulse);
        // console.log("se detuvo", newVelocity)

        // if (this.actions.walk) {
        //     this.actions.walk.play();
        //     new SThread(1000 / 30, "moviendose", true).start(() => {
        //         this.mixer?.stopAllAction();
        //         this.actions.idle.play();
        //     })
        // }
        this.body.applyCentralImpulse(newVelocity);
    }

    inContact: boolean = false
    // checkCollision(callback: any) {
    //     const contactCallback = new this.Ammo.ConcreteContactResultCallback();
    //     console.log("Contact insctance")
    //     // @ts-ignore
    //     contactCallback.addSingleResult = (cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1) => {
    //         console.log("Contact callback")
    //         const contactPoint = this.Ammo.wrapPointer(cp, this.Ammo.btManifoldPoint);
    //         const distance = contactPoint.getDistance();

    //         if (distance <= 0.1) {
    //             callback({
    //                 distance: distance,
    //                 contactPoint: contactPoint,
    //             })
    //             this.inContact = true;
    //         } else {
    //             callback(false);
    //             console.log("no in contact")
    //             this.inContact = false;
    //         }
    //     };

    //     this.ammoWorld.contactTest(this.body, contactCallback);
    //     return this.inContact;
    // }

    throttledSendToServer() {
        const now = Date.now();
        if (now - this.lastSentTime >= this.throttleDelay) {
            this.sendToServer();
            this.lastSentTime = now;
        }
    }
    async sendToServer() {
        // if (!this.skinurl) return;
        SSocket.sendPromise({
            component: "avatar",
            type: "registro",
            key_scene: this.key_scene ?? "default",
            key_usuario: Model.usuario.Action.getKey(),
            data: {
                alias: Model.usuario.Action.getUsuarioLog()?.Nombres ?? "guest",
                position: this.mesh.position,
                rotation: this.mesh.rotation,
                scale: this.mesh.scale,
                camParams: this.camParams,
                currentAnimation: this.currentAnimation,
                skinurl: this.skinurl,

            }
        }).then(e => {

        }).catch(e => {

        })
    }
    async exitToScene() {
        return SSocket.sendPromise({
            component: "avatar",
            type: "exit",
            key_scene: this.key_scene ?? "default",
            key_usuario: Model.usuario.Action.getKey(),
        })
    }
    isGrounded = false;

    checkGrounded() {
        const numManifolds = this.ammoWorld.getDispatcher().getNumManifolds();
        for (let i = 0; i < numManifolds; i++) {
            const contactManifold = this.ammoWorld.getDispatcher().getManifoldByIndexInternal(i);
            const bodyA = this.Ammo.castObject(contactManifold.getBody0(), this.Ammo.btRigidBody);
            const bodyB = this.Ammo.castObject(contactManifold.getBody1(), this.Ammo.btRigidBody);

            // Verificar si uno de los cuerpos es el personaje (this.body)
            if (bodyA === this.body || bodyB === this.body) {
                const numContacts = contactManifold.getNumContacts();
                for (let j = 0; j < numContacts; j++) {
                    const contactPoint = contactManifold.getContactPoint(j);
                    const distance = contactPoint.getDistance();

                    // Si la distancia es <= 0, significa que está en contacto con algo
                    if (distance <= 0) {
                        return true;  // Está en contacto con el suelo u otro objeto
                    }
                }
            }
        }
        return false;  // No está en contacto con el suelo
    }
    onCollisionDetect(bodyA: any, bodyB: any, numContacts: any, contactManifold: any) {
        if (bodyA === this.body || bodyB === this.body) {
            const numContacts = contactManifold.getNumContacts();
            for (let j = 0; j < numContacts; j++) {
                const contactPoint = contactManifold.getContactPoint(j);
                const distance = contactPoint.getDistance();

                // Si la distancia es <= 0, significa que está en contacto con algo
                if (distance <= 0) {
                    this.isGrounded = true;
                    // return true;  // Está en contacto con el suelo u otro objeto
                } else {
                    this.isGrounded = false;
                }
            }
        }
    }

}