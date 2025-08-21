import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import Model from '../../Model';
import ReciboCarta from '../../Components/PDF/venta/ReciboCarta';
import MDL from '../../MDL';
import FloatMenu from '../../Components/FloatMenu';
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
    renderCliente = (srcKey) => (
        <SView style={{
            width: 24,
            height: 24,
            borderRadius: 100,
            overflow: "hidden",
            backgroundColor: STheme.color.card + "66",
        }}>
            <SImage src={`${SSocket.api.crm}cliente/${srcKey}`} style={{ resizeMode: "cover" }} />
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
        const registros = Model.compra_venta.Action.getAll();
        if (!registros) return [];
        const empresa = Model.empresa?.select || {};
        const ventas = Object.values(registros).filter(cv => cv.tipo === "venta");
        const keysUsuarios = [];
        ventas.forEach(cv => {
            if (cv.key_usuario && !keysUsuarios.includes(cv.key_usuario)) {
                keysUsuarios.push(cv.key_usuario);
            }
        });

        const usuarios = await MDL.usuario.getByKeys(keysUsuarios) || {};

        const sucursales = await MDL.empresa.getAllSucursales();
        const sucursalesMap = Object.fromEntries(
            sucursales.map(sucursal => [sucursal.key, {
                ...sucursal  }])
        );


        // console.log("adan " + JSON.stringify(sucursalesMap["393b5b5b-a6b0-4c5a-ab7f-df426671121f"]));






        const usuariosMap = Array.isArray(usuarios)
            ? Object.fromEntries(usuarios.map(u => [u.key, u]))
            : usuarios;
        const ventasEnriquecidas = await Promise.all(
            ventas.map(async (cv) => {

                const proveedor = cv.key_proveedor?.trim()
                    ? await MDL.compra_venta.proveedor.getByKey(cv.key_proveedor) || {}
                    : {};
                return {
                    ...cv,
                    proveedor,
                    usuario: usuariosMap[cv.key_usuario] || {},
                    sucursal: sucursalesMap[cv.key_sucursal],
                    empresa,
                };
            })
        );
        console.log("todoooooooo " + JSON.stringify(ventasEnriquecidas))
        return ventasEnriquecidas;
    }
    renderState(state) {
        const statesInfo = MDL.compra_venta.getStateInfo()[state];
        return <SView row center>
            <SView backgroundColor={statesInfo?.color} style={{ borderRadius: 4, padding: 5 }}>
                <SText color={STheme.color.text} fontSize={10}>{statesInfo?.label}</SText>
            </SView>
        </SView>
    }

    renderTipoPago(values) {
        const statesTipo = MDL.compra_venta.getTipoPago(values);
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
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                selectType="single"
                keyExtractor={(e) => e.key}
                onSelect={(e) => {
                    FloatMenu.open({
                        e: e.evt,
                        label: e.row.descripcion,
                        options: [
                            {
                                label: "Ver venta",
                                icon: <SIconApp name='addTarea' fill="#FF0000" />,
                                onPress: () => {
                                    SNavigation.navigate("/venta/profile", { pk: e?.row?.key })
                                }
                            },
                            {
                                label: "Recibo carta",
                                icon: <SIconApp name='crmpdf' fill="#FF0000" />,
                                onPress: () => {
                                    ReciboCarta.imprimir(e?.row?.key)
                                }
                            },
                        ]
                    });
                }}
                loadInitialState={async () => {
                    return { sorters: [{ key: "fecha_on", order: "desc", type: "date" }] }
                }}
            >
                <DinamicTable.Col key="index" label="N°" width={30} data={(e) => e.index + 1} />
                <DinamicTable.Col key={"-keyprofile"} label='Ver' width={40} data={(e) => e.row?.key}
                    customComponent={e => <SView row center card padding={2} onPress={() => { SNavigation.navigate("/venta/profile", { pk: e.row.key }) }}>
                        <SIconApp name='Eyes' height={14} fill={STheme.color.lightGray} ></SIconApp>
                    </SView>} />
                <DinamicTable.Col key={"codigo"} label='Codigo' width={90} center data={(e) => e?.row?.codigo ?? "AL790"} customComponent={(e) => this.renderCodigo(e.data)} />
                {/* <DinamicTable.Col key="sucursal_img" label="Foto" center width={50} data={(e) => e.row?.key_sucursal} customComponent={(e) => this.renderSucursal(e.data)} /> */}
                <DinamicTable.Col key="sucursal" label="Sucursal" width={70} data={(e) => e.row?.sucursal?.descripcion ?? ""} />
                <DinamicTable.Col key={"fecha_on"} label="Fecha" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />
                <DinamicTable.Col key="tipo_pago" label="Tipo Pago" width={80} data={(e) => e.row?.tipo_pago ?? ""} customComponent={(e) => this.renderTipoPago(e?.data)} />
                <DinamicTable.Col key="state" label="state" width={80} data={(e) => e.row?.state ?? ""} customComponent={(e) => this.renderState(e?.data)} />
                <DinamicTable.Col key="descripcion" label="Descripcion" width={150} data={(e) => e.row?.descripcion ?? ""} />
                {/* <DinamicTable.Col key="subtotal" label="Subtotal" width={50} data={(e) => e.row?.subtotal ?? "0"} /> */}
                {/* <DinamicTable.Col key="descuento" label="descuento" width={50} data={(e) => e.row?.descuento ?? "0"} /> */}
                <DinamicTable.Col key="cliente_img" label="Foto" width={50} data={(e) => e.row?.cliente?.key} customComponent={(e) => this.renderCliente(e.data)} />
                <DinamicTable.Col key="cliente" label="Cliente" width={100} data={(e) => e.row?.cliente?.nombres ?? ""} />
                <DinamicTable.Col key="Usuario_img" label="Foto" width={50} data={(e) => e.row?.key_usuario} customComponent={(e) => this.renderUsuario(e.data)} />
                <DinamicTable.Col key="Usuario_img_s" label="Admin" width={100} data={(e) => e.row?.usuario?.Nombres ?? ""} />
            </DinamicTable>
        );
    }
    render() {
        return (
            <SPage title="Tabla Gestión de Ventas" disableScroll>
                {this.mostrarTabla()}
                <SHr height={20} />
            </SPage>
        );
    }
}
