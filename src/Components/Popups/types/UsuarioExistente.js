import React, { Component } from 'react';
import { SForm, SGradient, SHr, SImage, SLoad, SMath, SNavigation, SPage, SPopup, SStorage, SText, STheme, SView, SIcon } from 'servisofts-component';
import Model from '../../../Model';
import SSocket from 'servisofts-socket';
type PropsType = {

    data: any
}

export default class UsuarioExistente extends Component<PropsType> {
    static POPUP_CODE = "POPUP_TAPEKES_AGOTADOS";
    static open(props: PropsType) {
        SPopup.open({
            key: this.POPUP_CODE,
            content: <UsuarioExistente {...props} />
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
        const { data } = this.props;
        return <SView width={362} height={286} center style={{ borderRadius: 8 }} withoutFeedback backgroundColor={STheme.color.background}   >
            {SPage.backgroundComponent}
            <SHr height={8} />
            <SView col={"xs-12"} height={35} center style={{ borderBottomWidth: 1, borderColor: STheme.color.primary }}>
                <SText color={STheme.color.lightGray} style={{ fontSize: 16 }} bold center >El usuario ya se encuentra registrado</SText>
            </SView>
            <SHr height={8} />
            <SView col={"xs-12"} flex center>
                <SView col={"xs-11"} center row>
                    <SView height={40} width={40} center card>
                        <SImage src={Model.usuario._get_image_download_path(SSocket.api.root, data["key"])} />
                    </SView>
                    <SView col={"xs-11"} center>
                        <SHr height={8} />
                        <SText fontSize={14} color={STheme.color.secondary} center >{data["Nombres"]} {data["Apellidos"]}</SText>
                        <SHr height={4} />
                        <SText fontSize={14} color={STheme.color.secondary} center >{data["CI"]}</SText>
                        <SHr height={4} />
                        <SText fontSize={14} color={STheme.color.secondary} center >{data["Correo"]}</SText>
                        <SText fontSize={14} color={STheme.color.secondary} center >{data["Telefono"]}</SText>
                    </SView>
                </SView>
            </SView>
            <SHr height={8} />
            <SView col={"xs-12"} center row>
                <SView width={140} height={44} center card style={{ borderRadius: 8 }}
                    onPress={() => {
                        UsuarioExistente.close();
                    }}  >
                    <SText fontSize={14} color={STheme.color.white} bold>Salir</SText>
                </SView>
                <SView width={8} />
                <SView width={140} height={44} center card style={{ borderRadius: 8 }}
                    onPress={() => {
                        SNavigation.navigate("/usuario/profile", { pk: data["key"] })
                        UsuarioExistente.close();
                    }}  >
                    <SText fontSize={14} color={STheme.color.white} bold>Ver</SText>
                </SView>
            </SView>
            <SHr height={8} />
        </SView>
    }
}