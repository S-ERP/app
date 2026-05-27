import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SPopup, SText, STheme, SView } from 'servisofts-component';
import NewFolder from './NewFolder';
import SUpload from '../../../Components/SUpload';
import SSocket from 'servisofts-socket';
import { Actions } from '..';
import FloatMenu from '../../../Components/FloatMenu';
import SIconApp from '../../../Assets/SIconApp';

const PopupSubir = ({ path, onEvent }) => {
    return <SView col={"xs-12"} backgroundColor={STheme.color.background} withoutFeedback padding={16} style={{
        borderRadius: 16
    }}>
        <SView col={"xs-12"} card padding={16} center onPress={() => {
            AddButtom.close();
            NewFolder.open({ path: path, onEvent: onEvent })

        }}>
            <SText>Nueva Carpeta</SText>
        </SView>
        <SHr h={16} />
        <SView col={"xs-12"} card padding={16} center onPress={() => {
            AddButtom.close();
            SUpload.choose({
                accept: "*/*",
                multiple: true
            }).then(e => {
                if (!e) return;
                for (let i = 0; i < e.length; i++) {
                    const file = e[i];
                    const submite = SUpload.submitFile({
                        host: SSocket.api.drive + "uploadv2",
                        path: path + "/" + encodeURI(file?.name),
                        file: file
                    })
                    if (onEvent) {
                        onEvent("submit_file", {
                            "size": file.size,
                            "name": file?.name,
                            "lastModified": file.lastModified ?? new SDate().getTime(),
                            "type": file.type,
                            "submite_key": submite.key
                        })
                    }
                }

            }).catch(e => {
                console.error(e);
            })
        }}>
            <SText>Subir Archivo</SText>
        </SView>
        <SHr h={16} />
        <SView col={"xs-12"} card padding={16} center>
            <SText>Subir Foto</SText>
        </SView>
    </SView>
}

export default class AddButtom extends Component {
    static KEY_POPUP = "popupSubir"
    static close() {
        SPopup.close(AddButtom.KEY_POPUP)
    }
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    handlePress = (e) => {
        // SPopup.open({
        //     key: AddButtom.KEY_POPUP,
        //     content: <PopupSubir path={Actions.root_path + "" +this.props.path} onEvent={this.props.onEvent} />
        // })
        FloatMenu.open({
            e: e,
            label:"Nuevo",
            options: [
                { label: "Nueva Carpeta",
                    icon: <SIconApp name='drive-folder' width={20} height={20} fill={STheme.color.text} />,
                    onPress: () => {
                    // AddButtom.close();
                    NewFolder.open({ path: Actions.root_path + "" + this.props.path, onEvent: this.props.onEvent })
                } },
                { label: "Subir Archivo",
                    icon: <SIconApp name='drive-file' width={20} height={20} fill={STheme.color.text} />,
                    onPress: () => {
                    // AddButtom.close();
                    SUpload.choose({
                        accept: "*/*",
                        multiple: true
                    }).then(e => {
                        if (!e) return;
                        for (let i = 0; i < e.length; i++) {
                            const file = e[i];
                            const submite = SUpload.submitFile({
                                host: SSocket.api.drive + "uploadv2",   
                                path: Actions.root_path + this.props.path + "/" + encodeURI(file?.name),
                                file: file
                            })
                            if (this.props.onEvent) {
                                this.props.onEvent("submit_file", {
                                    "size": file.size,
                                    "name": file?.name,
                                    "lastModified": file.lastModified ?? new SDate().getTime(),
                                    "type": file.type,
                                    "submite_key": submite.key
                                })
                            }
                        }

                    }).catch(e => {
                        console.error(e);
                    })  
                } },
                // { label: "Subir Foto", onPress: () => {} },
            ]
        })
    }
    render() {
        return <SView style={{
            position: "absolute",
            right: 10,
            bottom: 10,
            width: 80,
            height: 50,
            borderRadius: 8,
            backgroundColor: STheme.color.card
        }} center onPress={this.handlePress}>
            <SText center>
                <SText clean fontSize={30}>{"+"}</SText>
                <SText >{" Nuevo"}</SText>
            </SText>
        </SView>
    }
}
