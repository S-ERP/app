import React from "react";
import { SHr, SInput, SLoad, SNavigation, SNotification, SPopup, SText, STheme, SThread, SView } from "servisofts-component";
import MDL from "../../../MDL";
import SIconApp from "../../../Assets/SIconApp";
import InputSelector from "../../../Components/Selectores/InputSelector";
import SInput2 from "../../../Components/SForm2/SInput2";

type TransferenciaProps = {
    origen_inicial?: any;
    monto_origen_inicial?: number;
    destino_inicial?: any;
    monto_destino_inicial?: number | string;
}

export default class Transferencia extends React.Component<TransferenciaProps> {
    static open(props: TransferenciaProps) {
        SPopup.open({
            key: "Transferencia",
            type: "1",
            content: <SView style={{ maxWidth: 500, width: "100%", maxHeight: "100%", backgroundColor: STheme.color.background, borderRadius: 8, cursor: "default", userSelect: "text", padding: 16, } as any} withoutFeedback>
                <Transferencia {...props} />
            </SView>
        });
    }

    _mounted = false;
    _ref: any = {};
    _calculando = false;
    _origenSelectorRef: any = null;
    _destinoSelectorRef: any = null;
    state: { data: any[]; origen: any; destino: any; loading: boolean } = {
        data: [],
        origen: this.props.origen_inicial ?? null,
        destino: this.props.destino_inicial ?? null,
        loading: false,
    }

    async componentDidMount(): Promise<void> {
        this._mounted = true;
        try {
            const _key_caja = SNavigation.getParam("key");
            let key_punto_venta: string | undefined;
            if (_key_caja) {
                const caja = await MDL.caja.getByKey(_key_caja);
                key_punto_venta = caja?.key_punto_venta;
            } else {
                key_punto_venta = MDL.caja.activa?.key_punto_venta;
            }
            if (!key_punto_venta) throw "No se encontró una caja activa";
            const data = await MDL.empresa.tipo_pagoGetFullCaja(key_punto_venta);
            if (!this._mounted) return;
            this.setState({ data: Array.isArray(data) ? data : Object.values(data ?? {}) }, () => {
                if (this.props.origen_inicial?.key) {
                    this._origenSelectorRef?.setValue(this.props.origen_inicial.key);
                }
                if (this.props.destino_inicial?.key) {
                    this._destinoSelectorRef?.setValue(this.props.destino_inicial.key);
                }
                if (this.props.origen_inicial || this.props.destino_inicial) {
                    this.calcular_tipo_cambio_cuentas();
                }
                if (this.props.monto_origen_inicial && this.props.monto_origen_inicial > 0) {
                    this._ref["monto_origen"]?.setValue(this.props.monto_origen_inicial);
                    this.calcular_destino_desde_origen();
                } else if (Number(this.props.monto_destino_inicial) > 0) {
                    this._ref["monto_destino"]?.setValue(this.props.monto_destino_inicial);
                    this.forceUpdate();
                }
            });
        } catch (e: any) {
            if (!this._mounted) return;
            SNotification.send({ key: "transferencia_load", title: "Error al cargar cuentas", body: e?.error ?? JSON.stringify(e), color: STheme.color.danger, time: 5000 });
        }
    }

    componentWillUnmount(): void {
        this._mounted = false;
    }

