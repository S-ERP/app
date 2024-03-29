import React, { Component } from 'react';
import { SDate, SLoad, SMath, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import * as SPDF from 'servisofts-rn-spdf'
import label from '../../Components/label';
import SSocket from 'servisofts-socket';
const textStyle = {
    font: "Roboto",
    fontSize: 9,
}
export default class PDF extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    static handlePress(data) {

        SPDF.create(<SPDF.Page style={{ width: 612, height: 791, margin: 12, padding: 8, }} footer={<SPDF.View style={{ width: "100%", height: 50 }}>
            <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"Footer ${current_page} / ${cant_page}"}</SPDF.Text>
        </SPDF.View>} >
            <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"Hola"}</SPDF.Text>
        </SPDF.Page >)
    }

    render() {
        return (<SView onPress={PDF.handlePress.bind(this, this.state.data)}>
            <SLoad type='window' hidden={!this.state.loading} />
            {this.props.children ?? <SView padding={16} card >
                <SText>PDF</SText>
            </SView>}
        </SView>
        );
    }
}
