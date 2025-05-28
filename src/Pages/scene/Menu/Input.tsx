import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Switch } from 'react-native-gesture-handler';
import { SHr, SInput, SText, STheme, SThread, SView } from 'servisofts-component';
import * as THREE from "three"



const formatValue = (value: number) => {
    return parseFloat((parseFloat((value + "") ?? "0")).toFixed(5))
}
const formatValueString = (value: number) => {
    return ((formatValue(value) ?? 0) + "") ?? "0"
}

const Input = (props: { label: string, defaultValue: any, onChange: (value: any) => void, type: "number" | "boolean" | "color" }) => {
    const ref = React.useRef<SInput>(null);
    const [state, setState] = React.useState({
        value: props.defaultValue
    });

    const TypeSwitch = () => {
        return <Switch value={state.value} onValueChange={e => {
            state.value = e;
            setState({ value: e })
            props.onChange(state.value)
        }} />
    }
    const TypeNumber = () => {
        return <SInput ref={ref} width={100} height={18} style={{
            fontSize: 12,
            padding: 0,
            paddingLeft: 0,
            paddingRight: 0,
            textAlign: "center"
        }}
            defaultValue={formatValueString(state.value)}
            // value={formatValueString(state.value)}
            onChangeText={(e) => {
                if (!ref.current) return;
                if (!e) {
                    e = "";
                }
                e = e.replace(',', '.');
                let signo = "";
                if (e.startsWith('-')) {
                    signo = "-";
                }
                e = e.replace(/[^0-9.]/g, "");
                if (signo) {
                    e = signo + e;
                }
                if (e.startsWith('.')) {
                    e = '0' + e;
                }

                let toValue = 0;
                if (!e || e.length <= 0) {
                    toValue = 0
                } else {
                    if (e == "-") {
                        toValue = 0;
                    } else {
                        toValue = parseFloat(e);
                    }
                }
                if (state.value != toValue) {
                    state.value = toValue;
                    new SThread(500, "sendChange-" + props.label, true).start(() => {
                        console.log("Entro aca y envio", state.value)
                        props.onChange(state.value)
                    })
                }


                return e;
                // ref.current.setValue(parseFloat(e ?? 0));
            }}
            onKeyPress={e => {
                if (!ref.current) return;
                const streng = 0.01;
                let num;
                switch (e.nativeEvent.key) {
                    case "ArrowUp":
                        num = (state.value ?? 0) + streng;
                        state.value = num;
                        ref.current.setValue(formatValueString(num));
                        props.onChange(state.value)
                        break;
                    case "ArrowDown":
                        num = (state.value ?? 0) - streng;
                        state.value = num;
                        ref.current.setValue(formatValueString(num));
                        props.onChange(state.value)
                        break;
                }
            }} />
    }
    const TypeColor = () => {
        return <SInput ref={ref} type='color' width={100} height={18} style={{
            fontSize: 12,
            padding: 0,
            paddingLeft: 0,
            paddingRight: 0,
            textAlign: "center"
        }}
            defaultValue={state.value}
            // value={formatValueString(state.value)}
            onChangeText={(e) => {
                if (!ref.current) return;
                if (!e) {
                    e = "";
                }
                // e = e.replace(',', '.');
                // let signo = "";
                // if (e.startsWith('-')) {
                //     signo = "-";
                // }
                // e = e.replace(/[^0-9.]/g, "");
                // if (signo) {
                //     e = signo + e;
                // }
                // if (e.startsWith('.')) {
                //     e = '0' + e;
                // }

                let toValue = e;
                // if (!e || e.length <= 0) {
                //     toValue = 0
                // } else {
                //     if (e == "-") {
                //         toValue = 0;
                //     } else {
                //         toValue = parseFloat(e);
                //     }
                // }
                if (state.value != toValue) {
                    state.value = toValue;
                    new SThread(500, "sendChange-" + props.label, true).start(() => {
                        console.log("Entro aca y envio", state.value)
                        props.onChange(state.value)
                    })
                }


                return e;
                // ref.current.setValue(parseFloat(e ?? 0));
            }} />
    }
    return <SView col={"xs-12"} row style={{
        padding: 1
    }}>
        <SView width={80} style={{
            alignItems: "flex-end",
            justifyContent: "center"
        }}>
            <SText fontSize={12}>{props.label}</SText>
        </SView>
        <SView width={8} />
        <SView flex>
            {props.type == "number" ? <TypeNumber /> : null}
            {props.type == "boolean" ? <TypeSwitch /> : null}
            {props.type == "color" ? <TypeColor /> : null}

        </SView>
    </SView>
}

export default Input;