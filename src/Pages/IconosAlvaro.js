import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SPage, SView, STheme } from 'servisofts-component';
import SIconApp from '../Assets/SIconApp';

class IconosAlvaro extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const iconos = [
            "pagoefectivo",
            "pagopagare",
            "pagoqr",
            "pagotarjeta",
            "pagocheque",
            "pagotransferencia"
        ];

        return (
            <SPage title={'IconosAlvaro'} center>
                <SView col={"xs-12"} row center flexWrap>
                    {iconos.map((ico, i) => (
                        <SView
                            key={i}
                            width={200}
                            height={200}
                            border={STheme.color.text}
                            center
                            style={{
                                borderWidth: 1,
                                // borderColor: STheme.color.danger,
                                borderRadius: 16, // esquinas redondeadas (opcional)
                                margin: 10,
                                padding: 10
                            }}
                        >
                            <SIconApp
                                name={ico}
                                fill={STheme.color.text}
                                width={150}
                                height={150}
                            />
                        </SView>
                    ))}
                </SView>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(IconosAlvaro);
