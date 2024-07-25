import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SInput, SSwitch, SText, STheme, SView } from 'servisofts-component';
import { WebGLRenderer } from 'three';
import * as THREE from "three"
export default class QualityControl extends Component {
    state = {
        data: {
            textureResolution: 1,  // 1: Alta, 0.5: Media, 0.25: Baja
            shadows: true,
            lodDistance: 100,
            antialiasing: true,
        }
    }
    renderer?: WebGLRenderer;
    scene?: THREE.Scene;

    init(renderer: WebGLRenderer, scene: THREE.Scene) {
        this.renderer = renderer;
        this.scene = scene;
    }
    update(delta: number) {

    }

    render() {
        const { data } = this.state;
        return (
            <View style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 200,
                backgroundColor: STheme.color.card,
                justifyContent: "center",
                alignItems: "center",
                padding: 4,
            }}>
                <SView row col={"xs-12"}>
                    <SText flex>{"anisotropy"}</SText>
                    <SInput flex type={"money"} defaultValue={"0.25"} onChangeText={e => {
                        if (!this.renderer || !this.scene || !e) return;
                        // this.renderer.shadowMap.enabled = e
                        this.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                if (child.material.map) {
                                    child.material.map.anisotropy = parseFloat(e);
                                    child.material.map.needsUpdate = true;
                                }
                            }
                        });
                    }} />

                </SView>
                <SView row col={"xs-12"}>
                    <SText flex>{"LOD"}</SText>
                    <SInput flex type={"number"} defaultValue={"200"} onChangeText={e => {
                        if (!this.renderer || !this.scene || !e) return;
                        // this.renderer.shadowMap.enabled = e
                        this.scene.traverse((child) => {
                            if (child instanceof THREE.LOD) {
                                for (let i = 0; i < child.levels.length; i++) {
                                    child.levels[i].distance = parseFloat(e) * (i + 1);
                                }
                            }
                        });
                    }} />

                </SView>
                <SView row col={"xs-12"}>
                    <SText flex>Sombras</SText>
                    <SSwitch defaultValue={true} onChange={e => {
                        console.log(e)
                        if (!this.renderer || !this.scene) return;
                        this.renderer.shadowMap.enabled = e
                        this.scene.traverse(function (object: any) {
                            if (object.isMesh) {
                                object.castShadow = e;
                                object.receiveShadow = e;
                            }
                        });
                    }} />
                </SView>
                <SView row col={"xs-12"}>
                    <SText flex>Sombras quality</SText>
                    <SInput flex type={"select"} options={["higth", "medium", "low"]} onChangeText={(e) => {
                        if (!this.renderer || !this.scene) return;
                        const renderer = this.renderer
                        this.scene.traverse(function (object: any) {

                            if (object.type == "PointLight") {
                                const luz: THREE.PointLight = object;
                                luz.castShadow = true;
                                let size = 128;
                                if (e === 'low') {
                                    renderer.shadowMap.type = THREE.BasicShadowMap;
                                    size = 128
                                    luz.shadow.bias = -0.00009;

                                } else if (e === 'medium') {
                                    renderer.shadowMap.type = THREE.PCFShadowMap;
                                    // luz.shadow.bias = 0
                                    size = 128
                                } else {
                                    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                                    size = 128
                                    luz.shadow.bias = -0.00009;
                                }
                                luz.shadow.mapSize.width = size;
                                luz.shadow.mapSize.height = size;
                            }
                        });
                    }} />
                </SView>

            </View>
        );
    }
}
