import React, { Component } from 'react';
import { SButtom, SHr, SIcon, SImage, SLoad, SMath, SNavigation, SPage, SPopup, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';

export default class Totales extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cantidad: 1,
        };
    }

    getValue() {
        return this.state;
    }
    setCantidad(val) {
        this.setState({ cantidad: val })
    }
    setTipoEnvio(data) {
        this.setState({ ...data })
    }

    isEnvioGratis(delivery) {
        return delivery <= 0 ? true : false;
    }

    bannerDescuento() {
        if (this.total_descuento_delivery <= 0) return <SView></SView>
        return <SView width={80} height={30} style={{ position: "absolute", alignItems: "flex-start"}}>
            <SImage src={require("../../../Assets/img/Banner_p.png")} />
            <SView style={{
                position: "absolute",
                right: 12,
                top: 8,
                transform: [{ rotate: "-3deg" }]
            }}>
                <SText fontSize={9} color={"#fff"} bold >- {this.total_descuento_delivery} Bs.</SText>
            </SView>
        </SView>
    }


    isDescuento() {
        if(!this.delivery) return <></> 
        if(this.delivery == this.total_descuento_delivery) return <><SText flex style={{color: STheme.color.primary, alignItems: "flex-end"}} fontSize={15}>Envío Gratis</SText> </>
        if (this.state.descuentos && this.state.descuentos.length > 0) {
            return <>
                <SView flex style={{ alignItems: "flex-end" }}>
                    {this.bannerDescuento()}
                </SView>
                <SView col={"xs-4"} style={{ alignItems: "flex-end" }}>
                    <SView height={30} style={{
                        position: "absolute",
                        bottom: 15,
                    }}>
                        <SImage style={{
                            width: 70
                        }} src={require("../../../Assets/img/Banner_p_line.png")} />
                    </SView>
                    <SText fontSize={15} style={{ color: STheme.color.grayTapeke }}> {this.delivery <= 0 ? null : ("Bs. " + SMath.formatMoney(this.delivery))}</SText>
                    <SText fontSize={15}  >{this.delivery_con_descuento ? "Bs. " + SMath.formatMoney(this.delivery_con_descuento) : <SText></SText>}</SText>
                </SView>
            </>
        } else {
            return <>
                <SView col={"xs-8"} style={{ alignItems: "flex-end" }}>
                    <SText fontSize={15}  >{"Bs. " + SMath.formatMoney(this.delivery)}</SText>
                </SView>
            </>
        }

    }

    render() {

        this.total = (this.state.cantidad * (this.props.data?.horario?.precio ?? 0));

        this.total_descuento_delivery = 0;
        this.total_descuento_producto = 0;

        if (this.state.descuentos) {
            this.state.descuentos.map(d => {
                this.total_descuento_delivery += d.total_descuento_delivery;
                this.total_descuento_producto += d.total_descuento_producto;
            })
        }

        this.delivery = this.state.delivery ?? 0;
        this.delivery_con_descuento = this.delivery - this.total_descuento_delivery;

        if (this.delivery_con_descuento < 0) this.delivery_con_descuento = 0;

        return (
            <SView col={"xs-12"} row center style={{ backgroundColor: STheme.color.white }}>
                <SView col={"xs-11"} row center>
                    <SHr height={15} />
                    <SView col={"xs-6"} >
                        <SText style={{ textAlign: "justify" }} fontSize={15}   >{this.state.cantidad} Tapeke</SText>
                    </SView>
                    <SView col={"xs-6"} style={{ alignItems: "flex-end" }}>
                        <SText fontSize={15}   >Bs. {SMath.formatMoney(this.total)}</SText>
                    </SView>
                    <SHr height={10} />

                    <SView col={"xs-12"} row>
                        <SView col={"xs-4"} >
                            <SText style={{ textAlign: "justify" }} fontSize={15}   >Envío:</SText>
                        </SView>

                        {this.isDescuento()}
                    </SView>

                    <SView col={"xs-12"} style={{ borderBottomWidth: 1, borderColor: STheme.color.lightGray }}></SView>
                    <SHr height={10} />
                    <SView col={"xs-6"} >
                        <SText style={{ textAlign: "justify", fontWeight: "bold" }} fontSize={15}   >Total:</SText>
                    </SView>
                    <SView col={"xs-6"} style={{ alignItems: "flex-end" }}>
                        <SText fontSize={15} style={{ fontWeight: "bold" }} >Bs. {SMath.formatMoney(this.total + (this.delivery_con_descuento ?? 0))}</SText>
                    </SView>
                    <SHr height={15} />
                </SView>
            </SView>
        );
    }
}
