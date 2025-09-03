import React from "react";
import { Platform, StyleSheet } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
} from "react-native-reanimated";
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
    PanGesture,
} from "react-native-gesture-handler";
import Nodo, { NodoInstance } from "./PizarraNodo";
import { SGradient, SText, STheme, SView } from "servisofts-component";
import PizarraMiniMapa from "./MiniMapa";
import { PuertoInstance } from "./Puerto";
import Linea, { LineaInstance, LineaProps } from "./Linea";
import Lineas from "./Lineas";

type PizarraProps = {
    children: React.ReactNode;
}


const PizarraContext = React.createContext<{
    width: number,
    scale: any,
    translateX: any,
    translateY: any,
    layoutWidth: any, layoutHeight: any,
    selectStartX: any, selectStartY: any, selectEndX: any, selectEndY: any,
    selectTranslateX: any, selectTranslateY: any,
    ref: React.RefObject<any>,
    preventPan: any,
    registerNodo: (nodo: NodoInstance) => void,
    unregisterNodo: (key: string) => void,
    nodos: React.MutableRefObject<Record<string, NodoInstance>>,
    registerPuerto: (puerto: PuertoInstance) => void,
    unregisterPuerto: (key: string, key_nodo: string) => void,
    puertos: React.MutableRefObject<Record<string, PuertoInstance>>,
    registerLinea: (linea: LineaInstance) => void,
    unregisterLinea: (key: string) => void,
    lineas: React.MutableRefObject<Record<string, LineaInstance>>,
    lineasRef: React.MutableRefObject<Lineas | null>
}>({
    width: 1000,
    scale: 1,
    translateX: 0,
    translateY: 0,
    layoutWidth: 0,
    layoutHeight: 0,
    selectStartX: 0,
    selectStartY: 0,
    selectEndX: 0,
    selectEndY: 0,
    selectTranslateX: 0,
    selectTranslateY: 0,
    ref: React.createRef<any>(),
    preventPan: false,
    registerNodo: () => { },
    unregisterNodo: () => { },
    nodos: { current: {} },
    registerPuerto: () => { },
    unregisterPuerto: () => { },
    puertos: { current: {} },
    registerLinea: () => { },
    unregisterLinea: () => { },
    lineas: { current: {} },
    lineasRef: null as any,
});


export const usePizarra = () => React.useContext(PizarraContext);

// export function PizarraProvider(props: PizarraProps) {
//     return 
// }

