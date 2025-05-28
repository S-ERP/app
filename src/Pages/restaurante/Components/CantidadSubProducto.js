import { KeyboardAvoidingView, Text, TextInput, View, Platform } from 'react-native'
import React, { Component, useEffect, useRef } from 'react'
import { SHr, SIcon, SInput, SPage, SPopup, SText, STheme, SThread, SUuid, SView } from 'servisofts-component'
import { connect } from 'react-redux'
import Btn from '../../../Components/Btn'
// import Model from '../Model'

export default class CantidadSubProducto extends Component {
    state = {
        cantidad: this.props.defaultValue ?? 0,
        open: false,
        key: SUuid()
    }


    handleEnd = () => {
        this.close = true;
        // Model.carrito.Action.setItem(this.props?.data?.key, { cantidad: this.state.cantidad, data: this.props?.data })
        this.setState({ open: false });
        if (this.props.onChange) {
            let val = this.props.onChange(this.state.cantidad);
            this.setState({ cantidad: val })
        }
    }

    componentWillUnmount() {
        this.close = true;
    }
    // shouldComponentUpdate(nextProps, nextState) {
    //     if (nextState.cantidad != this.state.cantidad) return true;
    //     if (nextState.open != this.state.open) return true;

    //     const idprd = this.props.data.key;
    //     const carritonew = nextProps.state?.carritoReducer?.productos[idprd]
    //     // const carritonew = {}
    //     if ((this.state.cantidad ?? 0) != (carritonew?.cantidad ?? 0)) {
    //         return true;
    //     }
    //     if ((nextState.cantidad ?? 0) != (carritonew?.cantidad ?? 0)) {
    //         return true;
    //     }
    //     return false;
    // }
    show(cantidad) {
        this.close = false;
        if (cantidad) {
            this.setState({ cantidad: cantidad });
            // this.state.cantidad = cantidad;
        }
        this.setState({ open: true });
        new SThread(1000, "Cantidad_hilo_" + this.state.key, true).start(() => {
            if (this.close) return;
            this.handleEnd();

        })
    }

    OpenComponent = (cantidadParent) => {
        const { cantidad, open } = this.state;
        const size = 30;
        const height = 28;
        return <SView width={110} height={height + 2} style={{
            borderWidth: 1,
            borderRadius: 16,
            borderColor: STheme.color.gray,
            backgroundColor: STheme.color.white,
        }} row center >
            <SView width={size} height={height} center
                onPress={() => {

                    if (this.state.cantidad - 1 <= 0) {
                        this.state.cantidad--;
                        this.handleEnd();
                        this.setState({ open: false });
                        return;
                    };
                    this.setState({ cantidad: this.state.cantidad - 1 });
                    this.show();
                }} style={{
                    // backgroundColor: STheme.color.lightGray + "50"
                }}
            >
                {(cantidad <= 1) ? < SIcon name='Delete3' width={15} height={15} fill={STheme.color.primary} /> : <SText fontSize={25} center color={STheme.color.primary} font='Montserrat-Bold' style={{
                    ...(Platform.OS == "android" ? { transform: [{ translateY: -2 }] } : {})
                }} >{"-"}</SText>}
            </SView>
            <SView flex height={height} center onPress={() => {
                this.close = true;
                SPopup.open({
                    key: "popup_cantidad",
                    content: <PopupCantidad
                        cantidad={cantidad}
                        limit={this.props.limit}
                        data={this.props.data}
                        onClose={() => {
                            this.handleEnd();
                            SPopup.close("popup_cantidad");

                        }}
                        onChange={(cantidad) => {
                            this.state.cantidad = parseInt(cantidad);
                            this.handleEnd();
                            SPopup.close("popup_cantidad");
                        }}
                    />,

                })
            }} >
                <SText fontSize={15} bold color={STheme.color.black}>{cantidad}</SText>
            </SView>
            <SView width={size} height={height} center
                onPress={() => {
                    if (this.props.limit) {
                        if (this.props.limit <= this.state.cantidad) {
                            return;
                        }
                    }
                    this.setState({ cantidad: this.state.cantidad + 1 })
                    // this.state.cantidad++;
                    this.show()
                }}
                style={{
                    // backgroundColor: STheme.color.lightGray + "50"
                }}
            >
                <SText fontSize={20} center font='Montserrat-Bold' color={STheme.color.primary} >{"+"}</SText>
            </SView>
        </SView >
    }
    render() {
        const { open } = this.state;
        // const productos = Model?.carrito?.Action.getState().productos ?? {};
        // let incar = productos[this.props?.data?.key];
        if (this.props.value) {
            this.state.cantidad = this.props.value;
        }
        const cantidad = this.state.cantidad

        if (open) return this.OpenComponent(cantidad)
        return (
            <SView width={30} height={30} center style={{
                backgroundColor: (cantidad > 0 ? STheme.color.primary : STheme.color.card),
                borderRadius: 8,
            }}
                border={(cantidad > 0 ? "" : STheme.color.gray)}
                onPress={() => {
                    if (this.props.disabled) {
                        return;
                    }
                    if (this.props.onPress) {
                        this.props.onPress();
                        return;
                    }
                    if (this.state.cantidad < 1) this.state.cantidad = 1;
                    this.show(cantidad)
                }}>
                {cantidad > 0 ? (<SText fontSize={16} bold color={STheme.color.white} >{cantidad}</SText>) : (<SText fontSize={23} color={STheme.color.primary} style={{
                    transform: [{ translateY: Platform.OS == "android" ? -1 : 0 }]
                }} >{"+"}</SText>)}
            </SView>
        )
    }
}

const PopupCantidad = ({ onClose, onChange, data, cantidad, limit }) => {
    const inputref = useRef();
    useEffect(() => {

        return () => {
            if (onClose) onClose();
        }
    }, [])
    return <SView col={"xs-11 sm-10 md-8 lg-6 xl-4"} height={300} withoutFeedback backgroundColor={STheme.color.background} borderRadius={8} style={{ overflow: "hidden" }}>
        {SPage.backgroundComponent}

        <SView col={"xs-12"} flex padding={8} center>
            <SText bold fontSize={20}>{data?.nombre}</SText>
            <SText>{data?.descripcion}</SText>
            <SHr h={16} />
            <SView width={150}>
                <SInput ref={inputref} type='number' defaultValue={cantidad + ""}
                    autoFocus
                    style={{
                        padding: 0,
                        margin: 0,
                        paddingStart: 0,
                        height: 40,
                        borderRadius: 4,
                        backgroundColor: STheme.color.lightGray + "30",
                        textAlign: "center",
                        color: STheme.color.text
                    }} />

            </SView>
            <SHr h={16} />
            <SView col={"xs-12"} row center>
                <Btn padding={4} type='danger' onPress={() => {
                    if (onClose()) onClose()
                }} >Cancelar</Btn>
                <SView width={50} />
                <Btn padding={4} onPress={() => {
                    let cantidad = inputref.current.getValue();
                    if (cantidad > limit) {
                        cantidad = limit;
                    }
                    if (onChange) onChange(cantidad)
                }}>Aceptar</Btn>
            </SView>
            {/* <TextInput defaultValue={cantidad} style={{
                height: 40,
                borderRadius: 4,
                width: 100,
                backgroundColor: STheme.color.lightGray + "30",
                textAlign: "center",
                color: STheme.color.text
            }}
                keyboardType={"numeric"}
                inputMode={"numeric"}
                onChangeText={(val) => {

                }}
            /> */}
        </SView>

    </SView>
}
