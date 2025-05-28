import * as React from 'react';
import { useRef, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SInput, SSwitch, SText, STheme, SView } from 'servisofts-component';
import * as THREE from 'three';
import DraggableBox from './DraggableBox';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

interface ShaderEditorProps {
    material: THREE.Material
}

const renderTypeInput = (value: any, onChange: (e: any) => void) => {
    if (typeof value == "boolean") return <SSwitch defaultValue={value} size={10} onChange={onChange} />
    return <SInput customStyle={"clean"} defaultValue={value} style={{
        fontSize: 11,
        backgroundColor: STheme.color.card,
        textAlign: "right"
    }} onChangeText={onChange} />
}
const NodeMaterial = ({ material, width, height }: { material: THREE.Material, width: number, height: number }) => {

    console.log(material)
    return <>
        <DraggableBox x={1024} y={1024} boxWidth={250} boxHeight={600} width={width} height={height} >
            <ScrollView>
                {Object.keys(material).filter(a => !["uuid", "isMaterial",].includes(a)).map((_key) => {
                    const key = _key as keyof THREE.Material
                    const value = material[key]
                    if (typeof value == "object") return;
                    return <SView row padding={2} center>
                        <SView width={4} />
                        <SView style={{ width: 5, height: 5, borderRadius: 100, backgroundColor: "#666" }} />
                        <SView width={6} />
                        <SText color={STheme.color.lightGray} fontSize={11}>{key}</SText>
                        <SView width={8} />
                        {/* <SText fontSize={10} color={STheme.color.lightGray}>{!value ? "null" : typeof value}</SText> */}
                        {/* <SView width={8} /> */}
                        <SView flex>
                            {renderTypeInput(value, (e) => {
                                const mat: any = material;
                                mat[key] = e;
                            })}
                        </SView>
                        <SView width={4} />
                        {/* <SText fontSize={10} row flex color={STheme.color.lightGray}>{value + ""}</SText> */}
                    </SView>
                })}
            </ScrollView>
        </DraggableBox>
        {Object.keys(material).filter(a => !["uuid", "isMaterial",].includes(a) && (typeof material[a as keyof THREE.Material] == "object")).map((_key, i) => {
            const key = _key as keyof THREE.Material
            const value: any = material[key]
            if (typeof value != "object") return;
            return <DraggableBox x={(i % 5) * 150} y={(Math.floor(i / 5)) * 150} boxWidth={130} boxHeight={130} width={width} height={height} color={"#33333399"} border={"#ffffff"}>
                <>
                    <SText onPress={() => {
                        console.log(value);
                    }}>{key}</SText>
                    <SText>{JSON.stringify(Object.keys(value ?? {}))}</SText>
                </>
            </DraggableBox>
        })}
    </>
}


