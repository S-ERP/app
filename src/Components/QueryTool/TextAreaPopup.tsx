import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SPopup, SText, STheme, SView } from 'servisofts-component';
import SIconApp from '../../Assets/SIconApp';
import TextArea, { TextAreaProps } from './TextArea';

export default class TextAreaPopup extends Component<TextAreaProps> {

    static open(props: TextAreaProps) {
        SPopup.open({
            key: "popupTextArea",
            type: "2",
            content: <TextAreaPopup {...props} />
        })
    }


    render() {
        return <SView style={{
            width: "100%",
            height: "100%",
        }} height={"100%"} padding={16}>
            <SView col={"xs-12"} height={"100%"} style={{
                borderRadius: 8,
                backgroundColor: this.props.backgroundColor ?? STheme.color.background,
                overflow: "hidden",
                // padding: 8,
            }} withoutFeedback>
                <SView col={"xs-12"} row height={30} backgroundColor={STheme.color.barColor} center>
                    <SView width={8} />
                    <SText padding={2} color={STheme.color.text}>{this.props.title ?? "Editor"}</SText>
                    <SView flex />
                    <SView width={20} height={20} onPress={() => {
                        SPopup.close("popupTextArea");
                    }}>
                        <SIconApp name='Close' fill={STheme.color.danger} />
                    </SView>
                    <SView width={16} />

                </SView>
                <SView col={"xs-12"} flex>
                    <TextArea
                        {...this.props}
                    />
                </SView>
            </SView>
        </SView>
    }
}
