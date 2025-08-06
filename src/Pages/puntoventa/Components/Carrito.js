import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { SHr, SImage, SText, STheme, SView, SInput, SScrollView2, SMath, SButtom, SNotification, SNavigation, SIcon, SPopup, SForm, SThread } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import SIconApp from '../../../Assets/SIconApp';
import Model from '../../../Model';
import FotoModelo from './Foto/FotoModelo';
import CarritoItem from './Carrito/CarritoItem';
import ResumenTotales from './Carrito/ResumenTotales';
import TecladoNumerico from './Carrito/TecladoNumerico';
import MDL from '../../../MDL';
export default class Carrito extends Component {
    carrito = [];
    descuentoManual = "";
    showPaymentModal = false;
    data = {};
    amountReceived = "";
    componentDidMount() {
        this.loadData()
        setTimeout(() => {
            this.hanldeEditTelefono();
        }, 100);
    }
    async loadData() {
        const enviroments = await MDL.contabilidad.getEnviroment();
        this._enviromentsIva = parseFloat(enviroments?.IVA?.observacion) / 100;
        this._numeroIva = parseInt(enviroments?.IVA?.observacion);
        this.forceUpdate();
    }
    setCarrito(nuevoCarrito) {
        this.carrito = Array.isArray(nuevoCarrito) ? [...nuevoCarrito] : [];
        this.forceUpdate();
    }
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
    vaciarCarrito() {
        this.carrito.forEach(item => {
            this.props.onModificarStock?.(item.key, +item.cantidad);
        });
        this.descuentoManual = 0;
        this.carrito = [];
        this.data = null;
        this.forceUpdate();
    };
    calcularSubtotal = () => this.carrito.reduce((t, i) => t + i.precio_venta * i.cantidad, 0);
    calcularTotalConIVA = (subtotal) => {
        if (!this._enviromentsIva) return subtotal;
        if (this.conFactura) {
            return subtotal * (1 + this._enviromentsIva);
        } else {
            return subtotal;
        }
        this.forceUpdate()
    };
    calcularIVA = (subtotal) => {
        if (!this._enviromentsIva) return 0;
        return subtotal * this._enviromentsIva;
    };
    calcularTotalConDescuento = (total) => total - parseFloat(this.descuentoManual || "0");
    getCarrito = () => this.carrito;
    getCarritoimprimir() {
        return this.carrito;
    }
    renderPaymentModal = () => {
        if (!this.showPaymentModal) return null;
        const subtotal = this.calcularSubtotal();
        const totalConIVA = this.calcularTotalConIVA(subtotal);
        const totalImpueso = this.calcularIVA(subtotal);
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
                this.showPaymentModal = false;
                this.amountReceived = "";
                this.carrito = [];
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
                        shadowColor: STheme.color.card,
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
    hanldeEditTelefono = () => {
        MDL.crm.cliente.buscar_nit(this.form?.getValues().nit).then(e => {
            this.clienteDataCompleto = e;
            this.form?.setValues({
                razon_social: e?.razon_social || "",
                correo: e?.correo || "",
                nombres: e?.nombres || "",
            })
            this.forceUpdate()
        }).catch(e => {
            this.form?.setValues({
                razon_social: "",
                correo: "",
                nombres: "",
            })
            console.log(e)
        })
    }
    form: SForm | null = null;
    seleccionarCliente() {
        let formRef;
        const defaultData = this.data?.cliente ?? {};
        SPopup.open({
            key: "PopupClienteManual",
            type: 1,
            content: (
                <SView
                    col="xs-11"
                    withoutFeedback
                    padding={24}
                    backgroundColor={STheme.color.background}
                    style={{
                        maxWidth: 320,
                        borderRadius: 12,
                        shadowColor: "#18181b",
                        shadowOffset: { width: 5, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 60,
                    }}
                >
                    <SText fontSize={18} bold center>Datos del Cliente</SText>
                    { }
                    <SForm row ref={(ref: any) => this.form = ref}
                        style={{ justifyContent: "space-between" }}
                        inputs={{
                            nit: {
                                col: "xs-12",
                                label: "Nit",
                                type: 'number',
                                backgroundColor: "red",
                                background: "blue",
                                borderColor: "red",
                                required: true,
                                autoFocus: true,
                                defaultValue: defaultData?.nit,
                                iconR: <SView width={30} height={30} center onPress={() => {
                                    this.hanldeEditTelefono();
                                }}>
                                    <SIconApp name='Search' fill={STheme.color.lightGray} />
                                </SView>,
                                onChangeText: (text: string) => {
                                    new SThread(2000, "buscar_nit", true).start(() => {
                                        this.hanldeEditTelefono();
                                    })
                                },
                                onSubmitEditing: () => {
                                    this.hanldeEditTelefono();
                                    this.form?.focus("razon_social")
                                }
                            },
                            razon_social: {
                                col: "xs-12",
                                disabled: true,
                                label: "razon social",
                                defaultValue: defaultData?.razon_social,
                                onSubmitEditing: () => this.form?.focus("correo"),
                            },
                            correo: {
                                col: "xs-12",
                                label: "Correo",
                                disabled: true,
                                defaultValue: defaultData?.correo,
                                onSubmitEditing: () => this.form?.focus("nombres"),
                            },
                            nombres: {
                                col: "xs-12",
                                disabled: true,
                                label: "Nombre completo",
                                defaultValue: defaultData?.nombres,
                            },
                        }} />
                    <SHr />
                    <SView row col={"xs-12"}>
                        <SView flex />
                        <SView center style={{ borderColor: STheme.color.card, borderWidth: 2, borderRadius: 4, width: 90, height: 32 }} >
                            <SText color={STheme.color.text}>Cancelar</SText>
                        </SView>
                        <SView width={8} />
                        <SView center style={{ backgroundColor: "#18181b", borderColor: STheme.color.gray, borderWidth: 2, borderRadius: 4, width: 90, height: 32 }}
                            onPress={() => {
                                const data = this.clienteDataCompleto;
                                if (!data) return;
                                this.data.cliente = data;
                                this.clienteDataCompleto = null;
                                this.forceUpdate();
                                SPopup.close("PopupClienteManual");
                            }}
                        >
                            <SText color={STheme.color.background}>Aceptarsss</SText>
                        </SView>
                    </SView>
                </SView>
            )
        });
    }
    renderCarrito = () => {
        const subtotal = this.calcularSubtotal();
        const totalConIVA = this.calcularTotalConIVA(subtotal);
        const totalImpuesto = this.calcularIVA(subtotal);
        const totalDescuento = this.descuentoManual || 0;
        const totalFinal = this.calcularTotalConDescuento(totalConIVA);
        const carro = this.getCarrito();
        return (
            <>
                {subtotal <= 0 ?
                    <SView backgroundColor={STheme.color.background} flex center style={{ borderRadius: 8, shadowColor: STheme.color.card, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
                    >
                        <SView row center backgroundColor='transparent' >
                            <SIconApp name='carritoproducto' height={50} fill={STheme.color.card} />
                            <SText fontSize={12} color={STheme.color.card}>Comience a agregar productos</SText>
                        </SView>
                    </SView>
                    :
                    <SView backgroundColor={STheme.color.background} flex style={{ borderRadius: 8, shadowColor: "#000", shadowOffset: { width: 0, }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }} >
                        <SView col={"xs-12"} row   >
                            <SView col={"xs-10 md-10"} row  >
                                <SText fontSize={16} bold color={STheme.color.text}>Detalle venta</SText>
                            </SView>
                            <SView col={"xs-2 md-2"} backgroundColor='transparent' row center onPress={() => this.vaciarCarrito()} >
                                <SView backgroundColor={STheme.color.card} border={STheme.color.text} style={{ borderRadius: 2, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, height: 24, opacity: 0.6 }}>
                                    <SText fontSize={12} center color={STheme.color.text}>Vaciar</SText>
                                </SView>
                            </SView>
                        </SView>
                        <SHr height={4} />
                        { }
                        <SView col={"xs-12"} flex center backgroundColor='transparent'
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                borderWidth: 1,
                                borderColor: "#F3F4F6",
                            }}
                        >
                            <SScrollView2 disableHorizontal>
                                <FlatList data={this.carrito} keyExtractor={(item) => item.key.toString()} renderItem={this.renderItemCarrito} />
                            </SScrollView2>
                        </SView>
                        <SHr height={8} />
                        <ResumenTotales subtotal={subtotal} totalImpuesto={totalImpuesto} numeroIva={this._numeroIva} totalDescuento={totalDescuento} totalFinal={totalFinal}  ></ResumenTotales>
                        { }
                        <SView col={"xs-12"} height={70} center >
                            <SInput label={"Descuento VIP (Bs):"} placeholder={"0"} defaultValue={this.descuentoManual ?? null} type='number' border={STheme.color.card} style={{ backgroundColor: "transparent", }}
                                onChangeText={(text) => {
                                    this.descuentoManual = text;
                                    this.forceUpdate();
                                }}
                            />
                        </SView>
                        { }
                        <SView col={"xs-12"} height={50} center  >
                            <SInput label={"Con factura ?"} type='checkBox' defaultValue={false}
                                onChangeText={(text) => {
                                    this.conFactura = text;
                                    this.forceUpdate();
                                }}
                            />
                        </SView>
                        <SHr height={8} />
                        { }
                        <SView col={"xs-12 md-0"} center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ height: 44, borderRadius: 2, margin: 2 }}>
                            <SView col={"xs-12  "} row center
                                onPress={() => this.seleccionarCliente()}
                            >
                                <SView col={"xs-5 md-5"}    >
                                    <SView center backgroundColor={STheme.color.background} style={{
                                        minWidth: 10, width: 30, minHeight: 10, height: 30, borderRadius: 18, margin: 4,
                                        marginRight: (this.data?.cliente?.key ? 6 : 14), overflow: "hidden",
                                    }}>
                                        { }
                                    </SView>
                                </SView>
                                <SView flex  >
                                    <SText style={{
                                        color: STheme.color.text,
                                        fontSize: 12,
                                        fontWeight: "bold", fontSize: 12
                                    }}>{this.data?.cliente?.nombres || "Clientes"}</SText>
                                </SView>
                            </SView>
                        </SView>
                    </SView>
                }
                <TecladoNumerico data={{ cliente: this.data?.cliente }} carrito={this.getCarritoimprimir()} carritonuevo={this.carritonuevo} numeroIva={this._numeroIva} totalImpuesto={totalImpuesto}
                    descuento={totalDescuento} totalFinal={totalFinal} conFactura={this.conFactura} subtotal={subtotal}
                    onReload={() => { this.vaciarCarrito(); }}
                />
            </>
        );
    };
    render() {
        return <>
            {this.renderCarrito()}
        </>
    }
}
