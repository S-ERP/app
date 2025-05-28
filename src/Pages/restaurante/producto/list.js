import React, { Component } from 'react';
import { View, Text, ScrollView, StyleSheet, SectionList, Vibration, Switch, UIManager, Dimensions, RefreshControl } from 'react-native';
import { SHr, SIcon, SImage, SLoad, SNavigation, SNotification, SPage, SPopup, SSwitch, SText, STheme, SThread, SView } from 'servisofts-component';
import TopBar from '../../../Components/TopBar';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';
import restaurante from '..';
import SelectHabilitado from './Components/SelectHabilitado';
import ListItem from './Components/ListItem';
import CrearNuevo from './Components/CrearNuevo';
// import Roles from '../../../Roles';
import PageTitle from '../../../Components/PageTitle';



const renderSectionSeparator = () => (
    <View style={styles.sectionSeparator} />
);


export const BtnEditar = ({ onPress }) => {
    return <SView width={30} height={30} onPress={onPress}>
        <SImage src={require("../../../Assets/img/EDITAR2.png")} />
    </SView>
}


const hanlePressCrear = (e, key_restaurante) => {
    Vibration.vibrate(100)
    e.currentTarget.measure((x, y, width, height, pageX, pageY) => {
        const key_popup = "popupkey";
        const windowheight = Dimensions.get("window").height
        const itemWidth = 140;
        const itemHeight = 70;
        let top = pageY + height;
        if (itemHeight + top > windowheight) {
            top = windowheight - itemHeight;
        }
        let left = pageX - itemWidth + width;
        SPopup.open({
            key: key_popup,
            type: "2",
            content: <CrearNuevo
                style={{
                    left: left,
                    top: top,
                    width: itemWidth,
                    height: itemHeight,
                }}
                onSelect={(e) => {
                    SPopup.close(key_popup)
                    if (e.key == "producto") {
                        SNavigation.navigate("/restaurante/producto/edit", { key_restaurante: key_restaurante })
                    }
                    if (e.key == "categoria") {
                        SNavigation.navigate("/restaurante/categoria_producto/new", { key_restaurante: key_restaurante })
                    }
                }}
            />
        })
    })
}

export default class list extends Component {
    static TOPBAR = <>
        <TopBar type={"usuario"} />
        {/* <SView backgroundColor={"#96BE00"} height={20} col={"xs-12"}></SView> */}
    </>
    static FOOTER = <>
        <SView flex />
        {/* <PBarraFooter url={"menu"} /> */}
    </>
    static INSTANCE;
    constructor(props) {
        super(props);
        this.state = {
            image_time: new Date().getTime(),
            openSections: {}
        };
        // this.key_sucursal = SNavigation.getParam("key_sucursal")
        list.INSTANCE = this;
    }


    onChangeProducto = (prd) => {
        if (prd && this.state.data) {
            const categoria = this.state.data.find(a => a.key == prd.key_categoria_producto);
            if (categoria) {
                const prdIndex = categoria.productos.findIndex(p => p.key == prd.key);
                if (prdIndex > -1) {
                    categoria.productos[prdIndex] = {
                        ...categoria.productos[prdIndex],
                        ...prd
                    }
                    this.setState({ ...this.state })

                } else {
                    // categoria.productos.push({
                    //     ...prd
                    // })
                    // this.setState({ ...this.state })
                    this.getData();
                }

                new SThread(500, "reload_img", true).start(() => {
                    this.setState({ image_time: new Date().getTime(), })
                })
            }
        }
    }

    componentDidMount() {
        list.INSTANCE = this;
        // if (!this.key_restaurante) {
        // SNavigation.goBack();
        // return;
        // }
        // new SThread(100).start(() => {
        //     this.setState({ ready: true })
        // })

        // Roles.getPermiso({
        //     key_rol: Model.restaurante.Action.getSelectKeyRol(),
        //     url: "/_partner/productos",
        //     permiso: "ver"
        // }).then(e => {
        //     this.setState({ ready: true })
        //     console.log(e);
        // }).catch(e => {
        //     SNotification.send({
        //         title: "Acceso denegado",
        //         body: "No tienes permisos para ver esta pagina.",
        //         color: STheme.color.danger,
        //         time: 5000,
        //     })
        //     SNavigation.goBack();
        // })
        this.getData();

    }

