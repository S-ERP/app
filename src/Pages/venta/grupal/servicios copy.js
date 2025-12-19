import React, { Component } from 'react';
import { SHr, SIcon, SImage, SInput, SLoad, SNavigation, SNotification, SPage, SText, STheme, SThread, SView } from "servisofts-component";
import MDL from "../../../MDL";
import SIconApp from "../../../Assets/SIconApp";
import { Dimensions, FlatList } from "react-native";
import SSocket from "servisofts-socket";
import Model from "../../../Model";
// import States from "./Components/States";
import { Parent } from "..";
import habilidad from '../../habilidad';
import { Container } from '../../../Components';


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

        this.forceUpdate()

    }

    getBtnFooter() {
        if (this.state.dataSelect.length == 0) return null;
        let total = 0;
        let cantidad = 0;
        this.state.dataSelect.map((obj) => {
            total += parseFloat(obj.precio_venta);
            cantidad += 1;
        });

        return <SView col={"xs-12"} center backgroundColor={STheme.color.primary}
            style={{
                // height: 70,
            }}>
            <Container>
                <SHr height={10} />
                <SView col={'xs-12'} row center>
                    <SView flex height={47}>
                        <SText
                            color={STheme.color.secondary}
                            font={'Roboto'}
                            fontSize={15}>{`${cantidad} items`}</SText>
                        <SText
                            color={STheme.color.secondary}
                            font={'Roboto'}
                            fontSize={22}>{`Bs. ${total.toFixed(2)}`}</SText>
                    </SView>
                    <SView flex height={40} style={{
                        backgroundColor: STheme.color.info,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#eeeeee',
                    }} onPress={() => {
                        if (this.state?.dataSelect.length == 0) {
                            SPopup.alert("Debe seleccionar al menos un servicio")
                            return;
                        }
                        SNavigation.navigate("/ficha/horarios", { codesp: this.codesp, codmed: this.codmed, nrosuc: this.nrosuc });
                    }} center>
                        <SText
                            center
                            color={STheme.color.white}
                            font={'Roboto'}
                            fontSize={17}>
                            SOLICITAR
                        </SText>
                    </SView>
                </SView>
                <SHr height={10} />
            </Container >
          
        </SView >
    }



    render() {


        return (
            <SPage title={"Servicios"} footer={this.getBtnFooter()} >
                <SView col={"xs-12"} padding={15} >
                    <SView col="xs-12" center  >
                        <FlatList style={{ width: "100%" }}
                            data={this.state.articulosCliente}
                            renderItem={(obj) => {
                                return <Item item={obj.item} selectAll={this.state.selectAll} check={this.state.check}
                                    dataSelect={this.state.dataSelect}
                                    onPress={() => {
                                        // console.log("onChange", e);
                                        // obj.item._selected = e;
                                        this.forceUpdate();
                                    }} />
                            }}
                        />
                    </SView>
                </SView>
            </SPage>
        );
    }
}

const Item = ({ item, check, onPress, dataSelect }) => {
    // let dataSelect = [];
    let key = item.key;
    return (
        <SView row center col={"xs-12"} style={{

            borderWidth: 1,
            borderColor: STheme.color.card,
            backgroundColor: STheme.color.card,
            marginBottom: 10,
            borderRadius: 4,
        }} onPress={onPress} >
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
            <SView col={"xs-3"} row height>
                <SView col={"xs-8"} center height backgroundColor={STheme.color.card} padding={5}>
                    <SText fontSize={16} color={STheme.color.white} >Bs. {(item?.modelo?.precio_venta ?? 0).toFixed(2)}</SText>
                </SView>
                <SView col={"xs-4"} center height >
                    {/* <SHr height={2}/> */}
                    <SView col={"xs-12"} center height={42} style={{
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
                            width={30}
                            height={30}
                            type={"checkBox"}
                            defaultValue={!!check}
                            onChangeText={(e) => {
                                console.log(item)
                                if (e) {
                                    dataSelect.push(item)
                                    console.log("check")
                                    // this.setState({ dataSelect: dataSelect })
                                    console.log(dataSelect)

                                    // carrito.Actions.addToCard({
                                    //     key: key,
                                    //     ...item
                                    // }, this.props)

                                } else {
                                    dataSelect = dataSelect.filter((dat) => dat.modelo.descripcion !== item.modelo.descripcion)
                                    console.log("NO check")
                                    // this.setState({ dataSelect: dataSelect })
                                    console.log(dataSelect)
                                    // carrito.Actions.removeItem(key, this.props);
                                }
                            }}
                        />
                    </SView>
                    {/* <SHr height={2}/> */}
                </SView>
            </SView>

        </SView>
    );
}


