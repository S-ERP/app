import { Platform } from 'react-native';
import SSocket from 'servisofts-socket';
import * as THREE from 'three';
import Model from '../../Model';

const resolution = Platform.select({ web: 0.005, native: 0.005 });
export default class FirstPersonControls {
    sendServer = false;
    constructor(camera, sendServer) {
        this.sendServer = sendServer;
        this.camera = camera;
        this.baseMoveSpeed = 10 * 2;
        this.moveSpeed = this.baseMoveSpeed;
        this.rotationSpeed = 0.03;
        this.speedMultiplier = 3;
        this.rotation = new THREE.Vector2();
        this.targetRotation = new THREE.Vector2();
        this.dampingFactor = 0.1;
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.velocity = new THREE.Vector3();
        this.shiftPressed = false;
        this.time = 0;
        this.headBobOffset = new THREE.Vector3();

        if (Platform.OS === 'web') {
            window.addEventListener('keydown', this.handleKeyDown.bind(this), false);
            window.addEventListener('keyup', this.handleKeyUp.bind(this), false);
            window.addEventListener('mousedown', this.handleMouseDown.bind(this), false);
            window.addEventListener('mouseup', this.handleMouseUp.bind(this), false);
            window.addEventListener('mousemove', this.handleMouseMove.bind(this), false);
        }
    }

    handleKeyDown(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.velocity.z = this.moveSpeed;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.velocity.z = -this.moveSpeed;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.velocity.x = -this.moveSpeed;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.velocity.x = this.moveSpeed;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.shiftPressed = true;
                this.moveSpeed = this.baseMoveSpeed * this.speedMultiplier;
                // if (this.velocity.z > 0) this.velocity.z = this.moveSpeed
                // if (this.velocity.z < 0) this.velocity.z = -this.moveSpeed
                // if (this.velocity.x > 0) this.velocity.z = this.moveSpeed
                // if (this.velocity.x < 0) this.velocity.z = -this.moveSpeed
                break;
        }
    }

    handleKeyUp(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
            case 'ArrowDown':
            case 'KeyS':
                this.velocity.z = 0;
                break;
            case 'ArrowLeft':
            case 'KeyA':
            case 'ArrowRight':
            case 'KeyD':
                this.velocity.x = 0;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.shiftPressed = false;
                this.moveSpeed = this.baseMoveSpeed;
                break;
        }
    }

    handleMouseDown(event) {
        if (event.button === 0) {
            this.isLeftMouseDown = true;
        }
    }

    handleMouseUp(event) {
        if (event.button === 0) {
            this.isLeftMouseDown = false;
        }
    }

    handleMouseMove(event) {
        if (this.isLeftMouseDown) {
            //   this.targetRotation.y -= event.movementX * this.rotationSpeed;
            //   this.targetRotation.x -= event.movementY * this.rotationSpeed;
        }
    }

    handleGesture(deltaX, deltaY) {
        const rotationSpeed = Platform.select({ web: 0.0005, native: 0.003 });
        this.targetRotation.y -= deltaX * rotationSpeed;
        this.targetRotation.x -= deltaY * rotationSpeed;
    }
    async sendToServer() {


        if (!this.previousPosition) {
            this.previousPosition = new THREE.Vector3().copy(this.camera.position);
        }
        if (!this.previousRotation) {
            this.previousRotation = new THREE.Vector2().copy(this.rotation);
        }

        // Comparar la posición actual con la anterior
        if (!this.camera.position.equals(this.previousPosition)) {
            // || !this.rotation.equals(this.previousRotation)
            // Enviar datos al servidor (ejemplo de petición)
            const currentTime = Date.now();
            if (!this.lastSentTime || currentTime - this.lastSentTime >= 250) {
                SSocket.sendPromise({
                    component: "camera",
                    type: "registro",
                    data: {
                        descripcion: Model.usuario.Action.getUsuarioLog()?.Nombres,
                        data: {
                            position: this.camera.position,
                            scale: this.camera.scale,
                            rotation: this.camera.rotation,
                            rotation_fp: this.rotation,
                        }
                    },
                    key_usuario: Model.usuario.Action.getKey(),
                    key_empresa: Model.empresa.Action.getKey(),
                }).then(response => {
                }).catch(error => {
                    console.error('Error de red:', error);
                });

                // Actualizar la posición anterior
                this.previousPosition.copy(this.camera.position);
                this.lastSentTime = currentTime;
            }

        }
    }
    async update(delta) {
        try {


            this.time += delta;
            this.rotation.x += this.targetRotation.x * this.dampingFactor;
            this.rotation.y += this.targetRotation.y * this.dampingFactor;
            this.targetRotation.y = 0;
            this.targetRotation.x = 0;

            const euler = new THREE.Euler(this.rotation.x, this.rotation.y, 0, 'YXZ');
            this.camera.quaternion.setFromEuler(euler);

            const direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction);

            const right = new THREE.Vector3();
            right.crossVectors(this.camera.up, direction).normalize();

            const moveDirection = new THREE.Vector3();
            moveDirection.addScaledVector(direction, this.velocity.z * resolution);
            moveDirection.addScaledVector(right, -this.velocity.x * resolution);

            moveDirection.y = 0; // Aseguramos que no haya movimiento en el eje Y
            this.camera.position.add(moveDirection);


            // if (this.velocity.x != 0 || this.velocity.z != 0) {

            //     const headBobFrequency = this.shiftPressed ? 20 : 10; // Ajustar la frecuencia según la velocidad
            //     const headBobAmount = 0.005; // Aumentar la cantidad para exagerar el efecto
            //     this.headBobOffset.y = Math.sin(this.time * headBobFrequency) * headBobAmount;
            // } else {
            //     this.headBobOffset.y = 0;
            // }

            // this.camera.position.add(this.headBobOffset);
            try {
                if (!this.sendServer) return;
                this.sendToServer();
            } catch (error) {
                console.error(error)
            }
        } catch (error) {
            console.error(error)
        }
    }
}
