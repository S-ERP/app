import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SInput, SMath, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SIconApp from '../../../Assets/SIconApp';

type TotalTipoPagoProps = {
    key_punto_venta: string,
    movimientos: any[],
    onSelect?: (item: any) => void
}
export default class TotalTipoPago extends Component<TotalTipoPagoProps> {

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
        this.tipo_pago = await MDL.empresa.getTipoPago()
        const data = await MDL.empresa.getFull()
        console.log(data);
        const suc = data.sucursales.find(suc => suc.puntos_venta.find(pv => pv.key == this.props.key_punto_venta));
        const pv = suc.puntos_venta.find(pv => pv.key == this.props.key_punto_venta);
        this.pvtp = pv.punto_venta_tipo_pago;
        this.pvtp = this.pvtp.map(item => {
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
        const total = this.props.movimientos.filter(mov => mov.key_tipo_pago == item.key_tipo_pago).reduce((sum, mov) => sum + mov.monto, 0);
        const totalIngresos = this.props.movimientos.filter(mov => mov.key_tipo_pago == item.key_tipo_pago && mov.monto > 0).reduce((sum, mov) => sum + mov.monto, 0);
        const totalEgresos = this.props.movimientos.filter(mov => mov.key_tipo_pago == item.key_tipo_pago && mov.monto < 0).reduce((sum, mov) => sum + mov.monto, 0);

        return <SView style={{
            padding: 2,
            maxWidth: 140,
        }} col={"xs-6 sm-4"} colSquare>
            <SView style={{
                width: "100%",
                height: "100%",
                borderWidth: 1,
                borderColor: STheme.color.card,
                // backgroundColor: this._select[item.key] ? STheme.color.success + "44" : "transparent",
                borderRadius: 8,
                padding: 4,
                justifyContent: "center",
                alignItems: "center"
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
                    <SText flex key={item.key_tipo_pago} numberOfLines={1} fontSize={12} >{item.tipo_pago ? item.tipo_pago.descripcion : item.key_tipo_pago}</SText>
                </SView>
                <SView flex col={"xs-12"} center >
                    <SText bold color={this.getColor(total)} fontSize={20}>{SMath.formatMoney(total)}</SText>
                </SView>
                <SView flex col={"xs-12"} row style={{
                    borderTopWidth: 1,
                    borderColor: STheme.color.card
                }}>
                    <SView flex center style={{
                        borderRightWidth: 1,
                        borderColor: STheme.color.card
                    }} >
                        <SIconApp name='Ingreso' width={8} height={8}/>
                        {/* <View style={{ width: 2 }} /> */}
                        <SText numberOfLines={1} color={this.getColor(totalIngresos)} fontSize={10}>{SMath.formatMoney(totalIngresos, 1)}</SText>
                    </SView>
                    <SView flex center >
                        <SIconApp name='Egreso' width={8} height={8} />
                        {/* <View style={{ width: 2 }} /> */}
                        <SText numberOfLines={1} color={this.getColor(totalEgresos)} fontSize={10}>{SMath.formatMoney(totalEgresos, 1)}</SText>
                    </SView>
                </SView>
            </SView>
        </SView>
    }

    render() {
        return <SView flex col={"xs-12"} padding={2}>
            {this.state.ready &&
                <SView row style={{
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    {this.pvtp.map((item, index) => this.renderItemTipoPago(item))}
                </SView>
            }
        </SView>
    }
}
