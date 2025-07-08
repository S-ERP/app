import React, { Component, useState } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, { useAnimatedReaction, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { connect } from 'react-redux';
import { SButtom, SHr, SIcon, SImage, SPage, SSPiner, SText, SView } from 'servisofts-component';
import { Slider } from '../Components/RangeSlider';
import { Svg } from 'react-native-svg';
import SSocket from 'servisofts-socket';
import MDL from '../MDL';
import InputFoto from '../Components/InputFoto';
// import BarcodeScanner from '../Components/BarcodeScanner';


const calculateTransformationMatrix = (p1, p2, p3, p4) => {
    // Calcular las longitudes de los lados
    const width = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    const height = Math.sqrt(Math.pow(p4.x - p1.x, 2) + Math.pow(p4.y - p1.y, 2));

    // Calcular ángulo de rotación
    const angleRad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const angle = angleRad * (180 / Math.PI); // Convertir a grados si se desea

    // Calcular la matriz de transformación
    const transformMatrix = [
        Math.cos(angleRad), -Math.sin(angleRad), // Escala y rotación en el eje X
        Math.sin(angleRad), Math.cos(angleRad),  // Escala y rotación en el eje Y
        p1.x, p1.y  // Traslación en X y Y (posición del punto P1)
    ];

    return { transformMatrix, width, height };
};


export const SlideValue = ({ animatedValue, label, maxValue = 100, minValue = -100, step = 0.1 }) => {
    const [value, setValue] = useState(animatedValue.value)
    return <SView row padding={4}>
        <SText width={100}>{label}</SText>
        <Slider width={300} step={step} maxValue={maxValue} minValue={minValue} initialValue={animatedValue.value}
            onIndexChange={e => {
                setValue(e);
                animatedValue.value = e
            }} />
        <SView width={8} />
        <SText width={60}>{value.toFixed(2)}</SText>
    </SView>
}

const Elemento = () => {
    const translateX = useSharedValue(0)
    const translateY = useSharedValue(0)
    // const translateZ = useSharedValue(0)
    const rotateX = useSharedValue(0)
    const rotateY = useSharedValue(0)
    const rotateZ = useSharedValue(0)
    const scale = useSharedValue(1)
    const perspective = useSharedValue(1)
    const skewX = useSharedValue(0)
    const skewY = useSharedValue(0)

    const transformMatrix = calculateTransformationMatrix(
        { x: 10, y: 10 },
        { x: 200, y: 10 },
        { x: 200, y: 200 },
        { x: 10, y: 250 },
    )
    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: 100,
            height: 100,
            transform: [
                { perspective: perspective.value },
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotateX: `${rotateX.value}rad` },
                { rotateY: `${rotateY.value}rad` },
                { rotateZ: `${rotateZ.value}rad` },
                { scale: scale.value },
                { skewX: `${skewX.value}deg` },
                { skewY: `${skewY.value}deg` },
            ],
        };
    });
    const unGradoEnRadian = 0.0174533;
    return <SView col={"xs-12"} height center>

        <Animated.View style={[{
            width: 200,
            height: 200,
            position: "absolute",
            backgroundColor: "#f9f",
        }, animatedStyle]}>
            <SImage src={"https://drive.servisofts.com/http/texture/ricky.jpeg"} />
        </Animated.View>
        <SView col={"xs-12"} height padding={8}>
            <SlideValue label={"scale"} animatedValue={scale} />
            <SlideValue label={"translateX"} animatedValue={translateX} />
            <SlideValue label={"translateY"} animatedValue={translateY} />
            {/* <SlideValue label={"translateZ"} animatedValue={translateZ} /> */}
            <SlideValue label={"rotateX"} animatedValue={rotateX} minValue={unGradoEnRadian * -60} maxValue={unGradoEnRadian * 60} />
            <SlideValue label={"rotateY"} animatedValue={rotateY} minValue={unGradoEnRadian * -60} maxValue={unGradoEnRadian * 60} />
            <SlideValue label={"rotateZ"} animatedValue={rotateZ} minValue={unGradoEnRadian * -60} maxValue={unGradoEnRadian * 60} />
            <SlideValue label={"skewX"} animatedValue={skewX} minValue={unGradoEnRadian * -60} maxValue={unGradoEnRadian * 60} />
            <SlideValue label={"skewX"} animatedValue={skewY} minValue={unGradoEnRadian * -60} maxValue={unGradoEnRadian * 60} />
            <SlideValue label={"perspective"} animatedValue={perspective} minValue={1} maxValue={1000} />
        </SView>
    </SView>
}

class Test extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        // MDL.qr_reader.addEventListener("read", (e) => {
        //     console.log("QR Code Read:", e);
        // })
    }
    render() {
        return (
            <SPage title={'Test'} center>
                <InputFoto style={{
                    width: 300,
                    height: 300,
                    borderWidth: 1,
                    borderColor: "#f00",
                }} />
            </SPage >
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(Test);