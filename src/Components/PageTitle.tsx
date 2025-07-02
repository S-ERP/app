import React from "react";
import { SIcon, SPage, SText, STheme, SView } from "servisofts-component";
import Model from "../Model";

type PageTitlePropsType = {
    title: string,
}
export default class PageTitle extends React.Component<PageTitlePropsType> {
    render() {
        const empresa = Model.empresa.Action.getSelect();
        return <SView col={"xs-12"} row>
            <SText col={"xs-12"} font='Montserrat-ExtraBold' fontSize={16} color={STheme.color.text}>{this.props.title}</SText>

            <SView col={"xs-12"} row>
                <SView width={30} border={"transparent"}>
                    <SIcon name="empresa" fill={STheme.color.text} width={16} center />
                </SView>
                <SView flex  >
                    <SText col={"xs-12"} font={"Montserrat-SemiBold"} fontSize={14} color={STheme.color.text} > {empresa?.razon_social}</SText>
                </SView>
            </SView>
        </SView>
    }
}