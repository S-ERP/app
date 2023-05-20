import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SDate, SHr, SList, SLoad, SMath, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import Model from '../../Model';
import PlanDePagos from './profile/Components/PlanPagos';
import Container from '../../Components/Container';

class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.pk = SNavigation.getParam("pk");
    }

    render() {
        let compra_venta = Model.compra_venta.Action.getByKey(this.pk);
        if (!compra_venta) return <SLoad />
        var cuotas = Model.cuota.Action.getAllByKeyCompraVenta({ key_compra_venta: this.pk })
        return (
            <SPage title={'Editar plan de pagos'}>
                <Container>
                    <SView col={"xs-12"} padding={8} card>
                        <SList data={cuotas} buscador
                            order={[{ key: "codigo", type: "number", order: "asc" }]}
                            space={4}
                            render={(obj) => {
                                let {
                                    codigo,
                                    descripcion,
                                    monto,
                                    fecha,
                                    interes,
                                    capital,
                                    saldo_capital,
                                    pagos_acumulados
                                } = obj;
                                return <SView padding={4}>
                                    <SView col={"xs-12"} row>
                                        <SView flex>
                                            <SText bold flex fontSize={14}># {codigo} - {descripcion}</SText>
                                            <SText flex fontSize={10} color={STheme.color.lightGray} >{new SDate(fecha, "yyyy-MM-dd").toString("dd de MONTH, yyyy")}</SText>
                                        </SView>
                                        <SView width={8} />
                                        <SText style={{ alignItems: 'end', textAlign: "end" }} fontSize={14}>{SMath.formatMoney(monto)}</SText>
                                        <SHr />
                                        <SView col={"xs-12"}>
                                            <SText flex fontSize={10} color={STheme.color.lightGray} >Capital: {SMath.formatMoney(capital ?? 0)}</SText>
                                            <SText flex fontSize={10} color={STheme.color.lightGray} >Interes: {SMath.formatMoney(interes ?? 0)}</SText>
                                            <SText flex fontSize={10} color={STheme.color.lightGray} >Saldo capital: {SMath.formatMoney(saldo_capital ?? 0)}</SText>
                                            <SText flex fontSize={10} color={STheme.color.lightGray} >Pagos acumulados: {SMath.formatMoney(pagos_acumulados ?? 0)}</SText>
                                        </SView>
                                        <SHr />
                                        <SHr height={1} color={STheme.color.card} />
                                    </SView>
                                </SView>
                            }} />
                    </SView>
                </Container>
                {/* <SText>{JSON.stringify(cuotas)}</SText> */}
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);