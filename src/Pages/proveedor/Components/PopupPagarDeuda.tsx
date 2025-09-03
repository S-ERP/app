import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SNotification, SPopup, SText, STheme, SView, SImage, SInput, SHr } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import InputFoto from '../../../Components/InputFoto';
import Btn from './Btn';
import SIconApp from '../../../Assets/SIconApp';
type Props = {
    key_empresa: string,
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
}


 
// import React, { Component } from 'react';
// import { ScrollView } from 'react-native';
// import { SNotification, SPopup, SText, STheme, SView, SImage, SInput, SHr } from 'servisofts-component';
// import SSocket from 'servisofts-socket';
// import MDL from '../../../MDL';
// import Btn from './Btn';
// import SIconApp from '../../../Assets/SIconApp';

// type Props = {
//     key_empresa: string,
//     editObject?: any,
//     onCancel?: Function,
//     onSuccess?: Function,
// };

export default class PopupPagarDeuda extends Component<Props> {
    static open(props: Props) {
        SPopup.open({
            key: "PopupPagarDeuda",
            content: (
                <SView
                    style={{
                        maxWidth: "100%",
                        maxHeight: "90vh",
                        width: 500,
                        borderRadius: 16,
                        borderColor: STheme.color.card + "33",
                        borderWidth: 1,
                        backgroundColor: STheme.color.background,
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        overflow: "hidden",
                    }}
                    withoutFeedback
                >
                    <PopupPagarDeuda
                        {...props}
                        onCancel={() => {
                            SPopup.close("PopupPagarDeuda");
                            if (props.onCancel) props.onCancel();
                        }}
                        onSuccess={(e: any) => {
                            SPopup.close("PopupPagarDeuda");
                            if (props.onSuccess) props.onSuccess(e);
                        }}
                    />
                </SView>
            ),
        });
    }

    constructor(props: Props) {
        super(props);
        this.state = {
            montoPagar: {}, // Almacena montos a pagar por cada compra
            isLoading: false, // Estado para manejar la carga de pagos
        };
    }

    // Componente Item con estilo acuarela
    Item = ({ label, index, code, style, onPress, color, scale = 1, onAjuste, compra }) => {
        const { montoPagar } = this.state;
        const monedaSymbol = compra?.caja?.monedaSymbol || 'Bs';
        const saldo = parseFloat(compra?.cuotas?.total ?? 0);
        const montoPagado = parseFloat(compra?.monto_amortizado ?? 0);
        const montoRestante = saldo - montoPagado;
        const montoInput = montoPagar[compra.key] || 0;

        const watercolorStyle = {
            backgroundColor: STheme.color.card + "22",
            borderRadius: 12,
            padding: 12,
            marginBottom: 8,
            border: `1px solid ${color ?? STheme.color.lightGray + "33"}`,
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
        };

        return (
            <SView col={"xs-12"} center>
                <SView style={[watercolorStyle, style]} onPress={onPress}>
                    <SView row alignItems="center">
                        <SView
                            width={24 * scale}
                            height={24 * scale}
                            style={{ borderRadius: 100, backgroundColor: color ?? STheme.color.primary + "22", overflow: "hidden" }}
                            center
                        >
                            <SText fontSize={12 * scale} color={color ?? STheme.color.primary}>{index}</SText>
                        </SView>
                        <SView width={8} />
                        <SView flex>
                            <SText fontSize={16 * scale} fontWeight="bold" color={STheme.color.text}>
                                {label}
                            </SText>
                            <SView row wrap="wrap">
                                <SText fontSize={12 * scale} color={STheme.color.lightGray}>
                                    Cuotas: {compra?.cuotas?.cantidad ?? 0} | 
                                </SText>
                                <SText fontSize={12 * scale} color={STheme.color.success}>
                                    Saldo: {monedaSymbol} {montoRestante.toFixed(2)} | 
                                </SText>
                                <SText fontSize={12 * scale} color={STheme.color.lightGray}>
                                    Pagado: {monedaSymbol} {montoPagado.toFixed(2)}
                                </SText>
                            </SView>
                        </SView>
                    </SView>
                    {onAjuste && (
                        <SView row alignItems="center" style={{ marginTop: 8 }}>
                            <SInput
                                type="money2"
                                placeholder={`${monedaSymbol} 0.00`}
                                value={montoInput > 0 ? montoInput.toString() : ''}
                                onChangeText={(value) => {
                                    const newValue = parseFloat(value || '0');
                                    if (newValue <= montoRestante) {
                                        this.setState({
                                            montoPagar: { ...montoPagar, [compra.key]: newValue },
                                        });
                                    } else {
                                        SNotification.send({
                                            title: "Advertencia",
                                            body: `El monto no puede superar el saldo restante de ${monedaSymbol} ${montoRestante.toFixed(2)}.`,
                                            time: 3000,
                                            color: STheme.color.warning,
                                        });
                                    }
                                }}
                                style={{ flex: 1, marginRight: 8 }}
                            />
                            <SView
                                width={24 * scale}
                                height={24 * scale}
                                center
                                style={{ backgroundColor: STheme.color.primary + "22", borderRadius: 6 }}
                                onPress={() => onAjuste(compra)}
                            >
                                <SIconApp name="Edit" fill={STheme.color.primary} />
                            </SView>
                        </SView>
                    )}
                </SView>
            </SView>
        );
    };

