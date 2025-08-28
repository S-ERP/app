import React from "react";
import { SForm, SHr, SInput, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../../MDL";
type CargarEfectivoDelBancoProps = {

}
export default class CargarEfectivoDelBanco extends React.Component<CargarEfectivoDelBancoProps> {
    static open(props: CargarEfectivoDelBancoProps) {
        SPopup.open({
            key: "CargarEfectivoDelBanco",
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
                <CargarEfectivoDelBanco {...props} />
            </SView>
        });
    }
    state = {
        cuentas_bancos: []
    }

    format_cuenta_to_string(cuenta: any) {
        return `${cuenta.codigo} - ${cuenta.descripcion}`;
    }
    componentDidMount(): void {
        MDL.contabilidad.getCuentasByAjusteCache("bancos", true).then((data) => {
            this.setState({ cuentas_bancos: data });
            console.log(data);
        })
    }

    async submit() {
        const data = {
            banco: this._ref["banco"].getValue(),
            monto: this._ref["monto"].getValue(),
            descripcion: this._ref["descripcion"].getValue(),
        }

        const caja = MDL.caja.activa;
        if (!caja) throw "Caja no encontrada";
        const cuenta: any = this.state.cuentas_bancos.find((c: any) => this.format_cuenta_to_string(c) == data.banco);
        if (!cuenta) throw "Cuenta no encontrada";
        await MDL.caja.registro_detalle({
            "key_caja": caja.key,
            "descripcion": data.descripcion,
            "monto": data.monto,
            "tipo": "ingreso_banco",
            "key_tipo_pago": "efectivo",
            "fecha": caja.fecha,
            key_cuenta_banco: cuenta.key,
        })
        console.log(data, cuenta);
    }
    _ref: any = {}
    render() {
        return <SView col={"xs-12"} center>
            <SText fontSize={18} color={STheme.color.lightGray}>{"Carga efectivo del banco"}</SText>
            <SHr />
            <SView row col={"xs-12"}>
                <SView flex>
                    <SInput
                        ref={ref => this._ref["banco"] = ref}
                        label={"Banco"}
                        type="select2"
                        options={this.state.cuentas_bancos.map((c: any) => this.format_cuenta_to_string(c))}
                        placeholder={"Selecciona el banco"}
                    />
                </SView>
                <SView width={10} />
                <SView width={160} >
                    <SInput label={"Monto"} type="money2" ref={ref => this._ref["monto"] = ref} />
                </SView>
            </SView>
            <SInput label={"Descripcion"} type="textArea" ref={ref => this._ref["descripcion"] = ref} />
            <SHr h={16} />
            <SText onPress={() => {
                SNotification.send({
                    key: "enviar",
                    title: "Enviando"
                })
                this.submit().then(e => {
                    SNotification.remove("enviar")
                }).catch(e => {
                    SNotification.send({
                        key: "enviar",
                        title: "Error",
                        body: e,
                        time: 5000
                    })
                })
            }}>{"ACEPTAR"}</SText>
        </SView>
    }
}