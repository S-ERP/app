import SSocket from "servisofts-socket";

export type FileItemType = {
    name: string,
    lastModified: number,
    path?: string,
    type: string,
}
const Action = {
    mkdir: async ({ path }: { path: string }) => {
        const resp: any = await SSocket.sendPromise({
            service: "drive",
            component: "file",
            type: "mkdir",
            path: path
        })
        return resp.data;
    },
    ls: async ({ path }: { path: string }) => {
        const resp: any = await SSocket.sendPromise({
            service: "drive",
            component: "file",
            type: "ls",
            path: path
        })
        return resp.data as FileItemType[];
    },
    get: async ({ path }: { path: string }) => {
        const resp: any = await SSocket.sendPromise({
            service: "drive",
            component: "file",
            type: "get",
            path: path
        })
        return resp.data;
    },
    rm: async ({ path }: { path: string }) => {
        const resp: any = await SSocket.sendPromise({
            service: "drive",
            component: "file",
            type: "rm",
            path: path
        })
        return resp.data;
    },
    papelera: async ({ path }: { path: string }) => {
        const resp: any = await SSocket.sendPromise({
            service: "drive",
            component: "file",
            type: "papelera",
            path: path
        })
        return resp.data;
    },
    mv: async ({ path, path_to }: { path: string, path_to: string }) => {
        const resp: any = await SSocket.sendPromise({
            service: "drive",
            component: "file",
            type: "mv",
            path: path,
            path_to: path_to
        })
        return resp.data;
    },
    getExtencion: (filename: string) => {
        const parts = filename.split(".");
        if (parts.length == 1) return "";
        return parts[parts.length - 1];
    }
}

export default Action;