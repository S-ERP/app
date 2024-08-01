import ExpoTHREE, { Renderer as _Renderer, TextureLoader as _TextureLoader, THREE } from 'expo-three';

import { Asset } from 'expo-asset';
import { PixelRatio } from 'react-native';
export const Renderer = (gl, width, height) => {
    console.log(gl);
    const _gl = gl
    const pixelStorei = _gl.pixelStorei.bind(_gl)
    _gl.pixelStorei = function (...args) {
        const [parameter] = args
        switch (parameter) {
            case _gl.UNPACK_FLIP_Y_WEBGL: return pixelStorei(...args)
        }
    }
    return RendererCofigurate(new _Renderer({ gl: _gl, antialias: false, powerPreference: "low-power" }), width, height);
}

export const RendererCofigurate = (renderer: THREE.WebGLRenderer, width, height) => {
    renderer.setClearAlpha(0);
    console.log(pixelRatio)
    const pixelRatio = 1
    THREE.suppressMetroWarnings();
    // renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(width * pixelRatio, height * pixelRatio, false);
    renderer.setPixelRatio(pixelRatio);
    // renderer.setPixelRatio(0.5);
    // renderer.setSize(width * 0.5, height * 0.5);
    renderer.antialias = false;

    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // renderer.toneMappingExposure = 1;


    // @ts-ignore
    // renderer.outputEncoding = THREE.sRGBEncoding;
    // @ts-ignore
    // renderer.physicallyCorrectLights = true;
    renderer.physicallyCorrectLights = true;
    // @ts-ignore
    // renderer.shadowMap.renderReverseSided = false;
    // @ts-ignore
    // renderer.shadowMap.soft = true;
    return renderer;
}
export const loadAsset = async (requireObj) => {

    const obj = Asset.fromModule(requireObj);
    // const objAsset = Asset.fromModule(require('../../Assets/model//model.obj'));
    return await obj.downloadAsync();
    // await objAsset.downloadAsync();
}

export class TextureLoader extends _TextureLoader {

}