    // Función para manejar el pago de una deuda
    handlePagarDeuda = async (compra) => {
        const { montoPagar } = this.state;
        const monto = parseFloat(montoPagar[compra.key] || 0);
        const saldo = parseFloat(compra?.cuotas?.total ?? 0) - parseFloat(compra?.monto_amortizado ?? 0);

        if (this.state.isLoading) return;

        if (monto <= 0) {
            SNotification.send({
                title: "Error",
                body: "El monto a pagar debe ser mayor a 0.",
                time: 3000,
                color: STheme.color.danger,
            });
            return;
        }

        if (monto > saldo) {
            SNotification.send({
                title: "Error",
                body: `El monto a pagar no puede exceder el saldo pendiente de ${saldo.toFixed(2)}.`,
                time: 3000,
                color: STheme.color.danger,
            });
            return;
        }

        this.setState({ isLoading: true });

        try {
            const response = await MDL.compra_venta.registrarPago({
                key_compra: compra.key,
                monto: monto,
                key_empresa: this.props.key_empresa,
                key_usuario: MDL.usuario.session?.key,
            });

            SNotification.send({
                title: "Éxito",
                body: "Pago registrado correctamente.",
                time: 3000,
                color: STheme.color.success,
            });

            // Actualizar el estado para reflejar el pago
            const newMontoPagar = { ...montoPagar };
            delete newMontoPagar[compra.key];
            this.setState({ montoPagar: newMontoPagar, isLoading: false });

            if (this.props.onSuccess) {
                this.props.onSuccess(response);
            }
        } catch (error) {
            console.error("Error al registrar el pago:", error);
            SNotification.send({
                title: "Error",
                body: "No se pudo registrar el pago.",
                time: 3000,
                color: STheme.color.danger,
            });
            this.setState({ isLoading: false });
        }
    };

    render() {
        const compras = this.props?.editObject?.compras || [];
        const proveedorNombre = this.props?.editObject?.razon_social || "Proveedor";

        return (
            <SView col={"xs-12"} center padding={16} style={{ backgroundColor: STheme.color.background + "EE" }}>
                <SView
                    style={{
                        padding: 16,
                        borderRadius: 16,
                        background: `linear-gradient(135deg, ${STheme.color.card} 0%, ${STheme.color.background} 100%)`,
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <SText fontSize={18} fontWeight="bold" color={STheme.color.primary}>
                        Pagar Deuda de {proveedorNombre}
                    </SText>
                    <SHr h={16} />
                    <ScrollView style={{ maxHeight: "60vh", width: "100%" }}>
                        <SView col={"xs-12"}>
                            {compras.length > 0 ? (
                                compras.map((compra, index) => (
                                    <this.Item
                                        key={compra.key}
                                        label={compra.descripcion || `Compra ${index + 1}`}
                                        index={index + 1}
                                        code={compra.key}
                                        compra={compra}
                                        onAjuste={this.handlePagarDeuda}
                                        scale={1.2}
                                        color={STheme.color.success}
                                        style={{ backgroundColor: STheme.color.card + "11" }}
                                    />
                                ))
                            ) : (
                                <SText color={STheme.color.lightGray} fontSize={14} style={{ padding: 16 }}>
                                    No hay compras asociadas a este proveedor.
                                </SText>
                            )}
                        </SView>
                    </ScrollView>
                    <SHr h={16} />
                    <SView row col={"xs-12"} justifyContent="flex-end">
                        {this.props.onCancel && (
                            <>
                                <Btn
                                    type="danger"
                                    label="CANCELAR"
                                    onPress={() => {
                                        if (this.props.onCancel) this.props.onCancel();
                                    }}
                                    style={{ borderRadius: 8 }}
                                />
                                <SView width={8} />
                            </>
                        )}
                        <Btn
                            type="primary"
                            label="GUARDAR TODOS"
                            disabled={compras.length === 0 || Object.values(this.state.montoPagar).every(val => val <= 0)}
                            onPress={async () => {
                                if (this.state.isLoading) return;
                                this.setState({ isLoading: true });

                                for (const [key, monto] of Object.entries(this.state.montoPagar)) {
                                    const compra = compras.find(c => c.key === key);
                                    if (compra && monto > 0) {
                                        await this.handlePagarDeuda(compra);
                                    }
                                }

                                this.setState({ isLoading: false });
                            }}
                            style={{ borderRadius: 8 }}
                        />
                    </SView>
                </SView>
            </SView>
        );
    }
}