import React, { Component, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, KeyboardTypeOptions, TextInputProps } from 'react-native';
import { SColType, SHr, SInput, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';

const colorGray2 = "#BBBBBB"

type InputProps = {
    label?: string,
    info?: string,
    placeholder?: string,
    col?: any,
    multiline?: boolean,
    disabled?: boolean,
    height?: number | string,
    inputStyle?: TextInputProps["style"],
    onPress?: any,
    keyboardType?: KeyboardTypeOptions,
    onSubmitEditing?: any,
    defaultValue?: any,
    defaultData?: any,
    filter?: any,
    renderValue?: (evt: { value: any, data: any }) => any;
    onChangeText?: (txt: string) => any;
}

const Input = forwardRef((props: InputProps, ref) => {
    const [value, setValue] = useState(props.defaultValue);
    const [data, setData] = useState(props.defaultData ?? {});
    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
        focus: () => {
            if (inputRef.current) inputRef.current.focus();
        },
        getValue: () => {
            return value;
        },
        setValue: (e: any) => {
            setValue(e)
        },
        getData: () => {
            return data;
        },
        setData: (e: any) => {
            setData(e)
        },
    }));
    return <SView col={props.col}>
        {props.label && <>
            <SText fontSize={10} font={"Montserrat-Bold"} color={STheme.color.text}>{props.label}</SText>
            <SHr h={3} />
        </>}
        <SView style={{
            width: "100%",
            height: props.height ?? 34,
        }} onPress={props.onPress}>
            <TextInput
                ref={inputRef}
                onChangeText={(e) => {
                    if (props.filter) e = props.filter(e);
                    setValue(e)
                    if (props.onChangeText) props.onChangeText(e);
                }}
                value={props.renderValue ? props.renderValue({ data: data, value: value }) : value}
                style={[{
                    width: "100%",
                    height: props.height ?? 34,
                    borderRadius: 5,
                    borderWidth: 0.5,
                    color: STheme.color.text,
                    borderColor: "#CCC",
                    backgroundColor: STheme.color.card,
                    padding: 0,
                    paddingStart: 8,
                    fontFamily: "Montserrat",
                    textAlignVertical: "center",
                    fontSize: 10,
                }, props.inputStyle ?? {}]}
                keyboardType={props.keyboardType ?? "default"}
                multiline={props.multiline}
                onSubmitEditing={props.onSubmitEditing}
                placeholderTextColor={colorGray2}
                editable={!props.onPress && !props.disabled}
                placeholder={props.placeholder} />
        </SView>
        <SText fontSize={6.5} font={"Montserrat-SemiBold"} color={colorGray2}>{props.info}</SText>
    </SView>
})

export default Input;



export const InputValidator = (props: { data: any, keys: string[] }) => {
    const faltantes: string[] = [];
    props.keys.map((k) => {
        if (!props.data[k]) faltantes.push(k);
    })
    return faltantes;
}