import React from "react";
import { SHr, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import SForm2 from "../../../Components/SForm2";

type FormularioModelo2Props = {
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
}

export default class FormularioModelo2 extends React.Component<FormularioModelo2Props> {
    static open(props: FormularioModelo2Props) {
        SPopup.open({
            key: "FormularioModelo2",
            content: <FormularioModelo2 {...props} />
        })
    }
    static close() {
        SPopup.close("FormularioModelo2");
    }
    render() {
        const obj = this.props.editObject ?? {}
        return <SView style={{
            width: "100%",
            maxHeight: "100%",
            maxWidth: 700,
            // height: 500,
            borderRadius: 8,
            borderColor: STheme.color.card,
            borderWidth: 1,
            backgroundColor: STheme.color.background,
            padding: 8
        }} withoutFeedback >
            <SText>{obj.descripcion}</SText>
            <SForm2>
            </SForm2>
        </SView>
    }
}