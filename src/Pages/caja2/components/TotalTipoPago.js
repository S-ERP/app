import React, { Component } from 'react';
import { View } from 'react-native';
import { SLoad, SMath, SNotification, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SIconApp from '../../../Assets/SIconApp';
import Transferencia from '../Acciones/Transferencia';

export default class TotalTipoPago extends Component {

    constructor(props) {
        super(props);
        this.state = { ready: false };
        this.pvtp = [];
        this.tipo_pago = {};
    }

    componentDidMount() {
        this._mounted = true;
        this.loadData();
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    async loadData() {
        try {
            if (!this.props.key_punto_venta) {
                if (this._mounted) this.setState({ ready: true });
                return;
            }
            this.tipo_pago = await MDL.caja.tipo_pago_getAll();
            const empresa_tipo_pago = await MDL.caja.empresa_tipo_pago_getAll({ key_punto_venta: this.props.key_punto_venta });
            const data = await MDL.empresa.getFull();
            const cuentas = await MDL.contabilidad.getCuentasCache();

            const monedas = data?.monedas ?? [];
            const moneda_base = monedas.find(a => a.tipo === "base");

            this.pvtp = Object.values(empresa_tipo_pago ?? {}).map(item => {
                item.cuenta = cuentas?.[item.key_cuenta_contable];
                const moneda = monedas.find(a => a.key === item?.cuenta?.key_moneda);
                item.moneda = moneda ?? moneda_base;
                item.tipo_pago = this.tipo_pago?.[item.key_tipo_pago];
                return item;
            });

            this.pvtp.sort((a, b) => {
                const ordenA = a.tipo_pago?.orden ?? 9999;
                const ordenB = b.tipo_pago?.orden ?? 9999;
                return ordenA - ordenB;
            });

            if (this._mounted) this.setState({ ready: true });
        } catch (e) {
            if (this._mounted) this.setState({ ready: true });
            SNotification.send({
                key: "total_tipo_pago_load",
                title: "Error al cargar cuentas",
                body: e?.error ?? JSON.stringify(e),
                color: STheme.color.danger,
                time: 5000,
            });
        }
    }

    getColor(total) {
        if (total > 0) return STheme.color.success;
        if (total < 0) return STheme.color.danger;
        return STheme.color.lightGray;
    }

    renderItemTipoPago(item) {
        const movimientos = this.props.movimientos ?? [];
        const propios = movimientos.filter(mov => mov.key_empresa_tipo_pago === item.key);
        const total = propios.reduce((sum, mov) => sum + (mov.monto || 0), 0);
        const totalIngresos = propios.filter(mov => mov.monto > 0).reduce((sum, mov) => sum + (mov.monto || 0), 0);
        const totalEgresos = propios.filter(mov => mov.monto < 0).reduce((sum, mov) => sum + (mov.monto || 0), 0);

        return (
            <SView key={item.key} style={{ padding: 6, maxWidth: 180 }} col={"xs-6 sm-4"}>
                <SView style={{
                    width: "100%",
                    height: 130,
                    borderWidth: 1,
                    borderColor: STheme.color.card,
                    borderRadius: 8,
                    padding: 4,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: STheme.color.background,
                }}>
                    <SView row col={"xs-12"} style={{ alignItems: "center", padding: 4 }}>
                        <View style={{ width: 22, height: 22 }}>
                            <SIconApp name={item?.tipo_pago?.icon || "Ajustes"} />
                        </View>
                        <SView width={4} />
                        <SView flex>
                            <SText flex numberOfLines={1} fontSize={12}>{item.descripcion}</SText>
                            <SView row>
                                <SText numberOfLines={1} fontSize={10} color={STheme.color.lightGray}>
                                    {item.tipo_pago ? item.tipo_pago.descripcion : item.key_tipo_pago}
                                </SText>
                                <SView width={5} />
                                <SText numberOfLines={1} fontSize={10} color={STheme.color.lightGray}>{item.moneda?.descripcion}</SText>
                            </SView>
                        </SView>
                    </SView>
                    <SView flex col={"xs-12"} center>
                        <SText bold color={this.getColor(total)} fontSize={18}>
                            {item.moneda?.observacion} {SMath.formatMoney(total)}
                        </SText>
                    </SView>
                    <SView flex col={"xs-12"} row style={{ borderTopWidth: 1, borderColor: STheme.color.card }}>
                        <SView flex center style={{ borderRightWidth: 1, borderColor: STheme.color.card }}
                            onPress={() => Transferencia.open({ origen_inicial: item, monto_origen_inicial: totalIngresos })}>
                            <SIconApp name='Ingreso' width={8} height={8} />
                            <SText numberOfLines={1} color={this.getColor(totalIngresos)} fontSize={10}>
                                {item.moneda?.observacion} {SMath.formatMoney(totalIngresos, 1)}
                            </SText>
                        </SView>
                        <SView flex center
                            onPress={() => Transferencia.open({ destino_inicial: item, monto_destino_inicial: Math.abs(totalEgresos) })}>
                            <SIconApp name='Egreso' width={8} height={8} />
                            <SText numberOfLines={1} color={this.getColor(totalEgresos)} fontSize={10}>
                                {item.moneda?.observacion} {SMath.formatMoney(totalEgresos, 1)}
                            </SText>
                        </SView>
                    </SView>
                </SView>
            </SView>
        );
    }

    render() {
        return (
            <SView flex col={"xs-12"} padding={2}>
                {this.state.ready
                    ? <SView row style={{ justifyContent: "center", alignItems: "center" }}>
                        {this.pvtp.map(item => this.renderItemTipoPago(item))}
                    </SView>
                    : <SView height={140}><SLoad /></SView>
                }
            </SView>
        );
    }
}
