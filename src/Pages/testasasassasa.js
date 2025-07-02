import React, { Component } from 'react';
import { View, Text } from 'react-native';
import ResizableView from '../Components/ResizableView';
import { SPage } from 'servisofts-component';
import Prueba from '../Components/TurnoComponent';
import Container from '../Components/Container';

export default class test extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (<SPage disableScroll>
            {/* <ResizableView /> */}
            <Container flex>
                <Prueba />
            </Container>
        </SPage>
        );
    }
}
