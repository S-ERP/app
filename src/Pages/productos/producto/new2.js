import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SPage } from 'servisofts-component';
import { Container } from '../../../Components';

export default class new2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return <SPage title={"Nuevo producto"}>
            <Container>
                <SForm inputs={{
                    "modelo": { label: "modelo" }
                }}>

                </SForm>
            </Container>
        </SPage>
    }
}
