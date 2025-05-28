import React, { Component } from 'react';
import { SHr, SImage, SInput, SLoad, SMath, SNavigation, SPage, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import { Container } from '../../Components';
import ListaSubProductos from './Components/ListaSubProductos';
import Model from '../../Model';
import { Vibration } from 'react-native';

class index extends Component {
    // static TOPBAR =

    constructor(props) {
        super(props);
        this.state = {
            cantidad: 1
        };
        this.params = SNavigation.getAllParams();
    }


    render() {
        let producto = this.params;
        const productos = Model?.carrito?.Action.getState().productos ?? {};
        let arrCarrito = Object.values(productos).filter(a => a.key_producto == producto.key);
        let cantidad = 0;
        arrCarrito.map(a => cantidad += (a?.cantidad ?? 0))

        // console.log(producto);
        return (
            <SPage >
                <Container>
                    <SView col="xs-12" height={200} card>
                        <SImage enablePreview src={SSocket.api.root + "producto/" + producto.key + "?time=" + new Date().getTime()} style={{
                            resizeMode: "cover"
                        }} />
                    </SView>
                    <SHr />
                    <SView col={"xs-12"}>
                        <SText fontSize={20} font='Montserrat-Bold'>{producto.nombre}</SText>
                        <SHr />
                        <SText>{producto.descripcion}</SText>
                        <SHr />
                        <SText fontSize={20} font='Montserrat-Bold'>Bs. {SMath.formatMoney(producto?.precio - (producto?.precio * (producto?.descuento_porcentaje ?? 0)) - (producto.descuento_monto ?? 0))}</SText>
                    </SView>
                    <SHr />
                    <SHr h={1} color={STheme.color.lightGray} />
                    <ListaSubProductos ref={ref => this.lsp = ref} data={producto.sub_productos} onChange={(e) => {
                        this.state.categorias = e.categorias;
                        console.log(e);
                    }} />

                    <SHr h={30} />
                    <SHr />
                    <SText color={STheme.color.danger}>{this.state.error}</SText>
                    <SHr />
                    <SText col={"xs-12"} color={STheme.color.text} font='Montserrat-Bold' fontSize={17}>{"¿Cuántos querés?"}</SText>
                    <SHr />
                    <SView col={"xs-12"} row>

                        <SView
                            width={140}
                            height={40}
                            borderRadius={8}
                            style={{
                                borderWidth: 1,
                                borderColor: STheme.color.gray
                            }}
                            center
                            row
                        >
                            <SView width={40} height center onPress={() => {
                                if (this.state.cantidad <= 1) {
                                    this.state.cantidad = 1;
                                    return;
                                }
                                this.setState({ cantidad: this.state.cantidad - 1 })
                            }}>
                                <SText color={STheme.color.text} bold fontSize={30}>{"-"}</SText>
                            </SView>
                            <SView flex height center>
                                <SText center fontSize={20}>{this.state.cantidad}</SText>
                            </SView>
                            <SView width={40} height center onPress={() => {
                                if (!!producto.limite_compra && (cantidad + this.state.cantidad + 1) > producto.limite_compra) return;
                                this.setState({ cantidad: this.state.cantidad + 1 })
                            }}>
                                <SText color={STheme.color.text} bold fontSize={30} >{"+"}</SText>
                            </SView>
                        </SView>


                        <SView flex />
                        <SView backgroundColor={STheme.color.secondary}
                            width={140}
                            height={40}
                            borderRadius={8}
                            center
                            onPress={() => {
                                Vibration.vibrate(300);
                                this.setState({ loading: true })
                                new SThread(1000, "awaitEndAnim").start(() => {
                                    let monto_total_subproducto_detalle = 0;
                                    let carrito_producto = {
                                        ...producto
                                    }
                                    delete carrito_producto["sub_productos"];


                                    let sub_productos = Object.values(this.state.categorias ?? {}).map((sp) => {
                                        console.log(sp);
                                        if (sp.detalle) {
                                            sp.sub_producto_detalle = Object.values(sp.detalle);
                                        }

                                        sp.sub_producto_detalle.map(spd => {
                                            monto_total_subproducto_detalle += (spd.precio * spd.cantidad) * this.state.cantidad;
                                        })
                                        delete sp["detalle"];
                                        return sp;
                                    })

                                    carrito_producto.sub_productos = sub_productos;
                                    carrito_producto.monto_total_subproducto_detalle = monto_total_subproducto_detalle



                                    let valid = true;
                                    this.state.error = "";
                                    producto.sub_productos.map(subpv => {
                                        const { cantidad_seleccion, cantidad_seleccion_minima } = subpv;
                                        const del_carrito = carrito_producto.sub_productos.find(a => a.key_sub_producto == subpv.key);
                                        let sc = 0;
                                        if (del_carrito) {
                                            if (del_carrito.sub_producto_detalle) {
                                                del_carrito.sub_producto_detalle.map(a => sc += a.cantidad)
                                            }
                                        }

                                        if (cantidad_seleccion_minima && (!del_carrito || sc < cantidad_seleccion_minima)) {
                                            valid = false;
                                            console.error("Sub producto requerido.", subpv)
                                            let error = `Debe seleccionar mínimo ${cantidad_seleccion_minima} ${subpv.nombre}`;
                                            if (this?.lsp?.setError) this.lsp.setError(subpv.key, error)
                                            this.state.error = (this.state.error ?? "") + "\n" + error;
                                            this.setState({ error: this.state.error })
                                        } else {
                                            if (this?.lsp?.setError) this.lsp.setError(subpv.key, "")
                                        }
                                        console.log("del_carrito", del_carrito)
                                    })

                                    if (!valid) {
                                        this.setState({ loading: false })
                                        return
                                    };
                                    // console.log(producto.sub_productos);
                                    // console.log(carrito_producto.sub_productos);
                                    // return;
                                    let key = SUuid();
                                    Model.carrito.Action.setItem(key, { key: key, key_producto: carrito_producto.key, cantidad: this.state.cantidad, data: carrito_producto })
                                    this.setState({ loading: false })
                                    SNavigation.goBack();
                                })
                            }}
                        >
                            {this.state.loading ? <SLoad /> : <SText color={STheme.color.primary} font='Montserrat-Bold' fontSize={18}>AGREGAR</SText>}

                        </SView>
                    </SView>

                    <SHr h={50} />
                </Container>
            </SPage >
        );
    }
}
export default (index);
