import React from 'react';
import { SComponentContainer, SGradient, SIcon, SImage, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket, { setProps } from 'servisofts-socket';
import Redux, { store } from './Redux';
import Config from "./Config";
import Assets from './Assets';
import Pages from './Pages';
import BackgroundImage from './Components/BackgroundImage';
import NavBar from './Components/NavBar';
import Firebase from './Firebase';
import packageInfo from "../package.json"
import ErrorBoundary from './Components/ErrorBoundary';
import Socket from './Socket';
import { Platform } from 'react-native';

setProps(Config.socket);


try {
    if (Platform.OS == "web") {
        if ((window.location.href + "").startsWith("https")) {
            Firebase.init();
        } else if ((window.location.href + "").startsWith("http://localhost")) {
            Firebase.init();
        } else {
            console.log("No se activara el Fireabase Por que no contamos con SSL")
        }
    } else {
        Firebase.init();
    }
} catch (e) {
    console.log(e);
}

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
        <ErrorBoundary>
            <SComponentContainer
                // debug
                socket={SSocket}
                background={<BackgroundImage />}
                assets={Assets}
                inputs={Config.inputs}
                theme={{ themes: Config.theme, initialTheme: "dark" }}
            >
                <SNavigation
                    linking={{
                        prefixes: ["https://serp.servisofts.com/", "http://serp.servisofts.com/", 'serp://app/'],
                        getInitialURL: () => {
                            Firebase.getInitialURL();
                        }
                    }}
                    props={{ navBar: NavBar, title: 'SERP', pages: Pages }}
                />
                <Socket store={store} />
                {/* <SText style={{ position: "absolute", bottom: 2, right: 2, }} fontSize={10} color={STheme.color.lightGray}>v{packageInfo.version}</SText> */}
            </SComponentContainer>
        </ErrorBoundary>
    </Redux>
}
export default App;