import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SIcon, SInput, SLoad, SNavigation, SPage, SPopup, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';

import Container from '../../Components/Container';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import UsuariosNota from './Components/UsuariosNota';
import ChangeColor from './Components/ChangeColor';
import PButtom3 from '../../Components/PButtom3';
import MDL from '../../MDL';
import TextArea from '../../Components/QueryTool/TextArea';
import ReservedWords from '../../Components/QueryTool/ReservedWords';
import DropZoneWeb from '../../Components/InputFoto/DropZoneWeb';


export default class root extends Component {
    windowID = SUuid();
    pk = SNavigation.getParam("pk")
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        this.isClose = false;
        this.loadData();
        // this.hilo();

        MDL.erp.addServerListener({
            key: "nota_edit_" + this.pk,
            component: "nota",
            type: "editar",
            key_empresa: MDL.empresa.select?.key,
            data: {
                key: this.pk
            },
            callback: (response) => {
                if (response.windowID == this.windowID) return;
                console.log("nota_edit_" + this.pk, response);
                this.setState({
                    data: {
                        ...this.state.data,
                        ...response.data
                    }
                })
                if (this.inp) this.inp.setValue(response.data?.observacion ?? "")
                // if (data.instance_id != config.current.instance_id) {
                // loadDataFromServer();
                // }
            }
        })
    }

    loadData() {
        SSocket.sendPromise({
            component: "nota",
            type: "getByKey",
            key: this.pk
        }).then(e => {
            this.setState({ data: e.data[this.pk] })
            this.inp.setValue(e?.data[this.pk]?.observacion ?? "")
        }).catch(e => {
            console.error(e);
        })
    }
    hilo() {
        new SThread(2000, "hilo_nota", false).start(() => {
            if (this.isClose) return;
            this.hilo();
            if (this.onEdit) return;
            this.loadData();

        })
    }
    componentWillUnmount() {
        MDL.erp.removeServerListener({
            key: "nota_edit_" + this.pk,
        })
        if (this.inp) {
            if (!this.inp.getValue()) return;
            this.save(this.inp.getValue());
        }
        this.isClose = true;

    }
    save(val) {
        if (this.isClose) return;
        // if (!val) return;
        if (this?.state?.data?.observacion == val) return;
        if (!this.pk) {
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

            this.state.data.observacion = val;
            Model.nota.Action.editar({
                data: {
                    ...this.state.data,
                    observacion: val,
                },
                windowID: this.windowID,
                key_empresa: Model.empresa.Action.getKey(),
                key_usuario: Model.usuario.Action.getKey(),
            }).then(e => {

            })
        }

    }

    menu() {
        if (!this.state.data) return;
        return <SView col={"xs-12"} row >
            <SHr height={8} />
            <SView style={{ width: 100, height: 40 }}>
                <SInput
                    style={{
                        color: "#000",
                        height: 30
                    }}
                    type='select2'
                    customStyle={"erp"}
                    value={this.state?.data?.type ?? "TEXT"}
                    label={"type"} options={Object.keys(ReservedWords)}
                    onChangeText={e => {
                        if (!e) return;
                        if (!ReservedWords[e]) return;
                        this.state.data.type = e;
                        this.setState({ ...this.state })
                        Model.nota.Action.editar({
                            data: {
                                ...this.state.data,
                                type: e,
                            },
                            key_empresa: Model.empresa.Action.getKey(),
                            key_usuario: Model.usuario.Action.getKey(),
                        }).then(e => {

                        })
                    }}
                />
            </SView>
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
                <SView flex col={"xs-12"}>
                    {/* <DropZoneWeb handleDropFiles={(files,evt) => {
                        console.log(files, evt);
                    }}> */}
                        <TextArea
                            key={this.pk}
                            style={{
                                color: "#000",
                                caretColor: "#000",
                                font: "Roboto",
                                fontFamily: "Roboto",
                                fontSize: 14,
                            }} backgroundColor='transparent'
                            type={(!!this.state?.data?.type && !!ReservedWords[this.state?.data?.type]) ? this.state?.data?.type : "TEXT"}
                            ref={ref => this.inp = ref}
                            defaultValue={this.state?.data?.observacion ?? ""}
                            onChangeText={e => {
                                if (e == this.state?.data?.observacion) return;
                                this.onEdit = true;
                                new SThread(500, "nota_change", true).start(a => {
                                    this.onEdit = false;
                                    this.save(e);
                                })
                            }}
                        />
                    {/* </DropZoneWeb> */}


                    {/* <SInput ref={ref => this.inp = ref}
                    type={"textArea"}
                    customStyle={"clean"}
                    width={"100%"}
                    // height={"100%"}
                    autoFocus
                    // numberOfLines={1000}
                    multiline
                    style={{
                        color: "#000",
                        flex: 1,
                        // backgroundColor:"#f0f",
                        padding: 6,
                        textAlignVertical: 'top'
                        // alignContent:"flex-start",
                        // alignItems:"flex-start",
                        // textAlign:"left"
                    }}
                    placeholderTextColor={"#999"}
                    placeholder={"¡Hola! Escribe tu mensaje y no te preocupes por guardarlo. \n¡se guardará automáticamente en unos segundos!"}
                    
                /> */}
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
