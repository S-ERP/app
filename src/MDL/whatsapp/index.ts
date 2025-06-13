import SSocket from "servisofts-socket";
import Model from "../../Model";
import { Empresa, EventListener } from "./type";
import { SStorage, STheme, SThread } from "servisofts-component";
import { Platform } from "react-native";
import packageInfo from "../../../package.json";
import MDLAbstract from "../MDLAbstract";

export default class whatsapp extends MDLAbstract<EventListener> {
  url = "http://192.168.3.3:3000";
  key = "servisofts";
  // url = "https://wtspp.servisofts.com";

  async send(params: { phone: string; message?: string, image?: string }) {
    const resp = await fetch(this.url + "/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: this.key,
        numero: params.phone,
        mensaje: params.message,
        imagen: params.image,
      }),
    })
    const json = await resp.json();
    return json
  }

  async getAllChatsById(params: {
    idchat: string;
    limit: string;
    offset: string;
    phone: string;
  }) {
    const resp = await fetch(this.url + "/getAllChatsById", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: this.key,
        idchat: "" + params.phone.replace(" ","") + "@c.us",
        // idchat: "59178505744@c.us",
        // idchat: params.idchat,
        limit: 50,
        // limit: params.limit,
        offset: 0,
      }),
    })
    const json = await resp.json()
    return json.data

  }
}
