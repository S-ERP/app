import React, { Component } from 'react';
import { SHr, SImage, SList, SLoad, SNavigation, SText, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';
import MDL from '../../../MDL';

export default class MenuPaginas extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
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
            MDL.empresa.ordenarPaginas(urls)
                .then((resp) => {
                    list.map(item => {
                        item.order = resp.find((e) => e.url == item.url);
                    })
                    this.setState({ data: list })
                }).catch(e => {
                    console.error(e)
                })
        }).catch(e => {
            console.error(e)
        })
    }

    usuarioItem = ({ url, key, descripcion }) => {
        return <SView width={75} height={80} center onPress={() => {
            SNavigation.navigate(url)
        }}>
            <SView style={{ width: 60, height: 60, borderRadius: 100, }}>
                <SView style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 8,
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
        return <SView col={"xs-12"} height={120}  >
            <SText bold fontSize={12}>{"Páginas más visitadas"}</SText>
            {!this.state.data ? <SLoad /> : <SList
                horizontal
                data={this.state.data.sort((a, b) => a.order.count > b.order.count ? -1 : 1)}
                render={(a) => this.usuarioItem(a)}
            />}
        </SView>
    }
}
