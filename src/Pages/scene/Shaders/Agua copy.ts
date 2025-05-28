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




import * as THREE from "three"
const shaderCode = `// Copyright Inigo Quilez, 2016 - https://iquilezles.org/
// I am the sole copyright owner of this Work.
// You cannot host, display, distribute or share this Work neither
// as it is or altered, here on Shadertoy or anywhere else, in any
// form including physical and digital. You cannot use this Work in any
// commercial or non-commercial product, website or project. You cannot
// sell this Work and you cannot mint an NFTs of it or train a neural
// network with it without permission. I share this Work for educational
// purposes, and you can link to it, through an URL, proper attribution
// and unmodified screenshot, as part of your educational material. If
// these conditions are too restrictive please contact me and we'll
// definitely work it out.

// A rainforest landscape.
//
// Tutorial on Youtube : https://www.youtube.com/watch?v=BFld4EBO2RE
// Tutorial on Bilibili: https://www.bilibili.com/video/BV1Da4y1q78H
//
// Buy a metal or paper print: https://www.redbubble.com/shop/ap/39843511
//
// Normals are analytical (true derivatives) for the terrain and for the
// clouds, including the noise, the fbm and the smoothsteps.
//
// Lighting and art composed for this shot/camera. The trees are really
// ellipsoids with noise, but they kind of do the job in distance and low
// image resolutions Also I used some basic reprojection technique to 
// smooth out the render.
//
// See here for more info: 
//  https://iquilezles.org/articles/fbm
//  https://iquilezles.org/articles/morenoise


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 p = fragCoord/iResolution.xy;

    vec3 col = texture( iChannel0, p ).xyz;
  //vec3 col = texelFetch( iChannel0, ivec2(fragCoord-0.5), 0 ).xyz;

    col *= 0.5 + 0.5*pow( 16.0*p.x*p.y*(1.0-p.x)*(1.0-p.y), 0.05 );
         
    fragColor = vec4( col, 1.0 );
}

`;


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
            vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
            `,
            fragmentShader: `
uniform float iTime;
    uniform vec3 iResolution;
    uniform vec2 iMouse;
    
    ${shaderCode} // Aquí pones el código del shader que compartiste

    void main() {
      mainImage(gl_FragColor, gl_FragCoord.xy);
    }            
            `,
            uniforms: {
                iTime: { value: 0.0 },
                iResolution: { value: new THREE.Vector3(2048, 2048, 1) },
                iMouse: { value: new THREE.Vector2(0, 0) }
            },
            side: THREE.DoubleSide,
            transparent: true,
        });

        super(new THREE.PlaneGeometry(10, 10, 1, 1), material);
        scene.add(this);
        this.rotateX(-Math.PI / 2);
        this.position.y = 0.5;
        // this.scale.set(10, 10, 2)

        this.lights = lights;
    }

    time = 0;
    lights: THREE.Light[];

    update(props: { delta: any }) {
        const material = this.material as THREE.ShaderMaterial;

        this.time += props.delta;
        material.uniforms.iTime.value = this.time;

        // const lightPositions = material.uniforms.uLightPositions.value as THREE.Vector3[];
        // const lightColors = material.uniforms.uLightColors.value as THREE.Color[];

        // for (let i = 0; i < this.lights.length; i++) {
        //     lightPositions[i].copy(this.lights[i].position);
        //     lightColors[i].copy((this.lights[i] as any).color || new THREE.Color(1, 1, 1));
        // }

        material.needsUpdate = true;
    }
}
