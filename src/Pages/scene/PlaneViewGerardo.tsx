import * as React from 'react';

import * as THREE from 'three';
import { Text, View, StyleSheet, Dimensions } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SGradient, SImage, SText, SView } from 'servisofts-component';
import Preview from "../drive/root"
import { SlideValue } from '../t2';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PlaneViewProps {

}
const PlaneView = React.forwardRef((props: PlaneViewProps, ref) => {
    const perspective = useSharedValue(850);
    const translateX2 = useSharedValue(0);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const translateY2 = useSharedValue(0);
    const scale = useSharedValue(1);
    const width = useSharedValue(100);
    const height = useSharedValue(100);
    const rotateZ = useSharedValue(0);
    const rotateX = useSharedValue(0);
    const rotateY = useSharedValue(0);
    const scaleX = useSharedValue(1);
    const scaleY = useSharedValue(1);
    const skewX = useSharedValue(0);
    const skewY = useSharedValue(0);
    const opacity = useSharedValue(1);


    const camaraRotateY = useSharedValue(0);
    const camaraRotateX = useSharedValue(0);

    //const v1 = useSharedValue('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)');
    const v1 = useSharedValue([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: width.value,
            height: height.value,
            opacity: opacity.value,
            transform: [
                { perspective: perspective.value },
                { translateX: translateX.value + translateX2.value },
                { translateY: translateY.value + translateY2.value },
                { rotateX: `${rotateX.value}rad` },
                { rotateY: `${rotateY.value}rad` },
                { rotateZ: `${rotateZ.value}rad` },
                { skewX: `${skewX.value}rad` },
                { skewY: `${skewY.value}rad` },
                { scaleX: scaleX.value },
                { scaleY: scaleY.value },
                // { matrix: v1.value },
               
            ],
        };
    });

    const toScreenPosition = (position: any, camera: any) => {
        const vector = position.clone();
        vector.project(camera);
        const widthHalf = screenWidth / 2;
        const heightHalf = screenHeight / 2;
        return {
            x: (vector.x * widthHalf) + widthHalf,
            y: -(vector.y * heightHalf) + heightHalf
        };
    }
    const update = (p: { delta: number, scene: THREE.Scene, camera: THREE.PerspectiveCamera, plane: THREE.Mesh, gl: any, renderer: any }) => {
        const planeGeometry = p.plane.geometry;
        planeGeometry.computeBoundingBox(); // Asegurarse de que el bounding box está actualizado
        const boundingBox = planeGeometry.boundingBox;
        if (!boundingBox) return;
        // Proyectar las esquinas del plano
        const corners = [
            new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, 0),
            new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, 0),
            new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, 0),
            new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, 0)
        ];

        // Transformar las esquinas a su posición en el mundo
        const worldCorners = corners.map(corner => corner.applyMatrix4(p.plane.matrixWorld));

        // Proyectar las esquinas en la pantalla
        const screenCorners = worldCorners.map(corner => toScreenPosition(corner, p.camera));

        // Calcular el tamaño en píxeles
        const widthInPixelsTop = Math.abs(screenCorners[1].x - screenCorners[0].x);
        const widthInPixelsBotoom = Math.abs(screenCorners[2].x - screenCorners[3].x);
        const heightInPixelsLeft = Math.abs(screenCorners[3].y - screenCorners[0].y);
        const heightInPixelsRight = Math.abs(screenCorners[2].y - screenCorners[1].y);

        // if (widthInPixelsTop > widthInPixelsBotoom) {
        //     width.value = widthInPixelsBotoom
        //     translateX.value = screenCorners[0].x
        // } else {
        //     width.value = widthInPixelsTop
        //     translateX.value = screenCorners[3].x
        // }
        width.value = (widthInPixelsTop + widthInPixelsBotoom) / 2
        height.value = (heightInPixelsLeft + heightInPixelsRight) / 2
        translateX.value = screenCorners[3].x
        translateY.value = screenCorners[3].y

        camaraRotateY.value = p.camera.rotation.y;
        camaraRotateX.value = p.camera.rotation.x;

        // Actualizar la matriz de transformación
        p.plane.updateMatrix();

        // Obtener la matriz de transformación

        const transformMatrix = p.plane.matrix;
        const elements = transformMatrix.elements;
        v1.value = transformMatrix.elements;
        // const cssMatrix = `matrix3d(${elements.join(',')})`;
        //console.log(cssMatrix);
        //v1.value = cssMatrix;
        //rotateY.value = THREE.MathUtils.radToDeg(p.plane.rotation.y) + 1;
        // perspective.value = p.camera.position.z * Math.tan(THREE.MathUtils.degToRad(p.camera.fov / 2));
        perspective.value = 400;
        rotateY.value = p.camera.rotation.x * -1;
        // rotateY.value = (p.camera.rotation.y * -1) * (180 / Math.PI);
        // console.log("trhee: ", p.camera.position,  p.camera.rotation , p.camera.fov);
        // console.log("css: ", rotateY.value, perspective.value);
        

    }
    

    React.useImperativeHandle(ref, () => ({
        update: update
    }));

    const unGradoEnRadian = 0.0174533;
    const grados = 10;
    return <>
        <Animated.View style={[styles.container, animatedStyle]}>
            <SGradient colors={["#FFffFF66", "#00ff0066"]} />
            <Animated.View >
                <SlideValue label={"CRX"} animatedValue={camaraRotateX} minValue={-1000} maxValue={1000} />
                {/* <SImage src={"https://drive.servisofts.com/http/texture/ricky.jpeg"} style={{opacity:0.5}}/> */}
                {/* <SlideValue label={"scale"} animatedValue={scale} minValue={0} maxValue={3} />
                <SlideValue label={"scaleX"} animatedValue={scaleX} minValue={0} maxValue={3} />
                <SlideValue label={"scaleY"} animatedValue={scaleY} minValue={0} maxValue={3} />
                <SlideValue label={"translateX"} animatedValue={translateX2} />
                <SlideValue label={"translateY"} animatedValue={translateY2} /> */}
                {/* <SlideValue label={"translateZ"} animatedValue={translateZ} /> */}
                {/* <SlideValue label={"rotateX"} animatedValue={rotateX} minValue={unGradoEnRadian * -grados} maxValue={unGradoEnRadian * grados} />
                <SlideValue label={"rotateY"} animatedValue={rotateY} minValue={unGradoEnRadian * -grados} maxValue={unGradoEnRadian * grados} />
                <SlideValue label={"rotateZ"} animatedValue={rotateZ} minValue={unGradoEnRadian * -grados} maxValue={unGradoEnRadian * grados} />
                <SlideValue label={"skewX"} animatedValue={skewX} minValue={unGradoEnRadian * -grados} maxValue={unGradoEnRadian * grados} />
                <SlideValue label={"skewY"} animatedValue={skewY} minValue={unGradoEnRadian * -grados} maxValue={unGradoEnRadian * grados} />
                <SlideValue label={"perspective"} animatedValue={perspective} minValue={1} maxValue={1000} /> */}
            </Animated.View>
        </Animated.View>
        
    </>
})

export default PlaneView;

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        borderWidth: 1,
        // backgroundColor: "#00FF0088"
    }
});
