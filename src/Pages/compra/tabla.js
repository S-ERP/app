import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import Model from '../../Model';
import MDL from '../../MDL';
import FloatMenu from '../../Components/FloatMenu';
import ComprobanteCarta from '../../Components/PDF/compra/ComprobanteCarta';
export default class tabla extends Component {
    renderUsuario = (srcKey) => (
        <SView style={{
            width: 24,
            height: 24,
            borderRadius: 100,
            overflow: "hidden",
            backgroundColor: STheme.color.card + "66",
        }}>
            <SImage src={`${SSocket.api.root}usuario/${srcKey}`} style={{ resizeMode: "cover" }} />
        </SView>
    );
    renderProveedor = (srcKey) => (
        <SView style={{
            width: 24,
            height: 24,
            borderRadius: 100,
            overflow: "hidden",
            backgroundColor: STheme.color.card + "66",
        }}>
            <SImage src={`${SSocket.api.root}usuario/${srcKey}`} style={{ resizeMode: "cover" }} />
        </SView>
    );
    renderSucursal = (srcKey) => (
        <SView style={{
            width: 24,
            height: 24,
            borderRadius: 100,
            overflow: "hidden",
            backgroundColor: STheme.color.card + "66",
        }}>
            <SImage src={`${SSocket.api.empresa}sucursal/${srcKey}`} style={{ resizeMode: "cover" }} />
        </SView>
    );
    async loadData() {
        // const registros = Model.compra_venta.Action.getAll();
        const registros = await MDL.compra_venta.getAll();
        if (!registros) return [];
        const empresa = MDL.empresa?.select || {};
        const sucursales = await MDL.empresa.getAllSucursales();
        const ventas = Object.values(registros).filter(cv => cv.tipo === "compra");
        const keysUsuarios = [];
        ventas.forEach(cv => {
            if (cv.key_usuario && !keysUsuarios.includes(cv.key_usuario)) {
                keysUsuarios.push(cv.key_usuario);
            }
        });
        const proveedores = await MDL.inventario.proveedor.getAllProveedor();
        const usuarios = await MDL.usuario.getByKeys(keysUsuarios) || {};
        const usuariosMap = Array.isArray(usuarios)
            ? Object.fromEntries(usuarios.map(u => [u.key, u]))
            : usuarios;
        const totales = Model.compra_venta_detalle.Action.getTotales({ key_compra_venta: ventas[0].key }) || {};
        const comprasEnriquecidas = await Promise.all(
            ventas.map(async (cv) => {
                const sucursal = cv.key_sucursal?.trim()
                    ? sucursales.find(s => s.key === cv.key_sucursal) || {}
                    : {};
                return {
                    ...cv,
                    sucursal,
                    usuario: usuariosMap[cv.key_usuario] || {},
                    empresa,
                    proveedor: proveedores.find(a => a.key == cv.key_proveedor) || {},
                    subtotal: totales?.subtotal || "0",
                    descuento: totales?.descuento || "0",
                };
            })
        );
        return comprasEnriquecidas;
    }
    renderState(state) {
        var statesInfo = Model.compra_venta.Action.getStateInfo()[state];
        return <SView row center>
            <SView backgroundColor={statesInfo.color} style={{ borderRadius: 4, padding: 5 }}>
                <SText color={STheme.color.text} fontSize={10}>{statesInfo.label}</SText>
            </SView>
        </SView>
    }

    renderTipoPago(values) {
        const statesTipo = MDL.compra_venta.getTipoPago()[values];
        return <SView row center>
            <SView backgroundColor={statesTipo?.color} style={{ borderRadius: 4, padding: 5 }}>
                <SText color={STheme.color.text} fontSize={10}>{statesTipo?.label}</SText>
            </SView>
        </SView>
    }

