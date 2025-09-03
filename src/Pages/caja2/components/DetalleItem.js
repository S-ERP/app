import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SDate, SHr, SIcon, SImage, SMath, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import { Container } from '../../../Components';
import SelectTipoPago from './SelectTipoPago';
import SIconApp from '../../../Assets/SIconApp';
import TotalTipoPago from './TotalTipoPago';


export default class DetalleItem extends Component<{ item: any, index: number, tipo_pago: any, empresa: any }> {


    render() {
        const { item, index, empresa } = this.props;
        let color = STheme.color.success;
        if (item.monto < 0) {
            color = STheme.color.danger;
        }
        const moneda = empresa?.monedas?.find(e => e.key === item.key_moneda);
        return <SView key={index} row padding={4} style={{
            borderBottomWidth: 1,
            borderColor: STheme.color.card
        }}>

            <SView flex>
                <SView row style={{
                    alignItems: "center"
                }}>
                    <SView style={{
                        width: 20,
                        height: 20,
                        borderRadius: 100,
                        backgroundColor: STheme.color.card,
                    }} center>
                        <SText color={STheme.color.lightGray} fontSize={10} >{index}</SText>
                    </SView>
                    <SView width={4} />
                    <SText >{item.descripcion}</SText>

                </SView>
                <SHr h={4} />
                <SView row style={{
                    alignItems: "center"
                }}>
                    <View style={{
                        // backgroundColor: STheme.color.card,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        padding: 2,
                        borderRadius: 4
                    }}>
                        <SText fontSize={10} color={STheme.color.lightGray}>{new SDate(item.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM-dd hh:mm")}</SText>
                    </View>
                    <SView width={8} />
                    <View style={{
                        backgroundColor: MDL.caja.detalle_types[item.tipo]?.color + "66" || STheme.color.card,
                        borderWidth: 1,
                        borderColor: MDL.caja.detalle_types[item.tipo]?.color || STheme.color.card,
                        padding: 2,
                        borderRadius: 4
                    }}>
                        <SText fontSize={10}   >{MDL.caja.detalle_types[item.tipo]?.label || item.tipo}</SText>
                    </View>
                    <SView width={8} />
                    {item.codigo_comprobante && <><View style={{
                        // backgroundColor: STheme.color.card,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        padding: 2,
                        borderRadius: 4
                    }}>
                        <SText color={STheme.color.link} underLine fontSize={10} onPress={() => {
                            SNavigation.navigate("/contabilidad/asiento_contable/profile", { pk: item.key_comprobante })
                        }}>{item.codigo_comprobante}</SText>
                    </View>
                        <SView width={8} />
                    </>}
                    {item?.data?.key_compra_venta && <><View style={{
                        // backgroundColor: STheme.color.card,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        padding: 2,
                        borderRadius: 4
                    }}>
                        <SText fontSize={10} onPress={() => {
                            SNavigation.navigate("/compra/profile", { pk: item?.data?.key_compra_venta })
                        }}>{"Compra"}</SText>
                    </View>
                        <SView width={8} />
                    </>}
                    <View style={{
                        // backgroundColor: STheme.color.card,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        padding: 2,
                        borderRadius: 4,
                        flexDirection: "row",
                        alignItems: "center"
                    }}>
                        <SView width={16} height={16}>
                            {this?.props?.tipo_pago?.[item.key_tipo_pago] && <SIconApp name={this?.props?.tipo_pago?.[item.key_tipo_pago].icon} />}
                        </SView>
                        <SView width={4} />
                        <SText color={STheme.color.lightGray} fontSize={10}>{this?.props?.tipo_pago?.[item.key_tipo_pago]?.descripcion || item.key_tipo_pago}</SText>
                    </View>
                    <SView width={8} />
                    {moneda && <View style={{
                        // backgroundColor: STheme.color.card,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        padding: 2,
                        borderRadius: 4,
                        flexDirection: "row",
                        alignItems: "center"
                    }}>
                        <SText color={STheme.color.lightGray} fontSize={10}>{moneda?.descripcion}</SText>
                        <SView width={4} />
                        <SText color={STheme.color.lightGray} fontSize={10}>{item.tipo_cambio}</SText>
                    </View>
                    }

                </SView>
            </SView>
            <SView style={{
                alignItems: "flex-end"
            }}>
                <SView row center>
                    <SText fontSize={18} bold color={color}>{SMath.formatMoney(item.monto)}</SText>
                    {/* <SView width={4} /> */}

                </SView>

                {/* <SText color={STheme.color.lightGray} fontSize={10}>{this?.state?.tipo_pago?.[item.key_tipo_pago]?.descripcion || item.key_tipo_pago}</SText> */}
                {/* <SView width={4} />
                    <SView width={16} height={16}>
                        {this?.state?.tipo_pago?.[item.key_tipo_pago] && <SIconApp name={this?.state?.tipo_pago?.[item.key_tipo_pago].icon} />}
                    </SView> */}

            </SView>
            <SHr h={4} />

        </SView>

    }

}