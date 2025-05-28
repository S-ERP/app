import React from "react";
import { SPage, SText } from "servisofts-component";
import NodeAbstract, { NodeConfig } from "../NodeAbstract";
import NodeAttribute from "../NodeAttribute";

export default class NodeTexture extends NodeAbstract {

    $config: NodeConfig = {
        type: NodeTexture.name,
        color: "#8B4C27"
    }
    $renderContent() {

        return <>
            <NodeAttribute node={this} type="output" label="Color" />
            <NodeAttribute node={this} type="output" label="Alpha" />
        </>
    }

}