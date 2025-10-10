import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SText, SView } from 'servisofts-component';

export default class SelectMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    selecteds = [];
    onChangeSelect(e) {
        this.selecteds = e;
        this.forceUpdate();
    }
    render() {
        if (!this.selecteds.length) return null;
        return <SView style={{
            position: "absolute",
            bottom: 4,
            right: 4,
        }}>
            <SText padding={4} card onPress={() => {
                this.selecteds.map((nodo) => {
                    const props = nodo.getProps();
                    if (props.onDelete) props.onDelete()
                })
            }}>{"Eliminar "}{}{this.selecteds.length}{" seleccionados"}</SText>
        </SView>
    }
}
