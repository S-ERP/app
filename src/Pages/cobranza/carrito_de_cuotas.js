import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SDate, SHr, SIcon, SList, SLoad, SMath, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import Container from '../../Components/Container';
import Model from '../../Model';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            select: {}
        };
        this.onSelect = SNavigation.getParam("onSelect");
        this.key_cliente = SNavigation.getParam("key_cliente");
        this.key_proveedor = SNavigation.getParam("key_proveedor");
    }

    componentDidMount() {
        if (this.key_cliente) {
            Model.cuota.Action.getAllByK({ key_cliente: this.key_cliente }).then(e => {
                this.setState({ data: e.data })
            })
        } else if (this.key_proveedor) {
            Model.cuota.Action.getAllByK({ key_proveedor: this.key_proveedor }).then(e => {
                this.setState({ data: e.data })
            })
        }

    }

    render_data() {
        var cuotas = this.state.data
        if (!cuotas) return <SLoad />
        // var cuotas_aux = {};
        // Object.values(cuotas).map(cuota => {
        //     if (cuota.tipo === "compra") {
        //         if (cuota.proveedor.nit == this.props.route.params.nit) {
        //             cuotas_aux[cuota.key] = cuota;
        //         }
        //     } else {
        //         if (cuota.cliente.nit == this.props.route.params.nit) {
        //             cuotas_aux[cuota.key] = cuota;
        //         }
        //     }
        // });

        // cuotas = cuotas_aux;
        return <SList
            order={[{ key: "fecha", type: "date", order: "asc" }]}
            data={cuotas}
            buscador
            space={0}
            limit={10}
            filter={a => a.estado != "2"}
            render={(obj) => {
                var compra_venta = Model.compra_venta.Action.getByKey(obj.key_compra_venta);
                var isSelect = this.state.select[obj.key];
                if (!compra_venta) return <SLoad />
                var isRetrasada = new SDate(obj.fecha).isBefore(new SDate())
                return <SView col={"xs-12"} style={{
                    padding: 8, opacity: !isSelect ? 0.5 : 1
                }} onPress={() => {
                    if (!this.state.select[obj.key]) {
                        this.state.select[obj.key] = obj;
                    } else {
                        delete this.state.select[obj.key];
                    }
                    this.setState({ ...this.state })
                    // if (this.onSelect) {
                    //     SNavigation.goBack();
                    //     this.onSelect(obj);
                    //     return;
                    // }
                }}>
                    <SView col={"xs-12"} row>
                        <SView flex>
                            <SText flex color={STheme.color.lightGray} fontSize={14}>{compra_venta.descripcion}</SText>
                            <SText flex color={STheme.color.lightGray} fontSize={10}>{compra_venta.tipo_pago}</SText>
                            <SHr />
                            <SText bold flex fontSize={14}># {obj.codigo} - {obj.descripcion}</SText>
                            <SText flex fontSize={10} color={STheme.color.lightGray} >{new SDate(obj.fecha, "yyyy-MM-dd").toString("dd de MONTH, yyyy")}</SText>

                        </SView>
                        <SView width={8} />
                        <SView>
                            <SText style={{ alignItems: 'end', textAlign: "end" }} fontSize={14}>{SMath.formatMoney(obj.monto)}</SText>
                            {!obj.amortizaciones ? "" : <SText style={{ alignItems: 'end', textAlign: "end" }} color={STheme.color.danger} fontSize={12}>-{SMath.formatMoney(obj.amortizaciones ?? 0)}</SText>}
                            <SText color={STheme.color.danger} fontSize={10}>{isRetrasada ? "Pendiente de pago" : ""}</SText>
                        </SView>
                        <SHr />
                        {/* <SView col={"xs-12"}>
                            <SText flex fontSize={10} color={STheme.color.lightGray} >Capital: {capital ?? 0}</SText>
                            <SText flex fontSize={10} color={STheme.color.lightGray} >Interes: {interes ?? 0}</SText>
                            <SText flex fontSize={10} color={STheme.color.lightGray} >Saldo capital: {saldo_capital ?? 0}</SText>
                            <SText flex fontSize={10} color={STheme.color.lightGray} >Pagos acumulados: {pagos_acumulados ?? 0}</SText>
                        </SView> */}
                        {/* <SHr /> */}
                        <SHr height={1} color={STheme.color.card} />
                    </SView>
                    {/* <SText>{obj.codigo}</SText>
                    <SText>{obj.descripcion}</SText>
                    <SText>{obj.tipo}</SText>
                    <SText>{obj.monto}</SText>
                    <SText>{obj.amortizaciones}</SText>
                    <SText>{obj.fecha}</SText>
                    <SText>{obj.key_compra_venta}</SText> */}
                </SView>
            }}
        />

    }
    renderFooter() {
        let total = 0;
        Object.values(this.state.select).map(obj => {
            total += obj.monto;
        })
        return <SView col={"xs-12"} height={50} center card onPress={() => {
            if (this.onSelect) {
                SNavigation.goBack();
                this.onSelect(this.state.select);
                return;
            }
        }}>
            <Container>
                <SView col={"xs-12"} row padding={8}>
                    <SView flex><SText>Total:</SText></SView>
                    <SView><SText>{SMath.formatMoney(total)}</SText></SView>
                </SView>
                <SText fontSize={10} color={STheme.color.lightGray}>{"Click aqui para continuar"}</SText>
                <SHr />
            </Container>
        </SView>
    }
    render() {
        return (
            <SPage title={'Carrito de cuotas'} footer={this.renderFooter()}>
                <SView col={"xs-12"} center>
                    <SHr />
                    <SView col={"xs-11 sm-10 md-8 lg-6 xl-4"} center>
                        <SHr />
                        {this.render_data()}
                    </SView>
                </SView>
                <SHr height={150} />
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);