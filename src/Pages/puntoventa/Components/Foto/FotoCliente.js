import React, { Component } from 'react';
import { SView, SText, STheme, SNavigation, SMath, SInput, SButtom, SPopup, SNotification, SForm, SHr, SThread, SImage } from 'servisofts-component';
import MDL from '../../../../MDL';
import SIconApp from '../../../../Assets/SIconApp';
import SSocket from 'servisofts-socket';
import PopupCliente from '../Carrito/PopupCliente';
export default class FotoCliente extends Component {
    constructor(props) {
        super(props);
    }
    limpiar() {
        this.pollo = {};
         this.forceUpdate();
    }
    renderTecladoNumerico = () => {
        const style_text = {
            color: STheme.color.text,
            fontSize: 12,
            fontWeight: "bold",
        };
        const url = SSocket.api.crm + "cliente/" + this.pollo?.key;
        return (
            <>
                <SView center row backgroundColor={STheme.color.darkGray} style={{ height: 38, borderRadius: 2, margin: 2 }}>
                    <SView col={"xs-12"} row center onPress={() => {
                        this.limpiar();
                        PopupCliente.open({
                            onReloadCliente: (cliente) => {
                                this.pollo = cliente;
                                console.log("trajo " + JSON.stringify(cliente))
                                this.forceUpdate();
                            }
                        })
                    }
                    }>
                        <SView center col={"xs-5"}>
                            <SView center backgroundColor={STheme.color.background} style={{
                                minWidth: 10, width: 30, minHeight: 10, height: 30, borderRadius: 18, margin: 4, marginRight: (this.pollo?.key ? 6 : 14), overflow: "hidden",
                            }}>
                                {!this.pollo?.key ? <SIconApp name='profile2' width={20} fill={STheme.color.text} /> : <SImage src={url} style={{ resizeMode: "cover" }} />}
                            </SView>
                        </SView>
                        <SView flex center >
                            <SText style={{ ...style_text, fontSize: 12 }}>{this.pollo?.nombres || "CLIENTE"}</SText>
                            {this.pollo?.key ? <SText style={{ ...style_text, fontSize: 12, color: "#26e9aeff", textTransform:"uppercase" }}>CLIENTE</SText> : null}
                        </SView>
                    </SView>
                </SView>
            </>
        );
    };
    render() {
        return <>
            { }
            {this.renderTecladoNumerico()}
            { }
        </>
    }
}
