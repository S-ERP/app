import React from "react";
import { FlatList } from "react-native";
import { SColorPicker, SHr, SInput, SPage, SPopup, SRangeSlider, SText, STheme, SThread, SView } from "servisofts-component";
import { Color } from "three";
import SIconApp from "../../../Assets/SIconApp";
import Model from "../../../Model";
import MDL from "../../../MDL";
type PopupEditarTemaProps = {

}
export default class PopupEditarTema extends React.Component<PopupEditarTemaProps> {
    static REF: PopupEditarTema | null = null;
    static open() {
        if (!this.REF) return;
        this.REF.setState({ open: true });
    }
    static close() {
        if (!this.REF) return;
        this.REF.setState({ open: false });
    }

    state = {
        open: false
    }
    render() {
        PopupEditarTema.REF = this;
        const colors = [
            "background",
            "text",
            "primary",
            "secondary",
            "card",
            "barColor",
            "success",
            "warning",
            "danger",
            "error",
            "accent",
            "info",
            "gray",
            "lightGray",
            "darkGray",
            "lightBlack",
            "link",
            "backgroundOpacity"

        ]
        if (!this.state.open) return null;
        return <SView style={{
            position: "absolute",
            right: 16,
            top: 16,
            width: 150,
            height: 400,
            maxHeight: "90%",
            backgroundColor: STheme.color.background,
        }}>


            <SView col={"xs-12"} flex padding={4} style={{
                borderRadius: 4,
                borderWidth: 1,
                borderColor: STheme.color.card,
            }}>
                <SText bold>Colores del tema</SText>
                <SHr h={4} />
                <FlatList
                    data={colors}
                    renderItem={({ item }) => <ColorItem color={item} />}
                    ItemSeparatorComponent={() => <SView style={{ height: 4, }} />}
                    keyExtractor={(item) => item}
                />
                <SView col={"xs-12"} padding={2} row>
                    <SText onPress={() => {
                        SPopup.close();
                        STheme.color = {
                            ...STheme.color,
                        }
                        STheme.repaint();
                        this.forceUpdate();
                    }} fontSize={10} card padding={4}>{"PROBAR"}</SText>
                    <SView flex />
                    <SText onPress={() => {
                        SPopup.close();
                        STheme.color = {
                            ...STheme.color,
                        }
                        STheme.repaint();
                        let theme = STheme.color;
                        delete theme.mapStyle;
                        Model.empresa.Action.editar({
                            data: {
                                ...MDL.empresa.select,
                                theme: theme
                            },
                            key_usuario: Model.usuario.Action.getKey(),
                        }).then(e => {

                            MDL.empresa.setEmpresa(e.data);
                            // Model.empresa.Action.setEmpresa(e.data);
                        }).catch(e => {

                        })
                        this.forceUpdate();
                    }} fontSize={10} card padding={4}>{"GUARDAR"}</SText>
                </SView>
                <SView style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    width: 24,
                    height: 24,
                }} onPress={() => PopupEditarTema.close()}>
                    <SIconApp name="Close" fill={STheme.color.text} />
                </SView>
            </SView>
        </SView>
    }
}

const ColorItem = ({ color }: { color: string }) => {

    let type = <SInput customStyle={"clean"} style={{
        height: 28,
        paddingStart: 0,
        borderWidth: 1,
        borderRadius: 4,
        overflow: "hidden",
        fontSize: 12,
        color: STheme.color.text,
        // backgroundColor: STheme.color.card,
        borderColor: STheme.color.card
    }}
        type={"color"} defaultValue={STheme.color[color]}
        onChangeText={(color_hex) => {
            if (STheme.color[color] == color_hex) return;
            STheme.color[color] = color_hex;

        }} />
    if (color == "backgroundOpacity") {
        type = <SRangeSlider range={[0, 100]} defaultValue={(STheme.color.backgroundOpacity ?? 1)*100} onChange={e => {
            STheme.color.backgroundOpacity = e/100
        }} />
    }
    return <SView col={"xs-12"} row style={{
        alignItems: "center",
        // backgroundColor:"#f9f"
    }} >
        {/* <SView style={{
            width: 20, height: 20, backgroundColor: STheme.color[color],
            borderWidth: 1,
            borderColor: STheme.color.card,
            borderRadius: 4,
        }}>

        </SView>
        <SView width={4} />
         */}
        <SText fontSize={10} color={STheme.color.lightGray}>{color}</SText>
        <SHr h={2} />
        {type}
    </SView>
}