    renderCodigo(codigo) {
        return <SView row center>
            <SView border={STheme.color.card} style={{ borderRadius: 16, padding: 6, borderWidth: 1 }}>
                <SText color={STheme.color.text} fontSize={10} bold>{codigo}</SText>
            </SView>
        </SView>
    }
    mostrarTabla() {
        return (
            <DinamicTable
                ref={ref => (this.DinamicTable = ref)}
                loadData={() => this.loadData()}
                key="id"
                language="es"
                center
                {...Config.table.applyTheme()}
                selectType="single"
                keyExtractor={(e) => e.key}
                onSelect={(e) => {
                    FloatMenu.open({
                        e: e.evt,
                        label: "Tabla de compras",
                        options: [
                            {
                                label: "Ver compra",
                                icon: <SIconApp name='addTarea' fill="#e4e4e4ff" />,
                                onPress: () => { SNavigation.navigate("/compra/profile", { pk: e?.row?.key }) }
                            },
                            // {
                            //     label: "Comprobante carta",
                            //     icon: <SIconApp name='crmpdf' fill="#FF0000" />,
                            //     onPress: () => { ComprobanteCarta.imprimir(e?.row?.key) }
                            // },
                        ]
                    });
                }}
                loadInitialState={async () => {
                    return { sorters: [{ key: "fecha_on", order: "desc", type: "date" }] }
                }}
            >
                <DinamicTable.Col key="index" label="N°" width={30} data={(e) => e.index + 1} />
                <DinamicTable.Col key={"-keyprofile"} label='Ver' width={40} data={(e) => e.row?.key}
                    customComponent={e => <SView row center card padding={2} onPress={() => { SNavigation.navigate("/compra/profile", { pk: e.row.key }) }}>
                        <SIconApp name='Eyes' height={14} fill={STheme.color.lightGray} ></SIconApp>
                    </SView>} />
                <DinamicTable.Col key={"fecha_on"} label="Fecha"
                    width={110} dataType="date"
                    textStyle={{
                        fontSize: 10
                    }}
                    data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date}
                    dateFormat="yyyy-MM-dd hh:mm" />
                <DinamicTable.Col key={"codigo"} label='Código' width={80} center data={(e) => e?.row?.codigo ?? "AL790"} customComponent={(e) => this.renderCodigo(e.data)} />

                <DinamicTable.Col key="sucursal" label="Sucursal" width={100} data={(e) => e.row?.sucursal?.descripcion}
                    customComponent={e => <>
                        {(e.row?.key_sucursal) ?
                            <SView col={"xs-12"} center row  >
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card }}>
                                    <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key_sucursal}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.sucursal?.descripcion}</SText>
                            </SView> : null}
                    </>}
                />

                <DinamicTable.Col key="tipo_pago" label="Tipo de Pago" width={80} data={(e) => e.row?.tipo_pago ?? ""} customComponent={(e) => this.renderTipoPago(e?.data)} />
                <DinamicTable.Col key="state" label="Estado" width={80} data={(e) => e.row?.state ?? ""} customComponent={(e) => this.renderState(e.data)} />
                <DinamicTable.Col key="descripcion" label="Descripción" width={150} data={(e) => e.row?.descripcion ?? ""} />
                {/* <DinamicTable.Col key="key_asiento_contable" label="asiento" width={150} data={(e) => e.row?.key_asiento_contable ?? ""} /> */}


                <DinamicTable.Col key="proveedor" label="Proveedor" width={100} data={(e) => e.row?.proveedor?.razon_social ?? ""}
                    customComponent={e => <>
                        {(e.row?.proveedor?.key) ?
                            <SView col={"xs-12"} center row  >
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.inventario}proveedor/${e.row?.proveedor?.key}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.proveedor?.razon_social}</SText>
                            </SView> : null}
                    </>}
                />
                <DinamicTable.Col key="admin" label="Admin" width={120} data={(e) => e.row?.usuario?.Nombres ?? ""}
                    customComponent={e => <>
                        {(e.row?.key_usuario) ?
                            <SView col={"xs-12"} center row  >
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.root}usuario/${e.row?.key_usuario}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.usuario?.Nombres}</SText>
                            </SView> : null}
                    </>}
                />
            </DinamicTable>
        );
    }
    render() {
        return (
            <SPage title="Tabla Gestión de Compras" disableScroll>
                {this.mostrarTabla()}
                <SHr height={20} />
            </SPage>
        );
    }
}
