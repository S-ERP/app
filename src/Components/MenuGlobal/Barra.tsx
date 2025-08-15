import React from "react";
import { ScrollView, View } from "react-native";
import { SHr, SImage, SNavigation, SPage, SText, STheme, SView } from "servisofts-component";
import Page from "./Page";
import SIconApp from "../../Assets/SIconApp";
import { Route } from "@react-navigation/native";
import SSocket from "servisofts-socket";


export default class Barra extends React.Component {
    state = {
        open: true,
        openWidth: 200,
        closeWidth: 40,
    }



    changeStatus() {
        if (this.state.open) {
            this.close()
        } else {
            this.open();
        }
    }
    open() {
        this.setState({
            open: true,
        })
    }
    close() {
        this.setState({
            open: false,
        })
    }
    render() {

        return <View style={{
            width: this.state.open ? this.state.openWidth : this.state.closeWidth,
            backgroundColor: STheme.color.background,
            borderRightWidth: 1,
            borderColor: STheme.color.card
        }}>
            <SView width={this.state.closeWidth} height={this.state.closeWidth} onPress={() => {
                this.changeStatus()
            }} padding={4}>
                <SIconApp name="Menu" fill={STheme.color.text} />
            </SView>

            <ScrollView showsVerticalScrollIndicator={this.state.open}>
                <Page label={"Home"} url={"/"} icon={<SIconApp name="ctaHome" stroke={STheme.color.text} fill="transparent" />} />
                <Page label={"Menu"} url={"/menu"} icon={<SIconApp name="Menu" stroke={STheme.color.text} fill="transparent" />} />
                <Page label={"Empresa"}
                    icon={<ImagePage key_page="9b80fd4e-855c-430d-ad17-64449065eb3e" />}
                >
                    <Page label={"Perfil"} url={"/empresa"} permiso={"ver"} />
                    <Page label={"Sucursales"} url={"/sucursal"} permiso={"ver"} />
                </Page>
                <Page label={"Contabilidad"}
                    icon={<ImagePage key_page="fd0c2bfe-0f13-4e81-a967-213cc0adb299" />}
                >
                    <Page label={"Plan de cuentas"} url={"/conta/cuentas"} />
                    <Page label={"Dimensiones"} url={"/conta/dimension"} />
                    <Page label={"Balance general"} url={"/conta/balance"} />
                    <Page label={"Libro Diario"} url={"/conta/libro_diario"} />
                    <Page label={"Crear Asiento"} url={"/contabilidad/asiento"} />
                    <Page label={"Sistema Antiguo"} url={"/contabilidad"} permiso="ver" />
                </Page>
                <Page label={"Inventario"}
                    icon={<ImagePage key_page="c50a9c4a-429c-426e-9ebf-c6874da14062" />}
                >
                    <Page label={"Almacenes"} url={"/inventario"} permiso="ver" />
                    <Page label={"Productos"} url={"/productos"} permiso="ver" />
                    <Page label={"Stock"} url={"/productos/modelo/table"} permiso="ver" />
                </Page>
                <Page label={"Caja"} url={"/caja"} permiso="ver"
                    icon={<ImagePage key_page="a65b7814-6bfe-4604-8c91-5d955df5614b" />}
                />
                <Page label={"Compras"}
                    icon={<ImagePage key_page="c0a4c4e6-082f-4f23-a755-01369653ee49" />}
                >
                    <Page label={"Proveedores"} url={"/proveedor"} permiso="ver" />
                    <Page label={"Compras"} url={"/compra"} permiso="ver" />
                    <Page label={"Compras Rapida"} url={"/compra2"} />
                </Page>
                <Page label={"Ventas"}
                    icon={<ImagePage key_page="8becb109-9987-4520-840d-7f0efdb6e3c6" />}
                >
                    <Page label={"Clientes"} url={"/cliente"} permiso="ver" />
                    <Page label={"Ventas"} url={"/venta"} permiso="ver" />
                    <Page label={"Ventas Rapida"} url={"/puntoventa"} />
                </Page>
                <Page label={"Facturacion"} url={"/facturacion"}
                    permiso="ver"
                    icon={<ImagePage key_page="a122ab1e-bf18-4831-8136-befa06e406d3" />}
                />
                <Page label={"CRM"} url={"/crm"}
                    permiso="ver"
                    icon={<ImagePage key_page="9b5de113-c6e9-4bef-b686-5732056f71fb" />}
                />
                <Page label={"Drive"} url={"/drive"}
                    permiso="ver"
                    icon={<ImagePage key_page="fd0c2bfe-0f13-4e81-a967-213cc0adb299" />}
                />
                {/* <Page label={"Iconos"} url={"/icons"} /> */}
                <Page label={"Usuarios"} url={"/usuario"}
                    permiso="ver"
                    icon={<ImagePage key_page="419dfc13-34db-4935-a13c-b05cfd9d599a" />}
                />
                <Page label={"Roles y Permisos"} url={"/rol"}
                    permiso="ver"
                    icon={<ImagePage key_page="c4666514-202f-4d8d-8656-64c82065ba67" />}
                />
            </ScrollView>
        </View>
    }
}

const ImagePage = ({ key_page }: { key_page: string }) => {
    // @ts-ignore
    const urlrp = SSocket.api.roles_permisos;
    return <SImage src={urlrp + "page/" + key_page} />
}