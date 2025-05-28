import React, { Component } from 'react';
import { SGradient, SLoad, SPage, SView } from 'servisofts-component';
import * as THREE from "three"


import SThreeGLView from '../../../Components/SThree/SThreeGLView';
import FirstPersonControls from '../../../Components/SThree/FirstPersonControls';
import Joystick from '../../../Components/SThree/Joystick';
import SAmmoView, { AmmoType } from '../../../Components/SThree/SAmmoView/index.native';

import Terreno from './Terreno';
import Personaje from './Personaje';
import Pelota from './Pelota';
import Rampa from './Rampa';
import Luces from '../world/Luces';

export default class index extends Component<any> {
    camera?: THREE.PerspectiveCamera;
    objectToClik = [];
    scene?: THREE.Scene;
    raycaster = new THREE.Raycaster()
    ambientLight = new THREE.AmbientLight(0xffffff, 1);
    terreno = new Terreno();
    personaje = new Personaje();
    fisrtPersonControl?: FirstPersonControls;
    Ammo?: AmmoType;
    pelota: any;
    dynamicsWorld: any;
    personajeBody?: any;
    pelotaBody?: any;
    rampaBody?: any;
    rampa?: any;
    constructor(props: any) {
        super(props);



    }


    render() {
        console.log("Entro al render")
        return <SPage title={"world"} disableScroll>
            <SGradient colors={["#FFFFFF", "#9090D0"]} />
            <SAmmoView onCreate={({ Ammo }) => {
                this.Ammo = Ammo;
                const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
                const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
                const overlappingPairCache = new Ammo.btDbvtBroadphase();
                const solver = new Ammo.btSequentialImpulseConstraintSolver();
                this.dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
                this.dynamicsWorld.setGravity(new Ammo.btVector3(0, -9.8 * 2, 0));
                // this.dynamicsWorld.setGravity(new Ammo.btVector3(0, -30, 0));

            }}>
                <SThreeGLView
                    handleTouch={({ locationX, locationY, mouseX, mouseY }) => {
                        if (!this.camera) return;
                        this.raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.camera);
                        const intersects = this.raycaster.intersectObjects(this.objectToClik, false);
                        if (intersects.length > 0) {

                        }
                    }}
                    onGestureEvent={(evt: any) => {
                        var { velocityX, velocityY } = evt.nativeEvent;

                        if (this.personaje) this.personaje.rotateObject(velocityX * -0.005);

                        // console.log("velociut" + velocityY);


                        // const cameraDirection = new THREE.Vector3();
                        // var dot = 0;
                        // if (this.camera) {
                        //     this.camera.getWorldDirection(cameraDirection);
                        // }


                        // // Invertir la dirección vertical si la cámara está boca abajo o mirando hacia atrás
                        // console.log("cameraDirection.x " + cameraDirection.x)
                        // console.log("cameraDirection.y " + cameraDirection.y)
                        // console.log("cameraDirection.z " + cameraDirection.z)

                        // if (cameraDirection.z > 0 && cameraDirection.x > 0) {
                        //     velocityY = -velocityY;
                        // }
                        // if (cameraDirection.z < 0 && cameraDirection.x > 0) {
                        //     velocityY = -velocityY;
                        // }
                        // if (cameraDirection.x > 0 && cameraDirection.y > 0) {
                        //     velocityY = -velocityY;
                        // }



                        // if (this.personaje) this.personaje.rotateCamera(velocityY * -0.0001);
                    }}
                    onCreate={({ gl, renderer, scene, camera }) => {
                        console.log("Entro al onCreate")
                        if (this.Ammo) {
                            this.camera = camera;
                            this.scene = scene;
                            // this.fisrtPersonControl = new FirstPersonControls(camera, false);
                            // scene.add(this.ambientLight);
                            new Luces(scene);
                            scene.add(this.terreno)
                            const terrenoBody = this.terreno.createBody({ Ammo: this.Ammo });
                            this.dynamicsWorld.addRigidBody(terrenoBody)

                            this.personaje.setCamera(camera);
                            scene.add(this.personaje);
                            this.personajeBody = this.personaje.createBody({ Ammo: this.Ammo, ammoWorld: this.dynamicsWorld });
                            this.dynamicsWorld.addRigidBody(this.personajeBody)


                            this.pelota = new Pelota();
                            scene.add(this.pelota);
                            this.pelotaBody = this.pelota.createBody({ Ammo: this.Ammo });
                            this.dynamicsWorld.addRigidBody(this.pelotaBody)
                            this.rampa = new Rampa(this.Ammo, this.dynamicsWorld);
                            this.rampa.load()
                            // this.rampaBody = this.rampa.createBody({ Ammo: this.Ammo });
                            // this.dynamicsWorld.addRigidBody(this.rampaBody)
                            // });
                            scene.add(this.rampa);
                        }


                    }}
                    update={({ delta }) => {
                        const deltaTime = 1 / 60;
                        this.dynamicsWorld.stepSimulation(delta, 10);
                        if (this.Ammo) {
                            this.personaje.update({ delta: delta, Ammo: this.Ammo })
                            this.pelota.update({ delta: delta, Ammo: this.Ammo })
                        }
                        // if (this.fisrtPersonControl) this.fisrtPersonControl.update(delta)
                    }}
                />
            </SAmmoView>
            <Joystick
                onJump={() => {
                    this.personaje.applyJump();
                }}
                onMove={(e: any) => {
                    if ((e.x != 0 || e.y != 0) && this.Ammo) {
                        this.personaje.applyImpulse({ x: e.x, y: e.y })
                    }
                }} />
        </SPage>
    }
}
