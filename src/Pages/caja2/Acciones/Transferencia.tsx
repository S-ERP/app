import React from "react";
import { SForm, SHr, SInput, SNotification, SPage, SPopup, SText, STheme, SThread, SView } from "servisofts-component";
import MDL from "../../../MDL";
import SIconApp from "../../../Assets/SIconApp";
type TransferenciaProps = {

}
export default class Transferencia extends React.Component<TransferenciaProps> {
    static open(props: TransferenciaProps) {
        SPopup.open({
            key: "Transferencia",
            type: "1",
            content: <SView style={{
                maxWidth: 500,
                width: "100%",
                // height: 500,
                maxHeight: "100%",
                backgroundColor: STheme.color.background,
                borderRadius: 8,
                // @ts-ignore
                cursor: "default",
                userSelect: "text",
                padding: 16,

            }} withoutFeedback>
                <Transferencia {...props} />
            </SView>
        });
    }
    state = {
        data: []
    }

    format_cuenta_to_string(cuenta: any) {
        return `${cuenta.codigo} - ${cuenta.descripcion}`;
    }
    componentDidMount(): void {
        MDL.empresa.tipo_pagoGetFullCaja(MDL.caja.activa?.key_punto_venta).then((data) => {
            this.setState({ data: data });
            console.log(data);
        })
        // MDL.contabilidad.getCuentasByAjusteCache("bancos", true).then((data) => {
        //     this.setState({ cuentas_bancos: data });
        //     console.log(data);
        // })
    }

    async submit() {
        try {
            const data = {
                key_usuario: MDL.usuario.session?.key,
                key_caja: MDL.caja.activa?.key,
                key_empresa_tipo_pago_origen: this.state?.origen?.key,
                key_empresa_tipo_pago_destino: this.state?.destino?.key,
                monto_origen: this._ref["monto_origen"].getValue(),
                monto_destino: this._ref["monto_destino"].getValue(),
                descripcion: this._ref["descripcion"].getValue(),
            }
            const caja = MDL.caja.activa;
            if (!caja) throw "Caja no encontrada";
            console.log(data)
            await MDL.caja.traspaso(data)
            SPopup.close("Transferencia");
        } catch (e: any) {
            SNotification.send({
                key: "enviar",
                title: "Error",
                body: e.error ?? JSON.stringify(e),
                color: STheme.color.danger,
                time: 5000
            })
        }

    }
    calcular_tipo_cambio() {
        new SThread(200, "calcular_tipo_cambio", true).start(() => {
            const montoOrigen = parseFloat(this._ref["monto_origen"].getValue() ?? 0);
            const montoDestino = parseFloat(this._ref["monto_destino"].getValue() ?? 0);
            if (montoOrigen > 0 && montoDestino > 0) {
                this._ref["tipo_cambio"].setValue(Math.round((montoDestino / montoOrigen) * 100000) / 100000);
            }
            this.forceUpdate();
        })

    }
    calcular_tipo_cambio_cuentas() {
        new SThread(200, "calcular_tipo_cambio", true).start(() => {

            if (this.state.origen) {
                const tco = this.state?.origen?.moneda?.tipo_cambio;
                const tcd = this.state?.destino?.moneda?.tipo_cambio;
                // this._ref["tipo_cambio"].setValue(tco / tcd);
                const montoOrigen = parseFloat(this._ref["monto_origen"].getValue() ?? 0);
                const montoDestino = parseFloat(this._ref["monto_destino"].getValue() ?? 0);
                const tc = (tco ?? 1) / (tcd ?? 1);
                if (montoOrigen > 0 && montoDestino > 0) {
                    this._ref["monto_destino"].setValue(montoOrigen * tc);
                } else {

                    if (montoOrigen > 0) {
                        this._ref["monto_destino"].setValue(montoOrigen * tc);
                    }
                    if (montoDestino > 0) {
                        this._ref["monto_origen"].setValue(montoDestino / tc);
                    }
                    this._ref["tipo_cambio"].setValue(tc);
                }
            }
            // const montoOrigen = parseFloat(this._ref["monto_origen"].getValue() ?? 0);
            // const montoDestino = parseFloat(this._ref["monto_destino"].getValue() ?? 0);
            // if (montoOrigen > 0 && montoDestino > 0) {
            //     this._ref["tipo_cambio"].setValue(montoOrigen / montoDestino);
            // }

        })

    }
    calcular_monto_destino_tipo_cambio() {
        const monto_origen = parseFloat(this._ref["monto_origen"].getValue() ?? 0);
        const tipo_cambio = parseFloat(this._ref["tipo_cambio"].getValue() ?? 0);
        this._ref["monto_destino"].setValue(monto_origen * tipo_cambio);
        this.forceUpdate();
    }

