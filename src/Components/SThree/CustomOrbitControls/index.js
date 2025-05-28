import { Platform } from 'react-native';
import * as THREE from 'three';

export default class CustomOrbitControls {
  constructor(camera) {
    this.camera = camera;
    this.zoom = 20;
    this.rotation = new THREE.Vector2(); // Rotación actual
    this.targetRotation = new THREE.Vector2(); // Rotación objetivo
    this.dampingFactor = 0.1; // Amortiguamiento
    this.pan = {
      x: 0,
      y: 0,
      z: 0
    };
    this.isMiddleMouseDown = false;

    if (Platform.OS === 'web') {
      window.addEventListener('wheel', this.handleWheel.bind(this), false);
      window.addEventListener('mousedown', this.handleMouseDown.bind(this), false);
      window.addEventListener('mouseup', this.handleMouseUp.bind(this), false);
      window.addEventListener('mousemove', this.handleMouseMove.bind(this), false);
    }
  }

  handleWheel(event) {
    const zoomSpeed = 0.05;
    this.zoom += event.deltaY * zoomSpeed;
    this.zoom = Math.max(1, Math.min(100, this.zoom)); // Limitar el zoom a un rango razonable
    this.update();
  }

  handleMouseDown(event) {
    if (event.button === 1) { // 1 es el botón central del mouse
      this.isMiddleMouseDown = true;
    }
  }

  handleMouseUp(event) {
    if (event.button === 1) { // 1 es el botón central del mouse
      this.isMiddleMouseDown = false;
    }
  }

  handleMouseMove(event) {
    if (this.isMiddleMouseDown) {
      const panSpeed = 0.0005;
      this.pan.x -= event.movementX * panSpeed;
      this.pan.y += event.movementY * panSpeed;
      this.update();
    }
  }

  handleGesture(deltaX, deltaY) {
    const rotationSpeed = Platform.select({ web: 0.00005, native: 0.003 });
    this.targetRotation.y -= deltaX * rotationSpeed;
    this.targetRotation.x -= deltaY * rotationSpeed;
    this.update();
  }

  setZoom(n) {
    this.zoom = n;
    this.update();
  }

  update() {
    // Limitar la rotación en el eje X para evitar que la cámara gire completamente
    const minPolarAngle = -Math.PI / 2 + 0.1; // ángulo mínimo de rotación
    const maxPolarAngle = Math.PI / 2 - 0.1; // ángulo máximo de rotación

    // Interpolación suave entre la rotación actual y la rotación objetivo
    this.rotation.x += (this.targetRotation.x - this.rotation.x) * this.dampingFactor;
    this.rotation.y += (this.targetRotation.y - this.rotation.y) * this.dampingFactor;

    this.rotation.x = Math.max(minPolarAngle, Math.min(maxPolarAngle, this.rotation.x)); // Limitar la rotación en X

    // Crear una matriz de rotación
    const euler = new THREE.Euler(this.rotation.x, this.rotation.y, 0, 'YXZ');
    const quat = new THREE.Quaternion().setFromEuler(euler);

    // Aplicar la rotación a la cámara
    this.camera.quaternion.copy(quat);

    // Mantener la distancia de la cámara con respecto al centro
    const distance = new THREE.Vector3(0, 0, this.zoom);
    distance.applyQuaternion(quat); // Aplicar la rotación a la posición
    this.camera.position.set(this.pan.x + distance.x, this.pan.y + distance.y, this.pan.z + distance.z);

    // Asegurarse de que la cámara siempre apunte al origen
    this.camera.lookAt(this.pan.x, this.pan.y, 0);
  }
}
