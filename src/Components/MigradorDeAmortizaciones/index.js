import React, { Component } from 'react';
import { SView } from 'servisofts-component';
import ReaderExcelRuddy from './ReaderExcelRuddy';

export default class MigradorDeAmortizaciones extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <SView col={"xs-12"} flex>
                <ReaderExcelRuddy />
            </SView>
        );
    }
}
