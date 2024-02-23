import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SIcon, SInput, SLoad, SNavigation, SPage, SPopup, SText, STheme, SThread, SView } from 'servisofts-component';
import { AccentBar, BottomNavigator, Btn, Container, PButtom } from '../../Components';
// import SectionApis from './components/SectionApis';
import SectionHeader from './components/SectionHeader';
import Model from '../../Model';

class login extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    handleOnPress = () => {
        const code = this.input.getValue();
        if (!code) {
            this.setState({ error: "Debe ingresar un código de cliente." });
            return;
        }
        this.setState({ loading: true, error: "" })
        Model.tbcli.Action.getByCode(code).then(e => {
            SNavigation.navigate("/login/confirmar", { pk: e.idcli });

            this.setState({ loading: false })
        }).catch(e => {
            this.setState({ loading: false, error: e.error })

        })
    }
    componentDidMount() {
        new SThread(100, "render_window").start(() => {
            this.setState({ ready: true })
        })
    }
    render() {
        // if (!this.state.ready) return <SLoad />
        return (
            <SPage hidden footer={<BottomNavigator url={"/login"} float={100}/>} >
                <SView col={"xs-12"} center>
                    <SView col={"xs-12"} backgroundColor={STheme.color.primary}>
                        <Container>
                            <SHr height={50} />
                            <SectionHeader select={"codigo"} />
                            <SHr height={16} />
                        </Container>
                    </SView>
                    <Container loading={!this.state.ready}>
                        <SHr height={32} />
                        <SInput ref={ref => this.input = ref}
                            type='number'
                            placeholder={"Código de cliente"}
                        />
                        <SText color={STheme.color.danger}>{this.state.error}</SText>
                        <SHr h={42} />
                        <PButtom fontSize={20}
                            onPress={this.handleOnPress}
                            loading={this.state.loading}
                        >Login</PButtom>
                        <SHr h={32} />
                        <SText fontSize={14} underLine>{"¿No tienes un código?  Click aquí."}</SText>
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