import React, { useEffect, useRef, useCallback } from 'react';
import { Dimensions, StyleSheet, Platform } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function App() {
    let camera, scene, renderer, cube, raycaster, mouse;
    const cubeRef = useRef();

    const onContextCreate = async (gl) => {
        renderer = new THREE.WebGLRenderer({ gl });
        renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
        renderer.setClearAlpha(0);

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
        camera.position.z = 5;

        const light = new THREE.AmbientLight(0x404040);
        scene.add(light);

        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        cubeRef.current = cube;

        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
            gl.endFrameEXP();
        };
        animate();
    };

    const onGestureEvent = (event) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            const { translationX, translationY } = event.nativeEvent;
            if (cubeRef.current) {
                cubeRef.current.position.x += translationX * 0.01;
                cubeRef.current.position.y -= translationY * 0.01;
            }
        }
    };

    return (
        <GLView
            style={styles.glView}
            onContextCreate={onContextCreate}
        >
            <PanGestureHandler onGestureEvent={onGestureEvent}>
                <GLView
                    style={styles.glView}
                    onContextCreate={onContextCreate}
                />
            </PanGestureHandler>
        </GLView>
    );
}

const styles = StyleSheet.create({
    glView: {
        flex: 1,
    },
});
