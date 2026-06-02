import React from "react";
import { SHr, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import { Actions } from "..";
import SMD from "../../../SMD";
import { ScrollView } from "react-native";

export default class Analisis extends React.Component {
    static open(props) {
        SPopup.open({
            key: "analisis_popup",
            content: <Analisis {...props} />
        })
    }

    state = {
        data: null,
    }
    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        Actions.get_analisis({ path_file: Actions.root_path + "" + this.props.path + "/" + this.props.obj.name }).then((data) => {

            if(!data.key){
                this.setState({ data: { resumen: "### No se encontro el analisis.", transcripcion: "" } });
                return;
            }

            this.setState({ data });
            console.log(data);
        }).catch((e) => {
            SNotification.send({
                title: "Error",
                body: e.error,
                color: STheme.color.danger,
                time: 5000,
            });
            console.error(e);
        })
    }
    render() {
        return <SView col={"xs-10"} backgroundColor={STheme.color.background} withoutFeedback padding={8} style={{
            borderRadius: 16,
            height: 500,
        }}>
            <SText center fontSize={16} bold>{this.props.obj.name}</SText>
            <SHr/>
            <ScrollView>
                
                <SMD fontSize={10} space={0.10}>{this.state?.data?.resumen}</SMD>
                <SMD fontSize={10} space={0.10}>{this.state?.data?.transcripcion}</SMD>
            </ScrollView>
            {/* <SText>{JSON.stringify(this.state.data)}</SText> */}
        </SView>
    }
}