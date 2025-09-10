import React, { Component } from 'react';
import { SView, SPage, SText, SHr, SScrollView2, STheme, SDate, SMath } from 'servisofts-component';
import SIconApp from '../../Assets/SIconApp';
import PopupPagoCuota from './Components/PopupPagoCuota3';
import MDL from '../../MDL';
import Model from '../../Model';

const data = {
    proveedor: {
        id: 1,
        nombre: "Distribuidora Central S.A.",
        ruc: "20123456789",
        telefono: "+51 987 654 321",
        direccion: "Av. Principal 123 - Lima",
        deudaTotal: 24233.31, // Sum of unpaid cuotas in 2025 (calculated below)
        limiteCredito: 150000.00,
        comprasPendientes: 5, // 5 purchases with pending cuotas
        ultimoPago: {
            fecha: "2025-03-14",
            monto: 5000.00,
            referencia: "Transferencia bancaria BCP #123456"
        }
    },
    compras: [
        {
            id: 101,
            descripcion: "Productos de limpieza y mantenimiento",
            fecha: "2024-12-01",
            total: 8500.00,
            estado: "Pendiente",
            cuotas: 12,
            metodoPago: "Transferencia",
            cuotasDetalle: [
                { numero: 1, monto: 708.33, vencimiento: "2025-01-14", fechaPago: "2025-01-13", estado: "Pagado" },
                { numero: 2, monto: 708.33, vencimiento: "2025-02-14", fechaPago: "2025-02-13", estado: "Pagado" },
                { numero: 3, monto: 708.33, vencimiento: "2025-03-14", fechaPago: "2025-03-13", estado: "Pagado" },
                { numero: 4, monto: 708.33, vencimiento: "2025-04-14", fechaPago: null, estado: "Vencido" },
                { numero: 5, monto: 708.33, vencimiento: "2025-05-14", fechaPago: null, estado: "Vencido" },
                { numero: 6, monto: 708.33, vencimiento: "2025-06-14", fechaPago: null, estado: "Vencido" },
                { numero: 7, monto: 708.33, vencimiento: "2025-07-14", fechaPago: null, estado: "Pendiente" },
                { numero: 8, monto: 708.33, vencimiento: "2025-08-14", fechaPago: null, estado: "Pendiente" },
                { numero: 9, monto: 708.33, vencimiento: "2025-09-14", fechaPago: null, estado: "Pendiente" },
                { numero: 10, monto: 708.33, vencimiento: "2025-10-14", fechaPago: null, estado: "Pendiente" },
                { numero: 11, monto: 708.33, vencimiento: "2025-11-14", fechaPago: null, estado: "Pendiente" },
                { numero: 12, monto: 708.37, vencimiento: "2025-12-14", fechaPago: null, estado: "Pendiente" } // Adjusted for rounding
            ]
        },
        {
            id: 102,
            descripcion: "Suministros de oficina",
            fecha: "2024-12-05",
            total: 7250.00,
            estado: "Pendiente",
            cuotas: 10,
            metodoPago: "Tarjeta de crédito",
            cuotasDetalle: [
                { numero: 1, monto: 725.00, vencimiento: "2025-01-19", fechaPago: "2025-01-18", estado: "Pagado" },
                { numero: 2, monto: 725.00, vencimiento: "2025-02-19", fechaPago: "2025-02-18", estado: "Pagado" },
                { numero: 3, monto: 725.00, vencimiento: "2025-03-19", fechaPago: null, estado: "Vencido" },
                { numero: 4, monto: 725.00, vencimiento: "2025-04-19", fechaPago: null, estado: "Vencido" },
                { numero: 5, monto: 725.00, vencimiento: "2025-05-19", fechaPago: null, estado: "Vencido" },
                { numero: 6, monto: 725.00, vencimiento: "2025-06-19", fechaPago: null, estado: "Vencido" },
                { numero: 7, monto: 725.00, vencimiento: "2025-07-19", fechaPago: null, estado: "Pendiente" },
                { numero: 8, monto: 725.00, vencimiento: "2025-08-19", fechaPago: null, estado: "Pendiente" },
                { numero: 9, monto: 725.00, vencimiento: "2025-09-19", fechaPago: null, estado: "Pendiente" },
                { numero: 10, monto: 725.00, vencimiento: "2025-10-19", fechaPago: null, estado: "Pendiente" }
            ]
        },
        {
            id: 103,
            descripcion: "Muebles de oficina",
            fecha: "2024-12-10",
            total: 12000.00,
            estado: "Pendiente",
            cuotas: 8,
            metodoPago: "Cheque",
            cuotasDetalle: [
                { numero: 1, monto: 1500.00, vencimiento: "2025-01-25", fechaPago: "2025-01-24", estado: "Pagado" },
                { numero: 2, monto: 1500.00, vencimiento: "2025-02-25", fechaPago: "2025-02-24", estado: "Pagado" },
                { numero: 3, monto: 1500.00, vencimiento: "2025-03-25", fechaPago: "2025-03-24", estado: "Pagado" },
                { numero: 4, monto: 1500.00, vencimiento: "2025-04-25", fechaPago: null, estado: "Vencido" },
                { numero: 5, monto: 1500.00, vencimiento: "2025-05-25", fechaPago: null, estado: "Vencido" },
                { numero: 6, monto: 1500.00, vencimiento: "2025-06-25", fechaPago: null, estado: "Vencido" },
                { numero: 7, monto: 1500.00, vencimiento: "2025-07-25", fechaPago: null, estado: "Pendiente" },
                { numero: 8, monto: 1500.00, vencimiento: "2025-08-25", fechaPago: null, estado: "Pendiente" }
            ]
        },
        {
            id: 109,
            descripcion: "Software empresarial",
            fecha: "2024-12-15",
            total: 18000.00,
            estado: "Pendiente",
            cuotas: 15,
            metodoPago: "Transferencia",
            cuotasDetalle: [
                { numero: 1, monto: 1200.00, vencimiento: "2025-01-30", fechaPago: "2025-01-29", estado: "Pagado" },
                { numero: 2, monto: 1200.00, vencimiento: "2025-02-28", fechaPago: "2025-02-27", estado: "Pagado" },
                { numero: 3, monto: 1200.00, vencimiento: "2025-03-30", fechaPago: null, estado: "Vencido" },
                { numero: 4, monto: 1200.00, vencimiento: "2025-04-30", fechaPago: null, estado: "Vencido" },
                { numero: 5, monto: 1200.00, vencimiento: "2025-05-30", fechaPago: null, estado: "Vencido" },
                { numero: 6, monto: 1200.00, vencimiento: "2025-06-30", fechaPago: null, estado: "Vencido" },
                { numero: 7, monto: 1200.00, vencimiento: "2025-07-30", fechaPago: null, estado: "Pendiente" },
                { numero: 8, monto: 1200.00, vencimiento: "2025-08-30", fechaPago: null, estado: "Pendiente" },
                { numero: 9, monto: 1200.00, vencimiento: "2025-09-30", fechaPago: null, estado: "Pendiente" },
                { numero: 10, monto: 1200.00, vencimiento: "2025-10-30", fechaPago: null, estado: "Pendiente" },
                { numero: 11, monto: 1200.00, vencimiento: "2025-11-30", fechaPago: null, estado: "Pendiente" },
                { numero: 12, monto: 1200.00, vencimiento: "2025-12-30", fechaPago: null, estado: "Pendiente" },
                { numero: 13, monto: 1200.00, vencimiento: "2026-01-30", fechaPago: null, estado: "Pendiente" },
                { numero: 14, monto: 1200.00, vencimiento: "2026-02-28", fechaPago: null, estado: "Pendiente" },
                { numero: 15, monto: 1200.00, vencimiento: "2026-03-30", fechaPago: null, estado: "Pendiente" }
            ]
        },
        {
            id: 110,
            descripcion: "Materiales de construcción",
            fecha: "2024-12-20",
            total: 10000.00,
            estado: "Pendiente",
            cuotas: 10,
            metodoPago: "Efectivo",
            cuotasDetalle: [
                { numero: 1, monto: 1000.00, vencimiento: "2025-01-31", fechaPago: "2025-01-30", estado: "Pagado" },
                { numero: 2, monto: 1000.00, vencimiento: "2025-02-28", fechaPago: null, estado: "Vencido" },
                { numero: 3, monto: 1000.00, vencimiento: "2025-03-31", fechaPago: null, estado: "Vencido" },
                { numero: 4, monto: 1000.00, vencimiento: "2025-04-30", fechaPago: null, estado: "Vencido" },
                { numero: 5, monto: 1000.00, vencimiento: "2025-05-31", fechaPago: null, estado: "Vencido" },
                { numero: 6, monto: 1000.00, vencimiento: "2025-06-30", fechaPago: null, estado: "Vencido" },
                { numero: 7, monto: 1000.00, vencimiento: "2025-07-31", fechaPago: null, estado: "Pendiente" },
                { numero: 8, monto: 1000.00, vencimiento: "2025-08-31", fechaPago: null, estado: "Pendiente" },
                { numero: 9, monto: 1000.00, vencimiento: "2025-09-30", fechaPago: null, estado: "Pendiente" },
                { numero: 10, monto: 1000.00, vencimiento: "2025-10-31", fechaPago: null, estado: "Pendiente" }
            ]
        }
    ],
    moneda: "BOB",
    configuracion: {
        estados: {
            pendiente: { label: "Pendiente", color: "#F97316", bgColor: "#FFF7ED", textColor: "#9A3412", icon: "Clock" },
            pagado: { label: "Pagado", color: "#22C55E", bgColor: "#DCFCE7", textColor: "#166534", icon: "Check" },
            vencido: { label: "Vencido", color: "#EAB308", bgColor: "#FEF9C3", textColor: "#854D0E", icon: "Warning" }
        },
        metodosPago: ["Efectivo", "Transferencia", "Tarjeta de crédito", "Cheque"]
    }
};

