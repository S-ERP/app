import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { SText, STheme, SView } from 'servisofts-component';

interface componentNameProps { children?: any, onPress?: (e: any) => void }

const BtnNaranja = (props: componentNameProps) => {
    return (
        <SView style={[styles.container, { backgroundColor: STheme.color.primary }]} onPress={props.onPress} center>
            {typeof props.children != "string" ? props.children : < SText fontSize={12} font='Montserrat' color={"#fff"}>{props.children}</SText>}
        </SView >
    );
};

export default BtnNaranja;

const styles = StyleSheet.create({
    container: {
        width: 180,
        height: 25,
        borderRadius: 100,

    }
});
