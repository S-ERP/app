import React from "react";
import { SHr, SImage, SList, SList2, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import Model from "../../../Model";
import MDL from "../../../MDL";
import { Dimensions, SectionList } from "react-native";
import { PuntoVenta, Sucursal } from "../../../MDL/empresa/type";


type PopupBuscaRazonProps = {
    e: any,
    style?: any,
    ref: (ref: PopupBuscaRazon) => void,
    onClose: () => void,
    defaultValue: any,
    onSelect: (cliente: any) => void
    // onSelect: (sucursal: Sucursal, puntoVenta: PuntoVenta) => void
}
export default class PopupBuscaRazon extends React.Component<PopupBuscaRazonProps> {
    static close() {
        SPopup.close("PopupBuscaRazon");
    }
    static open(props: PopupBuscaRazonProps) {
        props.e.currentTarget.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
            const key_popup = "popupkey";
            const windowheight = Dimensions.get("window").height
            const itemWidth = 140;
            const itemHeight = 70;
            let top = pageY + height;
            if (itemHeight + top > windowheight) {
                top = windowheight - itemHeight;
            }
            SPopup.open({
                type: "3",
                style: {
                    backgroundColor: STheme.color.text + "AA",
                },
                key: "PopupBuscaRazon",
                content: <PopupBuscaRazon style={{
                    left: pageX,
                    top: top,
                    width: width,
                    // itemHeight: itemHeight,
                }}
                    {...props} />
            })
        })
    }

    state = {
        razones: [
            { key: "1", content: "13. Publicidad tiene información diferente sobre el producto por ejemplo, pastillas en vez de gel" },
            { key: "2", content: "25. El cliente pensó que había ganado un regalo gratis." },
            { key: "3", content: "17. Barrera de lenguaje." },
            { key: "4", content: "28. Cliente menor de 18 años" },
        ],
        text: this.props.defaultValue
    }
    componentDidMount(): void {
        this.buscar(this.props.defaultValue)
    }
    buscar(text: string) {
        this.setState({ text: text })
        MDL.factura.getClientes(text).then((e: any) => {
            this.setState({ clientes: e })
        }).catch(e => {

        })
    }
    componentWillUnmount(): void {
        if (this.props) this.props.onClose();
    }

    render() {
        return <SView
            withoutFeedback={true}
            style={{
                height: 220,
                // padding: 8,
                // justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                top: 0,
                backgroundColor: STheme.color.background,
                borderColor: STheme.color.lightGray,
                borderWidth: 1,
                borderRadius: 8,
                padding:8,
                ...this.props.style

            }}>
            {/* <SText color={STheme.color.gray}>{this.state.text}</SText> */}
            {this.state.razones.length <= 0 ? <SView flex><SText>No se encontraron razones.</SText></SView> :
                <SList2 data={this.state.razones}
                    render={(e) => {
                        return <SView col={"xs-12"} card onPress={() => {
                            if (this.props.onSelect) this.props.onSelect(e);
                        }} padding={4}>
                            {/* <SText>{e.codigotipodocumentoidentidad}</SText> */}
                            <SText fontSize={12}>{e.content}</SText>
                            {/* <SText fontSize={12}>{e.nombrerazonsocial}</SText> */}
                        </SView>
                    }} />
            }
        </SView >
    }
}