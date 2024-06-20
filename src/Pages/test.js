import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SDate, SDatePicker, SHr, SInput, SLoad, SNavigation, SNotification, SPage, SSPiner, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';
import STextPlay from '../Components/STextPlay';
import Container from '../Components/Container';
import SMD from '../SMD';
import MDtest1 from '../SMD/MDtest1';
import MDtest2 from '../SMD/MDtest2';
import SwipeableView from '../Components/SwipeableView';
import Loby from "./loby/root"
import Publicaciones from "./publicacion/root"
import Menu from './menu';
import MenuDragable from '../Components/MenuDragable';
import Model from '../Model';
import MultipageMenu from '../Components/MultipageMenu';
import SSocket from 'servisofts-socket';
import DataBase from '../DataBase';
import { Trigger } from 'servisofts-db';
import { Image } from 'react-native';
export default class Test extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: MDtest1
            // text: MDtest2
        };
    }
    ref = {}
    componentDidMount() {
        this.loadData();
        this.isRun = true;
        this.hilo();
        this.loadDataUser();


    }
    componentWillUnmount() {
        this.isRun = false;
    }
    hilo() {
        new SThread(1000 * 20, "hilo_de_recatga", true).start(() => {
            if (!this.isRun) return;
            this.hilo();
            this.loadData();
        })
    }

    loadData() {
        if (!Model.empresa.Action.getKey() && !Model.usuario.Action.getByKey()) return;
        DataBase.widget.all().then(arr => {
            console.log(arr);
            let data = {};
            arr.map(a => data[a.key] = a)
            this.setState({ data: data })
        })
        SSocket.sendPromise({
            service: "roles_permisos",
            component: "widget",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getByKey(),
        }).then(e => {

            DataBase.widget.insertArray(Object.values(e.data)).then(resp => {
                console.log("Registrado con exito en la db", resp)
            }).catch(err => {
                console.log("Error registrado en la db", err)
            })
            this.setState({ data: e.data })
        }).catch(e => {
            console.error(e);
        })


    }

    loadDataUser() {
        SSocket.sendPromise({
            service: "empresa",
            component: "empresa_usuario_log",
            type: "registro",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getUsuarioLog()?.key,
            url: SNavigation.lastRoute.route.name
        }).then(e => {
            this.setState({ dataLog: e.data })
        }).catch(e => {
            console.error(e);
        })
        console.log("USUSARIOOO", Model.usuario.Action.getUsuarioLog())
        console.log("loadDataUser", SNavigation.lastRoute.route.name)
    }


    handleChangePosition = (obj) => {
        console.log("handleChangePosition", obj)
        this.setState({
            data: {
                ...this.state.data,
                [obj.key]: obj,
            }
        })
        SSocket.sendPromise({
            service: "roles_permisos",
            component: "widget",
            type: "registro",
            data: {
                ...obj,
                key_empresa: Model.empresa.Action.getKey(),
            },
            key_usuario: Model.usuario.Action.getByKey(),
        }).then(e => {
            console.log(e);
        }).catch(e => {
            console.error(e);
        })
    }
    handleDelete = (obj) => {
        delete this.state.data[obj.key];
        this.setState({
            data: {
                ...this.state.data,
            }
        })

        SSocket.sendPromise({
            service: "roles_permisos",
            component: "widget",
            type: "editar",
            data: {
                ...obj,
                estado: 0,
                key_empresa: Model.empresa.Action.getKey(),
            },
            key_usuario: Model.usuario.Action.getByKey(),
        }).then(e => {
            console.log(e);
        }).catch(e => {
            console.error(e);
        })
    }

    agregar(url) {
        SNavigation.navigate(url, {
            onSelect: (page) => {
                SNavigation.goBack();
                const buscarLibre = ({ x, y, w, h, p, c }) => {
                    const arr = Object.values(this.state.data);
                    for (let i = 0; i < arr.length; i++) {
                        const a = arr[i];
                        const r1 = {
                            x1: x,
                            y1: y,
                            x2: x + w,
                            y2: y + h
                        }
                        const r2 = {
                            x1: a.x,
                            y1: a.y,
                            x2: a.x + a.w,
                            y2: a.y + a.h
                        }
                        if (Math.max(r1.x1, r2.x1) < Math.min(r1.x2, r2.x2) &&
                            Math.max(r1.y1, r2.y1) < Math.min(r1.y2, r2.y2)) {

                            if ((x + w) + 1 > ((p) * c) + c) {
                                x = (p) * c;
                                y = y + 1;
                            } else {
                                x = x + 1;
                            }
                            return buscarLibre({ x: x, y: y, w: w, h: h, p: p, c: c });
                        }
                    }
                    return { x, y, w, h, c }
                }
                const buscarLibreReverse = ({ x, y, w, h, p, c }) => {
                    const arr = Object.values(this.state.data);
                    for (let i = 0; i < arr.length; i++) {
                        const a = arr[i];
                        const r1 = {
                            x1: x,
                            y1: y,
                            x2: x + w,
                            y2: y + h
                        }
                        const r2 = {
                            x1: a.x,
                            y1: a.y,
                            x2: a.x + a.w,
                            y2: a.y + a.h
                        }
                        if (Math.max(r1.x1, r2.x1) < Math.min(r1.x2, r2.x2) &&
                            Math.max(r1.y1, r2.y1) < Math.min(r1.y2, r2.y2)) {

                            if ((x) - 1 < ((p) * c)) {
                                x = ((p + 1) * c) - 1;
                                y = y - 1;
                            } else {
                                x = x - 1;
                            }
                            return buscarLibreReverse({ x: x, y: y, w: w, h: h, p: p, c: c });
                        }
                    }
                    return { x, y, w, h, c }
                }


                let libre = buscarLibre({
                    x: this?.poslongPress?.x ?? 0,
                    y: this?.poslongPress?.y ?? 0,
                    w: page.w ?? 1,
                    h: page.h ?? 1,
                    p: this?.poslongPress?.page ?? 1,
                    c: this?.poslongPress?.col ?? 4,
                })
                if (libre.y >= 6) {
                    libre = buscarLibreReverse({
                        x: this?.poslongPress?.x ?? 0,
                        y: this?.poslongPress?.y ?? 0,
                        w: page.w ?? 1,
                        h: page.h ?? 1,
                        p: this?.poslongPress?.page ?? 1,
                        c: this?.poslongPress?.col ?? 4,
                    })
                    if (libre.y >= 6 || libre.x < 0) {
                        SNotification.send({
                            title: "Error",
                            body: "No hay campo en esta pagina",
                            color: STheme.color.danger,
                            time: 5000,
                        })
                        return;
                    }
                }

                let obj = {
                    key: SUuid(),
                    x: libre.x,
                    y: libre.y,
                    w: page.w ?? 1,
                    h: page.h ?? 1,
                    active: false, // requerido por la animacion no se guarda en base
                    type: page.type ?? "page",
                    descripcion: page?.descripcion,
                    url: page?.url,
                    key_page: page?.key,
                    data: {}
                }
                this.handleChangePosition(obj);
                // this.setState({
                //     data: {
                //         ...this.state.data,
                //         [obj.key]: obj,
                //     }
                // })

            }
        })

    }
    render() {
        const key_usuario = Model.usuario.Action.getKey();
        if (!key_usuario) {
            SNavigation.replace("/login")
            return <SText>No user</SText>
        }
        const key_empresa = Model.empresa.Action.getKey();
        if (!key_empresa) {
            SNavigation.replace("/loby")
            return <SText>No user</SText>
        }
        if (!this.state.data) return <SLoad />
        return <SPage disableScroll hidden>
            <MenuDragable
                data={this.state.data}
                onChangePosition={this.handleChangePosition.bind(this)}
                onLongPressStart={(evt) => {
                    this.poslongPress = evt;
                    console.log(evt);
                }}
                onDelete={this.handleDelete.bind(this)}
                menuBottom={<SView style={{
                    width: "100%",
                    height: "100%",
                    flexDirection: "row",
                }} center >
                    <SView style={{ width: 60, height: 60, borderRadius: 8 }} card center onPress={this.agregar.bind(this, "/widget/widget")}>
                        <SText>Widget</SText>
                    </SView>
                    <SView width={16} />
                    <SView style={{ width: 60, height: 60, borderRadius: 8 }} card center onPress={this.agregar.bind(this, "/widget/pages")}>
                        <SText>Paginas</SText>
                    </SView>
                </SView>}
            />

            {/* <SView row>
                
                <SView style={{ width: 80, height: 40, }} card center onPress={() => {
                    this.loadData();

                }}>
                    <SText>RELOAD</SText>
                </SView>
                <SView style={{ width: 80, height: 40, }} card center onPress={() => {
                    SNavigation.navigate("/loby")

                }}>
                    <SText>Salir</SText>
                </SView>
            </SView> */}
        </SPage>
    }
}
