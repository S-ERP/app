import * as THREE from 'three';

export class StarrySky {
    stars: THREE.Points;

    constructor(scene: THREE.Scene, numStars: number = 5000) {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.5,  // Tamaño de las estrellas
            sizeAttenuation: true
        });

        const positions = [];
        const starDistanceMin = 800;  // Distancia mínima para las estrellas
        const starDistanceMax = 1100;  // Distancia máxima para las estrellas

        for (let i = 0; i < numStars; i++) {
            // Generar una posición esférica aleatoria para las estrellas
            const r = THREE.MathUtils.randFloat(starDistanceMin, starDistanceMax);
            const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
            const phi = THREE.MathUtils.randFloat(0, Math.PI);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions.push(x, y, z);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        this.stars = new THREE.Points(starGeometry, starMaterial);

        scene.add(this.stars);
    }

    update(props: { delta: number, camera: THREE.PerspectiveCamera }) {
        this.stars.position.set(props.camera.position.x, props.camera.position.y, props.camera.position.z);
        // Si quieres animar algo, puedes hacerlo aquí.
    }
}

