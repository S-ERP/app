import SSocket from "servisofts-socket";
import * as THREE from "three"
import Model from "../../Model";
import { SUuid } from "servisofts-component";

type XYZ = { x: number, y: number, z: number };
export default class Attack extends THREE.Group {

    static ATTACKS: Attack[] = [];

    static update({ delta = 1 }) {
        Attack.ATTACKS.forEach(e => {
            if (e && e.update)
                e.update({ delta: delta });
        })
    }
    static onCollisionDetect(body0: any, body1: any, numContacts: any, contactManifold: any) {
        Attack.ATTACKS.forEach(e => {
            if (e && e.onCollisionDetect)
                e.onCollisionDetect(body0, body1, numContacts, contactManifold);
        })
    }
    static sharedGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    static sharedMaterial = new THREE.MeshBasicMaterial({ color: 0xDE47E1 });

    // projectileGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    // projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    projectileMesh = new THREE.Mesh(Attack.sharedGeometry, Attack.sharedMaterial);
    projectileBody?: any
    props;
    key;
    constructor(props: { position: XYZ, direcction: XYZ, key_scene: string, velocity: number, Ammo: any, physicsWorld: any, scene: THREE.Scene, otherUser: boolean }) {
        super();
        this.key = SUuid();
        this.props = props;
        this.name = "Attack";
        this.userData.ignoreForRaycast = true;
        this.add(this.projectileMesh)
        this.projectileMesh.position.set(props.position.x, props.position.y, props.position.z);
        this.props.scene.add(this);
        this.notifyServer();
        this.createBody();
        this.applyVelocity();

    }

    notifyServer() {
        if (this.props.otherUser) return;
        SSocket.send({
            component: "scene",
            type: "notify",
            event: "attack",
            key_scene: this.props.key_scene,
            key_usuario: Model.usuario.Action.getKey(),
            data: {
                key: this.key,
                position: this.props.position,
                direcction: this.props.direcction,
                velocity: this.props.velocity,
            }
        })
    }

    createBody() {
        const { Ammo, physicsWorld } = this.props;
        const transform = new Ammo.btTransform();
        const sphereShape = new Ammo.btSphereShape(0.05);
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(this.props.position.x, this.props.position.y, this.props.position.z));

        const motionState = new Ammo.btDefaultMotionState(transform);
        const mass = 0.01; // Definir la masa del proyectil
        const localInertia = new Ammo.btVector3(0, 0, 0);
        sphereShape.calculateLocalInertia(mass, localInertia);

