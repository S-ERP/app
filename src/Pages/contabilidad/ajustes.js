import { Text, View } from 'react-native'
import React, { Component } from 'react'
import { SList, SLoad, SPage, SText, STheme, SView } from 'servisofts-component'
import Model from '../../Model'
import Container from '../../Components/Container'
import Components from '../../Components'
import { connect } from 'react-redux'

class index extends Component {

    state = {
        key_empresa: Model.empresa.Action.getSelect().key
    }
    componentDidMount() {
        Model.ajuste.Action.getAllAsync().then(e => {
            console.log(e);
            this.setState({ data: e.data })
        }).catch(e => {

        })
    }

    item(obj) {
        let existe = Object.values(this.mis_ajustes).find(a => a.key_ajuste == obj.key && a.key_empresa == this.state.key_empresa);
        return <SView col={"xs-12"} onPress={() => {

        }} >
            <SView col={"xs-12"} >
                <SText bold fontSize={18}>{obj.descripcion}</SText>
                {/* <SView width={8} /> */}
                <SText fontSize={12} color={STheme.color.lightGray}>{obj.observacion}</SText>
            </SView>

            <Components.contabilidad.cuenta_contable.Select codigo={""}
                key_cuenta_contable={existe?.key_cuenta_contable}
                // selectAny
                onChange={e => {
                    Model.ajuste_empresa.Action.registro({
                        key_empresa: this.state.key_empresa,
                        key_ajuste: obj.key,
                        key_cuenta_contable: e.key,
                        key_usuario: Model.usuario.Action.getKey(),
                    }).then((e) => {
                        console.log("exito")
                    }).catch(e => {
                        console.error("exito")
                    })
                }} />
        </SView>
    }

    render() {
        this.mis_ajustes = Model.ajuste_empresa.Action.getAll();
        if (!this.mis_ajustes) return <SLoad />
        
        return <SPage title={"Configura tus ajustes"} >
            <Container>
                <SList
                    order={[{ key: "index", order: "asc", type: "number" }]}
                    scrollEnabled={false}
                    // space={50}
                    data={this.state?.data}
                    render={this.item.bind(this)}
                />
            </Container>
        </SPage>
    }
}

const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);