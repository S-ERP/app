import React from "react"
import { Linking } from "react-native";
import { SText } from "servisofts-component"
export default (props) => {
    const text = props.children;
    if (!text) return null;

    // const urlPattern = /https?:\/\/[\w.-]+(:\d+)?(\/[^\s]*)?/g;
    const urlPattern = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/g;



    let FINALTEXT = [];
    let lasIndex = 0;
    let match;
    while ((match = urlPattern.exec(text)) !== null) {
        let urlVal = match[0];
        FINALTEXT.push(text.substring(lasIndex, match.index))
        FINALTEXT.push(<SText {...props} color={"#1465EE"} underLine onPress={() => {
            if (urlVal.indexOf(":\/\/") <= -1) {
                urlVal = "https://" + urlVal;
            }
            Linking.openURL(urlVal)
        }}>{urlVal}</SText>)
        lasIndex = match.index + urlVal.length
    }
    FINALTEXT.push(text.substring(lasIndex, text.length))
    // const urlsEncontradas = text.match(urlPattern);

    // console.log(urlsEncontradas);
    // const arr = text.split(/\s|\n/);
    // let COMP = arr.map(word => {
    //     const urlPattern = /https?:\/\/([\w.-]+(:\d+)?(\/[^\s]*)?)/;
    //     if (urlPattern.test(word)) {
    //         console.log(word)
    //         return <SText {...props} color={"#00f"}>{word}</SText>
    //     }
    //     return word + " "
    // })

    return <SText {...props}>{FINALTEXT}</SText>
}