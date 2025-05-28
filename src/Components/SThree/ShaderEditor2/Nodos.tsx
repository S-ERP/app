import * as React from 'react';
import * as THREE from 'three';
import { SText, SView } from "servisofts-component";
import DraggableBox from './DraggableBox';
import { SharedValue } from 'react-native-reanimated';
import { NodeFactory, NodesTypes } from './NodeFactory';

type NodosType = {
    material: THREE.Material,
    scale: SharedValue<number>,
    widthWorkSpace: SharedValue<number>,
    heightWorkSpace: SharedValue<number>,

}

const Nodos = (props: NodosType) => {
    const { material } = props;

    const center = {
        x: props.widthWorkSpace.value / 2,
        y: props.heightWorkSpace.value / 2,
    }


    
    console.log(material.type)


    // const Node = NodeFactory({ type: "NodeMeshBasicMaterial" })
    // const Node2 = NodeFactory({ type: "NodeTexture" })
    return <SView col={"xs-12"} flex>
        <NodesTypes.NodeMeshBasicMaterial threeObject={material} scale={props.scale} x={center.x} y={center.y} />
        {/* <Node2 scale={props.scale} x={center.x - 300} y={center.y} /> */}
    </SView>
}
export default Nodos;