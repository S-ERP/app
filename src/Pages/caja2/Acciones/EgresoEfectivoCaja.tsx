import React from "react";
import { SHr, SInput, SLoad, SNavigation, SNotification, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../../MDL";

type EgresoEfectivoCajaProps = {
    key_caja?: string;
}

export default class EgresoEfectivoCaja extends React.Component<EgresoEfectivoCajaProps> {

    static open(props: EgresoEfectivoCajaProps) {
        SPopup.open({
            key: "EgresoEfectivoCaja",
            type: "1",
            content: <SView style={{
                maxWidth: 500,
                width: "100%",
                maxHeight: "100%",
                backgroundColor: STheme.color.background,
                borderRadius: 8,
                padding: 16,
                ...({ cursor: "default", userSelect: "text" } as any),
            }} withoutFeedback>
                <EgresoEfectivoCaja {...props} />
            </SView>
        });
    }

    static close() {
        SPopup.close("EgresoEfectivoCaja");
    }

    state: { monedas: any[]; loading: boolean } = {
        monedas: [],
        loading: false,
    }

    _ref: any = {}

    componentDidMount() {
        this._mounted = true;
        MDL.empresa.getFull().then((data: any) => {
            const monedas = Array.isArray(data?.monedas) ? data.monedas : Object.values(data?.monedas ?? {});
            if (this._mounted) this.setState({ monedas });
        }).catch(() => {});
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    async submit() {
        const montoStr = this._ref["monto"]?.getValue?.() ?? "";
        const descripcion = this._ref["descripcion"]?.getValue?.() ?? "";
        const monedaLabel = this._ref["moneda"]?.getValue?.() ?? "";

        const monto = parseFloat(montoStr) || 0;
        if (monto <= 0) throw "El monto debe ser mayor a 0";

        const _key_caja = this.props.key_caja ?? SNavigation.getParam("key");
        const caja = _key_caja
            ? await MDL.caja.getByKey(_key_caja)
            : MDL.caja.activa;
        if (!caja?.key) throw "Caja no encontrada";

        const moneda = this.state.monedas.find(m => m.descripcion === monedaLabel)
            ?? this.state.monedas.find(m => m.tipo === "base");
        if (!moneda?.key) throw "Selecciona una moneda";

        await MDL.caja.registro_detalle({
            key_caja: caja.key,
            descripcion: descripcion || "Egreso de efectivo",
            monto: monto * -1,
            tipo: "egreso_efectivo",
            key_tipo_pago: "efectivo",
            fecha: caja.fecha,
            key_moneda: moneda.key,
        });
    }

    render() {
        const { loading, monedas } = this.state;
        return (
            <SView col={"xs-12"} center>
                <SText bold fontSize={18} color={STheme.color.danger}>Egreso de efectivo</SText>
                <SHr />
                <SView row col={"xs-12"}>
                    <SView flex>
                        <SInput
                            ref={ref => this._ref["moneda"] = ref}
                            label={"Moneda"}
                            type="select2"
                            options={monedas.map(m => m.descripcion)}
                            defaultValue={monedas.find(m => m.tipo === "base")?.descripcion ?? ""}
                            placeholder={"Selecciona la moneda"}
                        />
                    </SView>
                    <SView width={10} />
                    <SView width={160}>
                        <SInput
                            label={"Monto"}
                            type="money2"
                            ref={ref => this._ref["monto"] = ref}
                        />
                    </SView>
                </SView>
                <SInput label={"Descripción"} type="textArea" ref={ref => this._ref["descripcion"] = ref} />
                <SHr h={16} />
                <SView row style={{ justifyContent: "flex-end" }} col={"xs-12"}>
                    <SView width={100} height={40} center style={{
                        borderRadius: 6,
                        backgroundColor: STheme.color.card,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        marginRight: 8,
                    }} onPress={() => EgresoEfectivoCaja.close()}>
                        <SText>Cancelar</SText>
                    </SView>
                    <SView width={140} height={40} center style={{
                        borderRadius: 6,
                        backgroundColor: loading ? STheme.color.card : STheme.color.danger,
                    }} onPress={() => {
                        if (loading) return;
                        this.setState({ loading: true });
                        this.submit().then(() => {
                            SNotification.send({
                                key: "egreso_efectivo",
                                title: "Egreso registrado",
                                body: "El egreso fue registrado correctamente.",
                                color: STheme.color.success,
                                time: 4000,
                            });
                            EgresoEfectivoCaja.close();
                        }).catch((e: any) => {
                            if (this._mounted) this.setState({ loading: false });
                            SNotification.send({
                                key: "egreso_efectivo",
                                title: "Error al registrar egreso",
                                body: typeof e === "string" ? e : (e?.error ?? JSON.stringify(e)),
                                color: STheme.color.danger,
                                time: 5000,
                            });
                        });
                    }}>
                        {loading ? <SLoad /> : <SText bold>CONFIRMAR</SText>}
                    </SView>
                </SView>
            </SView>
        );
    }
}
