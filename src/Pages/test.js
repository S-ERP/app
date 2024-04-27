import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SDate, SDatePicker, SHr, SInput, SLoad, SNavigation, SPage, SSPiner, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';
import STextPlay from '../Components/STextPlay';
import Container from '../Components/Container';
import SMD from '../SMD';
import MDtest1 from '../SMD/MDtest1';
import MDtest2 from '../SMD/MDtest2';
import SwipeableView from '../Components/SwipeableView';
import Loby from "./loby/root"
import Publicaciones from "./publicacion/root"
import Menu from './menu';
import MenuDragable from '../Components/SwipeableView/MenuDragable';
import Model from '../Model';
import MultipageMenu from '../Components/MultipageMenu';
import SSocket from 'servisofts-socket';
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
        SSocket.sendPromise({
            service: "roles_permisos",
            component: "widget",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getByKey(),
        }).then(e => {
            this.setState({ data: e.data })
            // Object.values(e.data).map(a => {
            //     if (this.multipageMenu) {
            //         this.multipageMenu.setItem({ ...a });
            //     }
            // })
            console.log(e);
        }).catch(e => {
            console.error(e);
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
            <MultipageMenu
                ref={ref => this.multipageMenu = ref}
                data={this.state.data}
                onChangePosition={(e) => {
                    console.log(e);
                    SSocket.sendPromise({
                        service: "roles_permisos",
                        component: "widget",
                        type: "registro",
                        data: {
                            ...e,
                            key_empresa: Model.empresa.Action.getKey(),
                        },
                        key_usuario: Model.usuario.Action.getByKey(),
                    }).then(e => {
                        console.log(e);
                    }).catch(e => {
                        console.error(e);
                    })
                }} />

            <SView style={{ position: "absolute", width: 80, height: 40, bottom: 0, }} card center onPress={() => {

                let wid = {
                    key: SUuid(),
                    x: 3,
                    y: 5,
                    w: 1,
                    h: 1,
                    active: false,
                    type: "algo"
                }
                // if (this.multipageMenu) {
                //     // this.multipageMenu.removeAllItems();
                //     this.multipageMenu.setItem(wid)
                // }
                // this.state.data[wid.key] = wid;
                this.state.data_temp = {
                    ...this.state.data,
                    [wid.key]: wid
                }
                this.state.data = null;
                this.setState({ ...this.state })
                new SThread(20, "asasdas", true).start(() => {
                    this.state.data = { ...this.state.data_temp };
                    this.state.data_temp = null;
                    this.setState({ ...this.state })
                })
                // this.setState({ ...this.state })
            }}>
                <SText>AGREGAR</SText>
            </SView>
            <SView style={{ position: "absolute", width: 80, height: 40, bottom: 0, left: 100, }} card center onPress={() => {
                this.multipageMenu.removeAllItems();
                this.setState({ data: null })
                this.componentDidMount();

            }}>
                <SText>RELOAD</SText>
            </SView>
        </SPage>
        // return < MenuDragable />;
        return <SwipeableView
            initialIndex={1}
            data={[
                // <Publicaciones />,
                // <Loby />,
                // <Loby />,
                <MenuDragable />,
                <MenuDragable />,
                // <MenuDragable />,


                // <Menu />,
            ]}
        />
        return (
            <SPage disableScroll hidden>
                {/* <SMD space={8}>{this.state.text}</SMD> */}
                <SwipeableView
                    initialIndex={1}
                    data={[
                        <Publicaciones />,
                        <Loby />,
                    ]}
                />
                {/* <Container flex>
                    <SHr />
                    <SText fontSize={20}>Mesaje de algo {this.state.val}</SText>
                    <SHr />
                    <SSPiner flex itemHeight={60} defaultValue='Perder peso' options={["Ganar Peso", "Perder peso", "Ser fit", "Ganar flexibilidad", "Estar saludable", "sadsa"]} onChange={e => {
                        this.setState({ val: e })
                    }} />
                    <SHr />
                </Container>
                <SText>Boton de abanzar</SText> */}
            </SPage >
        );
    }
}
// const initStates = (state) => {
//     return { state }
// };
// export default connect(initStates)(Test);