export default function Pizarra(props: PizarraProps) {
    // Posiciones acumuladas
    const nodos = React.useRef<Record<string, NodoInstance>>({});
    const puertos = React.useRef<Record<string, PuertoInstance>>({});
    const lineas = React.useRef<Record<string, LineaInstance>>({});
    const config = React.useRef({ type: "select", height: 0 });
    const isMiddleDown = React.useRef(false);
    const ref = React.useRef<any>();
    const start = React.useRef({ x: 0, y: 0, tx: 0, ty: 0 });
    const lineasRef = React.useRef<Lineas | null>(null);
    const width = 20000;
    const height = width;

    const layoutWidth = useSharedValue(0);
    const layoutHeight = useSharedValue(0);
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const selectStartX = useSharedValue(0);
    const selectStartY = useSharedValue(0);
    const selectEndX = useSharedValue(0);
    const selectEndY = useSharedValue(0);
    const selectTranslateX = useSharedValue(0);
    const selectTranslateY = useSharedValue(0);
    const preventPan = useSharedValue(false);

    const registerNodo = (nodo: NodoInstance) => {
        nodos.current[nodo.id] = nodo;
    };
    const unregisterNodo = (key: string) => {
        delete nodos.current[key];
    };

    const registerPuerto = (puerto: PuertoInstance) => {
        puertos.current[puerto.nodo.id + "_" + puerto.id] = puerto;


        Object.values(puertos.current).filter(e => e.id == puerto.id && e.type != puerto.type).forEach(otherPort => {
            if (!otherPort.props.value || !puerto.props.value) return;
            if (otherPort.props.value == puerto.props.value) {
                puerto.onConnected.value = true;
                otherPort.onConnected.value = true;
                // setLinesState((prev) => {
                //     const newLines = { ...prev };
                //     newLines[puerto.nodo.id + "_" + puerto.id + "_" + otherPort.nodo.id + "_" + otherPort.id] = {
                //         id: puerto.nodo.id + "_" + puerto.id + "_" + otherPort.nodo.id + "_" + otherPort.id,
                //         x1: puerto.nodo.translateX.value + puerto.layout.value.x + (puerto.layout.value.width / 2),
                //         y1: puerto.nodo.translateY.value + puerto.layout.value.y + (puerto.layout.value.height / 2),
                //         x2: otherPort.nodo.translateX.value + otherPort.layout.value.x + (otherPort.layout.value.width / 2),
                //         y2: otherPort.nodo.translateY.value + otherPort.layout.value.y + (otherPort.layout.value.height / 2),
                //     };
                //     return newLines;
                // });
            }
        });


    };
    const unregisterPuerto = (key: string, key_nodo: string) => {
        delete puertos.current[key_nodo + "_" + key];
    };

    const registerLinea = (linea: LineaInstance) => {
        lineas.current[linea.id] = linea;
    };
    const unregisterLinea = (key: string) => {
        delete lineas.current[key];
    };

    const zoomAdd = (porc: number) => {
        const limits = [0.2, 4];

        // Trabajamos en escala logarítmica
        const logMin = Math.log(limits[0]);
        const logMax = Math.log(limits[1]);

        let logScale = Math.log(scale.value);

        // Movemos la escala en log
        logScale += porc * (logMax - logMin); // porc pequeño como 0.05 o -0.05

        // Clamp
        if (logScale < logMin) logScale = logMin;
        if (logScale > logMax) logScale = logMax;

        const newScale = Math.exp(logScale);

        const prevScale = scale.value;
        scale.value = newScale;
        const scaleRatio = newScale / prevScale;

        translateX.value = (translateX.value * scaleRatio)
        translateY.value = (translateY.value * scaleRatio)


    };



    if (Platform.OS == "web") {

        const handleWheel = (e: any) => {
            e.preventDefault();

            zoomAdd(e.deltaY < 0 ? 0.02 : -0.02);



        };
        const handleMouseDown = (e: any) => {
            if (e.button === 1) { // rueda del mouse
                e.preventDefault();
                isMiddleDown.current = true;
                start.current = {
                    x: e.clientX,
                    y: e.clientY,
                    tx: translateX.value,
                    ty: translateY.value,
                };
            }
        };

        const handleMouseMove = (e: any) => {
            if (!isMiddleDown.current) return;
            e.preventDefault();
            translateX.value = start.current.tx + (e.clientX - start.current.x);
            translateY.value = start.current.ty + (e.clientY - start.current.y);
        };

        const handleMouseUp = (e: any) => {
            if (e.button === 1) {
                isMiddleDown.current = false;
            }
        };


        React.useEffect(() => {
            if (!ref.current) return;
            const el = ref.current as HTMLElement;
            // @ts-ignore
            el.addEventListener("wheel", handleWheel, { passive: false });
            // @ts-ignore
            el.addEventListener("mousedown", handleMouseDown);
            // @ts-ignore
            window.addEventListener("mousemove", handleMouseMove);
            // @ts-ignore
            window.addEventListener("mouseup", handleMouseUp);

            return () => {
                if (!ref.current) return;
                // @ts-ignore
                el.removeEventListener("wheel", handleWheel);
                // @ts-ignore
                el.removeEventListener("mousedown", handleMouseDown);
                // @ts-ignore
                window.removeEventListener("mousemove", handleMouseMove);
                // @ts-ignore
                window.removeEventListener("mouseup", handleMouseUp);
            };
        }, []);

    }




    // Pan gesture
    const panGesture: any = Gesture.Pan()
        .onBegin((e) => {
            if (preventPan.value) return;
            if (config.current.type == "select") {
                selectTranslateX.value = 0;
                selectTranslateY.value = 0;
                selectStartX.value = e.x / scale.value;
                selectStartY.value = e.y / scale.value;
                selectEndX.value = selectStartX.value;
                selectEndY.value = selectStartY.value;

            }
            panGesture.context = {
                startX: translateX.value,
                startY: translateY.value,
            }
        })
        .onStart((e) => {
            // Guardamos la posición anterior

        })
        .onUpdate((event) => {
            if (config.current.type == "select") {
                selectEndX.value = selectStartX.value + (event.translationX / scale.value);
                selectEndY.value = selectStartY.value + (event.translationY / scale.value);
                return;
            }
            translateX.value = panGesture.context.startX + event.translationX;
            translateY.value = panGesture.context.startY + event.translationY;
        }).onFinalize(e => {
            console.log("entro en el finalize pizzarra");
            selectTranslateX.value = 0;
            selectTranslateY.value = 0;
            selectStartX.value = 0
            selectStartY.value = 0
            selectEndX.value = selectStartX.value;
            selectEndY.value = selectStartY.value;
        })

    // const panSelected: PanGesture = Gesture.Pan()
    //     .onBegin((e) => {

    //         // selectStartX.value = 0;
    //         // selectStartY.value = 0;
    //         // selectEndX.value = 0;
    //         // selectEndY.value = 0;
    //         // selectTranslateX.value = ;
    //         // selectTranslateY.value = 0;


    //     }).onStart(e => {
    //         panSelected.context = {
    //             startX: selectTranslateX.value,
    //             startY: selectTranslateY.value,
    //         };
    //     })
    //     .onUpdate((event) => {
    //         selectTranslateX.value = panSelected.context.startX + (event.translationX / scale.value);
    //         selectTranslateY.value = panSelected.context.startY + (event.translationY / scale.value);
    //     });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));
    const selectStyle = useAnimatedStyle(() => {

        return ({
            position: "absolute",
            width: Math.abs((selectEndX.value - selectStartX.value)),
            height: Math.abs((selectEndY.value - selectStartY.value)),
            backgroundColor: STheme.color.link + "33",
            borderWidth: 1,
            borderColor: STheme.color.link,
            left: Math.min(selectStartX.value, selectEndX.value),
            top: Math.min(selectStartY.value, selectEndY.value),
            transform: [
                { translateX: selectTranslateX.value },
                { translateY: selectTranslateY.value },
                // { scale: scale.value },
            ],
        })
    });


    const pinchGesture: any = Gesture.Pinch()
        .onStart(() => {
            // Guardamos la posición anterior
            pinchGesture.context = {
                startScale: scale.value,
            };
        })
        .onUpdate((event) => {
            scale.value = pinchGesture.context.startScale * event.scale;
        });

    // const gesture = Gesture.Exclusive(panSelected, panGesture)
    const gesture = Gesture.Simultaneous(panGesture, pinchGesture);
    return (

        <GestureHandlerRootView style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        }} onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            layoutWidth.value = width;
            layoutHeight.value = height;
        }}>
            <PizarraContext.Provider value={{
                width: width, scale: scale, translateX: translateX, translateY: translateY, layoutWidth: layoutWidth,
                layoutHeight: layoutHeight,
                selectStartX: selectStartX,
                selectStartY: selectStartY,
                selectEndX: selectEndX,
                selectEndY: selectEndY,
                selectTranslateX: selectTranslateX,
                selectTranslateY: selectTranslateY,
                preventPan: preventPan,
                registerNodo: registerNodo,
                unregisterNodo: unregisterNodo,
                ref: ref,
                nodos: nodos,
                puertos: puertos,
                registerPuerto: registerPuerto,
                unregisterPuerto: unregisterPuerto,
                lineas: lineas,
                registerLinea: registerLinea,
                unregisterLinea: unregisterLinea,
                lineasRef: lineasRef
            }}>
                <GestureDetector gesture={gesture}>
                    <Animated.View ref={ref} style={[{
                        width: width,
                        height: height,
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 1,
                    }, animatedStyle]} >
                        {/* <GestureDetector gesture={panSelected}> */}
                        <Animated.View style={[selectStyle]} />
                        {/* </GestureDetector> */}
                        {props.children}

                        <Linea id={"select"} />
                        <Lineas ref={lineasRef} lineas={lineas} />

                    </Animated.View>
                </GestureDetector>
                <PizarraMiniMapa />
                <MenuType onChange={(type) => config.current.type = type} />
            </PizarraContext.Provider>
        </GestureHandlerRootView>
    );
}


const MenuType = ({ onChange }: { onChange: (type: "select" | "move") => void }) => {
    const [selected, setSelected] = React.useState<"select" | "move">("select");
    return <SView style={{
        width: 120,
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        position: "absolute",
        bottom: 0,
        backgroundColor: STheme.color.background,
    }}>
        <SText card padding={8} style={{
            fontWeight: selected === "select" ? "bold" : "normal",
            opacity: selected === "select" ? 1 : 0.5,
        }} onPress={() => {
            setSelected("select");
            onChange("select");
        }}>{"select"}</SText>
        <SText card padding={8} style={{
            fontWeight: selected === "move" ? "bold" : "normal",
            opacity: selected === "move" ? 1 : 0.5,
        }} onPress={() => {
            setSelected("move");
            onChange("move");
        }}>{"move"}</SText>
    </SView>;
}