import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SIcon, SLoad, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // producto: { "descripcion": "asd", "estado": 1, "key_usuario": "be1091d6-6acf-4c2d-af87-630a11d69a2e", "precio_compra": "2.22", "fecha_on": "2022-12-06T01:32:10.000666", "Color": "asd", "Talla": "asd", "key_modelo": "93f856ab-8a2e-4bcf-80d7-ba1c20cd3c0e", "observacion": "asd", "key": "270b6122-d697-43fb-86e4-e810a9f9f1a9" }
        };
    }

    render() {
        // console.log("ENTROOOOO sad asd")
        // if (!this.state.producto) {
        //     SNavigation.navigate("/productos/producto/new", {
        //         onSelect: (obj) => {
        //             this.state.producto = obj;
        //             this.setState({ ...this.state })
        //             SNavigation.goBack();
        //         }
        //     });
        //     return <SLoad />;
        // }
        return (
            <SPage title={'Cotizaciones'}>
                <SText>{JSON.stringify(this.state.producto)}</SText>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);