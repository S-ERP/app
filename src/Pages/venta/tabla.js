import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate, SIcon } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import Model from '../../Model';
import ReciboCarta from '../../Components/PDF/venta/ReciboCarta';
import MDL from '../../MDL';
import FloatMenu from '../../Components/FloatMenu';
import ReciboRollo from '../../Components/PDF/venta/ReciboRollo';
export default class tabla extends Component {

    renderUsuario(srcKey) {
        const pintar = <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
            <SImage src={`${SSocket.api.root}usuario/${srcKey}`} style={{ resizeMode: "cover" }} />
        </SView>;
        const nulo = <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.lightGray + "66", }} />;
        return srcKey ? pintar : nulo;
    };

    renderCliente(srcKey) {
        const pintar = <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
            <SImage src={`${SSocket.api.crm}cliente/${srcKey}`} style={{ resizeMode: "cover" }} />
        </SView>;
        const nulo = <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.lightGray + "66", }} />;
        return srcKey ? pintar : nulo;
    };

    renderSucursal(srcKey) {
        const pintar = <>
            <SView style={{ width: 60 }}>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                    <SImage src={`${SSocket.api.empresa}sucursal/${srcKey}`} style={{ resizeMode: "cover" }} />
                </SView>
                <SText color='red'> sucursal </SText>
            </SView>
        </>
        const nulo = <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.lightGray + "66", }} />;
        return srcKey ? pintar : nulo;
    };

    async loadData() {
        try {
            const registros = Model.compra_venta.Action.getAll();
            if (!registros) return [];
            // const empresa = MDL.empresa.select || {};
            const sucursales = await MDL.empresa.getAllSucursales();
            const ventas = Object.values(registros).filter(cv => cv.tipo === "venta");
            if (!ventas.length) return [];

            // Get unique user keys
            // const keysUsuarios = [...new Set(ventas.map(cv => cv.key_usuario).filter(Boolean))];

            const keysUsuarios = [];
            ventas.forEach(cv => {
                if (cv.key_usuario && !keysUsuarios.includes(cv.key_usuario)) {
                    keysUsuarios.push(cv.key_usuario);
                }
            });

            // Fetch users in parallel
            const usuarios = await MDL.usuario.getByKeys(keysUsuarios) || {};
            const usuariosMap = Array.isArray(usuarios)
                ? Object.fromEntries(usuarios.map(u => [u.key, u]))
                : usuarios;

            // Create sucursales map
            const sucursalesMap = Object.fromEntries(sucursales.map(s => [s.key, s]));

            // Fetch all proveedores in parallel
            const proveedorKeys = [...new Set(ventas.map(cv => cv.key_proveedor).filter(key => key?.trim()))];
            const proveedores = await Promise.all(
                proveedorKeys.map(key => MDL.compra_venta.proveedor.getByKey(key).then(data => [key, data || {}]))
            );
            const proveedoresMap = Object.fromEntries(proveedores);

            // Enrich ventas without sequential awaits
            const ventasEnriquecidas = ventas.map(cv => ({
                ...cv,
                proveedor: proveedoresMap[cv.key_proveedor] || {},
                usuario: usuariosMap[cv.key_usuario] || {},
                sucursal: sucursalesMap[cv.key_sucursal] || {},
            }));

            return ventasEnriquecidas;
        } catch (error) {
            console.error('Error in loadData:', error);
            SPopup.alert('Error loading data. Please try again.');
            return [];
        }
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
        const statesTipo = MDL.compra_venta.getTipoPago()[values];
        return <SView row center>
            <SView backgroundColor={statesTipo?.color} style={{ borderRadius: 4, padding: 5 }}>
                <SText color={STheme.color.text} fontSize={10}>{statesTipo?.label}</SText>
            </SView>
        </SView>
    }

    renderCodigo(codigo) {
        return <SView row center>
            <SView border={STheme.color.card} style={{ borderRadius: 8, padding: 6, borderWidth: 1 }}>
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
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                selectType="single"
                keyExtractor={(e) => e.key_usuario}
                onSelect={(e) => {
                    FloatMenu.open({
                        e: e.evt,
                        label: "Tabla de ventas",
                        options: [
                            {
                                label: "Ver venta",
                                icon: <SIconApp name='addTarea' fill="#e4e4e4ff" />,
                                onPress: () => {
                                    SNavigation.navigate("/venta/profile", { pk: e?.row?.key })
                                }
                            },
                            // {
                            //     label: "Imprimir tamaño carta",
                            //     icon: <SIcon name='imprimir' />,
                            //     onPress: () => {
                            //         ReciboCarta.imprimir(e?.row?.key)
                            //     }
                            // },
                            // {
                            //     label: "Imprimir tipo rollo",
                            //     icon: <SIcon name='imprimir' stroke="#710505ff" fill='blue' />,
                            //     onPress: () => {
                            //         ReciboRollo.imprimir(e?.row?.key)
                            //     }
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
                    customComponent={e => <SView row center card padding={2} onPress={() => { SNavigation.navigate("/venta/profile", { pk: e.row.key }) }}>
                        <SIconApp name='Eyes' height={14} fill={STheme.color.lightGray} ></SIconApp>
                    </SView>} />
                <DinamicTable.Col key={"codigo"} label='Código' width={90} center data={(e) => e?.row?.codigo ?? "AL790"} customComponent={(e) => this.renderCodigo(e.data)} />

                <DinamicTable.Col key="sucursal" label="Sucursal" width={100} data={(e) => e.row?.sucursal?.descripcion}
                    customComponent={e => <>
                        {(e.row?.key_sucursal) ?
                            <SView col={"xs-12"} center row  >
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key_sucursal}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText color={STheme.color.text}>{e.row?.sucursal?.descripcion}</SText>
                            </SView> : null}
                    </>}
                />

                <DinamicTable.Col key={"fecha_on"} label="Fecha" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />
                <DinamicTable.Col key="tipo_pago" label="Tipo Pago" width={80} data={(e) => e.row?.tipo_pago ?? ""} customComponent={(e) => this.renderTipoPago(e?.data)} />
                <DinamicTable.Col key="state" label="Estado" width={80} data={(e) => e.row?.state ?? ""} customComponent={(e) => this.renderState(e?.data)} />
                <DinamicTable.Col key="descripcion" label="Descripción" width={150} data={(e) => e.row?.descripcion ?? ""} />



                <DinamicTable.Col key="cliente" label="Cliente" width={130} data={(e) => e.row?.cliente?.nombres ?? ""}
                    customComponent={e => <>
                        {(e.row?.cliente?.key) ?
                            <SView col={"xs-12"} center row  >
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.crm}cliente/${e.row?.cliente?.key}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText color={STheme.color.text}> {e.row?.cliente?.nombres}  </SText>
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
                                <SText color={STheme.color.text}>{e.row?.usuario?.Nombres}</SText>
                            </SView> : null}
                    </>}
                />

            </DinamicTable>
        );
    }
    render() {
        return (
            <SPage title="Tabla Gestión de Ventas" disableScroll>

                {/* <SView width={100} height={130}  ><SIconApp name='crmpdf' fill="blue"   /></SView> */}
                {/* <SIcon name='imprimir' stroke='red'fill='green'  ></SIcon> */}
                {this.mostrarTabla()}
                <SHr height={20} />
            </SPage>
        );
    }
}
