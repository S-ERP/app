import React, { Component } from 'react';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "./index"
import { SDate, SHr, SIcon, SImage, SList, SLoad, SMath, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';

class index extends DPA.item {
    sizeImage = 32
    constructor(props) {
        super(props, {
            Parent: Parent,
            padding: 0,
            // row:false
        });
    }
    $renderContent() {
        const { descripcion, codigo, tipo, estado, key, debe } = this.data
        const info = Model.asiento_contable.Action.getStateInfo(tipo);
        this.data.codigo_l = info.codigo + "-" + codigo;
        return <SView col={"xs-12"} style={{
            overflow: "hidden",
            padding: 8,
        }} row>
            <SView flex>
                <SText bold fontSize={16} color={info.color}>{this.data.codigo_l}</SText>
                <SHr />
                <SText fontSize={12} color={STheme.color.lightGray}>{tipo}</SText>
                <SHr h={4} />
                <SText fontSize={12} color={STheme.color.lightGray}>{descripcion}</SText>
            </SView>
            <SView height center>
                <SText fontSize={16} color={STheme.color.lightGray}>{SMath.formatMoney(debe)}</SText>
            </SView>
        </SView>
    }
}
export default connect(index);