        const rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, sphereShape, localInertia);
        this.projectileBody = new Ammo.btRigidBody(rigidBodyInfo);
        this.projectileBody.name = "attack";
        // Añadir el cuerpo físico a la simulación
        // Configurar parámetros para CCD
        const ccdMotionThreshold = 0.01; // Umbral de movimiento para activar CCD
        const ccdSweptSphereRadius = 0.05; // Radio del "esfuerzo" de la CCD (ajusta según el tamaño de tu bala)
        // Habilitar la CCD para la bala
        this.projectileBody.setCcdMotionThreshold(ccdMotionThreshold);
        this.projectileBody.setCcdSweptSphereRadius(ccdSweptSphereRadius);
        // this.projectileBody.setRestitution(0);

        this.projectileBody.setRestitution(0);  // Evitar que la bala rebote
        this.projectileBody.setFriction(0.9);   // Ajustar la fricción si es necesario
        // this.projectileBody.setDamping(0.1, 0.1); // Ajustar el damping lineal y angular (opcional)
        this.projectileBody.setDamping(0, 0); // Ajustar el damping lineal y angular (opcional)

        physicsWorld.addRigidBody(this.projectileBody);
        Attack.ATTACKS.push(this);
    }

    applyVelocity() {
        const { Ammo, physicsWorld, direcction } = this.props;

        // const force = 3; // Ajusta la magnitud de la fuerza según lo que desees
        // const impulse = new Ammo.btVector3(direcction.x * force, direcction.y * force, direcction.z * force);;
        // this.projectileBody.applyCentralImpulse(impulse);

        // Velocidad típica de una bala de 9mm (~350 m/s)
        const bulletSpeed = this.props.velocity ?? 350; // Velocidad en metros por segundo
        // Crear el vector de velocidad a partir de la dirección normalizada
        const velocity = new Ammo.btVector3(
            direcction.x * bulletSpeed,
            direcction.y * bulletSpeed,
            direcction.z * bulletSpeed
        );
        // Aplicar la velocidad lineal al cuerpo físico de la bala
        this.projectileBody.setLinearVelocity(velocity);
    }
    previousVelocity = new THREE.Vector3();  // Guardar la velocidad previa
    detectTrajectoryChange() {
        // Obtener la velocidad actual del cuerpo de la bala
        const currentVelocity = this.projectileBody.getLinearVelocity();
        const currentVelocityVector = new THREE.Vector3(currentVelocity.x(), currentVelocity.y(), currentVelocity.z());

        // Comparar la dirección actual con la dirección previa
        const velocityChange = this.previousVelocity.distanceTo(currentVelocityVector);

        // Definir una tolerancia para detectar colisiones
        const threshold = 100;  // Ajusta este valor según la sensibilidad deseada

        if (velocityChange > threshold) {
            console.log("Cambio en la trayectoria detectado, posible colisión",velocityChange);
            this.delete();
            // this.handleCollision();
        }

        // Actualizar la velocidad previa
        this.previousVelocity.copy(currentVelocityVector);
    }
    createLineBetweenPoints(startPosition: any, endPosition: any) {
        const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const points = [];

        // Añadir puntos para la línea
        points.push(startPosition);
        points.push(endPosition);

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        // Añadir la línea a la escena
        this.props.scene.add(line);

        console.log(`Línea creada entre ${startPosition} y ${endPosition}`);
    }
    onCollisionDetect(body0: any, body1: any, numContacts: any, contactManifold: any) {
        if (body0 === this.projectileBody || (body1 === this.projectileBody)) {
            const meshID = (body0 === this.projectileBody) ? body1.id : body0.id;

            // this.props.physicsWorld.removeRigidBody(this.projectileBody);
            // this.props.Ammo.destroy(this.projectileBody);
            // this.projectileBody = null;
            // if (body0.name == "personaje" || body1 == "personaje") return;
            if (meshID) {
                const otherMesh = this.props.scene.getObjectById(meshID);
                if (otherMesh) {
                    console.log("ID", meshID)

                    const contactPoint = contactManifold.getContactPoint(0);
                    const impactPointA = contactPoint.getPositionWorldOnA();
                    const impactPointB = contactPoint.getPositionWorldOnB();

                    const impactPositionWorld = (body0 === this.projectileBody) ? impactPointB : impactPointA;
                    this.delete();

                    // const impactPositionWorld = new THREE.Vector3(contactPoint.getPositionWorldOnA().x(), contactPoint.getPositionWorldOnA().y(), contactPoint.getPositionWorldOnA().z());

                    // Convertir la posición de impacto del mundo a coordenadas locales del objeto colisionado
                    const impactPosition = new THREE.Vector3(impactPositionWorld.x(), impactPositionWorld.y(), impactPositionWorld.z());

                    const impactPositionLocal = otherMesh.worldToLocal(impactPosition.clone());
                    const worldScale = new THREE.Vector3();
                    otherMesh.matrixWorld.decompose(new THREE.Vector3(), new THREE.Quaternion(), worldScale);


                    const originalScale = this.projectileMesh.scale.clone();


                    otherMesh.add(this.projectileMesh);  // Añadir la bala al objeto colisionado

                    // 6. Restaurar la escala original de la bala para que no herede la escala del grupo

                    const scaleFactorX = originalScale.x / worldScale.x;
                    const scaleFactorY = originalScale.y / worldScale.y;
                    const scaleFactorZ = originalScale.z / worldScale.z;

                    // 7. Aplicar la compensación de escala
                    this.projectileMesh.scale.set(scaleFactorX, scaleFactorY, scaleFactorZ);
                    this.projectileMesh.position.copy(impactPositionLocal);
                    console.log(otherMesh.name,impactPositionLocal)

                    // const group = new THREE.Group();
                    // group.position.copy(impactPositionLocal);
                    // // Añadir la bala al grupo intermedio
                    // group.add(this.projectileMesh);

                    // this.projectileMesh.position.set(0, 0, 0)
                    // // Añadir el grupo al objeto colisionado
                    // otherMesh.add(group);
                    // group.scale.set(1, 1, 1)


                    // 3. Ajustar la posición de la bala en las coordenadas locales
                    // this.projectileMesh.position.copy(impactPositionLocal);
                    // const originalScale = this.projectileMesh.scale.clone();

                    // // 4. Adjuntar la malla de la bala al objeto colisionado
                    // otherMesh.add(this.projectileMesh);  // Añadir la malla de la bala al objeto colisionado

                    // // 5. Restaurar la escala original de la bala después de añadirla
                    // this.projectileMesh.scale.copy(originalScale);
                }
            }

            // for (let j = 0; j < numContacts; j++) {
            //     const contactPoint = contactManifold.getContactPoint(j);
            //     const distance = contactPoint.getDistance();
            //     console.log(distance);

            //     // Obtener el punto de impacto en el espacio mundial
            //     const impactPointA = contactPoint.getPositionWorldOnA();
            //     const impactPointB = contactPoint.getPositionWorldOnB();

            //     // Convertir el punto a coordenadas legibles
            //     // const impactA = {
            //     //     x: impactPointA.x(),
            //     //     y: impactPointA.y(),
            //     //     z: impactPointA.z()
            //     // };
            //     // const impactB = {
            //     //     x: impactPointB.x(),
            //     //     y: impactPointB.y(),
            //     //     z: impactPointB.z()
            //     // };
            //     const impactPoint = (body0 === this.projectileBody) ? impactPointB : impactPointA;
            //     // this.projectileMesh.position.set(impactPoint.x, impactPoint.y, impactPoint.z);

            //     // const currentPosition = this.projectileMesh.position;
            //     // const impactPosition = new THREE.Vector3(impactPoint.x, impactPoint.y, impactPoint.z);

            //     // currentPosition.lerp(impactPosition, 0.1);

            //     const impactPosition = new THREE.Vector3(impactPoint.x(), impactPoint.y(), impactPoint.z());
            //     const currentPosition = this.projectileMesh.position.clone();

            //     // this.createLineBetweenPoints(currentPosition, impactPosition);

            //     this.projectileMesh.position.set(impactPosition.x, impactPosition.y, impactPosition.z);
            //     // if (body0 === this.projectileBody) {
            //     //     this.projectileMesh.position.set(impactA.x, impactA.y, impactA.z);
            //     // } else {
            //     //     this.projectileMesh.position.set(impactB.x, impactB.y, impactB.z);
            //     // }

            //     // this.projectileMaterial.color = new THREE.Color(0x000000);
            //     // Llamar a la función que maneja la colisión y pasar los puntos de impacto
            //     // Attack.onCollisionDetect(body0, body1, impactA, impactB);
            // }


            // this.delete();

            // this.parent?.remove(this);
            // this.parent.remove(this)
            // console.log("Impacto detectado body0", body0.name, body1.name);
        }


    }
    delete() {
        const { Ammo, physicsWorld } = this.props;
        const index = Attack.ATTACKS.findIndex(a => a == this);
        if (index !== -1) {

            Attack.ATTACKS.splice(index, 1);  // Eliminar de la lista de ataques
            this.props.physicsWorld.removeRigidBody(this.projectileBody);
            // this.props.scene?.remove(this);  // Eliminar de la escena de Three.js
            Ammo.destroy(this.projectileBody);  // Liberar memoria en Ammo.js
            this.projectileBody = null;  // Evitar referencias a objetos ya destruidos
        }
    }
    update({ delta = 1 }) {
        const { Ammo, physicsWorld } = this.props;
        const motionState = this.projectileBody.getMotionState();
        if (motionState) {
            const transform = new Ammo.btTransform();
            motionState.getWorldTransform(transform);

            const origin = transform.getOrigin();
            const rotation = transform.getRotation();

            this.projectileMesh.position.set(origin.x(), origin.y(), origin.z());
            this.projectileMesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
            // this.detectTrajectoryChange();
            if (origin.y() < -10) {
                this.delete()
                // Eliminar la bala si su posición en Y es menor a -100

            }
        }

        // const numManifolds = physicsWorld.getDispatcher().getNumManifolds();

        // for (let i = 0; i < numManifolds; i++) {
        //     const contactManifold = physicsWorld.getDispatcher().getManifoldByIndexInternal(i);
        //     const bodyA = Ammo.castObject(contactManifold.getBody0(), Ammo.btRigidBody);
        //     const bodyB = Ammo.castObject(contactManifold.getBody1(), Ammo.btRigidBody);
        //     // Verifica si bodyA o bodyB es el proyectil
        //     if (bodyA === this.projectileBody || bodyB === this.projectileBody) {
        //         // ¡Colisión detectada! Realiza acciones como dañar al enemigo
        //         const data0 = bodyA.name;
        //         const data1 = bodyB.name;
        //         // console.log("Impacto detectado", data0, data1);
        //     }
        // }
    }
    // Posicionar el proyectil en la escena

}