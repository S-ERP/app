import mesh, { ReactComponent as meshW } from './mesh.svg';
import light, { ReactComponent as lightW } from './light.svg';
import armature, { ReactComponent as armatureW } from './armature.svg';
import scene, { ReactComponent as sceneW } from './scene.svg';
import group, { ReactComponent as groupW } from './group.svg';
import bone, { ReactComponent as boneW } from './bone.svg';
import camera, { ReactComponent as cameraW } from './camera.svg';
import object3d, { ReactComponent as object3dW } from './object3d.svg';

export default {
    "blender/mesh": { Native: mesh, Web: meshW },
    "blender/light": { Native: light, Web: lightW },
    "blender/armature": { Native: armature, Web: armatureW },
    "blender/scene": { Native: scene, Web: sceneW },
    "blender/group": { Native: group, Web: groupW },
    "blender/bone": { Native: bone, Web: boneW },
    "blender/camera": { Native: camera, Web: cameraW },
    "blender/object3d": { Native: object3d, Web: object3dW },
}