// Colores
const COLOR_CARD = STheme.color.card;
const COLOR_TEXT = STheme.color.text;
const COLOR_ACCENT = STheme.color.lightGray + "66";
// const COLOR_BORDER = STheme.color.lightGray + "66";
// const COLOR_BORDER = STheme.color.lightGray +"50";
const COLOR_BORDER = STheme.color.lightGray + "30";

export default class Pagos extends Component {



    loadData() {
        const key_proveedor = '15843bf1-0ee2-467d-8052-aa394d2cf477';

        return MDL.compra_venta.getTransaccionCuotas(key_proveedor)
            .then(registros => {
                // Validar si registros es válido
                if (!registros || !Array.isArray(registros)) {
                    return {
                        cantidadTotalCompras: 0,
                        pendientes: 0,
                        deudaTotal: null,
                        proveedor: {},
                        compras: []
                    };
                }

                // Calcular la cantidad total de compras
                const cantidadTotalCompras = registros.length;

                // Calcular la cantidad de compras con cuotas pendientes
                let pendientes = 0;
                for (let compra of registros) {
                    if (compra.cuotas && compra.cuotas.cantidad > 0) {
                        pendientes++;
                    }
                }

                // Calcular el total a pagar por moneda (usando cuotas_en_mora.monto)
                let deudaTotal = {};
                for (let compra of registros) {
                    if (compra.cuotas_en_mora && compra.cuotas_en_mora.monto !== null) {
                        const moneda = compra.moneda || 'BOB';
                        deudaTotal[moneda] = (deudaTotal[moneda] || 0) + compra.cuotas_en_mora.monto;
                    }
                }

                // Convertir deudaTotal a null si no hay montos
                if (Object.keys(deudaTotal).length === 0) {
                    deudaTotal = null;
                }

                // Calcular monto amortizado por moneda (opcional, descomentar si es necesario)

                let amortizadoTotal = {};
                for (let compra of registros) {
                    if (compra.monto_amortizado && compra.monto_amortizado !== null) {
                        const moneda = compra.moneda || 'BOB';
                        amortizadoTotal[moneda] = (amortizadoTotal[moneda] || 0) + compra.monto_amortizado;
                    }
                }
                if (Object.keys(amortizadoTotal).length === 0) {
                    amortizadoTotal = null;
                }


                // Obtener proveedores
                return MDL.inventario.proveedor.getAllProveedor().then(proveedores => {
                    const compras = Object.values(registros);

                    // Crear el objeto de resultado
                    const resultado = {
                        cantidadTotalCompras,
                        pendientes,
                        deudaTotal,
                        amortizadoTotal, // Descomentar si necesitas incluirlo
                        proveedor: proveedores.find(prov => prov.key === key_proveedor) || {},
                        compras
                    };

                    console.log("Resultados procesados:", resultado);
                    return resultado;
                });
            })
            .catch(error => {
                console.error("Error in loadData:", error);
                return {
                    cantidadTotalCompras: 0,
                    pendientes: 0,
                    deudaTotal: null,
                    proveedor: {},
                    compras: []
                };
            });
    }

