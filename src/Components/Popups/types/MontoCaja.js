import React, { Component } from 'react';
import { SForm, SGradient, SHr, SImage, SLoad, SMath, SNavigation, SPage, SPopup, SStorage, SText, STheme, SView, SIcon, SInput } from 'servisofts-component';
import Model from '../../../Model';
import SSocket from 'servisofts-socket';
type PropsType = {

    data: any,
    onPress?: any,
    defaultValue?: any
}

export default class MontoCaja extends Component<PropsType> {
    static POPUP_CODE = "POPUP_MONTO_CAJA";
    static open(props: PropsType) {
        SPopup.open({
            key: this.POPUP_CODE,
            content: <MontoCaja {...props} />
        })
    }
    static close() {
        SPopup.close(this.POPUP_CODE)
    }
    constructor(props) {
        super(props);
        this.state = {
        };

    }
    render() {
        // const { data } = this.props;
        return <SView width={362} height={286} center style={{ borderRadius: 8 }} withoutFeedback backgroundColor={STheme.color.background}   >
            {SPage.backgroundComponent}
            <SHr height={8} />
            <SView col={"xs-12"} height={35} center style={{ borderBottomWidth: 1, borderColor: STheme.color.primary }}>
                <SText color={STheme.color.lightGray} style={{ fontSize: 16 }} bold center >Cuanto quiere amortizar?</SText>
            </SView>
            <SHr height={8} />
            <SView col={"xs-12"} flex center>
                <SView col={"xs-11"} center>
                    <SInput ref={ref => this.ref = ref} type={"money"} defaultValue={this.props.defaultValue} />
                </SView>
            </SView>
            <SHr height={8} />
            <SView col={"xs-11"} center row>
                <SView width={140} height={44} center card style={{ borderRadius: 8 }}
                    onPress={() => {
                        MontoCaja.close();
                    }}  >
                    <SText fontSize={14} color={STheme.color.white} bold>CANCELAR</SText>
                </SView>
                <SView flex />
                <SView width={140} height={44} center card style={{ borderRadius: 8 }}
                    onPress={() => {
                        let monto = this.ref.getValue();
                        if (this.props.onPress) {
                            this.props.onPress(monto);
                        }
                        MontoCaja.close();
                    }}  >
                    <SText fontSize={14} color={STheme.color.white} bold>ACEPTAR</SText>
                </SView>
            </SView>
            <SHr height={8} />
        </SView>
    }
}