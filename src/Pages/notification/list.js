import React from 'react';
import { SDate, SHr, SImage, SList, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../Model';
import item from './item';
import SSocket from 'servisofts-socket';
import { Container } from '../../Components';
class index extends DPA.list {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        const limit = 10;
        let page = 0;
        SSocket.sendPromise({
            "version": "1.0",
            "service": "notification",
            "component": "notification",
            "type": "getAllV2",
            "estado": "cargando",
            "key_usuario": Model.usuario.Action.getKey(),
            "limit": 100,
            "offset": limit * page,
        }).then(e => {
            this.setState({ data: e.data })
        }).catch(e => {

        })
    }

    render() {
        return <SPage title={"Notificaciones"} onRefresh={(res) => {
            this.componentDidMount();
            if (res) res()
        }}>
            <Container >
                <SHr h={30} />
                <SList
                    data={this.state.data}
                    limit={30}
                    filter={a => a?.data?.key_empresa == Model.empresa.Action.getKey()}
                    order={[{ "key": "fecha_on", order: "desc", type: "date" }]}
                    render={(e) => {
                        let deepLink = e?.data?.deepLink;
                        let key_empresa = e?.data?.key_empresa;
                        return <SView col={"xs-12"} row center
                            style={{
                                paddingTop: 16,
                                paddingBottom: 16,
                                borderBottomWidth: 1,
                                borderColor: STheme.color.card
                            }}
                            onPress={!deepLink ? null : () => {
                                SNavigation.INSTANCE.openDeepLink(deepLink)
                            }}
                        >
                            <SView col={"xs-2"} height style={{
                                alignItems: "center"
                            }}>
                                <SView style={{ width: 40, height: 40, borderRadius: 100, backgroundColor: STheme.color.card, overflow: "hidden" }}>
                                    <SImage src={SSocket.api.root + "usuario/" + e.key_usuario} />
                                </SView>
                            </SView>
                            <SView flex>
                                <SText clean bold fontSize={16}>{(e.descripcion ?? "").substring(0, 100)}</SText>
                                <SText clean fontSize={14} color={STheme.color.lightGray}>{(e.observacion ?? "").substring(0, 100)}</SText>
                                {/* {!deepLink ? null : <SText onPress={() => {
                                    SNavigation.INSTANCE.openDeepLink(deepLink)
                                }} underLine color={STheme.color.link}>Ver</SText>} */}
                            </SView>
                            <SView style={{ width: 40, height: 40, borderRadius: 4, backgroundColor: STheme.color.card, overflow: "hidden" }}>
                                <SImage src={e?.url_image} />
                            </SView>
                            <SText style={{
                                position: "absolute",
                                bottom: 0,
                                right: 0,
                            }} clean color={STheme.color.lightGray} fontSize={10} center>Hace {new SDate(e.fecha_on, "yyyy-MM-ddThh:mm:ss").timeSince(new SDate())}</SText>

                        </SView>
                    }}
                />
                <SView height={100} />
            </Container>
        </SPage>
    }
}
export default connect(index);