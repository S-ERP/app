import React from 'react';
import { StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Renderer, CustomOrbitControls } from '../../Components/SThree';
import { SPage, SStorage, SText, SView } from 'servisofts-component';
import { JsonLoader } from '../../Components/SThree/STNode';
import STNMaterialOutput from '../../Components/SThree/STNode/type/STNMaterialOutput';
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}
const createCube = (x = 2, y = 2, z = 2) => {
    const geometry = new THREE.BoxGeometry(x, y, z);
    const materials = [
        new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Frente - Rojo
        new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Atrás - Verde
        new THREE.MeshBasicMaterial({ color: 0x0000ff }), // Arriba - Azul
        new THREE.MeshBasicMaterial({ color: 0xffff00 }), // Abajo - Amarillo
        new THREE.MeshBasicMaterial({ color: 0x00ffff }), // Izquierda - Cian
        new THREE.MeshBasicMaterial({ color: 0xff00ff }), // Derecha - Magenta
    ];

    const cube = new THREE.Mesh(geometry, materials);
    return cube;
}
export default function App() {
    let controls;
    const cube = createCube(2, 2, 2);


    const onContextCreate = async (gl) => {
        const renderer = Renderer(gl, gl.drawingBufferWidth, gl.drawingBufferHeight);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
        camera.position.set(0, 3.7, 10)
        camera.rotation.set(degreesToRadians(-17), degreesToRadians(-0.7), 0)

        SStorage.getItem("nodo_in_edit", (resp) => {
            if (resp) {
                const nodesJSON = JSON.parse(resp);
                const nodes = new JsonLoader().load(nodesJSON);
                const materialOut: STNMaterialOutput = nodes.find(n => n.type == "STNMaterialOutput");
                cube.material = materialOut.output.eval();
                

                // this.state.nodes = nodes;
            }
        });
        // Para las rayitas
        scene.add(new THREE.AxesHelper(5))

        // Para el cubo

        scene.add(cube);

        controls = new CustomOrbitControls(camera, renderer.domElement);

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update(); // Llamar al método update para actualizar la cámara
            // cube.rotation.x += 0.01
            cube.rotation.y += 0.01
            // cube.rotation.z += 0.01
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
            <SView style={{
                position: "absolute",
                width: 200,
                height: 200,
                backgroundColor: "#66666666"
            }}>
                <SText onPress={e => {
                    cube.position.x += 0.1
                }}>AVANZAR</SText>
            </SView>
        </SPage>
    );
}

const styles = StyleSheet.create({
    glView: {
        flex: 1,
    },
});
