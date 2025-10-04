import React from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
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
import { SGradient, SText, STheme, SThread, SUuid, SView } from "servisofts-component";
import PizarraMiniMapa from "./MiniMapa";
import { PuertoInstance } from "./Puerto";
import Linea, { LineaInstance, LineaProps } from "./Linea";
import Lineas from "./Lineas";
import MenuType from "./MenuTypes";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import Conexion from "./Conexion";

type PizarraProps = {
    id: string;
    children: React.ReactNode;
    hiddeMiniMapa?: boolean;
    scale?: number;
    size?: number;
    startType?: "select" | "move";
    exponentDeRedondeoDeMovimiento?: number;
    onDoublePress?: (evt: any) => void,


}


const PizarraContext = React.createContext<{
    width: number,
    scale: any,
    translateX: any,
    translateY: any,
    layoutWidth: any, layoutHeight: any,
    selectStartX: any, selectStartY: any, selectEndX: any, selectEndY: any,
    selectTranslateX: any, selectTranslateY: any,
    exponentDeRedondeoDeMovimiento: any,
    ref: React.RefObject<any>,
    preventPan: any,
    toJSon: () => any,
    registerNodo: (nodo: NodoInstance) => void,
    unregisterNodo: (key: string) => void,
    nodos: React.MutableRefObject<Record<string, NodoInstance>>,
    registerPuerto: (puerto: PuertoInstance) => void,
    unregisterPuerto: (key: string, key_nodo: string, type: string) => void,
    puertos: React.MutableRefObject<Record<string, PuertoInstance>>,
    registerLinea: (linea: LineaInstance) => void,
    unregisterLinea: (key: string) => void,
    lineas: React.MutableRefObject<Record<string, LineaInstance>>,
    lineasRef: React.MutableRefObject<Lineas | null>,
    saveChanges: () => void,
    saveChangeNodes: (node: any) => void,
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
    exponentDeRedondeoDeMovimiento: 1,
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
    toJSon: () => { },
    saveChanges: () => { },
    saveChangeNodes: (node: any) => { },
});


export const usePizarra = () => React.useContext(PizarraContext);

// export function PizarraProvider(props: PizarraProps) {
//     return 
// }

