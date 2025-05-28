import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { SHr, SInput, SText, STheme, SThread, SView } from 'servisofts-component';
import * as THREE from "three"
import Input from './Input';

interface EditObjectLightProps {
    obj: THREE.Light,
    onChange: (changes: any) => void
}

const EditObjectLight = (props: EditObjectLightProps) => {
    return (
        <View style={styles.container}>
            <SText fontSize={12}>Light</SText>
            <SHr />
            <Input type='number' label='Intensity' defaultValue={props.obj.intensity} onChange={e => {
                props.onChange({ intensity: e })
            }} />
            <Input type='color' label='Color' defaultValue={"#"+props.obj.color.getHexString()} onChange={e => {
                console.log(props.obj.color)
                console.log(props.obj.color.getHexString())
                props.onChange({ color: e })
            }} />
            <SHr h={8} />
            <Input type='boolean' label='Cast Shadow' defaultValue={props.obj.castShadow} onChange={e => {
                props.onChange({ castShadow: e })
            }} />
            <SHr h={8} />
            <Input type='number' label='Shadow bias' defaultValue={props.obj.shadow?.bias ?? ""} onChange={e => {
                props.onChange({ shadow: { bias: e } })
            }} />
            <SHr h={4} />
            <Input type='number' label='Map Size' defaultValue={props.obj.shadow?.mapSize?.width ?? ""} onChange={e => {
                props.onChange({ shadow: { mapSize: { width: e, height: e } } })
                if (props.obj.shadow) {
                    props.obj.shadow.dispose();
                    props.obj.shadow.needsUpdate = true
                }
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

export default EditObjectLight;

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#313031",
        padding: 4,
        borderRadius: 4,
    }
});
