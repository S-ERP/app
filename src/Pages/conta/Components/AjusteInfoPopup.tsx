import React from "react";
import { TextStyle, ViewStyle } from "react-native";
import { SHr, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../../MDL";

type Props = { ajuste: any, onPress?: () => void, style?: ViewStyle, textStyle?: TextStyle }
export default class AjusteTagInfoPopup extends React.Component<Props> {
    static open(props: Props) {
        SPopup.open({
            key: "AjusteTagInfoPopup",
            content: <AjusteTagInfoPopup {...props} />,
        })
    }
    handleDeleteAjusteEmpresa() {
        MDL.contabilidad.saveAjusteEmpresa({
            key: this.props?.ajuste?.ajuste_empresa?.key,
            estado: 0,
        }).then(e=>{
            if(this.props.onPress) {
                this.props.onPress();
            }
            SPopup.close("AjusteTagInfoPopup");
        })
    }
    render() {
        const { ajuste, onPress } = this.props;
        return <SView width={200} backgroundColor={STheme.color.background} style={{
            borderRadius: 8,
            padding: 16,
        }}>
            <SText fontSize={14} bold><SText clean fontSize={10} color={STheme.color.lightGray} >{ajuste?.grupo_sugerido}</SText> {ajuste?.descripcion}</SText>
            <SHr height={8} />
            <SText fontSize={12} color={STheme.color.lightGray}>{ajuste?.observacion}</SText>
            {this.props.ajuste.ajuste_empresa && <>
                <SHr height={8} />
                <SText fontSize={8}>{this.props?.ajuste?.ajuste_empresa?.key_cuenta_contable}</SText>
                <SText color={STheme.color.danger} onPress={this.handleDeleteAjusteEmpresa.bind(this)}>{"RESET"}</SText>
            </>}
        </SView>
    }
}