import React from "react";
import { SNavigation, SPage, SPopup, SText, STheme } from "servisofts-component";
import SPageConta from "./Components/SPageConta";
import Pizarra from "../../Components/Pizarra/Pizarra";
import PizarraNodo from "../../Components/Pizarra/PizarraNodo";
import { StyleSheet, View } from "react-native";
import MDL from "../../MDL";

export default class dimension extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: "/conta/dimension", permiso: "ver" }).then((permit) => {
            if (!permit) {
                SNavigation.goBack();
                return;
            }
        }).catch(e => {
            console.error(e);
        })
    }
    render() {
        return <SPage title={"Contabilidad - dimension"} disableScroll>
            <Pizarra id="contabilidad_dimension">
                <NodoDimension id={"key_sucursal"} label={"Sucursal"} />
                <NodoDimension id={"key_usuario"} label={"Usuario"} />
            </Pizarra>
        </SPage>
    }
}

const NodoDimension = ({ id, label }) => {
    return <PizarraNodo id={id} x={0} y={0} onDoublePress={() => {
        SPopup.confirm({
            title: label
        })
    }}>
        <View style={styles.nodoDimension}>
            <SText>{label}</SText>
        </View>
    </PizarraNodo>
}


const styles = StyleSheet.create({
    nodoDimension: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: STheme.color.background,
        justifyContent: "center",
        alignItems: "center",
    }
})