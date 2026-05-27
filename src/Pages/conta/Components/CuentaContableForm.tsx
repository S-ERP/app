import React from "react";
import { View, ViewStyle } from "react-native";
import { SHr, SInput, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../../MDL";

type Props = {
    cuenta_contable: any,
    onChange?: (cuenta_contable: any) => void,
    style?: ViewStyle,
}

export default class CuentaContableForm extends React.Component<Props> {
    static open(props: Props) {
        SPopup.open({
            key: "CuentaContableForm",
            content: <CuentaContableForm {...props} />,
        })
    }

    componentDidMount(): void {
        this.loadData();
    }

    state: any = { base: "", submitting: false}
    monedas: any = []
    isSubmitting: boolean = false;
    _ref: any = {}

    monedaToString(a: any) {
        return a?.descripcion
    }
    async loadData() {
        const empresa = await MDL.empresa.getFull();
        const monedas = empresa.monedas;
        this.monedas = monedas ?? [];
        const mob = this.monedas.find((a: any) => a.tipo == "base")
        this.state.base = this.monedaToString(mob);
        if (this.props.cuenta_contable?.key_moneda) {
            const moneda = this.monedas.find((a: any) => a.key == this.props.cuenta_contable.key_moneda);
            this._ref.moneda.setValue(this.monedaToString(moneda));
        } else {
            this._ref.moneda.setValue(this.state.base)
        }
        this.forceUpdate();
    }

    submit() {
        if (this.isSubmitting) return;
        this.isSubmitting = true;
        this.setState({ submitting: true });
        const monedaStr = this._ref.moneda.getValue();
        const moneda = this.monedas.find((a: any) => a.descripcion == monedaStr);
        const cuenta_contable = {
            key: this.props.cuenta_contable?.key,
            tipo: this._ref.tipo.getValue(),
            codigo: this._ref.codigo.getValue(),
            descripcion: this._ref.descripcion.getValue(),
            key_moneda: moneda?.key ?? "",
        };
        MDL.contabilidad.cuenta_contable.save(cuenta_contable).then(e => {
            SPopup.close("CuentaContableForm");
            SNotification.send({
                title: "Registro exitoso",
                body: "Sub cuenta agregada correctamente",
                color: STheme.color.success,
                time: 3000,
            })
            if (this.props.onChange) {
                this.props.onChange(e);
            }
        }).catch(e => {
            this.isSubmitting = false;
            this.setState({ submitting: false });
            console.error("Error saving cuenta_contable:", e);
            SNotification.send({
                title: "Error",
                body: "Sub cuenta no agregada correctamente",
                color: STheme.color.danger,
                time: 3000,
            })
        })
    }

    render() {
        const { cuenta_contable, onPress } = this.props;
        return <View style={{ width: 500, maxWidth: "100%", borderRadius: 8, backgroundColor: STheme.color.background}}>
            <SView flex col={"xs-12"} withoutFeedback padding={16} center>
                <SText fontSize={14} bold>{"Datos de la cuenta"}</SText>
                <SHr height={8} />
                <SView col={"xs-12"} row>
                    <SView width={80}>
                        <SInput ref={ref => this._ref.tipo = ref}
                            customStyle={"erp"}
                            label={"Tipo"}
                            defaultValue={cuenta_contable?.tipo} placeholder={"Tipo"}
                            style={{ padding: 2}}
                            type="select2"
                            options={["ACTIVO", "PASIVO", "PATRIMONIO", "INGRESO", "GASTO"]}
                        />
                    </SView>
                    <SView width={4} />
                    <SView flex>
                        <SInput ref={ref => this._ref.codigo = ref} customStyle={"erp"} label={"Codigo"} defaultValue={cuenta_contable?.codigo} placeholder={"Codigo"} />
                    </SView>
                </SView>
                <SHr height={16} />
                <SInput ref={ref => this._ref.descripcion = ref} customStyle={"erp"} label={"Descripcion"} defaultValue={cuenta_contable?.descripcion} placeholder={"Descripcion de la cuenta"} />
                <SHr height={16} />
                <SInput width={150} customStyle={"erp"} label={"Moneda"} ref={ref => this._ref.moneda = ref} defaultValue={(cuenta_contable?.key_moneda || this.state.base)} placeholder={"Moneda"} style={{ padding: 2}} type="select2" options={this.monedas.map((e: any) => e.descripcion)} />
                <SHr height={32} />
                <SView row col={"xs-12"} style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <SView flex />
                    <SView center style={{ backgroundColor: STheme.color.danger, borderRadius: 4, minWidth: 85, width: 90, height: 32 }} onPress={() => { SPopup.close("CuentaContableForm"); }}> <SText center>CANCELAR</SText> </SView>
                    <SView flex />
                    <SView center style={{ backgroundColor: STheme.color.card, borderRadius: 4, minWidth: 85, width: 90, height: 32 }} onPress={this.state.submitting ? undefined : () => this.submit()}> <SText center>{this.state.submitting ? "Cargando..." : "ACEPTAR"}</SText> </SView>
                    <SView flex />
                </SView>
            </SView>
        </View>
    }
}