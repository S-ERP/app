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


export default class medicos extends Component {

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


        let clientes = await MDL.crm.cliente.getAll();
        let habilidades = await MDL.habilidad.getAllWithUsuarios();
        // const habilidades = await MDL.habilidad.getAll();
        this.setState({ habilidades: habilidades });

        console.log("clientes", clientes);
        console.log("habilidades", habilidades);

        let habilidadSeleccionada = habilidades.find((h) => h.key == this.pk);
        console.log("habilidadSeleccionada", habilidadSeleccionada);
        if (!habilidadSeleccionada) {
            return;
        }

        let medicosConHabilidad = (habilidadSeleccionada?.key_usuarios ?? []).map((usuarioHabilidad) => {
            let cliente = clientes.find((c) => c.key == usuarioHabilidad);
            if (cliente) {
                return {
                    ...cliente,
                    habilidad: habilidadSeleccionada
                };
            }
            return null;
        }).filter((c) => c != null);

        // console.log("usuarioHabilidad",usuarioHabilidad)
        // });
        this.setState({ medicosConHabilidad: medicosConHabilidad });
        console.log("medicosConHabilidad", medicosConHabilidad);


        this.forceUpdate()

    }



    render() {


        return (
            <SPage title={"Médicos"}  >
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
                                data={SBuscador.filter({ data: this.state.medicosConHabilidad ?? [], txt: this.state.busqueda })}

                                // data={this.state.medicosConHabilidad}
                                renderItem={(obj) => {
                                    return <Item item={obj.item} selectAll={this.state.selectAll} onChange={(e) => {
                                        // console.log("onChange", e);
                                        // obj.item._selected = e;
                                        SNavigation.navigate("/venta/grupal/servicios", { pk: obj.item.key });
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

const Item = (props) => {
    return (
        <SView row center col={"xs-12"} style={{
            padding: 10,
            borderWidth: 1,
            borderColor: STheme.color.card,
            backgroundColor: STheme.color.card,
            marginBottom: 10,
            borderRadius: 4,
        }} onPress={() => {
            props.onChange(!props.item._selected);
        }}>
            <SView width={35} height={35}
                style={{
                    borderRadius: 50,
                    overflow: 'hidden',
                    backgroundColor: STheme.color.card + "66",
                    borderWidth: 1,
                    borderColor: STheme.color.card
                }}>
                <SImage src={SSocket.api.root + "usuario/" + props.item?.key} style={{ resizeMode: 'cover' }} enablePreview />
            </SView>
            <SView width={8} />
            <SView flex>
                <SText col={"xs-12"} style={{ textTransform: "uppercase" }}>{props.item?.nombres}</SText>
                <SText col={"xs-12"} fontSize={10} style={{ textTransform: "uppercase", color: STheme.color.lightGray }}>{props.item?.habilidad?.descripcion}</SText>
            </SView>

            <SView width={25} height={45} center row
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


