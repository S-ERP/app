import React from "react";
import { SText } from "servisofts-component";
import SPageConta from "./Components/SPageConta";

export default class dimension extends React.Component {
    render() {
        return <SPageConta title={"Contabilidad - dimension"} center>
            <SText>Dimensiones de la contabilidad</SText>
        </SPageConta>
    }
}