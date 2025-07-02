import React, { Component, createRef } from 'react';
import { Dimensions, UIManager, findNodeHandle } from 'react-native';
import { SDate, SHr, SImage, SInput, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS
} from 'react-native-reanimated';
import {
    FlatList,
    GestureHandlerRootView,
    ScrollView,
    Gesture,
    GestureDetector
} from 'react-native-gesture-handler';
import MDL from '../../MDL';
import Recargar from '../../Components/Recargar';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import DashboardCard from './Components/DashboardCard';
import Etiqueta from './Components/Etiqueta';
import SIconApp from '../../Assets/SIconApp';
import FormRegistroLead from './Components/FormRegistroLead';

const HEADER_HEIGHT = 30;// Altura del header


const URL = "/crm/dashboard";
export default class Dashboard extends Component {
    stageRefs = {};
    cardRefs = {};
    state = {
        cards: [],
        draggingCard: null,
        dragOffset: { x: 0, y: 0 },
        initialOffset: { x: 0, y: 0 },
        dpto: "all", // Estado para el departamento seleccionado,
    };
    startState = "nuevo"
    constructor(props) {
        super(props);
        //  = SNavigation.getParam("type") == "delivery" ?
        this.dashboardType = SNavigation.getParam("type", "");
        this.startState = SNavigation.getParam("startState", "nuevo");
        this.stages = [
            ...MDL.crm.clienteProyecto.stages.filter(a => a.key != "confirmado"),
            ...MDL.crm.clienteProyecto.stagesDelivery
        ]
        if (this.dashboardType == "delivery") {
            this.stages = MDL.crm.clienteProyecto.stagesDelivery;
        }
        if (this.dashboardType == "ventas") {
            this.stages = MDL.crm.clienteProyecto.stages;
        }
        if (this.dashboardType == "whatsapp") {
            this.stages = MDL.crm.clienteProyecto.stagesWhatsApp;
        }

    }



    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({
            url: URL, permiso: "ver"
        }).then(e => {
            if (!e) {
                SNavigation.goBack();
                return;
            }
            // this.forceUpdate();
            MDL.crm.clienteProyecto.getAll().then(e => {
                this.setState({
                    cards: e,
                });
            }).catch(e => {
                console.error("Error fetching projects:", e);
            })

        })

    }

    stateCardChanged = (lead, stage) => {
        let data = {
            key: lead.key,
            state: lead.state,
            key_usuario_atiende: Model.usuario.Action.getKey(),
        }
        if (lead.state == "rellamada" || lead.state == "delivery_rellamada") {
            data.fecha_rellamada = lead.fecha_rellamada;
        }

        MDL.crm.clienteProyecto.editar(data).then((e) => {
            this.setState(prevState => {
                const updatedCards = prevState.cards.map(card => {
                    if (card.key === lead.key) {
                        return { ...card, ...e };
                    }
                    return card;
                });
                return { cards: updatedCards };
            });
            // if (this.recargar) this.recargar.onPress()
        }).catch((error) => {

        })
    }

    handleDrop = (cardKey, gestureEnd, prevenChange) => {
        if (this.dragginCard) {
            this.dragginCard.setState({
                draggingCard: "",
            });
        }
        console.log("handleDrop", cardKey, gestureEnd);

        if (prevenChange) return;

        if (!MDL.rolesPermisos.getPermiso({
            url: URL,
            permiso: "edit_state"
        })) {
            SNotification.send({
                key: "error",
                title: "Permiso denegado",
                body: "No tienes permiso para editar el estado de los leads.",
                color: STheme.color.danger,
                time: 3000,
            })
            return;
        }
        for (const stageKey in this.stageRefs) {
            const ref = this.stageRefs[stageKey];
            if (!ref?.current) continue;

            const nodeHandle = findNodeHandle(ref.current);
            if (!nodeHandle) continue;

            UIManager.measure(nodeHandle, (x, y, width, height, pageX, pageY) => {
                const isInside =
                    gestureEnd.absoluteX >= pageX &&
                    gestureEnd.absoluteX <= pageX + width &&
                    gestureEnd.absoluteY >= pageY &&
                    gestureEnd.absoluteY <= pageY + height;

                if (isInside) {
                    const stage = this.stages.find((s) => s.key === stageKey);
                    if (stage) {

                        console.log("Card dropped in stage:", stage.name);
                        // Quiero detectar cual es el card mas cercano al drop para colocar el card que estoy soltando luego de el card mas cercano al drop
                        // Obtener las cards del stage destino
                        // const cardsInStage = this.state.cards.filter(c => c.state === stage.name && c.key !== cardKey);
                        const cardsInStage = this.state.cards.filter(c => stage.states.includes(c.state) && c.key !== cardKey);

                        let closestCardKey = null;
                        let minDistance = Infinity;
                        let dropY = gestureEnd.absoluteY;
                        console.log("dropY", dropY, "cardsInStage", cardsInStage);
                        // Medir cada card para encontrar la más cercana al drop
                        const measurePromises = cardsInStage.map(c => {
                            const cardRef = this.cardRefs[c.key];
                            if (!cardRef?.current) return Promise.resolve(null);
                            const node = findNodeHandle(cardRef.current);
                            if (!node) return Promise.resolve(null);

                            return new Promise(resolve => {
                                UIManager.measure(node, (x, y, width, height, pageX, pageY) => {
                                    // Centro vertical de la card
                                    const cardCenterY = pageY - (height / 2);
                                    const distance = Math.abs(dropY - cardCenterY);
                                    resolve({ key: c.key, distance, cardCenterY });
                                });
                            });
                        });

                        Promise.all(measurePromises).then(results => {
                            results.forEach(res => {
                                if (res && res.distance < minDistance) {
                                    minDistance = res.distance;
                                    closestCardKey = res.key;
                                }
                            });
                            console.log("closestCardKey", closestCardKey, "minDistance", minDistance);

                            // Aquí puedes reordenar las cards: insertar el cardKey después de closestCardKey
                            this.setState(prev => {
                                let newCards = prev.cards.filter(c => c.key !== cardKey);
                                const editCard = prev.cards.find(c => c.key === cardKey);

                                const currentStage = this.stages.find(s => {
                                    if (!s.states.includes(editCard.state)) return false;
                                    if (s.filter) {
                                        return s.filter(editCard);
                                    }
                                    return true;
                                });

                                const insertIndex = closestCardKey
                                    ? newCards.findIndex(c => c.key === closestCardKey) + 0
                                    : 0;


                                if (currentStage.key !== stage.key) {
                                    console.log("Soltaste el item con key:", editCard);

                                    let newEditCard = {
                                        ...editCard,
                                        state: stage.states[0], // Cambiar el estado al primer estado del nuevo stage
                                    }
                                    if (stage.onStateChange) {
                                        const response = stage.onStateChange(newEditCard);
                                        if (response) {
                                            newEditCard = { ...newEditCard, ...response };
                                        }
                                    }
                                    if (editCard.state != newEditCard.state) {
                                        newCards.splice(insertIndex, 0, newEditCard);
                                        this.stateCardChanged(newEditCard, stage);
                                    } else {
                                        newCards.splice(insertIndex, 0, { ...editCard, });
                                    }

                                } else {
                                    newCards.splice(insertIndex, 0, { ...editCard, });
                                }

                                return { cards: newCards };
                            });
                        });
                        // Ya no llamar a this.updateCardStage aquí, porque el setState anterior lo hace
                        return;


                        this.updateCardStage(cardKey, stage.name);
                    }
                }
            });
        }
    };

    handleDragStart = (cardKey) => {
        const ref = this.cardRefs[cardKey]?.current;
        if (ref) {

            const card = this.state.cards.find(c => c.key === cardKey);

            const stage = this.stages.find(s => {
                if (!s.states.includes(card.state)) return false;
                if (s.filter) {
                    return s.filter(card);
                }
                return true;
            });
            const stageref = this.stageRefs[stage.key];
            const stageNode = findNodeHandle(stageref.current);

            const node = findNodeHandle(ref);
            if (node) {
                UIManager.measure(node, (x, y, width, height, pageX, pageY) => {
                    console.log("handleDragStart", stageref, stageNode);

                    UIManager.measure(stageNode, (stageX, stageY, stageWidth, stageHeight) => {

                        if (this.dragginCard) {
                            this.dragginCard.setState({
                                draggingCard: cardKey,
                                dragOffset: { x: 0, y: 0 },
                                initialOffset: { x: stageX + 5, y: pageY - 42, w: width }
                            });
                        }
                        // this.setState({
                        //     draggingCard: cardKey,
                        //     dragOffset: { x: 0, y: 0 },
                        //     initialOffset: { x: stageX + 5, y: pageY - 42, w: width }
                        // });
                    })


                });
            }
        }
    };

    handleDragMove = (x, y) => {
        if (this.dragginCard) this.dragginCard.setState({ dragOffset: { x, y } })

        // this.setState({ dragOffset: { x, y } });
    };
    departamentos = [
        { key: "all", content: "Todos" },
        { key: "void", content: "Sin DPTO" },
        { key: "Beni", content: "Beni" },
        { key: "Santa Cruz", content: "Santa Cruz" },
        { key: "Cochabamba", content: "Cochabamba" },
        { key: "La Paz", content: "La Paz" },
        { key: "Oruro", content: "Oruro" },
        { key: "Potosí", content: "Potosí" },
        { key: "Tarija", content: "Tarija" },
        { key: "Chuquisaca", content: "Chuquisaca" },
    ];

    render() {


        console.log("DATAS", this.state.cards);
        return (
            <GestureHandlerRootView style={{ flex: 1, }}>
                <SPage title={'Dashboard ' + this.dashboardType} disableScroll>
                    <SView col={"xs-12"} style={{ padding: 2, height: HEADER_HEIGHT, backgroundColor: STheme.color.background, alignItems: "center" }} row >
                        <SView width={8} />
                        {MDL.rolesPermisos.getPermiso({
                            url: URL,
                            permiso: "crear_lead"
                        }) && <SView row padding={6} card onPress={() => {
                            console.log("Agregar Lead");
                            FormRegistroLead.open({
                                state: this.startState,
                                onRegister: (data) => {
                                    this.componentDidMount();
                                }
                            })

                        }}>
                                <SIconApp width={14} height={14} name='Add' fill='#fff' />
                                <SView width={2} />
                                <SText fontSize={12} bold>Agregar Lead</SText>
                            </SView>
                        }
                        <SView width={8} />
                        <SView width={8} />
                        <SView width={8} />
                        <SView width={8} />
                        <SText fontSize={12} bold>DPTO:</SText>
                        <SView width={4} />
                        <SView center style={{
                            // borderWidth: 1,
                            // borderColor: STheme.color.warning,
                            borderRadius: 4,
                            width: 90,
                            textAlign: 'center',
                            height: 20,
                        }}>
                            <SInput
                                type="select"
                                defaultValue={"all"}
                                center
                                height={20}
                                options={this.departamentos}
                                onChangeText={(val) => {
                                    this.setState({
                                        dpto: val
                                    });
                                    // if (val === "none") {
                                    //     this.componentDidMount();
                                    // } else {

                                    //     console.log("Filtrando por departamento:", val);
                                    // }
                                }}
                                style={{ textAlign: "center" }}
                            />
                        </SView>
                    </SView>
                    <ScrollView horizontal>
                        {this.stages.map((stage) => {
                            if (!this.stageRefs[stage.key]) {
                                this.stageRefs[stage.key] = createRef();
                            }
                            return (
                                <SView
                                    key={stage.key}
                                    ref={this.stageRefs[stage.key]}
                                    style={{ width: 320, margin: 6, userSelect: 'text' }}
                                >
                                    <Stage
                                        stage={stage}
                                        draggingCard={this.state.draggingCard}
                                        cards={this.state.cards.filter((c) => {
                                            if (!stage.states.includes(c.state)) return false;
                                            if (stage.filter) {
                                                if (!stage.filter(c)) return false;
                                            }
                                            if (this.state.dpto == "all") return true;
                                            if (this.state.dpto == "void") {
                                                return !c?.cliente?.departamento;
                                            }
                                            return c?.cliente?.departamento == this.state.dpto

                                        })}
                                        onCardDrop={this.handleDrop}
                                        onDragStart={this.handleDragStart}
                                        onDragMove={this.handleDragMove}
                                        cardRefs={this.cardRefs}
                                    />
                                </SView>
                            );
                        })}
                        <DragginCard ref={ref => this.dragginCard = ref} cards={this.state.cards} />
                        {/* {this.state.draggingCard && (() => {

                        })()} */}
                    </ScrollView>
                    <SView style={{
                        position: "absolute",
                        right: 16,
                        bottom: 32,
                    }}>
                        <Recargar ref={ref => this.recargar = ref} initialTime={60} onFinish={() => {
                            this.componentDidMount();
                        }} />
                    </SView>
                </SPage>
            </GestureHandlerRootView>
        );
    }
}

