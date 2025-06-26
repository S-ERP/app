import React, { Component } from 'react';
import { View, Text, SectionList } from 'react-native';
import { SDate, SImage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Etiqueta from '../Components/Etiqueta';
import MDL from '../../../MDL';
import SIconApp from '../../../Assets/SIconApp';
// import Etiqueta from '../../../Components/Etiqueta';

export default class HistoricoMovimientos extends Component {
    constructor(props) {
        super(props);
        this.state = {
            historico: [],
            sections: [],
        };
    }

    validarcomentario(item) {
        if (!item || !item.data) return "";

        const { notas, instrucciones_especiales, fecha_entrega } = item.data;

        // Prioridad: si item tiene tipo_movimiento.descripcion, se muestra
        if (item?.tipo_movimiento?.descripcion) {
            return item.tipo_movimiento.descripcion;
        }

        // Validaciones individuales
        // if (notas) return "Notas: " + item?.data?.notas;
        // if (instrucciones_especiales) return "Instrucciones especiales: " + item?.data?.instrucciones_especiales;
        // if (fecha_entrega) return "Fecha de entrega: " + item?.data?.fecha_entrega;

        // Si hay al menos uno de los tres campos, muestra mensaje genérico
        if (notas || instrucciones_especiales || fecha_entrega) {
            return "Se agregó información adicional";
        }

        return "";
    }


    componentDidMount() {
        SSocket.sendPromise({
            service: "crm",
            component: "cliente_proyecto",
            type: "getHistoricoByKey",
            key: this.props.key_cliente_proyecto
        }).then(async (e) => {

            const tipos_movimientos = await MDL.crm.tipoMovimientoLead.getAll()
            const historico = e.data;
            e.data.forEach(item => {
                if (item?.data?.key_tipo_movimiento_lead) {
                    item.tipo_movimiento = tipos_movimientos.find(tipo => tipo.key === item.data.key_tipo_movimiento_lead);
                    // console.log("cocacola " + item.tipo_movimiento)

                }
            })


            const sections = this.groupByDate(historico);
            console.log("cocacola " + JSON.stringify(historico))

            this.setState({ historico, sections });
        }).catch(error => {
            // manejar error
        })
    }

    groupByDate(data) {
        const resultado = [];
        let prevKey = null;
        let ultimoComentario = null;

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const usuario = item.data?.key_usuario_atiende;
            const isComentario = !item?.state;

            if (isComentario) {
                // Si cambia de usuario, reseteamos el último comentario
                if (usuario !== prevKey && ultimoComentario) {
                    resultado.push(ultimoComentario);
                    ultimoComentario = null;
                }
                // Solo guardamos el comentario más reciente de este bloque
                ultimoComentario = item;
            } else {
                // Si veníamos acumulando comentario, lo guardamos antes del estado
                if (ultimoComentario) {
                    resultado.push(ultimoComentario);
                    ultimoComentario = null;
                }
                resultado.push(item); // Siempre mostrar estados
            }

            prevKey = usuario;
        }

        // Si quedó un comentario pendiente al final, lo agregamos
        if (ultimoComentario) {
            resultado.push(ultimoComentario);
        }

        // Ordenamos por fecha
        const sorted = resultado.sort((a, b) =>
            new SDate(b.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime() -
            new SDate(a.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime()
        );

        // Agrupamos por fecha (yyyy-MM-dd)
        const grouped = {};
        sorted.forEach(item => {
            const fecha = new SDate(item.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM-dd");
            if (!grouped[fecha]) grouped[fecha] = [];
            grouped[fecha].push(item);
        });

        const sections = Object.keys(grouped).map(fecha => ({
            title: fecha,
            data: grouped[fecha],
        }));

        sections.sort((a, b) => (a.title < b.title ? 1 : -1));

        return sections;
    }

    render() {



        return (
            <View style={{ flex: 1 }}>
                <Text>HistoricoMovimientos</Text>
                <SectionList
                    sections={this.state.sections}
                    keyExtractor={(item, index) => item.key + "_" + index}
                    renderSectionHeader={({ section }) => (
                        <View style={{ padding: 8 }}>
                            <Text style={{ fontWeight: "bold", fontSize: 16, color: STheme.color.text }}>{section.title}</Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <SView row center padding={4} style={{
                            borderBottomWidth: 1,
                            borderColor: STheme.color.card,
                        }}
                            onPress={() => {
                                console.log("------------------------------------", item)
                                alert("sss");
                            }}

                        >
                            <SText fontSize={10} color={STheme.color.gray}>
                                {new SDate(item.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("hh:mm")}
                            </SText>
                            <SView width={8} />
                            <SView width={20} height={20} style={{
                                borderRadius: 100,
                                overflow: "hidden",
                            }}>
                                <SImage enablePreview src={SSocket.api.root + "usuario/" + item.data?.key_usuario_atiende} style={{ resizeMode: "cover" }} />
                            </SView>
                            <SView width={8} />
                            <SText flex numberOfLines={1} >
                                <Etiqueta tipo_leads={item?.state}></Etiqueta>
                                <SText clean >{" "}</SText>
                                <SText clean fontSize={12} numberOfLines={1} color={STheme.color.lightGray}> {item?.data?.comentario}</SText>
                                <SText clean >{" "}</SText>
                                <SText clean fontSize={12} numberOfLines={1} color={STheme.color.lightGray}>{this.validarcomentario(item)}</SText>
                                {item.data.fecha_rellamada && <>
                                    <SView row center>
                                        <SView width={4} />
                                        <SIconApp name='recall' width={14} height={14} fill={STheme.color.lightGray} />
                                        <SView width={4} />

                                        <SText clean fontSize={10} color={STheme.color.lightGray}> {" " + new SDate(item.data.fecha_rellamada, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM-dd hh:mm")}</SText>

                                    </SView>
                                </>}
                            </SText>

                        </SView>
                    )}
                />
            </View>
        );
    }
}
