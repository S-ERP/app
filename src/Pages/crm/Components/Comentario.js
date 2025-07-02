import React, { Component } from "react";
import {
    SDate,
    SHr,
    SImage,
    SInput,
    SList,
    SLoad,
    SMath,
    SNavigation,
    SText,
    STheme,
    SThread,
    SView,
} from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../../MDL";
import Model from "../../../Model";
// import Model from "../../Model";


export default class Comentario extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }


    componentDidMount() {
        //   this.traerAllOrdenes();
    }


    render() {
        return (
            <SView col={"xs-12"}>
                <SView
                    col={"xs-12"}
                    center
                    style={{ padding: 16, borderRadius: 16, borderWidth: 2 }}
                    border={STheme.color.card}
                    backgroundColor={STheme.color.card}
                >
                    <SView col="xs-12" row center>
                        <SView col="xs-12">
                            <SText fontSize={14} bold>Comentarios</SText>
                        </SView>
                    </SView>

                    <SHr col={"xs-12"} height={8} />

                    <SInput
                        // label={"Comentario"}
                        type="textArea"
                        placeholder={"Adicionar tus comentarios aquí..."}
                        placeholderTextColor={STheme.color.gray}
                        value={this.props.data?.comentario}

                        style={{
                            textAlignVertical: "top",
                            padding: 4,
                        }}
                        onChangeText={e => {
                            this.props.data.comentario = e
                            this.forceUpdate();
                            new SThread(2000, "comentario", true).start(() => {
                                MDL.crm.clienteProyecto.editar({
                                    key: this.props.data.key,
                                    key_usuario_atiende: Model.usuario.Action.getKey(),
                                    comentario: e,
                                }).then(() => {
                                }).catch((error) => {
                                })
                            })
                        }}
                    />
                </SView>
            </SView>
        );
    }
}
