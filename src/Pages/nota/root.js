import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SInput, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';

import Container from '../../Components/Container';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import UsuariosNota from './Components/UsuariosNota';


export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.pk = SNavigation.getParam("pk")
    }

    componentDidMount() {
        this.isClose = false;
        this.loadData();
        this.hilo();
    }
    loadData() {
        SSocket.sendPromise({
            component: "nota",
            type: "getByKey",
            key: this.pk
        }).then(e => {
            this.setState({ data: e.data[this.pk] })
            this.inp.setValue(e?.data[this.pk]?.observacion)
        })
    }
    hilo() {
        new SThread(3000, "hilo_nota", false).start(() => {
            if (this.isClose) return;
            this.hilo();
            if (this.onEdit) return;
            this.loadData();

        })
    }
    componentWillUnmount() {
        if (this.inp) {
            this.save(this.inp.getValue());
        }
        this.isClose = true;

    }
    save(val) {
        if (this.isClose) return;
        if (!val) return;
        if (!this.state.data) {
            SSocket.sendPromise({
                component: "nota",
                type: "registro",
                data: {
                    key_empresa: Model.empresa.Action.getKey(),
                    key_usuario: Model.usuario.Action.getKey(),
                    observacion: val,
                }
            }).then(e => {
                this.setState({ data: e.data })
            })
        } else {
            SSocket.sendPromise({
                component: "nota",
                type: "editar",
                data: {
                    ...this.state.data,
                    observacion: val,
                },
                key_empresa: Model.empresa.Action.getKey(),
                key_usuario: Model.usuario.Action.getKey(),
            }).then(e => {

            })
        }

    }
    render() {
        return <SPage title="Nota" disableScroll >
            <SView flex col={"xs-12"} backgroundColor={"#E9E389"}>
                <UsuariosNota key_nota={this.pk} />
                <SView col={"xs-12"} row>
                    {!this.state?.data?.key ? null :
                        <SText style={{
                            padding: 4,
                        }} color={"#666"} fontSize={12}
                            onPress={() => {
                                SNavigation.navigate("/nota/historial", { pk: this.state?.data?.key })
                            }}
                        >{"VER HISTORIAL"} </SText>
                    }
                    <SView flex />
                    <SText style={{
                        padding: 4,
                        alignItems: "flex-end"
                    }} color={"#666"} fontSize={12}>{new SDate(this.state?.data?.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("MON dd, yyyy  hh:mm")} </SText>
                </SView>
                <SInput ref={ref => this.inp = ref}
                    type={"textArea"}
                    customStyle={"clean"}
                    width={"100%"}
                    height={"100%"}
                    autoFocus
                    style={{
                        color: "#000",
                        padding: 6
                    }}
                    placeholder={"Escribe la nota..."}
                    onChangeText={e => {
                        if (e == this.state.data.observacion) return;
                        this.onEdit = true;
                        new SThread(3000, "nota_change", true).start(a => {
                            this.onEdit = false;
                            this.save(e);
                        })
                    }}
                />
            </SView>
        </SPage>
    }
}
