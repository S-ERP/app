import React, { Component } from 'react';
import { SDate, SHr, SInput, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import { Actions } from '..';

export default class NewFolder extends Component {
    static KEYPOPUP = "NewFolderPopup"
    static close() {
        SPopup.close(NewFolder.KEYPOPUP)
    }
    static open({ path, onEvent }) {
        SPopup.open({
            key: NewFolder.KEYPOPUP,
            content: <NewFolder path={path} onEvent={onEvent} />
        })
    }
    constructor(props) {
        super(props);
        this.state = {
            defaultValue: "Carpeta sin titulo"
        };
    }

    handleCrear() {
        let name = this.input.getValue() ?? this.state.defaultValue;
        let pathfinal = !this.props.path ? name : this.props.path + "/" + name
        Actions.mkdir({
            path: pathfinal
        }).then(e => {
            if (this.props.onEvent) {
                this.props.onEvent("new_folder", {
                    name: name,
                    type: "directory",
                    lastModified: new SDate().getTime()
                })
            }
            console.log(e);
        }).catch(e => {
            SNotification.send({
                title: "Error",
                body: e.error,
                color: STheme.color.danger,
                time: 5000,
            })
            console.error(e);
        })
        NewFolder.close();
    }
    handleCancelar() {
        NewFolder.close();
    }

    render() {
        return <SView col={"xs-10"} backgroundColor={STheme.color.background} withoutFeedback padding={16} style={{
            borderRadius: 16
        }}>
            <SText>Carpeta nueva</SText>
            <SHr h={16} />
            <SInput ref={ref => this.input = ref} placeholder={this.state.defaultValue} autoFocus />
            <SHr h={16} />
            <SView row col={"xs-12"}>
                <SView flex />
                <SText padding={8} onPress={this.handleCancelar.bind(this)}>Cancelar</SText>
                <SView width={32} />
                <SText padding={8} onPress={this.handleCrear.bind(this)}>Crear</SText>
            </SView>
        </SView>
    }
}
