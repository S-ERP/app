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
} from "react-native-gesture-handler";
import Nodo from "./PizarraNodo";
import { SGradient, SText, STheme, SView } from "servisofts-component";
import PizarraMiniMapa from "./MiniMapa";

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
});


export const usePizarra = () => React.useContext(PizarraContext);

// export function PizarraProvider(props: PizarraProps) {
//     return 
// }

export default function Pizarra(props: PizarraProps) {
    // Posiciones acumuladas
    const config = React.useRef({ type: "select", height: 0 });

    const ref = React.useRef<any>();
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


    if (Platform.OS == "web") {

        const handleWheel = (e: any) => {
            e.preventDefault();
            const zoomSpeed = 0.05;
            const newScale = scale.value + (e.deltaY < 0 ? zoomSpeed : -zoomSpeed);
            // Limitar el zoom
            if (newScale >= 0.07 && newScale <= 3) {
                const prevScale = scale.value;
                scale.value = newScale;
                const scaleRatio = newScale / prevScale;

                // Obtener la posición del cursor relativa al elemento
                const rect = ref.current.getBoundingClientRect();
                // const offsetX = e.clientX - rect.left;
                // const offsetY = e.clientY - rect.top;
                // // Ajusta el translate para mantener el punto bajo el cursor en el mismo lugar visual
                translateX.value = (translateX.value * scaleRatio)
                translateY.value = (translateY.value * scaleRatio)
                selectStartX.value = (selectStartX.value * scaleRatio)
                selectStartY.value = (selectStartY.value * scaleRatio)
                selectEndX.value = (selectEndX.value * scaleRatio)
                selectEndY.value = (selectEndY.value * scaleRatio)
                selectTranslateX.value = (selectTranslateX.value * scaleRatio)
                selectTranslateY.value = (selectTranslateY.value * scaleRatio)
            }
        };

        React.useEffect(() => {
            if (!ref.current) return;
            //    @ts-ignore
            ref.current.addEventListener('wheel', handleWheel, { passive: false });
            // window.addEventListener('wheel', handleWheel, { passive: false });
            return () => {
                if (!ref.current) return;
                // @ts-ignore
                ref.current.removeEventListener('wheel', handleWheel);
                // window.removeEventListener('wheel', handleWheel);
            };
        }, []);

    }




    // Pan gesture
    const panGesture: any = Gesture.Pan()

        .onStart((e) => {
            // Guardamos la posición anterior
            panGesture.context = {
                startX: translateX.value,
                startY: translateY.value,
            };
            if (config.current.type == "select") {
                console.log(e);
                selectTranslateX.value = 0;
                selectTranslateY.value = 0;
                selectStartX.value = e.x;
                selectStartY.value = e.y;
            } else {
                // selectStartX.value = 0;
                // selectStartY.value = 0;
                // selectEndX.value = 0;
                // selectEndY.value = 0;
                // selectTranslateX.value = 0;
                // selectTranslateY.value = 0;
            }
        })
        .onUpdate((event) => {
            if (config.current.type == "select") {
                selectEndX.value = selectStartX.value + event.translationX;
                selectEndY.value = selectStartY.value + event.translationY;
                return;
            }
            translateX.value = panGesture.context.startX + event.translationX;
            translateY.value = panGesture.context.startY + event.translationY;
        });

    const panSelected: any = Gesture.Pan().blocksExternalGesture()
        .onBegin((e) => {
            // selectStartX.value = 0;
            // selectStartY.value = 0;
            // selectEndX.value = 0;
            // selectEndY.value = 0;
            // selectTranslateX.value = ;
            // selectTranslateY.value = 0;


        }).onStart(e => {
            panSelected.context = {
                startX: selectTranslateX.value,
                startY: selectTranslateY.value,
            };
        })
        .onUpdate((event) => {
            selectTranslateX.value = panSelected.context.startX + event.translationX;
            selectTranslateY.value = panSelected.context.startY + event.translationY;
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));
    const selectStyle = useAnimatedStyle(() => ({
        position: "absolute",
        width: Math.abs((selectEndX.value - selectStartX.value) / scale.value),
        height: Math.abs((selectEndY.value - selectStartY.value) / scale.value),
        backgroundColor: STheme.color.link + "33",
        borderWidth: 1,
        borderColor: STheme.color.link,
        left: Math.min(selectStartX.value, selectEndX.value) / scale.value,
        top: Math.min(selectStartY.value, selectEndY.value) / scale.value,
        transform: [
            { translateX: selectTranslateX.value },
            { translateY: selectTranslateY.value },
            // { scale: scale.value },
        ],
    }));


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
            }}>
                <GestureDetector gesture={Gesture.Simultaneous(panGesture, pinchGesture)}>
                    <Animated.View ref={ref} style={[{
                        width: width,
                        height: height,
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 1,
                    }, animatedStyle]} >
                        <GestureDetector gesture={panSelected}>
                            <Animated.View style={[selectStyle]} />
                        </GestureDetector>
                        {props.children}
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
        width: 100,
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