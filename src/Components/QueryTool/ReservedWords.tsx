import React from "react"
import { TextStyle } from "react-native"
import { SImage, SNavigation } from "servisofts-component"

const color = {
    red: "#FF0000",
    blue: "#4181BE",
    green: "#699754",
    naranja: "#C27E65",
    string: "#CE9178",
    rosa: "#AE6AAA",
}

export type ReservedWord = {
    regex: RegExp,
    style: TextStyle,
    onPress?: (val: string) => void,
    render?: (val: string) => any,
}

const MD: ReservedWord[] = [
    { regex: /```.*?```/gsi, style: { color: color.red } },
    { regex: /#{1,6}.*/gi, style: { color: color.blue } },
    { regex: /\s- /gi, style: { color: color.blue } },
    { regex: /\d{0,}\. /gi, style: { color: color.blue } },
    { regex: /\s\W> /gi, style: { color: color.green } },
    { regex: /<!--.*?-->/gsi, style: { color: color.green } },
    { regex: /\`.*?\`/gsi, style: { color: color.naranja } },

]
const SQL: ReservedWord[] = [
    { regex: /\b(select|from|where|left|on|between|and|or|is|not|null|as|top|group|order|by|desc|asc|join|right|inner|sum|count|array_agg)\b/gi, style: { color: color.red } },
    { regex: /'.*?'/gi, style: { color: color.string } },
    { regex: /--.*/gi, style: { color: color.green } }
]
const BASH: ReservedWord[] = [
    // Comentarios
    { regex: /#.*/gi, style: { color: color.green } },

    // Variables ($VAR, ${VAR})
    { regex: /\$[A-Za-z_][A-Za-z0-9_]*|\$\{.*?\}/g, style: { color: color.naranja } },

    // Strings (comillas simples o dobles)
    { regex: /(["'`]).*?\1/g, style: { color: color.string } },

    // Palabras clave de bash
    { regex: /\b(if|then|else|elif|fi|for|in|do|done|while|until|case|esac|function|select|time|coproc)\b/g, style: { color: color.red } },

    // Comandos comunes (puedes ir agregando más)
    { regex: /\b(echo|cd|ls|cat|grep|find|chmod|chown|pwd|exit|kill|ps|top|history|clear)\b/g, style: { color: color.blue } },
]
const JS: ReservedWord[] = [
    // Comentarios de línea y bloque
    { regex: /\/\/.*/g, style: { color: color.green } },
    { regex: /\/\*[\s\S]*?\*\//g, style: { color: color.green } },

    // Strings (comillas simples, dobles o backticks)
    { regex: /(["'`]).*?\1/g, style: { color: color.string } },

    // Palabras clave
    { regex: /\b(const|let|var|if|else|for|while|do|switch|case|break|continue|return|function|class|extends|new|try|catch|finally|throw|import|from|export|default|async|await|yield|in|of|instanceof|typeof|delete|void|this|super)\b/g, style: { color: color.rosa } },

    // Booleanos y null/undefined
    { regex: /\b(true|false|null|undefined|NaN|Infinity)\b/g, style: { color: color.naranja } },

    // Números
    { regex: /\b\d+(\.\d+)?\b/g, style: { color: color.blue } },

    // Objetos globales / funciones comunes
    { regex: /\b(console|window|document|Array|Object|String|Number|Boolean|Math|Date|RegExp|JSON|Promise|Set|Map)\b/g, style: { color: color.blue } },
]
const TEXT: ReservedWord[] = [
    // Cuando sea un link pinta azul de cual 
    {
        regex: /!\[.*?\]\((.*?)\)/g,
        style: {
            color: color.red,
            textDecorationLine: "underline"
        },
        onPress: (val: any) => {
            const url = val.match(/\((.*?)\)/)?.[1]
            if (!url) return null;
            console.log(url)
        },
        render: (e) => {
            const url = e.match(/\((.*?)\)/)?.[1]
            if (!url) return null;
            console.log(url)
            return <SImage src={url} style={{
                // top:0,
                // left:0,
                position:"absolute",
                width: 100, height: 100
            }} />
        }
    },
    {
        regex: /(https?:\/\/[^\s]+)/g,
        style: {
            color: color.blue,
            textDecorationLine: "underline"
        },
        onPress: (val: any) => {
            SNavigation.openURL(val)
        }
    },
    {
        regex: /(http?:\/\/[^\s]+)/g,
        style: {
            color: color.blue,
            textDecorationLine: "underline"
        },
        onPress: (val: any) => {
            SNavigation.openURL(val)
        }
    },




]


export default {
    TEXT,
    SQL,
    MD,
    BASH,
    JS
}


