import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Linking } from 'react-native';
import { SButtom, SDate, SDatePicker, SHr, SInput, SLoad, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../../Model';
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
        let empresa = Model.empresa.Action.getByKey(this.props.key_empresa);
        if (!empresa) return <SLoad />
        return (
            <SView>
                {/* <MigradorDeAmortizaciones /> */}
                <SInput label={"barColor"} defaultValue={STheme.color.barColor} ref={ref => this.ref.barColor = ref} type='color' />
                <SInput label={"background"} defaultValue={STheme.color.background} ref={ref => this.ref.background = ref} type='color' />
                <SInput label={"text"} defaultValue={STheme.color.text} ref={ref => this.ref.text = ref} type='color' />
                <SInput label={"card"} defaultValue={STheme.color.card} ref={ref => this.ref.card = ref} type='color' />
                <SHr h={20} />
                <SView row>
                    <SView flex />
                    <SText width={100} center card onPress={() => {
                        STheme.color = {
                            ...STheme.color,
                            background: this.ref.background.getValue(),
                            text: this.ref.text.getValue(),
                            barColor: this.ref.barColor.getValue(),
                            card: this.ref.card.getValue(),

                        }
                        STheme.repaint();
                    }} padding={20} border={STheme.color.warning}>Probar</SText>
                    <SView flex />
                    <SText width={100} center card onPress={() => {
                        STheme.color = {
                            ...STheme.color,
                            background: this.ref.background.getValue(),
                            text: this.ref.text.getValue(),
                            barColor: this.ref.barColor.getValue(),
                            card: this.ref.card.getValue(),
                        }
                        let theme = STheme.color;
                        delete theme.mapStyle;
                        Model.empresa.Action.editar({
                            data: {
                                ...empresa,
                                theme: theme
                            },
                            key_usuario: Model.usuario.Action.getKey(),
                        }).then(e => {
                            Model.empresa.Action.setEmpresa(e.data);
                        }).catch(e => {

                        })
                        STheme.repaint();
                    }} padding={20} border={STheme.color.success}>GUARDAR</SText>
                    <SView flex />
                </SView>
                {/* <SDatePicker col={"xs-12"}
                    flex
                    onSelect={(e: SDate) => {
                        console.log(e.toString("yyyy-MONTH-dd hh:mm:ss"));
                    }} /> */}
            </SView>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(Test);