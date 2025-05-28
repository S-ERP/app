import NodeMeshBasicMaterial from "./Nodes/NodeMeshBasicMaterial";
import NodeTexture from "./Nodes/NodeTexture";

export const NodesTypes = {
    NodeMeshBasicMaterial,
    NodeTexture
}

export const NodeFactory = (props: { type: keyof typeof NodesTypes }) => {
    return NodesTypes[props.type];
}