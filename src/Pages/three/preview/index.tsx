import React, { Component } from 'react';
import { SLoad, SPage, SView } from 'servisofts-component';
import SThreeGLView from '../../../Components/SThree/SThreeGLView';
import * as THREE from "three"
import Terreno from '../world/Terreno';
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
export default class index extends Component<any> {
    cube;
    pointLight;
    raycaster;
    camera?: THREE.PerspectiveCamera;
    constructor(props: any) {
        super(props);

        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

        // const material = new THREE.MeshStandardMaterial({
        //     color: 0x00ff00,         // Color base del material
        //     emissive: 0xffffff,      // Color de emisión
        //     emissiveIntensity: 100  // Intensidad de la emisión
        // });
        this.pointLight = new THREE.PointLight(0xffffff, 1, 100);
        this.cube = new THREE.Mesh(geometry, material);
        this.raycaster = new THREE.Raycaster()
        this.cube.position.y = 1;

    }


    render() {
        return <SPage title={"world"} disableScroll>
            <SThreeGLView
                handleTouch={({ locationX, locationY, mouseX, mouseY }) => {
                    if(!this.camera) return;
                    this.raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.camera);
                    const intersects = this.raycaster.intersectObjects([this.cube], false);
                    if (intersects.length > 0) {
                        console.log("ENtro en el cubo")
                    }
                }}
                onCreate={({ gl, renderer, scene, camera }) => {
                    this.camera = camera;
                    const ambientLight = new THREE.AmbientLight(0x909090, 1);
                    scene.add(ambientLight);
                    scene.add(this.cube);
                    new Terreno(scene)
                    scene.add(this.pointLight);

                }}
                update={({ delta }) => {
                    this.cube.rotation.x += 1 * delta;
                    this.cube.rotation.y += 1 * delta;
                    this.pointLight.position.copy(this.cube.position)
                    this.pointLight.rotation.copy(this.cube.rotation)
                }}
            />
        </SPage>
    }
}
