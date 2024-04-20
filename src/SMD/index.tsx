import React, { Component } from 'react';
import { View, Text, TextStyle, Linking, Image, TouchableOpacity } from 'react-native';
import ScaledImage from './ScaledImage';
import { STheme } from 'servisofts-component';
import Code from './Code';


type SMDPropsType = {
    children?: any,
    fontSize: number,
    fontFamily: any,
    textColor: string,
    colorCard: string,
    colorGray: string,
    colorLink: string,
    padding?: number,
    space?: number,

}

export default class SMD extends Component<SMDPropsType> {

    static defaultProps = {
        fontSize: 16,
        textColor: "#fff",
        fontFamily: "OpenSans-Regular",
        // fontFamily: "Roboto-Regular",
        colorGray: "#AAAAAA",
        colorCard: "#66666644",
        colorLink: "#70A6F6",
        padding: 16,
        space: 8,
    }

    type: any;
    state: any = {};

    buildWord(word: string, style: TextStyle = {}) {
        return <Text style={style}>{word}</Text>
    }
    buildLink(word: string, style: TextStyle = {}) {
        var label = word;
        let regex = new RegExp(/\[(.*)\]\((.*)\)/g);

        let match: any = regex.exec(word);
        // console.log(word, match)
        return <Text onPress={() => { Linking.openURL(match[2]) }} style={{ ...style, color: this.props.colorLink }}>{match[1]}</Text>
    }
    buildLinkSimply(word: string, style: TextStyle = {}) {
        var label = word;
        let regex = new RegExp(/\<(.*?)\>/g);

        let match: any = regex.exec(word);
        // console.log(word, match)
        return <Text onPress={() => { Linking.openURL(match[1]) }} style={{ ...style, color: this.props.colorLink }}>{match[1]}</Text>
    }
    buildImage(word: string, style: TextStyle = {}) {
        var label = word;
        let regex = new RegExp(/!\[(.*)\]\((.*)\)/g);
        let match: any = regex.exec(word);
        // console.log("Pintando image", this.state.layout.width)
        return <ScaledImage alt={match[1]}
            width={this.state.layout.width > 500 ? 500 : this.state.layout.width}
            style={{
                resizeMode: "contain"
            }}
            src={match[2]}
        />
    }
    buildLine(line: string, style: TextStyle = {}) {
        let match;
        let ELEMENTS: any = [];
        let RegForParms = new RegExp(/\$\{(.*?)\}/g);
        // Alert
        let reg = new RegExp(/`(.*?)`/g);
        while ((match = reg.exec(line)) !== null) {
            let text = match[1];
            if (RegForParms.test(text)) break;
            let nstyle = { ...style }
            nstyle.backgroundColor = this.props.colorGray + "77";
            nstyle.borderRadius = 4;
            nstyle.overflow = "hidden";
            nstyle.borderWidth = 1;
            ELEMENTS.push(this.buildWord(" " + text + " ", { ...nstyle }))
            line = line.substring(0, match.index) + `\${${ELEMENTS.length - 1}}` + line.substring(match.index + match[0].length, line.length)
        }
        reg = new RegExp(/\*\*\*(.*?)\*\*\*/g);
        while ((match = reg.exec(line)) !== null) {

            let text = match[1];
            if (RegForParms.test(text)) break;
            let nstyle = { ...style }
            nstyle.fontWeight = "bold";
            nstyle.fontStyle = "italic";
            ELEMENTS.push(this.buildWord(text, { ...nstyle }))
            line = line.substring(0, match.index) + `\${${ELEMENTS.length - 1}}` + line.substring(match.index + match[0].length, line.length)
        }
        reg = new RegExp(/\*\*(.*?)\*\*/g);
        while ((match = reg.exec(line)) !== null) {

            let text = match[1];
            if (RegForParms.test(text)) break;
            // if (text.match(//))
            let nstyle = { ...style }
            nstyle.fontWeight = "bold";
            // nstyle.fontStyle = "italic";
            ELEMENTS.push(this.buildWord(text, { ...nstyle }))
            line = line.substring(0, match.index) + `\${${ELEMENTS.length - 1}}` + line.substring(match.index + match[0].length, line.length)
        }

        reg = new RegExp(/\*(.*?)\*/g);
        while ((match = reg.exec(line)) !== null) {

            let text = match[1];
            if (RegForParms.test(text)) break;
            let nstyle = { ...style }
            // nstyle.fontWeight = "bold";
            nstyle.fontStyle = "italic";
            ELEMENTS.push(this.buildWord(text, { ...nstyle }))
            line = line.substring(0, match.index) + `\${${ELEMENTS.length - 1}}` + line.substring(match.index + match[0].length, line.length)
        }

        reg = new RegExp(/\[(.*?)\]\((.*?)\)/);
        while ((match = reg.exec(line)) !== null) {
            let text = match[0];
            if (RegForParms.test(text)) break;
            // console.log(match)
            let nstyle = { ...style }
            ELEMENTS.push(this.buildLink(text, { ...nstyle }))
            line = line.substring(0, match.index) + `\${${ELEMENTS.length - 1}}` + line.substring(match.index + match[0].length, line.length)
        }
        reg = new RegExp(/\<(.*?)\>/);
        while ((match = reg.exec(line)) !== null) {
            let text = match[0];
            if (RegForParms.test(text)) break;
            // console.log(match)
            let nstyle = { ...style }
            ELEMENTS.push(this.buildLinkSimply(text, { ...nstyle }))
            line = line.substring(0, match.index) + `\${${ELEMENTS.length - 1}}` + line.substring(match.index + match[0].length, line.length)
        }
        // if (line.match(/^\[.*\]\(.*\)/)) {//     [alt](url)
        //     let regex = new RegExp(/\[(.*)\]\((.*)\)/g);
        //     ELEMENTS.push(this.buildLink(line, { ...style }))
        //     continue;
        // }

        let NEWELEMENTS:any = []
        let lastIndex = 0;
        while ((match = RegForParms.exec(line)) !== null) {
            NEWELEMENTS.push(this.buildWord(line.substring(lastIndex, match.index), { ...style }))
            NEWELEMENTS.push(ELEMENTS[match[1]])
            lastIndex = match.index + match[0].length;
        }
        NEWELEMENTS.push(this.buildWord(line.substring(lastIndex, line.length), { ...style }))
        return <Text style={{ ...style }}>{NEWELEMENTS}</Text>
    }
    buildSubtitle(line: string, style: TextStyle = {}) {
        let resp: any = line.match(/^(#{1,5})\s(.*)/);
        let hsize = resp[1].length;
        let size = 12;
        switch (hsize) {
            case 1: size = Math.round(this.props.fontSize * 2.2); break;
            case 2: size = Math.round(this.props.fontSize * 1.7); break;
            case 3: size = Math.round(this.props.fontSize * 1.3); break;
            case 4: size = Math.round(this.props.fontSize * 1.1); break;
            case 5: size = Math.round(this.props.fontSize * 0.9); break;
        }
        return <>
            {this.buildLine(resp[2], { ...style, fontSize: size, fontWeight: "600" })}
            <View style={{ borderTopWidth: hsize < 3 ? 1 : 0, height: size / 2, borderColor: "#666", width: "100%" }}></View>
        </>
    }
    buildBlockquote(line: string, style: TextStyle = {}) {
        // line = line.replace(">", "").trim();
        return <View style={{
            width: "100%",
            // backgroundColor: this.props.colorCard,
            padding: 4,
            borderLeftWidth: 6,
            borderColor: this.props.colorCard,
            paddingStart: this.props.fontSize,
            borderRadius: 4,
        }}>{this.buildLine(line, { ...style, color: this.props.colorGray })}</View>
    }
    buildList(line: string, style: TextStyle = {}) {
        // line = line.replace(/^\d\./, "").trim();
        return <>
            <View style={{
                width: "100%",
                padding: 4,
                borderColor: this.props.colorCard,
                paddingStart: this.props.fontSize * 2,
                borderRadius: 4,
            }}>
                {this.buildLine(line, { ...style })}
            </View>
        </>
    }
    buildCode(line: string, style: TextStyle = {}, type: string) {
        return <View style={{
            width: "100%",
            backgroundColor: this.props.colorCard,
            padding: 4,
            paddingTop: 16,
            paddingBottom: 16,
            borderColor: this.props.colorCard,
            paddingStart: this.props.fontSize + 6,
            borderRadius: 4,
        }}>
            <Code style={{ ...style }} type={type}>{line}</Code>
            <TouchableOpacity style={{
                position: "absolute",
                top: 4,
                right: 4,
                padding: 4,
                borderRadius: 4,
                alignItems: "center",
                backgroundColor: this.props.colorCard
            }}>{this.buildWord(type, { ...style })}</TouchableOpacity>
        </View>
    }
    buildTable(line: string, style: TextStyle = {}) {
        let arr = line.split(/\n/g).filter(a => !!a)
        if (arr.length > 2) {
            let headers = arr[0].split(/\|/).filter(a => !!a)
            let separator = arr[1].split(/\|/).filter(a => !!a)
            if (headers.length == separator.length) {
                // console.log(headers, separator)
                return arr.map((line, i) => {
                    const wr = 100;
                    let data = line.split(/\|/).filter(a => !!a)
                    if (i == 0) return <View style={{
                        width: headers.length * wr,
                        justifyContent: "center", flexDirection: "row"
                    }}>
                        {headers.map((h, j) => {
                            return <View style={{
                                width: wr, borderWidth: 1,
                                borderColor: this.props.colorCard,
                                padding: 4,
                                alignItems: "center"

                            }}>{this.buildWord(data[i], { ...style, fontWeight: "bold", fontSize: this.props.fontSize * 1.1 })}</View>
                        })}
                    </View>;

                    // if (i == 1) return <View style={{
                    //     width: headers.length * wr ,
                    //     justifyContent: "center",
                    // }}>
                    //     <View style={{ width: "100%", height: 1, backgroundColor: this.props.textColor }} />
                    // </View>;
                    if (i == 1) return null;
                    return <View style={{ width: headers.length * wr, flexDirection: "row" }}>
                        {headers.map((h, j) => {
                            return <View style={{
                                width: wr, justifyContent: "center",
                                // borderBottomWidth: 1,
                                backgroundColor: i % 2 != 0 ? this.props.colorCard : "",
                                borderWidth: 1,
                                borderColor: this.props.colorCard,
                                padding: 4
                            }}>
                                {this.buildWord(data[j], { ...style })}
                            </View>
                        })}
                    </View>
                })
            }

        }
        return this.buildWord(line, { ...style })
    }
    renderText(text: string, style: TextStyle = {}) {
        if (!text) return null;
        text = text.trim() + `\n\n`;
        let regexForNextLine = new RegExp(/(.*)?\n/g);
        let match;
        let ELEMENTS: any = [];
        let lastIndex = 0;
        let lineTemp = "";
        let esperarTerminar: any = null;
        while ((match = regexForNextLine.exec(text)) !== null) {
            let line = match[0].trim();
            if (esperarTerminar) {
                if (!!esperarTerminar(match, lineTemp)) {
                    lineTemp = "";
                    esperarTerminar = null;
                }
                continue;
            }
            if (line.match(/^#{1,5}\s/)) { //               # title
                ELEMENTS.push(this.buildSubtitle(line, { ...style }))
                continue;
            } else if (line.match(/^>/)) { //               > block
                lineTemp = line;
                esperarTerminar = (m: any, text: any) => {
                    if (m[0] == "\n") {
                        text = text.replace(">", "")
                        ELEMENTS.push(this.buildBlockquote(text.trim(), { ...style }))
                        return true;
                    } else {
                        lineTemp += m[0].replace(">", "");
                    }
                    return false;
                }
                continue;

            } else if (line.match(/^\d\.\s|^[-*+]\s/)) { //     1.list | - list 
                lineTemp = match[0];
                esperarTerminar = (m: any, text: any) => {
                    if (m[0] == "\n") {
                        text = text.replace(">", "")
                        ELEMENTS.push(this.buildList(text.trim(), { ...style }))
                        return true;
                    } else {
                        lineTemp += m[0].replace(">", "");
                    }
                    return false;
                }
                continue;
            } else if (line.match(/^\|.*/)) { //     Table
                lineTemp = match[0];
                esperarTerminar = (m: any, text: any) => {
                    if (m[0] == "\n") {
                        ELEMENTS.push(this.buildTable(text, { ...style }))
                        return true;
                    } else {
                        lineTemp += m[0]
                    }
                    return false;
                }
                continue;
            } else if (line.match(/^!\[.*\]\(.*\)/)) { //   ![alt](image) 
                ELEMENTS.push(this.buildImage(line, { ...style }))
                continue;
            } else if (line.match(/^[-*_]{3,}/)) { //           --- Line 
                ELEMENTS.push(<View style={{ height: 2, justifyContent: "center", width: "100%" }}>
                    <View style={{ height: 1, backgroundColor: "#666", width: "100%" }}></View>
                </View>)
                continue;
            } else if (line.match(/^```(.*)/)) { //         ```{type}\n{CODE} \n```
                lineTemp = "";
                this.type = line.match(/^```(.*)/)?.[1];
                esperarTerminar = (m: any, text: any) => {
                    lineTemp += m[0];
                    if (m[0].match(/^```\n/)) {
                        ELEMENTS.push(this.buildCode(text, { ...style, fontFamily:"Cascadia" }, this.type))
                        return true;
                    }
                    return false;
                }
                continue;
                // ELEMENTS.push(this.b
            } else { //                                     Other
                if (match[0] == "\n") continue;
                ELEMENTS.push(this.buildLine(line, { ...style }))
            }
        }
        return ELEMENTS.map((ELM: any) => <>
            <View style={{ height: this.props.space }} />
            {ELM}
            <View style={{ height: this.props.space }} />
        </>);

    }

    render() {
        const padding = this.props.padding ?? 0;
        return <View style={{
            padding: padding,
            width: "100%",
        }} onLayout={(e: any) => {
            e.nativeEvent.layout.width -= padding * 2;
            this.setState({ layout: e.nativeEvent.layout })
        }}>
            {!this.state.layout ? null : this.renderText(this.props.children, { color: this.props.textColor, fontSize: this.props.fontSize, fontFamily: this.props.fontFamily })}
        </View>
    }
}
