import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SPage, SText } from 'servisofts-component';
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
                <SForm
                    row
                    style={{
                        justifyContent: "space-between"
                    }}
                    inputs={{
                        "modelo": { label: "modelo", placeholder: "Selecciona un modelo...", required: true },
                        "descripcion": { label: "Descripcion", placeholder: "Escribe el nombre del producto..." },
                        "observacion": { label: "Detalles del producto", type: "textArea", placeholder: "Escribe los detalles del producto..." },
                        "unidad_medida": { label: "Unidad de medida", type: "text", col: "xs-12", defaultValue: "unidad" },
                        "cantidad": { label: "Cantidad", type: "number", col: "xs-3.9", defaultValue: 1 },
                        "precio_compra": { label: "Precio de compra", type: "money", col: "xs-3.9", defaultValue: 1, },
                        "total": { label: "Total", type: "money", col: "xs-3.9", defaultValue: 1 },
                    }}>

                </SForm>
            </Container>
        </SPage>
    }
}
