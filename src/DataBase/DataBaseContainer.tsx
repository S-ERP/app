import { Text, View } from 'react-native'
import React, { Component } from 'react'
import DataBase, { DB } from '.';
import { SIcon, SLoad, SText, STheme, SView, SNotification, SThread, SPopup, SDate } from 'servisofts-component';


type DataBaseContainerPropsType = {
    children?: any
}
export default class DataBaseContainer extends Component<DataBaseContainerPropsType> {

    

    state = {
        ready: false
    }
    run = true;
    componentDidMount(): void {
        DataBase.init().then(() => {
            this.setState({ ready: true })
        }).catch(e => {
            this.setState({ ready: true })
        })
        this.run = true;
        this.hilo();
    }
    componentWillUnmount(): void {
        this.run = false;
    }

    hilo() {
        if (!this.run) return;
        // new SThread(DataBase.Funciones.TimeHilo, "hilo_del_guardado", true).start(() => {
        //     if (!this.run) return;
        //     this.hilo();
        //     try {
        //         DataBase.Funciones.saveAllChanges();
        //     } catch (error) {
        //         console.error(error);
        //     }
        // })
    }
    render() {
        const nameIcon: any = "LogoClear"
        if (!this.state.ready) return <SView col={"xs-12"} flex center >
            <SView col={"xs-6 sm-5 md-4 lg-3 xl-2 xxl-1.5"}>
                <SIcon name={nameIcon} fill={STheme.color.text} stroke={STheme.color.text} />
            </SView>
        </SView>
        return <>
            {this.props.children}
        </>
    }
}