class DragginCard extends Component {
    state = {

    }
    render() {
        if (!this.state.draggingCard) return null;
        const card = this.props.cards.find(c => c.key === this.state.draggingCard);
        if (!card) return null;
        return (
            <Animated.View style={{
                position: "absolute",
                top: this.state.dragOffset.y + this.state.initialOffset.y + 2 - HEADER_HEIGHT,
                left: this.state.dragOffset.x + this.state.initialOffset.x,
                width: this.state.initialOffset.w,
                zIndex: 9999,
                pointerEvents: 'none',
            }}>
                <DashboardCard data={card} />
            </Animated.View>
        );
    }
}
const Stage = ({ stage, cards, onCardDrop, onDragStart, onDragMove, draggingCard, cardRefs }) => {
    return (
        <SView style={{
            backgroundColor: STheme.color.text + "11",
            borderColor: STheme.color.card,
            borderWidth: 1,
            borderRadius: 8,
            height: "100%",
        }}>
            <SView col={"xs-12"} padding={8} center>
                <SView row col={"xs-12"} center>
                    <SView style={{ backgroundColor: stage.color, width: 20, height: 20, borderRadius: 20 }} />
                    <SView width={8} />
                    <SText bold>{stage.name}</SText>
                    <SView flex />
                    <SText bold card fontSize={10} padding={4}>{cards.length}</SText>
                </SView>
                {/* <SHr /> */}
                <SView row col={"xs-12"}>{stage.states.map((state, index) => <Etiqueta tipo_leads={state} size={8} style={{ marginRight: 4, marginTop: 4 }} />)}</SView>
            </SView>
            <FlatList
                contentContainerStyle={{
                    padding: 4,
                }}
                data={cards}
                renderItem={({ item }) => {
                    if (!cardRefs[item.key]) {
                        cardRefs[item.key] = createRef();
                    }
                    return (
                        <DraggableCarta
                            key={item.key}
                            card={item}
                            onDrop={onCardDrop}
                            onDragStart={onDragStart}
                            onDragMove={onDragMove}
                            ref={cardRefs[item.key]}
                        />
                    );
                }}
            />
            {/* <ScrollView

                contentContainerStyle={{
                    padding: 4,
                }}
                stickyHeaderIndices={1}

            >
                {cards.map((card) => {
                    if (!cardRefs[card.key]) {
                        cardRefs[card.key] = createRef();
                    }
                    return (
                        <DraggableCarta
                            key={card.key}
                            card={card}
                            onDrop={onCardDrop}
                            onDragStart={onDragStart}
                            onDragMove={onDragMove}
                            ref={cardRefs[card.key]}
                        />
                    );
                })}
            </ScrollView> */}
        </SView>

    );
};

const DraggableCarta = React.forwardRef(({ card, onDrop, onDragStart, onDragMove }, ref) => {
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .onBegin(() => {
            runOnJS(onDragStart)(card.key);
        })
        .onUpdate((e) => {
            offsetX.value = e.translationX;
            offsetY.value = e.translationY;
            runOnJS(onDragMove)(e.translationX, e.translationY);
        })
        .onFinalize(() => {
            // Aquí puedes manejar la lógica de soltar la carta
            // Por ejemplo, podrías llamar a onDrop con el key de la carta y las coordenadas finales
            runOnJS(onDrop)(card.key, null, true);
        })
        .onEnd((e) => {
            runOnJS(onDrop)(card.key, e);
            // offsetX.value = withSpring(0);
            // offsetY.value = withSpring(0);
            offsetX.value = 0;
            offsetY.value = 0;
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: offsetX.value },
                { translateY: offsetY.value },
            ],
            zIndex: offsetY.value !== 0 ? 100 : 1,
        };
    });



    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View ref={ref} style={[{ paddingBottom: 8 }, animatedStyle]} >
                <DashboardCard data={card} />
            </Animated.View>
        </GestureDetector>
    );
});