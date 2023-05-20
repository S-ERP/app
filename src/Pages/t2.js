import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Linking } from 'react-native';
import { SButtom, SExcelReader, SHr, SLoad, SPage, SText, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../Model';
import { CuentaContable } from 'servisofts-rn-contabilidad';
import MigradorDeAmortizaciones from '../Components/MigradorDeAmortizaciones';
import PDF from '../Components/PDF';
import Components from '../Components';
import Container from '../Components/Container';
class Test extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <SPage title={'Test'}>
                <Container>
                    <Components.caja.QRCaja pk={"askdnasondasndkadnalksd"} onChange={(val) => {
                        this.setState({ qr_path: val })
                    }} />
                    <SHr />
                    {!this.state.qr_path ? <SLoad /> : <PDF.caja qr_path={this.state.qr_path} />}
                </Container>
            </SPage >
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(Test);