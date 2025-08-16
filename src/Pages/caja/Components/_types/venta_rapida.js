import React, { Component } from 'react';
import { SButtom, SHr, SInput, SNavigation, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../../Model';
import PopupMontoDetalle from '../PopupMontoDetalle';
import Config from '../../../../Config';

export default class venta_rapida {
    static key = "venta_rapida";
    static descripcion = "Venta Rapida"
    static icon = "Ingreso"
    static permiso = ""
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
    static onPress(caja, punto_venta_tipo_pago) {

        SNavigation.navigate("/puntoventa");
    }
}
