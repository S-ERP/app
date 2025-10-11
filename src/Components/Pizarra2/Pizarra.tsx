import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Linea from './Linea';
import Conexiones from './Conexiones';
import MDL from '../../MDL';
import { STheme, SUuid } from 'servisofts-component';
import select from 'servisofts-component/Component/SInput2/types/select';
import PizarraMiniMapa from './MiniMapa';
import label from '../label';

interface PizarraProps {
    id: string,
    children?: any,
    scale?: number;
    size?: number;
    onDoublePress?: (evt: any) => void,
    exponentDeRedondeoDeMovimiento?: number;
    onSelectChange?: (selects: any[]) => void;
    hiddeMiniMapa?: boolean
}

export const PizarraContext = React.createContext<any>(null);

const Pizarra = (props: PizarraProps) => {

    const nodos = React.useRef<Record<string, any>>({});
    const lastSentRef = React.useRef(0);
    const config = React.useRef({ height: 0, instance_id: SUuid() });
    const serverData = React.useRef<any>({});
    const viewRef = React.useRef<any>(null);
    const conexiones = React.useRef<any>(null);
    const isMiddleDown = React.useRef(false);
    const start = React.useRef({ x: 0, y: 0, tx: 0, ty: 0 });
    const linea = React.useRef<any>(null);
    const size = useSharedValue(props.size ?? 15000);
    const layoutWidth = useSharedValue(0);
    const layoutHeight = useSharedValue(0);
    const exponentDeRedondeoDeMovimiento = useSharedValue(props.exponentDeRedondeoDeMovimiento ?? 1);
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




    const applyDataServer = () => {
        if (!serverData.current) return null;
        if (serverData.current.pizarra_usuario) {
            const pud = serverData.current.pizarra_usuario.data;
            if (pud.translateX) translateX.value = pud.translateX
            if (pud.translateY) translateY.value = pud.translateY
            if (pud.scale) scale.value = pud.scale

        }
        serverData.current.nodes?.forEach((nodo: any) => {
            if (!nodos.current[nodo.id]) return;
            // if (nodos.current[nodo.id].onDrag.value) return; // si el nodo se está moviendo, no actualizar su posición
            // console.log("applyDataServer", nodo.id)
            nodos.current[nodo.id].translateX.value = nodo.x;
            nodos.current[nodo.id].translateY.value = nodo.y;
        })

        console.log("Pisarra", "applyDataServer")
    }
    const loadDataFromServer = () => {
        if (!props.id) return;
        console.log("Pisarra", "loadDataFromServer")
        MDL.pizarra.get(props.id).then(e => {
            serverData.current = e
            console.log("La data que llego del server", e)
            // setState({ ...state })
            applyDataServer()

        }).catch(e => {
            console.log(e);
        })
    }
    const saveChangeNodes = (nodes: any[], preventSave?: boolean) => {
        const data = {
            id: props.id,
            key_empresa: MDL.empresa.select?.key,
            descripcion: "pizarra",
            nodes: nodes
        }

        const oldNodes: any[] = [];
        if (serverData?.current?.nodes) {
            nodes.forEach(nodo => {
                const nodoInstance = serverData.current.nodes.find((n: any) => n.id == nodo.id);
                if (nodoInstance) {
                    oldNodes.push({
                        id: nodoInstance.id,
                        x: nodoInstance.x,
                        y: nodoInstance.y,
                    });
                    nodoInstance.x = nodo.x;
                    nodoInstance.y = nodo.y;
                }
            })
        }
        if (!preventSave) {
            MDL.pizarra.saveLastChange({
                ...data,
                nodes: oldNodes,
            })
        }

        MDL.pizarra.saveNodo(data, config.current.instance_id);
    }

    const onNodoChangeSelect = (node: any) => {
        const selectedNodos = Object.values(nodos.current).filter(n => n.selected.value)
        console.log("nodos seleccionados", selectedNodos)
        if (!props.onSelectChange) return;
        props.onSelectChange(selectedNodos);
    }

    const contextValue = React.useMemo(
        () => ({
            nodos,
            viewRef,
            conexiones,
            linea,
            scale,
            size,
            translateX,
            translateY,
            layoutHeight,
            layoutWidth,
            applyDataServer,
            saveChangeNodes,
            onNodoChangeSelect,
            exponentDeRedondeoDeMovimiento,
            selectStartX,
            selectStartY,
            selectEndX,
            selectEndY,
            selectTranslateX,
            selectTranslateY,
            preventPan
        }),
        []
    );




    const panGesture: any = Gesture.Pan()
        .onBegin((e) => {
            if (preventPan.value) return;
            selectTranslateX.value = 0;
            selectTranslateY.value = 0;
            selectStartX.value = e.x / scale.value;
            selectStartY.value = e.y / scale.value;
            selectEndX.value = selectStartX.value;
            selectEndY.value = selectStartY.value;
        })
        .onStart(() => {
            if (preventPan.value) return;
            panGesture.context = { startX: translateX.value, startY: translateY.value };

        })
        .onUpdate((e) => {
            if (preventPan.value) return;
            if (e.numberOfPointers == 1) {
                // console.log(event.numberOfPointers)
                selectEndX.value = selectStartX.value + (e.translationX / scale.value);
                selectEndY.value = selectStartY.value + (e.translationY / scale.value);
                return;
            }
            // translateX.value = panGesture.context.startX + e.translationX / scale.value;
            // translateY.value = panGesture.context.startY + e.translationY / scale.value;
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
        const x = (e.x / scale.value) - size.value / 2;
        const y = (e.y / scale.value) - size.value / 2;
        console.log(x, y)

        if (props.onDoublePress) props.onDoublePress({
            ...e,
            pizarraX: x,
            pizarraY: y,
        });
    })
    const animatedStyle = useAnimatedStyle(() => {
        return {
            position: "absolute",
            width: size.value,
            height: size.value,
            transform: [
                { scaleX: scale.value },
                { scaleY: scale.value },
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        };
    });

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



    React.useEffect(() => {
        const listenerId = Math.random();
        // @ts-ignore
        // const window = window;


        loadDataFromServer();

        //  **  EVENTOS **
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
        const handleWheel = (e: any) => {
            e.preventDefault();
            zoomAdd(e.deltaY < 0 ? 0.02 : -0.02);
        };
        const handleContextMenu = (e: any) => {
            e.preventDefault();
            const el = viewRef.current as HTMLElement;
            const target = e.target;

            if (target === el) {
                // console.log("👉 Click derecho sobre el elemento directamente");
                // @ts-ignore
            } else if (el.contains(target)) {
                return;
            }
            // console.log(e);
            const x = (e.nativeEvent.offsetX) - size.value / 2;
            const y = (e.nativeEvent.offsetY) - size.value / 2;
            // console.log(x, y)

            if (props.onDoublePress) props.onDoublePress({
                absoluteX: e.nativeEvent.clientX,
                absoluteY: e.nativeEvent.clientY,
                pizarraX: x,
                pizarraY: y,
            });
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
        const handleOnKeyDown = (e: any) => {
            if (e.key == "z" && (e.ctrlKey || e.metaKey)) {
                const lchange: any = MDL.pizarra.popLastChange(props.id);
                console.log(lchange)
                if (lchange) {
                    // lchange.nodes.forEach((nodo: any) => {
                    //     serverData.current.nodes.find((n: any) => n.id == nodo.id).x = nodo.x;
                    //     serverData.current.nodes.find((n: any) => n.id == nodo.id).y = nodo.y;
                    // })
                    saveChangeNodes(lchange.nodes, true);
                    applyDataServer();
                }
            }
        }

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

        const sendUpdate = (x, y, s) => {
            // Aquí mandas al servidor

            if (!!serverData.current) {
                if (serverData.current.pizarra_usuario) {
                    const pud = serverData.current.pizarra_usuario.data;
                    if (pud.translateX) pud.translateX = x
                    if (pud.translateY) pud.translateY = y
                    if (pud.scale) pud.scale = s

                }
            }
            console.log("Enviar al servidor:", { x, y, s });
            MDL.pizarra.pizarra_usuario_save({
                id_pizarra: props.id,
                data: {
                    translateX: x,
                    translateY: y,
                    scale: s,
                    layoutWidth: layoutWidth.value,
                    layoutHeight: layoutHeight.value

                }

            })
            // fetch('/api/update', { method: 'POST', body: JSON.stringify({ x, y, s }) })
        };

        const throttledSend = () => {
            const now = Date.now();
            const fps = 2;
            if (now - lastSentRef.current >= (1000 / fps)) { // 30 fps
                lastSentRef.current = now;
                runOnJS(sendUpdate)(translateX.value, translateY.value, scale.value);
            }
        };

        const xListener = translateX.addListener(listenerId, throttledSend);
        const yListener = translateY.addListener(listenerId, throttledSend);
        const sListener = scale.addListener(listenerId, throttledSend);

        viewRef.current.addEventListener("wheel", handleWheel, { passive: false });
        viewRef.current.addEventListener("mousedown", handleMouseDown);
        viewRef.current.addEventListener("mousemove", handleMouseMove);
        viewRef.current.addEventListener("mouseup", handleMouseUp);
        viewRef.current.addEventListener("contextmenu", handleContextMenu);
        // @ts-ignore
        window.addEventListener("keydown", handleOnKeyDown);

        return () => {
            if (viewRef.current) {
                viewRef.current.removeEventListener("wheel", handleWheel);
                viewRef.current.removeEventListener("mousedown", handleMouseDown);
                viewRef.current.removeEventListener("mousemove", handleMouseMove);
                viewRef.current.removeEventListener("mouseup", handleMouseUp);
                viewRef.current.removeEventListener("contextmenu", handleContextMenu);
            }
            translateX.removeListener(listenerId);
            translateY.removeListener(listenerId);
            scale.removeListener(listenerId);
            // @ts-ignore
            window.removeEventListener("keydown", handleOnKeyDown);

        };
    }, []);

    const gesture = Gesture.Simultaneous(panGesture, pinchGesture, doubleTapGesture);
    // const gesture = Gesture.Simultaneous(panGesture, doubleTapGesture);


    return (
        <PizarraContext.Provider value={contextValue}>
            <GestureHandlerRootView style={styles.rootView} onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                layoutWidth.value = width;
                layoutHeight.value = height;
            }}>
                <GestureDetector gesture={gesture}>
                    <Animated.View
                        ref={viewRef}
                        style={[styles.container,
                            animatedStyle
                        ]}>
                        <Animated.View style={[selectStyle]} />
                        <Conexiones />
                        {props.children}
                        <Linea />
                    </Animated.View>
                </GestureDetector>
            </GestureHandlerRootView>
            {!props.hiddeMiniMapa && <PizarraMiniMapa >{props.children}</PizarraMiniMapa>}
        </PizarraContext.Provider>

    );
};

export default Pizarra;

const styles = StyleSheet.create({
    rootView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        justifyContent: "center",
        alignItems: "center",
    },
});


export function usePizarra() {
    return React.useContext(PizarraContext);
}