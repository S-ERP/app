import * as THREE from "three"
const fragmentShader = `
varying vec2 vUv;
varying float vWave;
varying vec3 vNormal;
varying vec3 vViewPosition;

uniform float uTime;
uniform int uNumLights;
uniform vec3 uLightPositions[10]; // Suponiendo un máximo de 10 luces
uniform vec3 uLightColors[10];

void main() {
    vec3 waterColor = vec3(0.1, 0.3, 0.8); // Un azul más vibrante
    float wave = sin(vWave * 10.0 + uTime * 2.0);
    vec3 color = waterColor * 0.3; // Color base con una ligera reducción en la intensidad

    // Sumar la contribución de cada luz
    for (int i = 0; i < uNumLights; i++) {
        vec3 lightDirection = normalize(uLightPositions[i] - vViewPosition);
        float diffuse = max(dot(vNormal, lightDirection), 0.2);
        color += waterColor * diffuse * uLightColors[i] * 0.7; // Reducir la influencia de las luces
    }

    color += wave * 0.05;

    float alpha = 0.8 + wave * 0.1;
    gl_FragColor = vec4(color, alpha);
}
`;

const vertexShader = `
varying vec2 vUv;
varying float vWave;
varying vec3 vNormal;
varying vec3 vViewPosition;

uniform float uTime;

void main() {
    vUv = uv;
    float direction = -1.0;
    float wave = sin((position.x + uTime * 2.0) * 10.0) * 0.05 + 
                 sin((position.y + uTime * 2.0) * 15.0) * 0.05;
    vec3 newPosition = position + normal * wave * direction;
    vNormal = normalize(normalMatrix * normal);
    vViewPosition = (modelViewMatrix * vec4(newPosition, 1.0)).xyz;

    vWave = wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}`;

export default class Agua extends THREE.Mesh {
    constructor(scene: THREE.Scene) {
        const lights: THREE.Light[] = [];
        scene.traverse((object) => {
            // @ts-ignore
            if (object.isLight) {
                lights.push(object as THREE.Light);
            }
        });
        const maxLights = 10;
        const lightPositions = new Array(maxLights).fill(new THREE.Vector3(0, 0, 0));
        const lightColors = new Array(maxLights).fill(new THREE.Color(0, 0, 0));

        const material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                uTime: { value: 0.0 },
                uNumLights: { value: lights.length },
                uLightPositions: { value: lightPositions },
                uLightColors: { value: lightColors },
            },
            side: THREE.DoubleSide,
            transparent: true,
        });

        super(new THREE.PlaneGeometry(50, 50, 100, 100), material);
        scene.add(this);
        this.rotateX(-Math.PI / 2);
        this.position.y = 0.5;
        this.scale.set(10, 10, 2)

        this.lights = lights;
    }

    time = 0;
    lights: THREE.Light[];

    update(props: { delta: any }) {
        const material = this.material as THREE.ShaderMaterial;

        this.time += props.delta * 0.1;
        material.uniforms.uTime.value = this.time;

        const lightPositions = material.uniforms.uLightPositions.value as THREE.Vector3[];
        const lightColors = material.uniforms.uLightColors.value as THREE.Color[];

        for (let i = 0; i < this.lights.length; i++) {
            lightPositions[i].copy(this.lights[i].position);
            lightColors[i].copy((this.lights[i] as any).color || new THREE.Color(1, 1, 1));
        }

        material.needsUpdate = true;
    }
}
