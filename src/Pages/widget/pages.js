import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SImage, SList, SLoad, SNavigation, SPage, SText, STheme, SUtil, SView } from 'servisofts-component';
import Model from '../../Model';
import SSocket from 'servisofts-socket';
import { Container } from '../../Components';

export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.onSelect = SNavigation.getParam("onSelect");
        if(typeof this.onSelect != "function"){
            SNavigation.goBack()
        }
    }

    componentDidMount() {
        SSocket.sendPromise({
            "version": "1.0",
            "service": "roles_permisos",
            "component": "usuarioPage",
            "type": "getAll",
            "estado": "cargando",
            "key_usuario": "29acdaa5-1d51-4725-8f49-9d493cea9702",
            "key_empresa": "78a987e5-fa54-4d4d-b8e8-3a051bb6de90"
        }).then(e => {
            this.setState({ data: e.data })
            console.log(e);
        }).catch(e => {
            console.error(e);
        })
    }


    renderItem(obj) {
        return <SView col={"xs-3"} center height={80} onPress={() => {
            if (this.onSelect) {
                this.onSelect(obj);
                return;
            }
            SNavigation.navigate(obj.url)
        }}>
            <SView style={{
                width: 50,
                height: 50,
                backgroundColor: STheme.color.card,
                borderRadius: 4,
                overflow: 'hidden',
            }} >
                <SImage src={SSocket.api.roles_permisos + "page/" + obj.key} />
            </SView>
            <SText>{SUtil.limitString(obj.descripcion, 12)}</SText>
            {/* <SText>{SUtil.limitString(obj.url, 110)}</SText> */}
        </SView>
    }
    render() {
        return <SPage title={"Widgets"} disableScroll>
            {!this.state.data ? <SLoad /> :
                <SList data={this.state.data}
                    space={0}
                    scrollEnabled={false}
                    numColumns={4}
                    filter={(a) => !!a?.permisos?.page}
                    order={[{ key: "descripcion", type: "text", order: "asc" }]}
                    render={this.renderItem.bind(this)}
                />
            }
        </SPage>
    }
}
