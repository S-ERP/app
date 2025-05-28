import React from "react";
import { SPage, SText } from "servisofts-component";
import NodeAbstract, { NodeConfig } from "../NodeAbstract";
import NodeAttribute from "../NodeAttribute";
import * as THREE from 'three';


export default class NodeMeshBasicMaterial extends NodeAbstract {

    $config: NodeConfig = {
        type: NodeMeshBasicMaterial.name,
        color: "#267A4B"
    }
    $renderContent() {
        const material = this.props.threeObject as THREE.MeshBasicMaterial;
        console.log(material)
        return <>
            <NodeAttribute node={this} type="output" typeInput="color" label="BSDF" />
            <NodeAttribute node={this} type="input" label="Base Color" />
        </>
    }
}