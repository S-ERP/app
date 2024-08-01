import React, { Component } from 'react';
import { SGradient, SHr, SIcon, SImage, SList, SLoad, SNavigation, SPage, SText, SView } from 'servisofts-component';
// import SThreeGLView from '../../../Components/SThree/SThreeGLView';
import SThreeGLView from '../../Components/SThree/SThreeGLView';
import SceneButtom from '../../Components/SThree/SceneButtom';
import * as THREE from "three"
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CustomOrbitControls } from '../../Components/SThree';
import SSocket from 'servisofts-socket';
import Model from '../../Model';



class ActionBar extends Component<any> {
    glb?: GLTF;
    preview?: Preview;
    state: any = {
        ready: false,
    }
    setGlb(glb: GLTF) {
        this.glb = glb;
        this.setState({ ready: true })
    }
    setPreview(preview: Preview) {
        this.preview = preview;
    }



    renderAnimations() {
        if (!this.glb) return;
        return <SList data={this.glb.animations} render={(item) => {
            return <SText onPress={() => {
                console.log("renderAnimations")
                console.log(this.preview)
                if (this.preview) {
                    if (this.preview.actions) {
                        const action: THREE.AnimationAction = this.preview.actions[item.name];
                        this.preview.mixer?.stopAllAction();
                        action.play();
                        console.log(action, item);
                    }
                }
            }}>{item.name}</SText>
        }} />
    }
    render() {
        return <SView style={{
            position: "absolute",
            width: 100,
            height: 300,
            backgroundColor: "#00000088"
        }}>
            <SText>{`ready  ${this.state.ready}`}</SText>
            <SHr />
            {this.renderAnimations()}
        </SView>
    }
}

class PersonajeChange extends Component<any> {
    glb?: GLTF;
    preview?: Preview;
    datos: any = {}
    personaje: any;
    state: any = {
        ready: false,
    }
    setGlb(glb: GLTF) {
        this.glb = glb;
        this.setState({ ready: true })
    }
    setPreview(preview: Preview) {
        this.preview = preview;
    }

    componentDidMount(): void {
        this.init();

    }
    async requestDataFromServer() {
        const resp: any = await SSocket.sendPromise({
            component: "mesh",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
        });
        return resp.data;
    }

    async init() {
        try {
            const data = await this.requestDataFromServer();
            this.setState({ data });
            this.setState({ personaje: data.url })
            // console.log(data)
            this.datos = data;
            console.log("NONO", this.datos)
            if (JSON.stringify(data) != '{}') {
                console.log("OKOK")
                let keyOne = Object.keys(data)[0]

                this.personaje = data[keyOne].url
                console.log(this.personaje)

            }
        } catch (error) {
            console.error(error)
        }

    }


    eliminarScene(scene: any) {
        // Recorrer y eliminar todos los objetos
        scene.traverse((object: any) => {
            if (object.isMesh) {
                if (object.geometry) object.geometry.dispose();

                if (Array.isArray(object.material)) {
                    object.material.forEach((material: any) => material.dispose());
                } else {
                    if (object.material) object.material.dispose();
                }

                if (object.material && object.material.map) {
                    object.material.map.dispose();
                }
            }
        });

        // Eliminar objetos hijos
        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }

        // Liberar la escena
        scene = null;
    }


    renderItem(obj: any) {
        return <SView row padding={5} onPress={() => {
            // if (this.onSelect) {
            //     this.onSelect(obj);
            //     return;
            // }

            // SNavigation.navigate("/mesh/edit", { key: obj.key })
            console.log("renderAnimationsPersonaje")
            console.log(this.preview)
            if (this.preview) {
                if (this.preview.personajeChange) {
                    this.eliminarScene(this.preview.glb?.scene)

                    new GLTFLoader().load(this.preview.personajeChange.personaje, (glb) => {

                        this.glb = glb;
                        const object3D = glb.scene;
                        if (this.preview) {
                            this.preview.glb?.scene.add(object3D);
                        }
                    })


                }
            }

            console.log(this.personaje)
            console.log(obj)
            this.personaje = obj.url
            console.log(this.personaje)
        }}>
            <SView card width={100}>
                <SView width={100} height={110} style={{ padding: 4 }}>
                    <SView flex height card style={{
                        overflow: 'hidden',
                    }}>
                        <SImage src={SSocket.api.root + "mesh/" + obj?.key + "?date=" + new Date().getTime()} style={{ resizeMode: "cover" }} />
                    </SView>
                </SView>
                <SText padding={5} center fontSize={14} bold>{obj.descripcion}</SText>
            </SView>
        </SView>
    }

    render() {
        return <SView col={"xs-12"}
            style={{
                position: "absolute",
                bottom: 0,
                zIndex: 999,
                backgroundColor: "#000000",
                height: 200,
                overflow: "hidden"
            }}>
            <SText>PERSONAJES:</SText>
            <SList data={this.datos}
                horizontal
                filter={d => d.is_personaje == true}
                render={this.renderItem.bind(this)}
            />
        </SView>
    }
}

export default class Preview extends Component<any> {
    // cube;
    mixers: any = []
    controls?: CustomOrbitControls;
    glb?: GLTF;
    actionBar?: ActionBar;
    personajeChange?: PersonajeChange
    mixer?: THREE.AnimationMixer;
    actions: { [key: string]: THREE.AnimationAction };
    datos: any = {}
    state: any;
    personaje: any;

