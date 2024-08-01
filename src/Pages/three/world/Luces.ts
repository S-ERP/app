import * as THREE from 'three';

export default class Luces {
    scene: THREE.Scene;
    radius = 20;
    constructor(scene: THREE.Scene, radius?: number) {
        this.scene = scene;
        this.radius = radius ?? this.radius;
        this.init();
    }
    init() {
        const ambientLight = new THREE.AmbientLight(0x707070, 0.1);
        // const ambientLight = new THREE.AmbientLight(0x707070, 1);
        this.scene.add(ambientLight);

        const sunLight = new THREE.PointLight(0xffffff, Math.pow(this.radius, 2), Math.pow(this.radius, 2));
        // const sunLight = new THREE.DirectionalLight(0xffffff, 100);

        sunLight.position.set(30, this.radius, 100);

        this.scene.add(new THREE.PointLightHelper(sunLight));
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 512;
        sunLight.shadow.mapSize.height = 512;
        // sunLight.shadow.camera.near = 0.5;
        // sunLight.shadow.camera.far = 200;
        // sunLight.shadow.bias = -0.00009;

        // sunLight.shadow.camera.left = -50;
        // sunLight.shadow.camera.right = 50;
        // sunLight.shadow.camera.top = 50;
        // sunLight.shadow.camera.bottom = -50;
        sunLight.shadow.bias = -0.00005;

        // this.scene.add(sunLight);

    }
}