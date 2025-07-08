import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SHr, SIcon, SInput, SNotification, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import Btn from '../../empresa/config/Components/Btn';
import SIconApp from '../../../Assets/SIconApp';
import BarcodeScanner from '../../../Components/BarcodeScanner';
import InputFoto from '../../../Components/InputFoto';

type Props = {
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
}

export default class FormularioAgregarInventario extends Component<Props> {

    static open(props: Props) {
        SPopup.open({
            key: "FormularioAgregarInventario",
            content: <SView style={{
                width: "100%",
                maxHeight: "100%",
                maxWidth: 500,
                // height: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <FormularioAgregarInventario {...props} onCancel={() => {
                    SPopup.close("FormularioAgregarInventario")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("FormularioAgregarInventario")
                        if (props.onSuccess) props.onSuccess(e)
                    }}

                />
            </SView>
        })
    }

    state = {
        almacenes: [],
    }
    componentDidMount(): void {
        MDL.inventario.getAllAlmacen().then((almacenes: any) => {
            this.setState({ almacenes: Object.values(almacenes) });
        })
    }

    submit() {

        const almacen: any = this.state.almacenes.find((item: any) => item.descripcion === this.almacen);
        if (!almacen) {
            console.error("Almacen no encontrado");
            return;
        }

        const producto = {
            nombre: this.props.editObject.descripcion,
            key_modelo: this.props.editObject.key,
            key_almacen: almacen?.key,
            cantidad: this.cantidad,
            precio_compra: this.props.editObject.precio_compra,
            // precio_venta: this.props.editObject.precio_venta,
            precio: this.props.editObject.precio_venta,
            key_empresa: MDL.empresa.select?.key,
            key_usuario: MDL.usuario.session?.key,
        }
        MDL.inventario.saveProducto(producto).then((resp: any) => {
            console.log("Producto agregado:", resp);
            if (this.props.onSuccess) {
                this.props.onSuccess(resp);
            }
        }).catch((error: any) => {

        })

        console.log("Producto a agregar:", producto);


    }
    cantidad = 0;
    almacen: string = "";
    render() {
        return <SView col={"xs-12"} center padding={16}>
            <SText>{"Agrega productos al inventario."}</SText>
            <SHr h={16} />
            <SView col={"xs-12"} >
                <SText>{this.props.editObject.descripcion}</SText>
            </SView>
            <SView width={120}>
                <SInput type='number' label={"Cantidad"}
                    autoFocus
                    onChangeText={e => {
                        this.cantidad = parseInt(e ?? "0");
                    }}
                    placeholder={0} style={{
                        textAlign: "center",
                    }} />
            </SView>
            <SInput label={"Almacen"} type='select2' options={this.state.almacenes.map((item: any) => item.descripcion)}
                placeholder={"Selecciona el almacen de destino"}
                onChangeText={(e: any) => {
                    this.almacen = e;
                }}
            />
            <SHr h={16} />
            <SHr h={16} />
            <SView row col={"xs-12"}>
                {this.props.onCancel && <>
                    <Btn type='danger' label='CANCELAR' onPress={() => {
                        if (this.props.onCancel) this.props.onCancel()
                    }} />
                    <SView width={8} />
                </>}

                <Btn type='primary' label='GUARDAR' onPress={() => {
                    this.submit();
                    // if (this.form) this.form.submit();
                }} />

            </SView>
        </SView>
    }
}
