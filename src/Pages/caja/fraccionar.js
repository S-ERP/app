import React, { Component } from 'react';
import { connect } from 'react-redux';

import { SHr, SMath, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import Components from '../../Components';
import Model from '../../Model';
import SelectMonedas from './Components/SelectMonedas';

type PropsType = {
    monto: any,
    detalle: any,
    key_caja: any,
    _type: any,
    onSelect: any

}
class index extends Component {
    params: PropsType;
    constructor(props) {
        super(props);
        this.state = {
        };
        this.params = SNavigation.getAllParams();
    }

    getDetalle() {
        return <SView col={"xs-12"} card style={{
            padding: 8
        }} >
            <SHr height={8} />
            <SView col={"xs-12"} row center>
                <SText fontSize={10} color={STheme.color.lightGray}>{"Detalle"}</SText>
                <SView flex />
                <SText fontSize={10} color={STheme.color.lightGray}>Total</SText>
            </SView>
            <SHr />
            <SHr />
            <SView col={"xs-12"} row center>
                <SText fontSize={14}>{this.params?.detalle}</SText>
                <SView flex />
                <SText fontSize={18}>Bs. {SMath.formatMoney(this.params?.monto)}</SText>
            </SView>
            <SHr height={8} />
            <SHr h={1} color={STheme.color.card} />
        </SView>
    }


    render() {
        return (
            <SPage >
                <SView col={"xs-12"} center>
                    <SView col={"xs-11 sm-10 md-8 lg-6 xl-4"} center>
                        {/* <SHr height={16} /> */}
                        {/* <SText fontSize={18} bold>Fraccionar moneda</SText> */}
                        <SHr height={16} />
                        {this.getDetalle()}
                        <SHr height={16} />
                        <SelectMonedas key_empresa={Model.empresa.Action.getSelect().key} onChange={(obj) => {
                            this.monedas = obj;
                        }} />
                    </SView>
                    <SView card style={{ padding: 16 }} onPress={() => {
                        if (this.params.onSubmit) {
                            this.params.onSubmit(this.monedas)
                        }
                    }}><SText>SUBIR</SText></SView>

                </SView>
                <SHr height={50} />
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);