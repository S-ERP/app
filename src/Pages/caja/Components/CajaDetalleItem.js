import React, { Component } from 'react';
import { SButtom, SDate, SHr, SIcon, SList, SLoad, SMath, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import _types from './_types';
import Model from '../../../Model';
import PopupAjustes from './PopupAjustes';
export default class CajaDetalleItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    getColor() {
        if (this.props.data.monto > 0) return STheme.color.success
        return STheme.color.danger
    }

    getTipo(obj) {
        var data = obj.data;
        if (!data) return null;
        var tipo = _types[data.type]
        return <SView onPress={() => {
            tipo.action(obj);
        }}>{tipo.getEstado(obj)}</SView>
    }

    getCuentas(obj) {
        if (!obj.cuentas) return null;
        if (!this.state.ver_cuentas) return <SText underLine fontSize={12} color={STheme.color.lightBlack} onPress={() => this.setState({ ver_cuentas: true })}>Ver cuentas</SText>
        var cuentas = Model.cuenta_contable.Action.getAll();
        if (!cuentas) return <SLoad />
        return <SView col={"xs-12"}>
            <SText fontSize={12} onPress={() => this.setState({ ver_cuentas: false })} underLine color={STheme.color.lightBlack}>Cerrar cuentas</SText>
            <SHr />
            {/* <SHr h={1} color={STheme.color.lightBlack} /> */}
            <SList data={obj.cuentas}
                render={(cuenta_movimiento) => {
                    var cuenta = cuentas[cuenta_movimiento.key_cuenta_contable];
                    return <SView col={"xs-12"}>
                        <SHr h={4} />
                        <SView row col={"xs-12"}>
                            <SView row flex>
                                <SText fontSize={12} >{cuenta?.codigo}</SText>
                                {/* <SText fontSize={8}>{cuenta_movimiento?.key_cuenta_contable}</SText> */}
                                <SView width={8} />
                                <SText fontSize={12} flex >{cuenta?.descripcion}</SText>
                                {/* <SText col={"xs-12"}>{cuenta.codigo} {cuenta.descripcion}</SText> */}
                            </SView>
                            <SView width={80} style={{
                                alignItems: "flex-end"
                            }}>
                                <SText fontSize={12}>{SMath.formatMoney(cuenta_movimiento?.monto)}</SText>
                            </SView>

                        </SView>
                        <SHr h={4} />
                        <SHr h={1} color={STheme.color.lightBlack} />
                    </SView>
                }} />
        </SView>
    }

    getAjustes() {
        if (!Model.usuarioPage.Action.getPermiso({ url: "/caja", permiso: "eliminar_movimiento" })) {
            return null;
        }
        return <SView width={30} height={30} style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            justifyContent: "flex-end",
            alignItems: "flex-end"
        }} onPress={() => {
            PopupAjustes.open({
                data: this.props.data
            });

        }}>
            <SIcon name='Engranaje' fill={STheme.color.lightGray} width={16} height={16} />
        </SView>
    }
    render() {
        var obj = this.props.data;
        // console.log(obj)
        // if(obj.tipo == "cierre") return null
        return <SView col={"xs-12"} card style={{ padding: 8 }} row>
            {/* <SText card style={{ padding: 8 }}>{JSON.stringify(obj)}</SText> */}
            <SView flex>
                <SText fontSize={16}>{obj.descripcion}</SText>
                <SText fontSize={10} color={STheme.color.gray}>{new SDate(obj.fecha_on).toString("yyyy-MM-dd hh:mm")}</SText>
                <SText fontSize={10} color={STheme.color.gray}>{obj.tipo}</SText>
                <SHr />
                <SHr />
            </SView>
            <SView center>
                <SText bold color={this.getColor()} fontSize={16}>Bs. {SMath.formatMoney(obj.monto)}</SText>
                <SText fontSize={10}>{obj.key_tipo_pago}</SText>
            </SView>
            <SView col={"xs-12"}>
                {this.getTipo(obj)}
            </SView>
            {this.getCuentas(obj)}

            {this.getAjustes()}
        </SView>
    }
}
