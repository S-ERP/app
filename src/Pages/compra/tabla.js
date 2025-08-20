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
import ComprobanteCarta from '../../Components/PDF/compra/ComprobanteCarta';



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
        const registros = Model.compra_venta.Action.getAll();
        if (!registros) return [];

        const empresa = Model.empresa?.select || {};

        // --- Filtrar solo ventas ---
        const ventas = Object.values(registros).filter(cv => cv.tipo === "compra");

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
        const comprasEnriquecidas = await Promise.all(
            ventas.map(async (cv) => {
                const sucursal = cv.key_sucursal?.trim()
                    ? await Model.sucursal.Action.getByKey({ key: cv.key_sucursal }) || {}
                    : {};


                return {
                    ...cv,
                    sucursal,
                    usuario: usuariosMap[cv.key_usuario] || {},
                    empresa,
                };
            })
        );
        console.log("todoooooooo " + JSON.stringify(comprasEnriquecidas))

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

    renderCodigo(codigo) {
        return <SView row center>
            <SView border={STheme.color.card} style={{ borderRadius: 16, padding: 6, borderWidth: 1 }}>
                <SText color={STheme.color.text} fontSize={10} bold>{codigo}</SText>
            </SView>
        </SView>
    }

    renderFecha(fecha) {
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
                                label: "Ver compra",
                                icon: <SIconApp name='addTarea' fill="#FF0000" />,
                                onPress: () => {


 


                                    SNavigation.navigate("/compra/profile", { pk: e?.row?.key })
                                }
                            },
                            {
                                label: "Recibo carta",
                                icon: <SIconApp name='crmpdf' fill="#FF0000" />,
                                onPress: () => {

                                    ComprobanteCarta.imprimir(e?.row?.key)
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

                <DinamicTable.Col key={"-key"} label='Ver' width={40} data={(e) => e.row?.proyecto?.nombre}
                    customComponent={e => <SView row center card padding={2} onPress={() => { SNavigation.navigate("/compra/profile", { pk: e.row.key }) }}>
                        <SIconApp name='Eyes' height={14} fill={STheme.color.lightGray} ></SIconApp>
                    </SView>} />

                <DinamicTable.Col key={"codigo"} label='Codigo' width={90} center data={(e) => "AL790"} customComponent={(e) => this.renderCodigo(e.data)} />

                <DinamicTable.Col key="sucursal_img" label="Foto" width={50} data={(e) => e.row?.sucursal?.key} customComponent={(e) => this.renderSucursal(e.data)} />

                <DinamicTable.Col key="sucursal" label="Sucursal" width={70} data={(e) => e.row?.sucursal?.descripcion} />

                <DinamicTable.Col key={"fecha_on"} label="Fecha realizada" width={120} dataType="date" data={e => new SDate(e.row.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />

                <DinamicTable.Col key="tipo_pago" label="Tipo Pago" center width={90} data={(e) => e.row.tipo_pago} />



                <DinamicTable.Col key="provsaeedor_img" label="Foto" width={50} data={(e) => e.row?.proveedor?.key_usuario} customComponent={(e) => this.renderProveedor(e.data)} />



                <DinamicTable.Col key="-key_proveedor" label="Proveedor" width={100} data={(e) => e.row?.proveedor?.razon_social} />



                <DinamicTable.Col key="statdsddse" label="Estado" width={150} data={(e) => e.row?.state}
                    customComponent={(e) => this.renderState(e.data)}
                />

                <DinamicTable.Col key="sdf" label="Descripcion" width={150} data={(e) => e.row?.descripcion}
                />


                <DinamicTable.Col key="clienste_simg" label="Subtotal" width={50} data={(e) => e.row?.estado}
                />





                <DinamicTable.Col key="Usuario_img" label="Foto" width={50} data={(e) => e.row?.key_usuario}
                    customComponent={(e) => this.renderUsuario(e.data)} />
                <DinamicTable.Col key="Usuario_img_s" label="Admin" width={100} data={(e) => e.row?.usuario.Nombres} />





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
