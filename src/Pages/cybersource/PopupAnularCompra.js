import React from 'react';
import { SHr, SInput, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import { anularOrden, moneda } from './api';

const KEY = "popup-anular-compra";

// Anula una compra de la tienda web y devuelve el dinero a la tarjeta (pruebas o devoluciones a clientes).
// orden: fila de tienda_orden ({key, state, modalidad, monto, descripcion, cliente}).
export default {
    open(orden, onDone) {
        let motivo = "";
        const cuotas = orden.modalidad == "cuotas";
        const pagada = orden.state == "VENTA";
        const pasos = !pagada
            ? ["Se anula la orden y su link de pago (no hubo cobro)."]
            : cuotas
                ? ["Se cancela el contrato y se anulan las cuotas que faltan (no se cobra más).",
                    "Se anula el pago de cada cuota cobrada: el dinero vuelve a la tarjeta y se revierte en caja.",
                    "Se anulan las suscripciones de esos meses y la venta a crédito."]
                : ["Se anula la venta: el pago vuelve a la tarjeta y se revierte en caja (y la suscripción)."];
        SPopup.open({
            key: KEY,
            content: <SView withoutFeedback style={{ width: "100%", maxWidth: 500, padding: 16, borderRadius: 12, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.card }}>
                <SText bold fontSize={16}>Anular compra</SText>
                <SHr height={4} />
                <SText fontSize={13} color={STheme.color.gray}>{orden.descripcion} · {moneda(orden.monto)}{cuotas ? " por mes" : ""} · {`${orden.cliente?.nombres ?? ""} ${orden.cliente?.apellidos ?? ""}`.trim()}</SText>
                <SHr height={10} />
                {pasos.map((p, i) => <SText key={i} fontSize={13} style={{ marginBottom: 4 }}>{`${i + 1}. ${p}`}</SText>)}
                <SHr height={10} />
                <SInput placeholder="Motivo (ej: compra de prueba, pedido del cliente)" onChangeText={(v) => motivo = v} style={{ height: 38, borderRadius: 8 }} />
                <SHr height={14} />
                <SView row>
                    <SView card center style={{ height: 38, paddingHorizontal: 16, borderRadius: 8, marginRight: 8, backgroundColor: STheme.color.danger }}
                        onPress={() => {
                            if (motivo.trim().length < 3) return SNotification.send({ title: "Falta el motivo", color: STheme.color.warning, time: 3000 });
                            SPopup.close(KEY);
                            SNotification.send({ key: "anulando", title: "Anulando compra…", body: "Devolviendo el dinero a la tarjeta", type: "loading" });
                            anularOrden(orden.key, motivo.trim()).then(() => {
                                SNotification.remove("anulando");
                                SNotification.send({ title: "Compra anulada", body: pagada ? "El dinero se devolvió a la tarjeta." : "", color: STheme.color.success, time: 5000 });
                                onDone?.();
                            }).catch(e => {
                                SNotification.remove("anulando");
                                SNotification.send({ title: "No se pudo anular", body: e?.error ?? "", color: STheme.color.danger, time: 8000 });
                                onDone?.();
                            });
                        }}>
                        <SText color={"#fff"} bold>Anular y devolver</SText>
                    </SView>
                    <SView card center style={{ height: 38, paddingHorizontal: 16, borderRadius: 8, backgroundColor: STheme.color.gray }} onPress={() => SPopup.close(KEY)}>
                        <SText color={"#fff"} bold>Volver</SText>
                    </SView>
                </SView>
            </SView>
        });
    }
};
