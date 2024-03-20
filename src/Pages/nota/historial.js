import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SImage, SInput, SLoad, SNavigation, SPage, STable, SText, STheme, SThread, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';



export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.pk = SNavigation.getParam("pk")
    }

    componentDidMount() {
        SSocket.sendPromise({
            component: "nota",
            type: "getHistorico",
            key_nota: this.pk,
        }).then(e => {
            this.setState({ data: e.data })
        })
    }

    render() {
        if (!this.state.data) return <SLoad />;
        return <SPage title="Historial" disableScroll >
            <STable
                header={[
                    { key: "index", label: "#", width: 40 },
                    { key: "fecha_on", label: "Fecha", width: 150, render:a=>new SDate(a,"yyyy-MM-ddThh:mm:ss").toString("yyyy-MM-dd hh:mm") },
                    { key: "key_usuario", label: "Usuario", width: 50, render: a => <SImage src={Model.usuario._get_image_download_path(SSocket.api, a)} /> },
                    { key: "observacion", label: "Observacion", width: 250 },
                    // { key: "key_empresa", label: "Empresa", width: 250 },

                ]}
                data={this.state.data}
            />
        </SPage>
    }
}
