

import JSZip from "jszip";


export const urlToArrayBuffer = async (url: string): Promise<ArrayBuffer> => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;

}
export const readFromUrl = async (url: string): Promise<ArrayBuffer> => {
    const arrayBuffer = await urlToArrayBuffer(url);
    const archives = await readFromArrayBuffer(arrayBuffer);
    return archives;

}

export const readFromArrayBuffer = async (arrayBuffer: ArrayBuffer): Promise<any> => {
    const zip = await JSZip.loadAsync(arrayBuffer);
    console.log(zip.files)

    const filePromises = Object.keys(zip.files).map(async (fileName) => {
        const file = zip.file(fileName);
        if (file) {
            const content = await file.async("string"); // o "arraybuffer", "uint8array", etc.
            return { name: fileName, content:parseXmlToJson(content) };
            // return { name: fileName, content:content };
        }
        return null;
    });

    // Esperamos a que todas las promesas se resuelvan
    const results = await Promise.all(filePromises);
    return results;
    // if (zip.file("xl/styles.xml")) {
    //     const stylesXML:any = await zip.file("xl/styles.xml")?.async("string");
    //     console.log("excel-sheet", stylesXML)
    //     const sheet = parseXmlToJson(stylesXML)
    //     console.log("excel-sheet", sheet)
    // }
    // if (zip.file("xl/workbook.xml")) {
    //     const sheetXML: any = await zip.file(`xl/worksheets/sheet1.xml`)?.async("string")
    //     console.log("excel-sheet", sheetXML)
    //     const sheet = parseXmlToJson(sheetXML)
    //     console.log("excel-sheet", sheet)
    // }

}

function parseNode(str: string, start = 0): [any[], number] {
    const attrRegex = /(\S+)="(.*?)"/g;

    const nodes: any[] = [];
    let i = start;

    while (i < str.length) {
        if (str[i] !== "<") {
            // Texto plano
            const textEnd = str.indexOf("<", i);
            const text = str.slice(i, textEnd === -1 ? str.length : textEnd).trim();
            if (text) nodes.push(text);
            if (textEnd === -1) break;
            i = textEnd;
        }

        // Tag autocontenido <tag .../>
        const selfClosingMatch = str.slice(i).match(/^<(\w+)([^>]*)\/>/);
        if (selfClosingMatch) {
            const [, tag, attrString] = selfClosingMatch;
            const attributes: any = {};
            let attrMatch;
            while ((attrMatch = attrRegex.exec(attrString)) !== null) {
                attributes[attrMatch[1]] = attrMatch[2];
            }
            nodes.push({ tag, ...attributes });
            i += selfClosingMatch[0].length;
            continue;
        }

        // Tag de apertura <tag ...>
        const openMatch = str.slice(i).match(/^<(\w+)([^>]*)>/);
        if (openMatch) {
            const [, tag, attrString] = openMatch;
            const attributes: any = {};
            let attrMatch;
            while ((attrMatch = attrRegex.exec(attrString)) !== null) {
                attributes[attrMatch[1]] = attrMatch[2];
            }


            i += openMatch[0].length;

            // Parsear hijos dentro del tag
            const [children, newIndex] = parseNode(str, i);
            i = newIndex;

            nodes.push({ tag, ...attributes, children });
            continue;
        }

        // Tag de cierre </tag>
        const closeMatch = str.slice(i).match(/^<\/(\w+)>/);
        if (closeMatch) {
            i += closeMatch[0].length;
            return [nodes, i];
        }

        i++; // avanzar en caso de error de parsing
    }

    return [nodes, i];
}
function parseXmlToJson(xml: string): any {
    xml = xml.trim();
    const [result] = parseNode(xml, 0);
    return result;
}



export default {
    readFromUrl,
    readFromArrayBuffer,
    urlToArrayBuffer
}