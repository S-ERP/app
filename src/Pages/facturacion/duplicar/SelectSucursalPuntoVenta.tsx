import React from "react";
import { SInput, SNotification, STheme, SView } from "servisofts-component";
import Label from "./Label";
import { Factura } from "../../../MDL/factura/type";
import PopupSelectSucursalPuntoVenta from "./PopupSelectSucursalPuntoVenta";
import MDL from "../../../MDL";
import { Sucursal } from "../../../MDL/empresa/type";



type SelectSucursalPuntoVentaProps = {
    factura: Factura,
    onPuntoVentaChange?: () => void
}
const customStyle: any = "factura";
export default class SelectSucursalPuntoVenta extends React.Component<SelectSucursalPuntoVentaProps> {

    state = {
        sucursal: null
    } as any

    error(error: string) {
        SNotification.send({
            title: "Error al cargar la sucursal",
            body: error,
            color: STheme.color.danger,
            time: 5000
        })
    }
    handlePress() {
        PopupSelectSucursalPuntoVenta.open({
            onSelect: (sucursal, puntoVenta) => {
                this.setPuntoVenta(sucursal, puntoVenta)
            }
        });
    }

    setPuntoVenta(sucursal: Sucursal, puntoVenta: any) {
        if (!sucursal.codigo_facturacion) {
            this.error("La sucursal no tiene código de facturación")
            return;
        }
        if (!puntoVenta.codigo_facturacion) {
            this.error("El punto de venta no tiene código de facturación")
            return;
        }

        if (!sucursal.direccion) {
            this.error("La sucursal no tiene dirección")
            return;
        }
        if (!sucursal.telefono) {
            this.error("La sucursal no tiene teléfono")
            return;
        }

        this.props.factura.data.codigoSucursal = sucursal.codigo_facturacion;
        this.props.factura.data.codigoPuntoVenta = puntoVenta.codigo_facturacion;
        this.props.factura.data.direccion = sucursal.direccion;
        this.props.factura.data.telefono = sucursal.telefono;
        this.props.factura.data.municipio = sucursal.municipio ?? ""

        this.state.sucursal = sucursal;
        this.setState({ ...this.state })
        if (this.props.onPuntoVentaChange) this.props.onPuntoVentaChange();

    }


    componentDidMount(): void {
        MDL.empresa.getAllSucursales().then((sucs) => {

            const suc = sucs.find((e: any) => e.codigo_facturacion == this.props.factura.data.codigoSucursal);
            if (!suc?.punto_venta) {
                this.error("La sucursal no tiene punto de venta")
                return;
            }
            const pv = suc.punto_venta.find((e: any) => e.codigo_facturacion == this.props.factura.data.codigoPuntoVenta);
            if (!pv) {
                this.error("La sucursal no tiene punto de venta")
                return;
            }
            this.setPuntoVenta(suc, pv);
        }).catch(e => {
            SNotification.send({
                title: "Error al cargar la sucursal",
                body: JSON.stringify(e),
                color: STheme.color.danger,
                time: 5000
            })
        })
    }

    render() {
        const {
            razonSocialEmisor,
            direccion,
            telefono,
            municipio,
            codigoPuntoVenta } = this.props.factura?.data

        return <SView center onPress={this.handlePress.bind(this)}>
            <Label bold>{razonSocialEmisor}</Label>
            <Label flex bold>{this.state?.sucursal?.descripcion}</Label>
            <Label>{"No. Punto de Venta " + codigoPuntoVenta}</Label>
            <SView col={"xs-12"} onPress={(e: any) => e?.stopPropagation?.()}>
                <SInput
                    customStyle={customStyle}
                    style={{ textAlign: "center" }}
                    defaultValue={direccion}
                    onChangeText={e => {
                        this.props.factura.data.direccion = e
                    }}
                />
            </SView>
            <SView col={"xs-12"} onPress={(e: any) => e?.stopPropagation?.()}>
                <SInput
                    customStyle={customStyle}
                    style={{ textAlign: "center" }}
                    defaultValue={telefono}
                    onChangeText={e => {
                        this.props.factura.data.telefono = e
                    }}
                />
            </SView>
            <Label>{municipio}</Label>
        </SView>
    }
}