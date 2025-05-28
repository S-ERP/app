import React from "react";
import { SPage, SText, STheme, SView } from "servisofts-component";
import Model from "../Model";

type PageTitlePropsType = {
    title: string,
}
export default class PageTitle extends React.Component<PageTitlePropsType> {
    render() {
        const empresa = Model.empresa.Action.getSelect();
        return <SView col={"xs-12"}>
            <SText font='Montserrat-ExtraBold' fontSize={16} color={STheme.color.text}>{this.props.title}</SText>
            <SText font={"Montserrat-SemiBold"} fontSize={14} color={STheme.color.text} >{empresa?.razon_social}</SText>
        </SView>
    }
}