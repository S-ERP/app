import React from "react";
import { SHr, SPage, SPopup, SText, STheme, SView } from "servisofts-component";

type ServerPopupProps = {
    server: any
}
export default class ServerPopup extends React.Component<ServerPopupProps> {
    static open(props: ServerPopupProps) {
        SPopup.open({
            content: <SView col={"xs-12"} withoutFeedback style={{
                width: "100%",
                maxWidth: 500,
                backgroundColor: STheme.color.background,
                borderRadius: 8,
                padding: 8,
                cursor:"default",
                
            }}>
                <ServerPopup {...props} />
            </SView>
        })
    }
    render() {
        const { nombre, habilitados } = this.props.server
        return <SView col={"xs-12"} center>
            <SText fontSize={20} bold>{nombre}</SText>
            <SHr />
            <SView row style={{
                alignItems: "center"
            }}>
                <SText clean color={STheme.color.lightGray}>{"Servicios habilitados:"}</SText>
                {habilitados.map((a: any) => <SText style={{
                    margin: 4,
                    padding: 2,
                    paddingHorizontal: 8,
                    borderRadius: 4,
                    borderColor: STheme.colorFromText(a.servicio.nombre),
                    borderWidth: 1,
                    backgroundColor: STheme.colorFromText(a.servicio.nombre) + "55"
                }} clean fontSize={14}>{a.servicio.nombre}</SText>)}
            </SView>
        </SView>
    }
}