import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SInput, SList, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../../../Model';

type PropsType = {
    precio_compra: any,
    descripcion: any,
    key_compra_venta_detalle: any,
    key_compra_venta: any,
    key_almacen: any,
    cantidad: any,

}
export default class PopupTipoRecepcion extends Component<PropsType> {

    static KEY_POPUP = "PopupTipoRecepcion"
    static open = (props: PropsType) => {
        SPopup.open({
            key: this.KEY_POPUP,
            content: <PopupTipoRecepcion {...props} />
        })
    }
    static close = () => {
        SPopup.close(this.KEY_POPUP)
    }

    props: PropsType;
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    item(props) {
        return <SView card width={100} height={100} center onPress={props.onPress}>
            <SHr />
            <SIcon name={props.icon} />
            <SHr />
            <SText fontSize={16} bold>{props.label}</SText>
            <SHr />
        </SView>
    }

    render() {
        return (
            <SView col={"xs-12 sm-10 md-8 lg-6 xl-4"} height={300} center withoutFeedback backgroundColor={STheme.color.background} padding={8}>
                <SHr />
                <SText fontSize={18} bold>Tipos de recepción</SText>
                <SView flex />
                <SList
                    data={[
                        {
                            label: "Ver compra", icon: "Carrito", onPress: () => {
                                // console.log(this.props);
                                SNavigation.navigate("/compra/profile", { pk: this.props.key_compra_venta })
                                PopupTipoRecepcion.close();
                            }
                        },
                        {
                            label: "Individual", icon: "Add", onPress: () => {
                                this.type_individual();
                            }
                        },
                        {
                            label: "Excel", icon: "Excel", onPress: () => {
                                this.type_excel();
                            }
                        },
                    ]}
                    style={{ justifyContent: 'space-between', flex: 1 }}
                    horizontal
                    render={this.item}
                />
                <SView flex />
            </SView>
        );
    }

    type_excel() {
        SPopup.confirm({
            title: "Recepcion por excel!",
            message: "A continuación, deberás seleccionar un modelo y posteriormente se descargará un archivo de Excel para que puedas completar los datos de los productos a recibir. Una vez que hayas completado los datos, podrás subir el archivo modificado.",
            onPress: () => {
                SNavigation.navigate("/inventario/almacen/profile/recepcion_compra_excel", { pk: this.props.key_almacen, ...this.props })
                PopupTipoRecepcion.close()
            }
        });

    }
    type_individual() {
        SNavigation.navigate("/productos/producto/new", {
            precio_compra: this.props.precio_compra,
            descripcion: this.props.descripcion,
            key_compra_venta_detalle: this.props.key_compra_venta_detalle,
            key_almacen: this.props.key_almacen,
            onSelect: (data) => {
                console.log("ENTRO AL ONSELECT ", data)
                // if (this.state.loading) return;
                // this.setState({ loading: "Cargando..." })
                Model.compra_venta_detalle.Action.recepcionar({
                    key_compra_venta_detalle: this.props.key_compra_venta_detalle,
                    key_producto: data.key
                }).then((resp) => {
                    // this.setState({ loading: false })
                    Model.producto.Action.CLEAR();
                    Model.compra_venta_detalle.Action.CLEAR();
                    
                    SNavigation.replace("/productos/producto/profile", { pk: data.key })
                }).catch(e => {
                    // this.setState({ loading: false })
                    console.log(e)
                    SPopup.alert("Error al recepcionar el producto.")
                    SNavigation.goBack();
                })

            }
        });
        PopupTipoRecepcion.close()
    }
}
