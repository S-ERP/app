import React, { Component } from 'react';
import { connect } from 'react-redux';

import { SHr, SLoad, SMath, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import Components from '../../Components';
import Model from '../../Model';

type PropsType = {
    monto: any,
    detalle: any,
    key_punto_venta: any,
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
        }}>
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
    getData() {
    
        var data = Model.punto_venta_tipo_pago.Action.getAll({ key_punto_venta: this.params.key_punto_venta });
        if (!data) return <SLoad />
        var tipos = Object.values(data).map(o => o.key_tipo_pago);
        return <Components.empresa.tipo_pago.Select include={tipos} onSelect={(tp) => {
         
            if (this.params.onSelect) {
                this.params.onSelect(tp);
                SNavigation.goBack();
            }

        }} />
    }
    render() {
        return (
            <SPage >
                <SView col={"xs-12"} center>
                    <SView col={"xs-11 sm-10 md-8 lg-6 xl-4"} center>
                        <SHr height={16} />
                        <SText fontSize={18} bold>Seleeciona el metodo de pago</SText>
                        <SHr height={16} />
                        {this.getDetalle()}
                        <SHr height={16} />
                        {this.getData()}
                    </SView>
                </SView>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);