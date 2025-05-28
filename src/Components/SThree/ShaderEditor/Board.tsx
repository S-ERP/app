import * as React from 'react';
import { createContext, useContext } from 'react';
import { useRef, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SIcon, SImage, SText, STheme, } from 'servisofts-component';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import SvgView, { buildLinePath } from './SvgView';
import { STInput, STNode } from '../STNode';
import Nodo from './Nodo';
import { Svg } from 'react-native-svg';

const AimatedSvg = Animated.createAnimatedComponent(Svg);

type Event = { type: BoardEventType, node: STNode };

export type BoardEventType = "change" | "delete" | "connect" | "disconnect"
type GetBoardValuesContextType = (() => {
    scale: SharedValue<number>,
    width: SharedValue<number>,
    height: SharedValue<number>,
    VentanaPadre: React.MutableRefObject<null>,
    svgViewRef: React.RefObject<SvgView>,
    paintLinesConnect: () => void,
    onEvent: (evt: Event) => void,
    nodes: STNode[]
}) | null;

// Crea el contexto con un valor inicial de null
const GetBoardValuesContext = createContext<GetBoardValuesContextType>(null);

const Board = (props: { nodes: STNode[], width: number, height: number, onEvent: (evt: Event) => void }) => {
    const scale = useSharedValue(1);
    const VentanaPadre = useRef(null);
    const svgViewRef = useRef<SvgView>(null);
    const screenWidth = useSharedValue(0);
    const screenHeight = useSharedValue(0);
    const auxiliar = useSharedValue({ center: { x: 0, y: 0 } });
    const width = useSharedValue(props.width);
    const height = useSharedValue(props.height);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const isDragging = useSharedValue(false);

    const [state, setState] = useState<any>({ center: false, connectors: {} });
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
    // const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e: any) => {
        if (e.button === 1) { // Solo el botón central del mouse
            isDragging.value = true;
            startPosition.x = e.clientX;
            startPosition.y = e.clientY;
            // setStartPosition({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = (e: any) => {
        if (e.button === 1) {
            isDragging.value = false;
        }
    };

    const handleMouseMove = (e: any) => {
        if (isDragging.value) {
            const deltaX = e.clientX - startPosition.x;
            const deltaY = e.clientY - startPosition.y;

            translateX.value += deltaX;
            translateY.value += deltaY;

            startPosition.x = e.clientX;
            startPosition.y = e.clientY;
            // setStartPosition({ x: e.clientX, y: e.clientY });
        }
    };

    const handleWheel = (e: any) => {
        e.preventDefault();
        const zoomSpeed = 0.05;
        const newScale = scale.value + (e.deltaY < 0 ? zoomSpeed : -zoomSpeed);

        // Limitar el zoom
        if (newScale >= 0.2 && newScale <= 3) {


            const desplaze = {
                x: translateX.value - auxiliar.value.center.x,
                y: translateY.value - auxiliar.value.center.y
            }

            const affectx = (desplaze.x) / (width.value)
            const affecty = (desplaze.y) / (height.value)


            const factor = newScale / scale.value;

            const tx = desplaze.x * factor
            const ty = desplaze.y * factor

            // translateX.value += finalw * affectx;
            // translateY.value += finalh * affecty;

            // console.log(desplaze.x / width.value)


            // console.log(finalw, factor, translateX.value, translateY.value)
            // translateX.value = translateX.value * factor;
            // translateX.value += finalw
            // translateY.value += finalh
            translateX.value = auxiliar.value.center.x + tx
            translateY.value = auxiliar.value.center.y + ty
            // translateY.value += 
            scale.value = newScale;

        }
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
            window.addEventListener('wheel', handleWheel, { passive: false });

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


    const paintLinesConnect = () => {
        if (!svgViewRef.current) return;
        props.nodes.map(node => {
            node._inputs.map(stinput => {
                if (stinput.isConnected()) {
                    if (!stinput?.temp?.nodeConnectorViewRef?.current) return;
                    stinput.temp.nodeConnectorViewRef.current?.measureLayout(VentanaPadre.current, (x: number, y: number) => {
                        const x1 = ((x) * ((1 / scale.value)))
                        const y1 = ((y) * (1 / scale.value))
                        stinput.connectOutput?.temp.nodeConnectorViewRef.current?.measureLayout(VentanaPadre.current, (_x2: number, _y2: number) => {
                            const x2 = ((_x2) * ((1 / scale.value)))
                            const y2 = ((_y2) * (1 / scale.value))
                            if (svgViewRef.current) {
                                svgViewRef.current.createPath({
                                    d: buildLinePath({ size: 8, x: x1, y: y1, nx: x2, ny: y2 }),
                                    stroke: STheme.color.text,
                                    strokeWidth: 2,
                                    fill: "none"
                                }, stinput.key + "_" + stinput.connectOutput?.key);
                            }

                        })
                    })

                }
            })
        })

    }
    React.useEffect(() => {
        paintLinesConnect();
    }, [])
    const animatedStyle2 = useAnimatedStyle(() => {
        return {
            width: width.value,
            height: height.value,
            // backgroundColor: "#ffffff66",
            transform: [
                { translateX: translateX.value },  // Aplica la traslación en X
                { translateY: translateY.value },  // Aplica la traslación en Y
                { scale: scale.value },


            ],
        };
    });


    const onEvent = ({ node, type }: Event) => {
        if (type == "delete") {
            const index = props.nodes.indexOf(node);
            if (index !== -1) {
                props.nodes.splice(index, 1);
            }
            if (svgViewRef.current) svgViewRef.current.clear()
        }
        if (props.onEvent) props.onEvent({ node, type })
    }

    const getBoardValues = () => {
        return {
            scale: scale,
            VentanaPadre: VentanaPadre,
            svgViewRef: svgViewRef,
            width: width,
            height: height,
            nodes: props.nodes,
            onEvent: onEvent,
            paintLinesConnect
        }
    };

    return (
        <GetBoardValuesContext.Provider value={getBoardValues}>
            <View style={styles.container} onLayout={e => {
                screenWidth.value = e.nativeEvent.layout.width
                screenHeight.value = e.nativeEvent.layout.height
                if (!state.center) {
                    const screenCenterX = screenWidth.value / 2;
                    const screenCenterY = screenHeight.value / 2;
                    const viewCenterX = width.value / 2;
                    const viewCenterY = height.value / 2;
                    const tx = screenCenterX - viewCenterX;
                    const ty = screenCenterY - viewCenterY;
                    translateX.value = tx;
                    translateY.value = ty;
                    auxiliar.value.center.x = tx;
                    auxiliar.value.center.y = ty;
                    // console.log(screenCenterX, screenCenterY)
                    // console.log(viewCenterX, viewCenterY)
                    // console.log(tx, ty)
                    state.center = true;
                }
            }}>

                {/* <SvgView ref={svgViewRef} width={width.value} height={height.value} /> */}
                <GestureHandlerRootView style={{ flex: 1, width: "100%" }}>
                    <Animated.View ref={VentanaPadre} style={[animatedStyle2, { justifyContent: "center", alignItems: "center" }]}>
                        <SvgView ref={svgViewRef} width={width.value} height={height.value} />
                        {/* <SImage src={require("../../../Assets/img/grid.png")} style={{ resizeMode: "cover", position: "absolute", opacity: 0.1 }} /> */}
                        {props.nodes.map(stnode => {
                            return <Nodo key={stnode.key} stnode={stnode}
                                onMove={() => {
                                    paintLinesConnect();
                                }} />
                        })}
                        {/* {props.children} */}
                    </Animated.View>
                </GestureHandlerRootView>
            </View >
        </GetBoardValuesContext.Provider>
    );
};

export default Board;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: "100%",
        // backgroundColor: "#00000099",
        // justifyContent: "center",
        // alignItems: "center"
    },
    point: {
        width: 2,
        height: 2,
        backgroundColor: "#ffffff",
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: [{ translateX: -1 }, { translateY: -1 }]
    }
});


export const useGetBoardValues = () => {
    return useContext(GetBoardValuesContext);
};