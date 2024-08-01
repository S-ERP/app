import { SPage } from "servisofts-component";

import root from "./root";
import preview from "./preview";
import SSocket from "servisofts-socket";
export const Parent = {
    name: "drive",
    path: `/drive`,
}


export default SPage.combinePages(Parent.name, {
    "": root,
    preview
})




export const Actions = {
    mkdir: ({ path }) => {
        return SSocket.sendPromise({
            service: "drive",
            component: "file",
            type: "mkdir",
            path: path
        }).then((e: any) => {
            return e.data;
        })
    },
    ls: ({ path }) => {
        return SSocket.sendPromise({
            service: "drive",
            component: "file",
            type: "ls",
            path: path
        }).then((e: any) => {
            return e.data;
        })
    },
    get: ({ path }) => {
        return SSocket.sendPromise({
            service: "drive",
            component: "file",
            type: "get",
            path: path
        }).then((e: any) => {
            return e.data;
        })
    },
    rm: ({ path }) => {
        return SSocket.sendPromise({
            service: "drive",
            component: "file",
            type: "rm",
            path: path
        }).then((e: any) => {
            return e.data;
        })
    },
    papelera: ({ path }) => {
        return SSocket.sendPromise({
            service: "drive",
            component: "file",
            type: "papelera",
            path: path
        }).then((e: any) => {
            return e.data;
        })
    },
    mv: ({ path, path_to }) => {
        return SSocket.sendPromise({
            service: "drive",
            component: "file",
            type: "mv",
            path: path,
            path_to: path_to
        }).then((e: any) => {
            return e.data;
        })
    }
}