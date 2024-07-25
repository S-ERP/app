import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { runOnUI } from 'react-native-reanimated';
import { SText, SView } from 'servisofts-component';
import { TypeLayout } from './types';
import { GestureEvent, PanGestureHandler } from 'react-native-gesture-handler';
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { Renderer } from '../../../Components/SThree';
import FirstPersonControls from '../../../Components/SThree/FirstPersonControls';
import Stats from "../../../Components/SThree/Stats"
import * as THREE from 'three';
import { WebGLRenderer } from 'three';
import Luces from './Luces';
import Terreno from './Terreno';
import Joystick from '../../../Components/SThree/Joystick';
import Meshes from './Meshes';
import QualityControl from '../../../Components/SThree/QualityControl';
import { GetCamerasFromServer } from './CamerasServer';
import Personaje from './Personaje';


const styles = StyleSheet.create({
    glView: {
        flex: 1,
        backgroundColor: "#000000",
    },
});

let ready = true;
export default ({ layout }: { layout: TypeLayout }) => {
    const [gl, setGl] = useState<ExpoWebGLRenderingContext>();
    const instaceCameras = useRef<any>();
    const personajesRef = useRef<any>();
    // const [readyState, setReadyState] = useState(true)
    const glRef = useRef<ExpoWebGLRenderingContext>();
    const statsRef = useRef<any>();
    const qualityControl = useRef<any>();
    const frameId = useRef<any>();
    let camera: THREE.PerspectiveCamera;
    let luces: Luces;
    let terreno: Terreno;
    const fisrtPersonControl = useRef<FirstPersonControls>();
    const sceneRef = useRef<THREE.Scene>();
    const cameraRef = useRef<THREE.Camera>();
    if (!instaceCameras.current) {
        instaceCameras.current = {}
    }
    if (!personajesRef.current) {
        personajesRef.current = {}
    }


    useEffect(() => {
        if (!gl) return;
        ready = true;
        if (glRef.current) {
            onContextCreate(glRef.current)
        } else {
            console.error("NO SE ENCONTRO LA REFERENCIA AL GL")
        }
        return () => {
            ready = false;
        }


    }, [gl])



    const onGestureEvent = (evt: GestureEvent) => {
        const { velocityX, velocityY } = evt.nativeEvent;
        if (fisrtPersonControl.current) fisrtPersonControl.current.handleGesture(velocityX, velocityY);
    }

    const onContextCreate = async (gl: any) => {
        // @ts-ignore
        const drawing = { width: gl.drawingBufferWidth, height: gl.drawingBufferHeight };

        const renderer: WebGLRenderer = Renderer(gl, drawing.width, drawing.height);
        // const scaleFactor = 0.5; // Reducir la resolución al 50%
        // renderer.setSize(drawing.width * scaleFactor, drawing.height * scaleFactor, false);
        // gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        qualityControl.current.init(renderer, scene);

        camera = new THREE.PerspectiveCamera(75, drawing.width / drawing.height, 0.1, 1000);
        camera.position.set(0, 1.7, 6)
        camera.layers.enable(1);

        luces = new Luces(scene);

        // terreno = new Terreno(scene);

        fisrtPersonControl.current = new FirstPersonControls(camera);

        GetCamerasFromServer(sceneRef.current, camera, fisrtPersonControl.current, instaceCameras.current, personajesRef.current)

        const meshes = new Meshes(scene);

        let previousTime = performance.now();

        // const personaje = new Personaje(scene);

        const animate = () => {
            if (!ready) return;
            const currentTime = performance.now();
            const delta = (currentTime - previousTime) / 1000; // Convertir a segundos
            previousTime = currentTime;
            if (meshes) meshes.update(delta);
            if (fisrtPersonControl.current) fisrtPersonControl.current.update(delta);
            if (statsRef.current) statsRef.current.update(delta);

            // personaje.update(delta);
            if (personajesRef.current) {
                Object.values(personajesRef.current).forEach((e: any) => {
                    e.update(delta)
                })
            }
            renderer.render(scene, camera);

            gl.endFrameEXP();
            frameId.current = requestAnimationFrame(animate);
        };
        animate();
    }


    useEffect(() => {
        ready = true;
        const interval = setInterval(() => {
            // if (!sceneRef.current) return
            // console.log("Interval")
            if (sceneRef.current) GetCamerasFromServer(sceneRef.current, camera, fisrtPersonControl, instaceCameras.current, personajesRef.current);
        }, 1000 / 1);

        return () => {
            ready = false;
            clearInterval(interval);

        }
        // Limpiar el intervalo al desmontar el componente
    }, [fisrtPersonControl, sceneRef]);

    useEffect(() => {
        return () => {
            if (frameId.current) {
                cancelAnimationFrame(frameId.current);
            }
        };
    }, [])
    return <SView col={"xs-12"} flex >
        <PanGestureHandler onGestureEvent={onGestureEvent}>
            <GLView
                // enableExperimentalWorkletSupport
                enableExperimentalWorkletSupport={true}
                style={styles.glView}
                onContextCreate={context => {
                    glRef.current = context
                    setGl(context);
                }}

            />
        </PanGestureHandler>
        <Joystick onMove={(e: any) => {
            if (!fisrtPersonControl.current) return;
            fisrtPersonControl.current.velocity.x = e.x; // Ajustar la velocidad según el input del joystick
            fisrtPersonControl.current.velocity.z = -e.y; // Ajustar la velocidad según el input del joystick
        }} />
        <Stats ref={statsRef} />
        <QualityControl ref={qualityControl} />
    </SView>
}


