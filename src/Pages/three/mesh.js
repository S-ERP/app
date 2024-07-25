import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Dimensions, Platform, StyleSheet, Vibration } from 'react-native';
import { SInput, SText, STheme, SView } from "servisofts-component";
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { loadAsset, Renderer, TextureLoader } from '../../Components/SThree';
import CustomOrbitControls from '../../Components/SThree/CustomOrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SPage } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import Transform from './Transform'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


export default function App() {
    let controls;
    let mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster(), camera, scene, glRef;
    const allMeshes = useRef([]);
    const transformRef = useRef();


    const onContextCreate = async (gl) => {
        try {
            glRef = gl;
            const renderer = Renderer(gl);

            renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
            renderer.setClearAlpha(0);

            renderer.physicallyCorrectLights = true;
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.soft = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.shadowMap.renderReverseSided = false;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1;

            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
            camera.position.z = 4;
            camera.layers.enable(1);

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);

            const sunLight = new THREE.PointLight(0xffffff, 50 * 30, 50 * 30);
            sunLight.castShadow = true;
            sunLight.position.set(30, 50, 30);
            scene.add(sunLight);
            scene.add(new THREE.PointLightHelper(sunLight));

            sunLight.shadow.mapSize.width = 1024;
            sunLight.shadow.mapSize.height = 1024;
            sunLight.shadow.camera.near = 0.5;
            sunLight.shadow.camera.far = 500;

            const floorGeometry = new THREE.PlaneGeometry(5000, 5000);
            const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = true;
            scene.add(floor);

            const axesHelper = new THREE.AxesHelper(5);
            scene.add(axesHelper);
            controls = new CustomOrbitControls(camera, renderer.domElement);

            try {
                const resp = await SSocket.sendPromise({
                    component: "mesh",
                    type: "getAll",
                    key_empresa: Model.empresa.Action.getKey(),
                    key_usuario: Model.usuario.Action.getKey(),
                });

                const guitarraLoader = new GLTFLoader();
                Object.values(resp.data).map(async (mesh) => {
                    guitarraLoader.load(mesh.url, (result) => {
                        const object = result.scene;
                        object.name = mesh.descripcion;
                        object.key = mesh.key;
                        object.traverse((child) => {
                            if (child.isMesh) {
                                if (mesh.descripcion === "Guitarra") {
                                    let color = new THREE.Color(Math.random(), Math.random(), Math.random());
                                    child.material = new THREE.MeshStandardMaterial({ color: color });
                                }
                                child.castShadow = true;
                                allMeshes.current.push(child);
                            }
                        });
                        object.rotation.set(mesh?.data?.transform?.rotation?.x ?? 0, mesh?.data?.transform?.rotation?.y ?? 0, mesh?.data?.transform?.rotation?.z ?? 0);
                        object.position.set(mesh?.data?.transform?.position?.x ?? 0, mesh?.data?.transform?.position?.y ?? 0, mesh?.data?.transform?.position?.z ?? 0);
                        object.scale.set(mesh?.data?.transform?.scale?.x ?? 1, mesh?.data?.transform?.scale?.y ?? 1, mesh?.data?.transform?.scale?.z ?? 1);
                        scene.add(object);
                    });
                });

            } catch (error) {
                console.error(error);
            }

            const animate = () => {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
                gl.endFrameEXP();
            };
            animate();
        } catch (error) {
            console.error(error);
        }
    };

    const onGestureEvent = (event) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            const { velocityX, velocityY } = event.nativeEvent;
            if (controls) controls.handleGesture(velocityX, velocityY);
        }
    };

    const handleTouch = useCallback((event) => {
        const { locationX, locationY } = Platform.select({
            native: event.nativeEvent, web: {
                locationX: event.nativeEvent.clientX,
                locationY: event.nativeEvent.clientY,
            }
        });
        const width = screenWidth;
        const height = screenHeight;

        mouse.x = (locationX / width) * 2 - 1;
        mouse.y = -(locationY / height) * 2 + 1;

        requestAnimationFrame(() => {
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(allMeshes.current, true);
            if (intersects.length > 0) {
                Vibration.vibrate(400);
                let color = new THREE.Color(Math.random(), Math.random(), Math.random());
                intersects[0].object.material.color.set(color);
                //transformRef = intersects[0].object;
                if (transformRef.current) transformRef.current.setModel(intersects[0].object);

                //setSelectedObject(intersects[0].object);
            } else {
                // if (transformRef.current) transformRef.current.setModel(null);
            }
        });
    }, [mouse, raycaster, camera]);

    useEffect(() => {
        if (Platform.OS === "web") {
            document.addEventListener('pointerdown', handleTouch);
        }
        return () => {
            if (Platform.OS === "web") {
                document.removeEventListener('pointerdown', handleTouch);
            }
        };
    }, [handleTouch]);

    const onUpdate = (key, axis, event) => {
        const value = parseFloat(event.value);
        if (!isNaN(value)) {
            selectedObject[key][axis] = value;
        }
    };

    return (
        <SPage disableScroll>
            <PanGestureHandler onGestureEvent={onGestureEvent}>
                <GLView
                    onTouchStart={handleTouch}
                    style={styles.glView}
                    onContextCreate={onContextCreate}
                />
            </PanGestureHandler>

            <SView row style={{ position: "absolute" }}>
                {/* <SText padding={4} onPress={() => {
                    controls.setZoom(controls.zoom - 1);
                }}>Zoom -</SText>
                <SText padding={4} onPress={() => {
                    controls.setZoom(controls.zoom + 1);
                }}>Zoom +</SText> */}
                <Transform ref={transformRef} onUpdate={onUpdate} />
            </SView>
        </SPage>
    );
}

const styles = StyleSheet.create({
    glView: {
        flex: 1,
        backgroundColor: "#aaaaff",
    },
});