const ShaderEditor = (props: ShaderEditorProps) => {
    const [width, height] = [1024 * 4, 1024 * 4];
    const { material } = props;
    // const [scale, setScale] = useState(0.8);
    const scale = useSharedValue(1);

    // const translateX = ((width) * (scale - 1)) / 2;
    // const translateY = (height * (scale - 1)) / 2;

    const verticalScrollRef: any = useRef(null);
    const horizontalScrollRef: any = useRef(null);
    let [isMiddleButtonPressed, setIsMiddleButtonPressed] = useState(false);
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
    const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;

    const handleMouseDown = (e: any) => {
        if (e.button === 1) {
            isMiddleButtonPressed = true;
            startPosition.x = e.nativeEvent.clientX;
            startPosition.y = e.nativeEvent.clientY;
            // setStartPosition({ x: e.nativeEvent.clientX, y: e.nativeEvent.clientY });
        }
    };

    const handleMouseUp = (e: any) => {
        if (e.button === 1) {
            isMiddleButtonPressed = false
            // setStartPosition({ x: e.nativeEvent.clientX, y: e.nativeEvent.clientY });
        }
    };

    const handleMouseMove = (e: any) => {
        if (isMiddleButtonPressed) {
            const deltaX = (startPosition.x - e.nativeEvent.clientX)
            const deltaY = (startPosition.y - e.nativeEvent.clientY)

            // Desplazamiento vertical y horizontal
            // console.log(horizontalScrollRef.current.clientWidth - horizontalScrollRef.current.offsetWidth)
            // console.log(horizontalScrollRef.current.clientHeight - horizontalScrollRef.current.offsetHeight)
            verticalScrollRef.current.scrollTo({
                y: scrollPosition.y + deltaY,
                // y: verticalScrollRef.current.offsetHeight + deltaY,
                animated: false
            });
            horizontalScrollRef.current.scrollTo({
                // x: horizontalScrollRef.current.offsetWidth + deltaX,
                x: scrollPosition.x + deltaX,
                animated: false
            });

            startPosition.x = e.nativeEvent.clientX;
            startPosition.y = e.nativeEvent.clientY;
            // startPosition.x = deltaX;
            // startPosition.y = deltaY;
            // setStartPosition({ x: deltaX, y: deltaY });
        }
    };
    const handleWheel = (e: any) => {
        e.preventDefault(); // Evitar el scroll predeterminado
        const zoomSpeed = 0.05;
        // console.log(e.deltaY)
        const newScale = scale.value + (e.deltaY < 0 ? zoomSpeed : -zoomSpeed);
        // Limitar el zoom para que no sea demasiado grande o pequeño
        if (newScale >= 0.2 && newScale <= 3) {

            scale.value = newScale;
        }

        // setScale(newScale);
        // }
    };

    if (Platform.OS == "web") {
        React.useEffect(() => {

            // @ts-ignore
            window.addEventListener('mousedown', handleMouseDown);
            // @ts-ignore
            window.addEventListener('mouseup', handleMouseUp);
            // @ts-ignore
            window.addEventListener('mousemove', handleMouseMove);
            // @ts-ignore
            window.addEventListener('wheel', handleWheel.bind(this), { passive: false });

            return () => {
                // @ts-ignore
                window.removeEventListener('mousedown', handleMouseDown);
                // @ts-ignore
                window.removeEventListener('mouseup', handleMouseUp);
                // @ts-ignore
                window.removeEventListener('mousemove', handleMouseMove);
                // @ts-ignore
                window.removeEventListener('wheel', handleWheel);
            };
        }, []);

    }

    React.useEffect(() => {
        // Calcular las posiciones iniciales para centrar los ScrollViews
        const contentWidth = width * scale.value;
        const contentHeight = height * scale.value;

        // Desplazamiento al centro, tomando en cuenta el tamaño de la pantalla y el tamaño del contenido
        const centerX = (contentWidth - screenWidth) / 2;
        const centerY = (contentHeight - screenHeight) / 2;

        // Desplazar el scroll horizontal al centro
        if (horizontalScrollRef.current) {
            horizontalScrollRef.current.scrollTo({ x: centerX, animated: false });
        }

        // Desplazar el scroll vertical al centro
        if (verticalScrollRef.current) {
            console.log("Centrando")
            verticalScrollRef.current.scrollTo({ y: centerY, animated: false });
        }

    }, [width, height]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: width * scale.value,
            height: height * scale.value,
        };
    });
    const animatedStyle2 = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: scale.value },
                // { translateX: translateX },  // Aplica la traslación en X
                // { translateY: translateY },  // Aplica la traslación en Y
            ],
        };
    });
    return (
        <View style={styles.container}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ScrollView ref={verticalScrollRef} onScroll={e => scrollPosition.y = e.nativeEvent.contentOffset.y} scrollEventThrottle={16}>
                    <ScrollView ref={horizontalScrollRef} horizontal onScroll={e => {
                        scrollPosition.x = e.nativeEvent.contentOffset.x
                    }} scrollEventThrottle={16}>
                        <Animated.View style={[{
                            alignItems: "center",
                            justifyContent: "center"
                        }, animatedStyle]}>
                            <Animated.View style={[{
                                width: width,
                                height: height,
                            }, animatedStyle2]}>
                                <NodeMaterial material={props.material} width={width} height={height} />
                            </Animated.View>
                        </Animated.View>
                    </ScrollView>
                </ScrollView>
            </GestureHandlerRootView>
            <SView row col={"xs-12"} center>
                {/* <SText onPress={() => { setScale(scale.calu - 0.05) }} padding={4}>{"zoom -"}</SText> */}
                {/* <SText onPress={() => { setScale(scale + 0.05) }} padding={4}>{"zoom +"}</SText> */}

            </SView>
        </View>
    );
};

export default ShaderEditor;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: "100%",
        borderWidth: 2,
        borderColor: "#000000",
        backgroundColor: "#00000099",
    },
});
