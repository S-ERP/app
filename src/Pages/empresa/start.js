import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Linking } from 'react-native'
import { SButtom, SHr, SIcon, SImage, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import SSocket from "servisofts-socket"
import Model from '../../Model';
import Container from '../../Components/Container';
import Components from '../../Components';
import PButtomFooter from '../../Components/PButtomFooter';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        if (!Model.usuario.Action.getUsuarioLog()) {
            console.log("ggggggg")

            SNavigation.replace("/login");
            return null;
        }
        return (
            <SPage title={''} center onRefresh={(end) => {
                Model.usuarioPage.Action.CLEAR();
                end()

            }}>
                <Container>
                    <SHr height={10} />
                    <SView col={"xs-8"} style={{ padding: 10, borderRadius: 25, borderWidth: 1, borderColor: STheme.color.secondary }} center>
                        <SText center fontSize={18} bold>Para iniciar esta nueva aventura necesitas crear tu empresa y personalizarla.
                        </SText>
                        <SHr height={15} />
                        <SText center fontSize={18} bold>
                            ¡SIN MIEDO AL ÉXITO !</SText>
                    </SView>
                    <SHr height={25} />
                    <SView col={"xs-12"} center>
                        <SIcon name="construEmpresa" width={250} height={196} />
                    </SView>
                </Container>
                <PButtomFooter url={'/empresa/paso1'} label = {'COMENZAR'}  />
                <SHr height={10} />
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);