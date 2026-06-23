import React from "react";
import { SHr, SInput, SLoad, SNavigation, SNotification, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../../MDL";

type CargarEfectivoDelBancoProps = {
    key_caja?: string;
}

export default class CargarEfectivoDelBanco extends React.Component<CargarEfectivoDelBancoProps> {

    static open(props: CargarEfectivoDelBancoProps) {
        SPopup.open({
            key: "CargarEfectivoDelBanco",
            type: "1",
            content: <SView style={{
                maxWidth: 500,
                width: "100%",
                maxHeight: "100%",
                backgroundColor: STheme.color.background,
                borderRadius: 8,
                padding: 16,
                ...(({ cursor: "default", userSelect: "text" }) as any),
            }} withoutFeedback>
                <CargarEfectivoDelBanco {...props} />
            </SView>
        });
    }

    state: { cuentas_bancos: any[]; moneda: string; loading: boolean } = {
        cuentas_bancos: [],
        moneda: "",
        loading: false,
    }

    _ref: any = {}

    componentDidMount() {
        this._mounted = true;
        MDL.contabilidad.getCuentasByAjusteCache("bancos", true).then((data: any) => {
            const lista = Array.isArray(data) ? data : Object.values(data ?? {});
            if (this._mounted) this.setState({ cuentas_bancos: lista });
        }).catch(() => {});
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    format_cuenta(cuenta: any) {
        return `${cuenta.codigo} - ${cuenta.descripcion}`;
    }

    async submit() {
        const banco = this._ref["banco"]?.getValue?.() ?? "";
        const montoStr = this._ref["monto"]?.getValue?.() ?? "";
        const descripcion = this._ref["descripcion"]?.getValue?.() ?? "";

        if (!banco) throw "Selecciona un banco";
        const monto = parseFloat(montoStr) || 0;
        if (monto <= 0) throw "El monto debe ser mayor a 0";

        const _key_caja = this.props.key_caja ?? SNavigation.getParam("key");
        const caja = _key_caja
            ? await MDL.caja.getByKey(_key_caja)
            : MDL.caja.activa;
        if (!caja?.key) throw "Caja no encontrada";

        const cuenta: any = this.state.cuentas_bancos.find(c => this.format_cuenta(c) === banco);
        if (!cuenta) throw "Cuenta bancaria no encontrada";

        await MDL.caja.registro_detalle({
            key_caja: caja.key,
            descripcion: descripcion || "Ingreso desde banco",
            monto,
            tipo: "ingreso_banco",
            key_tipo_pago: "efectivo",
            fecha: caja.fecha,
            key_moneda: cuenta.key_moneda,
            key_cuenta_banco: cuenta.key,
        });
    }

    render() {
        const { loading, cuentas_bancos, moneda } = this.state;
        return (
            <SView col={"xs-12"} center>
                <SText bold fontSize={18}>Carga efectivo del banco</SText>
                <SHr />
                <SView row col={"xs-12"}>
                    <SView flex>
                        <SInput
                            ref={ref => this._ref["banco"] = ref}
                            label={"Banco"}
                            type="select2"
                            options={cuentas_bancos.map(c => this.format_cuenta(c))}
                            onChangeText={(e: string) => {
                                const cuenta = cuentas_bancos.find(c => this.format_cuenta(c) === e);
                                if (cuenta) this.setState({ moneda: cuenta.key_moneda ?? "" });
                            }}
                            placeholder={"Selecciona el banco"}
                        />
                    </SView>
                    <SView width={10} />
                    <SView width={160}>
                        <SInput
                            icon={<SText width={40} numberOfLines={1}>{moneda}</SText>}
                            label={"Monto"}
                            type="money2"
                            ref={ref => this._ref["monto"] = ref}
                        />
                    </SView>
                </SView>
                <SInput label={"Descripción"} type="textArea" ref={ref => this._ref["descripcion"] = ref} />
                <SHr h={16} />
                <SView width={160} height={40} center style={{
                    borderRadius: 6,
                    backgroundColor: loading ? STheme.color.card : STheme.color.success,
                }} onPress={() => {
                    if (loading) return;
                    this.setState({ loading: true });
                    this.submit().then(() => {
                        SNotification.send({
                            key: "ingreso_banco",
                            title: "Ingreso registrado",
                            body: "El efectivo fue cargado correctamente.",
                            color: STheme.color.success,
                            time: 4000,
                        });
                        SPopup.close("CargarEfectivoDelBanco");
                    }).catch((e: any) => {
                        if (this._mounted) this.setState({ loading: false });
                        SNotification.send({
                            key: "ingreso_banco",
                            title: "Error",
                            body: typeof e === "string" ? e : (e?.error ?? JSON.stringify(e)),
                            color: STheme.color.danger,
                            time: 5000,
                        });
                    });
                }}>
                    {loading ? <SLoad /> : <SText bold>ACEPTAR</SText>}
                </SView>
            </SView>
        );
    }
}
