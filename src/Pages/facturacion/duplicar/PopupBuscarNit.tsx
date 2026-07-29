import React from "react";
import { SList2, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../../MDL";
import { Dimensions } from "react-native";


type PopupBuscarNitProps = {
    e: any,
    style?: any,
    ref: (ref: PopupBuscarNit) => void,
    onClose: () => void,
    defaultValue: any,
    onSelect: (cliente: any) => void
}
export default class PopupBuscarNit extends React.Component<PopupBuscarNitProps> {
    static close() {
        SPopup.close("PopupBuscarNit");
    }
    static open(props: PopupBuscarNitProps) {
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
                key: "PopupBuscarNit",
                content: <PopupBuscarNit style={{
                    left: pageX,
                    top: top,
                    width: width,
                }}
                    {...props} />
            })
        })
    }

    state = {
        clientes: [],
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
                alignItems: "center",
                position: "absolute",
                top: 0,
                backgroundColor: STheme.color.background,
                borderColor: STheme.color.lightGray,
                borderWidth: 1,
                borderRadius: 8,
                padding: 8,
                ...this.props.style

            }}>
            {this.state.clientes.length <= 0 ? <SView flex><SText>No se encontraron clientes.</SText></SView> :
                <SList2 data={this.state.clientes}
                    render={(e) => {
                        return <SView col={"xs-12"} card onPress={() => {
                            if (this.props.onSelect) this.props.onSelect(e);
                        }} padding={4}>
                            <SText fontSize={12}>{e.numerodocumento}</SText>
                            <SText fontSize={12}>{e.nombrerazonsocial}</SText>
                        </SView>
                    }} />
            }
        </SView >
    }
}