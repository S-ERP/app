import React, { Component } from 'react'
import { SHr, SImage, SInput, SList, SLoad, SPopup, SText, SView } from 'servisofts-component';
import Model from '../../../../../Model';
import SSocket from 'servisofts-socket'
import { connect } from 'react-redux';
class Editar_modelo_inventario_dato extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        this.pk = this.props.key_modelo;
        var inventario_dato = Model.inventario_dato.Action.getAll();
        var modelo_inventario_dato = Model.modelo_inventario_dato.Action.getAllByKeyModelo(this.pk);
        var allowEdit = Model.usuarioPage.Action.getPermiso({ url: "/productos/modelo", permiso: "edit_inventario_dato" })
        if (!inventario_dato) return <SLoad />;
        if (!modelo_inventario_dato) return <SLoad />;
        if (allowEdit == "cargando") return <SLoad />;
        return (<SView col={"xs-12"}>
            <SHr />
            <SText fontSize={16} bold>Datos</SText>
            <SHr />
            <SList
                data={inventario_dato}
                buscador
                render={(itm) => {
                    var activo = Object.values(modelo_inventario_dato).find(o => o.key_inventario_dato == itm.key && o.estado > 0)
                    return <SView row col={"xs-12"} style={{
                        alignItems: 'center'
                    }}>
                        <SInput
                            col={""}
                            type={"checkBox"}
                            defaultValue={!!activo}
                            editable={!!allowEdit}
                            onChangeText={(e) => {
                                if (e) {
                                    Model.modelo_inventario_dato.Action.registro({
                                        data: {
                                            key_modelo: this.pk,
                                            key_inventario_dato: itm.key,
                                        },
                                        key_usuario: Model.usuario.Action.getKey()
                                    })
                                } else {
                                    Model.modelo_inventario_dato.Action.editar({
                                        data: {
                                            ...activo,
                                            estado: 0
                                        },
                                        key_usuario: Model.usuario.Action.getKey()
                                    })
                                }
                            }} />
                        {/* <SView width={30} height={30} card>
                            <SImage src={Model.rol._get_image_download_path(SSocket.api, itm.key)} />
                        </SView> */}
                        <SView width={8} />
                        <SText>{itm.descripcion}</SText>
                        <SView width={8} />
                        <SText bold>{itm.observacion}</SText>

                    </SView>

                }}
            />
        </SView>
        )
    }
}

const initStates = (state) => {
    return { state }
};
export default connect(initStates)(Editar_modelo_inventario_dato);