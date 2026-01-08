import React, { Component } from 'react';
import { SBuscador, SHr, SIcon, SInput, SLoad, SNavigation, SNotification, SPage, SText, STheme, SThread, SView } from "servisofts-component";
import MDL from "../../../MDL";
import SIconApp from "../../../Assets/SIconApp";
import { Dimensions, FlatList } from "react-native";
import SSocket from "servisofts-socket";
import Model from "../../../Model";
// import States from "./Components/States";
import { Parent } from "..";
import { Container } from '../../../Components';


export default class Root extends Component {

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
            search: "",

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

        const habilidades = await MDL.habilidad.getAll();

        this.setState({ habilidades: habilidades });

        this.forceUpdate()

    }



    render() {


        return (
            <SPage title={"Habilidades"}  >
                <SView col={"xs-12"} style={{ paddingTop: 15 }}>
                    <Container>
                        <SView col="xs-12" center >
                            <SBuscador
                                height={28}
                                data={this.state.cards ?? []}
                                onChange={e => {
                                    this.setState({ busqueda: e })
                                }}
                            />
                            <SHr height={10} />
                            <FlatList style={{ width: "100%" }}
                                // data={SBuscador.filter(this.state.habilidades ?? [], this.state.busqueda, ["descripcion"])}
                                data={SBuscador.filter({ data: this.state.habilidades ?? [], txt: this.state.busqueda })}
                                // data={this.state.habilidades}
                                renderItem={(obj) => {
                                    return <Item item={obj.item} selectAll={this.state.selectAll} onPress={() => {
                                        // console.log("onChange", e);
                                        // obj.item._selected = e;
                                        console.log("navegar a medicos de habilidad:", obj.item.key);
                                        SNavigation.navigate("/venta/grupal/medicos", { pk: obj.item.key });
                                        this.forceUpdate();
                                    }} />
                                }}
                            // ListFooterComponent={() => {
                            //     if (this.state.searchText && this.state.searchText.trim() !== "") {
                            //         return <SView row col={"xs-12"} style={{
                            //             padding: 8,
                            //             borderBottomWidth: 1,
                            //             borderBottomColor: STheme.color.card,
                            //             backgroundColor: STheme.color.card + "40",
                            //         }} onPress={() => {
                            //             console.log("Crear nueva habilidad:", this.state.searchText);
                            //             MDL.habilidad.registro({
                            //                 descripcion: this.state.searchText.trim()
                            //             }).then((nuevaHabilidad: any) => {
                            //                 nuevaHabilidad._selected = true;
                            //                 this.state.habilidades.push(nuevaHabilidad);
                            //                 this.setState({ searchText: "" });
                            //             }).catch((error) => {
                            //                 console.error("Error al crear habilidad:", error);
                            //             });
                            //             // Aquí puedes agregar la lógica para crear una nueva habilidad
                            //         }}>
                            //             <SIcon name="Add" width={20} height={20} fill={STheme.color.primary} />
                            //             <SView width={8} />
                            //             <SText >Crear: "{this.state.searchText}"</SText>
                            //         </SView>
                            //     }
                            //     return null;
                            // }}
                            />
                        </SView>
                    </Container>
                </SView>
            </SPage>
        );
    }
}

const Item = (props) => {
    return (
        <SView row col={"xs-12"} style={{
            padding: 10,
            borderWidth: 1,
            borderColor: STheme.color.card,
            backgroundColor: STheme.color.card,
            marginBottom: 10,
            borderRadius: 4,
        }} onPress={props.onPress} >
            <SText style={{ textTransform: "uppercase" }}>{props.item.descripcion}</SText>
            <SView width={25} height={25} center row
                style={{
                    position: "absolute",
                    right: 5,
                    top: 5,
                    borderRadius: 50,
                    transform: [{ rotate: "180deg" }],
                }}>
                <SIconApp height={14} width={14} name='Back' fill={STheme.color.text} />
            </SView>
        </SView>
    );
}


