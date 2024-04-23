import React from "react";
import { SHr, SNavigation, SPage, SText, STheme, SView } from "servisofts-component";
import Container from "../../Components/Container";
import Model from "../../Model";
import SSocket from "servisofts-socket";
export default class index extends React.Component {
    item({ label, color, dificultad, onPress }) {
        return <SView padding={16} card onPress={onPress} col={"xs-12"} center style={{
            borderColor: color,
            borderWidth: 1,
        }}>
            <SText fontSize={16} bold>{label}</SText>
            <SText fontSize={12} color={STheme.color.lightGray}>Dificultad: ( {dificultad} )</SText>
        </SView>
    }
    render() {
        return <SPage title={"Iniciar la contabilidad"}>
            <Container>
                <SHr h={50} />
                <SText center color={STheme.color.warning}>Para iniciar con la contabiliad necesitamos seleccionar un Plan de cuentas contable. Si no tienes conocimiento contables utiliza un plan de cuentas ya configurado. </SText>
                <SHr h={50} />
                {this.item({
                    label: "Utilizar un plan de cuentas básico", color: STheme.color.success, dificultad: "Fácil", onPress: () => {
                        SSocket.sendPromise({
                            service: "contabilidad",
                            component: "cuenta_contable",
                            type: "clone_empresa",
                            key_usuario: Model.usuario.Action.getKey(),
                            key_empresa_from: "56be1daa-ddf2-4881-b9d9-75f2363a4cf4",
                            key_empresa_to: Model.empresa.Action.getKey()
                        }).then(e => {
                            SNavigation.replace("/contabilidad/cuentas", { key_empresa: Model.empresa.Action.getKey() })
                        }).catch(e => {

                        })

                    }
                })}
                <SHr h={50} />
                {this.item({
                    label: "Utilizar un plan de cuentas de otra empresa", color: STheme.color.success, dificultad: "Fácil", onPress: () => {
                        SNavigation.navigate("/empresa/list", {
                            onSelect: (empreas) => {
                                SSocket.sendPromise({
                                    service: "contabilidad",
                                    component: "cuenta_contable",
                                    type: "clone_empresa",
                                    key_usuario: Model.usuario.Action.getKey(),
                                    key_empresa_from:empreas.key,
                                    key_empresa_to: Model.empresa.Action.getKey()
                                }).then(e => {
                                    SNavigation.replace("/contabilidad/cuentas", { key_empresa: Model.empresa.Action.getKey() })
                                }).catch(e => {

                                })

                            }
                        })

                    }
                })}
                <SHr h={50} />
                {this.item({ label: "Importar desde excel", color: STheme.color.warning, dificultad: "Media", onPress: () => { } })}
                <SHr h={50} />
                {this.item({
                    label: "Crear desde cero.", color: STheme.color.danger, dificultad: "Difícil", onPress: () => {
                        SNavigation.navigate("/contabilidad/cuentas", { key_empresa: Model.empresa.Action.getKey() })
                    }
                })}
            </Container>
        </SPage>
    }
}