export default function Pizarra(props: PizarraProps) {
    // Posiciones acumuladas
    const [state, setState] = React.useState<any>({
    })
    const serverData = React.useRef<any>({
    });

    const nodos = React.useRef<Record<string, NodoInstance>>({});
    const puertos = React.useRef<Record<string, PuertoInstance>>({});
    const lineas = React.useRef<Record<string, LineaInstance>>({});
    const config = React.useRef({ type: props.startType ?? "select", height: 0, instance_id: SUuid() });
    const isMiddleDown = React.useRef(false);
    const ref = React.useRef<any>();
    const start = React.useRef({ x: 0, y: 0, tx: 0, ty: 0 });
    const lineasRef = React.useRef<Lineas | null>(null);
    const width = props.size ?? 15000;
    const height = width;

    const layoutWidth = useSharedValue(0);
    const layoutHeight = useSharedValue(0);
    const exponentDeRedondeoDeMovimiento = useSharedValue(props.exponentDeRedondeoDeMovimiento ?? 1);
    const scale = useSharedValue(props.scale ?? 1);
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
        // console.log("registerNodo", nodo.id)
        nodos.current[nodo.id] = nodo;
        // console.log(state)
        applyDataServer();
    };
    const unregisterNodo = (key: string) => {
        // console.log("unregisterNodo", key)
        if (!nodos.current[key]) return;
        delete nodos.current[key];
    };

    const registerPuerto = (puerto: PuertoInstance) => {
        // console.log("registerPuerto", puerto.nodo.id + "_" + puerto.id)
        puertos.current[puerto.type + "_" + puerto.nodo.id + "_" + puerto.id] = puerto;
    };
    const unregisterPuerto = (key: string, key_nodo: string, type: string) => {
        // console.log("unregisterPuerto", key_nodo + "_" + key)
        delete puertos.current[type + "_" + key_nodo + "_" + key];
    };

    const registerLinea = (linea: LineaInstance) => {
        lineas.current[linea.id] = linea;
    };
    const unregisterLinea = (key: string) => {
        delete lineas.current[key];
    };


    const saveChangeNodes = (nodes: any[]) => {
        const data = {
            id: props.id,
            key_empresa: MDL.empresa.select?.key,
            descripcion: "pizarra",
            nodes: nodes
        }
        if (serverData?.current?.nodes) {

            nodes.forEach(nodo => {
                const nodoInstance = serverData.current.nodes.find((n: any) => n.id == nodo.id);
                if (nodoInstance) {
                    nodoInstance.x = nodo.x;
                    nodoInstance.y = nodo.y;
                }
            })
        }

        MDL.pizarra.saveNodo(data, config.current.instance_id);
    }

    const saveChanges = () => {
        const data: any = toJSon();
        MDL.pizarra.save(data);
    }
    const toJSon = () => {
        const nodosarr = Object.values(nodos.current).map(nodo => {
            if (!nodo.toJSon) return null;
            return nodo.toJSon();
        })

        const camera = {
            x: translateX.value,
            y: translateY.value,
            scale: scale.value,
            width: layoutWidth.value,
            height: layoutHeight.value,
        }
        console.log(camera)
        return {
            id: props.id,
            key_empresa: MDL.empresa.select?.key,
            descripcion: "pizarra",
            nodes: nodosarr,
            camera
        };

    }

    const zoomAdd = (porc: number) => {
        const limits = [0.1, 4];
        const logMin = Math.log(limits[0]);
        const logMax = Math.log(limits[1]);
        let logScale = Math.log(scale.value);
        logScale += porc * (logMax - logMin); // porc pequeño como 0.05 o -0.05
        if (logScale < logMin) logScale = logMin;
        if (logScale > logMax) logScale = logMax;
        const newScale = Math.exp(logScale);
        scale.value = newScale;
    };

    const applyDataServer = () => {
        if (!serverData.current) return null;
        serverData.current.nodes?.forEach((nodo: any) => {
            if (!nodos.current[nodo.id]) return;
            if (nodos.current[nodo.id].onDrag.value) return; // si el nodo se está moviendo, no actualizar su posición
            // console.log("applyDataServer", nodo.id)
            nodos.current[nodo.id].translateX.value = nodo.x;
            nodos.current[nodo.id].translateY.value = nodo.y;

            // nodos.current[nodo.id].selected.value = nodo.selected;
        })
    }

    const loadDataFromServer = () => {
        if (!props.id) return;
        MDL.pizarra.get(props.id).then(e => {
            serverData.current = e
            // setState({ ...state })
            applyDataServer()

        }).catch(e => {
            console.log(e);
        })
    }

    // ******* Component Did Mount *******
    React.useEffect(() => {
        if (!props.id) return;
        setState({ ...state })
        // state.serverData = null;

        MDL.erp.addServerListener({
            key: "pizarra_edit_" + props.id,
            component: "pizarra",
            type: "saveNodo",
            key_empresa: MDL.empresa.select?.key,
            callback: (data) => {
                if (data.instance_id != config.current.instance_id) {
                    loadDataFromServer();
                }
            }
        })
        loadDataFromServer();
        // MDL.pizarra.pizarra_usuario_save({
        //     id_pizarra: props.id,
        //     active: true,
        // })
        // SSocket.removeEventListener()
        // SSocket.addEventListener("onMessage", (e: any) => {
        //     if (e.component != "pizarra") return;
        //     if (e.type != "save") return;

        //     loadDataFromServer();
        // })

        return () => {
            MDL.erp.removeServerListener({
                key: "pizarra_edit_" + props.id,
                component: "pizarra",
                type: "save",
            })
            // MDL.pizarra.pizarra_usuario_save({
            //     id_pizarra: props.id,
            //     active: false,
            // })
        }
    }, []);


    // ********  GESTURES  *********

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
            translateX.value = start.current.tx + ((e.clientX - start.current.x) / scale.value);
            translateY.value = start.current.ty + ((e.clientY - start.current.y) / scale.value);
        };

        const handleMouseUp = (e: any) => {
            if (e.button === 1) {
                isMiddleDown.current = false;
            }
        };
        const handleContextMenu = (e: any) => {
            e.preventDefault();
            console.log(e);
            const x = (e.nativeEvent.offsetX) - width / 2;
            const y = (e.nativeEvent.offsetY) - width / 2;
            // console.log(x, y)

            if (props.onDoublePress) props.onDoublePress({
                absoluteX:e.nativeEvent.clientX,
                absoluteY:e.nativeEvent.clientY,
                pizarraX: x,
                pizarraY: y,
            });
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
            // @ts-ignore
            el.addEventListener("contextmenu", handleContextMenu);


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
                // @ts-ignore
                el.removeEventListener("contextmenu", handleContextMenu);
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
            if (preventPan.value) return;
            if (config.current.type == "select" && event.numberOfPointers == 1) {
                // console.log(event.numberOfPointers)
                selectEndX.value = selectStartX.value + (event.translationX / scale.value);
                selectEndY.value = selectStartY.value + (event.translationY / scale.value);
                return;
            }
            translateX.value = (panGesture.context.startX) + (event.translationX / scale.value);
            translateY.value = (panGesture.context.startY) + (event.translationY / scale.value);
        }).onFinalize(e => {
            selectTranslateX.value = 0;
            selectTranslateY.value = 0;
            selectStartX.value = 0
            selectStartY.value = 0
            selectEndX.value = selectStartX.value;
            selectEndY.value = selectStartY.value;

        })


    const pinchGesture: any = Gesture.Pinch()
        .onStart((e) => {
            pinchGesture.context = {
                startScale: scale.value,
                startX: translateX.value,
                startY: translateY.value,
            };
        })
        .onUpdate((event) => {
            scale.value = pinchGesture.context.startScale * event.scale
        });


    const doubleTapGesture: any = Gesture.Tap().maxDistance(10).maxDelay(200).numberOfTaps(2).onStart((e) => {
        const x = (e.x / scale.value) - width / 2;
        const y = (e.y / scale.value) - width / 2;
        console.log(x, y)

        if (props.onDoublePress) props.onDoublePress({
            ...e,
            pizarraX: x,
            pizarraY: y,
        });
    })
    const gesture = Gesture.Simultaneous(panGesture, pinchGesture, doubleTapGesture);


    // *********  STYLES  *********

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value * scale.value },
            { translateY: translateY.value * scale.value },
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
                { translateX: selectTranslateX.value * scale.value },
                { translateY: selectTranslateY.value * scale.value },
                // { scale: scale.value },
            ],
        })
    });



    const encontrarLineas = () => {
        const puertosEncontrados: any[] = [];
        const buscarPuertosRecursive = (props: any, nodo?: any) => {
            if (!props.children) return;
            // console.log(props?.type?.name, props.children)
            React.Children.forEach(props.children, (child: any) => {
                if (!child) return;
                if (child.type && (child.type.name == "PizarraNodo" || child.type.displayName == "PizarraNodo")) {
                    // console.log("Es el nodo")
                    if (child.props) {
                        buscarPuertosRecursive(child.props, child);
                    }
                    return;
                }
                if (child.type && (child.type.name == "Puerto" || child.type.displayName == "Puerto")) {
                    // child.nodo = nodo;
                    // console.log("Puerto encontrado", child, nodo)
                    puertosEncontrados.push({ port: child, nodo: nodo });
                    // @ts-ignore
                    // console.log("Puerto encontrado", child.props.id, child.props.value, child.props.type)
                }
                if (child.props) {
                    buscarPuertosRecursive(child.props, nodo);
                }
            });
        }

        buscarPuertosRecursive(props);
        // console.log("peurtos encontrados", puertosEncontrados)
        const conexiones: any = [];
        const inputs = puertosEncontrados.filter(a => a.port.props.type == "input");
        const outputs = puertosEncontrados.filter(a => a.port.props.type == "output");
        inputs.map(inp => {
            const { type, value, id } = inp.port.props;
            outputs.map(out => {
                if (!inp?.port?.props?.value) return false;
                if (!out?.port?.props?.value) return false;
                // if (inp.port.props.value == out.port.props.value) {
                if (inp.port.props.value.includes(out.port.props.value)) {
                    conexiones.push({
                        id: inp.nodo.props.id + "_" + inp.port.props.id + "__" + out.nodo.props.id + "_" + out.port.props.value,
                        inp: inp,
                        out: out
                    })
                }
            })

        })
        return conexiones;
    }


    const conexiones = encontrarLineas();
    // console.log("Puertos encontrados en Pizarra", conexiones)

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
                toJSon: toJSon,
                saveChanges: saveChanges,
                saveChangeNodes: saveChangeNodes,
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
                lineasRef: lineasRef,
                exponentDeRedondeoDeMovimiento
            }}>

                <GestureDetector gesture={gesture}>
                    <Animated.View ref={ref} style={[{
                        width: width,
                        height: height,
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: STheme.color.card
                    }, animatedStyle]} >
                        {/* <GestureDetector gesture={panSelected}> */}
                        <Animated.View style={[selectStyle]} />
                        <Lineas ref={lineasRef} lineas={lineas} scale={scale} />
                        {/* <View style={{ position: "absolute", width: "100%", height: 1, backgroundColor: STheme.color.card }} /> */}
                        {/* <View style={{ position: "absolute", width: 1, height: "100%", backgroundColor: STheme.color.card }} /> */}
                        {conexiones.map((con: any) => {
                            return <Conexion key={con.id} id={con.id} inp={con.inp} out={con.out} />
                        })}
                        {/* </GestureDetector> */}
                        {props.children}

                        <Linea id={"select"} />

                    </Animated.View>
                </GestureDetector>
                {/* {!props.hiddeMiniMapa && <PizarraMiniMapa />} */}
                {!props.hiddeMiniMapa && <PizarraMiniMapa >{props.children}</PizarraMiniMapa>}

            </PizarraContext.Provider>
        </GestureHandlerRootView>
    );
}