    async submit() {
        if (this.state.loading) return;
        try {
            const _key_caja = SNavigation.getParam("key");
            const key_caja_final = _key_caja ? _key_caja : MDL.caja.activa?.key;
            if (!key_caja_final) throw "Caja no encontrada";
            if (!this.state?.origen?.key) throw "Selecciona la cuenta de origen";
            if (!this.state?.destino?.key) throw "Selecciona la cuenta de destino";
            if (this.state.origen.key === this.state.destino.key) throw "La cuenta de origen y destino no pueden ser la misma";
            const monto_origen = parseFloat(this._ref["monto_origen"]?.getValue() ?? "0") || 0;
            const monto_destino = parseFloat(this._ref["monto_destino"]?.getValue() ?? "0") || 0;
            if (monto_origen <= 0) throw "El monto de origen debe ser mayor a 0";
            if (monto_destino <= 0) throw "El monto de destino debe ser mayor a 0";
            if (!MDL.usuario.session?.key) throw "Sesión de usuario no encontrada";
            if (!this.state.origen?.moneda?.key) throw `La cuenta "${this.state.origen.descripcion}" no tiene moneda configurada`;
            if (!this.state.destino?.moneda?.key) throw `La cuenta "${this.state.destino.descripcion}" no tiene moneda configurada`;
            const tipo_cambio = parseFloat(this._ref["tipo_cambio"]?.getValue() ?? "1") || 1;
            const data = {
                key_usuario: MDL.usuario.session?.key,
                key_caja: key_caja_final,
                key_empresa_tipo_pago_origen: this.state.origen.key,
                key_empresa_tipo_pago_destino: this.state.destino.key,
                monto_origen,
                monto_destino,
                tipo_cambio,
                descripcion: this._ref["descripcion"]?.getValue() || "",
            }
            this.setState({ loading: true });
            await MDL.caja.traspaso(data);
            SNotification.send({ key: "enviar", title: "Transferencia exitosa", body: `Se transfirió correctamente de "${this.state.origen.descripcion}" a "${this.state.destino.descripcion}".`, color: STheme.color.success, time: 4000 });
            SPopup.close("Transferencia");
        } catch (e: any) {
            if (this._mounted) this.setState({ loading: false });
            const body = typeof e === "string" ? e : (e?.error ?? JSON.stringify(e));
            SNotification.send({ key: "enviar", title: "Error en transferencia", body, color: STheme.color.danger, time: 5000 });
        }
    }

    calcular_tipo_cambio() {
        new SThread(200, "calcular_tipo_cambio", true).start(() => {
            if (!this._ref["monto_origen"] || !this._ref["monto_destino"] || !this._ref["tipo_cambio"]) return;
            const montoOrigen = parseFloat(this._ref["monto_origen"].getValue()) || 0;
            const montoDestino = parseFloat(this._ref["monto_destino"].getValue()) || 0;
            if (montoOrigen > 0 && montoDestino > 0) {
                this._ref["tipo_cambio"].setValue(Math.round((montoDestino / montoOrigen) * 100000) / 100000);
            }
            this.forceUpdate();
        })
    }

    calcular_destino_desde_origen() {
        if (this._calculando) return;
        new SThread(200, "calc_destino_origen", true).start(() => {
            if (this._calculando) return;
            const montoOrigen = parseFloat(this._ref["monto_origen"]?.getValue()) || 0;
            const tc = parseFloat(this._ref["tipo_cambio"]?.getValue()) || 1;
            if (montoOrigen > 0) {
                this._calculando = true;
                this._ref["monto_destino"]?.setValue(Math.round(montoOrigen * tc * 100) / 100);
                this._calculando = false;
            }
            this.forceUpdate();
        })
    }

    calcular_origen_desde_destino() {
        if (this._calculando) return;
        new SThread(200, "calc_origen_destino", true).start(() => {
            if (this._calculando) return;
            const montoDestino = parseFloat(this._ref["monto_destino"]?.getValue()) || 0;
            const tc = parseFloat(this._ref["tipo_cambio"]?.getValue()) || 1;
            if (montoDestino > 0 && tc > 0) {
                this._calculando = true;
                this._ref["monto_origen"]?.setValue(Math.round(montoDestino / tc * 100) / 100);
                this._calculando = false;
            }
            this.forceUpdate();
        })
    }

    calcular_tipo_cambio_cuentas() {
        new SThread(200, "calcular_tipo_cambio_cuentas", true).start(() => {
            if (!this.state.origen || !this._ref["monto_origen"] || !this._ref["monto_destino"] || !this._ref["tipo_cambio"]) return;
            const tco = this.state?.origen?.moneda?.tipo_cambio ?? 1;
            const tcd = this.state?.destino?.moneda?.tipo_cambio ?? 1;
            const montoOrigen = parseFloat(this._ref["monto_origen"].getValue()) || 0;
            const montoDestino = parseFloat(this._ref["monto_destino"].getValue()) || 0;
            const tc = tcd > 0 ? tco / tcd : 1;
            if (montoOrigen > 0) {
                this._ref["monto_destino"].setValue(montoOrigen * tc);
            } else if (montoDestino > 0 && tc > 0) {
                this._ref["monto_origen"].setValue(montoDestino / tc);
            }
            this._ref["tipo_cambio"].setValue(tc);
            this.forceUpdate();
        })
    }

