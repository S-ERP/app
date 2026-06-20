import React from "react";
import { SHr, SLoad, SNotification, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../../../MDL";
import InputSelector from "../../../../Components/Selectores/InputSelector";

export default class PopupAjusteStock extends React.Component {
    state = { almacenes: [], key_almacen: null, guardando: false }

    static open(props) {
        SPopup.open({
            key: "PopupAjusteStock",
            content: <SView style={{ width: "100%", maxWidth: 380, borderRadius: 8, borderWidth: 1, borderColor: STheme.color.card, backgroundColor: STheme.color.background }} withoutFeedback>
                <PopupAjusteStock {...props}
                    onCancel={() => { SPopup.close("PopupAjusteStock"); props.onCancel?.(); }}
                    onSuccess={(resp) => { SPopup.close("PopupAjusteStock"); props.onSuccess?.(resp); }}
                />
            </SView>
        });
    }

    async componentDidMount() {
        const almacenes = await MDL.inventario.getAllAlmacen();
        this.setState({ almacenes, key_almacen: almacenes[0]?.key });
    }

    async handleConfirmar() {
        const { modelo, stockActual, stockNuevo } = this.props;
        const { key_almacen } = this.state;
        const diff = Math.abs(stockNuevo - stockActual);
        const esCompra = stockNuevo > stockActual;
        this.setState({ guardando: true });
        try {
            // const conteo = await MDL.inventario.saveConteoManualInventario({
            //     key_almacen,
            //     data: [{
            //         key_modelo: modelo.key,
            //         stock: stockActual,
            //         cantidad_real: esCompra ? stockNuevo : stockActual,
            //         cantidad_baja: esCompra ? 0 : diff,
            //         explicacion: esCompra ? "Compra desde tabla de modelos" : "Pérdida declarada desde tabla de modelos",
            //     }]
            // });
            // await MDL.inventario.aplicar_cardex(conteo.key);
            this.props.onSuccess?.();
        } catch (err) {
            console.error(err);
            SNotification.send({ key: "ajuste_stock", title: "Error al ajustar stock", type: "danger", time: 3000 });
        }
        this.setState({ guardando: false });
    }

    render() {
        const { modelo, stockActual, stockNuevo } = this.props;
        const { almacenes, key_almacen, guardando } = this.state;
        const diff = stockNuevo - stockActual;
        const esCompra = diff > 0;
        const color = esCompra ? STheme.color.success : STheme.color.danger;

        return <SView padding={16}>
            <SText fontSize={14} bold>{modelo.descripcion}</SText>
            <SHr h={12} />
            <SView row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                <SText style={{ color: STheme.color.lightGray }}>Stock actual</SText>
                <SText bold>{stockActual}</SText>
            </SView>
            <SView row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                <SText style={{ color: STheme.color.lightGray }}>Stock nuevo</SText>
                <SText bold>{stockNuevo}</SText>
            </SView>
            <SView row style={{ justifyContent: "space-between", marginBottom: 12 }}>
                <SText style={{ color: STheme.color.lightGray }}>{esCompra ? "Compra de" : "Pérdida de"}</SText>
                <SText bold style={{ color }}>{esCompra ? "+" : "-"}{Math.abs(diff)}</SText>
            </SView>
            <SHr />
            <SHr h={12} />
            <SText fontSize={11} style={{ color: STheme.color.lightGray, marginBottom: 4 }}>Almacén</SText>
            {!almacenes.length ? <SLoad size="small" /> : <InputSelector
                defaultValue={key_almacen}
                options={almacenes.map(a => ({ label: a.descripcion, value: a.key }))}
                onSelect={opt => this.setState({ key_almacen: opt.value })}
                autoSelectOnBlur
            />}
            <SHr h={16} />
            <SView row style={{ justifyContent: "flex-end", gap: 8 }}>
                <SView onPress={() => this.props.onCancel?.()} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, backgroundColor: STheme.color.card }}>
                    <SText fontSize={12}>Cancelar</SText>
                </SView>
                <SView onPress={guardando ? null : this.handleConfirmar.bind(this)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, backgroundColor: color + "44" }}>
                    {guardando ? <SLoad size="small" /> : <SText fontSize={12} bold style={{ color }}>{esCompra ? "Registrar Compra" : "Declarar Pérdida"}</SText>}
                </SView>
            </SView>
        </SView>;
    }
}
