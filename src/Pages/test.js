import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SDate, SDatePicker, SHr, SInput, SLoad, SPage, SSPiner, SText, STheme, SView } from 'servisofts-component';
import STextPlay from '../Components/STextPlay';
import Container from '../Components/Container';
class Test extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: "Hola como"
        };
    }
    ref = {}

    render() {
        return (
            <SPage title={'Test'} disableScroll>
                <Container flex>
                    <SHr />
                    <SText fontSize={20}>Mesaje de algo {this.state.val}</SText>
                    <SHr />
                    <SSPiner flex itemHeight={60} defaultValue='Perder peso' options={["Ganar Peso", "Perder peso", "Ser fit", "Ganar flexibilidad", "Estar saludable", "sadsa"]} onChange={e => {
                        this.setState({ val: e })
                    }} />
                    <SHr />
                    {/* <SText>Boton de abanzar</SText> */}
                    {/* <SHr /> */}
                </Container>
            </SPage >
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(Test);