    calcular_monto_destino_tipo_cambio() {
        if (!this._ref["monto_origen"] || !this._ref["tipo_cambio"] || !this._ref["monto_destino"]) return;
        const monto_origen = parseFloat(this._ref["monto_origen"].getValue()) || 0;
        const monto_destino = parseFloat(this._ref["monto_destino"].getValue()) || 0;
        const tipo_cambio = parseFloat(this._ref["tipo_cambio"].getValue()) || 0;
        if (monto_origen > 0) {
            this._ref["monto_destino"].setValue(Math.round(monto_origen * tipo_cambio * 100) / 100);
        } else if (monto_destino > 0 && tipo_cambio > 0) {
            this._ref["monto_origen"].setValue(Math.round(monto_destino / tipo_cambio * 100) / 100);
        }
        this.forceUpdate();
    }

    getIconForCuenta(c: any): string {
        return c?.tipo_pago?.icon ?? "";
    }

    nesecitaRecalcularElTipoCambio() {
        if (!this._ref["monto_origen"] || !this._ref["monto_destino"] || !this._ref["tipo_cambio"]) return false;
        const montoOrigen = parseFloat(this._ref["monto_origen"].getValue()) || 0;
        const montoDestino = parseFloat(this._ref["monto_destino"].getValue()) || 0;
        const tc = parseFloat(this._ref["tipo_cambio"].getValue()) || 0;
        if (montoDestino > 0 && montoOrigen <= 0) return true;
        if (montoOrigen <= 0) return false;
        const tcc = montoDestino / montoOrigen;
        return tc !== Math.round(tcc * 100000) / 100000;
    }

