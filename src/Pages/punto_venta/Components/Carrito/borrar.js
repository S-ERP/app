// CarritoItem.js
import React from 'react';
import { SView, SText, SInput } from 'servisofts-component';
import FotoModelo from './Foto/FotoModelo';
import SIconApp from '../../../Assets/SIconApp';

export default function CarritoItem({ item, onAumentar, onDisminuir, onEliminar }) {
    return (
        <SView col={"xs-12"} row style={{ paddingVertical: 4, borderBottomWidth: 0.2 }}>
            <SView col={"xs-1"}>
                <SView center style={{ width: 30, height: 30, borderRadius: 18, margin: 4 }}>
                    <FotoModelo data={item} />
                </SView>
            </SView>
            <SView col={"xs-4.5"}>
                <SText fontSize={12}>{item.descripcion}</SText>
                <SText fontSize={12}>Bs {item.precio_venta.toFixed(2)} / Und</SText>
                <SText fontSize={12}>Stock actual: {item.stock}</SText>
            </SView>
            <SView flex row center>
                <SView onPress={onDisminuir}>
                    <SText fontSize={24} color="#EF4444">-</SText>
                </SView>
                <SInput
                    value={item.cantidad.toString()}
                    type="number"
                    style={{ width: 40, textAlign: "center" }}
                    editable={false}
                />
                <SView onPress={onAumentar}>
                    <SText fontSize={24} color="#10B981">+</SText>
                </SView>
            </SView>
            <SView col={"xs-2"} center onPress={onEliminar}>
                <SIconApp name="Close" width={24} height={24} fill="red" />
            </SView>
        </SView>
    );
}

// ModalPago.js
import React from 'react';
import { SView, SText, SInput, SButtom, STheme, SMath, SNotification } from 'servisofts-component';

export default function ModalPago({ visible, totalFinal, amountReceived, setAmountReceived, onConfirm, onCancel }) {
    if (!visible) return null;

    const montoRecibido = parseFloat(amountReceived || 0);
    const change = isNaN(montoRecibido) ? 0 : montoRecibido - totalFinal;

    return (
        <SView
            col={"xs-12"}
            height={"100%"}
            center
            style={{ position: "absolute", backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000 }}
        >
            <SView
                width={400}
                height={320}
                backgroundColor={STheme.color.background}
                style={{ borderRadius: 12, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 }}
            >
                <SText fontSize={20} bold center>Confirmar Pago</SText>
                <SView height={20} />

                <SView row style={{ justifyContent: "space-between", marginBottom: 12 }}>
                    <SText fontSize={16}>Total a Pagar:</SText>
                    <SText fontSize={18} bold color={STheme.color.warning}>
                        Bs {SMath.formatMoney(totalFinal, 2)}
                    </SText>
                </SView>

                <SView row>
                    <SText fontSize={14}>Monto Recibido:</SText>
                    <SInput
                        value={amountReceived}
                        onChangeText={setAmountReceived}
                        type='number'
                        placeholder="Ej. 100.00"
                        style={{ height: 48, fontSize: 20, textAlign: "center", borderWidth: 1, borderColor: STheme.color.card, borderRadius: 4, marginTop: 8, backgroundColor: "transparent" }}
                    />
                </SView>
                <SView height={20} />

                <SView row style={{ justifyContent: "space-between", marginBottom: 40 }}>
                    <SText fontSize={16}>Cambio:</SText>
                    <SText fontSize={18} bold color={change >= 0 ? STheme.color.success : STheme.color.danger}>
                        Bs {SMath.formatMoney(change, 2)}
                    </SText>
                </SView>

                <SView row style={{ justifyContent: "space-around" }}>
                    <SButtom
                        onPress={onCancel}
                        style={{ backgroundColor: STheme.color.lightGray, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 4, width: 150 }}
                    >
                        <SText>Cancelar</SText>
                    </SButtom>

                    <SButtom
                        onPress={() => {
                            if (change >= 0) onConfirm(change);
                            else SNotification.send({ title: "Monto insuficiente", body: "El monto recibido es menor al total.", type: "danger" });
                        }}
                        style={{ backgroundColor: STheme.color.text, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 4, width: 150 }}
                    >
                        <SText color={STheme.color.white}>Confirmar Pago</SText>
                    </SButtom>
                </SView>
            </SView>
        </SView>
    );
}

