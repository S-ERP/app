import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import {
    FlatList,
    GestureHandlerRootView,
    ScrollView,
    Gesture,
    GestureDetector
} from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS
} from 'react-native-reanimated';
// import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import Components from '../../Components';
import Model from '../../Model';
// import SIconApp from '../../Assets/SIconApp';
import MDL from '../../MDL';
import Etiqueta from './Components/Etiqueta';
import DashboardCard from './Components/DashboardCard';
import FormRegistroTipoCliente from '../crm/Components/FormRegistroTipoCliente';
import SSocket from 'servisofts-socket';
// import GraficoEstados from './graficos/GraficoEstados';

const HEADER_HEIGHT = 30;// Altura del header

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
                    <SText bold onPress={() => {
                        FormRegistroTipoCliente.open({
                            defaultData: stage,
                            onRegister: () => {
                                // this.loadData()
                            },
                            onActualizar: () => {
                                // this.loadData()
                            },

                        })
                    }}>{stage.titulo}</SText>
                    <SView flex />
                    <SText bold card fontSize={10} padding={4}>{cards?.length}</SText>
                </SView>
                <SText col={"xs-12"} fontSize={10} color={STheme.color.lightGray}>{stage.descripcion}</SText>
                {/* <SHr /> */}
                <SView row col={"xs-12"}>{stage?.states?.map((state, index) => <Etiqueta tipo_leads={state} size={8} style={{ marginRight: 4, marginTop: 4 }} />)}</SView>

                <SText fontSize={10} underLine onPress={() => {
                    SNavigation.navigate("/crm/cliente", {
                        onSelect: (e) => {
                            console.log(e);
                            MDL.crm.tipoCliente.addToCliente({
                                key_cliente: e.key,
                                key_tipo_cliente: stage.key
                            }).then(e => {
                                console.log(e);
                            }).catch(e => {
                                console.error(e);
                            })
                        }
                    })
                }}>{"Agregar Cliente"}</SText>
            </SView>
            <FlatList
                contentContainerStyle={{
                    padding: 4,
                }}
                data={cards}
                renderItem={({ item }) => {
                    // if (!cardRefs[item.key]) {
                    //     cardRefs[item.key] = createRef();
                    // }
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

export default class root extends Component {
    stageRefs = {};
    cardRefs = {};
    constructor(props) {
        super(props);
        this.state = {
            cards: [],
            draggingCard: null,
            dragOffset: { x: 0, y: 0 },
            initialOffset: { x: 0, y: 0 },
            dpto: "all", // Estado para el departamento seleccionado,
            tipo_cliente: []
        };
        this.stages = [
            {
                "key": "interes_compuesto",
                "name": "Interes Compuesto",
                "color": "#B8B8B8",
                "states": [],
                "cards": [{
                    "estado": 1,
                    "codigo": "AQ1",

                    "fecha_edit": "2025-09-26T16:01:06.298",
                    "instrucciones_especiales": null,
                    "fecha_entrega": null,
                    "fecha_on": "2025-09-26T16:01:06.041",
                    "key_proyecto": "829c2eb6-03b5-4793-b021-38da686bb062",
                    "notas": null,
                    "key_campana": "8b0d99af-08bc-424b-977f-f7aeedf3c037",
                    "proyecto": {
                        "descripcion": "Aun no definido",
                        "estado": 1,
                        "codigo": "AQ",
                        "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
                        "fecha_inicio": null,
                        "key_empresa": "1ed39f1d-99bb-4b6e-a754-61a48401e269",
                        "fecha_on": "2025-09-26T15:52:43.213",
                        "key_turno": null,
                        "nombre": "Los Tajibos",
                        "key_whatsapp_device": "09ab2fc7-f7da-40c1-b0e2-b2b1b7d98c98",
                        "fecha_fin": null,
                        "guion": "Aun no definido",
                        "key": "829c2eb6-03b5-4793-b021-38da686bb062"
                    },
                    "key_usuario_atiende": null,
                    "comentario": "",
                    "carrito": null,
                    "tipo_movimiento_lead": null,
                    "fecha_rellamada": null,
                    "campana": {
                        "descripcion": "¡Domingo en Los Tajibos! ☀️\nAprovechá nuestra tarifa especial ideal para escaparte, refrescarte y descansar con amigos o familia.",
                        "estado": 1,
                        "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
                        "fecha_on": "2025-09-26T15:53:12.913",
                        "key_proyecto": "829c2eb6-03b5-4793-b021-38da686bb062",
                        "nombre": "WhatsApp Cadena",
                        "key": "8b0d99af-08bc-424b-977f-f7aeedf3c037"
                    },
                    "cliente": {
                        "descripcion": null,
                        "apellidos": null,
                        "distrito": null,
                        "estado": 1,
                        "key_usuario": "8b4846a4-f730-446d-9693-9d1965c229af",
                        "key_empresa": "1ed39f1d-99bb-4b6e-a754-61a48401e269",
                        "lng": null,
                        "fecha_on": "2025-09-26T16:01:06.035",
                        "direccion": null,
                        "fecha_nacimiento": null,
                        "razon_social": null,
                        "provincia": null,
                        "nombres": "CBN",
                        "tipo": "Empresa",
                        "currier": null,
                        "correo": null,
                        "nit": null,
                        "departamento": "Santa Cruz",
                        "telefono": "+591 73138212",
                        "sexo": null,
                        "key_servicio": null,
                        "key": "618239c9-0127-475a-ada3-1ab408e593a0",
                        "lat": null
                    },
                    "key_cliente": "618239c9-0127-475a-ada3-1ab408e593a0",
                    "state": "en_proceso_whatsapp",
                    "key_tipo_movimiento_lead": null,
                    "key": "cea6b282-199d-4efe-b8ac-f1f2bd4fe817",
                    "entrega_express": null
                },
                {
                    "estado": 1,
                    "codigo": "AQ4",
                    "fecha_edit": "2025-10-14T00:59:50.535",
                    "instrucciones_especiales": null,
                    "fecha_entrega": null,
                    "fecha_on": "2025-09-29T18:50:13.548",
                    "key_proyecto": "829c2eb6-03b5-4793-b021-38da686bb062",
                    "notas": null,
                    "key_campana": "8b0d99af-08bc-424b-977f-f7aeedf3c037",
                    // "proyecto": {
                    //     "descripcion": "Aun no definido",
                    //     "estado": 1,
                    //     "codigo": "AQ",
                    //     "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
                    //     "fecha_inicio": null,
                    //     "key_empresa": "1ed39f1d-99bb-4b6e-a754-61a48401e269",
                    //     "fecha_on": "2025-09-26T15:52:43.213",
                    //     "key_turno": null,
                    //     "nombre": "Los Tajibos",
                    //     "key_whatsapp_device": "09ab2fc7-f7da-40c1-b0e2-b2b1b7d98c98",
                    //     "fecha_fin": null,
                    //     "guion": "Aun no definido",
                    //     "key": "829c2eb6-03b5-4793-b021-38da686bb062"
                    // },
                    "key_usuario_atiende": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
                    "comentario": "",
                    "carrito": null,
                    "tipo_movimiento_lead": null,
                    "fecha_rellamada": null,
                    // "campana": {
                    //     "descripcion": "¡Domingo en Los Tajibos! ☀️\nAprovechá nuestra tarifa especial ideal para escaparte, refrescarte y descansar con amigos o familia.",
                    //     "estado": 1,
                    //     "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
                    //     "fecha_on": "2025-09-26T15:53:12.913",
                    //     "key_proyecto": "829c2eb6-03b5-4793-b021-38da686bb062",
                    //     "nombre": "WhatsApp Cadena",
                    //     "key": "8b0d99af-08bc-424b-977f-f7aeedf3c037"
                    // },
                    "cliente": {
                        "descripcion": null,
                        "apellidos": null,
                        "distrito": null,
                        "estado": 1,
                        "key_usuario": null,
                        "key_empresa": "1ed39f1d-99bb-4b6e-a754-61a48401e269",
                        "lng": null,
                        "fecha_on": "2025-09-29T18:50:13.535",
                        "direccion": null,
                        "fecha_nacimiento": null,
                        "razon_social": null,
                        "provincia": null,
                        "nombres": "Juan",
                        "tipo": "Persona",
                        "currier": null,
                        "correo": null,
                        "nit": null,
                        "departamento": null,
                        "telefono": "+591 78158071",
                        "sexo": "Masculino",
                        "key_servicio": null,
                        "key": "9014fdfe-ae8f-404c-bdfb-1b400a9330a1",
                        "lat": null
                    },
                    "key_cliente": "9014fdfe-ae8f-404c-bdfb-1b400a9330a1",
                    "state": "vencido",
                    "key_tipo_movimiento_lead": null,
                    "key": "fe789a4c-b03f-4615-921c-0e07a5db27b7",
                    "entrega_express": null
                }
                ]
            },
            {
                "key": "proveedores_snack",
                "name": "Proveedores Snack",
                "color": "#71AF4A",
                "states": [],
                "cards": []
            },
            {
                "key": "proveedores_calistenia_temporal",
                "name": "Proveedores Calistenia Temporal",
                "color": "#EF8C38",
                "cards": [],
                "states": []
            },
            {
                "key": "proveedores_calistenia_mensual",
                "name": "Proveedores Calistenia Mensual",
                "color": "#2980b9",
                "cards": [],
                "states": []
            },

        ]
    }
    componentDidMount() {
        this.loadData();

        MDL.rolesPermisos.loadPermissions().then(() => {
            // MDL.crm.clienteProyecto.get_en_proceso()
            this.forceUpdate();
        })

    }
    async loadData() {
        const clientes = await MDL.crm.cliente.getAll();
        const tipos = await MDL.crm.tipoCliente.getAll();
        this.state.tipo_cliente = tipos;
        this.state.clientes = clientes;
        this.forceUpdate();

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
        console.log("STAGES", this.stages);
        return <SPage title={'Agenda de contactos'}  >
            {/* <SHr height={32} />
   <Components.Container>
    <Components.empresa.Select disabled />
   </Components.Container>
   <SHr height={32} /> */}
            <SText onPress={() => {
                FormRegistroTipoCliente.open({
                    onRegister: () => {
                        this.loadData();
                    },
                    onActualizar: () => {
                        this.loadData();
                    }
                })
            }}>{"Registrar nuevo tipo"}</SText>
            <SHr h={12} />
            <ScrollView horizontal>
                {this.state.tipo_cliente.map((stage) => {
                    // if (!this.stageRefs[stage.key]) {
                    //     this.stageRefs[stage.key] = createRef();
                    //     console.log("CREO STAGE", stage.key);
                    // }
                    return (
                        <SView
                            key={stage.key}
                            ref={this.stageRefs[stage.key]}
                            style={{ width: 320, margin: 6, userSelect: 'text' }}
                        >
                            <Stage
                                stage={stage}
                                draggingCard={this.state.draggingCard}
                                // cards={this.stages.cards.filter((c) => {
                                //     if (!this.stages.states.includes(c.state)) return false;
                                //     if (this.stages.filter) {
                                //         if (!this.stages.filter(c)) return false;
                                //     }
                                //     if (this.state.dpto == "all") return true;
                                //     if (this.state.dpto == "void") {
                                //         return !c?.cliente?.departamento;
                                //     }
                                //     return c?.cliente?.departamento == this.state.dpto

                                // })}
                                cards={this.state.clientes.filter((c) => {
                                    if (!c.tipo_cliente) return false;
                                    var isValid = false;
                                    c.tipo_cliente.forEach(tc => {
                                        if (tc.key == stage.key) {
                                            isValid = true;
                                        }
                                    });


                                    // if (!.includes(c.state)) return false;

                                    return isValid;
                                })}
                                onCardDrop={this.handleDrop}
                                onDragStart={this.handleDragStart}
                                onDragMove={this.handleDragMove}
                                cardRefs={this.cardRefs}
                            />
                        </SView>
                    );
                })}
            </ScrollView>
        </SPage>
    }
}

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
