import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SPage, SText, STheme, SView } from 'servisofts-component';
import { Container } from '../Components';
class terminos extends Component {
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
                <SText style={{ textAlign: 'justify' }}>
                    Bienvenido a SERP. Esta política de privacidad explica cómo recopilamos, utilizamos, compartimos y protegemos la información personal de los usuarios de nuestra aplicación. SERP se compromete a proteger su privacidad y a asegurar que sus datos personales sean manejados de manera segura.
                </SText>
                <SHr height={10} />

                <SView col={"xs-12"}  >
                    <SText fontSize={16} bold style={{ textTransform: "uppercase" }}>
                        2. Enlace y Acceso
                    </SText>
                </SView>
                <SText style={{ textAlign: 'justify' }}>
                    Esta política de privacidad está disponible directamente desde nuestra página de listado en la Play Store y dentro de la aplicación "SERP" bajo la sección de Ajustes - Política de Privacidad.
                </SText>
                <SHr height={20} />

                <SView col={"xs-12"}  >
                    <SText fontSize={16} bold style={{ textTransform: "uppercase" }}>
                        3. Entidad Responsable
                    </SText>
                </SView>
                <SView col={"xs-12"}  >
                    <SText style={{ textAlign: 'justify' }}>
                        La entidad responsable de la recopilación y procesamiento de sus datos personales bajo esta política es:
                    </SText>
                </SView>

                <SHr />
                <SView col={"xs-12"}  >
                    <SText >
                        SERP   </SText>
                    <SText style={{}}>
                        Av. Principal, calle 9 entre av. Bánzer y Beni </SText>
                    <SText style={{}}>
                        Correo electrónico de contacto: servisofts.srl@gmail.com
                    </SText>
                </SView>
                <SHr height={20} />

                <SView col={"xs-12"}  >
                    <SText fontSize={16} bold style={{ textTransform: "uppercase" }}>
                        4. Datos que Recopilamos
                    </SText>
                </SView>
                <SView col={"xs-12"}  >
                    <SText style={{ textAlign: 'justify' }}>
                        Recopilamos varios tipos de información, incluyendo:
                    </SText>
                </SView>
                <SHr />
                <SView col={"xs-12"} row   >
                    <SView col={"xs-0.3"} style={{
                        width: 8,
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: STheme.color.text,
                        marginRight: 5,
                        marginTop: 10,
                    }} />
                    <SView col={"xs-11"}>
                        <SText style={{}}>
                            Datos personales como nombre, dirección de correo electrónico y número de teléfono.
                        </SText>
                    </SView>
                </SView>
                <SView col={"xs-12"} row   >
                    <SView col={"xs-0.3"} style={{
                        width: 8,
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: STheme.color.text,
                        marginRight: 5,
                        marginTop: 10,
                    }} />
                    <SView col={"xs-11"}>
                        <SText style={{}}>
                            Datos sensibles que pueden incluir la ubicación geográfica para usuarios.
                        </SText>
                    </SView>
                </SView>
                <SView col={"xs-12"} row   >
                    <SView col={"xs-0.3"} style={{
                        width: 8,
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: STheme.color.text,
                        marginRight: 5,
                        marginTop: 10,
                    }} />
                    <SView col={"xs-11"}>
                        <SText style={{}}>
                            Información de uso y preferencias de la aplicación.
                        </SText>
                    </SView>
                </SView>
                <SHr height={20} />

                <SView col={"xs-12"}  >
                    <SText fontSize={16} bold style={{ textTransform: "uppercase" }}>
                        5. Uso de la Información
                    </SText>
                </SView>
                <SView col={"xs-12"}  >
                    <SText style={{ textAlign: 'justify' }}>
                        Usamos la información recopilada para:
                    </SText>
                </SView>
                <SHr />
                <SView col={"xs-12"} row   >
                    <SView col={"xs-0.3"} style={{
                        width: 8,
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: STheme.color.text,
                        marginRight: 5,
                        marginTop: 10,
                    }} />
                    <SView col={"xs-11"}>
                        <SText style={{}}>
                            Proveer, operar y mejorar nuestra aplicación.
                        </SText>
                    </SView>
                </SView>
                <SView col={"xs-12"} row   >
                    <SView col={"xs-0.3"} style={{
                        width: 8,
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: STheme.color.text,
                        marginRight: 5,
                        marginTop: 10,
                    }} />
                    <SView col={"xs-11"}>
                        <SText style={{}}>
                            Comunicarnos con usted sobre actualizaciones, ofertas y promociones.
                        </SText>
                    </SView>
                </SView>
                <SView col={"xs-12"} row   >
                    <SView col={"xs-0.3"} style={{
                        width: 8,
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: STheme.color.text,
                        marginRight: 5,
                        marginTop: 10,
                    }} />
                    <SView col={"xs-11"}>
                        <SText style={{}}>
                            Atender sus consultas y solicitudes de servicio al cliente.
                        </SText>
                    </SView>
                </SView>
                <SHr height={20} />

                <SView col={"xs-12"}  >
                    <SText fontSize={16} bold style={{ textTransform: "uppercase" }}>
                        6. Compartición de Información
                    </SText>
                </SView>
                <SView col={"xs-12"}  >
                    <SText style={{ textAlign: 'justify' }}>
                        Podemos compartir su información personal con:
                    </SText>
                </SView>
                <SHr />
                <SView col={"xs-12"} row   >
                    <SView col={"xs-0.3"} style={{
                        width: 8,
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: STheme.color.text,
                        marginRight: 5,
                        marginTop: 10,
                    }} />
                    <SView col={"xs-11"}>
                        <SText style={{}}>
                            Proveedores de servicios que nos ayudan con nuestras operaciones administrativas y comerciales.
                        </SText>
                    </SView>
                </SView>
                <SView col={"xs-12"} row   >
                    <SView col={"xs-0.3"} style={{
                        width: 8,
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: STheme.color.text,
                        marginRight: 5,
                        marginTop: 10,
                    }} />
                    <SView col={"xs-11"}>
                        <SText style={{}}>
                            Entidades legales, en respuesta a procedimientos legales como órdenes de la corte.
                        </SText>
                    </SView>
                </SView>
                <SHr height={20} />

                <SView col={"xs-12"}  >
                    <SText fontSize={16} bold style={{ textTransform: "uppercase" }}>
                        7. Seguridad de los Datos
                    </SText>
                </SView>
                <SText style={{ textAlign: 'justify' }}>
                    Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales contra el acceso no autorizado, la alteración, la divulgación o la destrucción.
                </SText>
                <SHr height={20} />

                <SView col={"xs-12"}  >
                    <SText fontSize={16} bold style={{ textTransform: "uppercase" }}>
                        8. Retención y Eliminación de Datos
                    </SText>
                </SView>
                <SView col={"xs-12"}  >
                    <SText style={{ textAlign: 'justify' }}>
                        Retenemos su información personal solo durante el tiempo necesario para los fines establecidos en esta política de privacidad. Usted puede solicitar la eliminación de sus datos personales contactándonos directamente.
                    </SText>
                </SView>
                <SHr height={10} />

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
                    
                  `}</SText> */}
                <SHr height={40} />
            </Container>
        </SPage>
    }

}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(terminos);