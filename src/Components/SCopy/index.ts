// @ts-nocheck

import { SNotification } from "servisofts-component";

function fallbackCopyTextToClipboard(text: any) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Evita que el textarea sea visible en la página
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand("copy");
        if (successful) {
            SNotification.send({
                title: "Texto copiado.",
                body: text,
                time: 5000
            });
        } else {
            console.error("Fallback: No se pudo copiar el texto");
        }
    } catch (err) {
        console.error("Fallback: Error al intentar copiar el texto", err);
    }

    document.body.removeChild(textArea);
}

export default class {
    static async copy(text: any) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                SNotification.send({
                    title: "Texto copiado.",
                    body: text,
                    time: 5000
                });
            }).catch(() => {
                fallbackCopyTextToClipboard(text);
            });
        } else {
            fallbackCopyTextToClipboard(text);
        }
    }



}