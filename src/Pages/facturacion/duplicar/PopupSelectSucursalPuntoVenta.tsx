import React from "react";
import { SHr, SImage, SPopup, SText, STheme, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../../MDL";
import { SectionList } from "react-native";
import { PuntoVenta, Sucursal } from "../../../MDL/empresa/type";


type PopupSelectSucursalPuntoVentaProps = {
    onSelect: (sucursal: Sucursal, puntoVenta: PuntoVenta) => void
}
export default class PopupSelectSucursalPuntoVenta extends React.Component<PopupSelectSucursalPuntoVentaProps> {

    static open(props: PopupSelectSucursalPuntoVentaProps) {
        SPopup.open({
            style: {
                backgroundColor: STheme.color.text + "AA",
            },
            key: "PopupSelectSucursalPuntoVenta",
            content: <PopupSelectSucursalPuntoVenta {...props} />
        })
    }

    state = {
        sucursales: []
    }
    componentDidMount(): void {
        MDL.empresa.getAllSucursales().then((suc) => {
            const sections = suc.map(sucursal => ({
                ...sucursal,
                data: sucursal.punto_venta ?? []
            }));
            this.setState({ sucursales: sections })
        }).catch(e => {
        })
    }
    renderItemHeader(item: Sucursal) {
        // @ts-ignore
        const src = SSocket.api.empresa + "sucursal/" + item.key
        return <SView col={"xs-12"} style={{
            alignItems: "center",
            padding: 4,
        }} row>
            <SView style={{ width: 30, height: 30, borderRadius: 100, backgroundColor: STheme.color.card }} center>
                <SText>{item.codigo_facturacion}</SText>
            </SView>
            <SView width={8} />
            <SView style={{ width: 30, height: 30, borderRadius: 4, overflow: "hidden", backgroundColor: STheme.color.card }}>
                <SImage src={src} style={{ resizeMode: "cover" }} />
            </SView>
            <SView width={8} />
            <SText flex bold>{item.descripcion}</SText>
        </SView>
    }
    renderItemPuntoVenta(item: PuntoVenta, section: Sucursal) {
        // @ts-ignore
        const src = SSocket.api.empresa + "sucursal/" + item.key
        return <SView col={"xs-12"} style={{
            alignItems: "center",
            padding: 4,
        }} row card onPress={e => {
            this.props.onSelect(section, item)
            SPopup.close("PopupSelectSucursalPuntoVenta");
        }}>
            <SView style={{
                width: 30, height: 30,
            }} center>
                <SText>{section.codigo_facturacion}</SText>
            </SView>
            <SView width={8} />
            <SView style={{ width: 30, height: 30, borderRadius: 100, backgroundColor: STheme.color.card }} center>
                <SText>{item.codigo_facturacion}</SText>
            </SView>
            <SView width={8} />
            <SView style={{ width: 30, height: 30, borderRadius: 4, overflow: "hidden" }} card>
                <SImage src={src} style={{ resizeMode: "cover" }} />
            </SView>
            <SView width={8} />
            <SText flex >{"No. Punto de Venta " + item.descripcion}</SText>
        </SView>
    }
    render() {
        return <SView style={{
            width: "100%",
            height: 500,
            maxWidth: 500,
            maxHeight: "100%",
            borderRadius: 8,
        }} center backgroundColor={STheme.color.background} withoutFeedback={true}>
            <SHr />
            <SText color={STheme.color.gray}>{"Seleccione un punto de venta"}</SText>
            <SectionList
                style={{ width: "100%" }}
                sections={this.state.sucursales}
                keyExtractor={(item, index) => item.key + index}
                renderSectionHeader={({ section }) => this.renderItemHeader(section)}
                renderItem={({ item, section }) => this.renderItemPuntoVenta(item, section)}
                SectionSeparatorComponent={() => <SView height={8} />}
                ItemSeparatorComponent={() => <SView height={8} />}
                contentContainerStyle={{
                    padding: 8,
                }}
            />
        </SView>
    }
}