    resumen() {
        const data = this.data;
        if (!data) return <SText>Loading...</SText>;

        const { proveedor, cantidadTotalCompras, pendientes, deudaTotal, amortizadoTotal, compras } = data;
        const monedaDefault = "BOB"; // Moneda por defecto

        return (
            <SView col={"xs-12"} style={{ paddingHorizontal: 16 }}>
                <SView
                    col={"xs-12"}
                    row
                    backgroundColor={COLOR_CARD}
                    style={{
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: COLOR_BORDER,
                        padding: 16,
                    }}
                >
                    {/* Proveedor */}
                    <SView col={"xs-12 md-3"} row center height={80}>
                        <SView
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 8,
                                backgroundColor: data.configuracion?.estados?.pagado?.bgColor || "#DCFCE7",
                                borderWidth: 1,
                                borderColor: data.configuracion?.estados?.pagado?.color || "#22C55E",
                            }}
                            center
                        >
                            <SIconApp name="empresa" width={28} height={28} fill={data.configuracion?.estados?.pagado?.color || "#22C55E"} />
                        </SView>
                        <SView flex style={{ marginLeft: 12 }}>
                            <SText fontSize={14} color={COLOR_TEXT}>Proveedor</SText>
                            <SText fontSize={16} bold color={COLOR_TEXT}>
                                {proveedor?.razon_social || "Sin nombre"}
                            </SText>
                        </SView>
                    </SView>

