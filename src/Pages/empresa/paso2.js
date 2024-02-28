import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Linking } from 'react-native'
import { SButtom, SForm, SHr, SIcon, SImage, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import SSocket from "servisofts-socket"
import Model from '../../Model';
import Container from '../../Components/Container';
import Adornos from '../../Components/Adornos';
import BtnNext from './Components/BtnNext';
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
            <>
                <SPage title={''} center onRefresh={(end) => {
                    Model.usuarioPage.Action.CLEAR();
                    end()

                }}>
                    <Container >
                        <SView col={"xs-12"} center>
                            <SHr height={10} />
                            <SImage src={require('../../Assets/png/franja.png')} style={{ width: " 100%", height: 100, borderRadius: 100, resizeMode: "contain" }} />
                            <SHr height={10} />
                        </SView>

                        {/* <SView col={"xs-8"} style={{ padding: 10, borderRadius: 25, borderWidth: 3, borderColor: STheme.color.secondary, backgroundColor: STheme.color.white, }} center>
                            <SText center fontSize={18} bold>
                                Debes ingresar todos los datos:</SText>

                        </SView>
                        <SView col={"xs-8"} style={{ position: "relative", top: -6, left: 10, zIndex: 9 }}>
                            <SIcon name="cola" width={35} height={24} />
                        </SView> */}
                        <Adornos.titulo label={"Sube el logo de tu empresa"} fontSize={18} />

                        <SView col={"xs-12"} center>
                            <SHr height={10} />
                            <SImage src={require('../../Assets/png/franja.png')} style={{ width: " 100%", height: 100, borderRadius: 100, resizeMode: "contain" }} />
                            <SHr height={10} />
                        </SView>
                        {/* <SHr height={15} /> */}
                        <SView col={"xs-12"} center>
                           <SIcon name="picture" width={200} height={159} fill={STheme.color.darkGray}/>
                            <SHr height={25} />
                            {/* <PButtom label="Siguiente" onPress={() => {
                                this.form.submit();
                                
                            }
                            } /> */}

                            <BtnNext onPress={() => {}}>{"SIGUIENTE"}</BtnNext>
                            <SHr height={25} />
                            <SView col={"xs-12"} center onPress={()=> {}}>
                                <SText center fontSize={18} bold color={STheme.color.text}>Configurar más tarde</SText>
                            </SView>

                            {/* <SButtom
                                label="Siguiente"
                                onPress={() => {
                                    this.form.submit();
                                    
                                }}
                            /> */}
                        </SView>
                    </Container>

                    <SHr height={40} />
                </SPage >
                {/* <Container center >
                    <PButtomFooter url={'paso1'} label="Siguiente" />
                </Container> */}
            </>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);