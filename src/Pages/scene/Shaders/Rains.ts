import * as THREE from 'three';

const rainIntesity = 100;
export class Rain {
    rain: THREE.Points;

    constructor(scene: THREE.Scene, numDrops: number = 5000) {  // Aumenté el número de gotas
        const rainGeometry = new THREE.BufferGeometry();
        const rainMaterial = new THREE.PointsMaterial({
            color: 0xAAAAff,
            size: 0.05,  // Tamaño de las gotas de lluvia
            sizeAttenuation: true
        });

        const positions = [];
        const rainDistance = rainIntesity;  // Distancia máxima para las gotas
        const rainHeight = rainIntesity;    // Altura desde donde cae la lluvia

        for (let i = 0; i < numDrops; i++) {
            const x = THREE.MathUtils.randFloatSpread(rainDistance);
            const y = THREE.MathUtils.randFloat(0, rainHeight);
            const z = THREE.MathUtils.randFloatSpread(rainDistance);

            positions.push(x, y, z);
        }

        rainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        this.rain = new THREE.Points(rainGeometry, rainMaterial);

        scene.add(this.rain);
    }

    update(props: { delta: number, camera: THREE.PerspectiveCamera }) {
        const positions = this.rain.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] -= THREE.MathUtils.randFloat(20, 50) * props.delta;  // Velocidad de caída de las gotas

            // Reiniciar la posición de la gota si ha caído por debajo de un umbral
            if (positions[i + 1] < -5) {
                positions[i + 1] = THREE.MathUtils.randFloat(0, rainIntesity);  // Vuelve a la altura original
            }
        }

        this.rain.geometry.attributes.position.needsUpdate = true;

        // Mantener la lluvia siguiendo la cámara
        this.rain.position.set(props.camera.position.x, props.camera.position.y, props.camera.position.z);
    }
}