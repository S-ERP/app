import React, { Component } from 'react';
import { SButtom, SHr, SInput, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';

type PropsTypes = {
    title: any,
    detail: any,
    onSubmit: (data) => any,

}

const POPUP_KEY = "popup_monto_detalle"
export default class PopupMontoDetalle extends Component<PropsTypes> {
    static open(props: PropsTypes) {
        SPopup.open({
            key: POPUP_KEY,
            content: <PopupMontoDetalle {...props} />
        })
    }
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    submit() {
        var valid = true;
        if (!this.monto.verify()) valid = false;
        if (!this.detalle.verify()) valid = false;
        if (!valid) return;
        var data = {
            monto: this.monto.getValue(),
            detalle: this.detalle.getValue(),
        }
        this.close();
        if (this.props.onSubmit) this.props.onSubmit(data);
    }
    close() {
        SPopup.close(POPUP_KEY)
    }
    cancel() {
        this.close();
    }
    render() {
        return (
            <SView col={"xs-12 sm-10 md-8 lg-6 xl-4"} backgroundColor={STheme.color.background} style={{
                borderRadius: 8,
            }} center withoutFeedback>
                {SPage.backgroundComponent}
                <SView col={"xs-11"} center>
                    <SHr height={16} />
                    <SText fontSize={16} bold>{this.props.title}</SText>
                    <SText fontSize={14}>{this.props.detail}</SText>
                    <SHr height={32} />
                    <SView row col={"xs-12"}>
                        <SView col={"xs-12"} >
                            <SInput ref={ref => this.detalle = ref} required type={"textArea"} placeholder={"Glosa..."} autoFocus />
                        </SView>

                        <SHr height={8} />
                        <SView col={"xs-12"} >
                            <SInput ref={ref => this.monto = ref} required type={"money"} />
                        </SView>
                    </SView>
                    <SHr height={32} />
                    <SView row>
                        <SButtom type={"danger"} onPress={this.cancel.bind(this)}>Cancelar</SButtom>
                        <SView width={16} />
                        <SButtom type={"outline"} onPress={this.submit.bind(this)}>Aceptar</SButtom>
                    </SView>
                </SView>
                <SHr height={16} />
            </SView>
        );
    }
}
