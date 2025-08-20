import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import FloatButtom from '../../Components/FloatButtom';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import Model from '../../Model';
import ReciboCarta from '../../Components/PDF/venta/ReciboCarta';
import MDL from '../../MDL';

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


    async loadData() {
        const registros = Model.compra_venta.Action.getAll();
        if (!registros) return [];

        const empresa = Model.empresa?.select || {};


        // const suaur = MDL.usuario.getByKeys;


        // Solo ventas y enriquecidas con datos extra
        const ventas = await Promise.all(
            Object.values(registros)
                .filter(cv => cv.tipo === "venta")
                .map(async (cv) => {
                    try {
                        const sucursal = cv.key_sucursal?.trim()
                            ? await Model.sucursal.Action.getByKey({ key: cv.key_sucursal }) || {}
                            : {};

                        const proveedor = cv.key_proveedor?.trim()
                            ? await MDL.compra_venta.proveedor.getByKey(cv.key_proveedor) || {}
                            : {};

                        // const cliente = cv.key_cliente?.trim()
                        //     ? await MDL.crm.cliente.getByKey(cv.key_cliente) || {}
                        //     : {};
                        // key_usuario: Model.usuario.Action.getKey(),

                        // const usuario = cv.key_usuario?.trim()
                        //     ? await MDL.usuario.getByKey(cv.key_usuario) || {}
                        //     : {};

                        return {
                            ...cv,
                            sucursal,
                            proveedor,
                            // cliente,
                            usuario,
                            empresa,
                        };
                    } catch (err) {
                        console.error("Error enriqueciendo venta:", cv.key, err);
                        return cv;
                    }
                })
        );

        console.log("todoooooooo " + JSON.stringify(ventas))
        return ventas;
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
            >
                <DinamicTable.Col key="index" label="N°" width={40} data={(e) => e.index + 1} />


                <DinamicTable.Col key="sucursal" label="Sucursal" width={80} data={(e) => e.row?.sucursal?.descripcion} />
                <DinamicTable.Col key="fecha_on" label="Fecha realizada" width={100} data={(e) => e.row.fecha_on} />
                <DinamicTable.Col key="tipo_pago" label="Tipo Pago" width={90} data={(e) => e.row.tipo_pago} />


                <DinamicTable.Col key="cliente_img" label="Foto" width={50} data={(e) => e.row?.cliente?.key}
                    customComponent={(e) => this.renderCliente(e.data)} />
                <DinamicTable.Col key="cliente_iamg_" label="Cliente" width={100} data={(e) => e.row?.cliente?.nombres} />




                <DinamicTable.Col key="Usuario_img" label="Foto" width={50} data={(e) => e.row?.key_usuario}
                    customComponent={(e) => this.renderUsuario(e.data)} />
                {/* <DinamicTable.Col key="Usuario_img_s" label="Admin" width={50} data={(e) => e.row?.usuario.nombres} /> */}




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
