import React from "react";
import { SHr, SPage, SText, STheme, SView } from "servisofts-component";
import AjusteTag from "../../conta/Components/AjusteTag copy";
// import MDL from "../../../MDL";
// import AjusteTag from "./AjusteTag";
// import AjusteTagInfoPopup from "./AjusteInfoPopup";

export default class InformacionReporteConteoInventario extends React.Component<any> {

    // state = {
    //     ajustes: []
    // }
    // componentDidMount(): void {
    //     MDL.contabilidad.getAjustes().then((resp: any) => {
    //         console.log("Ajustes: ", resp);
    //         this.setState({
    //             ajustes: resp
    //         })
    //     }).catch((e: any) => {

    //     })
    // }

    render() {
        const data = this.props.ajustes.filter((a: any) => !a?.ajuste_empresa);
        if (data.length == 0) return null;
        return <SView width={200} card padding={8} border={STheme.color.warning + "66" as any} style={{
            backgroundColor: STheme.color.background
        }}>
            <SText fontSize={12} color={STheme.color.warning}>Tienes cuentas pendientes de configurar</SText>
            <SHr />
            <SView row col={"xs-12"}>
                {/* {data.map((ajuste: any, index: number) => {
                    return <AjusteTag allowDrag ajuste={ajuste} textStyle={{ fontSize: 12 }} style={{ margin: 2 }}
                        onPress={() => {
                            AjusteTagInfoPopup.open({ ajuste: ajuste })
                        }}
                    />
                })} */}
            </SView>
        </SView>
    }
}