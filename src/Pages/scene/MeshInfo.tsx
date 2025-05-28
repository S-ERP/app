import React, { Component } from 'react';
import { SGradient, SHr, SIcon, SImage, SInput, SList, SLoad, SNotification, SPage, SRangeSlider, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';
import * as THREE from "three"
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Slider } from "../../Components/RangeSlider"
import SSocket from 'servisofts-socket';
import { MeshItem } from './Meshes';
import Model from '../../Model';
import { ScrollView } from 'react-native-gesture-handler';

interface xyz {
    x: number;
    y: number;
    z: number;
    w?: number;
}

interface Data {
    position?: xyz;
    rotation?: xyz;
    scale?: xyz;
}

export interface DBModelMesh {
    descripcion: string;
    key_usuario: string;
    key_scene?: string;
    key_mesh?: string;
    data: Data;
    fecha_on: string;
    deeplink: string | null;
    key: string;
    url: string;
    observacion: string;
}

export type MeshObject = {
    key: string,
    mesh: MeshItem,
    data: DBModelMesh,

}
function lerp(start: any, end: any, t: any) {
    return start + (end - start) * t;
}
const slerp = (Ammo: any, q1: any, q2: any, t: any) => {
    const x1 = q1.x();
    const y1 = q1.y();
    const z1 = q1.z();
    const w1 = q1.w();

    let x2: any = q2.x();
    let y2: any = q2.y();
    let z2: any = q2.z();
    let w2: any = q2.w();

    let cosTheta = x1 * x2 + y1 * y2 + z1 * z2 + w1 * w2;

    if (cosTheta < 0) {
        x2 = -x2;
        y2 = -y2;
        z2 = -z2;
        w2 = -w2;
        cosTheta = -cosTheta;
    }

    let scale0, scale1;
    if (cosTheta > 0.9995) {
        // If the inputs are too close for comfort, linearly interpolate
        scale0 = 1 - t;
        scale1 = t;
    } else {
        const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
        const theta = Math.atan2(sinTheta, cosTheta);
        scale0 = Math.sin((1 - t) * theta) / sinTheta;
        scale1 = Math.sin(t * theta) / sinTheta;
    }

    const result = new Ammo.btQuaternion(
        scale0 * x1 + scale1 * x2,
        scale0 * y1 + scale1 * y2,
        scale0 * z1 + scale1 * z2,
        scale0 * w1 + scale1 * w2
    );
    return result;
}

const replaceFileNameWithFolder = (url: any, newFolderName: any) => {
    // Obtener la parte de la URL sin el nombre del archivo
    let pathParts = url.split('/');
    pathParts.pop(); // Eliminar el nombre del archivo
    pathParts.push(newFolderName); // Agregar el nuevo nombre de la carpeta

    // Unir las partes de nuevo en una URL
    return pathParts.join('/');
}
export default class MeshInfo extends Component<any> {
    state: any = {
        ready: false,
        key: null,
    }
    loading = false;
    _props?: MeshObject;
    Ammo?: any;
    meshWithBodys?: any[];
    position = { x: 0, y: 0, z: 0 }
    rotation = { x: 0, y: 0, z: 0 }
    scale = { x: 0, y: 0, z: 0 }
    setMesh(props: MeshObject, Ammo: any) {
        this.Ammo = Ammo;
        this._props = props;
        const mesh = this._props.mesh.group;
        const key = this._props.mesh.props.data.key;
        if (!mesh) return;
        this.meshWithBodys = [];

        this.position.x = mesh.position.x;
        this.position.y = mesh.position.y;
        this.position.z = mesh.position.z;

        this.rotation.x = mesh.rotation.x;
        this.rotation.y = mesh.rotation.y;
        this.rotation.z = mesh.rotation.z;

        this.scale.x = mesh.scale.x;
        this.scale.y = mesh.scale.y;
        this.scale.z = mesh.scale.z;
        // }



        this.setState({ key: null })
        new SThread(300, "sad", true).start(() => {
            this.state.textures = null;
            this.setState({ key: key, })
            if (this._props) {
                // "https://drive.servisofts.com/http/models/buildings/pared/pared.glb"
                let url = this._props?.mesh?.props?.data?.url;
                console.log(url)

                if (!url) return;
                // @ts-ignore
                url = url.replace(SSocket.api.drive, "");
                url = replaceFileNameWithFolder(url, "texture")
                SSocket.sendPromise({
                    "service": "drive",
                    "component": "file",
                    "type": "ls",
                    "path": url,
                }).then((e: any) => {
                    this.setState({ texturePath: url, textures: e.data })
                    console.log("textures", e)
                }).catch(e => {
                    console.error("textures", e)
                })
            }
        })
    }


