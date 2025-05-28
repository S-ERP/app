import React from "react";
import { SButtom, SIcon, SInput, SNavigation, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import * as THREE from "three"
import LayersInfo from "./LayersInfo";
import SCopy from "../../../Components/SCopy";
import Personaje from "../Personaje";
import SSocket from "servisofts-socket";
import Model from "../../../Model";
import Meshes from "../Meshes";
import PlayerInfo from "./PlayerInfo";


const Cameras = [
    { x: 0, y: 0.8, z: 0.1, look: 0.8, upDownVelocity: 0.1, cameraVerticalAngle: 1, near: 0.3 },
    { x: 0, y: 5, z: 4, look: 1.3, upDownVelocity: 0.9, cameraVerticalAngle: 0.4, near: 0.1 },
    { x: 0, y: 3, z: 2, look: 0.8, upDownVelocity: 0.9, cameraVerticalAngle: 0.4, near: 0.1 },
    { x: 0, y: 4, z: -3, look: 1, upDownVelocity: 0.8, cameraVerticalAngle: 0.4, near: 0.1 },
]

let lastIndexSelect = 0;
export default class index extends React.Component {
    update(props: { delta: number; }) {
        if (LayersInfo.REF) {
            LayersInfo.REF.update(props);
        }
        if (this.playerInfo) {
            this.playerInfo.update({ delta: props.delta, personaje: this.personaje })
        }
        // throw new Error('Method not implemented.');
    }

    state = {
        buildMode: false,
        camera: lastIndexSelect,
    }
    personaje?: Personaje;
    playerInfo?: PlayerInfo;
    setPersonaje(personaje: Personaje) {
        this.personaje = personaje
        this.personaje.camParams = {
            ...this.personaje.camParams,
            ...Cameras[this.state.camera]
        }

    }
    scene?: THREE.Scene;
    setScene(scene: THREE.Scene) {
        this.scene = scene;
    }
    meshes?: Meshes;
    setMeshes(meshes: Meshes) {
        this.meshes = meshes;
    }

    componentWillUnmount(): void {
        LayersInfo.close();
    }

    handleCopy() {
        if (this?.personaje?.position) {
            const position = this.personaje.mesh.position;
            const rotation = this.personaje.mesh.rotation;
            const deeplink = "https://serp.servisofts.com/scene?pk=" + this.scene?.userData?.key + "&px=" + position.x.toFixed(3) + "&py=" + position.y.toFixed(3) + "&pz=" + position.z.toFixed(3) + "&rx=" + rotation.x.toFixed(3) + "&ry=" + rotation.y.toFixed(3) + "&rz=" + rotation.z.toFixed(3);
            SCopy.copy(deeplink);

        }
    }
    handleAddMesh() {
        SNavigation.navigate("/mesh", {
            onSelect: (mesh: any) => {
                if (!this.personaje) return;
                SSocket.sendPromise({
                    component: "scene_mesh",
                    type: "registro",
                    key_usuario: Model.usuario.Action.getKey(),
                    data: {
                        key_scene: this.scene?.userData?.key,
                        key_mesh: mesh.key,
                        tipo: mesh.tipo,
                        descripcion: mesh.descripcion,
                        url: mesh.url,
                        data: {
                            position: { x: this.personaje.mesh.position.x + 1, y: this.personaje.mesh.position.y - 0.9, z: this.personaje.mesh.position.z + 1, },
                            rotation: { x: 0, y: 0, z: 0, w: 1 },
                            // texture: "",
                        }
                    },
                }).then(e => {

                }).catch(e => {

                })
                SNavigation.goBack();
            }
        })
    }

    handleCamera() {
        if (!this.personaje) return;
        let nextIndex = this.state.camera + 1;
        if (nextIndex > Cameras.length - 1) {
            nextIndex = 0;
        }
        lastIndexSelect = nextIndex;
        this.state.camera = nextIndex;
        this.personaje.camParams = {
            ...this.personaje.camParams,
            ...Cameras[this.state.camera]
        }
        this.personaje.cameraVerticalAngle = Cameras[this.state.camera].cameraVerticalAngle ?? 1;
        this.setState({ ...this.state })
    }

    handleBuild() {
        if (!this.scene) return;
        this.state.buildMode = !this.state.buildMode
        if (this.state.buildMode) {
            LayersInfo.open({ scene: this.scene })
        } else {
            LayersInfo.close();
        }
        if (this.scene?.userData) {
            this.scene.userData.modeConstructor = this.state.buildMode;
        }
        this.setState({ ...this.state });


    }

    handleLayer() {
        this.scene ? LayersInfo.open({ scene: this.scene }) : null
    }
    input: any;
    handleChangeSkin() {
        if (!this.personaje) return;
        SPopup.open({
            key: "changeskin",
            content: <SView width={250} height={250} center backgroundColor={STheme.color.background} withoutFeedback>
                <SInput type="textArea" ref={(e: any) => this.input = e} defaultValue={this.personaje.skinurl} />
                <SButtom onPress={() => {
                    if (this.personaje) {
                        this.personaje.changeSkin(this.input.getValue())
                    }
                    SPopup.close("changeskin");
                }}>ACEPTAR</SButtom>
            </SView>
        })
    }
    render() {
        return <SView
            col={"xs-12"} height={50} style={{ position: "absolute", top: 0, }} row>
            <SButtom type="outline" onPress={() => SNavigation.goBack()}>Salir</SButtom>
            <SButtom type="outline" onPress={this.handleCopy.bind(this)}>Copy Position</SButtom>
            <SButtom type="outline" onPress={this.handleAddMesh.bind(this)}>Add Mesh</SButtom>
            <SButtom type="outline" onPress={this.handleChangeSkin.bind(this)}>Change SKIN</SButtom>
            {/* <SButtom type="outline" onPress={this.handleLayer.bind(this)}>Layers</SButtom> */}
            <SButtom type={this.state.buildMode ? "danger" : "outline"} onPress={this.handleBuild.bind(this)}>{this.state.buildMode ? "Exit Build" : "Build Mode"}</SButtom>
            <SButtom type={"outline"} onPress={this.handleCamera.bind(this)}>{"Camera " + (this.state.camera + 1)}</SButtom>
            <SButtom type={this.personaje?.flyMode ? "danger" : "outline"} onPress={() => {
                if (!this.personaje) return;
                this.personaje.flyMode = !this.personaje.flyMode
                this.setState({ ...this.state})
            }}>{!!this.personaje?.flyMode ? "Exit Fly" : "Go Fly"}</SButtom>
            <PlayerInfo ref={(ref: any) => this.playerInfo = ref} />
        </SView>
    }
}