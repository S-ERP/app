import React, { Component } from 'react';
import { SButtom, SDate, SHr, SIcon, SList, SLoad, SMath, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import _types from './_types';
export default class CajaActions extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    item(key) {
        // console.log(obj);

        var action = _types[key];
        if (action.permiso) {

            if (!Model.usuarioPage.Action.getPermiso({ url: "/caja", permiso: action.permiso })) {
                if (this.props.data.key_usuario != Model.usuario.Action.getKey()) {
                    return null;
                }
                if (action.permiso != "cerrar_caja_otro_usuario") {
                    return null;
                }
            }
        } else {
            if (this.props.data.key_usuario != Model.usuario.Action.getKey()) {
                return null;
            }
        }
        return <SView width={80} height={80} center onPress={() => {
            action.onPress(this.props.data, this.props.punto_venta_tipo_pago)
        }} style={{
            padding: 2
        }}>
            <SView col={"xs-12"} height card style={{ padding: 4 }} center>
                <SView flex colSquare>
                    <SIcon name={action.icon} />
                </SView>
                <SView col={"xs-12"} center height={26}>
                    <SText center fontSize={10} bold>{action.descripcion}</SText>
                </SView>
            </SView>
        </SView >
    }
    render() {
        return <SView col={"xs-12"}>
            <SList
                // center
                scrollEnabled={false}
                horizontal
                contentContainerStyle={{
                    flex: 1,
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                }}
                data={Object.keys(_types)}
                render={this.item.bind(this)} />
        </SView>
    }
}
