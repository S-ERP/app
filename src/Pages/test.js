import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Linking } from 'react-native';
import { SButtom, SDate, SDatePicker, SHr, SInput, SLoad, SPage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../Model';
import Container from '../Components/Container';
// import { CuentaContable } from 'servisofts-rn-contabilidad';
// import MigradorDeAmortizaciones from '../Components/MigradorDeAmortizaciones';
class Test extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    ref = {}

    render() {
        return (
            <SPage title={'Test'} disableScroll>
                <SDatePicker col={"xs-12"}
                    flex
                    onSelect={(e: SDate) => {
                        console.log(e.toString("yyyy-MONTH-dd hh:mm:ss"));
                    }} />
            </SPage >
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(Test);