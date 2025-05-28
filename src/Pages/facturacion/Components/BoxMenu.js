import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SDate, SHr, SIcon, SImage, SPage, SText, STheme, SView, SNavigation, SPopup, SLanguage, SList2, SButtom, SInput } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import { Linking } from 'react-native';
export type BoxMenuPropsType = {
    data: any,
    onReload?: () => void,
}
class BoxMenu extends Component<BoxMenuPropsType> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    handlePress() {
        if (!this.props.onPress) return null;

        this.props.onPress(this.props.datas)
    }


    RenderOption = ({ label, icon, onPress }) => {

        // renderOption = (label: string) => {
        return (
            <>
                <SView col={"xs-11"} row center
                    onPress={() => {
                        if (onPress) onPress()
                        // SNavigation.navigate(url, params)
                        SPopup.close("popup_menu_alvaro");
                    }}
                >
                    <SView col={"xs-2"} center height={32}>
                        <SIcon name={icon} height={18} fill={STheme.color.text} />
                    </SView>
                    <SView width={8} />
                    <SView flex  >
                        <SText fontSize={14} >{label}</SText>
                    </SView>

                </SView>
                <SHr height={1} color={STheme.color.card} />
            </>
        );
    }

    renderBox() {

        // console.log("this.props.data", this.props.data)


        const factura = this.props.data

        const options = [
            {
                label: "Imprimir tamaño carta", icon: "imprimir", onPress: () => {
                    MDL.factura.imprimir({
                        cuf: factura?.data?.cuf
                    })
                }
            },
            {
                label: "Imprimir tipo rollo", icon: "imprimir", onPress: () => {
                    MDL.factura.imprimir({
                        cuf: factura?.data?.cuf,
                        tipo: "rollo"
                    })
                }
            },
            {
                label: "Ver en SIAT", icon: "Arrow", onPress: () => {
                    Linking.openURL(factura.data.urlImpuestos)
                }
            },
            {
                label: "Verificar", icon: "Wifi", onPress: () => {
                    MDL.factura.verificarEstado({ cuf: factura.data.cuf })
                }
            },

        ];

        if (factura.state == "enviada") {
            options.push({
                label: "Anular", icon: "Delete", onPress: () => {
                    // TODO
                    if (this.props.anular) this.props.anular({ cuf: factura.data.cuf })
                    // MDL.factura.anular({ cuf: factura.data.cuf })
                }
            })
        }

        if (factura.state == "anulada") {
            options.push({
                label: "Revertir", icon: "revertir", onPress: () => {
                    MDL.factura.revertir({ cuf: factura.data.cuf })
                }
            })
        }
        if (factura.state == "emitida") {
            options.push({
                label: "Reenviar", icon: "revertir", onPress: () => {
                    MDL.factura.reenviar({ cuf: factura.data.cuf }).then(() => {
                        MDL.factura.verificarEstado({ cuf: factura.data.cuf }).then(e => {
                            if (this.props.onReload) this.props.onReload()
                        })

                    }).catch(e => {

                    })
                }
            })
            options.push({
                label: "Reconstruir", icon: "revertir", onPress: () => {
                    MDL.factura.reconstruir({ cuf: factura.data.cuf }).then(() => {
                        // MDL.factura.verificarEstado({ cuf: factura.data.cuf }).then(e => {
                        //     if (this.props.onReload) this.props.onReload()
                        // })

                    }).catch(e => {

                    })
                }
            })
        }
        return (
            <SView
                col={"xs-12"}
                center
                row
                withoutFeedback
                backgroundColor={STheme.color.background}
                style={{
                    borderRadius: 8,
                    overflow: "hidden",
                    borderWidth: 1,
                    //  borderBottomWidth: 2,
                    borderColor: "#66666699",
                }}
            >
                <SView col={"xs-12"} row center  >
                    {options.map(this.RenderOption)}
                </SView>
            </SView>
        );
    }

    render() {
        return (<SView col={"xs-12"} flex center >
            {/* <SText>{JSON.stringify(this.props.data)}</SText> */}
            {this.renderBox()}
            {/* <SHr h={8} /> */}
        </SView >
        );
    }
}
export default (BoxMenu);