import React from 'react';
import { StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Renderer, CustomOrbitControls } from '../../Components/SThree';
import { SPage } from 'servisofts-component';

export default function App() {
    let controls;
    const onContextCreate = async (gl) => {
        const renderer = Renderer(gl, gl.drawingBufferWidth, gl.drawingBufferHeight);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
        camera.position.z = 1;

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const materials = [
            new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Frente - Rojo
            new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Atrás - Verde
            new THREE.MeshBasicMaterial({ color: 0x0000ff }), // Arriba - Azul
            new THREE.MeshBasicMaterial({ color: 0xffff00 }), // Abajo - Amarillo
            new THREE.MeshBasicMaterial({ color: 0x00ffff }), // Izquierda - Cian
            new THREE.MeshBasicMaterial({ color: 0xff00ff }), // Derecha - Magenta
        ];

        const cube = new THREE.Mesh(geometry, materials);

        scene.add(cube);

        controls = new CustomOrbitControls(camera, renderer.domElement);

        const animate = () => {
            requestAnimationFrame(animate);

            controls.update(); // Llamar al método update para actualizar la cámara
            renderer.render(scene, camera);
            gl.endFrameEXP();
        };
        animate();
    };

    const onGestureEvent = (event) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            const { translationX, translationY } = event.nativeEvent;
            if (controls) controls.handleGesture(translationX, translationY);

        }
    };

    return (
        <SPage disableScroll>
            <PanGestureHandler onGestureEvent={onGestureEvent}>
                <GLView
                    style={styles.glView}
                    onContextCreate={onContextCreate}
                />
            </PanGestureHandler>
        </SPage>
    );
}

const styles = StyleSheet.create({
    glView: {
        flex: 1,
    },
});
