import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { SHr, SImage, SText, STheme, SView, SInput, SScrollView2, SMath, SButtom, SNotification, SNavigation } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import SIconApp from '../../../Assets/SIconApp';
import Model from '../../../Model';
import FotoCliente from './Foto/FotoCliente';
import FotoModelo from './Foto/FotoModelo';
import CarritoItem from './Carrito/CarritoItem';
import ModalPago from './Carrito/ModalPago';
import ResumenTotales from './Carrito/ResumenTotales';
import TecladoNumerico from './Carrito/TecladoNumerico';


export default class Carrito extends Component {
    carrito = [];
    descuentoManual = "";
    showPaymentModal = false;
    data = {};
    amountReceived = "";



    addProducto = (producto) => {
        const index = this.carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) {
            this.carrito[index].cantidad += 1;
            this.carrito[index].stock = producto.stock;
        }
        else this.carrito.push({ ...producto, cantidad: 1 });
        this.forceUpdate();
    };
    aumentarCantidad = (producto) => {
        const index = this.carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) {
            const success = this.props.onModificarStock?.(producto.key, -1);
            if (success === false) return alert("No hay más stock disponible");
            this.carrito[index].cantidad += 1;
            this.carrito[index].stock -= 1;
            this.forceUpdate();
        }
    };
    disminuirCantidad = (producto) => {
        const index = this.carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) {
            this.carrito[index].cantidad -= 1;
            this.carrito[index].stock += 1;
            this.props.onModificarStock?.(producto.key, +1);
            if (this.carrito[index].cantidad <= 0) this.carrito.splice(index, 1);
            this.forceUpdate();
        }
    };
    eliminarItem = (producto) => {
        const index = this.carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) {
            this.props.onModificarStock?.(producto.key, +this.carrito[index].cantidad);
            this.carrito.splice(index, 1);
            this.forceUpdate();
        }
    };
    vaciarCarrito = () => {
        this.carrito.forEach(item => {
            this.props.onModificarStock?.(item.key, +item.cantidad);
        });
        this.carrito = [];
        this.forceUpdate();
    };

    calcularSubtotal = () => this.carrito.reduce((t, i) => t + i.precio_venta * i.cantidad, 0);
    calcularTotalConIVA = (subtotal) => subtotal * 1.15;
    calcularTotalConDescuento = (total) => total - parseFloat(this.descuentoManual || "0");

    handleCalculatorPress = (tecla) => {
        let val = this.descuentoManual || "";
        switch (tecla) {
            case "<": val = val.slice(0, -1); break;
            case "+/-": val = val.startsWith("-") ? val.slice(1) : "-" + val; break;
            case ".": if (!val.includes(".")) val += "."; break;
            case "Cant": case "% de desc.": case "Precio": return;
            default: if (/^\d$/.test(tecla)) val += tecla;
        }
        this.descuentoManual = val;
        this.forceUpdate();
    };



    renderPaymentModal = () => {

        if (!this.showPaymentModal) return null;

        const subtotal = this.calcularSubtotal();
        const totalConIVA = this.calcularTotalConIVA(subtotal);
        const totalFinal = this.calcularTotalConDescuento(totalConIVA);

        const montoRecibido = parseFloat(this.amountReceived || 0);
        const change = isNaN(montoRecibido) ? 0 : montoRecibido - totalFinal;

        const handleConfirmarPago = () => {
            if (change >= 0) {
                SNotification.send({
                    title: "Pago Exitoso",
                    body: `Cambio: Bs ${SMath.formatMoney(change, 2)}`,
                    type: "success",
                });

                console.log("🧾 Pago confirmado. Total:", totalFinal);
                console.log("🛒 Carrito guardado:", JSON.stringify(this.carrito, null, 2));

                this.carrito = [];
                this.showPaymentModal = false;
                this.amountReceived = "";
                this.forceUpdate();
            } else {
                SNotification.send({
                    title: "Monto insuficiente",
                    body: "El monto recibido es menor al total a pagar.",
                    type: "danger",
                });
            }
        };

        return (
            <SView
                col={"xs-12"}
                height={"100%"}
                center
                style={{
                    position: "absolute",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    zIndex: 1000,
                }}
            >
                <SView
                    width={400}
                    height={320}
                    backgroundColor={STheme.color.background}
                    style={{
                        borderRadius: 12,
                        padding: 24,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 6,
                    }}
                >
                    <SText fontSize={20} bold center  >  Confirmar Pago    </SText>
                    <SView height={20} />

                    <SView row style={{ justifyContent: "space-between", marginBottom: 12 }}>
                        <SText fontSize={16} color={STheme.color.text}>Total a Pagar:</SText>
                        <SText fontSize={18} bold color={STheme.color.warning}>
                            Bs {SMath.formatMoney(totalFinal, 2)}
                        </SText>
                    </SView>

                    <SView row borderColor={"transparent"} >
                        <SText fontSize={14} color={STheme.color.text}>Monto Recibido:</SText>
                        <SInput
                            value={this.amountReceived}
                            onChangeText={(text) => {
                                this.amountReceived = text;
                                this.forceUpdate();
                            }}
                            type='number'
                            // keyboardType="numeric"
                            placeholder="Ej. 100.00"
                            style={{
                                height: 48,
                                fontSize: 20,
                                textAlign: "center",
                                borderWidth: 1,
                                borderColor: STheme.color.card,
                                borderRadius: 4,
                                marginTop: 8,
                                color: STheme.color.text,
                                backgroundColor: "transparent"
                            }}
                        />
                    </SView>
                    <SView height={20} />


                    <SView row style={{ justifyContent: "space-between", marginBottom: 40 }}>
                        <SText fontSize={16} color={STheme.color.text}>Cambio:</SText>
                        <SText fontSize={18} bold color={change >= 0 ? STheme.color.success : STheme.color.danger}>
                            Bs {SMath.formatMoney(change, 2)}
                        </SText>
                    </SView>

                    <SView row style={{ justifyContent: "space-around" }}>
                        <SButtom
                            // width={70}
                            onPress={() => {
                                this.showPaymentModal = false;
                                this.amountReceived = "";
                                this.forceUpdate();
                            }}
                            style={{
                                backgroundColor: STheme.color.lightGray,
                                paddingVertical: 12,
                                paddingHorizontal: 24,
                                borderRadius: 4,
                                width: 150
                            }}
                        >
                            <SText color={STheme.color.text}>Cancelar</SText>
                        </SButtom>

                        <SButtom
                            onPress={handleConfirmarPago}
                            style={{
                                backgroundColor: STheme.color.text,
                                paddingVertical: 12,
                                paddingHorizontal: 24,
                                borderRadius: 4,
                                width: 150
                            }}
                        >
                            <SText color={STheme.color.white}>Confirmar Pago</SText>
                        </SButtom>
                    </SView>
                </SView>
            </SView>
        );
    };

    renderItemCarrito = ({ item }) => (
        <CarritoItem
            item={item}
            onAumentar={() => this.aumentarCantidad(item)}
            onDisminuir={() => this.disminuirCantidad(item)}
            onEliminar={() => this.eliminarItem(item)}
        />
    );


    renderSubtotal() {

        const subtotal = this.calcularSubtotal();
        const totalConIVA = this.calcularTotalConIVA(subtotal);
        const totalFinal = this.calcularTotalConDescuento(totalConIVA);
        return (
            <SView col={"xs-12"} border={STheme.color.card} style={{ borderRadius: 2, padding: 16, marginBottom: 8, }} height={80}>
                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <SText fontSize={13} color={STheme.color.darkGray}>Subtotal:</SText>
                    <SText fontSize={14} bold color={STheme.color.darkGray}>Bs {SMath.formatMoney(subtotal, 2)}</SText>
                </SView>
                <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                    <SText fontSize={12} color={STheme.color.darkGray}>Impuesto:</SText>
                    <SText fontSize={13} color={STheme.color.darkGray}>Sumar Iva13%  Bs {SMath.formatMoney(totalConIVA, 2)}</SText>
                </SView>
                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <SText fontSize={13} color={STheme.color.darkGray}>Total:</SText>
                    <SText fontSize={16} bold color={STheme.color.darkGray}>Bs {SMath.formatMoney(totalFinal, 2)}</SText>
                </SView>
            </SView>
        )
    }

    seleccionarCliente() {
        SNavigation.navigate("/cliente", {
            onSelect: (obj) => {
                var cliente = {
                    key: obj.key,
                    nombres: obj.nombres ?? "",
                    apellidos: obj.apellidos ?? "",
                    telefono: obj.telefono ?? "",
                    nombre_completo: `${obj.nombres ?? ""} ${obj.apellidos ?? ""}`.trim()
                }
                this.data.cliente = cliente;
                this.forceUpdate();

            }
        })
    }

    dataFormateada({ carrito = [], cliente = null, vendedor = null }) {
        const carritoFormateado = carrito.map(item => ({
            key: item.key,
            descripcion: item.descripcion,
            precio_compra: item.precio_compra ?? 0,
            precio_venta: item.precio_venta ?? 0,
            stock: item.stock ?? 0,
            cantidad: item.cantidad ?? 0,
            key_marca: item.key_marca ?? null,
            marca_descripcion: item.marca?.descripcion ?? null,
            key_tipo_producto: item.key_tipo_producto ?? null,
            tipo_producto: item.tipo_producto?.descripcion ?? null,
        }));

        const clienteFormateado = cliente ? {
            key: cliente.key ?? null,
            nombre_completo: cliente.nombre_completo ?? `${cliente.nombres ?? ""} ${cliente.apellidos ?? ""}`.trim(),
            telefono: cliente.telefono ?? null,
        } : null;

        const vendedorFormateado = vendedor ? {
            key: vendedor.key ?? null,
            nombre_completo: `${vendedor.Nombres ?? ""} ${vendedor.Apellidos ?? ""}`.trim(),
            correo: vendedor.Correo ?? null,
            telefono: vendedor.Telefono ?? null,
        } : null;

        return {
            carrito: carritoFormateado,
            cliente: clienteFormateado,
            vendedor: vendedorFormateado,
        };
    }

    dataSinFormateada({ carrito = [], cliente = null, vendedor = null }) {
        return {
            carrito,
            cliente,
            vendedor,
        };
    }


    renderTecladoNumerico = () => {

        const cliente = this.data.cliente ?? {};
        const { nombre_completo, key_cliente, nombres } = cliente;


        const style_text = {
            color: STheme.color.text,
            fontSize: 12,
            fontWeight: "bold",
        };


        const teclas = [
            ["1", "2", "3", "Cant"],
            ["4", "5", "6", "% de desc."],
            ["7", "8", "9", "Precio"],
            ["+/-", "0", ".", "<"]
        ];

        return (
            <SView col={"xs-12"} row color={STheme.color.danger}>
                <SView col={"xs-4"}>
                    <SView center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ height: 44, borderRadius: 2, margin: 2, }} >

                        <SView row center onPress={() => { this.seleccionarCliente() }}     >
                            <SView center backgroundColor={STheme.color.background} style={{ width: 30, height: 30, borderRadius: 18, margin: 4, marginRight: (key_cliente ? 6 : 14), overflow: "hidden", }}>
                                <FotoCliente data={cliente} ></FotoCliente>
                            </SView>
                            <SView>
                                <SText style={{ ...style_text, fontSize: 12 }}>{nombres || "Cliente"}</SText>
                                {key_cliente ? <SText style={{ ...style_text, fontSize: 12, color: "#26e9aeff" }}>Cliente Vip</SText> : null}
                            </SView>
                        </SView>


                    </SView>


                    <SView center flex backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ borderRadius: 2, margin: 2, }} onPress={() => {
                        // this.showPaymentModal = true;
                        // this.forceUpdate();


                        const datos = this.dataFormateada({ carrito: this.carrito, cliente: this.data?.cliente, vendedor: Model.usuario.Action.getUsuarioLog() });
                        console.log("🧾 Venta Formateada:");
                        console.log(JSON.stringify(datos, null, 2));

                    }}  >
                        <SText style={{ ...style_text, textTransform: 'uppercase' }}>Pagar</SText>

                    </SView>
                </SView>

                <SView col={"xs-8"}>
                    {teclas.map((fila, i) => (
                        <SView key={i} row  >
                            {fila.map((t, j) => (
                                <SView key={j} flex center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ height: 44, borderRadius: 2, margin: 2, }}
                                    onPress={() => this.handleCalculatorPress(t)}
                                >
                                    <SText style={style_text}>{t}</SText>
                                </SView>
                            ))}
                        </SView>
                    ))}
                </SView>
            </SView>
        );
    };

    renderCarrito = () => {
        const subtotal = this.calcularSubtotal();
        const totalConIVA = this.calcularTotalConIVA(subtotal);
        const totalFinal = this.calcularTotalConDescuento(totalConIVA);

        return (
            <>



                {subtotal <= 0 ?
                    <SView backgroundColor={STheme.color.background} flex center style={{ borderRadius: 8, marginBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
                    >
                        <SView row center backgroundColor='transparent' >
                            <SIconApp name='carritoproducto' height={50} fill={STheme.color.card} />
                            <SText fontSize={12} color={STheme.color.card}>Comience a agregar productos</SText>
                        </SView>
                    </SView>

                    :
                    <SView backgroundColor={STheme.color.background} flex style={{ borderRadius: 8, marginBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }} >
                        <SView col={"xs-12"} row style={{ marginBottom: 8 }} >
                            <SView flex row  >
                                <SText fontSize={16} bold color={STheme.color.text}>Orden Actual</SText>
                            </SView>

                            <SView col={"xs-1"} row center onPress={() => this.vaciarCarrito()} >
                                <SView backgroundColor="purple" style={{ borderRadius: 8, padding: 5, height: 24 }}>
                                    <SText fontSize={12} color={STheme.color.text}>Vaciar</SText>
                                </SView>
                            </SView>
                        </SView>

                        <SView col={"xs-12"} flex center backgroundColor='transparent'>
                            <SScrollView2 disableHorizontal>
                                <FlatList data={this.carrito} keyExtractor={(item) => item.key.toString()} renderItem={this.renderItemCarrito} />
                            </SScrollView2>
                        </SView>
                        <SHr height={20} />
                        <ResumenTotales subtotal={subtotal} totalConIVA={totalConIVA} totalFinal={totalFinal}  ></ResumenTotales>
                        <SView col={"xs-12"} style={{ marginTop: 8 }}>
                            <SText>Descuento VIP (Bs):</SText>
                            <SInput placeholder={"0"} value={this.descuentoManual ?? null} type='number' border={STheme.color.card} style={{ backgroundColor: "transparent", }}
                                onChangeText={(text) => {
                                    this.descuentoManual = text;
                                    this.forceUpdate();
                                }}
                            />
                        </SView>
                    </SView>
                }


                <TecladoNumerico data={{ cliente: this.data?.cliente }} carrito={this.carrito}   />
                {/* {this.renderTecladoNumerico()} */}
            </>
        );
    };

    render() {
        return <>
            {this.renderCarrito()}
            {this.renderPaymentModal()}

        </>
    }
}
