import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SHr, SIcon, SNotification, SPopup, SText, STheme, SUtil, SView } from 'servisofts-component';
import ItemIcon from './ItemIcon';
import { Actions } from '..';
import ChangeName from './ChangeName';

export default class MenuItem extends Component {
    static KEYPOPUP = "MenuItemPopup"

    static close() {
        SPopup.close(MenuItem.KEYPOPUP)
    }
    static open({ obj, path, onEvent }) {
        SPopup.open({
            key: MenuItem.KEYPOPUP,
            content: <MenuItem obj={obj} path={path} onEvent={onEvent} />
        })
    }
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    handleEliminar() {
        if (this.props.onEvent) {
            let name = this.props.obj.name;
            let pathfinal = !this.props.path ? name : this.props.path + "/" + name
            Actions.rm({
                path: pathfinal
            }).then(e => {
                this.props.onEvent("delete")
            }).catch(e => {
                SNotification.send({
                    title: "Error",
                    body: e.error,
                    color: STheme.color.danger,
                    time: 5000,
                })
                console.error(e);
            })

        }
        MenuItem.close()
    }

    handleCambiarNombre() {
        ChangeName.open({ path: this.props.path, obj: this.props.obj, onEvent: this.props.onEvent })
        MenuItem.close()
    }

    handleMover() {
        
        MenuItem.close()
    }

    renderButom({ label, icon, onPress }) {
        return <>
            <SView col={"xs-12"} style={{
                alignItems: "center"
            }} row onPress={onPress}>
                <SView width={30} height={30} padding={4}>
                    {icon}
                </SView>
                <SView width={16} />
                <SText fontSize={16}>{label}</SText>
            </SView>
            <SHr h={16} />
        </>
    }

    renderHeader() {
        const { obj, path } = this.props;
        return <SView col={"xs-12"} style={{
            alignItems: "center"
        }} row>
            <SView width={30} height={30} padding={4}>
                <ItemIcon obj={this.props.obj} path={this.props.path} />
            </SView>
            <SView width={16} />
            <SText fontSize={16} bold>{SUtil.limitString(obj.name, 30)}</SText>
        </SView>
    }

    render() {
        return <SView col={"xs-12"} height backgroundColor={STheme.color.background} withoutFeedback padding={16} style={{
            borderRadius: 16
        }}>
            <ScrollView>
                {this.renderHeader()}
                <SHr h={8} />
                <SHr h={1} color={STheme.color.card} />
                <SHr h={8} />
                {this.renderButom({ label: "Compartir", icon: <SIcon name='Ajustes' /> })}
                {this.renderButom({ label: "Administrar acceso", icon: <SIcon name='Ajustes' /> })}
                {this.renderButom({ label: "Agregar a destacados", icon: <SIcon name='Ajustes' /> })}
                <SHr h={1} color={STheme.color.card} />
                <SHr h={16} />
                {this.renderButom({ label: "Copiar el vinculo", icon: <SIcon name='Ajustes' /> })}
                <SHr h={1} color={STheme.color.card} />
                <SHr h={16} />
                {this.renderButom({ label: "Cambiar nombre", icon: <SIcon name='Edit' />, onPress: this.handleCambiarNombre.bind(this) })}
                {this.renderButom({ label: "Cambiar color", icon: <SIcon name='Ajustes' /> })}
                {this.renderButom({ label: "Mover", icon: <SIcon name='Ajustes' />, onPress: this.handleMover.bind(this) })}
                {this.renderButom({ label: "Detalles y actividad", icon: <SIcon name='Ajustes' /> })}
                {this.renderButom({ label: "Agregar a pantalla principal", icon: <SIcon name='Ajustes' /> })}
                {this.renderButom({ label: "Eliminar", icon: <SIcon name='Delete' />, onPress: this.handleEliminar.bind(this) })}
            </ScrollView>
        </SView>
    }
}
