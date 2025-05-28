import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { SHr, SInput, SPopup, SText, STheme, SThread, SView } from 'servisofts-component';
import * as THREE from "three"
import Input from './Input';
import { opacity } from 'react-native-reanimated/lib/typescript/reanimated2/Colors';
import ShaderEditor from '../../../Components/SThree/ShaderEditor';

interface EditObjectMaterialProps {
    obj: THREE.Mesh,
    onChange: (changes: any) => void
}




const EditMaterial = (props: EditObjectMaterialProps & { material: THREE.Material }) => {
    // const material = props.material as THREE.MeshPhysicalMaterial;
    const material = props.material;
    // if(material.type == "")

    return <SText fontSize={12} padding={4} bold underLine onPress={() => {
        SPopup.open({
            key: "ShaderEditor",
            content: <SView col={"xs-12"} height withoutFeedback>
                <ShaderEditor material={material} />
            </SView>
        })
    }}>{material.name} - {material.type}</SText>
    return <SView style={{
        padding: 4,
        backgroundColor: "#66666666",
        borderRadius: 4,
    }}>
        <SText fontSize={12}>{material.name} - {material.type}</SText>
        <SHr />
        <Input type='color' label='color' defaultValue={"#" + material.color.getHexString()} onChange={e => {
            const hexPattern = /^#?([0-9A-F]{6})$/i;
            if (typeof e === 'string' && hexPattern.test(e)) {
                const hexValue = e.replace('#', ''); // Remover el '#' si está presente
                material.color.setHex(parseInt(hexValue, 16)); // Convertir a número hexadecimal y establecer el color
            } else if (typeof e === 'number') {
                material.color.setHex(e);

            } else {
                console.error("El valor no es un hexadecimal válido");
            }
            props.onChange({ color: e })
            // material.needsUpdate = true;
            // props.onChange({ color: e })
        }} />
        <SHr h={4} />
        <Input type='boolean' label='Wireframe' defaultValue={material.wireframe} onChange={e => {
            material.wireframe = e;
            props.onChange({ wireframe: e })
            // props.onChange({ color: e })
        }} />
        <SHr h={4} />
        <Input type='boolean' label='transparent' defaultValue={material.transparent} onChange={e => {
            material.transparent = e;
            props.onChange({ transparent: e })
            // props.onChange({ color: e })
        }} />
        <SHr h={4} />
        {/* <Input type='boolean' label='alphaHash' defaultValue={material.alphaHash} onChange={e => {
            material.alphaHash = e;
            props.onChange({ alphaHash: e })
            // material.needsUpdate = true;
            // props.onChange({ color: e })
        }} /> */}
        <SHr h={4} />
        <Input type='number' label='Opacity' defaultValue={material.opacity} onChange={e => {
            material.opacity = e;
            // material.needsUpdate = true;
            props.onChange({ opacity: e })
            // props.onChange({ color: e })
        }} />
        <Input type='number' label='IOR' defaultValue={material.ior} onChange={e => {
            material.ior = e;
            // material.needsUpdate = true;
            props.onChange({ ior: e })
        }} />
    </SView>
}
const EditObjectMaterial = (props: EditObjectMaterialProps) => {
    // props.obj.material
    let materials = Array.isArray(props.obj.material) ? props.obj.material : [props.obj.material];
    console.log(materials)
    return (
        <View style={styles.container}>
            <SText fontSize={12}>Material</SText>
            <SHr />
            {materials.map((material, index) => {
                return <EditMaterial obj={props.obj} material={material} onChange={(changes) => {
                    props.onChange({
                        material: {
                            [material.name]: changes
                        }
                    })
                }} />
            })}
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

export default EditObjectMaterial;

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#313031",
        padding: 4,
        borderRadius: 4,
    }
});