    constructor(props: any) {
        super(props);
        this.state = {
            // url: "http://192.168.2.1:30017/models/muneca.glb",
            // url: "https://drive.servisofts.com/http/models/human.glb",
            ready: false,
            // personaje : "https://drive.servisofts.com/http/models/human.glb",
        }
        this.actions = {};
        this.datos = {};
        // this.personaje = "https://drive.servisofts.com/http/models/human.glb"
        this.personaje = ""

        // const geometry = new THREE.BoxGeometry();
        // const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        // this.cube = new THREE.Mesh(geometry, material);
        // this.cube.position.y = 1;
    }

    componentDidMount(): void {
        this.init();

    }
    async requestDataFromServer() {
        const resp: any = await SSocket.sendPromise({
            component: "mesh",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
        });
        return resp.data;
    }

    async init() {
        try {
            const data = await this.requestDataFromServer();
            this.setState({ data });
            this.setState({ personaje: data.url })
            // console.log(data)
            this.datos = data;
            console.log("NONO", this.datos)
            if (JSON.stringify(data) != '{}') {
                console.log("OKOK")
                let keyOne = Object.keys(data)[0]

                this.personaje = data[keyOne].url
                console.log(this.personaje)

            }
        } catch (error) {
            console.error(error)
        }

    }



    // Data = async () => {

    //     return await SSocket.sendPromise({
    //         component: "mesh",
    //         type: "getAll",
    //         key_usuario: Model.usuario.Action.getKey(),
    //         key_empresa: Model.empresa.Action.getKey(),
    //     })
    //         .then((resp) => {
    //             if (resp.estado === "error") return resp;
    //             return resp.data;
    //         })
    //         .catch((e) => {
    //             return { estado: "error", error: e }
    //         });
    // }



    renderItem(obj: any) {
        return <SView row padding={5} onPress={() => {
            // if (this.onSelect) {
            //     this.onSelect(obj);
            //     return;
            // }

            // SNavigation.navigate("/mesh/edit", { key: obj.key })

            console.log(this.personaje)
            console.log(obj)
            this.personaje = obj.url
            console.log(this.personaje)
        }}>
            <SView card width={100}>
                <SView width={100} height={110} style={{ padding: 4 }}>
                    <SView flex height card style={{
                        overflow: 'hidden',
                    }}>
                        <SImage src={SSocket.api.root + "mesh/" + obj?.key + "?date=" + new Date().getTime()} style={{ resizeMode: "cover" }} />
                    </SView>
                </SView>
                <SText padding={5} center fontSize={14} bold>{obj.descripcion}</SText>
            </SView>
        </SView>
    }



    render() {
        // const {datas} = this.state
        if (!this.state.data) return <SLoad />
        return <SPage title={"world"} disableScroll>
            <SGradient colors={["#FFFFFF", "#9090D0"]} />
            <SThreeGLView
                onGestureEvent={event => {
                    const { translationX, translationY } = event.nativeEvent;
                    if (this.controls) this.controls.handleGesture(translationX, translationY);
                }}
                onCreate={({ gl, renderer, scene, camera }) => {
                    this.controls = new CustomOrbitControls(camera);
                    this.controls.pan.y = 2;
                    this.controls.zoom = 5;
                    scene.add(new THREE.GridHelper(100, 100))
                    camera.position.z = 3;
                    camera.position.y = 1.2;
                    scene.add(new THREE.AmbientLight(0xffffff, 2));
                    // new GLTFLoader().load("https://drive.servisofts.com/http/models/human.glb", (glb) => {
                    new GLTFLoader().load(this.personaje, (glb) => {
                        console.log("COMPARAR")
                        console.log(this.personaje, this.personajeChange)
                        this.glb = glb;
                        if (this.actionBar) {
                            console.log("actionBar")
                            this.actionBar.setGlb(glb);
                            this.actionBar.setPreview(this);
                        }
                        if (this.personajeChange) {
                            console.log("personajeChange en Preview")
                            console.log(this.personajeChange)
                            this.personajeChange.setGlb(glb);
                            this.personajeChange.setPreview(this);
                        }
                        const object3D = glb.scene;
                        scene.add(object3D);
                        this.glb = glb;
                        // if (glb.animations) {
                        //     if (glb.animations.length > 0) {
                        this.mixer = new THREE.AnimationMixer(object3D);
                        // this.action = this.mixer.clipAction(glb.animations[1]);
                        //         const action = 
                        //         action.play();
                        glb.animations.forEach((clip) => {
                            if (this.mixer) {
                                const action = this.mixer.clipAction(clip);
                                this.actions[clip.name] = (action);
                            }
                            //         //     console.log("clip", clip);
                            //         //     console.log("action", action);
                            //         //     action.play();

                        });

                        //     }
                        // }
                    })

                }}
                update={({ delta }) => {

                    // if (this.controls) this.controls.update()
                    if (this.mixer) {
                        this.mixer.update(delta);
                    }
                    // this.cube.rotation.x += 1 * delta;
                    // this.cube.rotation.y += 1 * delta;
                }}
            />

            {/* <SView col={"xs-12"}
                style={{
                    position: "absolute",
                    bottom: 0,
                    zIndex: 999,
                    backgroundColor: "#000000",
                    height: 200,
                    overflow: "hidden"
                }}>
                <SText>PERSONAJES:</SText>
                <SList data={this.datos}
                    horizontal
                    filter={d => d.is_personaje == true}
                    render={this.renderItem.bind(this)}
                />
            </SView> */}

            <PersonajeChange ref={ref => this.personajeChange = ref ?? undefined} />
            <ActionBar ref={ref => this.actionBar = ref ?? undefined} />
        </SPage>
    }
}
