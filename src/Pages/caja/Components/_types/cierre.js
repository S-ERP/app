import React, { Component, useState } from 'react';
import { SButtom, SHr, SIcon, SInput, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import Container from '../../../../Components/Container';
import Model from '../../../../Model';
import CajaArqueo from '../CajaArqueo';
import PopupMontoDetalle from '../PopupMontoDetalle';

import PDF from '../../../../Components/PDF';

export default class index {
    static key = "cierre";
    static descripcion = "Cierre de caja"
    static icon = "Salir"
    static permiso = "cerrar_caja_otro_usuario"
    static isActive(obj) {
        return 1
    }
    static getEstado(obj) {
        return <SText color={STheme.color.success}>{"confirmada"}</SText>
    }

    static onDeleteCajaDetalle(obj) {
        return new Promise((resolve, reject) => {
            resolve("Dont required")
        })
    }
    static action(obj) {

    }
    static onPress(data, punto_venta_tipo_pago) {
        SPopup.open({
            key: "caja_cierre",
            content: <PopupPuntoVentaClose data={data} punto_venta_tipo_pago={punto_venta_tipo_pago} onPress={(setState) => {
                setState({ loading: true, error: "" })
                Model.caja.Action.editar({
                    action: "cerrar",
                    data: {
                        ...data,
                    },
                    punto_venta_tipo_pago: punto_venta_tipo_pago,
                    key_usuario: Model.usuario.Action.getKey()
                }).then((e) => {
                    setState({ loading: false, error: "" })
                    SPopup.close("caja_cierre")
                    // SNavigation.goBack();
                }).catch((e) => {
                    setState({ loading: false, error: e.error })
                })
            }} />
        })


    }
}

const PopupPuntoVentaClose = (props) => {
    const [state, setState] = useState({})
    return <SView col={"xs-12"} height={1000} backgroundColor={STheme.color.background} style={{
        maxHeight: "100%"
    }} withoutFeedback>
        {SPage.backgroundComponent}
        <Container>
            <SHr height={16} />
            <SText fontSize={18} bold>CIERRE DE CAJA</SText>
            <SHr height={16} />
            <SText fontSize={14} center>{"Seguro q desea cerrar la caja?"}</SText>
            <SHr />
            <SText fontSize={14} center>{"Al cerrar la caja el monto de cada tipo de pago se enviaran al banco correspondiente y la caja quedara con 0."}</SText>
            <SHr height={32} />
            <CajaArqueo key_caja={props.data.key} punto_venta_tipo_pago={props.punto_venta_tipo_pago} />
            <SHr height={32} />
            <SText color={STheme.color.danger}>{state.error}</SText>
            <SView col={"xs-12"} row center>
                <PDF.caja pk={props.data.key} caja={props.data} >
                    <SView padding={16} card>
                        <SText>EXPORTAR PDF</SText>
                    </SView>
                </PDF.caja>
                {/* <SButtom type='outline' onPress={() => {

                }} loading={state.loading}>EXPORTAR</SButtom> */}
                <SView width={16} />
                <SButtom type='outline' onPress={() => {
                    if (props.onPress) {
                        props.onPress(setState);
                    }
                }} loading={state.loading}>CONFIRMAR</SButtom>
            </SView>
        </Container>
        <SView style={{
            position: "absolute",
            width: 50,
            height: 50,
            padding: 4,
            top: 0,
            right: 0
        }} onPress={() => { SPopup.close("caja_cierre") }}>
            <SIcon name='Close' fill={"#fff"} />
        </SView>
    </SView>
}