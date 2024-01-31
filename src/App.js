import React from 'react';
import { SComponentContainer, SNavigation , SText, STheme} from 'servisofts-component';
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
        <SComponentContainer
            debug
            socket={SSocket}
            background={<BackgroundImage />}
            assets={Assets}
            inputs={Config.inputs}
            theme={{ themes: Config.theme, initialTheme: "dark" }}
        >
            <SNavigation

                props={{
                    navBar: NavBar,
                    title: 'Darmotos', pages: Pages
                }}
            />
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
            <SText style={{position: "absolute", bottom: 2, right: 2, }} fontSize={10} color={STheme.color.lightGray}>v{version}</SText>

        </SComponentContainer>
    </Redux>
}
export default App;