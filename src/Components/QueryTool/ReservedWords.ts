const color = {
    red: "#FF0000",
    blue: "#4181BE",
    green: "#699754",
    naranja: "#C27E65",
    string: "#CE9178",
    rosa: "#AE6AAA",
}



const MD = [
    { regex: /```.*?```/gsi, color: color.red },
    { regex: /#{1,6}.*/gi, color: color.blue },
    { regex: /\s- /gi, color: color.blue },
    { regex: /\d{0,}\. /gi, color: color.blue },
    { regex: /\s\W> /gi, color: color.green },
    { regex: /<!--.*?-->/gsi, color: color.green },
    { regex: /\`.*?\`/gsi, color: color.naranja },

]
const SQL = [
    { regex: /\b(select|from|where|left|on|between|and|or|is|not|null|as|top|group|order|by|desc|asc|join|right|inner|sum|count|array_agg)\b/gi, color: color.red },
    { regex: /'.*?'/gi, color: color.string },
    { regex: /--.*/gi, color: color.green }
]
const BASH = [
    // Comentarios
    { regex: /#.*/gi, color: color.green },

    // Variables ($VAR, ${VAR})
    { regex: /\$[A-Za-z_][A-Za-z0-9_]*|\$\{.*?\}/g, color: color.naranja },

    // Strings (comillas simples o dobles)
    { regex: /(["'`]).*?\1/g, color: color.string },

    // Palabras clave de bash
    { regex: /\b(if|then|else|elif|fi|for|in|do|done|while|until|case|esac|function|select|time|coproc)\b/g, color: color.red },

    // Comandos comunes (puedes ir agregando más)
    { regex: /\b(echo|cd|ls|cat|grep|find|chmod|chown|pwd|exit|kill|ps|top|history|clear)\b/g, color: color.blue },
]
const JS = [
    // Comentarios de línea y bloque
    { regex: /\/\/.*/g, color: color.green },
    { regex: /\/\*[\s\S]*?\*\//g, color: color.green },

    // Strings (comillas simples, dobles o backticks)
    { regex: /(["'`]).*?\1/g, color: color.string },

    // Palabras clave
    { regex: /\b(const|let|var|if|else|for|while|do|switch|case|break|continue|return|function|class|extends|new|try|catch|finally|throw|import|from|export|default|async|await|yield|in|of|instanceof|typeof|delete|void|this|super)\b/g, color: color.rosa },

    // Booleanos y null/undefined
    { regex: /\b(true|false|null|undefined|NaN|Infinity)\b/g, color: color.naranja },

    // Números
    { regex: /\b\d+(\.\d+)?\b/g, color: color.blue },

    // Objetos globales / funciones comunes
    { regex: /\b(console|window|document|Array|Object|String|Number|Boolean|Math|Date|RegExp|JSON|Promise|Set|Map)\b/g, color: color.blue },
]
const TEXT= [
    // Comentarios de línea y bloque
    // { regex: /\/\/.*/g, color: color. },
   
]


export default {
    TEXT,
    SQL,
    MD,
    BASH,
    JS
}


