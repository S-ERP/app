//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SNavigation, SPage, SText } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';

// create a component
export default class init extends Component {

    componentDidMount() {
        this.start();
    }

    async start() {
        const rol_resp = await this.init_rol()
        if (rol_resp.estado != "exito") {
            console.error("Ocurrio un error al iniciar el rol", rol_resp?.error)
            return;
        }
        const clone_rol_resp = await this.clone_permisos(rol_resp.data.key)
        if (clone_rol_resp.estado != "exito") {
            console.error("Ocurrio un error al iniciar el rol", clone_rol_resp?.error)
        }
        const set_rol_resp = await this.set_rol(rol_resp.data.key)
        if (set_rol_resp.estado != "exito") {
            console.error("Ocurrio un error al registrar al usuario en el rol", set_rol_resp?.error)
        }

        SNavigation.goBack();
    }
    async init_rol() {
        return await SSocket.sendPromise({
            "version": "1.0",
            "service": "roles_permisos",
            "component": "rol",
            "type": "registro",
            "estado": "cargando",
            "data": {
                "descripcion": "Administrador",
                "key_empresa": Model.empresa.Action.getKey()
            },
            "key_usuario": Model.usuario.Action.getKey(),
        })
    }
    async clone_permisos(key_rol) {
        return await SSocket.sendPromise({
            "version": "1.0",
            "service": "roles_permisos",
            "component": "permiso",
            "type": "clone_rol",
            "estado": "cargando",
            key_rol_from: "0c15f8c1-f053-402c-af38-385d8c55b8a1",
            key_rol_to: key_rol,
            "key_usuario": Model.usuario.Action.getKey(),
        })
    }
    async set_rol(key_rol) {
        return await SSocket.sendPromise({
            "version": "1.0",
            "service": "roles_permisos",
            "component": "usuarioRol",
            "type": "registro",
            "estado": "cargando",
            "data": {
                "key_rol": key_rol,
                "key_usuario": Model.usuario.Action.getKey()
            },
            "key_usuario": Model.usuario.Action.getKey(),
        })
    }





    render() {
        return <SPage title={"init"} center>
            <SText>Configurando la empresa...</SText>
        </SPage>
    }
}