    render() {
        const { loading } = this.state;
        return <SView col={"xs-12"} center>
            <SText fontSize={18} color={STheme.color.lightGray}>{"Transferencia"}</SText>
            <SHr />
            <SView row col={"xs-12"}>


                <SView flex style={{ height: 36, backgroundColor: STheme.color.card, borderRadius: 2 }}>
                    <InputSelector
                        icon={this.state.origen ? <SIconApp name={this.state.origen?.tipo_pago?.icon as any} fill={STheme.color.primary} width={16} height={16} /> : undefined}
                        label={"Cuenta de origen"}
                        customStyle="erp"
                        placeholder="Selecciona la cuenta de origen"
                        options={[...this.state.data]
                            .filter((c: any) => c.key !== this.state.destino?.key)
                            .sort((a: any, b: any) => {
                                const ta = (a?.key_tipo_pago ?? "").toLowerCase();
                                const tb = (b?.key_tipo_pago ?? "").toLowerCase();
                                if (ta !== tb) return ta.localeCompare(tb);
                                return (a?.descripcion ?? "").localeCompare(b?.descripcion ?? "");
                            })
                            .map((c: any) => ({
                                label: c.descripcion,
                                value: c.key,
                                data: c,
                                customComponent: <SIconApp name={c?.tipo_pago?.icon as any} fill={STheme.color.primary} width={16} height={16} />,
                            }))}
                        ref={(ref: any) => (this._origenSelectorRef = ref)}
                        defaultValue={this.state.origen?.key ?? null}
                        onSelect={(selected: any) => {
                            this.setState({ origen: selected.data }, () => {
                                this.calcular_tipo_cambio_cuentas();
                            });
                        }}
                    />
                </SView>
                {/* </SView> */}
                <SView width={4} />
                <SView width={160}>


                    <SInput2
                        ref={ref => this._ref["monto_origen"] = ref}
                        icon={<SText width={40} color={this.state?.origen?.moneda?.observacion ? STheme.color.text : STheme.color.lightGray + "66"}>{this.state?.origen?.moneda?.observacion ?? "$"}</SText>}
                        label={"Monto a enviar"}
                        placeholder="0.00"

                        type="money"
                        iconR={<SView width={24} height={24} padding={2}><SIconApp name="Egreso" /></SView>}
                        onChangeText={() => { this.calcular_destino_desde_origen(); }}
                    />
                </SView>
            </SView>
            <SHr h={12} />
            <SView col="xs-12" row>
                <SView flex>
                    <SView row width={40} onPress={() => {
                        const origen = this.state.origen;
                        const destino = this.state.destino;
                        const monto_orige = this._ref["monto_origen"]?.getValue();
                        const monto_destino = this._ref["monto_destino"]?.getValue();
                        this.setState({ origen: destino, destino: origen }, () => {
                            this._origenSelectorRef?.setValue(destino?.key ?? null);
                            this._destinoSelectorRef?.setValue(origen?.key ?? null);
                            this._ref["monto_origen"]?.setValue(monto_destino);
                            this._ref["monto_destino"]?.setValue(monto_orige);
                            this.calcular_tipo_cambio_cuentas();
                        });
                    }}>
                        <SView height={20} style={{ transform: [{ rotate: "-90deg" }] }}>
                            <SIconApp name="Arrow" fill={STheme.color.lightGray} />
                        </SView>
                        <SView height={20} style={{ transform: [{ rotate: "90deg" }] }}>
                            <SIconApp name="Arrow" fill={STheme.color.lightGray} />
                        </SView>
                    </SView>
                </SView>
                <SView width={100}>
                    <SInput
                        icon={<SView />}
                        label={"Tipo de cambio"}
                        customStyle={"erp"}
                        type="money2"

                        decimales={5}
                        defaultValue={1}
                        ref={ref => this._ref["tipo_cambio"] = ref}
                        onChangeText={e => { if (!e) return; this.forceUpdate(); }}
                        iconR={<SView width={24} height={24} padding={2} onPress={() => {
                            if (this.nesecitaRecalcularElTipoCambio()) {
                                this.calcular_monto_destino_tipo_cambio();
                            }
                        }}>
                            {this.nesecitaRecalcularElTipoCambio() && <SIconApp name="Reload" fill={STheme.color.warning} />}
                        </SView>}
                    />
                </SView>
            </SView>
            <SHr h={16} />
            <SView row col={"xs-12"}>
                {/* <SView flex> */}
                <SView flex style={{ height: 36, backgroundColor: STheme.color.card, borderRadius: 2 }}>
                    <InputSelector
                        label={"Cuenta de destino"}
                        icon={this.state.destino ? <SIconApp name={this.state.destino?.tipo_pago?.icon as any} fill={STheme.color.primary} width={16} height={16} /> : undefined}
                        customStyle="erp"
                        placeholder="Selecciona la cuenta de destino"
                        options={[...this.state.data]
                            .filter((c: any) => c.key !== this.state.origen?.key)
                            .sort((a: any, b: any) => {
                                const ta = (a?.key_tipo_pago ?? "").toLowerCase();
                                const tb = (b?.key_tipo_pago ?? "").toLowerCase();
                                if (ta !== tb) return ta.localeCompare(tb);
                                return (a?.descripcion ?? "").localeCompare(b?.descripcion ?? "");
                            })
                            .map((c: any) => ({
                                label: c.descripcion,
                                value: c.key,
                                data: c,
                                customComponent: <SIconApp name={c?.tipo_pago?.icon as any} fill={STheme.color.primary} width={16} height={16} />,
                            }))}
                        ref={(ref: any) => (this._destinoSelectorRef = ref)}
                        defaultValue={this.state.destino?.key ?? null}
                        onSelect={(selected: any) => {
                            this.setState({ destino: selected.data }, () => {
                                this.calcular_tipo_cambio_cuentas();
                            });
                        }}
                    />
                </SView>
                <SView width={4} />
                <SView width={160}>


                    <SInput2
                        label={"Monto a recibir"}
                        type="money"
                        icon={<SText width={40} color={this.state?.destino?.moneda?.observacion ? STheme.color.text : STheme.color.lightGray + "66"}>{this.state?.destino?.moneda?.observacion ?? "$"}</SText>}
                        ref={ref => this._ref["monto_destino"] = ref}
                        onChangeText={() => { this.calcular_origen_desde_destino(); }}
                        iconR={<SView width={24} height={24} padding={2}><SIconApp name="Ingreso" /></SView>}
                    />
                </SView>
            </SView>
            <SHr h={40} />
            <SInput label={"Motivo de la transferencia"} type="textArea" customStyle={"erp" as any} style={{ paddingTop: 4 }}
                ref={ref => this._ref["descripcion"] = ref}
                placeholder={"Ingrese una descripción o motivo..."}
            />
            <SHr h={16} />
            <SView row style={{ gap: 12 } as any}>
                <SView card padding={4} style={{ minWidth: 100, alignItems: "center", justifyContent: "center" }} onPress={() => SPopup.close("Transferencia")}>
                    <SText color={STheme.color.danger}>{"Cancelar"}</SText>
                </SView>
                <SView card padding={4} style={{ minWidth: 100, alignItems: "center", justifyContent: "center", opacity: loading ? 0.6 : 1 }} onPress={() => { if (!loading) this.submit(); }}>
                    {loading ? <SLoad /> : <SText>{"Confirmar Transferencia"}</SText>}
                </SView>
            </SView>
        </SView>
    }
}
