import React, { Component } from 'react';
import { SDate, SHr, SInput, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import { Actions } from '..';

export default class Move extends Component {
    static KEYPOPUP = "ChangeNamePopup"
    static close() {
        SPopup.close(Move.KEYPOPUP)
    }
    static open({ path, obj, onEvent }) {
        SPopup.open({
            key: Move.KEYPOPUP,
            content: <Move path={path} obj={obj} onEvent={onEvent} />
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
        // let pathfinal = !this.props.path ? name : this.props.path + "/" + name
        let pathfinalFrom = !this.props.path ? this.props?.obj?.name : this.props.path + "/" + this.props?.obj?.name
        Actions.mv({
            path: Actions.root_path + pathfinalFrom,
            path_to: Actions.root_path + name
        }).then(e => {
            if (this.props.onEvent) {
                this.props.onEvent("change_name", {
                    ...this.props.obj,
                    name: name,
                    lastModified: new SDate().getTime(),
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
        Move.close();
    }
    handleCancelar() {
        Move.close();
    }

    render() {
        // let pathfinal = !this.props.path ? name : this.props.path + "/" + name
        let pathfinalFrom = !this.props.path ? this.props?.obj?.name : this.props.path  + this.props?.obj?.name
        return <SView col={"xs-10"} backgroundColor={STheme.color.background} withoutFeedback padding={16} style={{
            borderRadius: 16
        }}>
            <SText>Cambiar el nombre</SText>
            <SHr h={16} />
            <SInput ref={ref => this.input = ref} defaultValue={pathfinalFrom} autoFocus />
            <SHr h={16} />
            <SView row col={"xs-12"}>
                <SView flex />
                <SText padding={8} onPress={this.handleCancelar.bind(this)}>Cancelar</SText>
                <SView width={32} />
                <SText padding={8} onPress={this.handleCrear.bind(this)}>Cambiar nombre</SText>
            </SView>
        </SView>
    }
}
