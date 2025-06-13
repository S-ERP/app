import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SPage, SText, STheme, SView } from 'servisofts-component';
import { Container } from '../Components';
class whatsapp_devices extends Component {
    render() {
        return <SPage
            // navBar={this.navBar()}
            // footer={this.footer()}
            title={"Términos y Condiciones"}
        >
            <Container >
                <SHr height={40} />
                <SText bold center fontSize={18} >{`TÉRMINOS Y CONDICIONES DE USO PARA LA SERP`}</SText>
                <SHr height={20} />
                <SView col={"xs-12"}  >
                    <SText fontSize={16} bold style={{ textTransform: "uppercase" }}>
                        1. Introducción
                    </SText>
                </SView>

                <SView col={"xs-12"}  >
                    <SText fontSize={16} bold style={{ textTransform: "uppercase" }}>
                        9. Contacto
                    </SText>
                </SView>
                <SView col={"xs-12"}  >
                    <SText style={{ textAlign: 'justify' }}>
                        Para cualquier pregunta o inquietud respecto a nuestra política de privacidad, por favor contacte a nuestro oficial de privacidad en servisofts.srl@gmail.com.
                    </SText>
                </SView>
                <SHr height={20} />

                <SView col={"xs-12"}  >
                    <SText fontSize={16} bold style={{ textTransform: "uppercase" }}>
                        10. Cambios en la Política de Privacidad
                    </SText>
                </SView>
                <SText style={{ textAlign: 'justify' }}>
                    SERP puede modificar esta política de privacidad periódicamente. Cualquier cambio será comunicado a través de nuestra aplicación o por correo electrónico.
                </SText>
                <SHr />
                {/* <SText fontSize={14} justify>{`

Al descargar, instalar y/o usar la aplicación "SERP" (en adelante, "la Aplicación"), usted acepta los siguientes términos y condiciones:

Propiedad y Licencia: SERP y sus licenciantes son propietarios exclusivos de la Aplicación. Al descargar y usar la Aplicación, se le otorga una licencia limitada, no exclusiva y no transferible para usarla. No está permitido distribuir, vender, alquilar, sub-licenciar o realizar acciones que comprometan los derechos de propiedad de la Aplicación.
 spender su acceso a la Aplicación en cualquier momento y por cualquier motivo.

Cambios a los Términos y Condiciones: SERP puede modificar estos términos y condiciones en cualquier momento. Al continuar usando la Aplicación después de cualquier modificación, acepta y está de acuerdo con las modificaciones.

Legislación y Jurisdicción: Estos términos y condiciones se rigen por las leyes [del país o estado en cuestión]. Cualquier disputa relacionada con la Aplicación será resuelta en los tribunales [del país o estado en cuestión].

                  `}</SText> */}
                <SHr height={40} />
            </Container>
        </SPage>
    }

}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(whatsapp_devices);