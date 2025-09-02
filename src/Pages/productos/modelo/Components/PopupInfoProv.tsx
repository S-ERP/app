import React from "react";
import { TextStyle, ViewStyle } from "react-native";
import { SHr, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../../../MDL";

type Props = { ajuste: any, onPress?: () => void, style?: ViewStyle, textStyle?: TextStyle }
export default class PopupInfoProv extends React.Component<Props> {
    static open(props: Props) {
        SPopup.open({
            key: "PopupInfoProv",
            content: <PopupInfoProv {...props} />,
        })
    }

    render() {
        const { proveedor, producto_key, producto_descripcion, precio_compra, onPress } = this.props;
        return <SView width={200} backgroundColor={STheme.color.background} style={{ borderRadius: 8, padding: 16, }}>
            <SText fontSize={14} bold><SText clean fontSize={10} color={STheme.color.lightGray} style={{
                borderWidth: 1, borderColor: "green", backgroundColor: STheme.color.success + "55", padding: 3, borderRadius: 4
            }} >Nit: {proveedor.nit ? proveedor.nit : "0"}</SText>RZ: {proveedor.razon_social}</SText>
            <SHr height={8} />
            <SText fontSize={12} color={STheme.color.lightGray}>contacto: {proveedor.nombre}</SText>
            <SHr height={4} />
            <SText fontSize={10} color={STheme.color.lightGray}>Telefono: {proveedor.telefono}</SText>
            <SHr height={8} />
            <SText fontSize={10} color={STheme.color.lightGray}>producto key: {producto_key}</SText>
            <SHr height={8} />
            <SText fontSize={10} color={STheme.color.lightGray}>producto: {producto_descripcion}</SText>
            <SHr height={8} />
            <SText fontSize={10} color={STheme.color.lightGray}>Precio: {precio_compra}</SText>
            <SHr height={8} />
            <SText color={STheme.color.danger}  >{"RESET"}</SText>
        </SView>
    }



}