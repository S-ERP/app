import React from "react";
import { SIcon, STheme } from "servisofts-component";

const IconType = (props: { type: any } & typeof SIcon.prototype.props) => {
    let icon: any = "blender/mesh";
    let iconColor: any = STheme.color.warning;

    switch (props.type) {
        case "AmbientLight":
            icon = "blender/light";
            break;
        case "PointLight":
            icon = "blender/light";
            break;
        case "Object3D":
            icon = "blender/object3d";
            break;
        case "Scene":
            icon = "blender/scene";
            iconColor = STheme.color.lightGray
            break;
        case "Group":
            icon = "blender/group";
            iconColor = STheme.color.lightGray
            break;
        case "Bone":
            icon = "blender/bone";
            iconColor = STheme.color.success
            break;
        case "PerspectiveCamera":
            icon = "blender/camera";
            // iconColor = STheme.color.success
            break;
    }
    return <SIcon width={14} height={14} name={icon} fill={iconColor}  {...props}/>
}
export default IconType;