import React from "react";
import { SHr, SImage, SNavigation, SPage, SText, STheme, SView } from "servisofts-component";
import MDL from "../../../MDL";
import SSocket from "servisofts-socket";
import FloatButtom from "../../../Components/FloatButtom";
import SIconApp from "../../../Assets/SIconApp";
import PopupCrearSucursal from "./Components/PopupCrearSucursal";

export default class config2 extends React.Component {

    componentDidMount() {
        this.loadData();
    }
    loadData = async () => {
        MDL.empresa._full = null;
        this.empresa = await MDL.empresa.getFull();
        this.almancenes = await MDL.inventario.getAllAlmacen();
        this.empresa.sucursales.map(e => {
            e.almacenes = this.almancenes.filter(almacen => almacen.key_sucursal == e.key);
        })
        this.forceUpdate();
    }
    render() {
        const empresa = this.empresa
        return <SPage title={"config2"}>
            <SView col={"xs-12"} row center>
                <SHr h={16} />
                <SView row>
                    <SView width={40} height={40} style={{
                        borderRadius: 100,
                        overflow: "hidden",
                        backgroundColor: STheme.color.card,
                    }} center>
                        <SImage src={SSocket.api.empresa + "empresa/" + empresa?.key} />

                    </SView>
                    <SView width={8} />
                    <SView>
                        <SText bold fontSize={20}>{empresa?.razon_social}</SText>
                        <SText fontSize={14} color={STheme.color.lightGray}>NIT: {empresa?.nit}</SText>
                    </SView>
                </SView>
                {/* <SText>{"Sucursales: "}{(this.empresa?.sucursales ?? []).length}</SText> */}
                <SHr h={16} />
                {(this.empresa?.monedas ?? []).map((moneda) => {
                    return <Moneda moneda={moneda} />
                })}
                <SHr />
                {(this.empresa?.sucursales ?? []).map((sucursal) => {
                    return <Sucursal sucursal={sucursal} instance={this} />
                })}
            </SView>
        </SPage>
    }
}

const Sucursal = ({ sucursal, instance }) => {
    return <SView col={"xs-12"} style={{
        maxWidth: 240
    }} key={sucursal.key} padding={4}>
        {/* <SText>{"Sucursales"}</SText> */}
        <SView col={"xs-12"} style={{
            borderWidth: 1,
            overflow: "hidden",
            borderColor: STheme.color.card,
            borderRadius: 4
        }}>
            <SView col={"xs-12"} row style={{
                alignItems: "center",
                padding: 4,
                backgroundColor: STheme.color.card,
            }}>
                <SView width={30} height={30} style={{
                    borderRadius: 4,
                    overflow: "hidden",
                    // borderWidth: 1,
                    // borderColor: STheme.color.card
                    backgroundColor: STheme.color.card
                }}>
                    <SImage src={SSocket.api.empresa + "sucursal/" + sucursal.key} />
                </SView>
                <SView width={8} />
                <SText flex fontSize={16}>{sucursal.descripcion}</SText>
                <SView width={8} />
                <SView width={16} height={16} center onPress={() => {
                    PopupCrearSucursal.open({
                        editObject: sucursal,
                        key_empresa: sucursal.key_empresa,
                        onSuccess: (e) => {
                            instance.componentDidMount();
                        }
                    })
                }} card >
                    <SIconApp name='Edit' fill={STheme.color.lightGray} />
                </SView>
            </SView>
            {/* <SHr /> */}
            <SView col={"xs-12"} row height={100}>
                <SView flex height style={{
                    borderRightWidth: 1,
                    borderColor: STheme.color.card,
                    padding: 2,
                    alignItems: "center",
                }}>
                    <SText fontSize={10} color={STheme.color.lightGray} bold underLine>{"Cajas"}</SText>
                    <SHr />
                    {(sucursal.puntos_venta ?? []).map((punto) => {
                        return <SView col={"xs-12"} row>
                            <SText flex col={"xs-12"} key={punto.key} fontSize={12} onPress={() => {
                                SNavigation.navigate("/empresa/punto_venta/profile", { pk: punto.key, key_sucursal: punto.key_sucursal })
                            }} > - {punto.descripcion}</SText>
                        </SView>
                    })}
                    {/* <SText fontSize={12} col={"xs-12"} color={STheme.color.link} padding={4}>{"+ Nuevo"}</SText> */}
                </SView>
                <SView flex height style={{
                    padding: 2,
                    alignItems: "center",
                }}>
                    <SText fontSize={10} color={STheme.color.lightGray} bold underLine>{"Almacenes"}</SText>
                    <SHr />
                    {(sucursal.almacenes ?? []).map((almacen) => {
                        return <SText col={"xs-12"} key={almacen.key} fontSize={12} onPress={() => {
                            SNavigation.navigate("/inventario/almacen/profile", { pk: almacen.key })
                        }}> - {almacen.descripcion}</SText>
                    })}

                    {/* <SText fontSize={12} col={"xs-12"} color={STheme.color.link}>{"+ Nuevo"}</SText> */}
                </SView>
            </SView>


        </SView>
    </SView >
}
const Moneda = ({ moneda }) => {
    return <SView col={"xs-12"} style={{
        maxWidth: 240
    }} key={moneda.key} padding={4}>
        <SView col={"xs-12"} padding={4} style={{
            borderWidth: 1,
            borderColor: STheme.color.card,
            borderRadius: 4
        }} center>
            <SView col={"xs-12"} row style={{
                alignItems: "center",
                justifyContent: "center"
            }}>
                <SText fontSize={24} bold>{moneda.observacion}</SText>
                <SView width={8} />
                <SText fontSize={20} bold>{moneda.tipo_cambio}</SText>
            </SView>
            <SText color={STheme.color.lightGray} fontSize={12}>{moneda.descripcion}</SText>


        </SView>
    </SView >
}