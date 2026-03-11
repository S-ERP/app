import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SHr, SIcon, SInput, SLoad, SNotification, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import MDL from '../../../MDL';
import pasarela from '..';
import TipoPasarela from './TipoPasarela';

type Props = {
    key_pasarela_empresa: string,
    tipo?:string,
    monto: number,
    onCancel?: Function,
    onSuccess?: Function,
    data?: any
}


export default class PagarConPasarela extends Component<Props> {

    static open(props: Props) {
        SPopup.open({
            key: "PagarConPasarela",
            content: <SView style={{
                width: "100%",
                maxHeight: "100%",
                maxWidth: 500,
                // height: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <PagarConPasarela {...props} onCancel={() => {
                    SPopup.close("PagarConPasarela")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("PagarConPasarela")
                        if (props.onSuccess) props.onSuccess(e)
                    }}

                />
            </SView>
        })
    }

    state: any = {
        pasarela_empresa: null
    }
    componentDidMount(): void {
        MDL.caja.pasarela_empresa.getByKey(this.props.key_pasarela_empresa).then(pe => {
            this.setState({ pasarela_empresa: pe })
        })
    }



    render() {
        let TIPOPASARELA = null
        if (this.state?.pasarela_empresa?.key_pasarela) {
            const tp: any = this.state?.pasarela_empresa?.key_pasarela;
            TIPOPASARELA = (TipoPasarela as any)[tp];
        }
        return <SView col={"xs-12"} center >
            {!this.state.pasarela_empresa && <SText>{"Cargando pasarela..."}</SText>}
            {this.state.pasarela_empresa && <TIPOPASARELA {...this.props} {...this.state} />}
        </SView>
    }
}
