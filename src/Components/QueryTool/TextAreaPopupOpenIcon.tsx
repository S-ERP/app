import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SPopup, SText, STheme, SView } from 'servisofts-component';
import SIconApp from '../../Assets/SIconApp';
import TextArea, { TextAreaProps } from './TextArea';
import TextAreaPopup from './TextAreaPopup';

export default class TextAreaPopupOpenIcon extends Component<TextAreaProps & { getDefaultValue?: () => string }> {


    render() {
        return <SView width={20} height={20} style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            ...(this.props?.style ?? {}),
        }} onPress={() => {
            let value = this.props.defaultValue;
            if (this.props.getDefaultValue) {
                value = this.props.getDefaultValue();
            }

            TextAreaPopup.open({ ...this.props, defaultValue: value });
        }}>
            <SIconApp name='out' fill={STheme.color.text} />
        </SView>
    }
}
