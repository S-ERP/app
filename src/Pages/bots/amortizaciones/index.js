import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SHr, SLoad, SPage, SText, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import FileInput from './FileInput';
import Container from '../../../Components/Container';
import List from './List'
import dataTest from "./testDataAll.json"
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: dataTest
        };
    }


    render() {
        return (
            <SPage title={'Migrador de amortizaciones.'}>
                <SView col={"xs-12"} center {...this.props}>
                    <SView col={"xs-11 sm-10 md-8 lg-6 xl-5 xxl-4"} center>
                        <FileInput onChange={(data) => {
                            this.setState({ data: data })
                            console.log(data);
                        }} />
                        <SHr />
                        <List data={this.state.data} />
                    </SView>
                </SView>
            </SPage >
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);