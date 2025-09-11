import React from "react";
import { SPage, SText } from "servisofts-component";
import SSocket from "servisofts-socket";
import Pizarra from "../../Components/Pizarra/Pizarra";
import ServerNodo from "./Components/ServerNodo";

export default class root extends React.Component {
    services = []

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        const resp_services = await SSocket.sendPromise({
            service: "servicio",
            component: "servicio",
            type: "getAll"
        })
        this.services = Object.values(resp_services.data);
        this.forceUpdate();
    }
    render() {
        return <SPage title={"Server"} disableScroll>
            <Pizarra id="server_services">
                {this.services.map(service => <ServerNodo servicio={service} />)}
            </Pizarra>
        </SPage>
    }
}

