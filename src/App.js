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
import CarritoVenta from './Components/CarritoVenta';
setProps(Config.socket);

SMapView.bootstrapURLKeys.key = "AIzaSyAr7BQ9lDDYgKUq2pIbvMRXS1HqFLI3gDw"
const App = (props) => {
    useEffect(() => {
        try {
            if (Platform.OS == "web") {
                if ((window.location.href + "").startsWith("https")) {
                    Firebase.init();
                } else if ((window.location.href + "").startsWith("http://localhost")) {
                    Firebase.init();
                }
            } else {
                Firebase.init();
            }
        } catch (e) {
            console.error(e);
        }
        MDL.componentDidMount();
        Firebase.setBadgeCount(0);
        SNavigation.addOnChangeListener(e => {
            MDL.MDL.empresa.setUsuarioLog({ url: e.name, params: e.params })
        })
    }, []);

    return <Redux>
        <ErrorBoundary>
            <SComponentContainer
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
                            props={{ navBar: NavBar, title: document.title, pages: Pages }}
                        />
                    </MenuGlobal>
                    <CarritoCompra/>
                    <CarritoVenta/>
                </DataBaseContainer>
                <Socket store={store} />
            </SComponentContainer>
            <PopupEditarTema/>
        </ErrorBoundary>
    </Redux>
}
export default App;
