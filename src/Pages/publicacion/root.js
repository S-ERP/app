import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ScrollView } from 'react-native'

import { SButtom, SDate, SHr, SIcon, SImage, SList, SLoad, SNavigation, SPage, SScrollView2, SText, STheme, SView } from 'servisofts-component';
import { BottomNavigator, TopBar, Publicacion } from './Components';
import Model from '../../Model';
import SSocket from 'servisofts-socket'

import { FlatList } from 'react-native';


class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            page: 0,
            limit: 50,
            usuarios: {}
        };
    }

    ref = {}
    onViewableItemsChanged = ({ viewableItems, changed }) => {
        // Aquí puedes detectar los ítems que salieron de la vista y pausar su reproducción
        let makeVisible = false;
        changed.forEach(item => {
            if (!this.ref[item.key]) return;
            if (!item.isViewable) {
                if (this.ref[item.key].handleClosed) {
                    this.ref[item.key].handleClosed()

                }
            } else {
                if (this.ref[item.key].handleOpen) {
                    this.ref[item.key].handleOpen()
                }
            }
        });
    }

    componentDidMount() {
        if (this.state.loading) return;

        if (this.state.end) return;
        this.setState({ loading: true })
        SSocket.sendPromise({
            component: "publicacion",
            type: "getAll",
            pagina: this.state.page,
            limit: this.state.limit,
            key_usuario: Model.usuario.Action.getKey(),
        }).then((e) => {
            // this.state.loading = false;
            this.setState({ loading: false })
            if (!e.data) {
                return;
            }
            if (Object.values(e.data).length <= 0) {
                this.state.end = true;
                return;
            }
            e.data = {
                ...Model.publicacion.Action._getReducer()?.data ?? {},
                ...e.data
            }
            // e.type = "getAll"
            Model.publicacion.Action._dispatch(e);
            this.state.page += 1;

            const arr = Object.values(e.data)
            // this.setState({ data: arr })
            let userKeys = arr.map(val => val.key_usuario);
            const uniqueArr = [...new Set(userKeys)];
            SSocket.sendPromise({
                ...Model.usuario.info,
                "component": "usuario",
                "type": "getAllKeys",
                "estado": "cargando",
                "keys": uniqueArr
            }).then((e) => {
                this.setState({ usuarios: e.data })
            }).catch((e) => {
                console.error(e)
            })
        }).catch(e => {
            this.state.loading = false;
        })
        // Model.usuario.Action.getAll({ force: true })

    }
    clearData(resolv) {
        // Model.sucursal.Action.CLEAR();
        this.ref = {}
        this.state.page = 0;
        this.state.end = false;
        Model.publicacion.Action.CLEAR();
        // Model.usuario.Action.getAll({ force: true, fecha_edit: "1989-01-01T00:00:01" });
        Model.usuario.Action.CLEAR();
        this.componentDidMount();

    }




    // renderPublicidad() {
    //     return <>
    //         <SView col={"xs-12"} card height={60} center
    //             style={{ borderWidth: 2, borderColor: STheme.color.secondary, borderRadius: 20, overflow: "hidden" }}
    //             onPress={() => {
    //                 SNavigation.navigate("/servicio")
    //             }}
    //         >
    //             <SImage src={require('../Assets/img/fpublicidad.png')} style={{ resizeMode: 'cover', position: 'absolute' }} />
    //             <SHr height={5} />
    //             <SIcon name='Btnpaquete' fill={STheme.color.text} height={25} />
    //             <SHr height={5} />
    //             <SText font="Oswald-Regular" fontSize={11}> &lt; PAGA SIMPLE Y RÁPIDO CON QR &gt; </SText>
    //         </SView>
    //     </>
    // }

    renderPublicaciones() {
        // let publicaciones = Model.publicacion.Action.getAll({
        //     key_usuario: Model.usuario.Action.getKey()
        // // });
        // const arr = Object.values(publicaciones).sort((a, b) => new SDate(a.fecha_on).isBefore(new SDate(b.fecha_on)) ? 1 : -1)



        const handleRefresh = async () => {
            this.clearData();
        };
        let data = Model.publicacion.Action._getReducer()?.data ?? {};
        // if (!this.state.data) return <SLoad />
        console.log("data", data)
        if (Object.values(data).length <= 0) return <><SText>No hay publicaciones</SText><SButtom onPress={() => {
            SNavigation.navigate("/publicacion/add")
        }}>Nueva publicación</SButtom></>
        return <>
            <FlatList
                onRefresh={handleRefresh}
                refreshing={this.state.refreshing}
                // scrollEnabled={false}
                ref={ref => this.list = ref}
                pinchGestureEnabled={false}
                data={[...Object.values(data).sort((a, b) => new SDate(a.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime() >= new SDate(b.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime() ? -1 : 1)]}
                style={{
                    width: "100%",
                }}
                onViewableItemsChanged={this.onViewableItemsChanged}
                viewabilityConfig={{
                    minimumViewTime: 700,
                    itemVisiblePercentThreshold: 75
                }}
                onEndReachedThreshold={0.3}

                // onViewableItemsChanged={onViewableItemsChanged}
                onEndReached={() => {
                    this.componentDidMount();
                }}
                ListFooterComponent={() => this.state.loading ? <SLoad size="large" /> : null}
                keyExtractor={item => item.key.toString()}
                ItemSeparatorComponent={() => <SHr h={20} />}
                renderItem={itm => <Publicacion.Card
                    ref={ref => this.ref[itm.item.key] = ref}
                    data={itm.item} usuario={this.state?.usuarios[itm?.item?.key_usuario]?.usuario} />}
            />
            <SHr height={20} />
            <SView center style={{
                position: "absolute",
                bottom: 30,
                right: 10,
                borderRadius: 50,
                backgroundColor: STheme.color.barColor,
                height: 50,
                width: 50,
            }}
                onPress={() => {
                    SNavigation.navigate("/publicacion/add")
                }}
            >
                <SIcon name={"addPublicacion"} width={30} fill={STheme.color.white} />
            </SView>
            {/* <SButtom onPress={() => {
                SNavigation.navigate("/publicacion/add")
            }}>Nueva publicación</SButtom> */}
        </>
    }

    render() {
        return (
            <SPage
                // navBar={<TopBar type={"home"} />}
                // footer={this.footer()}
                // preventBack
                disableScroll
                center
            >
                {/* <SButtom onPress={() => {
                    SNavigation.navigate("/test")
                }}>TEST</SButtom> */}
                {/* <Container>
                    {this.renderPublicidad()}
                </Container> */}
                <SView col={"xs-11 sm-11 md-8 lg-6 xl-4"} flex>
                    <SHr height={10} />
                    {this.renderPublicaciones()}
                    {/* <SHr height={40} /> */}

                </SView>
            </SPage>
        );
    }

    // footer() {
    //     return <BottomNavigator url={"/inicio"} />
    // }


}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);