import SSocket from "servisofts-socket";
import Model from "../../Model";
import { Empresa, EventListener } from "./type";
import { SStorage, STheme, SThread } from "servisofts-component";
import { Platform } from "react-native";
import packageInfo from "../../../package.json";
import MDLAbstract from "../MDLAbstract";

export default class whatsapp extends MDLAbstract<EventListener> {
  url = "http://192.168.3.3:3000";
  // url = "https://wtspp.servisofts.com";

  async registrar(params: { descripcion: string; webhook: string }) {
    const resp = await fetch(this.url + "/api/device", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key_usuario: Model.usuario.Action.getKey(),
        key_empresa: Model.empresa.Action.getKey(),
        ...params,
      }),
    });
    const json = await resp.json();
    return json;
  }

  async getAll() {
    const resp = await fetch(this.url + "/api/device", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await resp.json();
    return json;
  }
  async getByKey(key: string) {
    const resp = await fetch(this.url + "/api/device/" + key, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await resp.json();
    return json;
  }

  async edit(key: string, obj: any) {
    const resp = await fetch(this.url + "/api/device/" + key, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });
    const json = await resp.json();
    return json;
  }

  async getChats(key: string) {
    const resp = await fetch(this.url + "/api/device/" + key + "/chats", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await resp.json();
    return json;
  }

  async getChatById(key: string, idchat: string) {
    const resp = await fetch(
      this.url + "/api/device/" + key + "/chatsById/" + idchat,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const json = await resp.json();
    return json;
  }

  getUrlImage(key: string, id: any) {
    return this.url + "/api/device/" + key + "/profilePic/" + id;
  }
}
