import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SInput, SLoad, SMath, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SIconApp from '../../../Assets/SIconApp';

type TotalTipoPagoTablaProps = {
    key_punto_venta: string,
    movimientos: any[],
    onSelect?: (item: any) => void
}
export default class TotalTipoPagoTabla extends Component<TotalTipoPagoTablaProps> {

    constructor(props) {
        super(props);
        this.state = {
            ready: false,
        };
    }

    componentDidMount() {
        this.loadData();

    }

    async loadData() {
        this.tipo_pago = await MDL.caja.tipo_pago_getAll()
        const empresa_tipo_pago = await MDL.caja.empresa_tipo_pago_getAll({ key_punto_venta: this.props.key_punto_venta })
        const data = await MDL.empresa.getFull()
        // console.log(data);
        const cuentas = await MDL.contabilidad.getCuentasCache();
        // const suc = data.sucursales.find(suc => suc.puntos_venta.find(pv => pv.key == this.props.key_punto_venta));
        // const pv = suc.puntos_venta.find(pv => pv.key == this.props.key_punto_venta);
        const moneda_base = data.monedas.find(a => a.tipo == "base");
        //"
        this.pvtp = Object.values(empresa_tipo_pago)
        // if (!this.pvtp) return [];
        this.pvtp = this.pvtp.map(item => {
            item.cuenta = cuentas[item.key_cuenta_contable]
            const moneda = data.monedas.find(a => a.key == item?.cuenta?.key_moneda);

            item.moneda = moneda ?? moneda_base;
            item.tipo_pago = this.tipo_pago[item.key_tipo_pago];
            return item;
        });


        this.pvtp.sort((a, b) => {
            return a.tipo_pago?.orden - b.tipo_pago?.orden
        })
        this.setState({ ready: true });
    }

    getColor(total) {
        let color = STheme.color.lightGray;
        if (total > 0) {
            color = STheme.color.success;
        } else if (total < 0) {
            color = STheme.color.danger;
        }
        return color;
    }
    renderItemTipoPago(item) {
        const total = this.props.movimientos.filter(mov => mov.key_empresa_tipo_pago == item.key).reduce((sum, mov) => sum + mov.monto, 0);
        const totalIngresos = this.props.movimientos.filter(mov => mov.key_empresa_tipo_pago == item.key && mov.monto > 0).reduce((sum, mov) => sum + mov.monto, 0);
        const totalEgresos = this.props.movimientos.filter(mov => mov.key_empresa_tipo_pago == item.key && mov.monto < 0).reduce((sum, mov) => sum + mov.monto, 0);

        return <SView col={"xs-12"} row center style={{
            borderWidth: 0.2,
            borderColor: STheme.color.card
        }}>
            <SView col={"xs-4"} style={{
                padding: 4,
                // maxWidth: 180,

            }} >
                <SView style={{
                    width: "100%",
                    height: 40,
                    // height: "100%",
                    // borderWidth: 1,
                    // borderColor: STheme.color.card,
                    // backgroundColor: this._select[item.key] ? STheme.color.success + "44" : "transparent",
                    borderRadius: 8,
                    padding: 4,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: STheme.color.background,

                }} >

                    <SView row col={"xs-12"} style={{
                        alignItems: "center",
                        padding: 4,
                    }}>
                        <View style={{
                            width: 22,
                            height: 22,
                            // borderWidth: 1,
                            // borderColor: STheme.color.card
                        }}>
                            <SIconApp name={item?.tipo_pago?.icon || "Ajustes"} />
                        </View>
                        <SView width={4} />
                        <SView flex>
                            <SText flex key={item.key_tipo_pago} numberOfLines={1} fontSize={12} >{item.descripcion}</SText>
                            <SView row>
                                <SText key={item.key_tipo_pago} numberOfLines={1} fontSize={10} color={STheme.color.lightGray} >{item.tipo_pago ? item.tipo_pago.descripcion : item.key_tipo_pago}</SText>
                                <SView width={5} />
                                <SText numberOfLines={1} fontSize={10} color={STheme.color.lightGray} >{item.moneda?.descripcion}</SText>
                            </SView>
                        </SView>
                    </SView>
                </SView>
            </SView>
            <SView col={"xs-2"} center >
                <SText bold color={this.getColor(total)} fontSize={18}>{item.moneda?.observacion}</SText>
            </SView>
            <SView col={"xs-2"} center >
                <SText bold color={this.getColor(total)} fontSize={18}>{SMath.formatMoney(total)}</SText>
            </SView>
            <SView col={"xs-2"} row center style={{
                borderColor: STheme.color.card
            }}>
                <SView row center style={{
                    borderColor: STheme.color.card
                }} >
                    <SText numberOfLines={1} color={this.getColor(totalIngresos)} fontSize={10}>{item.moneda?.observacion} {SMath.formatMoney(totalIngresos, 1)}</SText>
                    <SView width={5} />
                    <SIconApp name='Ingreso' width={8} height={8} />
                </SView>

            </SView>
            <SView col={"xs-2"} row center style={{
                borderColor: STheme.color.card
            }}>
                <SView row center >
                    <SText numberOfLines={1} color={this.getColor(totalEgresos)} fontSize={10}>{item.moneda?.observacion} {SMath.formatMoney(totalEgresos, 1)}</SText>
                    <SView width={5} />
                    <SIconApp name='Egreso' width={8} height={8} />
                </SView>
            </SView>


        </SView>
    }

    render() {
        return <SView col={"xs-12"} padding={2}>
            {this.state.ready &&
                <SView row style={{
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <SView row center col={"xs-12"} padding={10} style={{
                        borderTopWidth: 1,
                        borderRightWidth: 1,
                        borderLeftWidth: 1,
                        borderColor: STheme.color.card,
                        backgroundColor: STheme.color.card
                    }}>
                        <SView col={"xs-4"}>
                            <SText>Cuenta</SText>
                        </SView>
                        <SView col={"xs-2"} center>
                            <SText>Moneda</SText>
                        </SView>
                        <SView col={"xs-2"} center>
                            <SText>Saldo</SText>
                        </SView>
                        <SView col={"xs-2"} center>
                            <SText>Entradas</SText>
                        </SView>
                        <SView col={"xs-2"} center>
                            <SText>Salidas</SText>
                        </SView>
                    </SView>
                    {this.pvtp.map((item, index) => this.renderItemTipoPago(item))}
                </SView>
            }
            {!this.state.ready && <SView height={140}>
                <SLoad />
            </SView>}
        </SView>
    }
}
