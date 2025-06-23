import React, { Component } from 'react';
import { View, Text, ScrollView, StyleSheet, SectionList, Vibration, Switch, UIManager, Platform, Dimensions } from 'react-native';
import { SDate, SHr, SIcon, SImage, SLoad, SNavigation, SPage, SPopup, SSwitch, SText, STheme, SThread, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import SelectHabilitado from './SelectHabilitado';
import { BtnEditar } from '../list';
import Model from '../../../../Model';
import StatusIndicator from './StatusIndicator';

const tiempoHabilitacion = (item) => {

    if (item.habilitado) return "Disponible";
    const ahora = new SDate();
    const fechaObjetivo = new SDate(item.fecha_habilitacion_automatica, "yyyy-MM-ddThh:mm:ss");

    const diferencia = fechaObjetivo.getTime() - ahora.getTime();
    if (diferencia < 0) {
        return "La fecha y hora ya han pasado";
    }

    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    // const dias = Math.floor(horas / 24);

    if (!horas && !minutos) {
        return `No disponible`;
    }
    if (horas <= 0) {
        return `No disponible\npor ${minutos % 60} minutos`;
    }

    return `No disponible\npor ${horas % 24} horas`;
}
export default ({ item, section, index, key_restaurante, onChange, image_time, onPress }) => {

    const hanlePress = (e) => {
        Vibration.vibrate(100)
        e.currentTarget.measure((x, y, width, height, pageX, pageY) => {
            const key_popup = "popupkey";
            const windowheight = Dimensions.get("window").height
            const itemWidth = 200;
            const itemHeight = 176;
            let top = pageY + 52;
            if (itemHeight + top > windowheight) {
                top = windowheight - itemHeight;
            }
            SPopup.open({
                key: key_popup,
                type: "2",
                content: <SelectHabilitado
                    style={{
                        left: pageX - itemWidth + width + 8,
                        top: top,
                        itemWidth: itemWidth,
                        itemHeight: itemHeight,
                    }}
                    onSelect={(e) => {
                        let fecha_habilitacion_automatica = "null"
                        if (e.key != "true" && e.key != "false") {
                            fecha_habilitacion_automatica = new SDate().addMinute(parseInt(e.key)).toString("yyyy-MM-ddThh:mm:ss");
                        }

                        SSocket.sendPromise({
                            service: "inventario",
                            component: "producto",
                            type: "editar",
                            key_usuario: Model.usuario.Action.getKey(),
                            data: {
                                key: item.key,
                                habilitado: e.key == "true",
                                fecha_habilitacion_automatica: fecha_habilitacion_automatica
                            }

                        }).then(e => {
                            item.habilitado = e.data.habilitado;
                            item.fecha_habilitacion_automatica = e.data.fecha_habilitacion_automatica;
                            if (onChange) onChange()
                            console.log(e);
                        }).catch(e => {
                            console.error(e);
                        })
                        SPopup.close(key_popup)
                    }}
                />
            })
        })
    }

    const spr = item.sub_productos.filter(a => a.estado != 0)
    const cantidad_sub_productos = spr.length;

    return <SView col={"xs-12"} row >
        <View style={styles.item}  >
            <SView col={"xs-12"} row onPress={onPress}>
                <SView style={{ width: 40, height: 40, borderRadius: 4, overflow: "hidden" }} card>
                    <SImage src={SSocket.api.inventario + "producto/" + item.key + "?date=" + image_time} style={{
                        resizeMode: "cover"
                    }} />
                </SView>
                <SView width={8} />
                <SView flex style={{ justifyContent: "center" }}>
                    <SText style={{ fontSize: 12, }} >{item?.nombre}</SText>
                    <SText style={{ fontSize: 10, color: STheme.color.gray }} >{cantidad_sub_productos <= 0 ? "Sin subproductos" : `${cantidad_sub_productos} subproductos`}</SText>
                </SView>
                <SView height style={{ justifyContent: "center", }} onPress={hanlePress}>
                    <SView col={"xs-12"} row style={{
                        alignItems: "center",
                    }} >
                        <SView height={8} width={8} style={{
                            borderRadius: 100,
                            backgroundColor: !item.habilitado ? STheme.color.danger : STheme.color.success
                        }}>

                        </SView>
                        <SView width={4} />
                        <SText color={"#666"} fontSize={10} >{tiempoHabilitacion(item)}</SText>
                    </SView>
                    <SText color={"#666"} fontSize={8}>{ }</SText>
                </SView>
            </SView>
        </View >
        <SView width={40} style={{
            justifyContent: "center",
            alignItems: "flex-end"
        }} height>
            <BtnEditar onPress={() => {
                SNavigation.navigate("/restaurante/producto/edit", { key_restaurante: key_restaurante, pk: item.key })
            }} />
        </SView>
    </SView >
}
const styles = StyleSheet.create({
    item: {
        flex: 1,
        padding: 8,
        paddingTop: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: "#CCC",
    },

});
