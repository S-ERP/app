import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Dimensions, Platform, StyleSheet, Vibration } from 'react-native';
import { SInput, SText, STheme, SView } from "servisofts-component";
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { loadAsset, Renderer, TextureLoader } from '../../Components/SThree';
import CustomOrbitControls from '../../Components/SThree/CustomOrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SPage } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import Joystick from '../../Components/SThree/Joystick';
import FirstPersonControls from '../../Components/SThree/FirstPersonControls';
// import Stats from 'three/examples/jsm/libs/stats.module'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';




import Stats from "stats-js"

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const instaceCameras = {

}
let cameraInstanced = false;
let ready = true;
const GetCamerasFromServer = async (scene, myCamera, fisrtPersonControl) => {
    const key_usuario = Model.usuario.Action.getKey();

    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        SSocket.sendPromise({
            component: "camera",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey()
        }).then(e => {
            const arr = Object.values(e.data);
            arr.map(a => {
                const { position, rotation, rotation_fp } = a?.data ?? {};
                if (a.key_usuario == key_usuario) {
                    if (cameraInstanced) return;
                    myCamera.position.x = position.x;
                    myCamera.position.y = position.y;
                    myCamera.position.z = position.z;
                    fisrtPersonControl.rotation.x = rotation_fp?.x ?? 0;
                    fisrtPersonControl.rotation.y = rotation_fp?.y ?? 0;
                    cameraInstanced = true;
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
                        group.position.x = position.x ?? 0;
                        group.position.y = position.y ?? 0;
                        group.position.z = position.z ?? 0;
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

                        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5); // Cubo pequeño
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
                        const boundingBox = textGeometry.boundingBox;
                        const textWidth = boundingBox.max.x - boundingBox.min.x;

                        // Posicionar el texto sobre el cubo
                        textMesh.position.set((textWidth / 2), 0.4, 0);
                        textMesh.rotation.y = Math.PI;
                        group.add(textMesh);

                        scene.add(group);


                    } else {
                        const group = instaceCameras[a.key_usuario];
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

        })
    });

}


const applyShadowLight = (sunLight) => {
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 256;
    sunLight.shadow.mapSize.height = 256;
    // sunLight.shadow.camera.near = 0.5;
    // sunLight.shadow.camera.far = 300;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 10;
    // sunLight.shadow.camera.left = -50;
    // sunLight.shadow.camera.right = 50;
    // sunLight.shadow.camera.top = 50;
    // sunLight.shadow.camera.bottom = -50;
    sunLight.shadow.bias = -0.00009;
}

