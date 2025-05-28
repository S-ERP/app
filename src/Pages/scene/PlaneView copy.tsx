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
function threeUnitsToPixels(camera: THREE.PerspectiveCamera, unitSize = 1) {
    // Define dos puntos separados por 'unitSize' en el eje X (o Y, dependiendo de la dirección que desees medir)
    const point1 = new THREE.Vector3(0, 0, 0);  // Punto de referencia
    const point2 = new THREE.Vector3(unitSize, 0, 0);  // Punto desplazado una unidad en el eje X

    // Proyecta ambos puntos a la pantalla usando la cámara
    const projectedPoint1 = point1.clone().project(camera);
    const projectedPoint2 = point2.clone().project(camera);

    // Convertir las coordenadas normalizadas (-1 a 1) a píxeles en la pantalla
    const pixelX1 = (projectedPoint1.x * 0.5 + 0.5) * screenWidth;
    const pixelY1 = (projectedPoint1.y * -0.5 + 0.5) * screenHeight;

    const pixelX2 = (projectedPoint2.x * 0.5 + 0.5) * screenWidth;
    const pixelY2 = (projectedPoint2.y * -0.5 + 0.5) * screenHeight;

    // Calcular la distancia en píxeles entre los dos puntos proyectados
    const distanceInPixels = Math.hypot(pixelX2 - pixelX1, pixelY2 - pixelY1);

    return distanceInPixels;  // Esta es la cantidad de píxeles que representa 'unitSize' unidades en Three.js
}
const isPlaneInView = (camera: THREE.PerspectiveCamera, plane: THREE.Mesh) => {
    // Obtener la posición del plano en el mundo
    const planePosition = new THREE.Vector3();
    plane.getWorldPosition(planePosition);

    // Obtener el frustum de la cámara
    const frustum = new THREE.Frustum();
    const cameraViewProjectionMatrix = new THREE.Matrix4();

    // Asegúrate de que la matriz de la cámara está actualizada
    camera.updateMatrixWorld();

    // Invertir la matriz del mundo de la cámara
    const matrixWorldInverse = camera.matrixWorld.clone().invert();

    // Multiplicar la matriz de proyección de la cámara por la matriz del mundo invertida
    cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, matrixWorldInverse);

    // Establecer el frustum desde la matriz de proyección
    frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

    const planeGeometry = plane.geometry;
    planeGeometry.computeBoundingBox();
    const boundingBox: any = planeGeometry.boundingBox;

    const corners = [
        new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z),
        new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.min.z),
        new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.min.z),
        new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.min.z),
        new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.max.z),
        new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.max.z),
        new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z),
        new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.max.z)
    ];

    // Transformar las esquinas a la posición en el mundo
    const worldCorners = corners.map(corner => corner.applyMatrix4(plane.matrixWorld));

    // Verificar si alguna esquina está en el frustum
    const isAnyCornerInView = worldCorners.some(corner => frustum.containsPoint(corner));

    return isAnyCornerInView;
    // Verificar si el centro del plano está en el frustum de la cámara
};
const isPlaneFacingCamera = (camera: THREE.PerspectiveCamera, plane: THREE.Mesh) => {
    // Obtener la normal del plano en el mundo
    const planeNormal = new THREE.Vector3();
    plane.getWorldDirection(planeNormal); // Esto da la dirección en la que el plano está "mirando"

    // Obtener la dirección desde la cámara hacia el plano
    const cameraToPlane = new THREE.Vector3();
    cameraToPlane.subVectors(plane.position, camera.position).normalize();

    // Calcular el ángulo entre la normal del plano y la dirección de la cámara
    const angle = planeNormal.dot(cameraToPlane);

    // Si el ángulo es negativo, el plano está orientado hacia la cámara
    return angle < 0;
};
const isCameraFocusingOnPlane = (camera: THREE.PerspectiveCamera, plane: THREE.Mesh) => {
    const inView = isPlaneInView(camera, plane);
    const facingCamera = isPlaneFacingCamera(camera, plane);

    return inView && facingCamera;
};
const calculateSkewX = (topLeft: any, topRight: any, bottomLeft: any, bottomRight: any) => {
    // Calcular el ángulo entre la línea superior y la línea inferior
    const topEdgeAngle = Math.atan2(topRight.y - topLeft.y, topRight.x - topLeft.x);
    const bottomEdgeAngle = Math.atan2(bottomRight.y - bottomLeft.y, bottomRight.x - bottomLeft.x);
    return bottomEdgeAngle - topEdgeAngle;
};

