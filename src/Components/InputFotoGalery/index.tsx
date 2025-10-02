import React from "react";
import { GestureResponderEvent, ImageStyle, TouchableOpacity, UIManager, ViewStyle } from "react-native";
import { SHr, SIcon, SImage, SText, STheme, SUuid, SView } from "servisofts-component";
import MDL from "../../MDL";
import DropZoneWeb from "./DropZoneWeb";
import SUpload from "../SUpload";


type InputFotoGaleryProps = {
    style?: ViewStyle,
    src?: string;
    imageStyle?: ImageStyle;
    icon?: string;
}
export default class InputFotoGalery extends React.Component<InputFotoGaleryProps> {

    key: string = SUuid();
    view: TouchableOpacity | null = null;
    handleDropListeners: any;

    state = {
        src: this.props.src,
        icon: this.props.icon,
        arrayFoto: [] as string[],
    }
    values: File[] | null = null;
    // arrayFoto: File[] | null = null;

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
        // this.arrayFoto?.push(...files)
        // this.values = files;
        this.values = [...(this.values || []), ...files];
        for (let file of files) {
            console.log(`Nombre: ${file.name}, Tipo: ${file.type}, Tamaño: ${file.size} bytes`);
            const url = URL.createObjectURL(file);
            // this.setState({ src: url });
            const newUrls = files.map(file => URL.createObjectURL(file));
            this.setState(prev => ({
                src: newUrls[newUrls.length - 1], // última imagen cargada
                arrayFoto: [...(prev.arrayFoto || []), ...newUrls] // acumula todas
            }));
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
        console.log("ARRAY FOTO", this.state.arrayFoto)
        let str = this.state.src + "";
        return <TouchableOpacity
            ref={ref => this.view = ref}
            style={this.props.style}
            onPress={this.handleOnPress.bind(this)}
            activeOpacity={0.8} >
            <SView col="xs-12" row>
                <SView style={{
                    width: 60,
                    height: 60
                }} >
                    <DropZoneWeb handleDropFiles={this.handleDropFiles.bind(this)} >
                        {/* {(str.includes("undefined")) && <SImage src={require('../../Assets/png/addFoto.png')} style={{
                    resizeMode: "cover",
                    width: 50,
                    height: 50,
                }} />} */}
                        {(this.state.icon) && <SIcon name={this.state?.icon} fill={STheme.color.text} style={{
                            resizeMode: "cover",
                        }} />}
                        {/* {this.state.src && <SImage src={this.state.src} style={{
                            resizeMode: "cover",
                            ...(this.props.imageStyle || {}),
                        }} />} */}
                        {/* {this.state.arrayFoto.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                                {this.state.arrayFoto.map((url, i) => (
                                    <SImage
                                        key={i}
                                        src={url}
                                        style={{
                                            resizeMode: "cover",
                                            width: 50,
                                            height: 50,
                                            borderRadius: 8,
                                        }}
                                    />
                                ))}
                            </div>
                        )} */}
                    </DropZoneWeb>
                </SView>
                <SView width={10}/>
                <SView col="xs-8" >
                    {this.state.arrayFoto.length > 0 && (
                        <SView row style={{ flexDirection: "row", gap: 8 }}>
                            {this.state.arrayFoto.map((url, i) => (
                                <SImage
                                    key={i}
                                    src={url}
                                    style={{
                                        resizeMode: "cover",
                                        width: 60,
                                        height: 60,
                                        borderRadius: 8,
                                    }}
                                />
                            ))}
                        </SView>
                    )}
                </SView>
            </SView>
        </TouchableOpacity>
    }
}