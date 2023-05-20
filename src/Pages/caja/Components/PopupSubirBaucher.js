import React, { Component } from 'react';
import { SButtom, SForm, SHr, SIcon, SInput, SList, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import Model from '../../../Model';
import SSocket from 'servisofts-socket'
type PropsTypes = {
    onSucces: () => any
}

const POPUP_KEY = "PopupSubirBaucher"
export default class PopupSubirBaucher extends Component<PropsTypes> {
    static open(props: PropsTypes) {
        SPopup.open({
            key: POPUP_KEY,
            content: <PopupSubirBaucher {...props} />
        })
    }
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    close() {
        SPopup.close(POPUP_KEY)
    }


    render() {
        return (
            <SView col={"xs-12 sm-10 md-8 lg-6 xl-4"} backgroundColor={STheme.color.background} style={{
                borderRadius: 8,
            }} center withoutFeedback padding={16}>
                <SHr height={16} />
                <SText>Subir la foto del baucher</SText>
                <SHr height={16} />
                <SInput type='image' defaultValue={SSocket.api.root + "/caja_movimineto/" + this.props.data.key} onChangeText={val => {
                    if (!val[0]) return null;
                    Upload.sendPromise(val[0], SSocket.api.root + "/upload/caja_movimineto/" + this.props.data.key).then((e) => {
                        console.log("ecto");
                        this.close();
                        this.props.onSucces();
                    }).catch((e) => {
                        console.error(e);
                    })
                }} />
                <SHr height={16} />
            </SView>
        );
    }
}
