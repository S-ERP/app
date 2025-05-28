import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SIcon, SImage, SList, SMath, SNavigation, SPage, SScroll, SScrollView2, SText, STheme, SView } from 'servisofts-component';
import { Container } from '..';
import Model from '../../Model';
export type RestauranteBarraFiltrosPropsType = {
    data: any,
    onPress?: (obj) => {},
    onChange?: any
}
class index extends Component<RestauranteBarraFiltrosPropsType> {
    constructor(props) {
        super(props);
        this.state = {
            filtros: {

            }
        };
    }


    filtro_item(obj, key, i) {
        var filtro = Model.filtros.Action.getByKey(obj.key);
        var select = false;
        if (filtro) {
            if (filtro.select) {
                select = filtro.select;
            }
        }
        return <SView card height={30} style={{
            paddingLeft: 8,
            paddingRight: 8
        }} center onPress={() => {
            console.log(obj)
            Model.filtros.Action.select(obj.key, !select);
            if (this.props.onChange) this.props.onChange();

        }} >
            <SText fontSize={12} color={select ? STheme.color.primary : STheme.color.gray}>{obj.label}</SText>
            {/* <SText>{key}</SText> */}
        </SView>
    }

    buttom_filtro() {
        return <SView card width={100} height={30} onPress={() => {
            SNavigation.navigate("/filtros");
        }} center row>
            <SIcon name='IconFilter' width={20} fill={STheme.color.primary} /><SView width={8} /><SText fontSize={12} color={STheme.color.primary}>{"Filtros"}</SText>
        </SView>
    }
    filtro_nombre() {
        var filtro = Model.filtros.Action.getByKey("nombre");
        // console.log(filtro)
        if (!filtro) return null;
        if (!filtro.select) return null;
        return <>
            <SView card height={30} onPress={() => {
                Model.filtros.Action.select("nombre", "");
            }} center padding={4} >
                {/* <SIcon name='IconFilter' width={20} fill={STheme.color.primary} /><SView width={8} /> */}
                <SText fontSize={12} color={STheme.color.primary}>{filtro.label}:{filtro.select}</SText>
            </SView>
            <SView width={8} />
        </>
    }
    filtro_horario() {
        var filtro = Model.filtros.Action.getByKey("horario");
        // console.log(filtro)
        if (!filtro) return null;
        if (!filtro.select) return null;
        return <>
            <SView card height={30} onPress={() => {
                Model.filtros.Action.select("horario", "");
            }} center row>
                <SView width={8} />
                {/* <SIcon name='IconFilter' width={20} fill={STheme.color.primary} /><SView width={8} /> */}
                <SText fontSize={12} color={STheme.color.primary}>{filtro.label}:{filtro.select}</SText>
                <SView width={8} />
            </SView>
            <SView width={8} />
        </>
    }
    getList() {
        return <SList
            horizontal
            filter={o => !!o.showInBar}
            data={Model.filtros.Action.getAll()}
            render={this.filtro_item.bind(this)}
        />
    }
    render() {
        return (
            <SView col={"xs-12"} center height={40}>
                <SHr h={4} />
                <SScroll horizontal>
                    {this.buttom_filtro()}
                    <SView width={8} />
                    {this.filtro_nombre()}
                    {this.filtro_horario()}
                    <SView height>
                        {this.getList()}
                    </SView>
                </SScroll>
            </SView >
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);