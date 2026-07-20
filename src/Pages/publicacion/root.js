import React, { Component } from 'react';
import { connect } from 'react-redux';

import { SDate, SHr, SIcon, SLoad, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import { Publicacion } from './Components';
import Model from '../../Model';
import SSocket from 'servisofts-socket'

import { FlatList, View } from 'react-native';
import ScrollViewHandle from '../../Components/ScrollViewHandle';


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
            key_empresa: Model.empresa.Action.getKey(),
        }).then((e) => {
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
            Model.publicacion.Action._dispatch(e);
            this.state.page += 1;

            const arr = Object.values(e.data)
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
            this.setState({ loading: false });
            console.error(e);
        })
    }
    clearData(resolv) {
        this.ref = {}
        this.state.page = 0;
        this.state.end = false;

        this.componentDidMount();
        Model.publicacion.Action.CLEAR();
        Model.usuario.Action.CLEAR();
    }

    butomSubir() {
        return <SView center style={{
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
    }
    renderPublicaciones() {
        const handleRefresh = async () => {
            this.clearData();
        };
        let data = Model.publicacion.Action._getReducer()?.data ?? {};
        if (Object.values(data).length <= 0) return <View style={{}}>
            <SText>No hay publicaciones</SText>
        </View>
        return <>
            <FlatList
                onRefresh={handleRefresh}
                refreshing={this.state.refreshing}
                scrollEnabled={false}
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
        </>
    }

    render() {
        return (
            <SPage
                disableScroll
                center
            >
                <SView col={"xs-11 sm-11 md-8 lg-6 xl-4"} flex>
                    <SHr height={10} />
                    <ScrollViewHandle>
                        {this.renderPublicaciones()}
                    </ScrollViewHandle>
                    {this.butomSubir()}
                </SView>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);