const calculateSkewY = (topLeft: any, topRight: any, bottomLeft: any, bottomRight: any) => {
    // Calcular el ángulo entre la línea izquierda y la línea derecha
    const leftEdgeAngle = Math.atan2(bottomLeft.y - topLeft.y, bottomLeft.x - topLeft.x);
    const rightEdgeAngle = Math.atan2(bottomRight.y - topRight.y, bottomRight.x - topRight.x);
    return rightEdgeAngle - leftEdgeAngle;
};

const PlaneView = React.forwardRef((props: PlaneViewProps, ref) => {
    const scaleX2 = useSharedValue(1);
    const scaleY2 = useSharedValue(1);
    const perspective = useSharedValue(850);
    const translateX2 = useSharedValue(0);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const translateY2 = useSharedValue(0);

    const width = useSharedValue(512);
    const height = useSharedValue(512);
    const rotateZ = useSharedValue(0);
    const rotateX = useSharedValue(0);
    const rotateY = useSharedValue(0);
    const scaleX = useSharedValue(1);
    const scaleY = useSharedValue(1);
    const skewX = useSharedValue(0);
    const skewY = useSharedValue(0);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: width.value,
            height: height.value,
            opacity: opacity.value,
            transform: [
                { perspective: perspective.value },
                { translateX: translateX.value + translateX2.value },
                { translateY: translateY.value + translateY2.value },
                { scaleX: scaleX.value * scaleX2.value },
                { scaleY: scaleY.value * scaleY2.value },
                { rotateX: `${rotateX.value}rad` },
                { rotateY: `${rotateY.value}rad` },
                { rotateZ: `${rotateZ.value}rad` },

                { skewX: `${skewX.value}rad` },
                { skewY: `${skewY.value}rad` },



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
        const cameraFocusingOnPlane = isCameraFocusingOnPlane(p.camera, p.plane);

        if (!cameraFocusingOnPlane) {
            scaleX.value = 0;
            scaleY.value = 0;
            return;
        }

        // p.plane.rotation.x += 0.005
        // p.plane.rotation.y += 0.005
        // p.plane.rotation.z += 0.005

        const planeGeometry = p.plane.geometry;
        planeGeometry.computeBoundingBox(); // Asegurarse de que el bounding box está actualizado
        const boundingBox = planeGeometry.boundingBox;
        if (!boundingBox) return;
        // Proyectar las esquinas del plano

        const planeWidth = boundingBox.max.x - boundingBox.min.x;
        const planeHeight = boundingBox.max.y - boundingBox.min.y;


        const corners = [
            new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, 0).applyMatrix4(p.plane.matrixWorld),
            new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, 0).applyMatrix4(p.plane.matrixWorld),
            new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, 0).applyMatrix4(p.plane.matrixWorld),
            new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, 0).applyMatrix4(p.plane.matrixWorld)
        ];

        // Transformar las esquinas a su posición en el mundo
        // const worldCorners = corners.map(corner => corner.applyMatrix4(p.plane.matrixWorld));
        // Proyectar las esquinas en la pantalla
        const screenCorners = corners.map(corner => toScreenPosition(corner, p.camera));
        const [topLeft, topRight, bottomLeft, bottomRight] = screenCorners;

        const planeWidthInPixels = Math.hypot(topRight.x - topLeft.x, topRight.y - topLeft.y);
        const planeHeightInPixels = Math.hypot(bottomLeft.x - topLeft.x, bottomLeft.y - topLeft.y);

        const planeCenter = {
            x: (topLeft.x + topRight.x + bottomLeft.x + bottomRight.x) / 4,
            y: (topLeft.y + topRight.y + bottomLeft.y + bottomRight.y) / 4
        }

        const planePosition = new THREE.Vector3();
        p.plane.getWorldPosition(planePosition);

        const cameraPosition = new THREE.Vector3();
        p.camera.getWorldPosition(cameraPosition);

        // Calcular la distancia entre la cámara y el plano
        const distance = planePosition.distanceTo(cameraPosition);
        const baseDistance = 1; // Distancia de referencia para mantener la escala
        const scaleFactor = baseDistance / distance;

        const planeWidth = boundingBox.max.x - boundingBox.min.x;
        const planeHeight = boundingBox.max.y - boundingBox.min.y;

        const pixelThree = threeUnitsToPixels(p.camera)
        scaleX.value = (pixelThree * planeWidth / width.value)
        scaleY.value = (pixelThree * planeHeight / height.value)
        // scaleY.value = (planeHeight / height.value)
        // scaleX.value = ((planeWidthInPixels) / width.value);
        // scaleY.value = ((planeHeightInPixels) / height.value);
        // Calcular la traslación
        translateX.value = planeCenter.x - (width.value / 2)
        translateY.value = planeCenter.y - (height.value / 2)


        const planeQuaternion = new THREE.Quaternion();
        p.plane.getWorldQuaternion(planeQuaternion);

        const cameraQuaternion = new THREE.Quaternion();
        p.camera.getWorldQuaternion(cameraQuaternion);

        // Invertir la rotación de la cámara para obtener la rotación relativa
        const inverseCameraQuaternion = cameraQuaternion.clone().invert();

        // Multiplicar la rotación del plano por la inversa de la rotación de la cámara
        planeQuaternion.premultiply(inverseCameraQuaternion);

        // perspective.value = Math.max(500, 1000 / distance);

        const euler = new THREE.Euler().setFromQuaternion(planeQuaternion, 'XYZ');
        rotateX.value = euler.x;
        rotateY.value = euler.y;
        rotateZ.value = euler.z;

        // const planePosition = new THREE.Vector3();
        // p.plane.getWorldPosition(planePosition);

        // const distance = p.plane.position.distanceTo(new THREE.Vector3(p.camera.position.x, p.camera.position.y, p.camera.position.z));

        // const cameraPosition = new THREE.Vector3();
        // p.camera.getWorldPosition(cameraPosition);
        // // Invertir la rotación de la cámara
        // const inverseCameraQuaternion = cameraQuaternion.clone().invert();

        // Combinar la rotación del plano con la inversa de la cámara

        // Convertir a ángulos de Euler


        // Ajusta este valor según cómo se maneje la perspectiva en tu escena

        // Calcular skewX y skewY usando el método revisado
        // skewX.value = -calculateSkewX(topLeft, topRight, bottomLeft, bottomRight);
        // skewY.value = -calculateSkewY(topLeft, topRight, bottomLeft, bottomRight);
        // Calcular skewX y skewY basados en la proyección
        // skewX.value = calculateSkewX(topLeft, topRight, bottomLeft, bottomRight);
        // skewY.value = calculateSkewY(topLeft, topRight, bottomLeft, bottomRight);



        // skewX.value =0
        // skewY.value = 0


    }
    React.useImperativeHandle(ref, () => ({
        update: update
    }));
    const unGradoEnRadian = 0.0174533;
    const grados = 180;
    return <>
        <Animated.View style={[styles.container, animatedStyle]}>
            <SGradient colors={["#FFffFF66", "#00ff0066"]} />
            <Animated.View >
                <SlideValue label={"scaleX"} animatedValue={scaleX2} minValue={0} maxValue={3} />
                <SlideValue label={"scaleY"} animatedValue={scaleY2} minValue={0} maxValue={3} />
                <SlideValue label={"translateX"} animatedValue={translateX2} />
                <SlideValue label={"translateY"} animatedValue={translateY2} />
                <SlideValue label={"rotateX"} animatedValue={rotateX} minValue={unGradoEnRadian * -grados} maxValue={unGradoEnRadian * grados} />
                <SlideValue label={"rotateY"} animatedValue={rotateY} minValue={unGradoEnRadian * -grados} maxValue={unGradoEnRadian * grados} />
                <SlideValue label={"rotateZ"} animatedValue={rotateZ} minValue={unGradoEnRadian * -grados} maxValue={unGradoEnRadian * grados} />
                <SlideValue label={"skewX"} animatedValue={skewX} minValue={unGradoEnRadian * -grados} maxValue={unGradoEnRadian * grados} />
                <SlideValue label={"skewY"} animatedValue={skewY} minValue={unGradoEnRadian * -grados} maxValue={unGradoEnRadian * grados} />
                <SlideValue label={"perspective"} animatedValue={perspective} minValue={1} maxValue={1000} />
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
