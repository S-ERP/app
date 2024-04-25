import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SDate, SDatePicker, SHr, SInput, SLoad, SNavigation, SPage, SSPiner, SText, STheme, SView } from 'servisofts-component';
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
export default class Test extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: MDtest1
            // text: MDtest2
        };
    }
    ref = {}

    render() {
        const key_usuario = Model.usuario.Action.getKey();
        if(!key_usuario){
            SNavigation.replace("/login")
            return <SText>No user</SText>
        }
        // return < MenuDragable />;
        return <SwipeableView
            initialIndex={1}
            data={[
                // <Publicaciones />,
                <Loby />,
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