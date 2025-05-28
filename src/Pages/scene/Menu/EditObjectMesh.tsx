import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { SHr, SInput, SText, STheme, SThread, SView } from 'servisofts-component';
import * as THREE from "three"
import Input from './Input';

interface EditObjectMeshProps {
    obj: THREE.Mesh,
    onChange: (changes: any) => void
}

const EditObjectMesh = (props: EditObjectMeshProps) => {
    return (
        <View style={styles.container}>
            <SText fontSize={12}>Mesh</SText>
            <SHr />
            <Input type='boolean' label='receiveShadow' defaultValue={props.obj.receiveShadow} onChange={e => {
                props.onChange({ receiveShadow: e })
            }} />
            <Input type='boolean' label='castShadow' defaultValue={props.obj.castShadow} onChange={e => {
                props.onChange({ castShadow: e })
            }} />
            {/* <SHr h={4} />
            <Input type='number' label='Map Height' defaultValue={props.obj.shadow?.mapSize?.height ?? ""} onChange={e => {
                props.onChange({ shadow: { mapSize: { height: e } } })
            }} /> */}
            {/* <SHr h={4} />
            <Input type='number' label='Z' defaultValue={props.obj.position.z} onChange={e => {
                props.obj.position.z = e;
                props.onChange({ position: { x: props.obj.position.x, y: props.obj.position.y, z: e } })
            }} /> */}

        </View>
    );
};

export default EditObjectMesh;

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#313031",
        padding: 4,
        borderRadius: 4,
    }
});
