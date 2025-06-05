import { Text, View } from 'react-native'
import React, { Component } from 'react'
import { SPage, SText, SView, SInput, SButtom, STheme } from 'servisofts-component'
import SMD from '../../SMD'

export class perfilcampana extends Component {
    constructor(props) {
        super(props);
        this.state = {
            descripcion: ""
        };
    }
    componentDidMount() {
        const key = this.props.route?.params?.key || this.props.navigation?.getParam("key");
        this.setState({ key });
        // Aquí podrías cargar la descripción actual de la campaña si tienes un método para ello
    }
    render() {
        const { key, descripcion } = this.state;
        return (
            <SPage title={"Perfil Campaña"}>
                <SView col={"xs-12"} center>
                    <SText fontSize={18} bold>Key de campaña: {key}</SText>
                    <SView col={"xs-12"} style={{ marginTop: 24 }}>
                        <SText bold>Descripción (Markdown):</SText>
                        <SInput
                            type="textArea"
                            value={descripcion}
                            onChange={val => this.setState({ descripcion: (val ?? "").toString() })}
                            style={{ minHeight: 100, borderWidth: 1, borderColor: STheme.color.gray, marginVertical: 8 }}
                        />
                        <SButtom onPress={() => {
                            // Aquí puedes guardar la descripción editada
                            // Por ejemplo: MDL.crm.campana.editar({ key, descripcion })
                        }}>Guardar descripción</SButtom>
                    </SView>
                    <SView col={"xs-12"} style={{ marginTop: 24 }}>
                        <SText bold>Vista previa:</SText>
                        <SMD>{descripcion}</SMD>
                    </SView>
                </SView>
            </SPage>
        )
    }
}

export default perfilcampana