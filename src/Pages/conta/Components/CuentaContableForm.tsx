import React from "react";
import { TextStyle, View, ViewStyle } from "react-native";
import { SHr, SInput, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../../MDL";

type Props = {
    cuenta_contable: any,
    onChange?: (cuenta_contable: any) => void,
    style?: ViewStyle,
}
export default class CuentaContableForm extends React.Component<Props> {
    static open(props: Props) {
        SPopup.open({
            key: "CuentaContableForm",
            content: <CuentaContableForm {...props} />,
        })
    }
    submit() {
        const cuenta_contable = {
            key: this.props.cuenta_contable?.key,
            codigo: this._ref.codigo.getValue(),
            descripcion: this._ref.descripcion.getValue(),
        };
        console.log("CuentaContableForm.submit", cuenta_contable);
        MDL.contabilidad.cuenta_contable.save(cuenta_contable).then(e => {
            SPopup.close("CuentaContableForm");
            if (this.props.onChange) {
                this.props.onChange(e);
            }
        }).catch(e => {
            console.error("Error saving cuenta_contable:", e);
            // SPopup.alert({
            //     title: "Error",
            //     message: "No se pudo guardar la cuenta contable. Intente nuevamente.",
            // });
        })
        // MDL.contabilidad.saveAjusteEmpresa({
        //     key: this.props?.ajuste?.ajuste_empresa?.key,
        //     estado: 0,
        // }).then(e => {
        //     if (this.props.onPress) {
        //         this.props.onPress();
        //     }
        //     SPopup.close("CuentaContableForm");
        // })
    }
    _ref: any = {}
    render() {
        const { cuenta_contable, onPress } = this.props;
        return <View
            style={{
                width: 500,
                maxWidth: "100%",
                borderRadius: 8,
                backgroundColor: STheme.color.background,
            }}>
            <SView flex col={"xs-12"} withoutFeedback padding={16} center>
                <SText fontSize={14} bold>{"Editar la cuenta"}</SText>
                <SHr height={8} />
                <SInput ref={ref => this._ref.codigo = ref} defaultValue={cuenta_contable?.codigo} placeholder={"Codigo"} />
                <SHr height={8} />
                <SInput ref={ref => this._ref.descripcion = ref} defaultValue={cuenta_contable?.descripcion} placeholder={"Descripcion de la cuenta"} />
                <SHr height={16} />
                <SView row col={"xs-12"}>
                    <SView flex />
                    <SText card padding={8} onPress={() => {
                        SPopup.close("CuentaContableForm");
                    }}>{"CANCELAR"}</SText>
                    <SView flex />
                    <SText card padding={8} onPress={this.submit.bind(this)}>{"ACEPTAR"}</SText>
                    <SView flex />
                </SView>
            </SView>

        </View>
    }
}