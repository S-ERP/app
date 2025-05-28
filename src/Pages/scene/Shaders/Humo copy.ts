
import * as THREE from "three"
const fragmentShader = `
uniform float uTime;
uniform vec3 uColor;
varying vec2 vUv;
varying vec3 vViewPosition;

float random(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    
    return mix(mix(random(i), random(i + vec2(1.0, 0.0)), u.x),
               mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    
    for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    
    return value;
}

void main() {
    vec2 uv = vUv * 5.0;  // Escalar las coordenadas UV para que el humo se repita
    float n = fbm(uv + uTime * 0.1);
    
    // Ajustar la opacidad del humo basado en el ruido
    float opacity = smoothstep(0.3, 0.7, n);
    
    // Color del humo con variación en el tiempo
    vec3 color = uColor * (n * 0.5 + 0.5);
    
    gl_FragColor = vec4(color, opacity);
}
`;

const vertexShader = `
varying vec2 vUv;
varying vec3 vViewPosition;

void main() {
    vUv = uv;
    vViewPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export default class HumoVolumetrico extends THREE.Mesh {
    time = 0;
    material;
    constructor(scene: THREE.Scene) {
        const geometry = new THREE.PlaneGeometry(50, 50, 100, 100);
        const material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                uTime: { value: 0.0 },
                uColor: { value: new THREE.Color(0.6, 0.6, 0.6) },
            },
            transparent: true,
            depthWrite: false,
        });

        super(geometry, material);
        this.material = material;
        scene.add(this);
        this.rotateX(-Math.PI / 2);
        this.position.y = 0.5;
        this.scale.set(10, 10, 1);

        this.time = 0;
    }

    update(props: { delta: any }) {
        this.time += props.delta * 0.1;
        this.material.uniforms.uTime.value = this.time;
    }
}