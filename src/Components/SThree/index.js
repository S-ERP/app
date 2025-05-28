import * as THREE from 'three';
import CustomOrbitControls from "./CustomOrbitControls"
import Stats from './Stats';
export {
    CustomOrbitControls,
    Stats,
}

export const Renderer = (gl, width, height) => {
    return RendererCofigurate(new THREE.WebGLRenderer({ canvas: gl.canvas, antialias: false, powerPreference: "low-power" }), width, height, gl)
}
export const RendererCofigurate = (renderer, width, height, gl) => {
    renderer.setClearAlpha(0);
    // renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    // renderer.setPixelRatio(0.5);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    // renderer.domElement.style.backgroundColor = '#f0f';

    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.antialias = false;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = 1;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    // @ts-ignore
    renderer.outputEncoding = THREE.sRGBEncoding;
    // @ts-ignore
    renderer.physicallyCorrectLights = true;
    // @ts-ignore
    renderer.shadowMap.renderReverseSided = false;
    // @ts-ignore
    renderer.shadowMap.soft = true;
    return renderer;
}
export const loadAsset = async (requireObj) => {
    return {
        localUri: requireObj.default
    }
}
export class TextureLoader extends THREE.TextureLoader {

}