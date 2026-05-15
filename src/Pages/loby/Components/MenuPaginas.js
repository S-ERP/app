import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SImage, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';
import MDL from '../../../MDL';

export default class MenuPaginas extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }
    componentDidMount() {
        // SNavigation.addOnChangeListener((e) => {
        //     new SThread(1000, "treview", true).start(() => {
        //         this.loadData();
        //     })
        // })

        // MDL.empresa.addEventListener("onChangeEmpresaSelect",(e)=>{
        //     this.loadData();
        // })

        this.loadData();

    }

    loadData() {

        SSocket.sendPromise({
            "version": "1.0",
            "service": "roles_permisos",
            "component": "usuarioPage",
            "type": "getAll",
            "estado": "cargando",
            "key_usuario": Model.usuario.Action.getKey(),
            "key_empresa": MDL.empresa?.select?.key,
        }).then(e => {

            let list = Object.values(e.data).filter(obj =>
                obj.url.startsWith("/") && obj.url.indexOf("/", 1) === -1
            );
            const urls = list.map(obj => obj.url);
            console.log("ESTA", urls)
            MDL.empresa.ordenarPaginas(urls)
                .then((resp) => {
                    list.map(item => {
                        item.order = resp.find((e) => e.url == item.url);
                    })
                    // list.sort((a, b) => a.order.count > b.order.count ? -1 : 1);
                    // list.sort((a, b) => {
                    //     if (a.order.ultima_visita == null && b.order.ultima_visita == null) return 0;
                    //     return a.order.ultima_visita < b.order.ultima_visita ? 1 : -1
                    // });
                    this.setState({ data: list })

                    console.log("list", list)

                }).catch(e => {
                    console.log("error", e)
                })
        })
    }


    usuarioItem = ({ url, key, descripcion }) => {

        // console.log("user", alias)
        // console.log("ultima_actividad", ultima_actividad)
        // console.log("diferenciasegundos", diferenciasegundos)
        // console.log("diferenciaminutos", diferenciaminutos)

        return <SView width={75} height={80} center onPress={() => {
            // SNavigation.navigate("/usuario/profile", { pk: key_usuario })
            SNavigation.navigate(url)
        }}>
            <SView style={{ width: 60, height: 60, borderRadius: 100, }}>
                <SView style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 8,
                    // borderWidth: 2,
                    // borderColor: STheme.color.card,
                    // backgroundColor: STheme.color.card,
                    overflow: "hidden"
                }}>
                    <SImage style={{
                        resizeMode: "cover"
                    }} src={SSocket.api.roles_permisos + "page/" + key} />
                </SView>
            </SView>
            <SHr h={2} />
            <SText fontSize={11} col={"xs-12"} bold center row height={13} style={{
                overflow: 'hidden',
            }}>{descripcion}</SText>
        </SView>
    }
    render() {


        return <>
            <SView col={"xs-12"} height={120}  >
                <SText bold fontSize={12}>{"Páginas más visitadas"}</SText>
                {!this.state.data ? <SLoad /> : <SList
                    horizontal
                    data={this.state.data.sort((a, b) => a.order.count > b.order.count ? -1 : 1)}
                    render={(a) => this.usuarioItem(a)}
                />}
            </SView>
            {/* <SHr h={16} />
            <SView col={"xs-12"} height={100}  >
                <SText bold fontSize={12}>{"Paginas vicitadas recientemente"}</SText>
                {!this.state.data ? <SLoad /> : <SList
                    horizontal
                    data={[...this.state.data].filter(a => a.order.ultima_visita).sort((a, b) => {
                        if (a.order.ultima_visita == null && b.order.ultima_visita == null) return 0;
                        if (a.order.ultima_visita == null) return 1;
                        if (b.order.ultima_visita == null) return -1;
                        return a.order.ultima_visita < b.order.ultima_visita ? 1 : -1
                    })}
                    render={(a) => this.usuarioItem(a)}
                />}
            </SView> */}
        </>

    }
}
