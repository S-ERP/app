import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Linking } from 'react-native';
import { SButtom, SHr, SLoad, SPage, SText, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../Model';
import SDatePicker from '../Components/SDatePicker';
// import { CuentaContable } from 'servisofts-rn-contabilidad';
// import MigradorDeAmortizaciones from '../Components/MigradorDeAmortizaciones';
class Test extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <SPage title={'Test'}>
                {/* <MigradorDeAmortizaciones /> */}
                <SDatePicker />
            </SPage >
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(Test);