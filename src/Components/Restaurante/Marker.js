import React from 'react';
import { SHr, SIcon, SImage, SMapView, SMarker, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';

const Marker = (props) => {
    var obj = props.data;
    var size = 68;
    if(!obj.latitude || !obj.longitude)return null;
    const url = SSocket.api.root + "restaurante/"+obj.key;
    return <SMarker lat={obj.latitude} lng={obj.longitude} {...props}   tracksViewChanges={true} >
        <SView width={size} height={size} style={{alignItems: 'center',}}
        onPress={() => { 
            SNavigation.navigate("/restaurante", { pk: obj.key });
        }}
        >
            <SIcon name={"MarcadorMapa"} width={size} height={size} />
            <SView style={{
                position: 'absolute',
                top: size * 0.03,
                width: size * 0.56,
                height: size * 0.56,
                backgroundColor: "#ffffff66",
                borderRadius: size,
                overflow: 'hidden',
            }} center>
                <SImage src={url} style={{
                    position: 'absolute',
                    resizeMode: 'cover',
                    width: size * 0.56,
                    height: size * 0.56,
                }} />
            </SView>
        </SView>
    </SMarker>
}
export default Marker;