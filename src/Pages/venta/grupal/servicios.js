import React, { Component } from 'react';
import { SBuscador, SHr, SIcon, SImage, SInput, SLoad, SNavigation, SNotification, SPage, SText, STheme, SThread, SView } from "servisofts-component";
import MDL from "../../../MDL";
import SIconApp from "../../../Assets/SIconApp";
import { Dimensions, FlatList } from "react-native";
import SSocket from "servisofts-socket";
import Model from "../../../Model";
// import States from "./Components/States";
import { Parent } from "..";
import habilidad from '../../habilidad';
import { Container } from '../../../Components';
import { SStorage } from 'servisofts-component';


export default class servicios extends Component {

    constructor(props) {
        super(props);
        this.state = {
            curState: "",
            totales: {
                subtotal: 0,
                descuento: 0,
                total: 0,
                gifcard: 0,
                total_a_pagar: 0,
                credito_fiscal: 0,
            },
            check: false,
            dataSelect: [],

        }
        this.pk = SNavigation.getParam("pk");

    }

    componentDidMount() {
        if (!Model.usuario.Action.getKey()) {
            SNavigation.navigate("/login");
        }
        this.loadData();


    }

    async loadData() {


        let allArticulos = await MDL.inventario.getAllModeloStock();

        let articulos = await MDL.inventario.getModelosByCliente(this.pk);
        let art = articulos.map(a => {
            return {
                ...a,
                modelo: allArticulos.find(m => m.key == a.key_modelo) || { descripcion: "MODELO ELIMINADO" },
            }
        });
        this.setState({ articulosCliente: art });
        console.log("articulosCliente", art);

        const dataSelect_ = await SStorage.getItem("dataSelectServicios");
        if (dataSelect_) {
            this.setState({ dataSelect: JSON.parse(dataSelect_) });
        }
        this.forceUpdate()

    }






    onSelectItem = (item, checked) => {
        this.setState(prev => {
            let dataSelect = [...prev.dataSelect];

            if (checked) {
                // evitar duplicados
                if (!dataSelect.find(d => d.key === item.key)) {
                    dataSelect.push(item);
                    MDL.carrito.addProductoServicio(item.modelo);

                }
            } else {
                dataSelect = dataSelect.filter(d => d.key !== item.key);
                MDL.carrito.removerItemAlCarritoDeVentas(item);
            }

            SStorage.setItem("dataSelectServicios", JSON.stringify(dataSelect));
            // SStorage.setItem("dataSelectServicios", dataSelect);

            return { dataSelect };
        });
    };




    render() {
        console.log("dataSelect", this.state.dataSelect);

        return (
            <SPage title={"Servicios"}
            // footer={this.getBtnFooter()} 
            >
                <SView col={"xs-12"} style={{ paddingTop: 15 }} >
                    <Container>
                        <SView col="xs-12" center  >
                            <SBuscador
                                height={28}
                                data={this.state.cards ?? []}
                                onChange={e => {
                                    this.setState({ busqueda: e })
                                }}
                            />
                            <SHr height={10} />
                            <FlatList style={{ width: "100%" }}
                                data={SBuscador.filter({ data: this.state.articulosCliente ?? [], txt: this.state.busqueda })}
                                // data={this.state.articulosCliente}
                                renderItem={(obj) => {
                                    return <Item item={obj.item}
                                        ref={(ref) => (this.modeloRef = ref)}
                                        check={this.state.dataSelect.some(d => d.key === obj.item.key)}
                                        onSelect={this.onSelectItem}
                                        onPress={() => {

                                            console.log("SERVICIO CARRITO", obj.item.modelo);
                                            // this.carro.addProductoServicio(obj.item.modelo);
                                            this.forceUpdate();
                                        }} />
                                }}
                            />
                        </SView>
                    </Container>
                </SView>
            </SPage>
        );
    }
}

const Item = ({ item, check, onSelect, onPress }) => {
    // let dataSelect = [];
    let key = item.key;
    console.log("check: ", check);
    return (
        <SView row center col={"xs-12"} style={{

            borderWidth: 1,
            borderColor: STheme.color.card,
            backgroundColor: STheme.color.card,
            marginBottom: 10,
            borderRadius: 4,
        }}
            // onPress={() => onSelect(item, !check)}
            onPress={() => {


                onPress();
                onSelect(item, !check);
            }}

        >
            <SView col={"xs-9"} row padding={10}>
                <SView width={40} height={40}
                    style={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        backgroundColor: STheme.color.card + "66",
                        borderWidth: 1,
                        borderColor: STheme.color.card
                    }}>
                    <SImage src={SSocket.api.inventario + "modelo/.128_" + item?.modelo?.key} style={{
                        width: 40, height: 40, resizeMode: "contain", borderWidth: 1,
                        borderColor: STheme.color.card, borderRadius: 4
                    }} />
                </SView>
                <SView width={8} />
                <SText flex fontSize={16} bold>{item?.modelo?.descripcion}</SText>
            </SView>
            <SView col={"xs-3"} row height center>
                <SView col={"xs-8"} center height backgroundColor={STheme.color.card} padding={5}>
                    <SText fontSize={16} color={STheme.color.white} >Bs. {(item?.modelo?.precio_venta ?? 0).toFixed(2)}</SText>
                </SView>
                <SView col={"xs-4"} center height >
                    {/* <SHr height={2}/> */}
                    <SView col={"xs-12"} center height={40} style={{
                        borderWidth: 2,
                        borderLeftWidth: 0,
                        borderColor: STheme.color.card,
                        borderTopRightRadius: 8,
                        borderBottomRightRadius: 8,
                        backgroundColor: STheme.color.white
                    }}  >
                        {/* {this.state.check ? <SIcon name={"chek"} height={20} /> : null} */}
                        <SInput
                            col={""}
                            width={20}
                            height={20}
                            type={"checkBox"}
                            // defaultValue={!!check}
                            value={!!check}
                            onChangeText={(e) => {
                                onSelect(item, e);
                            }}
                        />
                    </SView>
                    {/* <SHr height={2}/> */}
                </SView>
            </SView>

        </SView>
    );
}


