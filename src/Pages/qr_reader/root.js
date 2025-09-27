import React from "react";
import { SPage, SSwitch, SText, STheme, SView } from "servisofts-component";
import BarcodeScanner from "../../Components/BarcodeScanner";
import SSocket from "servisofts-socket";
import MDL from "../../MDL";
import ToolTips from "../../Components/ToolTips";

export default class root extends React.Component {


    handleRead = (e) => {
        MDL.qr_reader.handleRead(e).then((response) => {
            console.log("QR Code Data:", response);
        }).catch((error) => {
            console.error("QR Code Error:", error);
        })
    }
    handleTakePicture = (e) => {
        MDL.qr_reader.handleTakePicture(e).then((response) => {
            console.log("Picture Data:", response);
        }).catch((error) => {
            console.error("Picture Error:", error);
        })
    }
    render() {
        return <SPage title={"qr_reader"} disableScroll center
        >
            <ToolTips
                type="info"
                small
                color={STheme.color.warning}
                descripcion={"hola mundo"}
                // itemWidth={200}
                itemHeight={300}
            />
            <BarcodeScanner
                onTakePicture={this.handleTakePicture.bind(this)}
                onRead={this.handleRead.bind(this)} />
        </SPage>

    }
}