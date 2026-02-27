import React from "react";
import { SPage, SText } from "servisofts-component";
import SSocket from "servisofts-socket";

export default class index extends React.Component {

    async getAutomatica() {
        const resp = await SSocket.sendPromise({
            service: "caja",
            component: "caja",
            type: "getAutomatica",
            key_punto_venta: "7cc89f65-5260-4b1a-bc4e-ed7611ae1480",
        })
    }
    render() {
        return <SPage title={"index"}>
            <SText onPress={()=>{
                this.getAutomatica();
            }}>index</SText>
        </SPage>
    }
}