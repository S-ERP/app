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
    root_path: "/home",


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
    },
    video_trim: ({ path, path_to, startSec, endSec, crf }) => {
        return SSocket.sendPromise({
            service: "drive",
            component: "file",
            type: "video_trim",
            path: path,
            path_to: path_to,
            startSec: startSec,
            endSec: endSec,
            crf: crf
        }, 5 * 60 * 1000).then((e: any) => {
            return e.data;
        })
    },
    video_analizar: ({ path, path_file }) => {
        return SSocket.sendPromise({
            service: "drive",
            component: "video",
            type: "analizar",
            path: path,
            path_file: path_file
        }, 15 * 60 * 1000).then((e: any) => {
            return e.data;
        })
    },
    get_analisis: ({  path_file }) => {
        return SSocket.sendPromise({
            service: "drive",
            component: "video",
            type: "get_analisis",
            path_file: path_file
        }, 5 * 60 * 1000).then((e: any) => {
            return e.data;
        })
    },
    getFileType: (file: { type?: string, name?: string } | null, fallbackName?: string): string => {
        const type = file?.type ?? "";
        if (type) return type;
        const name = file?.name ?? fallbackName ?? "";
        const ext = name.split(".").pop()?.toLowerCase() ?? "";
        const map: Record<string, string> = {
            jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
            gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
            bmp: "image/bmp", ico: "image/x-icon", tiff: "image/tiff",
            mp4: "video/mp4", mov: "video/quicktime", avi: "video/x-msvideo",
            mkv: "video/x-matroska", webm: "video/webm", wmv: "video/x-ms-wmv",
            flv: "video/x-flv", m4v: "video/mp4",
            mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg",
            aac: "audio/aac", flac: "audio/flac", m4a: "audio/mp4",
            pdf: "application/pdf",
            doc: "application/msword",
            docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            xls: "application/vnd.ms-excel",
            xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ppt: "application/vnd.ms-powerpoint",
            pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            txt: "text/plain", csv: "text/csv", html: "text/html",
            json: "application/json", xml: "application/xml",
            zip: "application/zip", rar: "application/x-rar-compressed",
            "7z": "application/x-7z-compressed", tar: "application/x-tar",
            gz: "application/gzip",
        };
        return map[ext] ?? "";
    }
}