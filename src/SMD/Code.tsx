import React, { Component } from 'react';
import { View, Text, TextStyle, Linking, Image } from 'react-native';



export const SQL = {
    "\\b(select)\\b": "#6F9BD3",
    "\\b(from)\\b": "#6F9BD3",
    "\\b(where)\\b": "#6F9BD3",
    "\\b(left)\\b": "#6F9BD3",
    "\\b(on)\\b": "#6F9BD3",
    "\\b(between)\\b": "#6F9BD3",
    "\\b(and)\\b": "#6F9BD3",
    "\\b(or)\\b": "#6F9BD3",
    "\\b(is)\\b": "#6F9BD3",
    "\\b(not)\\b": "#6F9BD3",
    "\\b(sum)\\b": "#6F9BD3",
    "\\b(count)\\b": "#6F9BD3",
    "\\b(as)\\b": "#6F9BD3",
    "\\b(top)\\b": "#6F9BD3",
    "\\b(group)\\b": "#6F9BD3",
    "\\b(order)\\b": "#6F9BD3",
    "\\b(by)\\b": "#6F9BD3",
    "\\b(desc)\\b": "#6F9BD3",
    "\\b(asc)\\b": "#6F9BD3",
    "\\b(join)\\b": "#6F9BD3",
    "\\b(right)\\b": "#6F9BD3",
    "\\b(inner)\\b": "#6F9BD3",
    "\\b(null)\\b": "#6F9BD3",
    "\\b(array_agg)\\b": "#6F9BD3",
    "('.*?')": "#CE9178",
    "(--.*)": "#699754"
}
export const BASH = {
    "\\b(echo)\\b": "#7CC0A9",
    "('.*?')": "#CE9178",
    "(\".*?\")": "#CE9178",
    "(#.*)": "#699754"
}
export const JAVASCRIPT = {
    "\\b(const)\\b": "#6F9BD3",
    "('.*?')": "#CE9178",
    "(\".*?\")": "#CE9178",
    "(#.*)": "#699754",

}



const types: any = {
    SQL,
    BASH,
    JAVASCRIPT
}
export default class Code extends Component<{ style: TextStyle, children?: any, type: string }> {

    static defaultProps = {

    }


    buildWords(word: string, style: TextStyle) {

        // console.log(mayusc)

        let type: any = this.props.type.toUpperCase();
        console.log(type)
        const ReserverWords: any = types[type] ?? {};
        let palabrasReservadas = Object.keys(ReserverWords);

        let wordMatch: any = []
        palabrasReservadas.forEach((palabra) => {
            let regex = new RegExp(`${palabra}`, 'gmi');
            let match;
            while ((match = regex.exec(word)) !== null) {
                let wordReserved = {
                    word: match[1],
                    indexStart: match.index,
                    indexEnd: match.index + match[1].length,
                    color: ReserverWords[palabra]
                }
                wordMatch.push(wordReserved);
            }
        })
        // });
        // textToRender =textToRender.replace(/select/gi,  )

        // return <SList data={this.state.value.split("\n")} initSpace={0} space={0} render={obj => {
        //     return <Text style={[style, { color: "#f00", }]}>{obj??" "}</Text>
        // }} />
        let index = 0;
        let ARRAY:any = [];
        wordMatch.sort((a: any, b: any) => a.indexStart - b.indexStart).map((a: any) => {
            if (index > a.indexStart) return;
            ARRAY.push(word.substring(index, a.indexStart))
            ARRAY.push(<Text style={[style, { color: a.color }]}>{a.word}</Text>)
            index = a.indexEnd;
        })
        ARRAY.push(word.substring(index, word.length))
        return <Text style={[style]}>{ARRAY}</Text>
    }
    render() {
        return this.buildWords(this.props.children, this.props.style);
    }
}
