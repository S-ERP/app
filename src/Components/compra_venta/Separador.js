import { SHr, STheme } from "servisofts-component"
import Model from "../../Model";

export default (props) => {
    const state =  props?.data?.state
    var statei = Model.compra_venta.Action.getStateInfo(state)
    return <>
        <SHr />
        <SHr height={1} color={statei.color+"44"} />
        <SHr />
    </>
}