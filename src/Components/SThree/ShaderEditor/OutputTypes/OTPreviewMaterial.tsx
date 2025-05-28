import React, { useEffect, useRef, useState } from "react";
import { SHr, SIcon, SInput, SPage, SText, STheme, SThread, SUuid, SView } from "servisofts-component";
import { STOutput } from "../../STNode";
import * as THREE from 'three'
import SThreeGLView from "../../SThreeGLView";
import { useSharedValue } from "react-native-reanimated";




const OTPreviewMaterial = ({ stoutput }: { stoutput: STOutput<THREE.Material> }) => {
    const _cube = useRef<THREE.Mesh>()
    const [state, setState] = useState<{ load: boolean }>({
        load: false,
    })

    // useEffect(() => {
    //     console.log("Entro aca", _cube.current)    // setState({ load: true })
    // }, [])

    if (_cube.current) {
        _cube.current.material = stoutput.eval()
    }
    // const _cube = useRef();

    return <SView col={"xs-12"} style={{
        alignItems: "center",
    }}>
        <SText>{stoutput.props.label}</SText>
        <SView width={180} height={200} backgroundColor="#232323" >
            {/* <SText>{val}</SText> */}
            <SThreeGLView
                screenWidth={180} screenHeight={200}
                onCreate={({ scene, camera }) => {
                    console.log("SE RECREO LA SCENE")

                    _cube.current = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
                    const material = stoutput.eval();
                    if (material) {
                        _cube.current.material = material;
                    };
                    _cube.current.position.y = 0.5
                    // instances.scene = scene;
                    scene.add(new THREE.AmbientLight(0x666666, 1))
                    // scene.add(new THREE.AxesHelper(10))
                    scene.add(new THREE.GridHelper(10, 20, 0x666666, 0x666666))
                    camera.position.set(1.2, 0.5, 1.2)
                    camera.lookAt(0, 0.5, 0)
                    scene.add(_cube.current);
                }}
                update={({ delta }) => {
                    if (_cube.current) {
                        _cube.current.rotation.x += 0.005
                        _cube.current.rotation.y += 0.005
                    }

                    // _cube.current.rotation.z += 0.01
                }}
            />
        </SView>
    </SView>
}

export default OTPreviewMaterial;