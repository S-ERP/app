import React from "react";
import { SNavigation, SPage, SSwitch, SText, STheme, SView } from "servisofts-component";
import BarcodeScanner from "../../Components/BarcodeScanner";
import SSocket from "servisofts-socket";
import MDL from "../../MDL";
import ToolTips from "../../Components/ToolTips";
import permiso from "../rol/permiso";

export default class root extends React.Component {

    loadData = async () => {
        const permiso_info = await MDL.rolesPermisos.getAllPermisoInfo();
        return permiso_info;
    }



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

        return <SPage title={"qr_reader"} disableScroll center>

            <BarcodeScanner
                onTakePicture={this.handleTakePicture.bind(this)}
                onRead={this.handleRead.bind(this)} />
            <SView style={{ width: 50, position: "absolute", top: 0, left: 0 }} height={50} row center>

                <ToolTips
                    type="info"
                    small
                    color={STheme.color.warning}
                    descripcion={"La camara sirve para leer codigos de barra y QR, ademas de tomar fotos."}
                    // itemWidth={200}
                    itemHeight={100}
                />
            </SView>
        </SPage>

    }
}