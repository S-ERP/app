import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { GestureEvent, PanGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler';
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import * as THREE from 'three';
import { Renderer } from '..';
import Stats from "../Stats"
import { runOnJS } from 'react-native-reanimated';
type GL = {
    drawingBufferWidth: number,
    drawingBufferHeight: number,
} & ExpoWebGLRenderingContext

type SThreeGLViewProps = {
    screenWidth?: number,
    screenHeight?: number,
    handleTouch?: (evt: { locationX: number, locationY: number, mouseX: number, mouseY: number, screenWidth: number, screenHeight: number }) => void
    update: (evt: { delta: number }) => void,
    onCreate: (evt: { gl: GL, renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera }) => void,
    onGestureEvent?: (evt: GestureEvent) => void,
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


const SThreeGLView = (props: SThreeGLViewProps) => {
    const statsRef = useRef<any>();
    const glRef = useRef<GL>();
    let animationFrameId: number;


    const _handleTouch = (event: any) => {
        const locationX = event.nativeEvent.x
        const locationY = event.nativeEvent.y
        // const { locationX, locationY } = Platform.select({
        //     native: event.nativeEvent, web: {
        //         locationX: event.nativeEvent.clientX,
        //         locationY: event.nativeEvent.clientY,
        //     }
        // });
        const width = props.screenWidth ?? screenWidth;
        const height = props.screenHeight ?? screenHeight;

        const mouseX = (locationX / width) * 2 - 1;
        const mouseY = -(locationY / height) * 2 + 1;

        if (props.handleTouch) props.handleTouch({
            locationX: locationX,
            locationY: locationY,
            mouseX: mouseX,
            mouseY: mouseY,
            screenWidth: width,
            screenHeight: height

        })
    }
    useEffect(() => {

        // if (Platform.OS === "web") {
        //     // @ts-ignore
        //     document.addEventListener('pointerdown', _handleTouch);
        // }

        return () => {
            // if (Platform.OS === "web") {
            //     // @ts-ignore
            //     document.removeEventListener('pointerdown', _handleTouch);
            // }
            console.log("SE TERMINO EL RENDER")
            cancelAnimationFrame(animationFrameId);
        };
    },[]);

    const initGL = async (gl: GL) => {
        glRef.current = gl;

        // const scaleFactor = 0.5; // Reduce la resolución a la mitad, por ejemplo
        // gl.drawingBufferWidth *= scaleFactor;
        // gl.drawingBufferHeight *= scaleFactor;

        const width = gl.drawingBufferWidth;
        const height = gl.drawingBufferHeight;
        console.log(width,height)
        const renderer = Renderer(gl);
        renderer.setSize(width, height);
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 5;
        camera.position.y = 1.6;
        props.onCreate({
            gl: gl,
            renderer: renderer,
            scene: scene,
            camera: camera
        })


        let previousTime = performance.now();
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            const currentTime = performance.now();
            const delta = (currentTime - previousTime) / 1000; // Convertir a segundos
            previousTime = currentTime;

            props.update({
                delta: delta
            });
            if (statsRef.current) statsRef.current.update(delta);
            // cube.rotation.x += 0.01;
            // cube.rotation.y += 0.01;

            renderer.render(scene, camera);
            gl.endFrameEXP();
        };

        animate();
    }
    const handleContextCreate = (gl: GL) => {
        glRef.current = gl;

        const gl2: any = gl;
        gl2.getExtension('EXT_shader_texture_lod');
        gl2.enable(gl2.DEPTH_TEST);
        gl2.depthFunc(gl2.LEQUAL);
        gl2.clearDepth(1.0);
        gl2.clearColor(0.0, 0.0, 0.0, 1.0);
        initGL(gl);
    };
    const _onGestureEvent = (evt: GestureEvent) => {
        if (props.onGestureEvent) props.onGestureEvent(evt)
    }
    return <View style={styles.container}>
        <PanGestureHandler onGestureEvent={_onGestureEvent}>
            <TapGestureHandler onHandlerStateChange={evt => {
                if (evt.nativeEvent.state === State.END) {
                    if (_handleTouch) _handleTouch(evt)
                }
            }}>
                <GLView
                    // onTouchStart={_handleTouch}
                    msaaSamples={0}
                    enableExperimentalWorkletSupport={true}
                    style={styles.glView}
                    onContextCreate={handleContextCreate}
                />
            </TapGestureHandler>
        </PanGestureHandler>
        <Stats ref={statsRef} />
    </View>
}
export default SThreeGLView;


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    glView: {
        flex: 1,
        // backgroundColor: "#9090D0",
    },
});
