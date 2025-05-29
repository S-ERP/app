
import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SForm, SHr, SIcon, SInput, SLoad, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import PButtom from '../../../Components/PButtom';
import { Usuario } from '../../../MDL/usuario/types';
import MDL from '../../../MDL';


type RolesDelUsuarioType = {
    data: Usuario,
    onRegister: (e: any) => void,
    onCancel?: () => void,
}

export default class RolesDelUsuario extends Component<RolesDelUsuarioType> {
    static open(props: RolesDelUsuarioType) {
        SPopup.open({
            key: "ppupregistro",
            content: <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 300 }} padding={16} withoutFeedback col={"xs-11"}>
                <RolesDelUsuario {...props} onRegister={(e) => {
                    SPopup.close("ppupregistro")
                    if (props.onRegister) props.onRegister(e)
                }}
                    onCancel={() => {
                        SPopup.close("ppupregistro")
                        if (props.onCancel) props.onCancel()
                    }}
                />
            </SView>
        })
    }
    form: any = null;

    state: { roles: any } = {
        roles: null,
    }
    componentDidMount(): void {
        this.loadData()
    }

    async loadData() {
        const roles = await MDL.role.getAll();
        const userRoles = await MDL.role.getAllUserRolesByKeyUser(this.props.data.key);

        roles.forEach((item: any) => {
            item.userRole = userRoles.find((userRole: any) => {
                return userRole.key_role == item.key
            })
        })

        this.setState({
            roles: roles,
        })

    }

    render() {
        return <SView center>
            <SText bold>{"Editar roles del usuario"}</SText>
            {/* <SText bold>{this.props}</SText> */}
            <SHr />
            <SHr h={1} color={STheme.color.card} />
            <SHr />

            {!this.state.roles ?<SLoad type='skeleton' height={250}/> : <SView col={"xs-12"} style={{
                height: 250,
            }}>
                <FlatList
                    style={{
                        width: "100%",
                    }}
                    data={this.state.roles}
                    renderItem={({ item }) => {
                        return <SView col={"xs-12"} row height={30}>
                            <SView width={30} height>
                                <SInput
                                    type='checkBox' defaultValue={!!item.userRole as any}
                                    onChangeText={e => {
                                        item._edited_value = e;
                                        if (!!e == !!item.userRole) {
                                            item._edited = false;
                                        } else {
                                            item._edited = true;
                                        }

                                    }}
                                />
                            </SView>

                            <SText flex numberOfLines={1}>{item.description}</SText>
                        </SView>
                    }}
                    ListFooterComponent={() => {
                        return <SView height={50} />
                    }}
                />
            </SView>
            }
            <SHr />
            <SHr h={1} color={STheme.color.card} />
            <SHr />
            <SView row col={"xs-12"}>
                {this.props.onCancel && <>
                    <PButtom flex type='danger' onPress={() => {
                        if (this.props.onCancel) this.props.onCancel()
                    }}>CANCELAR</PButtom>
                    <SView width={8} />
                </>}

                <PButtom flex type='primary' onPress={async () => {
                    if (!this.state.roles) return;

                    let listaAgregar: any[] = [];
                    let listaEliminar: any[] = [];

                    this.state.roles.filter((a: any) => !!a._edited).map((item: any) => {
                        let value = item._edited_value
                        if (!!value) {
                            listaAgregar.push({
                                key_user: this.props.data.key,
                                key_role: item.key,
                            })
                        } else {
                            listaEliminar.push(item.userRole.key)
                        }
                    })

                    await MDL.role.registrarUserRoleArray(listaAgregar)
                    await MDL.role.eliminarUserRoleArray(listaEliminar);
                    if (this.props.onRegister) this.props.onRegister(this.state.roles)

                    console.log("listaAgregar", listaAgregar);
                    console.log("listaEliminar", listaEliminar);

                }}>GUARDAR</PButtom>
            </SView>
        </SView >
    }
}