// ResumenTotales.js
import React from 'react';
import { SView, SText, STheme, SMath } from 'servisofts-component';

export default function ResumenTotales({ subtotal, totalConIVA, totalFinal }) {
    return (
        <SView col={"xs-12"} border={STheme.color.card} style={{ borderRadius: 2, padding: 16, marginBottom: 8 }} height={80}>
            <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                <SText fontSize={13}>Subtotal:</SText>
                <SText fontSize={14} bold>Bs {SMath.formatMoney(subtotal, 2)}</SText>
            </SView>
            <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                <SText fontSize={12}>Impuesto:</SText>
                <SText fontSize={13}>IVA 13% Bs {SMath.formatMoney(totalConIVA, 2)}</SText>
            </SView>
            <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                <SText fontSize={13}>Total:</SText>
                <SText fontSize={16} bold>Bs {SMath.formatMoney(totalFinal, 2)}</SText>
            </SView>
        </SView>
    );
}

// ClienteSelector.js
import React from 'react';
import { SView, SText, STheme } from 'servisofts-component';
import FotoCliente from './Foto/FotoCliente';

export default function ClienteSelector({ cliente, onSelect }) {
    const style_text = { color: STheme.color.text, fontSize: 12, fontWeight: "bold" };
    return (
        <SView center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ height: 44, borderRadius: 2, margin: 2 }}>
            <SView row center onPress={onSelect}>
                <SView center backgroundColor={STheme.color.background} style={{ width: 30, height: 30, borderRadius: 18, margin: 4, marginRight: cliente?.key ? 6 : 14, overflow: "hidden" }}>
                    <FotoCliente data={cliente} />
                </SView>
                <SView>
                    <SText style={{ ...style_text, fontSize: 12 }}>{cliente?.nombres || "Cliente"}</SText>
                    {cliente?.key ? <SText style={{ ...style_text, fontSize: 12, color: "#26e9ae" }}>Cliente Vip</SText> : null}
                </SView>
            </SView>
        </SView>
    );
}

// TecladoNumerico.js
import React from 'react';
import { SView, SText, STheme } from 'servisofts-component';
import ClienteSelector from './ClienteSelector';

export default function TecladoNumerico({ cliente, onTeclaPress, onSelectCliente, onPagar }) {
    const teclas = [
        ["1", "2", "3", "Cant"],
        ["4", "5", "6", "% de desc."],
        ["7", "8", "9", "Precio"],
        ["+/-", "0", ".", "<"]
    ];

    const style_text = { color: STheme.color.text, fontSize: 12, fontWeight: "bold" };

    return (
        <SView col={"xs-12"} row>
            <SView col={"xs-4"}>
                <ClienteSelector cliente={cliente} onSelect={onSelectCliente} />

                <SView center flex backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ borderRadius: 2, margin: 2 }} onPress={onPagar}>
                    <SText style={{ ...style_text, textTransform: 'uppercase' }}>Pagar</SText>
                </SView>
            </SView>

            <SView col={"xs-8"}>
                {teclas.map((fila, i) => (
                    <SView key={i} row>
                        {fila.map((t, j) => (
                            <SView key={j} flex center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ height: 44, borderRadius: 2, margin: 2 }} onPress={() => onTeclaPress(t)}>
                                <SText style={style_text}>{t}</SText>
                            </SView>
                        ))}
                    </SView>
                ))}
            </SView>
        </SView>
    );
}