    async getData() {
        // const restaurante = Model.restaurante.Action.getSelect();
        // console.log(restaurante)


        // const restaurante = await SSocket.sendPromise({
        //     component: "restaurante",
        //     type: "getAllCategoriasYProductos",
        //     key_restaurante: this.key_restaurante
        // })
        const categorias = await SSocket.sendPromise({
            service:"inventario",
            component: "producto",
            type: "getCategoriasProductosDetallePartner",
            // key_sucursal: this.key_sucursal
            key_empresa: Model.empresa.Action.getKey(),
        })

        // const productos = await SSocket.sendPromise({
        //     component: "producto",
        //     type: "getAll",
        //     key_restaurante: this.key_restaurante
        // })
        if (!categorias.data) {
            categorias.data = []
        };

        let ARRAY = categorias.data;
        Object.values(categorias.data).map(categoria => {
            // const data = Object.values(productos.data).filter(prd => prd.estado > 0 && prd.key_categoria_producto == categoria.key)
            if (categoria.productos) {
                categoria.data = categoria.productos;
                categoria.cantidad = categoria.data.length;
            } else {
                categoria.data = []
                categoria.cabntidad = 0;
            }

            // ARRAY.push({
            //     ...categoria,
            //     cantidad: data.length,
            //     data: data

            // })
            // categoria.productos = 
        })
        ARRAY = ARRAY.sort((a, b) => a.index - b.index)

        // this.state.openSections[ARRAY[0].key] = ARRAY[0]

        this.setState({ data: ARRAY })
    }
    render() {
        // if (!this.state.ready) return <SLoad />
        if (!this.state.data) return <SLoad />
        const renderItem = (itemprops) => (
            <ListItem {...itemprops} key_restaurante={this.key_restaurante}
                image_time={this.state.image_time}
                onChange={e => {
                    this.setState({ ...this.state })
                }} />
        );

        const renderHeader = () => (
            <SView col={"xs-12"}>
                <PageTitle title={"MENÚ"} />
                {/* <SText font='Montserrat-Bold' fontSize={16}>MENÚ</SText> */}
                {/* <SText fontSize={12} font='Montserrat-Bold' color={STheme.color.primary}>{this.state?.restaurante?.nombre}</SText> */}
                <SView col={"xs-12"} style={{
                    alignItems: "flex-end"
                }}>
                    <SView width={140} height={26} center backgroundColor={STheme.color.primary} style={{
                        borderRadius: 4
                    }} onPress={e => hanlePressCrear(e, this.key_restaurante)}>
                        <SText fontSize={12} color={STheme.color.white}>+ Crear Nuevo</SText>
                    </SView>
                </SView>
                <SHr h={16} />
            </SView>
        )
        const renderSectionHeader = ({ section }) => {
            let habilitado = false;
            section.productos.map(a => {
                if (a.habilitado) {
                    habilitado = true;
                }
            })
            return <SView width={"100%"} row>
                <SView style={[styles.header, this.state.openSections[section.key] ? {
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                } : {

                }]} onPress={() => {
                    Vibration.vibrate(300)
                    if (!this.state.openSections[section.key]) {
                        this.state.openSections[section.key] = section
                    } else {
                        delete this.state.openSections[section.key]
                    }
                    this.setState({ ...this.state })
                }} row>
                    <SView flex>
                        <SText style={{ fontSize: 14, }} font='Montserrat-Bold'>{section?.nombre}</SText>
                        <SText color={STheme.color.gray} fontSize={12}>{section.cantidad > 0 ? section.cantidad + " productos" : "Sin productos"}</SText>
                    </SView>
                    <SView height center row width={60}>
                        <SView height center >
                            <SView width={44} >
                                <SSwitch
                                    value={!!habilitado}
                                    color={STheme.color.white}
                                    // backgroundColor={"#DDD"}
                                    // colorActive={"#fff"}
                                    scale={2.3}
                                    size={16}
                                    onChange={e => {
                                        SPopup.confirm({
                                            title: habilitado ? "Se deshabilitaran todos los productos" : "Se habilitaran todos los pruductos",
                                            message: "",
                                            onPress: () => {
                                                let dataToSend = [];
                                                let configToSend = {}
                                                if (habilitado) {
                                                    // Desabilitamos
                                                    configToSend = {
                                                        habilitado: "false",
                                                        fecha_habilitacion_automatica: "null"
                                                    }

                                                } else {
                                                    // Habilitamos
                                                    configToSend = {
                                                        habilitado: "true",
                                                        fecha_habilitacion_automatica: "null"
                                                    }
                                                }
                                                section.productos.map((prd) => {
                                                    dataToSend.push({
                                                        key: prd.key,
                                                        ...configToSend
                                                    })
                                                })
                                                SSocket.sendPromise({
                                                    component: "producto",
                                                    type: "editarAll",
                                                    key_usuario: Model.usuario.Action.getKey(),
                                                    data: dataToSend
                                                }).then(e => {
                                                    section.productos.map((prd) => {
                                                        prd.habilitado = configToSend.habilitado == "true"
                                                        prd.fecha_habilitacion_automatica = configToSend.fecha_habilitacion_automatica

                                                    })
                                                    this.setState({ ...this.state });
                                                    // item.habilitado = e.data.habilitado;
                                                    // item.fecha_habilitacion_automatica = e.data.fecha_habilitacion_automatica;
                                                    // if (onChange) onChange()
                                                    console.log(e);
                                                }).catch(e => {
                                                    console.error(e);
                                                })
                                            }
                                        })
                                    }}
                                />
                            </SView>
                        </SView>
                        <SView height center >
                            <SView width={16} height={16} style={{
                                transform: [
                                    { rotate: this.state.openSections[section.key] ? "90deg" : "270deg" }
                                ]
                            }}>
                                <SIcon name='Back' fill={STheme.color.gray} />
                            </SView>
                        </SView>
                    </SView>
                </SView>
                <SView width={40} height style={{
                    justifyContent: "center",
                    alignItems: "flex-end"
                }}>
                    {(!this.state.openSections[section.key] && !!section.key_empresa) ? <BtnEditar onPress={() => {
                        SNavigation.navigate("/restaurante/categoria_producto/edit", { key_empresa: this.key_empresa, pk: section.key })
                    }} /> : null}
                </SView>
            </SView>
        }
        const renderEmptySection = () => (
            <View style={styles.emptySection} />
        );

        return <SectionList
            refreshControl={<RefreshControl refreshing={false} onRefresh={(e) => {
                this.setState({ data: null })
                this.componentDidMount();
            }} />}
            contentContainerStyle={{
                padding: 8,
                width: "100%",

            }}
            sections={this.state.data.map(sec => ({
                ...sec,
                data: this.state.openSections[sec.key] ? sec.data : [renderEmptySection]
            }))}
            keyExtractor={(item, index) => item.key}
            // SectionSeparatorComponent={renderSectionSeparator}
            renderItem={({ item, index, section }) => (typeof item === 'function' ? item() : renderItem({ item, index, section }))}
            renderSectionHeader={renderSectionHeader}
            ListHeaderComponent={renderHeader}
            // ItemSeparatorComponent={() => <View style={styles.sectionSeparator} />}
            SectionSeparatorComponent={(d) => {
                if (d.trailingItem) return null;
                return <View style={styles.sectionSeparator} />
            }}

        />
    }
}

const styles = StyleSheet.create({

    title: {
        fontSize: 16,
    },

    header: {
        flex: 1,
        padding: 8,
        paddingTop: 16,
        paddingBottom: 16,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        borderWidth: 1,
        borderColor: "#DDD",
        // backgroundColor: '#f4f4f4',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    sectionSeparator: {
        height: 12,
        width: "100%",
    },
    emptySection: {
        height: 0,
    },
});
