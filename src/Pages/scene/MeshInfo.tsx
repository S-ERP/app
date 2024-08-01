import React, { Component } from 'react';
import { SGradient, SHr, SIcon, SInput, SList, SLoad, SPage, SRangeSlider, SText, SThread, SView } from 'servisofts-component';
import * as THREE from "three"
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Slider } from "../../Components/RangeSlider"
import SSocket from 'servisofts-socket';

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
    data: Data;
    fecha_on: string;
    deeplink: string | null;
    key: string;
    url: string;
    observacion: string;
}

export type MeshObject = {
    key: string,
    mesh: THREE.Group,
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
export default class MeshInfo extends Component<any> {
    state = {
        ready: false,
        key: null
    }

    mesh?: MeshObject;
    Ammo?: any;
    meshWithBodys?: any[];
    position = { x: 0, y: 0, z: 0 }
    rotation = { x: 0, y: 0, z: 0 }
    setMesh(mesh: MeshObject, Ammo: any) {
        this.Ammo = Ammo;
        this.mesh = mesh;
        this.meshWithBodys = [];

        this.mesh.mesh.traverse(child => {
            // @ts-ignore
            if (child.userData.body) {
                this.position.x = child.position.x;
                this.position.y = child.position.y;
                this.position.z = child.position.z;
                this.rotation.x = child.rotation.x;
                this.rotation.y = child.rotation.y;
                this.rotation.z = child.rotation.z;
                this.meshWithBodys?.push(child);
            }
        })
        if (this.meshWithBodys.length <= 0) {
            this.position.x = mesh.mesh.position.x;
            this.position.y = mesh.mesh.position.y;
            this.position.z = mesh.mesh.position.z;
            this.rotation.x = mesh.mesh.rotation.x;
            this.rotation.y = mesh.mesh.rotation.y;
            this.rotation.z = mesh.mesh.rotation.z;
        }
        this.setState({ key: null })
        new SThread(300, "sad", true).start(() => {
            this.setState({ key: mesh.key })
        })
    }

    moveObject({ x = 0, y = 0, z = 0 }) {
        if (!this.mesh) return;
        if (this.meshWithBodys && this.meshWithBodys.length > 0) {
            //   this.mesh.mesh.userData.body
            this.meshWithBodys.forEach(meshWithBody => {

                const body = meshWithBody.userData.body;
                // body.activate();


                const transform = new this.Ammo.btTransform();
                const position = transform.getOrigin();

                body.getMotionState().getWorldTransform(transform);
                const taget = new this.Ammo.btVector3(x, y, z);


                const interpolatedX = lerp(position.x(), taget.x(), 0.4);
                const interpolatedY = lerp(position.y(), taget.y(), 0.4);
                const interpolatedZ = lerp(position.z(), taget.z(), 0.4);

                const newPosition = new this.Ammo.btVector3(interpolatedX, interpolatedY, interpolatedZ);
                transform.setOrigin(newPosition);

                body.setWorldTransform(transform);
                body.getMotionState().setWorldTransform(transform);
                meshWithBody.userData["timeMoved"] = new Date().getTime();
            })

        } else {
            this.mesh.mesh.position.set(x, y, z);
        }

    }
    rotateObject({ x = 0, y = 0, z = 0 }) {
        if (!this.mesh) return;
        if (this.meshWithBodys && this.meshWithBodys.length > 0) {
            const targetRotation = new this.Ammo.btQuaternion();
            targetRotation.setEulerZYX(z, y, x);
            this.meshWithBodys.forEach(meshWithBody => {
                const body = meshWithBody.userData.body;
                const transform = new this.Ammo.btTransform();
                body.getMotionState().getWorldTransform(transform);

                const rotation = new this.Ammo.btQuaternion();
                const interpolatedRotation = slerp(this.Ammo, rotation, targetRotation, 0.1);



                // rotation.setEulerZYX(z, y, x); // Note: Ammo.js uses ZYX order for Euler angles
                transform.setRotation(targetRotation);
                console.log(targetRotation.x(), targetRotation.y(), targetRotation.z());
                body.setWorldTransform(transform);
                body.getMotionState().setWorldTransform(transform);
                meshWithBody.userData["timeMoved"] = new Date().getTime();
            });
        } else {
            this.mesh.mesh.rotation.set(x, y, z);
        }
    }
    moveAxis(props: { axis: "x" | "y" | "z", value: number },) {
        if (!this.mesh) return;
        this.position.x = props.axis == "x" ? props.value : this.position.x;
        this.position.y = props.axis == "y" ? props.value : this.position.y;
        this.position.z = props.axis == "z" ? props.value : this.position.z;
        this.moveObject(this.position)
    }
    rotateAxis(props: { axis: "x" | "y" | "z", value: number },) {
        if (!this.mesh) return;
        this.rotation.x = props.axis == "x" ? props.value : this.rotation.x;
        this.rotation.y = props.axis == "y" ? props.value : this.rotation.y;
        this.rotation.z = props.axis == "z" ? props.value : this.rotation.z;
        // this.rotateObject({ x: Math.PI / this.rotation.x, y: Math.PI /  this.rotation.y, z: Math.PI / this.rotation.z });
        this.rotateObject(this.rotation)
    }
    render() {
        if (!this.state.key) return null;
        if (!this.mesh) return null;
        return <SView withoutFeedback style={{
            position: "absolute",
            width: 200,
            height: 300,
            backgroundColor: "#00000088",
        }} center>
            <SText>{`${this.mesh.mesh.name}`}</SText>
            <SText>{`${this.mesh.key}`}</SText>
            <SView col={"xs-12"} center style={{
            }}>
                <SText>{"Position"}</SText>
                <Slider width={180} step={0.1} maxValue={this.position?.x + 10} minValue={this.position?.x - 10} initialValue={this.position?.x ?? 0} onIndexChange={e => {
                    this.moveAxis({ axis: "x", value: e })
                }} />

                <Slider width={180} step={0.1} maxValue={10} minValue={0} initialValue={this.position?.y ?? 0} onIndexChange={e => {
                    this.moveAxis({ axis: "y", value: e })
                }} />

                <Slider width={180} step={0.1} maxValue={this.position?.z + 10} minValue={this.position?.z - 10} initialValue={this.position?.z ?? 0} onIndexChange={e => {
                    this.moveAxis({ axis: "z", value: e })
                }} />
                <SHr />
                <SText>{"Rotation"}</SText>
                <Slider width={180} step={0.0001} maxValue={Math.PI / 2} minValue={-(Math.PI / 2)} initialValue={this.rotation?.x ?? 0} onIndexChange={e => {
                    this.rotateAxis({ axis: "x", value: e })
                }} />

                <Slider width={180} step={0.0001} maxValue={Math.PI / 2} minValue={-(Math.PI / 2)} initialValue={this.rotation?.y ?? 0} onIndexChange={e => {
                    this.rotateAxis({ axis: "y", value: e })
                }} />

                <Slider width={180} step={0.0001} maxValue={Math.PI / 2} minValue={-(Math.PI / 2)} initialValue={this.rotation?.z ?? 0} onIndexChange={e => {
                    this.rotateAxis({ axis: "z", value: e })
                }} />
                <SText onPress={() => {
                    this.setState({ key: "" })
                }}>{`close`}</SText>
                <SText onPress={() => {
                    SSocket.sendPromise({
                        component: "scene_mesh",
                        type: "editar",
                        data: {
                            key: this.mesh?.key,
                            estado: 0,
                        }
                    })
                }}>{`Eliminar`}</SText>
            </SView>
        </SView>
    }
}
