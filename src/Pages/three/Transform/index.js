import React, { Component, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SInput, SText, STheme, SView } from "servisofts-component";
import SSocket from 'servisofts-socket';
import Model from '../../../Model';

export default class Transform extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }


    setModel(transform) {   
        console.log(transform);
        
        this.setState({...transform})
    }

    updateMesh=async(object)=>{
        console.log(object)
        
        const resp = await SSocket.sendPromise({
            component: "mesh",
            type: "editar",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            data:{
                key:object.key,
                data:{
                    transform:{
                        position:object.position,
                        rotation:{
                            x:object.rotation._x,
                            y:object.rotation._y,
                            z:object.rotation._z
                        },
                        scale:object.scale
                    }
                }
            }
        });

    }

    onUpdate(trans, pos, value) {
        console.log(this.state);
        let x = this.state.parent[trans].x;
        let y = this.state.parent[trans].y;
        let z = this.state.parent[trans].z;
        switch (pos) {
            case "x": x = value;
            case "y": y = value;
            case "z": z = value;
        }
        
        this.state.parent[trans].set(x, y, z);
        this.setState({ ...this.state })
    }

    render() {

        if (!this.state) return <SView />

        let object = this.state.parent;

        if (!object?.parent) return <SView />

        console.log(object?.parent)

        return <SView card withoutFeedback>
            <SText padding={4}>{object?.name}</SText>
            <SText padding={4}>{object?.parent?.key}</SText>
            <SView row>
                <SView flex backgroundColor={STheme.color.background} width={80}>
                    <SText padding={4}>Location</SText>
                    <SView row>
                        <SText pradding={1}>x</SText>
                        <SInput ref={ref => this.posx = ref} flex height={20} defaultValue={object?.parent?.position?.x} onChangeText={e => object.parent.position.x = e ?? 0} />
                    </SView>
                    <SView row>
                        <SText padding={1}>y</SText>
                        <SInput ref={ref => this.posy = ref} flex height={20} defaultValue={object?.parent?.position?.y} onChangeText={e => object.parent.position.y = e ?? 0} />
                    </SView>
                    <SView row>
                        <SText padding={1}>z</SText>
                        <SInput ref={ref => this.posz = ref} flex height={20} defaultValue={object?.parent?.position?.z} onChangeText={e => object.parent.position.z = e ?? 0} />
                    </SView>
                </SView>

                <SView flex backgroundColor={STheme.color.background} width={80}>
                    <SText padding={4}>Rotation</SText>
                    <SView row>
                        <SText padding={1}>x</SText>
                        <SInput ref={ref => this.rotx = ref} flex height={20} defaultValue={object?.parent?.rotation?.x} onChangeText={e => object.parent.rotation.x = e ?? 0} />
                    </SView>
                    <SView row>
                        <SText padding={1}>y</SText>
                        <SInput ref={ref => this.roty = ref} flex height={20} defaultValue={object?.parent?.rotation?.y} onChangeText={e => object.parent.rotation.y = e ?? 0} />
                    </SView>
                    <SView row>
                        <SText padding={1}>z</SText>
                        <SInput ref={ref => this.rotz = ref} flex height={20} defaultValue={object?.parent?.rotation?.z} onChangeText={e => object.parent.rotation.z = e ?? 0} />
                    </SView>
                </SView>

                <SView flex backgroundColor={STheme.color.background} width={80}>
                    <SText padding={4}>Scale</SText>
                    <SView row>
                        <SText padding={1}>x</SText>
                        <SInput ref={ref => this.sclx = ref} flex height={20} defaultValue={object?.parent?.scale?.x.toString()} onChangeText={e => object.parent.scale.x = e ?? 0} />
                    </SView>
                    <SView row>
                        <SText padding={1}>y</SText>
                        <SInput ref={ref => this.scly = ref} flex height={20} defaultValue={object?.parent?.scale?.y} onChangeText={e => object.parent.scale.y = e ?? 0} />
                    </SView>
                    <SView row>
                        <SText padding={1}>z</SText>
                        <SInput ref={ref => this.sclz = ref} flex height={20} defaultValue={object?.parent?.scale?.z} onChangeText={e => object.parent.scale.z = e ?? 0} />
                    </SView>
                </SView>
            </SView>
            <SView><SText onPress={(e) => {
                
                if (object?.parent) {
                    object.parent.position.set(this.posx.getValue(), this.posy.getValue(), this.posz.getValue())
                    object.parent.rotation.set(this.rotx.getValue(), this.roty.getValue(), this.rotz.getValue())
                    object.parent.scale.set(this.sclx.getValue(), this.scly.getValue(), this.sclz.getValue())
                    this.updateMesh(object.parent)
                }
                console.log(this.state)

            }}>Actualizar</SText></SView>
        </SView>
    }
}

const styles = StyleSheet.create({
    glView: {
        flex: 1,
        backgroundColor: "#aaaaff",
    },
});
