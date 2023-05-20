import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SList, SMath, SPage, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
type PropsType = {

}
class CajaArqueo extends Component<PropsType> {

    size = 60;

    textStyle = {
        fontSize: 12,
    }
    contentTextStyle = {
        alignItems: 'flex-end',
    }
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    loadData() {
        this.tipo_pago = Model.tipo_pago.Action.getAll();
        this.caja_detalles = Model.caja_detalle.Action.getAll({ key_caja: this.props.key_caja });
        if (!this.tipo_pago) return false;
        if (!this.caja_detalles) return false;
        return true;
    }


    renderTipoPago(tipo_pago) {
        var movimientos = Object.values(this.caja_detalles).filter(o => o.key_tipo_pago == tipo_pago.key && o.estado != 0)
        var monto = 0;
        var aux;
        var monto_ingreso = 0;
        var monto_egreso = 0;
        movimientos.map(o => {
            aux = parseFloat(o.monto);
            monto += aux;
            if (aux > 0) {
                monto_ingreso += aux;
            } else {
                monto_egreso += aux;
            }
        });
        var color = STheme.color.lightGray
        if (monto != 0) {
            color = monto >= 0 ? STheme.color.success : STheme.color.danger
        }
        return <SView col={"xs-12"} >
            <SHr />
            <SView col={"xs-12"} row>
                <SView flex >
                    <SText style={this.textStyle}>{tipo_pago.descripcion}</SText>
                </SView>
                <SView width={this.size / 2} style={this.contentTextStyle}>
                    <SText style={this.textStyle}>{movimientos.length}</SText>
                </SView>
                <SView width={this.size} style={this.contentTextStyle}>
                    <SText style={this.textStyle}>{SMath.formatMoney(monto_ingreso)}</SText>
                </SView>
                <SView width={this.size} style={this.contentTextStyle}>
                    <SText style={this.textStyle}>{SMath.formatMoney(monto_egreso)}</SText>
                </SView>
                <SView width={this.size} style={this.contentTextStyle}>
                    <SText style={this.textStyle} color={color}>{SMath.formatMoney(monto)}</SText>
                </SView>
            </SView>
            <SHr />
            <SHr h={1} color={STheme.color.lightBlack} />
        </SView>
    }

    getTotal() {
        var movimientos = Object.values(this.caja_detalles);

        movimientos = movimientos.filter(o => o.estado != 0);
        var monto = 0;
        var aux;
        var monto_ingreso = 0;
        var monto_egreso = 0;
        movimientos.map(o => {
            aux = parseFloat(o.monto);
            monto += aux;
            if (aux > 0) {
                monto_ingreso += aux;
            } else {
                monto_egreso += aux;
            }
        });
        var color = STheme.color.lightGray
        if (monto != 0) {
            color = monto >= 0 ? STheme.color.success : STheme.color.danger
        }
        var cantidad = movimientos.length;
        return <SView col={"xs-12"} row style={{
            paddingTop: 8,
            paddingBottom: 8,
            backgroundColor: STheme.color.card,
        }}>
            <SView flex >
                <SText style={this.textStyle} color={STheme.color.lightGray} bold>{"Total"}</SText>
            </SView>
            <SView width={this.size / 2} style={this.contentTextStyle}><SText style={this.textStyle} color={STheme.color.lightGray} bold>{cantidad}</SText></SView>
            <SView width={this.size} style={this.contentTextStyle}><SText style={this.textStyle} color={STheme.color.lightGray} bold>{SMath.formatMoney(monto_ingreso)}</SText></SView>
            <SView width={this.size} style={this.contentTextStyle}><SText style={this.textStyle} color={STheme.color.lightGray} bold>{SMath.formatMoney(monto_egreso)}</SText></SView>
            <SView width={this.size} style={this.contentTextStyle}><SText style={this.textStyle} color={STheme.color.lightGray} bold>{SMath.formatMoney(monto)}</SText></SView>
        </SView>
    }
    render() {
        if (!this.props.key_caja) return null;
        if (!this.loadData()) return null;
        return (<SView col={"xs-12"} center >
            <SView col={"xs-12"} row>
                <SView flex >
                    <SText style={this.textStyle} color={STheme.color.lightGray}>{"Descripcion"}</SText>
                </SView>
                <SView width={this.size / 2} style={this.contentTextStyle}><SText style={this.textStyle} color={STheme.color.lightGray}>#</SText></SView>
                <SView width={this.size} style={this.contentTextStyle}><SText style={this.textStyle} color={STheme.color.lightGray}>Ingresos</SText></SView>
                <SView width={this.size} style={this.contentTextStyle}><SText style={this.textStyle} color={STheme.color.lightGray}>Egresos</SText></SView>
                <SView width={this.size} style={this.contentTextStyle}><SText style={this.textStyle} color={STheme.color.lightGray}>Total</SText></SView>
            </SView>
            <SHr h={2} color={STheme.color.lightBlack} />
            {/* <SText>{'Arqueo de caja'}</SText> */}
            <SList
                data={this.tipo_pago}
                render={this.renderTipoPago.bind(this)}
            />
            {this.getTotal()}
            <SHr h={2} color={STheme.color.lightBlack} />
        </SView>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(CajaArqueo);