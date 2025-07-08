import {  onDropNotificationEventProps } from "servisofts-component";
export type ReadData = {
    component: "qr_reader",
    type: "read",
    data: string,
    key_usuario: string,
    estado: "exito" | "error",
}

export type TakePicture = {
    component: "qr_reader",
    type: "take_picture",
    data: string,
    key_usuario: string,
    estado: "exito" | "error",
}
export type TakePictureHandleDrop = {
    type: "take_picture_handle_drop",

} & onDropNotificationEventProps



export type EventListener = ReadData | TakePicture | TakePictureHandleDrop;
