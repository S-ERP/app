import React, { useEffect } from "react"
import { View } from "react-native";
import { SText, STheme, SView } from "servisofts-component";
import SSocket from "servisofts-socket";




const ControlMenu = (props) => {
    const { data } = props;
    const h = 30;



    return <SView style={{
        position: "absolute",
        top: -h - 4,
        width: 100,
        height: h,
        backgroundColor: STheme.color.card,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center"
    }} onPress={() => {
        SSocket.sendPromise({
            service: "roles_permisos",
            component: "widget",
            type: "editar",
            data: {
                ...data,
                estado: 0,
            }

        }).then(e => {

        })
    }}>
        <SText>Eliminar</SText>
        {/* <SText>Foto</SText> */}
    </SView>
}

export default ControlMenu;