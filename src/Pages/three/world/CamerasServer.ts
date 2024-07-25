import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';
// import Stats from 'three/examples/jsm/libs/stats.module'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import Personaje from './Personaje';


// let cameraInstanced = false;
// let ready = true;
const GetCamerasFromServer = (scene: THREE.Scene, myCamera: THREE.Camera, fisrtPersonControl: any, instaceCameras: any, personajesRef: any = {}) => {
    // const [instaceCameras, setInstaceCameras] = useState<any>({});
    const key_usuario = Model.usuario.Action.getKey();
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        // console.log("Entro aca");
        SSocket.sendPromise({
            component: "camera",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey()
        }).then((e: any) => {
            const arr = Object.values(e.data);
            arr.map((a: any) => {
                const { position, rotation, rotation_fp } = a?.data ?? { position: {}, rotation: {}, rotation_fp: {} };
                if (a.key_usuario == key_usuario) {
                    // if (cameraInstanced) return;
                    if (!myCamera) return;
                    myCamera.position.x = position?.x ?? 0;
                    myCamera.position.y = position?.y ?? 0;
                    myCamera.position.z = position?.z ?? 0;
                    fisrtPersonControl.rotation.x = rotation_fp?.x ?? 0;
                    fisrtPersonControl.rotation.y = rotation_fp?.y ?? 0;
                    // cameraInstanced = true;
                    // fisrtPersonControl.rotation.x = rotation._x
                    // fisrtPersonControl.rotation.y = rotation._y
                    // myCamera.rotation.x = rotation._x;
                    // myCamera.rotation.y = rotation._y;
                    // myCamera.rotation.z = rotation._z;
                } else {
                    // console.log(a);

                    if (!instaceCameras[a.key_usuario]) {
                        const group = new THREE.Group();
                        instaceCameras[a.key_usuario] = group;
                        group.position.x = position?.x ?? 0;
                        group.position.y = position?.y ?? 0;
                        group.position.z = position?.z ?? 0;
                        group.rotation.x = rotation?._x ?? 0;
                        group.rotation.y = rotation?._y ?? 0;
                        group.rotation.z = rotation?._z ?? 0;

                        const materials = [
                            new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Rojo
                            new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Verde
                            new THREE.MeshBasicMaterial({ color: 0x0000ff }), // Azul
                            new THREE.MeshBasicMaterial({ color: 0xffff00 }), // Amarillo
                            new THREE.MeshBasicMaterial({ color: 0xff00ff }), // Magenta
                            new THREE.MeshBasicMaterial({ color: 0x00ffff })  // Cian
                        ];

                        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1); // Cubo pequeño
                        const cube = new THREE.Mesh(geometry, materials);
                        // cube.position.y = -1ss;
                        group.add(cube);


                        const textGeometry = new TextGeometry(a.descripcion ?? "Guest", {
                            font: font,
                            size: 0.2,
                            height: 0.02,
                        });
                        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
                        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

                        textGeometry.computeBoundingBox();
                        const boundingBox: any = textGeometry.boundingBox;
                        const textWidth = boundingBox.max.x - boundingBox.min.x;

                        // Posicionar el texto sobre el cubo
                        textMesh.position.set((textWidth / 2), 0.4, 0);
                        textMesh.rotation.y = Math.PI;
                        group.add(textMesh);


                        personajesRef[a.key_usuario] = new Personaje(group, a)
                        personajesRef[a.key_usuario].load()
                        scene.add(group);


                    } else {
                        const group = instaceCameras[a.key_usuario];
                        if (personajesRef[a.key_usuario]?.actions?.caminar) {
                            if (!group.position.equals(position)) {
                                const action: THREE.AnimationAction = personajesRef[a.key_usuario].actions.caminar;
                                const action2: THREE.AnimationAction = personajesRef[a.key_usuario].actions.parado;
                                console.log(personajesRef[a.key_usuario].actions);
                                if (action2) {
                                    action2.stop();
                                }

                                action.reset();
                                action.play()
                                action.setLoop(THREE.LoopRepeat, 1);
                                action.clampWhenFinished = true;

                                if (action2) {
                                    action2.play()
                                    action2.startAt(action.time)
                                }

                                // action.setLoop(THREE.LoopRepeat, 1);
                                // action.clampWhenFinished = true;
                            }

                        }
                        group.position.x = position.x ?? 0;
                        group.position.y = position.y ?? 0;
                        group.position.z = position.z ?? 0;
                        group.rotation.x = rotation?._x ?? 0;
                        group.rotation.y = rotation?._y ?? 0;
                        group.rotation.z = rotation?._z ?? 0;
                    }
                }

            })
        }).catch(e => {
            console.error(e);
        })
    });

}

export { GetCamerasFromServer }