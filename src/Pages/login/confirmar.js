import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SIcon, SInput, SLoad, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { AccentBar, BottomNavigator, Btn, Container, PButtom } from '../../Components';
// import SectionApis from './components/SectionApis';
import SectionFooter from './components/SectionFooter';
import SectionForm from './components/SectionForm';
import SectionHeader from './components/SectionHeader';
import Model from '../../Model';
import CardUser from './components/CardUser';
import SSocket from 'servisofts-socket';

class login extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.pk = SNavigation.getParam("pk")
    }

    componentDidMount() {
        Model.tbcli.Action.getByCode(this.pk).then((e) => {
            console.log(e);
            this.setState({ data: e })
        }).catch(e => {
            SPopup.alert(e.error)
            console.error(e)
        })
    }

    handleOnPress = () => {
        const code = this.input.getValue();
        if (!code) {
            this.setState({ error: "Debe ingresar un teléfono o celular." });
            return;
        }
        this.setState({ loading: true, error: "" })

        SSocket.sendPromise({
            component: "tbcli",
            type: "validarTelefono",
            idcli: this.pk,
            clitel: code

        }).then(e => {
            if (!e.cliente) throw { error: "Ocurrio algun error desconocido." }
            Model.tbcli.Action.setCliente(e.cliente);
            SNavigation.replace("/");
            this.setState({ loading: false })
        }).catch(e => {
            console.error(e);
            this.setState({ loading: false, error: e.error })
        })

    }
    render() {
        return (
            <SPage hidden footer={<BottomNavigator url={"/login"} carrito={"no"} />} >
                <SView col={"xs-12"} center>
                    <SView col={"xs-12"} backgroundColor={STheme.color.primary}>
                        <Container>
                            <SHr height={50} />
                            <SectionHeader select={"codigo"} />
                            <SHr height={16} />
                        </Container>
                    </SView>
                    <Container>
                        <SHr height={25} />
                        <SView col={"xs-12"} center row>
                            <SText fontSize={18} bold>¡HEMOS ENCONTRADO TU CUENTA!</SText>
                            <SText fontSize={16} >Por favor, verifica tus datos e introduce tu  </SText>
                            <SText fontSize={16} >número teléfono o celular para continuar.</SText>
                        </SView>
                        <SHr height={25} />
                        <CardUser datas={this.state?.data} />
                        <SHr height={32} />
                        <SInput ref={ref => this.input = ref}
                            type='phone'
                            placeholder={"Teléfono"}
                        />
                        <SText color={STheme.color.danger}>{this.state.error}</SText>
                        <SHr h={32} />
                        <PButtom fontSize={20}
                            onPress={this.handleOnPress}
                            loading={this.state.loading}
                        >Ingresar</PButtom>
                        <SHr height={50} />
                    </Container>
                </SView>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(login);