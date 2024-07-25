import React, { Component } from 'react';
import { SGradient, SLoad, SPage, SView } from 'servisofts-component';
import SThreeGLView from '../../../Components/SThree/SThreeGLView';
import * as THREE from "three"
import Terreno from '../world/Terreno';
import FirstPersonControls from '../../../Components/SThree/FirstPersonControls';
import Joystick from '../../../Components/SThree/Joystick';
import Carreteras from './Carreteras';
import SantaMaria from './SantaMaria';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import Luces from '../world/Luces';

export default class index extends Component<any> {
    camera?: THREE.PerspectiveCamera;
    objectToClik = [];
    raycaster = new THREE.Raycaster()
    transformControl?: TransformControls;
    // ambientLight = new THREE.AmbientLight(0x909090, 1);
    // ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
    fisrtPersonControl?: FirstPersonControls;
    constructor(props: any) {
        super(props);

    }

    render() {
        return <SPage title={"world"} disableScroll>
            <SGradient colors={["#FFFFFF", "#9090D0"]} />
            <SThreeGLView
                handleTouch={({ locationX, locationY, mouseX, mouseY }) => {
                    if (!this.camera) return;
                    // this.raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.camera);
                    // const intersects = this.raycaster.intersectObjects(this.objectToClik, false);
                    // if (intersects.length > 0) {

                    // }
                }}
                onGestureEvent={(evt) => {
                    const { velocityX, velocityY } = evt.nativeEvent;
                    if (this.fisrtPersonControl) this.fisrtPersonControl.handleGesture(velocityX, velocityY);
                }}


                onCreate={({ gl, renderer, scene, camera }) => {
                    this.camera = camera;
                    // this.camera.position.y = 40;
                    this.fisrtPersonControl = new FirstPersonControls(camera);
                    this.transformControl = new TransformControls(camera, renderer.domElement);
                    new Luces(scene)
                    // new Carreteras(scene);
                    const sm = new SantaMaria(scene);
                    new Terreno(scene)

                }}
                update={({ delta }) => {
                    if (this.fisrtPersonControl) this.fisrtPersonControl.update(delta)
                }}
            />
            <Joystick onMove={(e: any) => {
                if (!this.fisrtPersonControl) return;
                this.fisrtPersonControl.velocity.x = e.x; // Ajustar la velocidad según el input del joystick
                this.fisrtPersonControl.velocity.z = -e.y; // Ajustar la velocidad según el input del joystick
            }} />
        </SPage>
    }
}
