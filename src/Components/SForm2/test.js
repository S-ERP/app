import React from "react";
import { SHr, SPage, SText } from "servisofts-component";
import SForm2 from "./index";
import SInput2 from "./SInput2";
import Container from "../Container";
import Btn from "../Btn";

export default class test extends React.Component {
    render() {
        return <SPage title={"SForm2"}>
            <Container>
                <SForm2 ref={(ref) => this.form = ref}>
                    <SHr />
                    <SInput2 name="input1" defaultValue="assad" />
                    <SHr />
                    <Btn onPress={() => {
                        this.form.submit();
                    }}>ENVIAR</Btn>
                </SForm2>
                
            </Container>
        </SPage>
    }
}