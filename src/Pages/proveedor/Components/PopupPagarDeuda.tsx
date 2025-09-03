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

// type Props = {
//     key_empresa: string,
//     editObject?: any,
//     onCancel?: Function,
//     onSuccess?: Function,
// }

export default class PopupPagarDeuda extends Component<Props> {
    static open(props: Props) {
        SPopup.open({
            key: "PopupPagarDeuda",
            content: (
                <SView
                    style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: 500,
                        borderRadius: 8,
                        borderColor: STheme.color.card,
                        borderWidth: 1,
                        backgroundColor: STheme.color.background,
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
            montoPagar: {}, // Objeto para almacenar los montos a pagar por cada compra
        };
    }

    // Componente Item para renderizar cada compra
    Item = ({ label, index, code, style, onPress, color, scale = 1, onAjuste, imageSrc, compra }) => {
        const { montoPagar } = this.state;
        const monedaSymbol = compra?.caja?.monedaSymbol || 'Bs';

        return (<SView col={"xs-12"} center>

            <SView row style={[style, { alignItems: "center", padding: 8 }]} onPress={onPress}>
                <SView width={4} />
                <SView width={16 * scale} height={16 * scale} style={{ borderRadius: 100, borderWidth: 1, borderColor: color ?? STheme.color.lightGray }} center>
                    <SText fontSize={10 * scale} color={color ?? STheme.color.lightGray}>{index}</SText>
                </SView>
                <SView width={4} />
                {/* <SText fontSize={10 * scale} color={STheme.color.lightGray}>{code}</SText> */}
                <SView width={8} />
                {/* {imageSrc && (
                    <>
                        <SView width={20 * scale} height={20 * scale} style={{ borderRadius: 100, borderWidth: 1, borderColor: color ?? STheme.color.lightGray }} center>
                            <SImage src={imageSrc} style={{ width: 20 * scale, height: 20 * scale, borderRadius: 100 }} />
                        </SView>
                        <SView width={8} />
                    </>
                )} */}
                <SView flex>
                    <SText fontSize={14 * scale}>{label}</SText>
                    <SText fontSize={12 * scale} color={STheme.color.lightGray}>
                        Cuotas: {compra?.cuotas?.cantidad ?? 0} | Saldo: {monedaSymbol} {parseFloat(compra?.cuotas?.total ?? 0).toFixed(2)} | Pagado: {monedaSymbol} {parseFloat(compra?.monto_amortizado ?? 0).toFixed(2)}
                    </SText>
                </SView>
                {onAjuste && (
                    <>
                        <SView width={8} />
                        <SView col={"xs-4"} center>
                            <SInput
                                type="money2"
                                placeholder={`${monedaSymbol} 0.00`}
                                value={montoPagar[compra.key] || ''}
                                onChangeText={(value) => {
                                    this.setState({
                                        montoPagar: { ...montoPagar, [compra.key]: parseFloat(value || '0') },
                                    });
                                }}
                            />
                        </SView>
                        <SView width={8} />
                        <SView width={16 * scale} height={16 * scale} center onPress={() => onAjuste(compra)} card>
                            <SIconApp name="Edit" fill={STheme.color.lightGray} />
                        </SView>
                    </>
                )}
            </SView>
        </SView>
        );
    }

    // Función para manejar el pago de una deuda
    handlePagarDeuda = async (compra) => {
        const { montoPagar } = this.state;
        const monto = parseFloat(montoPagar[compra.key] || 0);
        const saldo = parseFloat(compra?.cuotas?.total || 0);

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
                body: "El monto a pagar no puede exceder el saldo pendiente.",
                time: 3000,
                color: STheme.color.danger,
            });
            return;
        }

        try {
            // Aquí asumimos que existe una API para registrar el pago
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
        }
    }

    render() {
        const compras = this.props?.editObject?.compras || [];
        const proveedorNombre = this.props?.editObject?.razon_social || "Proveedor";

        return (
            <SView col={"xs-12"} center padding={16}>
                <SText fontSize={16}>Pagar Deuda de {proveedorNombre}</SText>
                <ScrollView style={{ width: '100%' }}>
                    <SView col={"xs-12"}>
                        {compras.length > 0 ? (
                            compras.map((compra, index) => (
                                <this.Item
                                    key={compra.key}
                                    label={compra.descripcion || `Compra ${index + 1}`}
                                    index={index + 1}
                                    code={compra.key}
                                    compra={compra}
                                    onAjuste={() => this.handlePagarDeuda(compra)}
                                    scale={1.2}
                                    color={STheme.color.primary}
                                />
                            ))
                        ) : (
                            <SText color={STheme.color.lightGray}>No hay compras asociadas a este proveedor.</SText>
                        )}
                    </SView>
                </ScrollView>
                <SHr h={16} />
                <SView row col={"xs-12"}>
                    {this.props.onCancel && (
                        <>
                            <Btn
                                type="danger"
                                label="CANCELAR"
                                onPress={() => {
                                    if (this.props.onCancel) this.props.onCancel();
                                }}
                            />
                            <SView width={8} />
                        </>
                    )}
                    <Btn
                        type="primary"
                        label="GUARDAR"
                        disabled={compras.length === 0}
                        onPress={() => {
                            // Opcional: Acción global si necesitas procesar todos los pagos a la vez
                            SNotification.send({
                                title: "Éxito",
                                body: "Por favor, seleccione una compra y ajuste el monto a pagar.",
                                time: 3000,
                                color: STheme.color.info,
                            });
                        }}
                    />
                </SView>
            </SView>
        );
    }
}