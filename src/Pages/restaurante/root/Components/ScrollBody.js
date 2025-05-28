import React, { useState } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    interpolate,
    interpolateColor,
} from 'react-native-reanimated';
import { SButtom, SGradient, SHr, SNavigation, SText, STheme, SView } from 'servisofts-component';
import { Restaurante } from '../../../../Components';
import QuePuedeTocar from './QuePuedeTocar';
import ListaProductos from '../../Components/ListaProductos';
import { RefreshControl } from 'react-native';

export default ({ data, onRefresh, pendiente }) => {

    const [refreshing, setRefreshing] = useState(false);

    const env = {
        portada: {
            hidde_size: 40,
            h: 160,
        },
        categorias: {
            hidde_size: 610,
            h: 50,
        },
        height_image_profile: 60,
        padding_left: 8,
    }
    const translationY = useSharedValue(0);


    const scrollHandler = useAnimatedScrollHandler((event) => {
        translationY.value = event.contentOffset.y;
    });

    const Bar1 = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: interpolate(translationY.value,
                        [0, env.portada.hidde_size, env.portada.hidde_size + 50],
                        [0, 0, 50]
                    ),
                },
            ],
        };
    });
    const Bar2 = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: interpolate(translationY.value,
                        [0, env.categorias.hidde_size, env.categorias.hidde_size + 50],
                        [0, 0, 50]
                    ),
                },
            ],
        };
    });

    const TextStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: interpolate(translationY.value,
                        [0, env.portada.h, Infinity],
                        [80, 0, 0]
                    ),
                },
                {
                    translateX: interpolate(translationY.value,
                        [0, env.portada.h, Infinity],
                        [-env.height_image_profile - env.padding_left, 0, 0]
                    ),
                },
            ],
        };
    })


    const darkopacity = useAnimatedStyle(() => {
        return {
            opacity: interpolate(translationY.value,
                [0, env.portada.h, Infinity],
                [0, 0.5, 0.5]
            ),
        };
    })


    const onRefreshHandle = () => {
        setRefreshing(true);
        if (onRefresh) onRefresh()
        // Simula una tarea asincrónica (por ejemplo, una solicitud de red)
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };
    return (
        <Animated.ScrollView
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            bounces={false}
            // refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshHandle} />}
            overScrollMode="never"
        >
            <Animated.View style={[{ width: "100%", height: env.portada.h, zIndex: 999, backgroundColor: STheme.color.card }, Bar1]}>
                <Restaurante.FotoPortada data={data ?? {}} height={env.portada.h} />
                <Animated.View style={[{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#000",
                },
                    darkopacity
                ]} />

                <Animated.View style={[{
                    position: "absolute",
                    width: env.height_image_profile,
                    height: env.height_image_profile,
                    bottom: 10,
                    left: env.padding_left
                },
                ]} >
                    <Restaurante.FotoPerfil
                        data={data}
                        style={{
                            borderRadius: 100,
                            position: 'absolute',
                        }}
                    />
                </Animated.View>
                <Animated.Text style={[{
                    position: "absolute",
                    bottom: 10 + (env.height_image_profile / 2) - 10,
                    left: env.height_image_profile + (env.padding_left * 2),
                    fontSize: 18,
                    fontFamily: 'Montserrat-SemiBold',
                    color: STheme.color.text,
                },
                    TextStyle
                ]}>{data?.razon_social}</Animated.Text>
            </Animated.View>
            <SView width={"100%"} height={100} >
                <SHr h={50} />
                <SView col={"xs-12"} style={{alignItems:"flex-end",paddingRight:15}} >
                    <SButtom type='secondary' onPress={() => {
                        SNavigation.navigate("/restaurante/producto")
                    }
                    } >{"MODIFICAR"}</SButtom>
                </SView>
                {/* <Restaurante.ProximoHorario
                    data={data}
                    style={{ paddingLeft: env.padding_left }}
                    col={'xs-12'}
                /> */}
                {/* <SView style={{
                    position: "absolute",
                    top: 20,
                    right: 10,
                }}>
                    {!!data?.tapeke_deshabilitado ? null : <Restaurante.Precio horario={data?.horario} />}
                </SView> */}
                {/* <SGradient colors={["#000", "#fff"]} /> */}
            </SView>
            <SHr h={10}  />
            <SHr h={20} color={STheme.color.card} />

            {/* <SView width={"100%"} height={230} style={{ paddingLeft: env.padding_left, paddingRight: env.padding_left, alignItems: "center" }} >
                <QuePuedeTocar data={data} />
                <SGradient colors={["#000", "#fff"]} />
            </SView> */}
            {/* <SHr h={20} color={STheme.color.card} /> */}
            <ListaProductos
                pendiente={pendiente}
                key_empresa={data?.key}
                headerStyle={Bar2}
            // ref={ref => this.listaProductos = ref}
            />
            <SView width={"100%"} height={10} >
            </SView>
        </Animated.ScrollView >
    );
}