// @ts-nocheck
import { Text, View, TextInput, ScrollView, KeyboardAvoidingView, Platform, TextStyle, ViewStyle } from 'react-native'
import React, { Component } from 'react'
import { SList, SStorage, SText, STheme, SThread, SView } from 'servisofts-component'
import ReservedWords from './ReservedWords';
export type TextAreaTypes = keyof typeof ReservedWords;
export type TextAreaProps = {
    pk?: string,
    defaultValue?: string,
    type: TextAreaTypes,
    onChangeText?: (text: string) => void,
    title?: string,
    style?: ViewStyle
}
export default class TextArea extends React.Component<TextAreaProps> {
    inp;
    state;
    scrollViewVertical;
    scrollViewHorizontal;
    constructor(props) {
        super(props)
        this.state = {
            height: 0,
            // value: "abcdefghijklmnopqrstuvwxyz\nABCDEFGHIJKLMNOPQRSTUVWXYZ",
            value: props.defaultValue ?? "",
            event: "",
            selection: { start: 1, end: 1 }
        }
    }





    handleKey = (e) => {
        if (this.props.onKeyPress) {
            this.props.onKeyPress(e);
        }
        this.handleKey_comment(e);


    }
    handleKey_comment(e) {
        if ((e.which || e.keyCode) === 191) {
            if (e.metaKey) {
                e.preventDefault();
                const li = this.state.value.lastIndexOf("\n", this.state.selection.start - 1)
                const comentp = this.state.value.indexOf("--", li);
                if (comentp >= 0) {
                    const newWord = this.state.value.substring(0, comentp) + this.state.value.substring(comentp + 2, this.state.value.length)
                    this.state.event = "comment";
                    this.state.selection.start = this.state.selection.start - 2;
                    this.state.selection.end = this.state.selection.end - 2;
                    this.handleOnChangeText(newWord)
                } else {
                    const newWord = this.state.value.substring(0, li + 1) + "--" + this.state.value.substring(li + 1, this.state.value.length)
                    this.state.event = "comment";
                    this.state.selection.start = this.state.selection.start + 2;
                    this.state.selection.end = this.state.selection.end + 2;
                    this.handleOnChangeText(newWord)
                }
                new SThread(2, "sad", true).start(() => {
                    this.inp.selectionStart = this.state.selection.start;
                    this.inp.selectionEnd = this.state.selection.end;
                })

            }
            // this.execute();
        }
    }
    componentDidMount() {
        if (this.props.pk) {
            SStorage.getItem("sql_tap_" + this.props.pk, (val) => {
                this.setState({ value: val ?? "" })
            })
        }
        if (Platform.OS == "web") {
            window.addEventListener('keydown', this.handleKey);
        }
    }
    componentWillUnmount() {
        if (Platform.OS == "web") {
            window.removeEventListener('keydown', this.handleKey);
        }
    }
    getValue() {
        return this.state.value;
    }
    getValueSelect() {
        console.log(this.state.selection)
        if (!this.state?.selection?.start && !this.state?.selection?.end) return this.state.value;
        if (this.state?.selection?.start == this.state?.selection?.end) return this.state.value;
        return this.state.value.substring(this.state.selection.start, this.state.selection.end);
    }
    preventDefault(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    handleOnKeyPress_Tab = (e) => {
        this.preventDefault(e);

        const tapSpaces = 1;
        // e.preventDefault();  

        if (this.state.selection.start == this.state.selection.end) {
            if (this.state.selection.start == this.state.value.length) {
                this.handleOnChangeText(this.state.value + "\t")
                return;
            }

            let start = this.state.value.substring(0, this.state.selection.start)
            let end = this.state.value.substring(this.state.selection.start, this.state.value.length)
            this.state.selection.start = this.state.selection.start + tapSpaces;
            this.state.selection.end = this.state.selection.end + tapSpaces;
            this.state.event = "tab"
            this.handleOnChangeText(start + "\t" + end)

        } else {
            // this.handleOnChangeText(this.state.value + "\t")
        }
        new SThread(10, "sad", true).start(() => {
            this.inp.selectionStart = this.state.selection.start;
            this.inp.selectionEnd = this.state.selection.end;
        })

    }

    handleOnKeyPress_ArrowDown = (e) => {
        if (e.nativeEvent.shiftKey && e.nativeEvent.altKey) {
            this.preventDefault(e);
            let position_line_start = this.state.value.lastIndexOf("\n", this.state.selection.start - 1);
            let position_line_end = this.state.value.indexOf("\n", this.state.selection.end);
            let row = ""
            if (position_line_start < 0) {
                position_line_start = 0
            }
            if (position_line_end < 0) {
                position_line_end = this.state.value.length
            }
            row = this.state.value.substring(position_line_start, position_line_end);
            if (row.indexOf("\n") < 0) {
                row = "\n" + row;
            }
            if (!row.startsWith("\n")) {
                row = "\n" + row;
            }
            let value = this.state.value.substring(0, position_line_end) + row + this.state.value.substring(position_line_end, this.state.value.length)
            let saveSelect = { ...this.state.selection }
            saveSelect.start += row.length
            saveSelect.end += row.length
            this.handleOnChangeText(value)
            new SThread(2, "sadas", true).start(() => {
                this.state.selection = saveSelect
                this.inp.selectionStart = this.state.selection.start;
                this.inp.selectionEnd = this.state.selection.end;
            })
            // console.log(this.state.selection)
            console.log("clonar la posicion: ", row);
        }
    }
    handleOnKeyPress = (e) => {
        let key = e.nativeEvent.key;
        this.handleKey(e);
        switch (key) {
            case "Tab":
                this.handleOnKeyPress_Tab(e);
                break;
            case "ArrowDown":
                this.handleOnKeyPress_ArrowDown(e);
                break;
        }

    }
    handleOnChangeText = (text) => {
        this.state.value = text;
        this.setState({ value: this.state.value })
        if (this.props.onChangeText) {
            this.props.onChangeText(text);
        }
        new SThread(500, "sad", true).start(() => {
            console.log("fuardo el elmento")
            if (!this.props.pk) return;
            SStorage.setItem("sql_tap_" + this.props.pk, this.state.value)
        })


    }
    generarColorAleatorio() {
        const letras = '0123456789ABCDEF';
        let color = '#';

        for (let i = 0; i < 6; i++) {
            color += letras[Math.floor(Math.random() * 16)];
        }

        return color;
    }

    buildWords(style) {

        // console.log(mayusc)

        let palabrasReservadasValue = ReservedWords[this.props.type ?? "SQL"];
        // let palabrasReservadas = Object.keys(palabrasReservadasValue);

        let wordMatch = []
        palabrasReservadasValue.forEach((palabra) => {
            let regex = palabra.regex
            let match;
            while ((match = regex.exec(this.state.value)) !== null) {
                console.log(match)
                let wordReserved = {
                    word: match[0],
                    indexStart: match.index,
                    indexEnd: match.index + match[0].length,
                    color: palabra.color
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
        let ARRAY = [];
        wordMatch.sort((a, b) => a.indexStart - b.indexStart).map(a => {
            if (index > a.indexStart) return;
            ARRAY.push(this.state.value.substring(index, a.indexStart))
            ARRAY.push(<Text style={[style, { color: a.color }]}>{a.word}</Text>)
            index = a.indexEnd;
        })
        ARRAY.push(this.state.value.substring(index, this.state.value.length))
        return <Text style={[style]}>{ARRAY}</Text>
    }
    render() {
        let textStyle: TextStyle = {
            fontSize: 12,
            lineHeight: 18,
            fontFamily: "Cascadia",
            font: "Cascadia",
            // caretColor: STheme.color.text,
            color: STheme.color.text,
            // fontWeight: 700,
            caretColor: "#d0eefeff",
            color: "#d0eefeff",
            padding: 0,
            margin: 0,

        }
        let style = {
            borderWidth: 0,
            overflow: "hidden",
            outline: "none",
            ...textStyle
        }
        return (
            <SView col={"xs-12"} flex backgroundColor='#171717' onLayout={e => {
                this.state.layout = e.nativeEvent.layout
                this.setState({ ...this.state })
            }}>
                <KeyboardAvoidingView
                    // keyboardVerticalOffset={20}
                    keyboardVerticalOffset={Platform.select({ ios: 50, android: 20 })}
                    enabled
                    behavior={Platform.OS === "ios" ? "padding" : null}
                    style={{ flex: 1 }}
                >
                    <ScrollView style={{ flex: 1, height: "100%" }}
                        ref={ref => this.scrollViewVertical = ref}
                        contentContainerStyle={{
                            minHeight: "100%"
                        }}
                        onContentSizeChange={() => {
                            // this.scrollViewVertical.scrollToEnd({ animated: false })
                        }}
                    >
                        <SView col={"xs-12"} row flex >
                            <SView width={10} ></SView>
                            <SView width={30} >
                                <SList space={0}
                                    scrollEnabled={false}
                                    data={this.state.value.split("\n")} render={(o, k, i) => <Text style={{
                                        ...textStyle,
                                        color: "#666",
                                        fontSize: textStyle.fontSize - 2,

                                    }}>{((i + 1) + "").padStart(4, " ")}</Text>} />
                            </SView>
                            <SView width={20} style={{
                                borderRightWidth: 1,
                                borderColor: STheme.color.card,
                            }} ></SView>
                            <SView width={2} style={{}} ></SView>
                            <SView flex height={"100%"} >
                                <ScrollView horizontal
                                    ref={ref => this.scrollViewHorizontal = ref}
                                    style={{
                                        flex: 1
                                    }} >
                                    <SView row style={{
                                        width: Math.max(500, (this.state?.layout?.width ?? 100) - 80),
                                        // width: 3000,
                                        height: Math.max(parseFloat(this.state?.height ?? 0), this.state?.layout?.height ?? 100),
                                    }}>
                                        <View style={{ position: "absolute", top: 0, right: 0, width: "100%", height: "100%" }} >
                                            <TextInput
                                                ref={ref => this.inp = ref}
                                                value={this.state.value}
                                                onLayout={(evt) => {
                                                    // console.log(evt);/
                                                }}
                                                cursorColor={"#000000"}
                                                // allowFontScaling={false}
                                                scrollEnabled={false}
                                                style={{
                                                    ...style,
                                                    paddingTop: 0,//No quitar son para IOS
                                                    marginTop: 0,//No quitar son para IOS
                                                    padding: 0,
                                                    margin: 0,
                                                    width: "100%",
                                                    height: "100%",
                                                    // color: "#ffffff",
                                                }}
                                                autoCorrect={false}
                                                autoFocus
                                                multiline={true}
                                                rows={1000}
                                                onKeyPress={this.handleOnKeyPress.bind(this)}
                                                onChangeText={this.handleOnChangeText.bind(this)}
                                                onFocus={(evt) => {
                                                    // this.scrollViewVertical.scrollTo({ x: 0, y: 0, animated: false })
                                                }}
                                                onSubmitEditing={e => {

                                                }}
                                                onContentSizeChange={(event) => {
                                                    this.state.width = event.nativeEvent.contentSize.width;
                                                    if (this.state.height != event.nativeEvent.contentSize.height) {
                                                        this.state.height = event.nativeEvent.contentSize.height;
                                                        this.setState({ ...this.state })

                                                    }
                                                }}
                                                onSelectionChange={(e) => {
                                                    if (this.state.event == "tab" || this.state.event == "comment") {
                                                        this.state.event = "onSelectionChange";
                                                        // this.setState({ ...this.state })
                                                        return;
                                                    }
                                                    this.state.selection = e.nativeEvent.selection;
                                                    // this.setState({ selection:this.state.se })

                                                }}
                                            />

                                        </View>

                                        <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", width: "100%", }} >
                                            {this.buildWords(textStyle)}
                                        </View>
                                    </SView>
                                </ScrollView>
                            </SView>
                        </SView>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SView>
        )

    }
}
