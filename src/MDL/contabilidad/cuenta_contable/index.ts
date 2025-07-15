import SSocket from "servisofts-socket";
import MDLAbstract from "../../MDLAbstract";
import { EventListener } from "./types";
import MDL from "../..";


export default class cuenta_contable extends MDLAbstract<EventListener> {
    async componentDidMount() {

    }

    async save(cuenta_contable: any) {
        if (!cuenta_contable?.key && !cuenta_contable?.key_empresa) {
            cuenta_contable.key_empresa = MDL.empresa.select?.key
        }
        const resp: any = await SSocket.sendPromise({
            "version": "1.0",
            "service": "contabilidad",
            "component": "cuenta_contable",
            "type": cuenta_contable.key ? "editar" : "registro",
            data: cuenta_contable,
            "key_empresa": MDL.empresa.select?.key,
            "key_usuario": MDL.usuario.session?.key
        });
        return resp.data
    }

}