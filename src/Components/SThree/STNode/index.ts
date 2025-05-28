import STNode from "./STNode"
import STOutput from "./STOutput"
import STInput from "./STInput"
import STNMath from "./type/STNMath"
import STNValue from "./type/STNValue"
import STNRGB from "./type/STNRGB"
import STNPreviewValue from "./type/STNPreviewValue"
import STNMeshBasicMaterial from "./type/STNMeshBasicMaterial"
import STNPreviewMaterial from "./type/STNPreviewMaterial"
import STNTexture from "./type/STNTexture"
import STNMaterialOutput from "./type/STNMaterialOutput"
import JsonLoader from "./JsonLoader"


export const STNodeTypes = {
    STNMath,
    STNValue,
    STNRGB,
    STNPreviewValue,
    STNMeshBasicMaterial,
    STNPreviewMaterial,
    STNMaterialOutput,
    STNTexture
}
export {
    STNode,
    STOutput,
    STInput,
    JsonLoader

}