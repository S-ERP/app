import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { SHr, SInput, SText, STheme, SThread, SView } from 'servisofts-component';
import * as THREE from "three"
import Input from './Input';

interface EditObjectTransformProps {
    obj: THREE.Object3D,
    onChange: (changes: any) => void
}

const EditObjectTransform = (props: EditObjectTransformProps) => {
    return (
        <View style={styles.container}>
            <SText fontSize={12}>Transform</SText>
            <SHr />
            <Input type='number' label='Location X' defaultValue={props.obj.position.x} onChange={e => {
                props.onChange({ position: { x: e, y: props.obj.position.y, z: props.obj.position.z } })
            }} />
            <Input type='number' label='Y' defaultValue={props.obj.position.y} onChange={e => {
                props.obj.position.y = e;
                props.onChange({ position: { x: props.obj.position.x, y: e, z: props.obj.position.z } })
            }} />
            <Input type='number' label='Z' defaultValue={props.obj.position.z} onChange={e => {
                props.obj.position.z = e;
                props.onChange({ position: { x: props.obj.position.x, y: props.obj.position.y, z: e } })
            }} />
            <SHr h={4} />
            <Input type='number' label='Rotation X' defaultValue={props.obj.rotation.x} onChange={e => {
                props.obj.rotation.x = e;
            }} />
            <Input type='number' label='Y' defaultValue={props.obj.rotation.y} onChange={e => {
                props.obj.rotation.y = e;
            }} />
            <Input type='number' label='Z' defaultValue={props.obj.rotation.z} onChange={e => {
                props.obj.rotation.z = e;
            }} />
            <SHr h={4} />
            <Input type='number' label='Scale X' defaultValue={props.obj.scale.x} onChange={e => {
                props.obj.scale.x = e;
            }} />
            <Input type='number' label='Y' defaultValue={props.obj.scale.y} onChange={e => {
                props.obj.scale.y = e;
            }} />
            <Input type='number' label='Z' defaultValue={props.obj.scale.z} onChange={e => {
                props.obj.scale.z = e;
            }} />
        </View>
    );
};

export default EditObjectTransform;

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#313031",
        padding: 4,
        borderRadius: 4,
    }
});
