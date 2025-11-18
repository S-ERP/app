import React from "react";
import { ScrollView, View } from "react-native";
import { SGradient, SHr, SImage, SNavigation, SPage, SStorage, SText, STheme, SView } from "servisofts-component";
import Page from "./Page";
import SIconApp from "../../Assets/SIconApp";
import { Route } from "@react-navigation/native";
import SSocket from "servisofts-socket";
import CajaActiva from "./components/CajaActiva";
import PopupEditarTema from "../../Pages/empresa/Components/PopupEditarTema";
import BackgroundImage from "../BackgroundImage";
import MDL from "../../MDL";
import MenuEmpresa from "../../Components/empresa/menu_lista"


export default class Barra extends React.Component {
    state = {
        open: false,
        openWidth: 200,
        closeWidth: 40,
    }

    componentDidMount(): void {
        SStorage.getItem("menu_global_open").then((value) => {
            this.setState({
                open: value === "1"
            })
        })
    }

    changeStatus() {

        if (this.state.open) {
            this.close()
        } else {
            this.open();
        }
    }
    open() {
        SStorage.setItem("menu_global_open", "1");

        this.setState({
            open: true,
        })
    }
    close() {
        SStorage.setItem("menu_global_open", "0");
        this.setState({
            open: false,
        })
    }
    render() {
        console.log("eee", this.state.closeWidth)
        console.log("aae", this.state.openWidth)


        return <View style={{
            width: this.state.open ? this.state.openWidth : this.state.closeWidth,
            backgroundColor: STheme.color.background,
            borderRightWidth: 1,
            borderColor: STheme.color.card
        }}>
            <BackgroundImage />
            <SView row>
                <SView width={this.state.closeWidth} height={this.state.closeWidth} onPress={() => {
                    this.changeStatus()
                }} padding={4}>
                    <SIconApp name="Menu" fill={STheme.color.text} />

                </SView>
                <SView center width={150} style={{
                    display: this.state.open ? "flex" : "none",
                    paddingTop: 3
                }} onPress={() => {
                    // this.changeStatus()
                }}>
                    <MenuEmpresa.root />
                </SView>
            </SView>
            <SView col={"xs-12"} flex>
                <ScrollView showsVerticalScrollIndicator={false} >
                    <Page label={"Home"} url={"/"} icon={<SIconApp name="ctaHome" stroke={STheme.color.text} fill="transparent" />} />
                    {/* <Page label={"Menu"} url={"/menu"} icon={<SIconApp name="Menu" fill={STheme.color.text} />} /> */}
                    <Page label={"Empresa"}
                        icon={<ImagePage key_page="9b80fd4e-855c-430d-ad17-64449065eb3e" />}
                    >
                        <Page label={"Perfil"} url={"/empresa"} permiso={"ver"} />
                        <Page label={"Sucursales"} url={"/sucursal"} permiso={"ver"} />
                        {/* <Page label={"Config"} url={"/empresa/config"} permiso={"ver"} permiso_url="/empresa/config" /> */}
                        <Page label={"Pizarra"} url={"/empresa/config2"} permiso={"ver"} permiso_url="/empresa/config" />
                        <Page label={"Monedas"} url={"/empresa/moneda"} permiso={"ver"} permiso_url="/empresa/moneda" />
                        <Page label={"Tipos de pagos"} url={"/empresa/tipo_pago"} permiso={"ver"} />
                        <Page label={"Pasarelas"} url={"/pasarela"} permiso={"ver"} />
                    </Page>
                    <Page label={"Contabilidad"}
                        icon={<ImagePage key_page="fd0c2bfe-0f13-4e81-a967-213cc0adb299" />}
                    >
                        {/* <Page label={"Reportes"} icon={<SIconApp name="menuAll" fill={STheme.color.text} />} > */}

                        {/* </Page> */}
                        {/* <Page label={"Configuracion"} icon={<SIconApp name="Ajustes" fill={STheme.color.text} />} > */}
                        <Page label={"Plan de cuentas"} url={"/conta/cuentas"} permiso="ver" />
                        <Page label={"Centros de costos"} url={"/conta/centro_costo"} permiso_url="/conta/cuentas" permiso="ver" />
                        <Page label={"Diarios"} url={"/conta/diario"} permiso_url="/conta/cuentas" permiso="ver" />
                        {/* <Page label={"Dimensiones"} url={"/conta/dimension"} permiso="ver" /> */}

                        <Page label={"Crear Asiento"} url={"/contabilidad/asiento"} permiso="ver"
                        // icon={<SIconApp name="Add" fill={STheme.color.text} />} 
                        />

                        <Page label={"Balance general"} url={"/conta/balance"} permiso="ver" />
                        <Page label={"Libro Diario"} url={"/conta/libro_diario"} permiso="ver" />
                        <Page label={"Cuentas T"} url={"/conta/cuentas_t"} permiso_url={"/conta/cuentas_t"} permiso="ver" />
                        <Page label={"Sistema Antiguo"} url={"/contabilidad"} permiso="ver" />

                        {/* </Page> */}

                    </Page>
                    <Page label={"Inventario"}
                        icon={<ImagePage key_page="c50a9c4a-429c-426e-9ebf-c6874da14062" />}
                    >
                        <Page label={"Almacenes"} url={"/inventario"} permiso="ver" permiso_url="/inventario/almacen" />
                        <Page label={"Tipos de productos"} url={"/productos/tipo_producto/table"} permiso="ver" permiso_url="/productos/tipo_producto" />
                        <Page label={"Stock"} url={"/productos/modelo/table"} permiso="ver" permiso_url="/productos/modelo/table" />
                        <Page label={"Pizarra"} url={"/productos/pizarra"} permiso="ver" permiso_url="/productos/modelo/table" />
                        <Page label={"Conteos"} url={"/productos/reporte_conteo_inventario"} permiso="ver" permiso_url="/productos/reporte_conteo_inventario" />
                        <Page label={"Sistema antiguo"} url={"/productos"} permiso="ver" />
                    </Page>
                    <Page label={"Caja"} url={"/caja"} permiso="ver"
                        icon={<ImagePage key_page="a65b7814-6bfe-4604-8c91-5d955df5614b" />}
                        decoradores={<CajaActiva />}
                    />
                    {/* <Page label={"Caja2"} url={"/caja2"}
                        // permiso="ver"
                        icon={<ImagePage key_page="a65b7814-6bfe-4604-8c91-5d955df5614b" />}
                        decoradores={<CajaActiva />}
                    /> */}
                    <Page label={"Compras"}
                        icon={<ImagePage key_page="c0a4c4e6-082f-4f23-a755-01369653ee49" />}
                    >
                        {/* <Page label={"Proveedores"} url={"/proveedor"} permiso="page" /> */}
                        {/* <Page label={"Compras"} url={"/compra"} permiso="ver" /> */}
                        <Page label={"Historial de Compras"} url={"/compra/tabla"} permiso="ver" permiso_url="/compra" />
                        <Page label={"Compras Rapida"} url={"/compra2"} permiso="ver" permiso_url="/compra" />
                        <Page label={"Compras Rapida New"} url={"/compra3"} permiso="ver" permiso_url="/compra" />
                        

                    </Page>
                    <Page label={"Ventas"}
                        icon={<ImagePage key_page="8becb109-9987-4520-840d-7f0efdb6e3c6" />}
                    >
                        <Page label={"Clientes"} url={"/cliente"} permiso="ver" />
                        <Page label={"Historial de Ventas"} url={"/venta/tabla"} permiso="ver" permiso_url="/venta" />
                        {/* <Page label={"Ventas"} url={"/venta"} permiso="ver" /> */}
                        <Page label={"Descuento"} url={"/descuento"} permiso="ver" permiso_url="/descuento" />

                        <Page label={"Ventas Rapida"} url={"/puntoventa"} permiso="ver" permiso_url="/venta" />
                    </Page>

                    <Page label={"Facturacion"}
                        icon={<ImagePage key_page="a122ab1e-bf18-4831-8136-befa06e406d3" />}
                    >
                        <Page label={"Emitir"} url={"/facturacion/create"} permiso="ver" />
                        <Page label={"Libro de Ventas"} url={"/facturacion/libro_ventas"} permiso="ver" />
                        <Page label={"Anular CUF"} url={"/facturacion/anular_cuf"} permiso="ver" />
                        <Page label={"Ajustes"} url={"/facturacion/ajustes"} permiso="ver" />
                    </Page>

                    <Page label={"CRM"}

                        icon={<ImagePage key_page="9b5de113-c6e9-4bef-b686-5732056f71fb" />}
                    >
                        <Page label={"Lista de Clientes"} url={"/crm/cliente"} permiso="ver" />
                        <Page label={"Dashboard General"} url={"/crm/dashboard"} permiso="ver" />
                        <Page label={"Leads"} url={"/crm/lead"} permiso="ver" />
                        <Page label={"Llamar"} url={"/crm/llamar"} permiso="ver" />
                        <Page label={"Proyectos"} url={"/crm/proyecto"} permiso="ver" />
                        <Page label={"Reportes"} url={"/crm/report"} permiso="ver" />
                        <Page label={"Configuracion de Leads"} url={"/crm/tipoMovimientoLead"} permiso="edit" />
                    </Page>
                    <Page label={"whatsapp"} url={"/whatsapp"}
                        permiso="page"
                        icon={<ImagePage key_page="5cb364bf-bcd1-4263-8079-654a17e02767" />}
                    />
                    <Page label={"Social Media"}
                        permiso="page"
                        permiso_url="/dev_tools"
                        icon={<SIconApp name="redesSociales" />}
                    >
                        <Page label={"Dashboard"} url={"/icons_"} />
                        <Page label={"Mensajes"} url={"/social_media/mensajes"} />
                        <Page label={"Publicaciones"} url={"/test2_"} />
                        <Page label={"Reportes"} url={"/caja/history_"} />
                        <Page label={"Calendario"} url={"/caja/history_"} />
                    </Page>
                    <Page label={"Drive"} url={"/drive"}
                        permiso="page"
                        params={{
                            key_empresa: MDL.empresa?.select?.key
                        }}
                        icon={<ImagePage key_page="913381d0-9e5a-4c5a-834a-78e86765a4e5" />}
                    />
                    <Page label={"Contactos"}
                        permiso="page"
                        permiso_url="/contactos"
                        // icon={<SIconApp name="menuAll" fill={STheme.color.text} />
                        icon={<ImagePage key_page="5f397907-35a9-4efa-8c1b-59af54d5f29a" />
                        }
                    >
                        <Page label={"Agenda"} url={"/contactos"} permiso="page" permiso_url="/contactos" icon={<SIconApp name="iconLista" fill={STheme.color.text} />} />
                        {/* <Page label={"Caja movimientos"} url={"/caja/reporte_movimientos"} permiso="reportemoviminetos" permiso_url="/reporte_cajas" icon={<SIconApp name="iconLista" fill={STheme.color.text} />} /> */}

                    </Page>
                    <Page label={"Camara"} url={"/qr_reader"}
                        permiso="page"
                        icon={<ImagePage key_page="676e0ed7-2320-4adb-8dfa-624e0c48df07" />}
                    />
                    <Page label={"Developers Tools"}
                        permiso="page"
                        permiso_url="/dev_tools"
                        icon={<SIconApp name="Ajustes" />}
                    >
                        <Page label={"Icons"} url={"/icons"} />
                        <Page label={"Configurar íconos"} url={"/empresa/configIcon"} permiso={"edit"} permiso_url="/empresa/configIcon" />
                        <Page label={"Test"} url={"/test"} />
                        <Page label={"Test2"} url={"/test2"} />
                        <Page label={"Caja history"} url={"/caja/history"} />
                        <Page label={"Eliminar datos contables"} url={"/empresa/eliminar_datos_cotables"} />
                        <Page label={"Tema"} onPress={() => {
                            PopupEditarTema.open()
                        }} />




                        {/* <SText onPress={() => {

                        }}>{"Tema"}</SText> */}
                    </Page>


                    <Page label={"Reportes caja"}
                        permiso="page"
                        permiso_url="/reporte_cajas"
                        icon={<SIconApp name="menuAll" fill={STheme.color.text} />}
                    >
                        <Page label={"Caja historico"} url={"/caja/reporte_cajas"} permiso="reportecajas" permiso_url="/reporte_cajas" icon={<SIconApp name="iconLista" fill={STheme.color.text} />} />
                        <Page label={"Caja movimientos"} url={"/caja/reporte_movimientos"} permiso="reportemoviminetos" permiso_url="/reporte_cajas" icon={<SIconApp name="iconLista" fill={STheme.color.text} />} />

                    </Page>

                    <Page label={"Tableros"}
                        permiso="page"
                        permiso_url="/tableros"
                        icon={<SIconApp name="menuAll" fill={STheme.color.text} />}
                    >
                        <Page label={"Ventas"} url={"/tableros"} permiso="ver" icon={<SIconApp name="iconLista" fill={STheme.color.text} />} />
                        <Page label={"Compras"} url={"/tableros/tabla_compra"} permiso="ver" icon={<SIconApp name="iconLista" fill={STheme.color.text} />} />
                    </Page>
                        



                    {/* <Page label={"Iconos"} url={"/icons"} /> */}
                    <SHr h={100} />
                </ScrollView>

                <SView col={"xs-12"} pointerEvents="none" >
                    <SView style={{
                        top: -100,
                        width: "100%",
                        height: 100,
                        position: "absolute",

                    }} pointerEvents="none" >
                        <SGradient colors={[STheme.color.background + "ff", STheme.color.background + "00"]} />
                    </SView>
                </SView>
                <SView col={"xs-12"}  >
                    <SHr h={1} color={STheme.color.card} />
                    <Page label={"Usuarios y Privacidad"}
                        icon={<ImagePage key_page="419dfc13-34db-4935-a13c-b05cfd9d599a" />}
                    >
                        {/* <Page label={"All"} url={"/usuario"} permiso="ver" /> */}
                        <Page label={"Usuarios"} url={"/usuario/table"} permiso="ver" permiso_url="/usuario" />
                        <Page label={"Roles y Permisos"} url={"/rol"} permiso="ver" />
                    </Page>
                    {/* <Page label={"Roles y Permisos"} url={"/rol"}
                        permiso="ver"
                        icon={<ImagePage key_page="c4666514-202f-4d8d-8656-64c82065ba67" />}
                    /> */}

                    <Page label={"Ayuda"} url={"/wiki"}
                        icon={<ImagePage key_page="bf38c052-b726-43db-a66d-c202ef79a391" />}
                    />
                    <SHr />
                </SView>
            </SView>
        </View>
    }
}

const ImagePage = ({ key_page }: { key_page: string }) => {
    // @ts-ignore
    const urlrp = SSocket.api.roles_permisos;
    return <SImage src={urlrp + "page/" + key_page} />
}