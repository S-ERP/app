
import React, { Component } from 'react';
import { Platform, ScrollView, ScrollViewProps } from "react-native"
import { ScrollView as ScrollViewGesture } from 'react-native-gesture-handler';

type ScrollViewHandlePropsType = {
    children: any,
} & ScrollViewProps
const ScrollViewHandle = (props: ScrollViewHandlePropsType) => {

    const Scroll: any = Platform.select<any>({
        android: ScrollViewGesture,
        ios: ScrollViewGesture,
        default: ScrollView
    })
    return <Scroll {...props}>
        {props.children}
    </Scroll>
}
export default ScrollViewHandle;