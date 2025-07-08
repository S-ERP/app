import React from "react";
import { GestureResponderEvent, ImageStyle, TouchableOpacity, UIManager, ViewStyle } from "react-native";
import { SImage, SText, SUuid } from "servisofts-component";
import MDL from "../../MDL";
import DropZoneWeb from "./DropZoneWeb";
import SUpload from "../SUpload";


type InputFotoProps = {
    style?: ViewStyle,
    src?: string;
    imageStyle?: ImageStyle;
}
export default class InputFoto extends React.Component<InputFotoProps> {

    key: string = SUuid();
    view: TouchableOpacity | null = null;
    handleDropListeners: any;

    state = {
        src: this.props.src,
    }
    values: File[] | null = null;

    getValue() {
        return this.values;
    }

    setValue(src: string) {
        this.setState({ src });
        this.values = null;
    }
    componentDidMount(): void {
        this.handleDropListeners = MDL.qr_reader.addEventListener("take_picture_handle_drop", (e) => {
            this.view?.measureInWindow((x, y, width, height) => {
                if (e.gestureEvent.nativeEvent.pageX >= x && e.gestureEvent.nativeEvent.pageX <= x + width &&
                    e.gestureEvent.nativeEvent.pageY >= y && e.gestureEvent.nativeEvent.pageY <= y + height) {
                    const b64: any = e.notification.image;
                    const byteCharacters = atob(b64.split(',')[1]);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    // @ts-ignore
                    const blob = new Blob([byteArray], { type: 'image/png' });
                    const file = new File([blob], "foto.png", { type: 'image/png' });
                    this.handleDropFiles([file]);

                }
            })

        })
    }
    componentWillUnmount(): void {
        MDL.qr_reader.removeEventListener(this.handleDropListeners);
    }


    handleDropFiles = (files: File[]) => {
        console.log("Archivo recibido:", files);
        this.values = files;
        for (let file of files) {
            console.log(`Nombre: ${file.name}, Tipo: ${file.type}, Tamaño: ${file.size} bytes`);
            const url = URL.createObjectURL(file);
            this.setState({ src: url });
        }
    }


    handleOnPress = (e: GestureResponderEvent) => {
        console.log("InputFoto.handleOnPress", e);
        SUpload.choose({
            accept: "image/*",
            multiple: false,
        }).then((files: any) => {
            console.log("Archivo seleccionado:", files);
            this.handleDropFiles(Array.from(files));
        }).catch((error: any) => {
            console.error("Error al seleccionar archivo:", error);
        })
    }
    render() {
        return <TouchableOpacity
            ref={ref => this.view = ref}
            style={this.props.style}
            onPress={this.handleOnPress.bind(this)}
            activeOpacity={0.8}>
            <DropZoneWeb handleDropFiles={this.handleDropFiles.bind(this)}>
                {this.state.src && <SImage src={this.state.src} style={{
                    resizeMode: "cover",
                    ...(this.props.imageStyle || {}),
                }} />}
            </DropZoneWeb>
        </TouchableOpacity>
    }
}