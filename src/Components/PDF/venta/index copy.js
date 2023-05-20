import React, { Component } from 'react';
import { Linking } from 'react-native'
import { SLoad, SPopup, SText, SView } from 'servisofts-component';
import { connect } from 'react-redux';
import * as SPDF from 'servisofts-rn-spdf'
import header from './header';
import body from './body';
import SSocket from 'servisofts-socket'
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        if (!this.props.data) return;
        this.handlePress();
    }


    handlePress() {
        // const elmts = <SPDF.Page >
        //     <SPDF.Text>Hola</SPDF.Text>
        // </SPDF.Page>
        this.count = 0;

        const ctfs = (val) => {
            this.count += 1;
            return <SPDF.Text style={{ fontSize: val }}>{this.count}. style.fontSize: {val}</SPDF.Text>
        }
        const PDF_DATA = SPDF.create(<SPDF.Page style={{ width: 612, height: 791, margin: 20, padding: 20, borderWidth: 1, }} >
            <SPDF.Text style={{ fontWeight: "bold" }}>Prueba de fuentes de letra del componente Text:</SPDF.Text>
            <SPDF.Text >{`<SPDF.Text style={{ fontSize: val }}>{this.count}. style.fontSize: {val}</SPDF.Text>`}</SPDF.Text>
            {ctfs(8)}
            {ctfs(9)}
            {ctfs(10)}
            {ctfs(11)}
            {ctfs(12)}
            {ctfs(13)}
            {ctfs(14)}
            {ctfs(15)}
            {ctfs(16)}
            {ctfs(17)}
            {ctfs(18)}
            {ctfs(19)}
            {ctfs(20)}
            <SPDF.Text style={{
                width: "100%"
            }} >Prueba de texto largo: a dajs dkajs dakjs dkasjd aksjd akdj aksdj akdaj dkajd aksjd aksdja dkaj dakjd akdj aksdj askdasdajdka djka dkjas dajdasdjad aksd jaksdajdkajds akjd akdj asdajdaksdjakdajsdkadkasdjs djs dajd adajsd aksdakjd as</SPDF.Text>
            <SPDF.View style={{
                width: "100%",
                height: 50,
                borderWidth: 1,
                margin: 4,
                alignItems: "center",

            }}>
                <SPDF.Text style={{
                    borderWidth: 1,
                }}>Texto dentro de el div</SPDF.Text>
            </SPDF.View>
            <SPDF.View style={{
                width: "100%",
                borderWidth: 1,
                padding: 4,
                margin: 4,
                flexDirection: "row",

            }}>
                <SPDF.Text style={{
                    borderWidth: 1,
                    flex:1,
                }}>texto con flex 1</SPDF.Text>
                <SPDF.Text style={{
                    borderWidth: 1,
                    flex:1,
                }}>Texto con flex 1</SPDF.Text>
            </SPDF.View>
            <SPDF.View style={{
                width: "100%",
                borderWidth: 1,
                margin: 4,
                flexDirection: "row",
            }}>
                <SPDF.Text style={{
                    borderWidth: 1
                }} >Texto1 dentro de el div</SPDF.Text>
                <SPDF.Text style={{
                    borderWidth: 1
                }} >Texto2 dentro de el div</SPDF.Text>
                <SPDF.Text style={{
                    borderWidth: 1
                }} >Texto3 dentro de el div</SPDF.Text>
                <SPDF.Text style={{
                    borderWidth: 1,
                    width: 100
                }} >Texto4 dentro de el div</SPDF.Text>
                <SPDF.Text style={{
                    borderWidth: 1
                }} >Texto5 dentro de el div</SPDF.Text>
            </SPDF.View>
            <SPDF.Text style={{
                    borderWidth: 1,
                    fontSize:20
                }} >Hellow World</SPDF.Text>
        </SPDF.Page>)


        let url = SSocket.api.spdf
        this.setState({ loading: true })
        SSocket.sendHttpAsync(url + "api", {
            "component": "pdf",
            "type": "registro",
            "data": PDF_DATA
        }).then(e => {
            this.setState({ loading: false })
            console.log(e)
            // Linking.openURL(url + e.data)
            window.open(url + e.data, "NombreVentana", "height=612,width=900");

        }).catch(e => {
            this.setState({ loading: false })
            console.error(e)
        })
    }

    render() {
        return (
            <SView onPress={this.handlePress.bind(this)}>
                <SLoad type='window' hidden={!this.state.loading} />
                {this.props.children ?? <SView padding={16} card >
                    <SText>PDF Carta</SText>
                </SView>}
            </SView>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);