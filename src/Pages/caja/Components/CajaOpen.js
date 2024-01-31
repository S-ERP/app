import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SDate, SHr, SIcon, SImage, SList, SLoad, SMath, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import CajaActions from './CajaActions';
import CajaDetalleItem from './CajaDetalleItem';
import SelectMonedas from './SelectMonedas';
import _types from './_types';
import SSocket from 'servisofts-socket';
import Cajero from './Cajero';
import CajaArqueo from './CajaArqueo';
import Components from '../../../Components';
class CajaOpen extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    render_open(data) {
        var caja_detales = Model.caja_detalle.Action.getAll({ key_caja: data.key });
        var usuario = Model.usuario.Action.getByKey(data.key_usuario);
        var punto_venta_tipo_pago = Model.punto_venta_tipo_pago.Action.getAll({ key_punto_venta: data.key_punto_venta });

        if (!caja_detales) return <SLoad />
        if (!usuario) return <SLoad />
        if (!punto_venta_tipo_pago) return <SLoad />
        // var monto_actual = Model.caja_detalle.Action.getMontoEnCaja({ key_caja: data.key });
        // console.log(data)
        return <SView center col={"xs-12"}>
            <Cajero data={data} />
            <SHr />
            <SView col={"xs-12"} row>
                <SView flex>
                    <SText color={STheme.color.text} fontSize={12}>{"Registrada el " + new SDate(data.fecha_on).toString("DAY, dd de MONTH del yyyy a las hh:mm")}</SText>
                    <SText color={STheme.color.text} fontSize={12}>{"para la fecha " + new SDate(data.fecha,"yyyy-MM-dd").toString("DAY, dd de MONTH del yyyy")}</SText>
                    <SHr />
                    <SText color={STheme.color.warning} fontSize={12}>{data.fecha_cierre ? new SDate(data.fecha_cierre).toString("DAY, dd de MONTH del yyyy a las hh:mm") : "La caja se encuentra abierta."}</SText>
                </SView>
                <SView>
                    <Components.caja.QRCaja pk={data.key} width={120} height={120} />
                </SView>
            </SView>

            {/* 
            <SHr height={16} />
            <SView card style={{ padding: 16 }}>
                <SText fontSize={20} bold>Bs. {SMath.formatMoney(monto_actual)}</SText>
            </SView> */}
            <SHr height={36} />
            {data.fecha_off}<CajaArqueo key_caja={data.key} punto_venta_tipo_pago={punto_venta_tipo_pago} />
            <SHr height={36} />
            {!data.fecha_cierre ? <CajaActions data={data} punto_venta_tipo_pago={punto_venta_tipo_pago} /> : <SText>Caja cerrada</SText>}
            <SHr height={36} />
            <SList
                col={"xs-12"}
                order={[{ key: "fecha_on", order: "desc", peso: 1, type: "date" }]}
                filter={obj => obj.estado != 0}
                data={caja_detales}
                render={(obj) => {
                    return <CajaDetalleItem data={obj} caja={data} />
                }}
            />
            <SHr height={100} />
        </SView>
    }

    render() {
        return (<SView col={"xs-11 sm-10 md-8 lg-6 xl-4"}>
            {this.render_open(this.props.data)}
            {/* <SelectMonedas key_empresa={this.props.sucursal.key_empresa}/> */}
        </SView>
        );
    }
}

export default (CajaOpen);