    nesecitaRecalcularElTipoCambio() {
        if (!(this._ref["monto_origen"] && this._ref["monto_destino"] && this._ref["tipo_cambio"])) return false;
        const montoOrigen = parseFloat(this._ref["monto_origen"].getValue() ?? 0);
        const montoDestino = parseFloat(this._ref["monto_destino"].getValue() ?? 0);
        const tc = parseFloat(this._ref["tipo_cambio"].getValue() ?? 0);
        const tcc = montoDestino / montoOrigen
        return tc != (Math.round(tcc * 100000) / 100000);
    }
    _ref: any = {}
    render() {
        return <SView col={"xs-12"} center>
            <SText fontSize={18} color={STheme.color.lightGray}>{"Transferencia"}</SText>
            <SHr />
            <SView row col={"xs-12"}>
                <SView flex>
                    <SInput
                        ref={ref => this._ref["cuenta_origen"] = ref}
                        label={"Cuenta de origen"}
                        type="select2"
                        customStyle={"erp"}
                        options={this.state.data.map((c: any) => c.descripcion)}
                        onChangeText={e => {
                            const select = this.state.data.find((c: any) => c.descripcion == e)
                            if (select) {
                                this.state.origen = select;
                                this.calcular_tipo_cambio_cuentas();
                                this.forceUpdate();
                            } else if (this.state.origen) {
                                this.state.origen = null;
                                this.forceUpdate();
                            }
                        }}
                        placeholder={"Selecciona la cuenta de origen"}

                    />
                </SView>
                <SView width={4} />
                <SView width={160} >
                    <SInput icon={<SText width={40} numberOfLines={1}>{this.state?.origen?.moneda?.observacion}</SText>}
                        label={"Monto a enviar"}
                        customStyle={"erp"}
                        type="money2"
                        ref={ref => this._ref["monto_origen"] = ref}
                        iconR={<SView width={24} height={24} padding={2}><SIconApp name="Egreso" /></SView>}
                        onChangeText={e => {
                            this.calcular_tipo_cambio();
                        }}

                    />
                </SView>

            </SView>
            <SHr h={12} />
            <SView col="xs-12" row>
                <SView flex >
                    <SView row width={40} onPress={() => {
                        const origen = this.state.origen;
                        const destino = this.state.destino;
                        const monto_orige = this._ref["monto_origen"].getValue();
                        const monto_destino = this._ref["monto_destino"].getValue();
                        this.state.origen = destino;
                        this.state.destino = origen;
                        this._ref["cuenta_origen"].setValue(destino?.descripcion);
                        this._ref["cuenta_destino"].setValue(origen?.descripcion);
                        this._ref["monto_origen"].setValue(monto_destino);
                        this._ref["monto_destino"].setValue(monto_orige);
                        this.calcular_tipo_cambio_cuentas();
                        this.calcular_tipo_cambio();

                        this.forceUpdate();
                    }}>
                        <SView height={20} style={{
                            transform: [{ rotate: "-90deg" }]
                        }}>
                            <SIconApp name="Arrow" fill={STheme.color.lightGray} />
                        </SView>
                        <SView height={20} style={{
                            transform: [{ rotate: "90deg" }]
                        }}>
                            <SIconApp name="Arrow" fill={STheme.color.lightGray} />
                        </SView>
                    </SView>
                </SView>
                <SView width={100} >
                    <SInput
                        icon={<SView />}
                        label={"Tipo de cambio"}
                        customStyle={"erp"}
                        type="money2"
                        decimales={5}
                        defaultValue={1}
                        ref={ref => this._ref["tipo_cambio"] = ref}
                        onChangeText={e => {
                            if (!e) return;
                            this.forceUpdate();
                            console.log("Cambio el tipo cambio", e)
                        }}
                        iconR={<SView width={24} height={24} padding={2} onPress={() => {
                            if (this.nesecitaRecalcularElTipoCambio()) {
                                this.calcular_monto_destino_tipo_cambio();
                            }
                        }}>
                            {this.nesecitaRecalcularElTipoCambio() && <SIconApp name="Reload" fill={STheme.color.warning} />}
                        </SView>}

                    // iconR={<SView width={24} height={24} padding={2}><SIconApp name="Ingreso" /></SView>}
                    />
                </SView>
            </SView>
            <SHr h={16} />
            <SView row col={"xs-12"}>
                <SView flex>
                    <SInput
                        ref={ref => this._ref["cuenta_destino"] = ref}
                        label={"Cuenta de destino"}
                        type="select2"
                        customStyle={"erp"}
                        options={this.state.data.map((c: any) => c.descripcion)}
                        onChangeText={e => {
                            const select = this.state.data.find((c: any) => c.descripcion == e)
                            if (select) {
                                this.state.destino = select;
                                this.calcular_tipo_cambio_cuentas();
                                this.forceUpdate();
                            } else if (this.state.destino) {
                                this.state.destino = null;
                                this.forceUpdate();
                            }
                        }}
                        placeholder={"Selecciona la cuenta de destino"}

                    />
                </SView>
                <SView width={4} />
                <SView width={160} >
                    <SInput icon={<SText width={40} numberOfLines={1}>{this.state?.destino?.moneda?.observacion}</SText>}
                        label={"Monto a recibir"}
                        customStyle={"erp"}
                        type="money2"
                        ref={ref => this._ref["monto_destino"] = ref}
                        onChangeText={e => {
                            this.calcular_tipo_cambio();
                            // this.forceUpdate();
                        }}
                        iconR={<SView width={24} height={24} padding={2}><SIconApp name="Ingreso" /></SView>}
                    />
                </SView>

            </SView>
            <SHr h={40} />
            <SInput label={"Descripcion"} type="textArea"
                customStyle={"erp"}
                style={{
                    paddingTop: 4,
                }}
                ref={ref => this._ref["descripcion"] = ref}
                placeholder={"Ingresa el motivo de la transferencia..."}
            />
            <SHr h={16} />
            <SText card padding={4} onPress={this.submit.bind(this)}>{"ACEPTAR"}</SText>
        </SView>
    }
}