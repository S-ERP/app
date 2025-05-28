import React, { Component } from "react";
import { connect } from "react-redux";
import {
    SHr,
    SIcon,
    SImage,
    SMarker,
    SPage,
    SText,
    STheme,
    SView,
} from "servisofts-component";
import SMapView from "servisofts-component/Component/SMapView";
import SSocket from "servisofts-socket";
export type MapaPropsType = {
    data: any,
};
class index extends Component<MapaPropsType> {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        // var { key, nombre, proximo_horario } = this.props.data;
        return (
            <SView col={"xs-12"} {...this.props}>
                <SMapView
                    initialRegion={{
                        latitude: this.props.data?.latitude,
                        longitude: this.props.data?.longitude,
                        latitudeDelta: 0.0222,
                        longitudeDelta: 0.0221,
                    }}
                    options={{
                        fullscreenControl: false,
                        zoomControl: false,
                        gestureHandling: "none",
                        scrollwheel: false,
                    }}
                    preventCenter
                >
                    <SMarker lat={this.props.data?.latitude} lng={this.props.data?.longitude}  >
                        <SIcon name="MarcadorMapa" width={20} height={30} />
                    </SMarker>
                </SMapView> 
                <SView col={"xs-12"} height style={{
                    position:"absolute"
                }} withoutFeedback>
                    
                </SView>
            </SView>
        );
    }
}
export default index;
