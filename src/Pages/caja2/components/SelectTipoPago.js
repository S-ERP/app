import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SPopup, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SIconApp from '../../../Assets/SIconApp';

type SelectTipoPagoProps = {
    key_punto_venta: string,
    solo_para_caja: boolean,
    onSelect?: (item: any) => void
}
export default class SelectTipoPago extends Component<SelectTipoPagoProps> {
    static openPopup(props: SelectTipoPagoProps) {
        SPopup.open({
            key: "SelectTipoPago",
            type: "1",
            content: <SView style={{
                maxWidth: 500,
                width: "100%",
                // height: 500,
                maxHeight: "100%",
                backgroundColor: STheme.color.background,
                borderRadius: 8,
                cursor: "default",
                userSelect: "text",

            }} withoutFeedback>
                <SelectTipoPago {...props} />
            </SView>
        })
    }
    static closePopup(){
        SPopup.close("SelectTipoPago")
    }
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
        if (this.props.solo_para_caja) {
            this.pvtp = this.pvtp.filter(a => a.tipo_pago?.pasa_por_caja);
        }
        this.pvtp.sort((a, b) => {
            return a.tipo_pago?.orden - b.tipo_pago?.orden
        })
        this.setState({ ready: true });
    }

    renderItemTipoPago(item) {
        return <SView style={{
            padding: 4,
            maxWidth: 130,
        }} col={"xs-6 sm-4"} colSquare>
            <SView style={{
                width: "100%",
                height: "100%",
                borderWidth: 1,
                borderColor: STheme.color.card,
                borderRadius: 8,
                padding: 8,
                justifyContent: "center",
                alignItems: "center"
            }} onPress={() => {
                if (this.props.onSelect) {
                    this.props.onSelect(item);
                    SelectTipoPago.closePopup();
                }
            }}>
                <View style={{
                    width: "70%",
                    height: "70%",
                    // borderWidth: 1,
                    // borderColor: STheme.color.card
                }}>
                    <SIconApp name={item?.tipo_pago?.icon || "Ajustes"} />
                </View>
                <SView flex center>
                    <SText key={item.key_tipo_pago} col={"xs-12"} style={{
                        textAlign: "center",
                    }}>{item.tipo_pago ? item.tipo_pago.descripcion : item.key_tipo_pago}</SText>
                </SView>
            </SView>
        </SView>
    }

    render() {
        return <SView flex col={"xs-12"}>
            {this.state.ready &&
                <SView row padding={8} style={{
                    justifyContent: "space-around",
                    alignItems: "center"
                }}>
                    {this.pvtp.map((item, index) => this.renderItemTipoPago(item))}
                </SView>
            }
            {/* <SText>{JSON.stringify(this.pvtp)}</SText> */}
        </SView>
    }
}
