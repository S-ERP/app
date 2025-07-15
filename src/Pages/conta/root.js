import React from "react";
import { SText } from "servisofts-component";
import SPageConta from "./Components/SPageConta";

export default class conta extends React.Component {
    render() {
        return <SPageConta title={"Contabilidad"} center>
            <SText>Modulo de contabilidad</SText>
        </SPageConta>
    }
}