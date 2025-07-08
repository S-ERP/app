import SSocket from "servisofts-socket";
import MDLAbstract from "../MDLAbstract";
import { EventListener, ReadData } from "./types";
import MDL from "..";
import { SNotification, SUuid } from "servisofts-component";


export default class qr_reader extends MDLAbstract<EventListener> {
    async componentDidMount() {
        SSocket.addEventListener("onMessage", (data: any) => {
            if (data.component != "qr_reader") return;
            if (data.type == "read") {
                this.dispatchEvent(data);
            }
            if (data.type == "take_picture") {
                const key =  "qr_reader_take_picture_" + SUuid();
                SNotification.send({
                    key:key,
                    title: "Foto",
                    body: "Foto tomada desde tu otro dispositivo",
                    image: data.data,
                    time: 10000,
                    onPress: (e) => {
                        console.log("onPress", e);
                    },
                    onDrop: (e) => {
                        console.log("onDrop", e);
                        this.dispatchEvent({
                            type: "take_picture_handle_drop",
                            ...e
                        })
                        SNotification.remove(key);
                    }

                })
                this.dispatchEvent(data);
            }
        })
        return
    }

    handleRead = async (data: string) => {
        return await SSocket.sendPromise({
            component: "qr_reader",
            type: "read",
            data: data,
            key_usuario: MDL.usuario?.session?.key,
        })
    }
    handleTakePicture = async (data: string) => {
        return await SSocket.sendPromise({
            component: "qr_reader",
            type: "take_picture",
            data: data,
            key_usuario: MDL.usuario?.session?.key,
        })
    }

}