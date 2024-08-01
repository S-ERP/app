import React, { Component } from 'react';
import { SGradient, SLoad, SNavigation, SNotification, SPage, SPopup, SText, STheme, SThread, SView } from 'servisofts-component';
import * as THREE from "three"
import Terreno from '../three/primeraPersona/Terreno';
import Personaje from './Personaje';
import SAmmoView, { AmmoType } from '../../Components/SThree/SAmmoView';
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
import { Linking, StatusBar } from 'react-native';
import MeshInfo from './MeshInfo';
import Sounds from '../../Components/Sounds';
import GLTFLoaderCache from './GTLFLoaderCache';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
// import Luces from '../world/Luces';

export default class index extends Component<any> {
    camera?: THREE.PerspectiveCamera;
    objectToClik = [];
    scene?: THREE.Scene;
    raycaster = new THREE.Raycaster()
    ambientLight = new THREE.AmbientLight(0xffffff, 1);
    terreno = new Terreno();
    personaje = new Personaje();
    avatares?: Avatares;
    Ammo?: AmmoType;
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
    gltfLoaderCache = new GLTFLoaderCache();
    constructor(props: any) {
        super(props);
        this.state = {
            ready: false,
            sceneData: null
        }
        this.pk = SNavigation.getParam("pk");

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
    componentWillUnmount(): void {
        if (this.music) this.music.pause();
        SSocket.removeEventListener("onMessage", this.handleOnMessage.bind(this));
        // Sounds.
    }
    handleOnMessage(obj: any) {
        if (obj.component == "avatar" && obj.type == "onmove") {
            if (this.avatares) this.avatares.onMove(obj);
        }
        if (obj.component == "scene_mesh" && obj.type == "onmove") {
            if (this.meshes) this.meshes.onMove(obj);
            // if (this.avatares) this.avatares.onMove(obj);
        }
    }



    render() {

        if (!this.state.ready || !this.state.sceneData) return <SLoad />

        return <SView height col={"xs-12"}>
            <StatusBar hidden={true} />
            {/* <SGradient colors={["#000000", "#000000", "#C14227", "#483844"]} /> */}
            <SGradient colors={this.state.sceneData?.data?.backgroundColors ?? ["#000000", "#000000", "#C14227", "#483844"]} />
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
                        // const intersects = this.raycaster.intersectObjects(this.objectToClik, false);
                        if (this.scene) {
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
                                    console.log(key_scene_mesh)
                                    const objData: any = {
                                        key: key_scene_mesh,
                                    }
                                    if (this.meshInfoWindow) this.meshInfoWindow.setMesh({
                                        key: key_scene_mesh,
                                        data: objData,
                                        mesh: objClick
                                    }, this.Ammo)
                                }
                                // if (objClick?.userData?.deeplink) {
                                //     // SNavigation.openDeepLink(objClick?.userData?.deeplink);
                                //     SPopup.confirm({
                                //         title: "Esta seguro que desea navegar?",
                                //         message: objClick?.userData?.deeplink,
                                //         onPress: () => {
                                //             Linking.openURL(objClick?.userData?.deeplink);
                                //         }
                                //     })
                                //     console.log(objClick?.userData?.deeplink)
                                // }

                            }
                        }

                    }}
                    onGestureEvent={(evt: any) => {
                        var { velocityX, velocityY } = evt.nativeEvent;

                        if (this.personaje) this.personaje.rotateObject(velocityX * -0.005);

                        if (this.personaje) this.personaje.rotateCamera(velocityY * 0.00005);
                    }}
                    onCreate={({ gl, renderer, scene, camera }) => {
                        console.log("Entro al onCreate")
                        if (this.Ammo) {
                            this.camera = camera;
                            this.scene = scene;
                            // scene.background = new THREE.Color(0x040490); // Color del cielo (azul claro)

                            // renderer.setClearAlpha(1);
                            // this.fisrtPersonControl = new FirstPersonControls(camera, false);
                            // scene.add(this.ambientLight);
                            // new Luces(scene);
                            const ambientLight = new THREE.AmbientLight(this.state.sceneData?.data?.AmbientLight?.color ?? 0x707070, this.state.sceneData?.data?.AmbientLight?.intensity ?? 1);
                            // const ambientLight = new THREE.AmbientLight(0x707070, 1);
                            scene.add(ambientLight);
                            // Color de la neblina (gris claro) y distancia donde comienza y termina
                            // Color de la neblina (gris claro) y distancia donde comienza y termina
                            const fogColor = new THREE.Color(0x000000);
                            const near = 0.1;
                            const far = 100;

                            // Añadir neblina a la escena
                            scene.fog = new THREE.Fog(fogColor, near, far);

                            // Añadir neblina a la escena
                            scene.fog = new THREE.FogExp2(fogColor, 0.01);

                            scene.add(this.terreno)
                            const terrenoBody = this.terreno.createBody({ Ammo: this.Ammo });
                            this.dynamicsWorld.addRigidBody(terrenoBody)

                            this.personaje.setCamera(camera);
                            scene.add(this.personaje);

                            this.avatares = new Avatares({ key_scene: this.pk });
                            this.avatares.init().then(e => {
                                if (!this.Ammo) return;
                                const myAvatar: any = Object.values(e.data).find((e: any) => e.key_usuario == Model.usuario.Action.getKey());
                                this.personajeBody = this.personaje.createBody({
                                    Ammo: this.Ammo,
                                    ammoWorld: this.dynamicsWorld,
                                    position: { x: myAvatar?.data?.position?.x ?? 0, y: myAvatar?.data?.position?.y ?? 10, z: myAvatar?.data?.position?.z ?? 0 },
                                    rotation: { x: myAvatar?.data?.rotation?._x ?? 0, y: myAvatar?.data?.rotation?._y ?? 0, z: myAvatar?.data?.rotation?._z ?? 0 },

                                });
                                this.dynamicsWorld.addRigidBody(this.personajeBody)
                            }).catch(e => {

                            })
                            scene.add(this.avatares);

                            this.meshes = new Meshes({
                                scene: scene,
                                key_scene: this.pk,
                                Ammo: this.Ammo,
                                physicsWorld: this.dynamicsWorld,
                                toRaycaster: this.toRaycaster,
                                glftLoaderCache: this.gltfLoaderCache
                            })

                            // this.gltfLoaderCache.load("https://drive.servisofts.com/http/models/texturapared.glb", (load: GLTF) => {
                            //     console.log("esta es la carga",load)
                            // })


                            // this.getAvataresServer({ scene });
                            // this.pelota = new Pelota();
                            // scene.add(this.pelota);
                            // this.pelotaBody = this.pelota.createBody({ Ammo: this.Ammo });
                            // this.dynamicsWorld.addRigidBody(this.pelotaBody)
                            // this.rampa = new Rampa(this.Ammo, this.dynamicsWorld);
                            // this.rampa.load()
                            // this.rampaBody = this.rampa.createBody({ Ammo: this.Ammo });
                            // this.dynamicsWorld.addRigidBody(this.rampaBody)
                            // });
                            // scene.add(this.rampa);
                        }


                    }}
                    update={({ delta }) => {
                        const deltaTime = 1 / 60;
                        this.dynamicsWorld.stepSimulation(delta, 10);
                        if (this.Ammo) {
                            if (this.personaje) this.personaje.update({ delta: delta, Ammo: this.Ammo })
                            if (this.avatares) this.avatares.update({ delta: delta, Ammo: this.Ammo })
                        }
                        if (this.meshes) {
                            this.meshes.update(delta)
                        }
                        // if (this.fisrtPersonControl) this.fisrtPersonControl.update(delta)
                    }}
                />
            </SAmmoView>
            <MeshInfo ref={ref => this.meshInfoWindow = ref ?? undefined} />
            <Joystick
                onJump={() => {
                    this.personaje.applyJump();

                }}
                onMove={(e: any) => {
                    if ((e.x != 0 || e.y != 0) && this.Ammo) {
                        this.personaje.applyImpulse({ x: e.x, y: e.y })
                    }
                }} />
            <SView
                style={{ position: "absolute", padding: 8, backgroundColor: "#00000066", bottom: 8, right: 8 }}
                onPress={() => { this.personaje.applyJump() }} center>
                <SText>JUMP</SText>
            </SView>
            <SView
                style={{ position: "absolute", padding: 8, backgroundColor: "#00000066", top: 70, right: 8 }}
                onPress={() => {
                    SNavigation.goBack();
                }} center>
                <SText>SALIR</SText>
            </SView>
            <SView
                style={{ position: "absolute", padding: 8, backgroundColor: "#00000066", top: 32, right: 8 }}
                onPress={() => {
                    SNavigation.navigate("/mesh", {
                        onSelect: (mesh: any) => {
                            console.log(mesh)
                            SSocket.sendPromise({
                                component: "scene_mesh",
                                type: "registro",
                                key_usuario: Model.usuario.Action.getKey(),
                                data: {
                                    key_scene: this.pk,
                                    key_mesh: mesh.key,
                                    url: mesh.url,
                                    data: {
                                        position: { x: this.personaje.mesh.position.x + 1, y: this.personaje.mesh.position.y, z: this.personaje.mesh.position.z + 1, },
                                        rotation: { x: 0, y: 0, z: 0, w: 1 },
                                    }
                                },
                            }).then(e => {

                            }).catch(e => {

                            })
                            SNavigation.goBack();
                        }
                    })

                }} center>
                <SText>ADD MESH</SText>
            </SView>

            <SView
                style={{ position: "absolute", padding: 8, backgroundColor: "#00000066", top: 110, right: 8 }}
                onPress={() => {
                    this.personaje.camParams.y = 1;
                    this.personaje.camParams.z = 1;
                    this.personaje.camParams.look = 0.8;
                    // SNavigation.goBack();
                }} center>
                <SText>CAMERA 1</SText>
            </SView>
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
            </SView>
            <SView
                style={{ position: "absolute", padding: 8, backgroundColor: "#00000066", top: 230, right: 8 }}
                onPress={() => {
                    SNavigation.navigate("/scene/editar", { pk: this.pk })
                }} center>
                <SText>SCENE</SText>
            </SView>
            <SView
                style={{ position: "absolute", padding: 8, backgroundColor: "#00000066", top: 260, right: 8 }}
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
            </SView>
        </SView>
    }
}