export default function App() {
    let controls, transformControl;
    let mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster(), camera, scene, glRef, fisrtPersonControl;;
    const radius = 100;
    let speed = 0.001;
    const allMeshes = useRef([]);
    const [state, setState] = useState(null);

    const onContextCreate = async (gl) => {
        try {
            glRef = gl;
            const renderer = Renderer(gl);


            // const stats = new Stats();
            // stats.showPanel(0); // 0: FPS, 1: ms, 2: memory


            // gl.appendChild(stats.dom);

            renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
            renderer.setClearAlpha(0);

            renderer.physicallyCorrectLights = true;
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.soft = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.shadowMap.renderReverseSided = false;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1;
            renderer.outputEncoding = THREE.sRGBEncoding;

            scene = new THREE.Scene();
            raycaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();

            camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
            camera.position.z = 40;
            camera.position.y = 1.7;
            camera.layers.enable(1);


            const color = 0x444444; // Color de la niebla
            const density = 0.01; // Densidad de la niebla
            scene.fog = new THREE.FogExp2(color, density);

            const ambientLight = new THREE.AmbientLight(0x404040, 1);
            scene.add(ambientLight);

            const sunLight = new THREE.PointLight(0xffffff, radius * 100, radius * 100);
            // const sunLight = new THREE.DirectionalLight(0xffffff, 100);

            sunLight.position.set(30, radius, 50);

            applyShadowLight(sunLight)
            scene.add(sunLight);
            scene.add(new THREE.PointLightHelper(sunLight));

            // sunLight.shadow.mapSize.width = 1024;
            // sunLight.shadow.mapSize.height = 1024;

            // sunLight.shadow.bias = -0.000009;


            const geometry = new THREE.BoxGeometry();
            const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
            const cube = new THREE.Mesh(geometry, material);
            scene.add(cube);

            const light = new THREE.PointLight(0xffffff, 1, 100);
            light.position.set(10, 10, 10);
            scene.add(light);


            // const urlMaterial = 'http://192.168.2.1:30017/texture/pasto.png';

            const floorGeometry = new THREE.PlaneGeometry(1000, 1000);
            const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x66ff66 });
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = true;
            scene.add(floor);

            loadAsset(require("../../Assets/png/pasto2.png")).then(bm => {
                const textureLoader = new TextureLoader();
                textureLoader.load(bm.localUri, function (texture) {
                    // floorMaterial.color = 0xffffff
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(100, 100);
                    floorMaterial.map = texture;
                    floorMaterial.needsUpdate = true;
                }, undefined, (error) => {
                    console.log(error)
                });
            })



            const axesHelper = new THREE.AxesHelper(5);
            scene.add(axesHelper);



            // // Geometría y material del árbol
            // const treeGeometry = new THREE.ConeGeometry(0.5, 2, 8);
            // const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });

            // // Crear InstancedMesh para los árboles
            // const count = 500;
            // const trees = new THREE.InstancedMesh(treeGeometry, treeMaterial, count);

            // const dummy = new THREE.Object3D();
            // for (let i = 0; i < count; i++) {
            //     dummy.position.set(
            //         Math.random() * 100 - 1,
            //         1,
            //         Math.random() * 100 - 1
            //     );
            //     dummy.rotation.y = Math.random() * 2 * Math.PI;
            //     dummy.scale.setScalar(0.5 + Math.random() * 0.5);
            //     dummy.updateMatrix();
            //     trees.setMatrixAt(i, dummy.matrix);
            // }

            // scene.add(trees);
            transformControl = new TransformControls(camera, renderer.domElement);
            transformControl.addEventListener('change', () => {

            });
            transformControl.addEventListener('dragging-changed', function (event) {

                // controls.enabled = !event.value;

            });
            scene.add(transformControl);

            transformControl.addEventListener('objectChange', function () {

                // updateSplineOutline();

            });

            fisrtPersonControl = new FirstPersonControls(camera);


            const mixers = [];

            try {
                const resp = await SSocket.sendPromise({
                    component: "mesh",
                    type: "getAll",
                    key_empresa: Model.empresa.Action.getKey(),
                    key_usuario: Model.usuario.Action.getKey(),
                });


                const guitarraLoader = new GLTFLoader();
                Object.values(resp.data).map(async (mesh) => {
                    guitarraLoader.load(mesh.url, (result) => {
                        const object = result.scene;
                        object.name = mesh.descripcion;

                        const mixer = new THREE.AnimationMixer(object);
                        mixers.push(mixer);

                        // Reproducir todas las animaciones disponibles en el modelo
                        console.log(result)
                        result.animations.forEach((clip) => {
                            mixer.clipAction(clip).play();
                        });

                        object.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                                // child.material.emissive = new THREE.Color(0xffffff); // Cambiar el color de emisión si es necesario
                                // child.material.emissiveIntensity = 1; // Ajustar la intensidad de emisión si es necesario
                                allMeshes.current.push(child);
                            }
                            if (child.type == "PointLight") {
                                child.castShadow = true;
                                applyShadowLight(child)
                            }
                        });
                        object.rotation.set(mesh?.data?.transform?.rotation?.x ?? 0, mesh?.data?.transform?.rotation?.y ?? 0, mesh?.data?.transform?.rotation?.z ?? 0);
                        object.position.set(mesh?.data?.transform?.position?.x ?? 0, mesh?.data?.transform?.position?.y ?? 0, mesh?.data?.transform?.position?.z ?? 0);
                        object.scale.set(mesh?.data?.transform?.scale?.x ?? 1, mesh?.data?.transform?.scale?.y ?? 1, mesh?.data?.transform?.scale?.z ?? 1);
                        scene.add(object);
                    });
                });

                GetCamerasFromServer(scene, camera);

            } catch (error) {
                console.error(error);
            }



            let previousTime = performance.now();
            const animate = () => {
                if (!ready) return;
                // stats.begin();

                const currentTime = performance.now();
                const delta = (currentTime - previousTime) / 1000; // Convertir a segundos
                previousTime = currentTime;

                mixers.forEach((mixer) => {
                    mixer.update(delta);
                });
                fisrtPersonControl.update(delta, fisrtPersonControl);
                renderer.render(scene, camera);
                gl.endFrameEXP();
                // stats.end();
                requestAnimationFrame(animate);
                // const fpsText = stats.domElement.getElementsByClassName('fpsText')[0]?.innerHTML;
                // console.log(fpsText)
            };
            animate();
        } catch (error) {
            console.error(error);
        }
    };





    const onGestureEvent = (event) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            const { velocityX, velocityY, translationX, translationY } = event.nativeEvent;
            if (transformControl?.object) {
                const { translationX, translationY } = event.nativeEvent;

                // const deltaRotationQuaternion = new THREE.Quaternion()
                //     .setFromEuler(new THREE.Euler(
                //         translationY * 0.01, // Ajusta la velocidad de rotación según sea necesario
                //         translationX * 0.01,
                //         0,
                //         'XYZ'
                //     ));

                // transformControl.object.quaternion.multiplyQuaternions(deltaRotationQuaternion, transformControl.object.quaternion);
            }
            if (fisrtPersonControl) fisrtPersonControl.handleGesture(velocityX, velocityY);
        }
    };

    const handleTouch = useCallback((event) => {
        const { locationX, locationY } = Platform.select({
            native: event.nativeEvent, web: {
                locationX: event.nativeEvent.clientX,
                locationY: event.nativeEvent.clientY,
            }
        });
        const width = screenWidth;
        const height = screenHeight;

        mouse.x = (locationX / width) * 2 - 1;
        mouse.y = -(locationY / height) * 2 + 1;

        requestAnimationFrame(() => {
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(allMeshes.current, false);
            if (intersects.length > 0) {
                const i0 = intersects[0];
                let objetoMayor = i0.object;
                if (i0?.object?.parent?.type != "Scene") {
                    objetoMayor = i0?.object?.parent;
                }
                console.log("Click en ", objetoMayor.name, "ditancia", i0.distance)
                // transformControl.setMode("rotate")
                transformControl.setMode("translate")
                transformControl.attach(objetoMayor);
                // Vibration.vibrate(400);
                // let color = new THREE.Color(Math.random(), Math.random(), Math.random());
                // intersects[0].object.material.color.set(color);
                //transformRef = intersects[0].object;
                // if (transformRef.current) transformRef.current.setModel(intersects[0].object);

                //setSelectedObject(intersects[0].object);
            } else {
                // transformControl.detach()
                // if (transformRef.current) transformRef.current.setModel(null);
            }
        });
    }, [mouse, raycaster, camera]);


    useEffect(() => {
        ready = true;
        const interval = setInterval(() => {
            GetCamerasFromServer(scene, camera, fisrtPersonControl);
        }, 1000 / 1);
        if (Platform.OS === "web") {
            document.addEventListener('pointerdown', handleTouch);
        }

        return () => {
            ready = false;
            if (Platform.OS === "web") {
                document.removeEventListener('pointerdown', handleTouch);
            }
            clearInterval(interval);

        }
        // Limpiar el intervalo al desmontar el componente
    }, [scene, camera, fisrtPersonControl]);

    return (
        <SPage disableScroll>
            <PanGestureHandler onGestureEvent={onGestureEvent}>
                <GLView
                    onTouchStart={handleTouch}
                    style={styles.glView}
                    onContextCreate={onContextCreate}
                />
            </PanGestureHandler>
            <Joystick onMove={(e) => {
                if (!fisrtPersonControl) return;

                fisrtPersonControl.velocity.x = e.x; // Ajustar la velocidad según el input del joystick
                fisrtPersonControl.velocity.z = -e.y; // Ajustar la velocidad según el input del joystick

            }} />
        </SPage>
    );
}

const styles = StyleSheet.create({
    glView: {
        flex: 1,
        backgroundColor: "#aaaaff",
    },
});
