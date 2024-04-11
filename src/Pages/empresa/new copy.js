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
import Adornos from '../../Components/Adornos';
export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    }
    $onSubmit(data) {
        data.key_servicio = "1427e867-c4f7-4602-a1aa-5deabf2d0372";
        Parent.model.Action.registro({
            data: data,
            key_usuario: Model.usuario.Action.getKey()
        }).then((resp) => {
            Model.empresa.Action.setEmpresa(resp.data);
            SNavigation.replace("/home")
            SNavigation.navigate("/empresa/init")
            // SNavigation.goBack();
        }).catch(e => {
            console.error(e);
        })
    }
    render() {
        // if (!Model.usuario.Action.getUsuarioLog()) {
        //     console.log("ggggggg")

        //     SNavigation.replace("/login");
        //     return null;
        // }
        return (
            <SPage title={''} onRefresh={(end) => {
                Model.usuarioPage.Action.CLEAR();
                end()

            }}>
                <SHr height={20} />
                <Container >
                    {/* <SHr height={10} /> */}
                    {/* <SView col={"xs-8"} style={{ padding: 10, borderRadius: 25, borderWidth: 1, borderColor: STheme.color.secondary }} center>
                        <SText center fontSize={18} bold>Para iniciar esta nueva aventura necesitas crear tu empresa y personalizarla.
                        </SText>
                        <SHr height={15} />
                        <SText center fontSize={18} bold>
                            ¡SIN MIEDO AL ÉXITO !</SText>
                    </SView> */}
                    <Adornos.titulo time={30} label={"Para iniciar esta nueva aventura necesitas crear tu empresa y personalizarla.\n¡Clic en comenzar!"} fontSize={18} />
                    {/* <SHr height={25} /> */}
                    <SView col={"xs-12"} center>
                        <SIcon name="construEmpresa" width={230} height={196} />
                    </SView>
                </Container>
                <SHr height={55} />
                <PButtomFooter url={'/empresa/paso1'} label={'COMENZAR'} />
            </SPage>
        );
    }
}
// const initStates = (state) => {
//     return { state }
// };
// export default connect(initStates)(index);