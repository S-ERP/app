import React, { useEffect, useRef, useState } from 'react';
// import { BrowserMultiFormatReader, NotFoundException } from '@zxing/browser';
import { SImage, SNotification, SPopup, SText, STheme, SThread, SView } from 'servisofts-component';
import { Html5Qrcode } from 'html5-qrcode';
import Sounds from '../Sounds';
import { Dimensions } from 'react-native';

type BarcodeScannerProps = {
    onRead?: (val: string) => void,
    onTakePicture?: (val: string) => void,

}
export default class BarcodeScanner extends React.Component<BarcodeScannerProps, {}> {

    static open(props: BarcodeScannerProps) {
        SPopup.open({
            key: "barcode_scanner",
            content: <SView
                col={"xs-12"}
                center
                style={{
                    maxWidth: 500,
                    height: 500,
                    backgroundColor: STheme.color.background,
                }}>
                <BarcodeScanner {...props} />
            </SView>
        })
    }
    static close() {
        SPopup.close("barcode_scanner");
    }
    apectRatio = 1;
    dimensions: { width: number, height: number } | null = null;
    scanner: Html5Qrcode | null = null;
    isScanning: boolean = false;
    componentDidMount(): void {
        this.startScanner();
    }

    componentWillUnmount(): void {
        if (this.scanner)
            this.scanner.stop().catch(() => {
            });
    }

    startScanner() {
        if (this.dimensions == null) return;
        if (this.scanner) return;
        this.scanner = new Html5Qrcode("reader");
        // @ts-ignore
        const audio: any = new Audio(require("./beep.mp3").default) as HTMLAudioElement;
        audio.loop = false; // No repetir el sonido
        audio.volume = 0.7; // Ajusta el volumen según sea necesario
        audio.load();
        const dimen = this.dimensions;
        this.scanner.start(
            { facingMode: "environment" }, // cámara trasera
            {
                fps: 10,

                aspectRatio: this.apectRatio,
                qrbox: {
                    width: Math.min(dimen.width, dimen.height) * 0.8,
                    height: Math.min(dimen.width, dimen.height) * 0.8,
                },
                videoConstraints: {
                    facingMode: "environment", // cámara trasera
                }
            },
            (decodedText) => {
                console.log("Código leído:", decodedText);
                if (this.isScanning) return; // Evita múltiples lecturas
                this.isScanning = true; // Marca que se está escaneando
                if (this.props.onRead) {
                    this.props.onRead(decodedText);
                }
                audio.play();
                SNotification.send({
                    title: "Código leído",
                    body: decodedText,
                    time: 3000,
                })
                new SThread(1000, "hilo", false).start(() => {
                    this.isScanning = false; // Permite nuevas lecturas después de 1 segundo
                })
            },
            (error) => {
                // Ignora errores leves de lectura
            }
        );
    }


    takephoto() {
        const document = window.document;
        const div = document.getElementById("reader");
        const video = div?.querySelector("video");
        if (!video) {
            console.error("No se encontró el elemento de video.");
            return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");
        if (!context) {
            console.error("No se pudo obtener el contexto del canvas.");
            return;
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/png");
        console.log("Foto tomada:", imageData);
        if (!!imageData && this.props.onTakePicture) {
            this.props.onTakePicture(imageData);
        }
        SPopup.open({
            key: "imagePreview",
            content: <SView col={"xs-12"} height={500}>
                <SImage src={imageData} />
            </SView>
        })
        return imageData;
    }

    render() {
        return <>
            <SView style={{
                width: "100%",
                height: "100%",
            }} onLayout={e => {
                const { width, height } = e.nativeEvent.layout;
                this.dimensions = { width, height: height };
                this.apectRatio = this.dimensions.width > this.dimensions.height ? this.dimensions.width / this.dimensions.height : this.dimensions.height / this.dimensions.width;
                this.startScanner();
            }}>
                <div id="reader" style={{ width: "100%", height: "100%" }} />
            </SView>
            <SView style={{
                position: "absolute",
                bottom: 20,
                backgroundColor: STheme.color.text,
                padding: 10,
            }}
                onPress={() => {
                    this.takephoto();
                }}>
                <SText color={STheme.color.background} fontSize={16} bold>Toma una foto</SText>
            </SView>
        </>
    }

}
