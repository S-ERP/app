import React from "react";
import { TextStyle, View, ViewStyle } from "react-native";
import { SHr, SInput, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../../MDL";
import tipo from "../../whatsapp/tipo";

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

    state: any = {
        base: "",
    }
    monedas: any = []

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
        console.log(monedas)
    }
    submit() {
        const monedaStr = this._ref.moneda.getValue();
        const moneda = this.monedas.find((a: any) => a.descripcion == monedaStr);
        const cuenta_contable = {
            key: this.props.cuenta_contable?.key,
            tipo: this._ref.tipo.getValue(),
            codigo: this._ref.codigo.getValue(),
            descripcion: this._ref.descripcion.getValue(),
            key_moneda: moneda?.key ?? "",
        };
        console.log("CuentaContableForm.submit", cuenta_contable);
        MDL.contabilidad.cuenta_contable.save(cuenta_contable).then(e => {
            SPopup.close("CuentaContableForm");
            if (this.props.onChange) {
                this.props.onChange(e);
            }
        }).catch(e => {
            console.error("Error saving cuenta_contable:", e);
            // SPopup.alert({
            //     title: "Error",
            //     message: "No se pudo guardar la cuenta contable. Intente nuevamente.",
            // });
        })
        // MDL.contabilidad.saveAjusteEmpresa({
        //     key: this.props?.ajuste?.ajuste_empresa?.key,
        //     estado: 0,
        // }).then(e => {
        //     if (this.props.onPress) {
        //         this.props.onPress();
        //     }
        //     SPopup.close("CuentaContableForm");
        // })
    }
    _ref: any = {}
    render() {
        const { cuenta_contable, onPress } = this.props;
        return <View
            style={{
                width: 500,
                maxWidth: "100%",
                borderRadius: 8,
                backgroundColor: STheme.color.background,
            }}>
            <SView flex col={"xs-12"} withoutFeedback padding={16} center>
                <SText fontSize={14} bold>{"Editar la cuenta"}</SText>
                <SHr height={8} />
                <SView col={"xs-12"} row>
                    <SView width={80}>
                        <SInput ref={ref => this._ref.tipo = ref}
                            customStyle={"erp"}
                            label={"Tipo"}
                            defaultValue={cuenta_contable?.tipo} placeholder={"Tipo"}
                            style={{
                                padding: 2,
                            }}
                            type="select2"
                            options={["ACTIVO", "PASIVO", "PATRIMONIO", "INGRESO", "GASTO"]}
                        />
                    </SView>
                    <SView width={4} />
                    <SView flex>
                        <SInput ref={ref => this._ref.codigo = ref}

                            customStyle={"erp"}
                            label={"Codigo"}
                            defaultValue={cuenta_contable?.codigo} placeholder={"Codigo"} />
                    </SView>
                </SView>
                <SHr height={16} />
                <SInput ref={ref => this._ref.descripcion = ref}
                    customStyle={"erp"}
                    label={"Descripcion"}
                    defaultValue={cuenta_contable?.descripcion} placeholder={"Descripcion de la cuenta"} />
                <SHr height={16} />
                <SInput width={150}
                    customStyle={"erp"}
                    label={"Moneda"}
                    ref={ref => this._ref.moneda = ref}
                    defaultValue={(cuenta_contable?.key_moneda || this.state.base)} placeholder={"Moneda"}
                    style={{
                        padding: 2,
                    }}
                    type="select2"
                    options={this.monedas.map((e: any) => e.descripcion)}
                />

                <SHr height={32} />
                <SView row col={"xs-12"}>
                    <SView flex />
                    <SText card padding={8} onPress={() => {
                        SPopup.close("CuentaContableForm");
                    }}>{"CANCELAR"}</SText>
                    <SView flex />
                    <SText card padding={8} onPress={this.submit.bind(this)}>{"ACEPTAR"}</SText>
                    <SView flex />
                </SView>
            </SView>

        </View>
    }
}