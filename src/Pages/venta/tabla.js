import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import FloatButtom from '../../Components/FloatButtom';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import Model from '../../Model';
import ReciboCarta from '../../Components/PDF/venta/ReciboCarta';
import MDL from '../../MDL';
import FloatMenu from '../../Components/FloatMenu';

// import FloatButtom from '../../Components/FloatButtom';
// import SIconApp from '../../Assets/SIconApp';
// import Config from '../../Config';
// import Model from '../../Model';
// import ReciboCarta from '../../Components/PDF/venta/ReciboCarta';

export default class tabla extends Component {
    onSelect = SNavigation.getParam("onSelect");

    mostrarPopup(key, data) {
        SPopup.open({
            key: "popup_config_horario",
            content: (
                <SView col={"xs-11 sm-10 md-8"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 450 }} padding={16} withoutFeedback>
                    <SView col={"xs-12"} height={470} center>
                        {/* Aquí podrías renderizar un componente Perfil */}
                    </SView>
                </SView>
            )
        });
    }

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

        // --- Filtrar solo ventas ---
        const ventas = Object.values(registros).filter(cv => cv.tipo === "venta");

        // --- Recolectar keys únicas de usuarios ---
        const keysUsuarios = [];
        ventas.forEach(cv => {
            if (cv.key_usuario && !keysUsuarios.includes(cv.key_usuario)) {
                keysUsuarios.push(cv.key_usuario);
            }
        });

        // --- Obtener usuarios en lote (puede devolver objeto o array) ---
        const usuarios = await MDL.usuario.getByKeys(keysUsuarios) || {};
        const usuariosMap = Array.isArray(usuarios)
            ? Object.fromEntries(usuarios.map(u => [u.key, u]))
            : usuarios;

        // --- Enriquecer cada venta ---
        const ventasEnriquecidas = await Promise.all(
            ventas.map(async (cv) => {
                const sucursal = cv.key_sucursal?.trim()
                    ? await Model.sucursal.Action.getByKey({ key: cv.key_sucursal }) || {}
                    : {};

                const proveedor = cv.key_proveedor?.trim()
                    ? await MDL.compra_venta.proveedor.getByKey(cv.key_proveedor) || {}
                    : {};

                return {
                    ...cv,
                    sucursal,
                    proveedor,
                    usuario: usuariosMap[cv.key_usuario] || {},
                    empresa,
                };
            })
        );
        console.log("todoooooooo " + JSON.stringify(ventasEnriquecidas))

        return ventasEnriquecidas;
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
                    return {
                        sorters: [{
                            key: "tipo_pago",
                            order: "asc",
                            type: "string"
                        }]
                    }
                }}

            // loadInitialState={async () => {
            //     return {
            //         sorters: [
            //             { key: "fecha_on", order: "desc", type: "date" },
            //             // { key: "fecha_edit", order: "desc", type: "date" }
            //         ]
            //     }
            // }}

            >
                <DinamicTable.Col key="index" label="N°" width={40} data={(e) => e.index + 1} />



                <DinamicTable.Col key={"-key"} label='Ver' width={40} data={(e) => e.row?.proyecto?.nombre}
                    customComponent={e => <SView row center card padding={2} onPress={() => { SNavigation.navigate("/crm/call", { key: e.row.key }) }}>
                        <SIconApp name='addTarea' height={14} fill={STheme.color.lightGray} ></SIconApp>
                        {/* <SIconApp name='Eyes' height={14} fill={STheme.color.lightGray} ></SIconApp> */}
                    </SView>} />

                {/* return <SIconApp name="crmpdf" fill="#FF0000" />; */}

                <DinamicTable.Col key={"codigo"} label='Codigo' width={50} center
                    data={(e) => "AL790"}
                    //  data={(e) => e.row?.codigo}
                    customComponent={e => <SView style={{ borderRadius: 100, borderWidth: 1, borderColor: STheme.color.card, padding: 3 }} center>
                        <SText bold fontSize={12}>{e.data}</SText>
                    </SView>} />


                <DinamicTable.Col key="sucursal_img" label="Foto" width={50} data={(e) => e.row?.sucursal?.key}
                    customComponent={(e) => this.renderSucursal(e.data)} />

                <DinamicTable.Col key="sucursal" label="Sucursal" width={80} data={(e) => e.row?.sucursal?.descripcion} />


                <DinamicTable.Col key={"fecha_ondd"} label="Fecha realizada"
                    dataType="date"
                    data={e => new SDate(e.row.fecha_on, "yyyy-MM-ddThh:mm:ss").date}
                    textStyle={{ fontSize: 10, color: STheme.color.text }}
                    dateFormat="yyyy-MM-dd"
                />

                <DinamicTable.Col key={"fecha_onds"} label="hora realizada"
                    dataType="date"
                    data={e => new SDate(e.row.fecha_on, "yyyy-MM-ddThh:mm:ss").date}
                    textStyle={{ fontSize: 10, color: STheme.color.text }}
                    dateFormat="hh:mm"
                />


                <DinamicTable.Col key="tipo_pago" label="Tipo Pago" width={90} data={(e) => e.row.tipo_pago} />


                <DinamicTable.Col key="cliente_img" label="Foto" width={50} data={(e) => e.row?.cliente?.key}
                    customComponent={(e) => this.renderCliente(e.data)} />
                <DinamicTable.Col key="cliente_iamg_" label="Cliente" width={100} data={(e) => e.row?.cliente?.nombres} />



                <DinamicTable.Col key="proveedor_img" label="Foto" width={50} data={(e) => e.row?.proveedor?.key}
                    customComponent={(e) => this.renderCliente(e.data)} />
                <DinamicTable.Col key="proveedor_img_" label="Proveedor" width={100} data={(e) => e.row?.proveedor?.nombres} />




                <DinamicTable.Col key="clienste_img" label="Estado" width={50} data={(e) => e.row?.estado}
                // customComponent={(e) => this.renderCliente(e.data)}
                />


                <DinamicTable.Col key="clienste_simg" label="Subtotal" width={50} data={(e) => e.row?.estado}
                // customComponent={(e) => this.renderCliente(e.data)}
                />




                {/* <DinamicTable.Col key={"tipo"} label='Tipo' width={120} data={(e) => e.row.tipo}
                    customComponent={e => {
                        return <SView center>
                            <Etiqueta tipo_leads={e.row.tipo} onPress={() => {
                                const activeFilter = this.DinamicTable.filtros.findIndex(f => f.col === "tipo");

                                if (activeFilter !== -1) {
                                    if (e.row.tipo == this.DinamicTable.filtros[activeFilter].value) {
                                        return;
                                    }
                                    this.DinamicTable.filtros.splice(activeFilter, 1);
                                }
                                this.DinamicTable.filtros.push({
                                    col: "tipo",
                                    operator: "=",
                                    value: e.row.tipo
                                });
                                this.DinamicTable.applyFilter()
                            }}></Etiqueta>
                        </SView>
                    }}
                /> */}


                <DinamicTable.Col key="Usuario_img" label="Foto" width={50} data={(e) => e.row?.key_usuario}
                    customComponent={(e) => this.renderUsuario(e.data)} />
                <DinamicTable.Col key="Usuario_img_s" label="Admin" width={100} data={(e) => e.row?.usuario.Nombres} />




                <DinamicTable.Col key="perfil" label="Perfil Venta" width={110} data={() => ""}
                    customComponent={(e) => (
                        <SView row card padding={2} height={40} center
                            onPress={() => SNavigation.navigate("/venta/profile", { pk: e?.row?.key })}
                        >
                            <SIconApp name="carritoproducto" fill={STheme.color.text} width={18} />
                        </SView>
                    )}
                />

                <DinamicTable.Col key="pdf" label="Print PDF" width={110} data={() => ""}
                    customComponent={(e) => (
                        <SView row card padding={2} height={40} center
                            onPress={() => ReciboCarta.imprimir(e?.row?.key)}
                        >
                            <SIconApp name="pdf" fill={STheme.color.text} width={18} />
                            <SText center color={STheme.color.text}>PDF</SText>
                        </SView>
                    )}
                />
            </DinamicTable>
        );
    }

    render() {
        return (
            <SPage title="Tabla Gestión de Ventas" disableScroll>
                {this.mostrarTabla()}
                <SHr height={20} />
                <FloatButtom onPress={() => this.mostrarPopup()} />
            </SPage>
        );
    }
}
