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
                }
            })
            const sections = this.groupByDate(historico);
            this.setState({ historico, sections });
        }).catch(error => {
            // manejar error
        })
    }

    groupByDate(data) {
        // Paso 1: Filtrar los mensajes sin state (comentarios)
        const sinState = data.filter(item => !item?.state);

        // Paso 2: Solo mantener el último comentario por bloque de usuario
        const ultimosPorBloque = sinState.filter((item, index, arr) => {
            const actualKey = item.data?.key_usuario_atiende;
            const siguiente = arr[index + 1];
            const siguienteKey = siguiente?.data?.key_usuario_atiende;
            return actualKey !== siguienteKey;
        });

        // Paso 3: Obtener los items que tienen state definido
        const conState = data.filter(item => item?.state);

        // Paso 4: Combinar ambos (comentarios filtrados + estados)
        const combinados = [...ultimosPorBloque, ...conState];

        // Paso 5: Ordenar todos por fecha descendente
        const sorted = combinados.sort((a, b) =>
            new SDate(b.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime() -
            new SDate(a.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime()
        );

        // Paso 6: Agrupar por fecha yyyy-MM-dd
        const grouped = {};

        sorted.forEach(item => {
            const fecha = new SDate(item.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM-dd");
            if (!grouped[fecha]) {
                grouped[fecha] = [];
            }
            grouped[fecha].push(item);
        });

        // Convertimos el objeto en un array de secciones
        const sections = Object.keys(grouped).map(fecha => ({
            title: fecha,
            data: grouped[fecha],
        }));

        // Ordenamos las secciones por fecha descendente
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
                        }}>
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
                            <SText flex numberOfLines={1}>
                                <Etiqueta tipo_leads={item?.state}></Etiqueta>
                                <SText clean >{" "}</SText>
                                <SText clean fontSize={12} numberOfLines={1} color={STheme.color.lightGray}>{item?.data?.comentario}</SText>
                                <SText clean >{" "}</SText>
                                <SText clean fontSize={12} numberOfLines={1} color={STheme.color.lightGray}>{item?.tipo_movimiento?.descripcion}</SText>

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
