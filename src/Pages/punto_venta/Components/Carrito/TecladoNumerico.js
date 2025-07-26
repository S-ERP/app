// TecladoNumerico.js
import React, { Component } from 'react';
import { SView, SText, STheme, SNavigation } from 'servisofts-component';
// import FotoCliente from './FotoCliente'; // Asegúrate de que este componente exista e importe correctamente
import FotoCliente from '../Foto/FotoCliente';
import Model from '../../../../Model';

export default class TecladoNumerico extends Component {
    constructor(props) {
        super(props);
        this.data = props.data;
        this.carrito = props.carrito;
    }

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
                    <SView center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ height: 44, borderRadius: 2, margin: 2 }}>
                        <SView row center onPress={() => this.seleccionarCliente()}>
                            <SView center backgroundColor={STheme.color.background} style={{
                                width: 30, height: 30, borderRadius: 18, margin: 4,
                                marginRight: (key_cliente ? 6 : 14), overflow: "hidden",
                            }}>
                                <FotoCliente data={cliente} />
                            </SView>
                            <SView>
                                <SText style={{ ...style_text, fontSize: 12 }}>{nombres || "Cliente"}</SText>
                                {key_cliente ? <SText style={{ ...style_text, fontSize: 12, color: "#26e9aeff" }}>Cliente Vip</SText> : null}
                            </SView>
                        </SView>
                    </SView>

                    <SView center flex backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ borderRadius: 2, margin: 2 }} onPress={() => {
                        const datos = this.dataFormateada({
                            carrito: this.carrito,
                            cliente: this.data?.cliente,
                            vendedor: Model.usuario.Action.getUsuarioLog()
                        });
                        console.log("🧾 Venta Formateada:");
                        console.log(JSON.stringify(datos, null, 2));
                    }}>
                        <SText style={{ ...style_text, textTransform: 'uppercase' }}>Pagar</SText>
                    </SView>
                </SView>

                <SView col={"xs-8"}>
                    {teclas.map((fila, i) => (
                        <SView key={i} row>
                            {fila.map((t, j) => (
                                <SView key={j} flex center backgroundColor={STheme.color.darkGray} border={STheme.color.card}
                                    style={{ height: 44, borderRadius: 2, margin: 2 }}
                                    onPress={() => this.handleCalculatorPress(t)} >
                                    <SText style={style_text}>{t}</SText>
                                </SView>
                            ))}
                        </SView>
                    ))}
                </SView>
            </SView>
        );
    };

    render() {
        return this.renderTecladoNumerico();
    }
}
