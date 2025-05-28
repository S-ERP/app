import React, { Component } from 'react';
import { View, Text, TextStyle } from 'react-native';
import { SHr, SInput, SLoad, SPage, SText, STextProps, SView } from 'servisofts-component';
import MDL from '../../MDL';

const customStyle: any = "factura";
const Label = (props: { style?: TextStyle, children?: any, } & STextProps) => {
    return <SText
        fontSize={12}
        {...props}
        style={{
            fontFamily: "Roboto",
            // @ts-ignore
            ...props.style
        }} >
        {props.children}
    </SText>
}
export default class emitir2 extends Component {

    componentDidMount() {
        MDL.factura.getSiat().then((res) => {
            this.setState({ parametricas: res })
        })
    }

    renderPuntoDeVenta() {
        return <SView col={"xs-12"} center>
            <Label bold>{"RAZÓN SOCIAL"}</Label>
            <Label bold>{"SUCURSAL"}</Label>
            <Label>{"No. Punto de Venta"}</Label>
            <Label>{"DIRECCIÓN"}</Label>
            <Label>{"Teléfono"}</Label>
            <Label>{"REGIONAL"}</Label>
        </SView>
    }
    renderNitNumero() {
        return <SView col={"xs-12"} center>
            <SView col={"xs-12"} row >
                <Label bold flex>{"NIT"}</Label>
                <Label style={{ width: 90 }} >{"454561021"}</Label>
            </SView>
            <SView col={"xs-12"} row >
                <Label bold flex>{"FACTURA N"}</Label>
                <Label style={{ width: 90 }} >{"__NÚMERO_DE_FACTURA__"}</Label>
            </SView>
            <SView col={"xs-12"} row >
                <Label bold flex>{"CÓD. AUTORIZACIÓN"}</Label>
                <Label style={{ width: 90 }} >{"28423849324982384928432943289"}</Label>
            </SView>
        </SView>
    }
    renderTitulo() {
        return <SView center>
            <Label fontSize={30} bold>{"FACTURA"}</Label>
            <Label >{"(Con Derecho a Crédito Fiscal)"}</Label>
        </SView>
    }
    renderCliente() {

        return <SView center row>
            <SView col={"xs-12 sm-5"} row center>
                <Label bold >{"Feha"}</Label>
                <SView width={16} />
                <SInput flex customStyle={customStyle} />
                <SHr />
            </SView>
            <SView col={"sm-2"} />
            <SView col={"xs-12 sm-5"} row center>
                <Label bold >{"NIT/CI/CEX"}</Label>
                <SView width={16} />
                <SInput flex customStyle={customStyle} />
                <SHr />
                {/* <Label style={{ width: 90 }} >{"__CLINETE_NIT_"}</Label> */}
            </SView>
           
            <SView col={"xs-12 sm-5"} row center>
                <Label bold >{"Nombre/Razón Social"}</Label>
                <SView width={16} />
                <SInput flex customStyle={customStyle} />
                <SHr />
                {/* <Label style={{ width: 90 }} >{"__CLINETE_NIT_"}</Label> */}
            </SView>
            <SView col={"sm-2"} />
            <SView col={"xs-12 sm-5"} row center>
                <Label bold >{"Cod. Cliente"}</Label>
                <SView width={8} />
                <SInput flex customStyle={customStyle} />
                <SHr />
                {/* <Label style={{ width: 90 }} >{"__CLINETE_NIT_"}</Label> */}
            </SView>
        </SView>
    }
    renderProductos() {
        return <SView style={{
            width: "100%",
            height: 200,
            borderWidth: 1,
        }}>

        </SView>
    }
    renderFooter() {
        return <SView col={"xs-12"} row>
            <SView center flex>
                <Label center fontSize={9}>{"ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY Ley N° 453: Tienes derecho a un trato equitativo sin discriminación en la oferta de servicios."}</Label>
                <Label center fontSize={9}>{"Este documento es la Representación Gráfica de un Documento Fiscal Digital emitido en una modalidad de facturación en línea"}</Label>
            </SView>
            <SView width={16} />
            <SView width={80} height={80} card>

            </SView>
        </SView>
    }
    render() {

        return <SPage title={"Emitir Factura"}>
            <SView col={"xs-12"} padding={8} >
                {/* header */}
                <SView col={"xs-12"} row>
                    <SView flex={3} center>
                        {this.renderPuntoDeVenta()}
                    </SView>
                    <SView flex={2} />
                    <SView flex={3} center style={{ minWidth: 150 }}>
                        {this.renderNitNumero()}
                    </SView>
                </SView>
                <SHr h={30} />
                {/* TITULO */}
                {this.renderTitulo()}
                <SHr h={16} />
                {/* CLIENTE */}
                {this.renderCliente()}
                <SHr h={16} />
                {/* TABLA */}
                {this.renderProductos()}
                <SHr h={16} />
                {/* FOOTER */}
                {this.renderFooter()}
            </SView>
        </SPage >
    }
}
