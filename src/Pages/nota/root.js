import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SIcon, SInput, SLoad, SNavigation, SPage, SPopup, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';

import Container from '../../Components/Container';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import UsuariosNota from './Components/UsuariosNota';
import ChangeColor from './Components/ChangeColor';
import PButtom3 from '../../Components/PButtom3';


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
        }).catch(e=>{
            console.error(e);
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
        return <SView col={"xs-12"} row >
            <SHr height={15} />
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
            <SView width={10} />
            {/* <SView center >
                <SText style={{
                    padding: 4,
                }} underLine
                    color={"#666"} fontSize={12}
                    onPress={() => {
                        SNavigation.navigate("/nota/historial", { pk: this.state?.data?.key })
                    }}
                >{"VER HISTORIAL"} </SText>
            </SView> */}

            <PButtom3 small
                fontSize={10}
                bg={"#138BBD"}
                icon={"history"}
                onPress={() => {
                    SNavigation.navigate("/nota/historial", { pk: this.state?.data?.key })
                }}>
                HISTORIAL
            </PButtom3>
            <SView width={5} />
            <PButtom3 small
                fontSize={10}
                bg={STheme.color.danger}
                icon={"remove"}
                onPress={() => {
                    SPopup.confirm({
                        title: "¿Seguro que quieres eliminar la nota?",
                        message: "Dejarás de ver la nota, si alguien es miembro de la nota puede invitarte nuevamente.",
                        onPress: () => {
                            Model.nota.Action.quitarUsuario({
                                key_nota: this.state?.data?.key,
                                key_usuario_nota: Model.usuario.Action.getKey(),
                                key_usuario: Model.usuario.Action.getKey()
                            }).then(e => {
                                SNavigation.goBack();
                            })
                        }
                    })
                }}>
                ELIMINAR
            </PButtom3>

            <SView flex />
            <SText style={{
                padding: 4,
                alignItems: "flex-end"
            }} color={"#666"} fontSize={12}>{new SDate(this.state?.data?.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("MON dd, yyyy  hh:mm")} </SText>
        </SView>
    }

    content() {
        if (this.state.cargando) return <SLoad />
        return <>
            <SView flex col={"xs-12"} backgroundColor={this.state?.data?.color ?? "#E9E389"}>
                {!this.state?.data ? null : <UsuariosNota key_nota={this.pk} />}
                {this.menu()}

                <SInput ref={ref => this.inp = ref}
                    type={"textArea"}
                    customStyle={"clean"}
                    width={"100%"}
                    // height={"100%"}
                    autoFocus
                    // numberOfLines={1000}
                    multiline
                    style={{
                        color: "#000",
                        height: "100%",
                        // backgroundColor:"#f0f",
                        padding: 6,
                        textAlignVertical: 'top'
                        // alignContent:"flex-start",
                        // alignItems:"flex-start",
                        // textAlign:"left"
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
            <SView row>
                <SView height={33.91} backgroundColor={this.state?.data?.color ?? "#EDE485"} flex style={{ padding: 2 }}>
                </SView>
                <SView height={33.91} width={60} style={{ position: "relative", top: 0, right: 0, overflow: "hidden", alignItems: "flex-end" }} backgroundColor={STheme.color.barColor}>
                    {/* <SView   style={{
                        width: 28,
                        height: Math.sqrt(Math.pow(28, 2) + Math.pow(16, 2)),
                        borderBottomWidth: 16,
                        borderBottomColor: "this.state?.data?.color" ?? "#EDE485",
                        borderLeftWidth: 28 / 2,
                        borderLeftColor: 'transparent',
                        borderRightWidth: 28 / 2,
                        borderRightColor: 'transparent',
                    }}/> */}


                    <SIcon name={"notaEsquina"} width={60} height={33.91} fill={this.state?.data?.color ? this.state?.data?.color + "95" : "#EDE48595"} />
                </SView>
            </SView>
            {/* <SView height={50} backgroundColor={STheme.color.danger} style={{position:"relative", bottom:0, right:0}}>
                <SText center color={STheme.color.white} fontSize={12} >{"Nota guardada automaticamente"}</SText>
            </SView> */}
        </>
    }
    render() {
        return <SPage title="Nota" disableScroll >
            {this.content()}
        </SPage>
    }
}
