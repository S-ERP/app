import React from "react";
import { View } from "react-native";
import { SHr, SImage, SInput, SLoad, SNotification, SPage, SPopup, SText, STheme, SUuid, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import Config from "../../../Config";
import MDL from "../../../MDL";
import { DinamicTable } from "servisofts-table";
import FloatButtom from "../../../Components/FloatButtom";
import SInput2 from "../../../Components/SForm2/SInput2";
import InputSelector, { pushGlobalUndo } from "../../../Components/Selectores/InputSelector";
import SIconApp from "../../../Assets/SIconApp";
import SUpload from "../../../Components/SUpload";
import FormularioTipoProducto from "../Components/FormularioTipoProducto";
import PopupAgregarMarca from "../marca/Components/PopupAgregarMarca";

function tipoProductoEstaCompleto(tipo) {
    if (!tipo) return true;
    const config = MDL.inventario.TIPOS_DE_PRODUCTOS.find(t => t.key === tipo.tipo);
    if (!config) return true;
    return config.cuentas.every(campo => !!tipo[campo]);
}

class FotoCell extends React.Component {
    state = { localSrc: null, uploading: false }

    async handlePress() {
        try {
            const files = await SUpload.choose({ accept: "image/*", multiple: false });
            if (!files?.length) return;
            const file = Array.from(files)[0];
            this.setState({ localSrc: URL.createObjectURL(file), uploading: true });
            const formData = new FormData();
            formData.append("file", file);
            await fetch(SSocket.api.inventario + "upload/modelo/" + this.props.rowKey, {
                method: "POST",
                body: formData,
            });
            this.setState({ uploading: false });
        } catch (e) {
            this.setState({ uploading: false });
            console.error("Error subiendo foto:", e);
        }
    }

    render() {
        const { localSrc, uploading } = this.state;
        const src = localSrc || (SSocket.api.inventario + "modelo/.128_" + this.props.rowKey);
        const size = 24;
        return <SView onPress={this.handlePress.bind(this)} style={{
            width: size, height: size, borderRadius: 3, overflow: "hidden", margin: 1,
            backgroundColor: STheme.color.card,
        }}>
            <SImage src={src} style={{ width: size, height: size, resizeMode: "cover" }} />
            {uploading && <SView style={{
                position: "absolute", width: size, height: size,
                backgroundColor: "#00000066", justifyContent: "center", alignItems: "center",
            }}>
                <SLoad size="small" />
            </SView>}
        </SView>;
    }
}

class StockCell extends React.Component {
    constructor(props) {
        super(props);
        this.currentValue = props.row.stock ? parseFloat(props.row.stock) : 0;
        this.state = { resetKey: 0 };
    }

    render() {
        const { row, table, inputStyle } = this.props;
        const { resetKey } = this.state;
        const stockActual = row.stock ? parseFloat(row.stock) : 0;
        return <SInput2
            key={"sinput" + row.key + resetKey}
            type="money"
            defaultValue={stockActual ? String(stockActual) : undefined}
            placeholder="0"
            placeholderTextColor={STheme.color.text + "44"}
            onChangeText={val => {
                this.currentValue = parseFloat(val.replace(/\./g, "").replace(",", ".")) || 0;
            }}
            onBlur={() => {
                const nuevo = this.currentValue;
                if (nuevo === stockActual) return;
                PopupAjusteStock.open({
                    modelo: row,
                    stockActual,
                    stockNuevo: nuevo,
                    onCancel: () => this.setState(prev => ({ resetKey: prev.resetKey + 1 })),
                    onSuccess: () => {
                        row.stock = nuevo;
                        table.applyFormatData().then(() => table.applyFilter());
                    },
                });
            }}
            style={{ ...inputStyle, textAlign: "right" }}
        />;
    }
}

class PopupAjusteStock extends React.Component {
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
            const conteo = await MDL.inventario.saveConteoManualInventario({
                key_almacen,
                data: [{
                    key_modelo: modelo.key,
                    stock: stockActual,
                    cantidad_real: esCompra ? stockNuevo : stockActual,
                    cantidad_baja: esCompra ? 0 : diff,
                    explicacion: esCompra ? "Compra desde tabla de modelos" : "Pérdida declarada desde tabla de modelos",
                }]
            });
            await MDL.inventario.aplicar_cardex(conteo.key);
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

export default class table2 extends React.Component {
    state = { dirtyRows: new Set(), deletedRows: new Set(), saving: false, tableKey: 0, selectedRows: [] };
    originalData = {};

    checkAndUpdateDirty(row) {
        const orig = this.originalData[row.key];
        const eq = (a, b) => String(a ?? '') === String(b ?? '');
        const isDirty = !orig ||
            !eq(row.descripcion, orig.descripcion) ||
            !eq(row.precio_compra, orig.precio_compra) ||
            !eq(row.precio_venta, orig.precio_venta) ||
            row.key_tipo_producto !== orig.key_tipo_producto ||
            row.key_marca !== orig.key_marca ||
            row.precio_compra_moneda !== orig.precio_compra_moneda ||
            row.precio_venta_moneda !== orig.precio_venta_moneda;

        this.setState(prev => {
            const next = new Set(prev.dirtyRows);
            isDirty ? next.add(row.key) : next.delete(row.key);
            return { dirtyRows: next };
        });
    }

    async loadData() {
        try {
            const [modelos, tipos, marcas, empresa] = await Promise.all([
                MDL.inventario.getAllModeloStock(),
                MDL.inventario.getAllTipoProducto(),
                MDL.inventario.getAllMarca(),
                MDL.empresa.getFull(),
            ]);
            modelos.sort((a, b) => a.descripcion?.localeCompare(b.descripcion, undefined, { sensitivity: 'base' }) ?? 0)
            this.tipos = tipos;
            this.tiposMap = Object.fromEntries(tipos.map(t => [t.key, t]));
            this.tiposPorCategoria = tipos.reduce((acc, t) => {
                if (t.tipo) { (acc[t.tipo] = acc[t.tipo] || []).push(t); }
                return acc;
            }, {});
            this.marcas = marcas;
            this.monedas = empresa?.monedas || [];
            const monedaBase = this.monedas.find(m => m.tipo === "base");
            const defaultMonedaKey = monedaBase?.key;

            this.originalData = {};
            modelos.forEach(m => {
                if (!m.precio_compra_moneda && defaultMonedaKey) m.precio_compra_moneda = defaultMonedaKey;
                if (!m.precio_venta_moneda && defaultMonedaKey) m.precio_venta_moneda = defaultMonedaKey;
                if (m.tipo_producto?.tipo) m._catFilter = m.tipo_producto.tipo;
                this.originalData[m.key] = {
                    descripcion: m.descripcion,
                    precio_compra: m.precio_compra,
                    precio_venta: m.precio_venta,
                    key_tipo_producto: m.tipo_producto?.key,
                    key_marca: m.marca?.key,
                    precio_compra_moneda: m.precio_compra_moneda,
                    precio_venta_moneda: m.precio_venta_moneda,
                };
            });

            return modelos;
        } catch (e) {
            console.error(e);
            return [];
        }

    }

    deleteRow(row) {
        this.setState(prev => {
            const nextDeleted = new Set(prev.deletedRows);
            nextDeleted.add(row.key);
            const nextDirty = new Set(prev.dirtyRows);
            nextDirty.add(row.key);
            return { deletedRows: nextDeleted, dirtyRows: nextDirty };
        }, () => {
            if (this.table) {
                this.table.applyFilter()
            }
        });

        pushGlobalUndo(() => this.undeleteRow(row));
    }

    undeleteRow(row) {
        this.setState(prev => {
            const nextDeleted = new Set(prev.deletedRows);
            nextDeleted.delete(row.key);
            return { deletedRows: nextDeleted };
        }, () => {
            this.checkAndUpdateDirty(row)
            if (this.table) {
                this.table.applyFilter()
            }
        });
    }

    duplicateSelected() {
        const { selectedRows } = this.state;
        const newKeys = [];
        selectedRows.forEach(row => {
            const newKey = SUuid();
            newKeys.push(newKey);
            this.table.addRow({
                ...row,
                key: newKey,
                descripcion: row.descripcion ? row.descripcion + " (copy)" : "(copy)",
                tipo_producto: row.tipo_producto ? { ...row.tipo_producto } : undefined,
                marca: row.marca ? { ...row.marca } : undefined,
            });
        });
        this.table.clearSelect();
        this.setState(prev => {
            const next = new Set(prev.dirtyRows);
            newKeys.forEach(k => next.add(k));
            return { dirtyRows: next, selectedRows: [] };
        });
    }

    deleteSelected() {
        const { selectedRows } = this.state;
        this.setState(prev => {
            const nextDeleted = new Set(prev.deletedRows);
            const nextDirty = new Set(prev.dirtyRows);
            selectedRows.forEach(row => {
                nextDeleted.add(row.key);
                nextDirty.add(row.key);
                pushGlobalUndo(() => this.undeleteRow(row));
            });
            return { deletedRows: nextDeleted, dirtyRows: nextDirty, selectedRows: [] };
        }, () => {
            this.table.clearSelect();
            if (this.table) this.table.applyFilter();
        });
    }

    discardChanges() {
        this.setState(prev => ({
            dirtyRows: new Set(),
            deletedRows: new Set(),
            tableKey: prev.tableKey + 1,
        }));
    }

    async onSave() {
        if (this.state.saving) return;
        this.setState({ saving: true });
        try {
            const { dirtyRows, deletedRows } = this.state;

            const deleteData = Array.from(deletedRows).map(key => ({
                key,
                estado: 0,
                key_usuario: MDL.usuario?.session?.key,
            }));

            const editData = Array.from(dirtyRows)
                .filter(key => !deletedRows.has(key))
                .map(key => {
                    const row = this.table.data.find(r => r.key === key);
                    if (!row?.key_tipo_producto) throw "No puede registrar un item sin tipo de producto.";
                    if (!row?.key_marca) throw "No puede registrar un item sin marca.";
                    return {
                        key,
                        descripcion: row.descripcion,
                        precio_compra: row.precio_compra,
                        precio_venta: row.precio_venta,
                        key_tipo_producto: row.key_tipo_producto,
                        key_marca: row.key_marca,
                        precio_compra_moneda: row.precio_compra_moneda,
                        precio_venta_moneda: row.precio_venta_moneda,
                        estado: 1,
                        key_usuario: MDL.usuario?.session?.key,
                    };
                });

            const allData = [...editData, ...deleteData];
            if (allData.length > 0) {
                await MDL.inventario.execute_function('json_upsert', ["modelo", JSON.stringify(allData)]);
            }
            await this.table.loadData();
            this.setState({ dirtyRows: new Set(), deletedRows: new Set(), saving: false });
        } catch (error) {
            this.setState({ saving: false });
            SNotification.send({
                title: error?.message ?? String(error),
                color: STheme.color.danger,
                time: 5000
            });
        }
    }

    render() {
        const inputStyle = { height: 18 };
        const { dirtyRows, deletedRows, saving, tableKey, selectedRows } = this.state;
        const editedCount = [...dirtyRows].filter(k => !deletedRows.has(k)).length;
        const deletedCount = deletedRows.size;
        const hasPending = dirtyRows.size > 0 || deletedCount > 0;
        const saveMsg = [
            editedCount > 0 ? `${editedCount} editada(s)` : null,
            deletedCount > 0 ? `${deletedCount} a eliminar` : null,
        ].filter(Boolean).join('  ·  ');

        return <SPage title={"table2"} disableScroll>
            <DinamicTable
                key={"tabla_modelo_" + tableKey}
                ref={ref => {
                    this.table = ref
                }}
                {...Config.table.applyTheme({
                    cellStyle: {
                        borderLeftWidth: 1,
                        borderBottomWidth: 1,
                        padding: 0,
                        paddingRight: 2,

                    },
                })}
                selectType="check"
                loadInitialState={async () => ({
                    groupers: [{
                        key: "tipo_producto_tipo",
                        type: "string"
                    }]
                })}
                loadData={this.loadData.bind(this)}
                renderHeaderActions={() => {
                    if (selectedRows.length === 0) return null;
                    return <SView row style={{ alignItems: "center", gap: 6 }}>
                        <SView style={{
                            backgroundColor: STheme.color.text + "22",
                            borderRadius: 4,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                        }}>
                            <SText fontSize={11} bold>{selectedRows.length} sel.</SText>
                        </SView>
                        <SView
                            onPress={this.duplicateSelected.bind(this)}
                            style={{
                                backgroundColor: STheme.color.success + "33",
                                borderRadius: 4,
                                paddingHorizontal: 10,
                                paddingVertical: 2,
                            }}
                        >
                            <SText fontSize={11} bold>Duplicar</SText>
                        </SView>
                        <SView
                            onPress={this.deleteSelected.bind(this)}
                            style={{
                                backgroundColor: STheme.color.danger + "33",
                                borderRadius: 4,
                                paddingHorizontal: 10,
                                paddingVertical: 2,
                            }}
                        >
                            <SText fontSize={11} bold>Eliminar</SText>
                        </SView>
                    </SView>;
                }}
                listFooterComponent={() => <SHr h={100} />}
                onSelectionChange={rows => {
                    this.setState({ selectedRows: rows });
                }}
                style={{
                    width: "100%"
                }}
            >
                {/* <DinamicTable.Col key="index" label="#" textStyle={{ color: STheme.color.lightGray, fontSize: 10 }} width={30} data={(e) => e.index + 1} /> */}
                <DinamicTable.Col key="tipo_producto_tipo" label="Cat." width={90} dataType="string"
                    data={e => e.row._catFilter}
                    customComponent={e => {
                        const catOptions = [...new Set(this.tipos.map(t => t.tipo).filter(Boolean))].map(tipo => ({
                            label: tipo,
                            value: tipo,
                        }));
                        const catColor = e.row._catFilter ? STheme.colorFromText(e.row._catFilter) : null;
                        return <InputSelector
                            key={"cat" + e.row.key + (e.row._catFilter || '')}
                            style={{
                                fontSize: 9,
                                paddingStart: 5,
                                paddingVertical: 2,
                                textTransform: "uppercase",
                                backgroundColor: catColor ? catColor + "33" : STheme.color.card + "88",
                                borderWidth: 1,
                                borderColor: catColor || STheme.color.card,
                                borderRadius: 4,
                                color: STheme.color.text,
                            }}
                            listItemStyle={{ padding: 4 }}
                            listItemTextStyle={{ fontSize: 10 }}
                            defaultValue={e.row._catFilter}
                            autoSelectOnBlur
                            options={catOptions}
                            onSelect={opt => {
                                const prevCat = e.row._catFilter;
                                e.row._catFilter = opt.value;
                                if (prevCat !== opt.value) {
                                    e.row.tipo_producto = undefined;
                                    e.row.key_tipo_producto = undefined;
                                }
                                this.checkAndUpdateDirty(e.row);
                                this.table.applyFormatData().then(() => this.table.applyFilter());
                            }}
                        />;
                    }}
                />
                <DinamicTable.Col key="tipo_producto" label="Tipo" width={100}
                    textStyle={{ fontSize: 10 }}
                    data={(e) => e.row.tipo_producto?.descripcion}
                    customComponent={e => {
                        const tiposFiltrados = e.row._catFilter
                            ? (this.tiposPorCategoria[e.row._catFilter] || [])
                            : this.tipos;
                        const tipoData = e.row.key_tipo_producto ? this.tiposMap[e.row.key_tipo_producto] : null;
                        const tipoIncompleto = tipoData && !tipoProductoEstaCompleto(tipoData);
                        const warningColor = STheme.color.warning || "#f59e0b";
                        return <InputSelector
                            key={"tipo" + e.row.key + (e.row._catFilter || '')}
                            style={{
                                fontSize: 10, padding: 2,
                                ...(tipoIncompleto ? {
                                    borderWidth: 1,
                                    borderColor: warningColor,
                                    backgroundColor: warningColor + "22",
                                    borderRadius: 4,
                                    color: STheme.color.text,
                                } : {})
                            }}
                            listItemStyle={{ padding: 4 }}
                            listItemTextStyle={{ fontSize: 10 }}
                            defaultValue={e.row.key_tipo_producto}
                            autoSelectOnBlur
                            options={tiposFiltrados.map(t => ({
                                label: t.descripcion,
                                value: t.key,
                                data: t,
                                customComponent: () => <View
                                    // @ts-ignore
                                    onClick={ev => {
                                        ev.stopPropagation();
                                        FormularioTipoProducto.open({
                                            editObject: t,
                                            onSuccess: resp => {
                                                Object.assign(t, resp);
                                                this.table.applyFormatData().then(() => this.table.applyFilter());
                                            },
                                        });
                                    }}
                                    // @ts-ignore
                                    onMouseDown={ev => { ev.preventDefault(); ev.stopPropagation(); }}
                                    style={{ padding: 4, borderRadius: 4, cursor: "pointer" }}
                                >
                                    <SText fontSize={12} style={{ color: STheme.color.lightGray }}>✎</SText>
                                </View>
                            }))}
                            onSelect={opt => {
                                e.row.key_tipo_producto = opt.value;
                                e.row.tipo_producto = { key: opt.value, descripcion: opt.label, tipo: opt.data?.tipo };
                                e.row._catFilter = opt.data?.tipo;
                                this.checkAndUpdateDirty(e.row);
                                this.table.applyFormatData().then(() => this.table.applyFilter());
                            }}
                            onCreate={async (val) => {
                                return new Promise((resolve, reject) => {
                                    FormularioTipoProducto.open({
                                        editObject: { descripcion: val, tipo: e.row._catFilter, key_empresa: MDL.empresa.select.key },
                                        onSuccess: (resp) => {
                                            this.tipos.push(resp);
                                            this.tiposMap[resp.key] = resp;
                                            if (resp.tipo) {
                                                (this.tiposPorCategoria[resp.tipo] = this.tiposPorCategoria[resp.tipo] || []).push(resp);
                                            }
                                            resolve({ label: resp.descripcion, value: resp.key, data: resp });
                                        },
                                        onCancel: () => reject(new Error("cancelled")),
                                    });
                                });
                            }}
                        />;
                    }} />
                <DinamicTable.Col key="marca" label="Marca" width={100}
                    textStyle={{ fontSize: 10 }}
                    data={(e) => e.row.marca?.descripcion}
                    customComponent={e => {
                        return <InputSelector
                            key={"marca" + e.row.key}
                            style={{
                                fontSize: 10,
                                padding: 2,
                            }}
                            listItemStyle={{
                                padding: 4
                            }}
                            listItemTextStyle={{
                                fontSize: 10
                            }}
                            defaultValue={e.row.key_marca}
                            autoSelectOnBlur
                            options={this.marcas.map(m => ({
                                label: m.descripcion,
                                value: m.key,
                                data: m,
                                customComponent: () => <View
                                    // @ts-ignore
                                    onClick={ev => {
                                        ev.stopPropagation();
                                        PopupAgregarMarca.open({
                                            editObject: m,
                                            onSuccess: resp => {
                                                Object.assign(m, resp);
                                                this.table.applyFormatData().then(() => this.table.applyFilter());
                                            },
                                        });
                                    }}
                                    // @ts-ignore
                                    onMouseDown={ev => { ev.preventDefault(); ev.stopPropagation(); }}
                                    style={{ padding: 4, borderRadius: 4, cursor: "pointer" }}
                                >
                                    <SText fontSize={12} style={{ color: STheme.color.lightGray }}>✎</SText>
                                </View>
                            }))}
                            onSelect={opt => {
                                e.row.key_marca = opt.value;
                                e.row.marca = { key: opt.value, descripcion: opt.label };
                                this.checkAndUpdateDirty(e.row);
                            }}
                            onCreate={async (val) => {
                                return new Promise((resolve, reject) => {
                                    PopupAgregarMarca.open({
                                        editObject: { descripcion: val, key_empresa: MDL.empresa.select.key },
                                        onSuccess: resp => {
                                            this.marcas.push(resp);
                                            resolve({ label: resp.descripcion, value: resp.key, data: resp });
                                        },
                                        onCancel: () => reject(new Error("cancelled")),
                                    });
                                });
                            }}
                        />
                    }} />
                <DinamicTable.Col key="foto" label="" width={28} data={e => e.row.key}
                    customComponent={e => <FotoCell rowKey={e.row.key} />}
                />
                <DinamicTable.Col key="descripcion" label="Descripcion" width={320} data={(e) => e.row.descripcion}
                    customComponent={e => {
                        return <SInput2
                            key={"descripcion" + e.row.key}
                            defaultValue={e.row.descripcion}
                            onChangeText={val => {
                                e.row.descripcion = val;
                                this.checkAndUpdateDirty(e.row);
                            }}
                            style={{
                                ...inputStyle,
                                fontWeight: "bold",
                            }} />
                    }} />
                <DinamicTable.Col key="stock" label="Stock" width={70} dataType="number"
                    data={e => e.row.stock ? parseFloat(e.row.stock) : 0}
                    customComponent={e => <StockCell key={"stock" + e.row.key} row={e.row} table={this.table} inputStyle={inputStyle} />}
                />
                <DinamicTable.Col key="precio_compra" label="Pre. Compra" width={80} data={(e) => e.row.precio_compra}
                    cellStyle={{
                        backgroundColor: STheme.color.danger + "22"
                    }}
                    customComponent={e => {
                        return <View style={{ position: "relative" }}>
                            <SIconApp name="arrowDown" width={14} fill={STheme.color.danger} style={{ position: "absolute", left: 0, top: 0, zIndex: 1 }} />
                            <SInput2
                                key={"precio_compra" + e.row.key}
                                defaultValue={e.row.precio_compra}
                                type="money"
                                placeholder="00,00"
                                placeholderTextColor={STheme.color.text + "44"}
                                onChangeText={val => {
                                    e.row.precio_compra = val;
                                    this.checkAndUpdateDirty(e.row);
                                }}
                                style={{ ...inputStyle, textAlign: "right" }} />
                        </View>
                    }} />
                <DinamicTable.Col key="moneda_compra" label="Mon. C" width={60} data={(e) => e.row.precio_compra_moneda}
                    cellStyle={{
                        backgroundColor: STheme.color.danger + "22"
                    }}
                    customComponent={e => {
                        const sinPrecio = !e.row.precio_compra || parseFloat(e.row.precio_compra) === 0;
                        return <View style={{ opacity: sinPrecio ? 0.3 : 1 }}>
                            <InputSelector
                                key={"moneda_compra" + e.row.key}
                                style={{ fontSize: 10, padding: 2 }}
                                listItemStyle={{ padding: 4 }}
                                listItemTextStyle={{ fontSize: 10 }}
                                defaultValue={e.row.precio_compra_moneda}
                                autoSelectOnBlur
                                options={(this.monedas || []).map(m => ({
                                    label: m.observacion,
                                    value: m.key,
                                }))}
                                onSelect={opt => {
                                    e.row.precio_compra_moneda = opt.value;
                                    this.checkAndUpdateDirty(e.row);
                                }}
                            />
                        </View>
                    }} />
                <DinamicTable.Col key="precio_venta" label="Pre. Venta" width={80} data={(e) => e.row.precio_venta}
                    cellStyle={{
                        backgroundColor: STheme.color.success + "22"
                    }}
                    customComponent={e => {
                        return <View style={{ position: "relative" }}>
                            <View style={{ position: "absolute", left: 0, top: 0, zIndex: 1, transform: [{ rotate: "180deg" }] }}>
                                <SIconApp name="arrowDown" width={14} fill={STheme.color.success} />
                            </View>
                            <SInput2
                                key={"precio_venta" + e.row.key}
                                type="money"
                                defaultValue={e.row.precio_venta}
                                placeholder="00,00"
                                placeholderTextColor={STheme.color.text + "44"}
                                onChangeText={val => {
                                    e.row.precio_venta = val;
                                    this.checkAndUpdateDirty(e.row);
                                }}
                                style={{ ...inputStyle, textAlign: "right" }} />
                        </View>
                    }} />
                <DinamicTable.Col key="moneda_venta" label="Mon. V" width={60} data={(e) => e.row.precio_venta_moneda}
                    cellStyle={{
                        backgroundColor: STheme.color.success + "22"
                    }}
                    customComponent={e => {
                        const sinPrecio = !e.row.precio_venta || parseFloat(e.row.precio_venta) === 0;
                        return <View style={{ opacity: sinPrecio ? 0.3 : 1 }}>
                            <InputSelector
                                key={"moneda_venta" + e.row.key}
                                style={{ fontSize: 10, padding: 2 }}
                                listItemStyle={{ padding: 4 }}
                                listItemTextStyle={{ fontSize: 10 }}
                                defaultValue={e.row.precio_venta_moneda}
                                autoSelectOnBlur
                                options={(this.monedas || []).map(m => ({
                                    label: m.observacion,
                                    value: m.key,
                                }))}
                                onSelect={opt => {
                                    e.row.precio_venta_moneda = opt.value;
                                    this.checkAndUpdateDirty(e.row);
                                }}
                            />
                        </View>
                    }} />
                {/* <DinamicTable.Col key="delete" label="" width={40}
                    data={e => ""}
                    customComponent={e => {

                        const isDeleted = this.state.deletedRows.has(e.row.key);
                        return <SView
                            onPress={() => {
                                if (isDeleted) {
                                    this.undeleteRow(e.row)
                                } else {
                                    this.deleteRow(e.row)
                                }
                            }}
                            style={{
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: isDeleted ? STheme.color.danger + "22" : "transparent",
                                paddingVertical: 2,
                            }}
                        >
                            {isDeleted ? <SIconApp name="revertir" width={10} /> : <SIconApp name="eliminarI" width={10} stroke="transparent" fill={STheme.color.text} />}
                        </SView>
                    }}
                /> */}
            </DinamicTable>
            {hasPending && <SView row style={{
                position: "absolute",
                bottom: 16,
                left: 12,
                right: 12,
                zIndex: 100,
                backgroundColor: STheme.color.warning + "EE",
                borderWidth: 1,
                borderColor: STheme.color.warning,
                borderRadius: 8,
                padding: 6,
                paddingHorizontal: 12,
                alignItems: "center",
                gap: 12,
                // @ts-ignore
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            }}>
                <SText fontSize={12} color={"#000"} bold style={{ flex: 1 }}>{saveMsg}</SText>
                <SView
                    onPress={() => !saving && this.discardChanges()}
                    style={{
                        backgroundColor: "#00000022",
                        borderRadius: 4,
                        paddingHorizontal: 14,
                        paddingVertical: 4,
                        opacity: saving ? 0.4 : 1,
                    }}
                >
                    <SText fontSize={12} color={"#000"} bold>Deshacer</SText>
                </SView>
                <SView
                    onPress={this.onSave.bind(this)}
                    style={{
                        backgroundColor: saving ? STheme.color.warning + "99" : STheme.color.warning,
                        borderRadius: 4,
                        paddingHorizontal: 14,
                        paddingVertical: 4,
                        opacity: saving ? 0.7 : 1,
                    }}
                >
                    <SText fontSize={12} color={"#000"} bold>
                        {saving ? "Guardando..." : "Guardar"}
                    </SText>
                </SView>
            </SView>}
            <FloatButtom onPress={() => {
                this.table.addRow({
                    key: SUuid(),
                })
            }} />
        </SPage >
    }
}