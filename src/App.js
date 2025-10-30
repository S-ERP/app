import React, { useEffect } from 'react';
import { SComponentContainer, SGradient, SIcon, SImage, SMapView, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket, { setProps } from 'servisofts-socket';
import Redux, { store } from './Redux';
import Config from "./Config";
import Assets from './Assets/index';
import Pages from './Pages/index';
import BackgroundImage from './Components/BackgroundImage';
import NavBar from './Components/NavBar';
import Firebase from './Firebase';
import packageInfo from "../package.json"
import ErrorBoundary from './Components/ErrorBoundary';
import Socket from './Socket';
import { Platform } from 'react-native';
import DataBaseContainer from './DataBase/DataBaseContainer';
import * as MDL from './MDL';
import MenuGlobal from './Components/MenuGlobal';
import PopupEditarTema from './Pages/empresa/Components/PopupEditarTema';
import CarritoCompra from './Components/CarritoCompra';
// import SplashScreen from 'react-native-splash-screen'
setProps(Config.socket);



// SMapView.bootstrapURLKeys.key = "AIzaSyC4rcy6GRVM5_i9ZF0vGFmb1HRc0mXsAdk"
SMapView.bootstrapURLKeys.key = "AIzaSyAr7BQ9lDDYgKUq2pIbvMRXS1HqFLI3gDw"
const App = (props) => {
    useEffect(() => {
        // SplashScreen.hide();
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

        MDL.componentDidMount();

        Firebase.setBadgeCount(0);
        SNavigation.addOnChangeListener(e => {
            console.log("onChange", e);
            MDL.MDL.empresa.setUsuarioLog({ url: e.name, params: e.params })
        })
        // App launched, remove the badge count
    }, []);

    return <Redux>
        <ErrorBoundary>
            <SComponentContainer
                // debug
                socket={SSocket}
                background={<BackgroundImage />}
                assets={Assets}
                inputs={Config.inputs}
                theme={{ themes: Config.theme, initialTheme: "dark" }}
            >
                <DataBaseContainer>
                    <MenuGlobal>
                        <SNavigation
                            linking={{
                                prefixes: ["https://serp.servisofts.com/", "http://serp.servisofts.com/"],
                                getInitialURL: () => {
                                    Firebase.getInitialURL();
                                }
                            }}
                            props={{ navBar: NavBar, title: 'SERP', pages: Pages }}
                        />
                    </MenuGlobal>
                    <CarritoCompra/>
                </DataBaseContainer>
                {/* <SUploadContainer /> */}
                <Socket store={store} />
                {/* <SText style={{ position: "absolute", bottom: 2, right: 2, }} fontSize={10} color={STheme.color.lightGray}>v{packageInfo.version}</SText> */}
            </SComponentContainer>
            <PopupEditarTema/>
        </ErrorBoundary>
    </Redux>
}
export default App;