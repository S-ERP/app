import { Text, View } from 'react-native'
import React, { Component } from 'react'
import { SList, SLoad, SPage, SText, STheme, SView, SForm } from 'servisofts-component'
import Model from '../../Model'
import Container from '../../Components/Container'
import Components from '../../Components'
import { connect } from 'react-redux'
import SSocket from "servisofts-socket"
class index extends Component {

    state = {
        key_empresa: Model.empresa.Action.getSelect().key,
        loading: false,
    }
    componentDidMount() {
        SSocket.sendPromise({
            service: "contabilidad",
            component: "enviroment",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey()
        }).then(e => {
            this.setState({ data: e.data })
            console.log(e);
        }).then(e => {
            console.error(e);
        })
    }

    renderForm() {
        if (!this.state.data) return <SLoad />
        let arr = Object.values(this.state.data);
        return <SForm inputs={{
            "IVA": { type: "money", icon: <SText>%</SText>, label: "Valor del IVA en %", defaultValue: arr.find(a => a.descripcion == "IVA")?.observacion },
            "IT": { type: "money", icon: <SText>%</SText>, label: "Valor del IT en %", defaultValue: arr.find(a => a.descripcion == "IT")?.observacion },
            "IUE": { type: "money", icon: <SText>%</SText>, label: "Valor del IUE en %", defaultValue: arr.find(a => a.descripcion == "IUE")?.observacion },
        }}
            loading={this?.state?.loading}
            onSubmitName={"SUBIR"}
            onSubmit={(data) => {
                this.setState({ loading: true })
                SSocket.sendPromise({
                    service: "contabilidad",
                    component: "enviroment",
                    type: "registro",
                    data: data,
                    key_empresa: Model.empresa.Action.getKey(),
                    key_usuario: Model.usuario.Action.getKey()
                }).then(e => {
                    this.setState({ loading: false })

                }).catch(e => {
                    this.setState({ loading: false })
                })
            }}
        />
    }

    render() {

        return <SPage title={"Enviroments - Contabilidad"} >
            <Container>
                {this.renderForm()}
            </Container>
        </SPage>
    }
}

const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);