                    {/* Deuda Total */}
                    <SView col={"xs-12 md-3"} row center height={80}>
                        <SView
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 8,
                                backgroundColor: data.configuracion?.estados?.pendiente?.bgColor || "#FFF7ED",
                                borderWidth: 1,
                                borderColor: data.configuracion?.estados?.pendiente?.color || "#F97316",
                            }}
                            center
                        >
                            <SIconApp name="tpAf" width={28} height={28} fill={data.configuracion?.estados?.pendiente?.color || "#F97316"} />
                        </SView>
                        <SView flex style={{ marginLeft: 12 }}>
                            <SText fontSize={14} color={COLOR_TEXT}>Deuda Total</SText>
                            {deudaTotal ? (
                                Object.entries(deudaTotal).map(([moneda, monto]) => (
                                    <SText key={moneda} fontSize={16} bold color={data.configuracion?.estados?.pendiente?.color || "#F97316"}>
                                        {moneda} {monto.toFixed(2)}
                                    </SText>
                                ))
                            ) : (
                                <SText fontSize={16} bold color={data.configuracion?.estados?.pendiente?.color || "#F97316"}>
                                    {monedaDefault} 0.00
                                </SText>
                            )}
                        </SView>
                    </SView>

                    {/* Límite de Crédito */}
                    <SView col={"xs-12 md-3"} row center height={80}>
                        <SView
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 8,
                                backgroundColor: data.configuracion?.estados?.vencido?.bgColor || "#FEF9C3",
                                borderWidth: 1,
                                borderColor: data.configuracion?.estados?.vencido?.color || "#EAB308",
                            }}
                            center
                        >
                            <SIconApp name="pagotarjeta" width={28} height={28} fill={data.configuracion?.estados?.vencido?.color || "#EAB308"} />
                        </SView>
                        <SView flex style={{ marginLeft: 12 }}>
                            <SText fontSize={14} color={COLOR_TEXT}>Ya pagaste</SText>

                            {amortizadoTotal ? (
                                Object.entries(amortizadoTotal).map(([moneda, monto]) => (
                                    <SText key={moneda} fontSize={16} bold color={data.configuracion?.estados?.pendiente?.color || "#F97316"}>
                                        {moneda} {monto.toFixed(2)}
                                    </SText>
                                ))
                            ) : (
                                <SText fontSize={16} bold color={data.configuracion?.estados?.pendiente?.color || "#F97316"}>
                                    {monedaDefault} 0.00
                                </SText>
                            )}

                            {/* <SText fontSize={16} bold color={COLOR_TEXT}> */}
                            {/* {monedaDefault} {proveedor?.amortizadoTotal?.toFixed(2) || "0.00"} */}
                            {/* {monedaDefault} {proveedor?.limiteCredito?.toFixed(2) || "0.00"} */}
                            {/* </SText> */}
                        </SView>
                    </SView>

                    {/* Compras Pendientes */}
                    <SView col={"xs-12 md-3"} row center height={80}>
                        <SView
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 8,
                                backgroundColor: data.configuracion?.estados?.vencido?.bgColor || "#FEF9C3",
                                borderWidth: 1,
                                borderColor: data.configuracion?.estados?.vencido?.color || "#EAB308",
                            }}
                            center
                        >
                            <SIconApp name="Evento" width={28} height={28} fill={data.configuracion?.estados?.vencido?.color || "#EAB308"} />
                        </SView>
                        <SView flex style={{ marginLeft: 12 }}>
                            <SText fontSize={14} color={COLOR_TEXT}>Compras Pendientes</SText>
                            <SText fontSize={16} bold color={COLOR_TEXT}>{pendientes}</SText>
                        </SView>
                    </SView>
                </SView>
                <SHr h={24} />
            </SView>
        );
    }

    componentDidMount() {
        this.loadData()
            .then(data => {
                this.data = data;
                this.forceUpdate(); // Forzar re-renderizado para reflejar los datos
            })
            .catch(error => {
                console.error("Error loading data:", error);
                this.data = {
                    cantidadTotalCompras: 0,
                    pendientes: 0,
                    deudaTotal: null,
                    proveedor: {},
                    compras: []
                };
                this.forceUpdate(); // Forzar re-renderizado en caso de error
            });
    }
    labelEstado = (estado) => {
        const estadoNormalizado = estado?.toLowerCase();
        const { color, bgColor, textColor, label } = data.configuracion.estados[estadoNormalizado] || data.configuracion.estados.pendiente;
        return (
            <SView
                width={80}
                row
                center
                accessibilityLabel={`Estado: ${label}`}
            >
                <SView
                    width={70}
                    center
                    style={{
                        backgroundColor: bgColor,
                        borderRadius: 4,
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderWidth: 1,
                        borderColor: color,
                    }}
                >
                    <SText fontSize={12} bold color={textColor}>
                        {label}
                    </SText>
                </SView>
            </SView>
        );
    };

    header() {
        return (
            <SView col={"xs-12"} style={{ paddingHorizontal: 16 }}>
                <SHr h={24} />
                <SText fontSize={20} bold color={COLOR_TEXT}>Compras a crédito y pagos pendientes</SText>
                <SHr h={24} />
            </SView>
        );
    }


    // que pasa si hay deudas en dolares y otros en bolivianos
    // como hacemos ?

    itemCard() {
        const compras = this.data?.compras;
        const monedaDefault = this.data?.moneda || "BOB"; // Moneda por defecto desde this.data
        if (!compras) return <SText>Loading...</SText>;


        // const subtotal = compra.detalles.precio_unitario * compra.detalles.cantidad;
        return (
            <SView col={"xs-12"} flex center>
                <SScrollView2 disableHorizontal>
                    <SView col={"xs-12"} style={{ padding: 16 }}>
                        <SView col={"xs-12"} row>
                            {compras.map((compra, index) => (


                                <SView
                                    key={index}
                                    col={"xs-12 md-3 lg-3"}
                                    margin={8}
                                    style={{
                                        backgroundColor: COLOR_CARD,
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: COLOR_BORDER,
                                        padding: 16,
                                    }}
                                >
                                    <SView col={"xs-12"} row>
                                        <SView col={"xs-12"} row>
                                            <SView flex height={44}>
                                                <SText fontSize={18} bold color={COLOR_TEXT} numberOfLines={1}>{`Compra #${index + 1}`}</SText>
                                                <SText fontSize={14} color={COLOR_TEXT} numberOfLines={1}>{compra.descripcion}</SText>
                                            </SView>


                                            {this.labelEstado(compra.cuotas_en_mora.monto ? "pendiente" : "pagado")}
                                        </SView>
                                    </SView>

                                    <SHr h={16} />

                                    <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                                        <SText fontSize={14} color={COLOR_TEXT}>Fecha:</SText>
                                        <SText fontSize={14} color={COLOR_TEXT}>{new SDate(compra.fecha_on).toString("yyyy-MM-dd")}</SText>
                                    </SView>
                                    <SHr h={16} />

                                    <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                                        <SText fontSize={14} color={COLOR_TEXT}>Tipo pago:</SText>
                                        <SText fontSize={14} color={COLOR_TEXT}>{compra.tipo_pago}</SText>
                                    </SView>



                                    <SHr h={8} />
                                    <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                                        <SText fontSize={14} color={COLOR_TEXT}>Total compra:</SText>

                                        {compra.detalles.map((item, index) => (

                                            <SText fontSize={16} bold color={COLOR_TEXT}>
                                                {SMath.formatMoney(item.precio_unitario * item.cantidad ?? 0)}
                                                {/* // const subtotal = compra.detalles.precio_unitario * compra.detalles.cantidad; */}
                                            </SText>))}


                                    </SView>

                                    <SHr h={8} />
                                    {/* <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                                        <SText fontSize={14} color={COLOR_TEXT}>Total pagado:</SText>
                                        <SText fontSize={16} bold color={COLOR_TEXT}>
                                            {compra.moneda || monedaDefault} {SMath.formatMoney(compra.monto_amortizado ?? 0)}
                                        </SText>
                                    </SView>
                                    <SHr h={8} /> */}
                                    <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                                        <SText fontSize={14} color={COLOR_TEXT}>Cuotas:</SText>
                                        <SText fontSize={14} color={compra.cuotas_en_mora.cantidad ? "#EAB308" : COLOR_TEXT}>
                                            {`${compra.cuotas_en_mora.cantidad} cuotas`}
                                        </SText>
                                    </SView>
                                    <SHr h={16} />
                                    <SView col={"xs-12"} center>
                                        <SView
                                            col={"xs-12"}
                                            center
                                            style={{
                                                backgroundColor: COLOR_ACCENT,
                                                borderRadius: 4,
                                                padding: 10,
                                                borderWidth: 1,
                                                borderColor: COLOR_ACCENT,
                                            }}
                                            onPress={() => {
                                                PopupPagoCuota.open({
                                                    editObject: { ...compra, moneda: compra.moneda || monedaDefault },
                                                    key_empresa: this.props.key_empresa || "",
                                                    onSuccess: () => {
                                                        console.log("Payment successful");
                                                    },
                                                });
                                            }}
                                        >
                                                                                    

                                             <SText fontSize={14} bold color={compra.cuotas_en_mora.cantidad ? "red" : "blue"}> <SIconApp name={compra.cuotas_en_mora.cantidad ? 'history' : 'Eyes'} width={12} height={12} fill={compra.cuotas_en_mora.cantidad ? "red" : "blue"} /> {compra.cuotas_en_mora.cantidad ? "ver cuotas" : "ver pagos"}</SText>
                                        </SView>
                                    </SView>
                                </SView>
                            ))}
                        </SView>
                    </SView>
                </SScrollView2>
            </SView>
        );
    }


    render() {
        return (
            <SPage title={'Compras de Distribuidora Central S.A.'} center>
                {this.header()}
                {this.resumen()}
                {this.itemCard()}
            </SPage>
        );
    }
}