    moveAxis(props: { axis: "x" | "y" | "z", value: number },) {
        if (!this?._props?.mesh) return;
        this.position.x = props.axis == "x" ? props.value : this.position.x;
        this.position.y = props.axis == "y" ? props.value : this.position.y;
        this.position.z = props.axis == "z" ? props.value : this.position.z;
        this._props.mesh.moveObject(this.position)
    }
    rotateAxis(props: { axis: "x" | "y" | "z", value: number },) {
        if (!this?._props?.mesh) return;
        this.rotation.x = props.axis == "x" ? props.value : this.rotation.x;
        this.rotation.y = props.axis == "y" ? props.value : this.rotation.y;
        this.rotation.z = props.axis == "z" ? props.value : this.rotation.z;
        // this.rotateObject({ x: Math.PI / this.rotation.x, y: Math.PI /  this.rotation.y, z: Math.PI / this.rotation.z });
        this._props.mesh.rotateObject(this.rotation)
    }
    scaleAxis(props: { axis: "x" | "y" | "z", value: number },) {
        if (!this?._props?.mesh) return;
        this.scale.x = props.axis == "x" ? props.value : this.scale.x;
        this.scale.y = props.axis == "y" ? props.value : this.scale.y;
        this.scale.z = props.axis == "z" ? props.value : this.scale.z;
        // this.rotateObject({ x: Math.PI / this.rotation.x, y: Math.PI /  this.rotation.y, z: Math.PI / this.rotation.z });
        this._props.mesh.scaleObject(this.scale)
    }
    renderTextures() {
        if (!this.state.textures) return null;
        return (this.state.textures ?? []).filter((a: any) => !(a.name + "").startsWith("\.")).map((a: any) => {
            const api: any = SSocket.api
            return <SView width={30} height={30} onPress={() => {
                this._props?.mesh.changeTexture(api.drive + "" + this.state.texturePath + "/" + a.name)
            }}>
                <SImage src={api.drive + "" + this.state.texturePath + "/" + a.name} />
            </SView>
        })
    }
    renderImputSlider(props: { onChange: (a: number) => void, defaultValue: number, label?: string }) {
        return <SView col={"xs-12"} row center>
            <SText width={20}>{props.label}</SText>
            <SView width={50}>
                <SInput height={20} defaultValue={props.defaultValue ?? "0"} onChangeText={e => {
                    // if (!e) return;
                    props.onChange(parseFloat((e ?? 0) + ""));
                }} />
            </SView>
            <SView width={110} backgroundColor=''>
                <Slider width={110} step={0.1} maxValue={props.defaultValue + 10} minValue={props.defaultValue - 10} initialValue={props.defaultValue ?? 0} onIndexChange={e => {
                    props.onChange(e);
                }} />
            </SView>
        </SView>
    }
    render() {
        if (!this.state.key) return null;
        if (!this?._props?.mesh) return null;
        console.log(this._props)
        const maxvar = 5;
        return <SView withoutFeedback style={{
            position: "absolute",
            width: 200,
            height: 400,
            backgroundColor: "#00000088",
            alignItems: "center"
        }} >
            <ScrollView>

                <SText col={"xs-12"} style={{ textAlign: "right" }} onPress={() => {
                    this.setState({ key: "" })
                }}>{` X `}</SText>
                <SText>{`${this?._props?.mesh?.group?.name}`}</SText>
                {/* <SText>{`${this?._props?.mesh?.group?.userData?.key}`}</SText> */}
                {/* <SText>{`${this.mesh?.key}`}</SText> */}

                <SHr h={16} />
                <SText onPress={() => {
                    if (!this._props?.mesh?.props?.data) return;
                    SSocket.sendPromise({
                        component: "scene_mesh",
                        type: "editar",
                        key_usuario: Model.usuario.Action.getKey(),
                        key_scene: this?._props?.data.key_scene,
                        data: {
                            ...this._props?.mesh?.props?.data,
                            estado: 0,
                        }
                    }).then(e => {
                        this.setState({ key: null })
                    })
                }} color={STheme.color.danger}>{`Eliminar`}</SText>
                <SHr h={16} />
                <SText onPress={() => {
                    if (!this._props?.mesh?.props?.data) return;
                    if (this.loading) return;
                    this.loading = true;
                    SSocket.sendPromise({
                        component: "scene_mesh",
                        type: "registro",
                        key_usuario: Model.usuario.Action.getKey(),
                        key_scene: this?._props?.data.key_scene,
                        data: {
                            ...this._props?.mesh?.props?.data,
                            estado: 1,
                            key: SUuid()
                        }
                    }).then(e => {
                        this.loading = false;
                        SNotification.send({
                            body: "Clonado",
                            title: "Objeto clonado con exito",
                            color: STheme.color.success,
                            time: 5000,
                        })
                        // this.setState({ key: null })
                    }).catch(e => {
                        this.loading = false;
                    })
                }} color={STheme.color.danger}>{`Clonar`}</SText>
                <SHr />
                <SText col={"xs-12"}>{"Position"}</SText>

                {this.renderImputSlider({
                    label: "x",
                    defaultValue: this.position?.x,
                    onChange: e => this.moveAxis({ axis: "x", value: e })
                })}
                {this.renderImputSlider({
                    label: "y",
                    defaultValue: this.position?.y,
                    onChange: e => this.moveAxis({ axis: "y", value: e })
                })}
                {this.renderImputSlider({
                    label: "z",
                    defaultValue: this.position?.z,
                    onChange: e => this.moveAxis({ axis: "z", value: e })
                })}
                {/* <Slider width={100} step={0.1} maxValue={this.position?.x + maxvar} minValue={this.position?.x - maxvar} initialValue={this.position?.x ?? 0} onIndexChange={e => {
                this.moveAxis({ axis: "x", value: e })
            }} />

            <Slider width={180} step={0.1} maxValue={maxvar} minValue={0} initialValue={this.position?.y ?? 0} onIndexChange={e => {
                this.moveAxis({ axis: "y", value: e })
            }} />

            <Slider width={180} step={0.1} maxValue={this.position?.z + maxvar} minValue={this.position?.z - maxvar} initialValue={this.position?.z ?? 0} onIndexChange={e => {
                this.moveAxis({ axis: "z", value: e })
            }} /> */}
                <SHr />
                <SText col={"xs-12"}>{"Rotation"}</SText>

                {this.renderImputSlider({
                    label: "x",
                    defaultValue: this.rotation?.x,
                    onChange: e => this.rotateAxis({ axis: "x", value: e })
                })}
                {this.renderImputSlider({
                    label: "y",
                    defaultValue: this.rotation?.y,
                    onChange: e => this.rotateAxis({ axis: "y", value: e })
                })}
                {this.renderImputSlider({
                    label: "z",
                    defaultValue: this.rotation?.z,
                    onChange: e => this.rotateAxis({ axis: "z", value: e })
                })}
                {/* <Slider width={180} step={0.0001} maxValue={Math.PI / 2} minValue={-(Math.PI / 2)} initialValue={this.rotation?.x ?? 0} onIndexChange={e => {
                this.rotateAxis({ axis: "x", value: e })
            }} />

            <Slider width={180} step={0.0001} maxValue={Math.PI / 2} minValue={-(Math.PI / 2)} initialValue={this.rotation?.y ?? 0} onIndexChange={e => {
                this.rotateAxis({ axis: "y", value: e })
            }} />

            <Slider width={180} step={0.0001} maxValue={Math.PI / 2} minValue={-(Math.PI / 2)} initialValue={this.rotation?.z ?? 0} onIndexChange={e => {
                this.rotateAxis({ axis: "z", value: e })
            }} /> */}
                <SHr />
                <SText col={"xs-12"}>{"Scale"}</SText>
                {/* <Slider width={180} step={0.01} maxValue={10} minValue={0.1} initialValue={this.scale?.x ?? 0} onIndexChange={e => {
                this.scaleAxis({ axis: "x", value: e })
            }} />

            <Slider width={180} step={0.01} maxValue={10} minValue={0.1} initialValue={this.scale?.y ?? 0} onIndexChange={e => {
                this.scaleAxis({ axis: "y", value: e })
            }} />

            <Slider width={180} step={0.01} maxValue={10} minValue={0.1} initialValue={this.scale?.z ?? 0} onIndexChange={e => {
                this.scaleAxis({ axis: "z", value: e })
            }} /> */}
                {this.renderImputSlider({
                    label: "x",
                    defaultValue: this.scale?.x,
                    onChange: e => this.scaleAxis({ axis: "x", value: e })
                })}
                {this.renderImputSlider({
                    label: "y",
                    defaultValue: this.scale?.y,
                    onChange: e => this.scaleAxis({ axis: "y", value: e })
                })}
                {this.renderImputSlider({
                    label: "z",
                    defaultValue: this.scale?.z,
                    onChange: e => this.scaleAxis({ axis: "z", value: e })
                })}

                <SView row>
                    {this.renderTextures()}
                </SView>
                <SInput label={"texture"} defaultValue={this._props?.mesh?.props?.data?.data?.texture} onChangeText={e => {
                    new SThread(1000, "recargar", true).start(() => {
                        this._props?.mesh.changeTexture(e)
                    })
                }} />
                <SInput label={"text"} defaultValue={this._props?.mesh?.props?.data?.data?.text} onChangeText={e => {
                    new SThread(1000, "recargar", true).start(() => {
                        this._props?.mesh.changeText(e, true)
                    })
                }} />
                <SInput label={"deeplink"} defaultValue={this._props?.mesh?.props?.data?.deeplink} onChangeText={e => {
                    new SThread(1000, "recargar", true).start(() => {
                        SSocket.sendPromise({
                            component: "scene_mesh",
                            type: "editar",
                            key_usuario: Model.usuario.Action.getKey(),
                            key_scene: this?._props?.data.key_scene,
                            data: {
                                ...this._props?.mesh?.props?.data,
                                deeplink: e,
                            }
                        }).then(e => {
                            // this.setState({ key: null })
                        })
                    })
                }} />
                <SView flex />

            </ScrollView>

        </SView>
    }
}
