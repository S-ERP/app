
//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SHr, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import { Container } from '../../Components';
import Background from 'servisofts-component/img/Background';
import SIconApp from '../../Assets/SIconApp';

// create a component
class comorecuperar extends Component {
        static HIDDEN = true;
    render() {
        const sizeIcon = 40
        return <SPage title="Recuperar contraseña">

            <Container>
                <SHr h={30} />
                <SView height={70}>
                    <SIconApp name='Servisofts' />
                </SView>
                
                <SHr h={20} />
                <SView>
                    <SText>Elige una forma de recuperar tu contraseña:</SText>
                </SView>
                <SHr h={30} />
                <SView col={"xs-12"} center row>
                    <SView col={"xs-12"} colSquare
                        width={"100%"}
                        height={100}
                        center
                        card
                        borderRadius={8}
                        onPress={() => { SNavigation.navigate("/login/recuperarwsp") }}
                    >
                        <SText numberOfLines={1} style={{
                            color: STheme.color.white,
                            textAlign: 'center',
                            fontSize: 16,
                            fontWeight: '600',
                        }}>
                            Recuperar por WhatsApp
                        </SText>
                        <SHr h={15}/>
                        <SView width={sizeIcon} height={sizeIcon}>
                            <SIconApp name='whatsapp'  fill={STheme.color.white} />
                        </SView>
                    </SView>
                    <SHr h={20} />
                    <SView col={"xs-12"} colSquare
                        width={"100%"}
                        height={100}
                        center
                        card
                        borderRadius={10}
                        onPress={() => {
                            SNavigation.navigate("/login/recuperar")
                        }}
                    >
                        <SText  numberOfLines={1} style={{
                            color: STheme.color.white,
                            textAlign: 'center',
                            fontSize: 16,
                            fontWeight: '600',
                        }}>
                            Recuperar por correo electrónico
                        </SText>
                        <SHr h={15}/>
                        <SView width={sizeIcon} height={sizeIcon}>
                            <SIconApp name='invite2'  fill={STheme.color.white} />
                        </SView>
                    </SView>
                </SView>
            </Container>
        </SPage>

    }
}

// define your styles


//make this component available to the app
export default comorecuperar;
