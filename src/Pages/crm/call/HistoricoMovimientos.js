import React, { Component } from 'react';
import { View, Text, SectionList } from 'react-native';
import { SDate, SImage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';

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
        }).then(e => {
            const historico = e.data;
            const sections = this.groupByDate(historico);
            this.setState({ historico, sections });
        }).catch(error => {
            // manejar error
        })
    }

    groupByDate(data) {
        // Primero ordenamos por fecha descendente
        const sorted = data.sort((a, b) => {
            return new SDate(b.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime() - new SDate(a.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime();
        });

        // Usamos un objeto para agrupar por fecha (yyyy-MM-dd)
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
                            <SText flex numberOfLines={1}>
                                <SText clean>{item.state}</SText>
                                <SText clean fontSize={12} numberOfLines={1} color={STheme.color.lightGray}>{item?.data?.comentario}</SText>
                            </SText>
                            <SView width={20} height={20} style={{
                                borderRadius: 100,
                                overflow: "hidden",
                            }}>
                                <SImage src={SSocket.api.root + "usuario/" + item.data?.key_usuario_atiende} style={{ resizeMode: "cover" }} />
                            </SView>
                        </SView>
                    )}
                />
            </View>
        );
    }
}
