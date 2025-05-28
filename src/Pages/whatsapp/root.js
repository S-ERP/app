
import React from "react";
import { SImage, SNavigation, SPage, SText, SView } from "servisofts-component";
import api from "./api";
import { Container } from "../../Components";

export default class index extends React.Component {
    state = {
        connected: false,
        key: SNavigation.getParam("pk", "servisofts")
    }

    componentDidMount() {
        api.connect({ key: this.state.key }).then(e => {
            this.setState({ connected: true })
            if (e.qr) {
                this.setState({ qr: e.qr })
            } else {
                this.setState({ info: e.data })
            }
            console.log(e);
        }).catch(e => {
            console.error(e);
        })
    }
    render() {
        return <SPage title={"WhatsApp"}>
            <Container loading={!this.state.connected}>
                <SText>{this.state.key}</SText>
                <SText>{JSON.stringify(this?.state?.info ?? {})}</SText>
                {this.state.qr ? <SView col={"xs-12"} colSquare>
                    <SImage src={"data:image/png;base64," + this.state.qr} />
                </SView> : null}

                <SText fontSize={18} onPress={() => api.info({key:this.state.key}).then(e => console.log(e))}>{"info"}</SText>
                <SText fontSize={18} onPress={() => api.getContacts({key:this.state.key}).then(e => console.log(e))}>{"getContacts"}</SText>
                <SText fontSize={18} onPress={() => api.getState({key:this.state.key}).then(e => console.log(e))}>{"getState"}</SText>
                <SText fontSize={18} onPress={() => api.getChats({key:this.state.key}).then(e => console.log(e))}>{"getChats"}</SText>
            </Container>
        </SPage>;
    }
}