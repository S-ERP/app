import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SPage, SText, SView } from 'servisofts-component';
import { Container } from '../Components';
class index extends Component {
    render() {
        return <SPage
            // navBar={this.navBar()}
            // footer={this.footer()}
            title={"Términos y Condiciones"}
        >
            <Container>
                <SHr height={40} />
                <SText bold center fontSize={16} >{`TÉRMINOS Y CONDICIONES DE USO PARA LA APLICACIÓN SERP`}</SText>
                <SText fontSize={14} justify>{`

Al descargar, instalar y/o usar la aplicación "SERP" (en adelante, "la Aplicación"), usted acepta los siguientes términos y condiciones:

Propiedad y Licencia: SERP y sus licenciantes son propietarios exclusivos de la Aplicación. Al descargar y usar la Aplicación, se le otorga una licencia limitada, no exclusiva y no transferible para usarla. No está permitido distribuir, vender, alquilar, sub-licenciar o realizar acciones que comprometan los derechos de propiedad de la Aplicación.

Uso Personal: La Aplicación está diseñada exclusivamente para su uso personal y no comercial. No debe ser utilizada para fines comerciales sin el consentimiento explícito de SERP.

Uso Aceptable: Usted se compromete a no utilizar la Aplicación de manera fraudulenta, ilegal, abusiva o de cualquier otra forma que pueda dañar, deshabilitar o sobrecargar la Aplicación o los servidores de SERP.

Actualizaciones: SERP puede ofrecer actualizaciones y mejoras de la Aplicación en cualquier momento. Estas actualizaciones pueden incluir correcciones de errores, mejoras en funciones o completamente nuevas versiones.

Datos e Información del Usuario: Al usar la Aplicación, se le puede solicitar que proporcione cierta información. La recopilación y uso de esta información están regidos por la Política de Privacidad de SERP.

Uso de Ubicación: La Aplicación utilizará la ubicación en segundo plano únicamente para aquellos usuarios que sean repartidores y deseen realizar entregas de productos. Esta función está reservada exclusivamente para empleados de SERP. Los clientes no necesitan la función de ubicación en segundo plano para acceder a la tienda en la Aplicación.

Contenidos Generados por el Usuario: Si envía comentarios, ideas o retroalimentación, acepta que SERP pueda usarlos sin restricción y sin compensación hacia usted.

Restricciones Técnicas: No está permitido intentar acceder al código fuente de la Aplicación, realizar ingeniería inversa, o de cualquier forma intentar descifrar el código fuente.

Responsabilidades: SERP no garantiza que la Aplicación esté libre de errores o que siempre esté disponible. No se responsabiliza de daños directos o indirectos derivados del uso o imposibilidad de uso de la Aplicación.

Terminación: SERP se reserva el derecho de terminar o suspender su acceso a la Aplicación en cualquier momento y por cualquier motivo.

Cambios a los Términos y Condiciones: SERP puede modificar estos términos y condiciones en cualquier momento. Al continuar usando la Aplicación después de cualquier modificación, acepta y está de acuerdo con las modificaciones.

Legislación y Jurisdicción: Estos términos y condiciones se rigen por las leyes [del país o estado en cuestión]. Cualquier disputa relacionada con la Aplicación será resuelta en los tribunales [del país o estado en cuestión].
                    
                  `}</SText>
                {/* <SText bold center fontSize={16}>TÉRMINOS Y CONDICIONES DE USO PARA LA APLICACIÓN DHM</SText>
                <SHr height={25} />
                <SText style={{textAlign: 'justify'}}>
                    Al descargar, instalar y/o usar la aplicación "SERP" (en adelante, "la Aplicación"), usted acepta los siguientes términos y condiciones:</SText>
                <SHr />
                <SText style={{textAlign: 'justify'}}>
                    Propiedad y Licencia: SERP y sus licenciantes son propietarios exclusivos de la Aplicación. Al descargar y usar la Aplicación, se le otorga una licencia limitada, no exclusiva y no transferible para usarla. No está permitido distribuir, vender, alquilar, sub-licenciar o realizar acciones que comprometan los derechos de propiedad de la Aplicación.
                </SText>
                <SText style={{textAlign: 'justify'}}>
                    <SHr />
                    Uso Personal: La Aplicación está diseñada exclusivamente para su uso personal y no comercial. No debe ser utilizada para fines comerciales sin el consentimiento explícito de SERP.</SText>
                <SHr />
                <SText style={{textAlign: 'justify'}}>
                Uso Aceptable: Usted se compromete a no utilizar la Aplicación de manera fraudulenta, ilegal, abusiva o de cualquier otra forma que pueda dañar, deshabilitar o sobrecargar la Aplicación o los servidores de SERP.</SText>
                <SHr />
                <SText style={{textAlign: 'justify'}}>
                Actualizaciones: SERP puede ofrecer actualizaciones y mejoras de la Aplicación en cualquier momento. Estas actualizaciones pueden incluir correcciones de errores, mejoras en funciones o completamente nuevas versiones.</SText>
                <SHr />
                <SText style={{textAlign: 'justify'}}>
                Datos e Información del Usuario: Al usar la Aplicación, se le puede solicitar que proporcione cierta información. La recopilación y uso de esta información están regidos por la Política de Privacidad de SERP.</SText>
                <SHr />
                <SText style={{textAlign: 'justify'}}>
                Contenidos Generados por el Usuario: Si envía comentarios, ideas o retroalimentación, acepta que SERP pueda usarlos sin restricción y sin compensación hacia usted.</SText>
                <SHr />
                <SText style={{textAlign: 'justify'}}>
                Restricciones Técnicas: No está permitido intentar acceder al código fuente de la Aplicación, realizar ingeniería inversa, o de cualquier forma intentar descifrar el código fuente.</SText>
                <SHr />
                <SText style={{textAlign: 'justify'}}>
                Responsabilidades: SERP no garantiza que la Aplicación esté libre de errores o que siempre esté disponible. No se responsabiliza de daños directos o indirectos derivados del uso o imposibilidad de uso de la Aplicación.</SText>
                <SHr />
                <SText style={{textAlign: 'justify'}}>
                Terminación: SERP se reserva el derecho de terminar o suspender su acceso a la Aplicación en cualquier momento y por cualquier motivo.</SText>
                <SHr />
                <SText style={{textAlign: 'justify'}}>
                Cambios a los Términos y Condiciones: SERP puede modificar estos términos y condiciones en cualquier momento. Al continuar usando la Aplicación después de cualquier modificación, acepta y está de acuerdo con las modificaciones.</SText>
                <SHr />
                <SText style={{textAlign: 'justify'}}>
                Legislación y Jurisdicción: Estos términos y condiciones se rigen por las leyes [del país o estado en cuestión]. Cualquier disputa relacionada con la Aplicación será resuelta en los tribunales [del país o estado en cuestión].</SText> */}
                <SHr height={40} />
            </Container>
        </SPage>
    }

}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);