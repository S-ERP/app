import React, { Component } from 'react';
import { SGradient, SLoad, SNavigation, SNotification, SPage, SPopup, SText, STheme, SThread, SView } from 'servisofts-component';
import * as THREE from "three"
import Terreno from './Terreno';
import Personaje from './Personaje';
import SAmmoView, { AmmoType } from '../../Components/SThree/SAmmoView/index.native';
import SThreeGLView from '../../Components/SThree/SThreeGLView';
import Joystick from '../../Components/SThree/Joystick';
import Luces from '../three/world/Luces';
import Avatares from './Avatares';

import SSocket from "servisofts-socket"
// import SThreeGLView from '../../../Components/SThree/SThreeGLView';
// import FirstPersonControls from '../../../Components/SThree/FirstPersonControls';
// import Joystick from '../../../Components/SThree/Joystick';
// import SAmmoView, { AmmoType } from '../../../Components/SThree/SAmmoView';

// import Terreno from './Terreno';
// import Personaje from './Personaje';
// import Pelota from './Pelota';
import Rampa from '../three/primeraPersona/Rampa';
import Model from '../../Model';
import Meshes from './Meshes';
import { Linking, StatusBar, View } from 'react-native';
import MeshInfo from './MeshInfo';
import Sounds from '../../Components/Sounds';
import GLTFLoaderCache from './GTLFLoaderCache';
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader"
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { GestureHandlerRootView, PanGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler';
import SCopy from '../../Components/SCopy';
import Sprite from './Sprite';
import { Water } from "three/examples/jsm/objects/Water2"
// import { AudioListener } from 'three/src/audio/AudioListener';
// import { AudioLoader } from 'three/src/loaders/AudioLoader';
import Menu from './Menu';
import LayersInfo from './Menu/LayersInfo';
import Animated from 'react-native-reanimated';
import PlaneView from './PlaneView';
import PlaneViewGerardo from './PlaneViewGerardo';
import CSS3DRenderer, { CSS3DObject, CSS3DObjectElement } from './CSS3DRenderer';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { StarrySky } from './Shaders/StarrySky';
import { Rain } from './Shaders/Rains';
import Agua from './Shaders/Agua';
import HumoVolumetrico from './Shaders/Humo';

import Attack from './Attack';


// import PositionalAudio from '../../Components/SThree/Audio/PositionalAudio';
// import Luces from '../world/Luces';
// import Sound from 'react-native-sound';
// THREE.AudioContext.setContext(new Sound('https://drive.servisofts.com/http/audio/lluvia.mp3'))

export default class index extends Component<any> {
    camera?: THREE.PerspectiveCamera;
    objectToClik = [];
    scene?: THREE.Scene;
    raycaster = new THREE.Raycaster()
    ambientLight = new THREE.AmbientLight(0xffffff, 1);
    terreno = new Terreno();
    avatares?: Avatares;
    Ammo?: AmmoType;
    dispatcher?: any;
    pelota: any;
    dynamicsWorld: any;
    personajeBody?: any;
    pelotaBody?: any;
    rampaBody?: any;
    rampa?: any;
    pk?: any;
    state: any;
    meshes?: Meshes;
    meshInfoWindow?: MeshInfo;
    music: any;
    toRaycaster: any = [];
    gltfLoaderCache = GLTFLoaderCache.getInstance()
    personaje = new Personaje({ glftLoaderCache: this.gltfLoaderCache, });
    sx; sy; sz;
    rx; ry; rz;
    water?: Water;
    delta: number = 1;
    menu?: Menu;
    modeConstructor = false;
    // audioListener = new AudioListener();
    planeView?: any;
    PlaneViewGerardo?: any;
    renderer?: THREE.WebGLRenderer;
    gl: any;
    css3drenderer: any;
    cssobject: any;
    plano: THREE.Mesh;
    plano2: THREE.Mesh;
    sky?: StarrySky;
    rain?: Rain;
    agua?: Agua;
    humo?: HumoVolumetrico;
    constructor(props: any) {
        super(props);
        this.state = {
            ready: false,
            sceneData: null
        }
        this.pk = SNavigation.getParam("pk");
        this.sx = SNavigation.getParam("px", 0);
        this.sy = SNavigation.getParam("py", 10);
        this.sz = SNavigation.getParam("pz", 0);
        this.rx = SNavigation.getParam("rx", 0);
        this.ry = SNavigation.getParam("ry", 0);
        this.rz = SNavigation.getParam("rz", 0);

        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        const geometry = new THREE.PlaneGeometry(4, 4)
        this.plano = new THREE.Mesh(geometry, material);
        this.plano2 = new THREE.Mesh(geometry, material);

    }
    componentDidMount(): void {

        if (!this.pk) {
            SNotification.send({
                title: "Error",
                body: "No se encontro pk",
                color: STheme.color.danger,
                time: 5000,
            })
            SNavigation.goBack();
        }

        SSocket.sendPromise({
            component: "scene",
            type: "getByKey",
            key: this.pk,
            key_usuario: Model.usuario.Action.getKey()
        }).then((e: any) => {
            console.log(e);
            this.setState({ sceneData: e.data[this.pk] })


        }).catch(e => {
            console.error(e);
        })
        new SThread(400, "ready", true).start(() => {
            this.setState({ ready: true })
        })
        this.personaje.setKeyScene(this.pk);
        SSocket.addEventListener("onMessage", this.handleOnMessage.bind(this));
    }
    stopAllAudios(scene: any) {
        if (!scene) return;
        scene.traverse(function (object: any) {
            if (object instanceof THREE.PositionalAudio || object instanceof THREE.Audio) {
                object.stop(); // Detiene el audio si está reproduciéndose
            }
        });
    }
    componentWillUnmount(): void {
        if (this.music) this.music.pause();
        this.stopAllAudios(this.scene);
        SSocket.removeEventListener("onMessage", this.handleOnMessage.bind(this));
        if (this.personaje) {
            this.personaje.exitToScene().then(e => {

            }).catch(e => {

            })
        }
        // Sounds.
    }
    lastAtack = "";
    handleOnMessage(obj: any) {
        if (obj.component == "avatar" && obj.type == "onmove") {
            if (this.avatares) this.avatares.onMove(obj);
        }
        if (obj.component == "scene_mesh" && obj.type == "onmove") {
            if (this.meshes) this.meshes.onMove(obj);
            // if (this.avatares) this.avatares.onMove(obj);
        }
        if (obj.component == "scene" && obj.type == "onmove") {
            if (obj.data.data.child_modify) {
                this.applyChildModify(obj.data.data.child_modify);
            }
            // if (this.avatares) this.avatares.onMove(obj);
        }
        if (obj.component == "avatar" && obj.type == "exit") {
            if (this.avatares) this.avatares.onExit(obj);
        }
        if (obj.component == "scene" && obj.type == "notify") {
            if (obj.event == "attack") {
                if (obj.key_usuario != Model.usuario.Action.getKey()) {
                    if (this.scene) {
                        if (this.lastAtack == obj.data.key) return;
                        this.lastAtack = obj.data.key
                        console.log("Creando ataque")
                        const attack = new Attack({
                            Ammo: this.Ammo,
                            physicsWorld: this.dynamicsWorld,
                            position: obj.data.position,
                            direcction: obj.data.direcction,
                            scene: this.scene,
                            key_scene: this.pk,
                            velocity: obj.data.velocity,
                            otherUser: true
                        })
                    }

                }
                // if (this.avatares) this.avatares.onExit(obj);
            }
        }
    }

    handleTouch = ({ locationX, locationY, mouseX, mouseY }: any) => {
        if (!this.camera) return;
        // const intersects = this.raycaster.intersectObjects(this.objectToClik, false);
        if (this.scene) {

            if (this.scene.userData.modeConstructor || LayersInfo.REF) {
                this.raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.camera);
                const intersects = this.raycaster.intersectObjects(this.toRaycaster, true);

                if (intersects.length > 0) {
                    // console.log(intersects)
                    let objClick: any = intersects[0].object;
                    let foundKey = false;
                    while (objClick && objClick.type !== "Scene") {
                        if (objClick.userData && objClick.userData.key) {
                            foundKey = true;
                            break;
                        }
                        objClick = objClick.parent;
                    }

                    if (objClick?.userData?.key) {
                        // this.meshes[mesh.key];
                        const key_scene_mesh = objClick?.userData?.key;
                        // SNavigation.openDeepLink(objClick?.userData?.deeplink);
                        // console.log(key_scene_mesh)
                        const objData: any = {
                            key: key_scene_mesh,
                        }
                        if (LayersInfo.REF) {
                            if (this.meshes?.data[key_scene_mesh]?.group) LayersInfo.REF.select(this.meshes?.data[key_scene_mesh]?.group)
                        }
                        if (this.meshInfoWindow && this.meshes) this.meshInfoWindow.setMesh({
                            key: key_scene_mesh,
                            data: objData,
                            mesh: this.meshes.data[key_scene_mesh],
                            // this.me
                        }, this.Ammo)
                    }

                }
            }
        }
    }


    handleDeepLink(deepLink: any) {
        SNavigation.replace("/scene/loading", { deeplink: deepLink })
        // SNavigation.goBack();
        // new SThread(100, "sadasd", false).start(() => {
        //     SNavigation.openDeepLink(deepLink)
        // })
        this.personaje.exitToScene().then(e => {

        }).catch(e => {

        })

    }
    detectCollisions() {
        const Ammo: any = this.Ammo
        const numManifolds = this.dispatcher.getNumManifolds();
        for (let i = 0; i < numManifolds; i++) {
            const contactManifold = this.dispatcher.getManifoldByIndexInternal(i);
            const numContacts = contactManifold.getNumContacts();
            if (numContacts > 0) {
                const body0 = Ammo.castObject(contactManifold.getBody0(), Ammo.btRigidBody);
                const body1 = Ammo.castObject(contactManifold.getBody1(), Ammo.btRigidBody);

                Attack.onCollisionDetect(body0, body1, numContacts, contactManifold);
                this.personaje.onCollisionDetect(body0, body1, numContacts, contactManifold);
                const data0 = body0.threeObject;
                const data1 = body1.threeObject;
                if (!!data0 || !!data1) {
                    if (data0?.deeplink) {
                        this.handleDeepLink(data0.deeplink)
                    } else if (data1?.deeplink) {
                        this.handleDeepLink(data1.deeplink)
                    }
                }


            }
        }
    }

    applyChildModifyRecursive(modify: any, obj: any) {
        if (typeof modify != "object") return;
        Object.keys(modify).forEach(k => {
            let modval = modify[k];
            if (typeof modval != "object") {
                // console.log(k, modval)
                if (k == "color") {
                    const hexPattern = /^#?([0-9A-F]{6})$/i;

                    // Verifica si el valor en obj[k] es un string y coincide con el patrón hexadecimal
                    if (typeof modval === 'string' && hexPattern.test(modval)) {
                        const hexValue = modval.replace('#', ''); // Remover el '#' si está presente
                        obj[k].setHex(parseInt(hexValue, 16)); // Convertir a número hexadecimal y establecer el color
                    } else if (typeof modval === 'number') {
                        obj[k].setHex(modval);
                    } else {
                        console.error("El valor no es un hexadecimal válido");
                    }

                } else {
                    try {
                        obj[k] = modval;
                    } catch (error) {
                        console.error("Error al asignar propiedad, ", error)
                    }
                }
            } else {
                if (!obj[k]) {
                    console.log(k, obj[k])
                    // obj[k] = {}
                }
                this.applyChildModifyRecursive(modval, obj[k])
            }

        })
    }

    applyChildModify(childModify: any) {
        console.log("Aplly child modify ", childModify)
        if (!childModify) return;
        if (this.scene) this.scene.userData.child_modify = childModify;
        Object.keys(childModify).map(name => {
            const obj: any = this.scene?.getObjectByName(name);
            if (!obj) return;
            const modify = childModify[name];
            this.applyChildModifyRecursive(modify, obj)
            // Object.keys(modify).forEach(k => {
            //     if (typeof modify[k] != "object") {
            //         obj[k] = modify[k];
            //     } else {
            //         console.log("Es objeto")
            //         this.applyChildModifyRecursive(modify, obj)
            //     }

            // })
        })

    }
    lastSentTime = 0;
    throttleDelay = 1000 / 20
    throttledSendToServer() {
        if (!this.state.sceneData) return;
        const now = Date.now();
        if (now - this.lastSentTime >= this.throttleDelay) {
            if (!this.state.sceneData.data) {
                this.state.sceneData.data = {}
            }
            // this.props.data.data.position = { x: this.group?.position.x, y: this.group?.position.y, z: this.group?.position.z }
            // this.props.data.data.rotation = { x: this.group?.rotation.x, y: this.group?.rotation.y, z: this.group?.rotation.z }
            // this.props.data.data.scale = { x: this.group?.scale.x, y: this.group?.scale.y, z: this.group?.scale.z }
            this.state.sceneData.data.child_modify = this.scene?.userData?.child_modify ?? {}
            this.sendToServer(this.state.sceneData);
            this.lastSentTime = now;
        }
    }
    async sendToServer(mesh: any) {
        SSocket.sendPromise({
            component: "scene",
            type: "editar",
            key_scene: this.props.key_scene,
            key_usuario: Model.usuario.Action.getKey(),
            data: mesh
        }).then(e => {
            console.log(e);
        }).catch(e => {
            console.error(e);
        })
    }

    getAimPointInWorld() {
        if (!this.camera || !this.scene) return;
        // Raycaster para calcular el punto al que apunta la mira (centro de la pantalla)
        const raycaster = new THREE.Raycaster();
        // raycaster.layers.set(0);
        // this.camera.layers.enable(0);
        // raycaster.params.Line.threshold = 42;
        // raycaster.params.Points.threshold = 42
        // raycaster.params.Line.threshold = 42;
        // raycaster.params.Points.threshold = 42;
        // raycaster.precision = 0.001;
        // La mira está en el centro de la pantalla (coordenadas normalizadas)
        const centerOfScreen = new THREE.Vector2(0, 0);

        // Usamos el raycaster desde la cámara hacia el centro de la pantalla
        raycaster.setFromCamera(centerOfScreen, this.camera);

        // Obtener intersecciones con los objetos en la escena
        const objectsToRaycast = this.scene.children.filter(child => !child.userData.ignoreForRaycast);

        const intersects = raycaster.intersectObjects(objectsToRaycast, true);

        if (intersects.length > 0) {
            // Tomar el primer objeto que intersecta el rayo (más cercano)
            const intersection = intersects[0];
            return intersection.point; // Retorna el punto de impacto en el mundo 3D
        }

        return null; // Si no hay intersecciones, no se hace nada
    }
    securityCameraRenderTarget: any;
    securityCamera: any;
    sprites?: Sprite[];
    render() {

        if (!this.state.ready || !this.state.sceneData) return <SLoad />

        return <SView height col={"xs-12"}>
            <StatusBar hidden={true} />
            {/* <SGradient colors={["#000000", "#000000", "#C14227", "#483844"]} /> */}
            <SGradient colors={this.state.sceneData?.data?.backgroundColors ?? ["#000000", "#000000", "#00000F",]} />

            <SAmmoView onCreate={({ Ammo }) => {
                this.Ammo = Ammo;
                const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
                this.dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
                const overlappingPairCache = new Ammo.btDbvtBroadphase();
                const solver = new Ammo.btSequentialImpulseConstraintSolver();
                this.dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, overlappingPairCache, solver, collisionConfiguration);
                let gravity = { x: 0, y: -9.8, z: 0 }
                if (this.state.sceneData?.data?.gravity) {
                    gravity.x = this.state.sceneData?.data?.gravity.x ?? 0;
                    gravity.y = this.state.sceneData?.data?.gravity.y ?? 0;
                    gravity.z = this.state.sceneData?.data?.gravity.z ?? 0;
                }
                const multiply = 1;
                this.dynamicsWorld.setGravity(new Ammo.btVector3(gravity.x * multiply, gravity.y * multiply, gravity.z * multiply));


                // this.dynamicsWorld.setGravity(new Ammo.btVector3(0, -30, 0));

            }}>
                <SThreeGLView
                    handleTouch={this.handleTouch.bind(this)}
                    onGestureEvent={(evt: any) => {
                        var { velocityX, velocityY } = evt.nativeEvent;

                        if (this.personaje) this.personaje.rotateObject(velocityX * -0.005 * this.delta);

                        if (this.personaje) this.personaje.rotateCamera(velocityY * 0.004 * this.delta);
                    }}
                    onCreate={({ gl, renderer, scene, camera }) => {

                        console.log("Entro al onCreate")
                        if (this.Ammo) {

                            this.gl = gl;
                            this.renderer = renderer;
                            const width = gl.drawingBufferWidth / 2;
                            const height = gl.drawingBufferHeight / 2;

                            if (this.css3drenderer) this.css3drenderer.setSize(width, height)
                            this.camera = camera;
                            // this.camera?.add(this.audioListener);
                            scene.name = this.state?.sceneData?.descripcion ?? "Scena sin nombre"
                            scene.userData = { ...this.state.sceneData } ?? {};

                            this.menu?.setScene(scene);
                            this.menu?.setPersonaje(this.personaje)
                            this.scene = scene;

                            // this.securityCameraRenderTarget = new THREE.WebGLRenderTarget(width, height);

                            // Crear la cámara de seguridad
                            // this.securityCamera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
                            // this.securityCamera.position.set(5, 5, 5); // Posición de la cámara de seguridad
                            // this.securityCamera.lookAt(0, 0, 0); // Apunta a la escena

                            // const planeGeometry = new THREE.PlaneGeometry(4, 2);
                            // const planeMaterial = new THREE.MeshBasicMaterial({ map: this.securityCameraRenderTarget.texture });
                            // const screen = new THREE.Mesh(planeGeometry, planeMaterial);
                            // screen.position.set(0, 2, -5); // Posición del "monitor"
                            // scene.add(screen);

                            // this.scene.add(this.plano)
                            // this.plano.position.set(0, 2, 0)

                            // const css = new CSS3DObject(this.cssobject);
                            // this.scene.add(css)
                            // css.position.copy(this.plano.position);
                            // css.rotation.copy(this.plano.rotation);
                            // this.plano.scale.set(0.5, 0.5, 0.5)
                            // this.plano.rotation.set(0, 1, 1)
                            // this.scene.add(this.plano2)
                            // this.plano2.position.set(10, 2, 0)
                            // scene.background = new THREE.Color(0x040490); // Color del cielo (azul claro)



                            // new RGBELoader().load("https://drive.servisofts.com/http/HDRI/preller_drive_1k.hdr", (texture) => {
                            // new RGBELoader().load("https://drive.servisofts.com/http/HDRI/satara_night_no_lamps_1k.hdr", (texture) => {
                            //     // scene.background = texture;
                            //     // scene.environment = texture;
                            //     const geometry = new THREE.SphereGeometry(200, 60, 40);
                            //     geometry.scale(-1, 1, 1); // Escala inversa para mirar hacia adentro
                            //     const material = new THREE.MeshBasicMaterial({ map: texture });
                            //     const sphere = new THREE.Mesh(geometry, material);
                            //     sphere.name = "BackgroundHDRI"
                            //     scene.add(sphere);
                            //     this.applyChildModify(this.scene?.userData?.data?.child_modify ?? {})
                            // })
                            // renderer.setClearAlpha(1);
                            // this.fisrtPersonControl = new FirstPersonControls(camera, false);
                            // scene.add(this.ambientLight);
                            // new Luces(scene);
                            const ambientLight = new THREE.AmbientLight(this.state.sceneData?.data?.AmbientLight?.color ?? 0x707070, this.state.sceneData?.data?.AmbientLight?.intensity ?? 1);
                            ambientLight.name = "LuzAmbiental"
                            scene.add(ambientLight);
                            // const fogColor = new THREE.Color(0x000000);
                            // const near = 0.1;
                            // const far = 100;
                            // scene.fog = new THREE.Fog(fogColor, near, far);
                            // scene.fog = new THREE.FogExp2(fogColor, 0.01);

                            scene.add(this.terreno)
                            const terrenoBody = this.terreno.createBody({ Ammo: this.Ammo });
                            this.dynamicsWorld.addRigidBody(terrenoBody)

                            this.personaje.setCamera(camera);
                            this.personaje.userData.ignoreForRaycast = true;
                            scene.add(this.personaje);



                            this.meshes = new Meshes({
                                scene: scene,
                                key_scene: this.pk,
                                Ammo: this.Ammo,
                                physicsWorld: this.dynamicsWorld,
                                toRaycaster: this.toRaycaster,
                                glftLoaderCache: this.gltfLoaderCache,
                            })
                            this.menu?.setMeshes(this.meshes)


                            this.sprites = [];


                            this.avatares = new Avatares({ key_scene: this.pk, glftLoaderCache: this.gltfLoaderCache, });
                            this.avatares.init()
                            this.personaje.init({
                                Ammo: this.Ammo,
                                ammoWorld: this.dynamicsWorld,
                                startPosition: { x: this.sx, y: this.sy, z: this.sz },
                                startRotation: { x: this.rx, y: this.ry, z: this.rz },
                            });
                            // this.avatares.init().then(e => {
                            //     if (!this.Ammo) return;
                            //     const myAvatar: any = Object.values(e.data).find((e: any) => e.key_usuario == Model.usuario.Action.getKey());
                            //     console.log(myAvatar)
                            //     // console.log("Iniciando mi avatar", myAvatar?.data?.position, this.sx, this.sy, this.sz, myAvatar?.data?.rotation)
                            //     this.personaje.loadGlb(myAvatar?.data?.skinurl ?? "https://drive.servisofts.com/http/models/player/robot.glb")
                            //     this.personajeBody = this.personaje.createBody({
                            //         Ammo: this.Ammo,
                            //         ammoWorld: this.dynamicsWorld,
                            //         position: { x: myAvatar?.data?.position?.x ?? this.sx, y: myAvatar?.data?.position?.y ?? (this.sy ?? 10), z: myAvatar?.data?.position?.z ?? this.sz },
                            //         rotation: { x: myAvatar?.data?.rotation?._x ?? this.rx, y: myAvatar?.data?.rotation?._y ?? this.ry, z: myAvatar?.data?.rotation?._z ?? this.rz },

                            //     });
                            //     this.dynamicsWorld.addRigidBody(this.personajeBody)
                            // }).catch(e => {

                            // })
                            scene.add(this.avatares);
                            this.sky = new StarrySky(scene);
                            // this.rain = new Rain(scene);



                            // this.humo = new HumoVolumetrico(scene);
                            this.agua = new Agua(scene);

                            // scene.add(this.shader)

                            // this.shader.rotation.x = -Math.PI / 2
                            // this.shader.position.y = 100;
                            // this.shader.scale.set(10, 10, 1)




                            // const sprite2 = new Sprite({ url: "https://drive.servisofts.com/http/sprites/humo.png", col: 3, row: 2, width: 2, height: 2, tileDisplayDuration: 250 });
                            // sprite2.position.set(3, 3, 0);
                            // this.sprites.push(sprite2);
                            // scene.add(sprite2)

                            // const sprite3 = new Sprite({ url: "https://drive.servisofts.com/http/sprites/pasto.png", col: 1, row: 2, width: 1, height: 1, tileDisplayDuration: 100 });
                            // sprite3.position.set(5, 3, 0);
                            // this.sprites.push(sprite3);
                            // scene.add(sprite3)

                            // const sound2 = new THREE.PositionalAudio(this.audioListener);

                            // const audioLoader2 = new THREE.AudioLoader();
                            // audioLoader2.load('https://drive.servisofts.com/http/audio/trueno.mp3', function (buffer) {
                            //     sound2.setBuffer(buffer);
                            //     sound2.setLoop(true);
                            //     sound2.setVolume(1.0);
                            //     sound2.setRolloffFactor(1);
                            //     sound2.setRefDistance(5); // Ajusta la distancia de referencia
                            //     sound2.setMaxDistance(20)
                            //     sound2.play();

                            // });
                            // const sprite4 = new Sprite({ url: "https://drive.servisofts.com/http/sprites/rayo.png", col: 3, row: 2, width: 10, height: 40, tileDisplayDuration: 100 });
                            // sprite4.position.set(8, 20, 20);
                            // sprite4.add(sound2)
                            // this.sprites.push(sprite4);
                            // scene.add(sprite4)


                            // const waterGeometry = new THREE.PlaneGeometry(20, 20 , 2, 2);

                            // this.water = new Water(waterGeometry, {
                            //     color: 0xffffff,
                            //     scale: 4,
                            //     flowDirection: new THREE.Vector2(1, 0),
                            //     textureWidth: 1024,
                            //     textureHeight: 1024
                            // });

                            // this.water.position.y = 0.1;
                            // this.water.rotation.x = Math.PI;
                            // scene.add(this.water);




                            // const sound = new THREE.PositionalAudio(this.audioListener);
                            // const audioLoader = new AudioLoader();
                            // console.log("Intentando cargar el audio");
                            // audioLoader.load('https://drive.servisofts.com/http/audio/flame.mp3', function (buffer) {
                            //     console.log("Cargo el audio");
                            //     sound.setBuffer(buffer);
                            //     sound.setLoop(true);
                            //     sound.setVolume(1.0);
                            //     sound.setRolloffFactor(1);
                            //     sound.setRefDistance(1); // Ajusta la distancia de referencia
                            //     sound.setMaxDistance(1)
                            //     sound.play();
                            // }, () => { }, error => {
                            //     console.log(error)
                            // });

                            // const sprite = new Sprite({ url: "https://drive.servisofts.com/http/sprites/fuego.png", col: 2, row: 2, width: 2, height: 2 });
                            // sprite.position.set(0, 1, 0);
                            // this.sprites.push(sprite);
                            // scene.add(sprite)
                            // sprite.add(sound)

                            this.applyChildModify(this.scene.userData?.data?.child_modify ?? {})



                        }


                    }}
                    update={({ delta }) => {
                        this.delta = delta;
                        // const fixedTimeStep = 1.0 / 60.0;
                        const fixedTimeStep = 1.0 / 120.0;
                        this.dynamicsWorld.stepSimulation(delta, 10, fixedTimeStep);

                        this.detectCollisions();
                        Attack.update({ delta: delta })

                        if (this.sprites) {
                            this.sprites.map(sprite => {
                                sprite.update({ delta: delta })
                                if (this.camera) {
                                    sprite.updateToCamera({ delta: delta, camera: this.camera })
                                }
                            })

                        }
                        if (this.Ammo) {
                            if (this.personaje) this.personaje.update({ delta: delta, Ammo: this.Ammo })
                            if (this.avatares) this.avatares.update({ delta: delta, Ammo: this.Ammo, })
                        }
                        if (this.meshes) {
                            this.meshes.update(delta)
                        }

                        if (this.scene) {
                            if (this.scene.userData.sendServer) {
                                this.scene.userData.sendServer = false;
                                this.throttledSendToServer();
                            }
                        }
                        if (this.menu) this.menu.update({ delta: delta })
                        if (this.planeView) this.planeView.update({
                            delta: delta, // Tiempo entre cada render
                            scene: this.scene, // Toda la scena en threee
                            camera: this.camera, // camara
                            plane: this.plano, // pano al que hay cliparse
                            gl: this.gl, // glviewer
                            renderer: this.renderer //renderer o canvas
                        })
                        if (this.PlaneViewGerardo) this.PlaneViewGerardo.update({
                            delta: delta, // Tiempo entre cada render
                            scene: this.scene, // Toda la scena en threee
                            camera: this.camera, // camara
                            plane: this.plano2, // pano al que hay cliparse
                            gl: this.gl, // glviewer
                            renderer: this.renderer //renderer o canvas
                        })


                        if (this.css3drenderer) this.css3drenderer.render(this.scene, this.camera)
                        if (this.sky) this.sky.update({ delta: delta, camera: this.camera as THREE.PerspectiveCamera })
                        if (this.rain) this.rain.update({ delta: delta, camera: this.camera as THREE.PerspectiveCamera })
                        if (this.agua) this.agua.update({ delta: delta })
                        if (this.humo) this.humo.update({ delta: delta, camera: this.camera as THREE.PerspectiveCamera })

                        // if (this.renderer && this.scene) {
                        //     this.renderer.setRenderTarget(this.securityCameraRenderTarget);
                        //     this.renderer.render(this.scene, this.securityCamera);
                        //     this.renderer.setRenderTarget(null);
                        // }

                        // if (this.fisrtPersonControl) this.fisrtPersonControl.update(delta)
                    }}
                />
            </SAmmoView>
            <Menu ref={ref => this.menu = ref ?? undefined} />
            <MeshInfo ref={ref => this.meshInfoWindow = ref ?? undefined} />
            <Joystick
                onJump={() => { this.personaje.applyJump(); }}
                onMove={(e: any) => { if ((e.x != 0 || e.y != 0) && this.Ammo) this.personaje.applyImpulse({ x: e.x, y: e.y }) }}
                onKeyDown={(e: any) => {
                    if (!this.scene) return;
                    if (e.code == "KeyC") {
                        if (!this.camera) return
                        let forwardDirectionCamera = new THREE.Vector3();
                        this.camera.getWorldDirection(forwardDirectionCamera);

                        // Posiciones del personaje
                        const currentPosition = new THREE.Vector3();
                        this.personaje.getWorldPosition(currentPosition);
                        currentPosition.y = currentPosition.y + 0.5
                        const forwardDirection = new THREE.Vector3();
                        this.personaje.getWorldDirection(forwardDirection);

                        const distance = -0.5; // Ajusta esta distancia según tus necesidades
                        const forwardPosition = new THREE.Vector3();
                        forwardPosition.copy(currentPosition).add(forwardDirection.multiplyScalar(distance));

                        const targetPoint = this.getAimPointInWorld();

                        if (targetPoint) {
                            // Calcular la dirección desde el personaje hacia el punto objetivo

                            // const geometry = new THREE.SphereGeometry(0.1, 16, 16);
                            // const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
                            // const projectile = new THREE.Mesh(geometry, material);
                            // projectile.position.copy(targetPoint);
                            // this.scene.add(projectile);
                            forwardDirectionCamera = new THREE.Vector3().subVectors(targetPoint, forwardPosition).normalize();

                        }
                        const attack = new Attack({
                            Ammo: this.Ammo,
                            physicsWorld: this.dynamicsWorld,
                            position: { x: forwardPosition.x, y: forwardPosition.y, z: forwardPosition.z },
                            direcction: { x: forwardDirectionCamera.x, y: forwardDirectionCamera.y, z: forwardDirectionCamera.z },
                            scene: this.scene,
                            key_scene: this.pk,
                            velocity: 350,
                            // velocity: 30,
                            // velocity: 100,
                            otherUser: false,
                        })
                        // this.s
                        // this.personaje.attack(this.scene, this.Ammo, this.dynamicsWorld);
                    }
                }
                }
            />

            <SView
                style={{ position: "absolute", padding: 8, backgroundColor: "#00000066", top: 70, right: 8 }}
                onPress={() => {
                    this.personaje.playAnimation("dance")
                    this.personaje.throttledSendToServer();
                }} center>
                <SText>DANCE</SText>
            </SView>
            <SView
                style={{ position: "absolute", padding: 8, backgroundColor: "#00000066", top: 110, right: 8 }}
                onPress={() => {
                    this.personaje.playAnimation("sitting")
                    this.personaje.throttledSendToServer();
                }} center>
                <SText>SIT</SText>
            </SView>
            <SView
                style={{ position: "absolute", padding: 8, backgroundColor: "#00000066", top: 150, right: 8 }}
                onPress={() => {
                    this.personaje.playAnimation("capoeira")
                    this.personaje.throttledSendToServer();
                }} center>
                <SText>CAPOEIRA</SText>
            </SView>
            <SView
                style={{ position: "absolute", padding: 8, backgroundColor: "#00000066", top: 200, right: 8 }}
                onPress={() => {
                    const exporter = new GLTFExporter();
                    exporter.parse(this.scene as THREE.Scene, function (result: any) {
                        // Crear un blob a partir del buffer
                        // @ts-ignore
                        const blob = new Blob([result], { type: 'application/octet-stream' });

                        // Crear un enlace para descargar el archivo
                        // @ts-ignore
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = 'scene.glb';
                        link.click();
                        // @ts-ignore
                    }, null, { binary: true });
                    // this.personaje.playAnimation("capoeira")
                    // this.personaje.throttledSendToServer();
                }} center>
                <SText>EXPORT</SText>
            </SView>

            {/* <SView
                style={{ position: "absolute", padding: 8, backgroundColor: "#00000066", top: 110, right: 8 }}
                onPress={() => {
                    this.modeConstructor = !this.modeConstructor
                    if (this.modeConstructor) {
                        this.personaje.camParams.y = 5;
                        this.personaje.camParams.z = 3;
                        this.personaje.camParams.look = 1.3;
                    } else {
                        this.personaje.camParams.y = 2;
                        this.personaje.camParams.z = 3;
                        this.personaje.camParams.look = 1.3;
                    }
                    // SNavigation.goBack();

                }} center>
                <SText>MODE CONSTRUCTOR</SText>
            </SView> */}
            {/* 
            <SView
                style={{ position: "absolute", padding: 8, backgroundColor: "#00000066", top: 150, right: 8 }}
                onPress={() => {
                    this.personaje.camParams.y = 2;
                    this.personaje.camParams.z = 3;
                    this.personaje.camParams.look = 1.3;
                }} center>
                <SText>CAMERA 2</SText>
            </SView>
            <SView
                style={{ position: "absolute", padding: 8, backgroundColor: "#00000066", top: 190, right: 8 }}
                onPress={() => {
                    this.personaje.camParams.y = 2;
                    this.personaje.camParams.z = -3;
                    this.personaje.camParams.look = 0.8;
                }} center>
                <SText>CAMERA 3</SText>
            </SView> */}

            {/* <SView
                style={{ position: "absolute", padding: 8, backgroundColor: "#00000066", top: 270, right: 8 }}
                onPress={() => {
                    if (this.state?.sceneData?.data?.music) {
                        // console.log(e.data[this.pk]?.data?.music);
                        this.music = Sounds.play({
                            src: this.state?.sceneData?.data?.music,
                            loops: -1
                        })
                    }
                }} center>
                <SText>PLAY MUSIC</SText>
            </SView> */}
            <SView
                style={{ position: "absolute", bottom: 8, right: 8, width: 80, height: 40, zIndex: 999 }}
            >
                <PanGestureHandler>
                    <TapGestureHandler onHandlerStateChange={evt => {
                        console.log("Entro al evet")
                        if (evt.nativeEvent.state === State.END) {
                            this.personaje.applyJump()
                            // if (_handleTouch) _handleTouch(evt)
                        }
                    }}>
                        <View
                            style={{ padding: 8, backgroundColor: "#00000066", }}
                        >
                            <SText>JUMP</SText>
                        </View>
                    </TapGestureHandler>
                </PanGestureHandler>
            </SView>
            {/* <PlaneView ref={ref => this.planeView = ref ?? undefined} /> */}
            {/* <PlaneViewGerardo ref={ref => this.PlaneViewGerardo = ref ?? undefined} /> */}
            {/* <CSS3DRenderer ref={ref => this.css3drenderer = ref}>
                <CSS3DObjectElement ref={ref => this.cssobject = ref} width={200} height={200} />
            </CSS3DRenderer> */}
            <SView style={{
                position: "absolute",
                width: 8,
                height: 8,
                top: "50%",
                left: "50%",
                // backgroundColor: "#ff00ff44",
                borderWidth: 1,
                borderColor: "#666666",
                transform: [{ translateX: -4 }, { translateY: -4 }]
            }} center>
                <SView style={{
                    position: "absolute",
                    width: 2,
                    height: 2,
                    backgroundColor: "#666666",
                    // transform: [{ translateX: -4 }, { translateY: -4 }]
                }} />
            </SView>
        </SView >
    }
}
