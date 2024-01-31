export default {
    // Sucursal
    punto_venta_tipo_pago: { cuenta: "1.1.1", label: "Cuentas a las que afecta cada tipo de pago en el punto de venta." },
    // Cajas
    caja_ingreso: { cuenta: "4", label: "Cuentas a las que afecta el ingreso de caja." },
    caja_ingreso_efectivo: { cuenta: "4", label: "Cuentas de las que se puede realizar un ingreso de efectivo en caja." },
    caja_egreso_efectivo: { cuenta: "6", label: "Cuentas disponibles para hacer un egreso en efectivo." },
    caja_ingreso_banco: { cuenta: "1.1.1.2", label: "Cuenta de banco disponibles para retirar dinero para las cajas." },
    caja_egreso_banco: { cuenta: "1.1.1.2", label: "Cuentas de banco disponibles para enviar el dinero de las cajas." },
    // Productos
    tipo_producto_contado: { cuenta: "4", label: "Cuenta a la que afecta un pago al contado para un producto de este tipo." },
    tipo_producto_credito: { cuenta: "4", label: "Cuenta a la que afecta un pago de una cuota al credito para un producto de este tipo." },
    // Compra
    compra_detalle: { cuenta: "5", label: "Cuenta de gastos a la que afecta los pagos por una compra." },
    // Bancos
    banco_cuenta: { cuenta: "1.1.1.2", label: "[Sin uso] Cuanta que se configura en banco/cuenta/profile." },
    banco_cuenta_movimiento: { cuenta: "3", label: "[Sin uso] Cuantas disponibles para movimientos de ingreso o egreso en una cuenta bancaria." },

}