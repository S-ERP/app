import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SPage, SText, SView } from 'servisofts-component';

class Informar extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    // return <AjusteTag allowDrag ajuste={ajuste} textStyle={{ fontSize: 12 }} style={{ margin: 2 }}
    //     onPress={() => {
    //         AjusteTagInfoPopup.open({ ajuste: ajuste })
    //     }}
    // />



    showww() {
        return <SView style={{ position: "absolute", width: 50, backgroundColor: "red", top: 80, right: 80 }}>
            <SText>Mirar</SText>
        </SView>
    }


    render() {
        return this.showww();
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(Informar);