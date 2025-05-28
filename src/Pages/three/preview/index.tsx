import React, { Component } from 'react';
import { SGradient, SHr, SIcon, SList, SLoad, SNavigation, SPage, SText, SView } from 'servisofts-component';
import SThreeGLView from '../../../Components/SThree/SThreeGLView';
import SceneButtom from '../../../Components/SThree/SceneButtom';
import * as THREE from "three"
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CustomOrbitControls } from '../../../Components/SThree';

class ActionBar extends Component<any> {
    glb?: GLTF;
    preview?: Preview;
    state = {
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

export default class Preview extends Component<any> {
    // cube;
    mixers: any = []
    controls?: CustomOrbitControls;
    glb?: GLTF;
    actionBar?: ActionBar;
    mixer?: THREE.AnimationMixer;
    actions: { [key: string]: THREE.AnimationAction };
    state;
    constructor(props: any) {
        super(props);
        this.state = {
            // url: "http://192.168.2.1:30017/models/muneca.glb",
            url: SNavigation.getParam("url"),
            ready: false,
        }
        this.actions = {};
        // const geometry = new THREE.BoxGeometry();
        // const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        // this.cube = new THREE.Mesh(geometry, material);
        // this.cube.position.y = 1;
    }
    render() {
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
                    // new GLTFLoader().load("http://192.168.2.1:30017/models/muneca.glb", (glb) => {
                    new GLTFLoader().load(this.state.url, (glb) => {

                        this.glb = glb;
                        if (this.actionBar) {
                            this.actionBar.setGlb(glb);
                            this.actionBar.setPreview(this);
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

            <SceneButtom
                name="iCamera"
                width={60}
                height={60}
                right={10}
                top={40}
                text={"CAMERA 1"}
                topText={20}
                onPress={() => {
                }} />

            <SceneButtom
                name="iCamera"
                width={60}
                height={60}
                right={10}
                top={110}
                text={"CAMERA 2"}
                topText={20}
                onPress={() => {
                }} />

            <SceneButtom
                name="iCamera"
                width={60}
                height={60}
                right={10}
                top={180}
                text={"CAMERA 3"}
                topText={20}
                onPress={() => {
                }} />


            <SceneButtom
                name="iJump"
                width={60}
                height={60}
                right={10}
                bottom={10}
                onPress={() => {
                }} />

            <SceneButtom
                name="iEchado"
                width={60}
                height={60}
                right={75}
                bottom={10}
                onPress={() => {
                }} />

            <SceneButtom
                name="iExit"
                width={60}
                height={60}
                left={10}
                top={10}
                onPress={() => {
                }} />
            <ActionBar ref={ref => this.actionBar = ref ?? undefined} />
        </SPage>
    }
}
