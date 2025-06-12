import SSocket from "servisofts-socket";
import Model from "../../Model";
import { Empresa, EventListener } from "./type";
import { SStorage, STheme, SThread } from "servisofts-component";
import { Platform } from "react-native";
import packageInfo from "../../../package.json"
import MDLAbstract from "../MDLAbstract";

export default class whatsapp extends MDLAbstract<EventListener> {

    async send(params:{ phone:string, message:string}) {

        fetch("https://wtspp.servisofts.com/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: "servisofts",
            numero: params.phone,
            mensaje: params.message,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Respuesta del servidor:", data);
          })
          .catch((error) => {
            console.error("Error al hacer la solicitud:", error);
          });
    }


}