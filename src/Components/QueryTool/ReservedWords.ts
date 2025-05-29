const color = {
    red: "#FF0000",
    blue: "#4181BE",
    green: "#699754",
    naranja: "#C27E65",
    string: "#CE9178",
}

export const SQL = {
    "\\b(select|from|where|left|on|between|and|or|is|not|null|as|top|group|order|by|desc|asc|join|right|inner|sum|count|array_agg)\\b": color.red,
    "'.*?'": color.string,
    "--.*": color.green
}

export const MD = {
    "```.*?\`\`\`": color.red,
    "\\s- ": color.blue,
    "\\s\\W> ": color.green,
    "\\d\\. ": color.blue,
    "\\[.*?\\]": color.naranja,
    "\\`.*?\\`": color.naranja,
    "#{1,6}.*?": color.blue,
    "'.*?'": color.string,
    "<!--.*?-->": color.green
}

export const BASH = {
    "\\b(if|then|else|fi|for|in|do|done|while|case|esac|function|select|until|elif)\\b": color.red,
    "\\b(echo|printf|read|cd|ls|cat|touch|mkdir|rm|rmdir|cp|mv|exit|sleep|kill)\\b": color.blue,
    "\\$[a-zA-Z_][a-zA-Z0-9_]*": color.naranja,
    "\".*?\"": color.string,
    "#.*": color.green
}

export default {
    SQL,
    MD,
    BASH
}
