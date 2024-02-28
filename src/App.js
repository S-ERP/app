import React from 'react';
import { SComponentContainer, SGradient, SIcon, SImage, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket, { setProps } from 'servisofts-socket';
import Redux, { store } from './Redux';
import Config from "./Config";
import Assets from './Assets';
import Pages from './Pages';
import BackgroundImage from './Components/BackgroundImage';
import NavBar from './Components/NavBar';

import { version } from "../package.json"

setProps(Config.socket);

const App = (props) => {
    return <Redux>
        {/* <SView
            style={{
                zIndex: 8,
                position: "relative",
            }}
        > */}
            {/* <SGradient deg={-50} colors={["#3A3A3A", STheme.color.black]}   style={{
                zIndex: 8,
                position: "relative",
            }}/> */}
        {/* </SView> */}
        <SComponentContainer
            debug
            socket={SSocket}
           
            assets={Assets}
            inputs={Config.inputs}
            theme={{ themes: Config.theme, initialTheme: "dark" }}
            background={<SGradient deg={-50} colors={[STheme.color.card, STheme.color.secondary]}  />}
            // style={{
            //     zIndex: 9,
            //     position: "relative",
            // }}
        >

            <SNavigation

                linking={{
                    prefixes: ["https://serp.com/app"]
                }}
                props={{
                    navBar: NavBar,
                    title: 'Servisofts ERP', pages: Pages
                }}
            />
            {/* <SView col={"xs-12"} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden", }} >
                <SImage style={{ resizeMode: "cover" }} src={require('./Assets/png/bg1.png')} />
            </SView> */}

            <SSocket
                store={store}
                identificarse={(props) => {
                    var usuario = props.state.usuarioReducer.usuarioLog;
                    return {
                        data: usuario ? usuario : {},
                        deviceKey: 'as-asa-as'
                    };
                }}
            />
            <SText style={{ position: "absolute", bottom: 2, right: 2, }} fontSize={10} color={STheme.color.lightGray}>v{version}</SText>

        </SComponentContainer>


    </Redux>
}
export default App;