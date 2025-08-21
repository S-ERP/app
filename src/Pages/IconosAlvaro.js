import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SPage, SText, SView, SIcon, STheme } from 'servisofts-component';
import SIconApp from '../Assets/SIconApp';

class IconosAlvaro extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {

        return (
            <SPage title={'IconosAlvaro'} center>
                <SView col={"xs-12"} row center border="green">

                    <SIconApp name={"pagocheque"} fill={STheme.color.text} stroke={STheme.color.text} width={180} height={180} />
                    <SIconApp name={"pagoefectivo"} fill={STheme.color.text} stroke={STheme.color.text} width={180} height={180} />
                    <SIconApp name={"pagopagare"} fill={STheme.color.text} stroke={STheme.color.text} width={180} height={180} />
                    <SIconApp name={"pagoqr"} fill={STheme.color.text} stroke={STheme.color.text} width={180} height={180} />
                    <SIconApp name={"pagotarjeta"} fill={STheme.color.text} stroke={STheme.color.text} width={180} height={180} />
                    <SIconApp name={"pagotransferencia"} fill={STheme.color.text} stroke={STheme.color.text} width={180} height={180} />
                </SView>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(IconosAlvaro);
