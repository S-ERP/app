import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SForm, SHr, SIcon, SList, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import DatoItem from "./DatoItem";
import SSocket from 'servisofts-socket'
import { Btn } from '../../../Components';
class AliasUsuario extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        let dataUser;
        console.log("key_usuario", this.props.key_usuario)
        SSocket.sendPromise({
            service: "empresa",
            component: "empresa_usuario",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey(),
        }).then(e => {
            dataUser = Object.values(e.data).find(o => o.key_usuario == this.props.key_usuario)
            this.setState({ data: dataUser })
        }).catch(e => {
            // this.setState({ data: e.data })
            console.log("error", e)
        })


    }


    getDatos() {

        if (!this.state.data) return null;
        return <SView col={"xs-12"} row  >
            <SForm
                row
                style={{ justifyContent: "space-between" }}
                ref={ref => this.form = ref}
                col={"xs-8"}
                inputs={{
                    alias: { col: "xs-12", label: "Alias", isRequired: true, defaultValue: this.state.data?.alias },
                }}
                onSubmit={(data) => {
                    this.setState({ loading: true })
                    SSocket.sendPromise({
                        service: "empresa",
                        component: "empresa_usuario",
                        type: "editar",
                        data: {
                            key: this.state.data.key,
                            alias: data.alias
                        }
                    }).then(e => {
                        this.setState({ loading: false })
                        // SNavigation.goBack();
                        SNotification.send({
                            key: "editar_alias_usuario",
                            title: "Alias actualizado",
                            body: "El alias del usuario ha sido actualizado correctamente.",
                            color: STheme.color.success,
                            time: 4000,
                        });
                        SNavigation.replace("/")

                    }).catch(e => {
                        this.setState({ loading: false })
                        SNotification.send({
                            key: "editar_alias_usuario_error",
                            title: "Error al actualizar alias",
                            body: "Ha ocurrido un error al actualizar el alias del usuario. Por favor, intenta nuevamente.",
                            color: STheme.color.danger,
                            time: 4000,
                        });
                        console.log("error", e)
                    })

                }}
            />
            <SView width={8} />
            <SView col={"xs-3.5"} center style={{ alignItems: "flex-end" }} >
                <SView card col={"xs-12"} center height={40}
                    style={{
                        backgroundColor: STheme.color.warning,
                        marginTop: 15,
                    }}
                    onPress={() => {
                        if (this.form) this.form.submit();
                    }}>
                    <SIcon name='Save' fill={STheme.color.text} width={12} />
                    <SView width={8} />
                    <SText>Guardar</SText>
                </SView>
            </SView>
        </SView>
    }
    render() {
        console.log("alias", this.state.data)
        return (
            <SView col={"xs-12"} >
                <SText fontSize={16} bold>Editar alias de usuario</SText>
                {this.getDatos()}
            </SView>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(AliasUsuario);