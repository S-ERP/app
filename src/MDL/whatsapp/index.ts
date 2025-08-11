import SSocket from "servisofts-socket";
import Model from "../../Model";
import { Empresa, EventListener } from "./type";
import { SStorage, STheme, SThread } from "servisofts-component";
import { Platform } from "react-native";
import packageInfo from "../../../package.json";
import MDLAbstract from "../MDLAbstract";
import Device from "./device";
export default class whatsapp extends MDLAbstract<EventListener> {
  // url = "http://192.168.3.3:3000";
  // url = ;
  // url = "http://192.168.2.1:3000";
  // url = "https://wtspp.servisofts.com";
  device = new Device();

  async send(params: { key_device: string, phone: string; message?: string, image?: string }) {
    const resp = await fetch((SSocket.api as any).whatsapp + "/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: params.key_device,
        numero: params.phone,
        mensaje: params.message,
        imagen: params.image,
      }),
    })
    const json = await resp.json();
    return json
  }

  async getAllChatsById(params: {
    key_device: string;
    idchat: string;
    limit: string;
    offset: string;
    phone: string;
  }) {
    const resp = await fetch((SSocket.api as any).whatsapp  + "/api/device/getAllChatsById", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: params.key_device,
        idchat: params.idchat || ("" + params.phone.replace(" ", "") + "@c.us"),
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
