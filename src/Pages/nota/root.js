import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SInput, SLoad, SNavigation, SPage, SPopup, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';

import Container from '../../Components/Container';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import UsuariosNota from './Components/UsuariosNota';
import ChangeColor from './Components/ChangeColor';


export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.pk = SNavigation.getParam("pk", SUuid())
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
        new SThread(5000, "hilo_nota", false).start(() => {
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
        if (this?.state?.data?.observacion == val) return;
        if (!this.state.data) {
            this.setState({ cargando: true })
            Model.nota.Action.registro({
                data: {
                    key_empresa: Model.empresa.Action.getKey(),
                    key_usuario: Model.usuario.Action.getKey(),
                    observacion: val,
                }
            }).then(e => {
                this.pk = e.data?.key;
                this.setState({ data: e.data, cargando: false })
                this.loadData();
            })
        } else {

            Model.nota.Action.editar({
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

    menu() {
        if (!this.state.data) return;
        return <SView col={"xs-12"} row>
            <ChangeColor value={this.state?.data?.color} onChange={(color => {
                this.state.data.color = color;
                this.setState({ ...this.state })
                Model.nota.Action.editar({
                    data: {
                        ...this.state.data,
                        color: color,
                    },
                    key_empresa: Model.empresa.Action.getKey(),
                    key_usuario: Model.usuario.Action.getKey(),
                }).then(e => {

                })
            })} />
            <SText style={{
                padding: 4,
            }} color={"#666"} fontSize={12}
                onPress={() => {
                    SNavigation.navigate("/nota/historial", { pk: this.state?.data?.key })
                }}
            >{"VER HISTORIAL"} </SText>
            <SText style={{
                padding: 4,
            }} color={STheme.color.danger} fontSize={12}
                onPress={() => {
                    SPopup.confirm({
                        title: "Seguro que quieres eliminar la nota?",
                        message: "Dejaras de ver la nota, si alguien es miembro de la nota puede invitarte nuevamete.",
                        onPress: () => {
                            Model.nota.Action.quitarUsuario({
                                key_nota: this.state?.data?.key,
                                key_usuario_nota: Model.usuario.Action.getKey()
                            }).then(e => {
                                SNavigation.goBack();
                            })
                        }
                    })
                }}
            >{"ELIMINAR"} </SText>

            <SView flex />
            <SText style={{
                padding: 4,
                alignItems: "flex-end"
            }} color={"#666"} fontSize={12}>{new SDate(this.state?.data?.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("MON dd, yyyy  hh:mm")} </SText>
        </SView>
    }

    content() {
        if (this.state.cargando) return <SLoad />
        return <SView flex col={"xs-12"} backgroundColor={this.state?.data?.color ?? "#E9E389"}>
            {!this.state?.data ? null : <UsuariosNota key_nota={this.pk} />}
            {this.menu()}
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
                placeholder={"¡Hola! Escribe tu mensaje y no te preocupes por guardarlo. \n¡se guardará automáticamente en unos segundos!"}
                onChangeText={e => {
                    if (e == this.state?.data?.observacion) return;
                    this.onEdit = true;
                    new SThread(3000, "nota_change", true).start(a => {
                        this.onEdit = false;
                        this.save(e);
                    })
                }}
            />
        </SView>
    }
    render() {
        return <SPage title="Nota" disableScroll >
            {this.content()}
        </SPage>
    }
}
